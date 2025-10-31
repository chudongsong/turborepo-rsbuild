<template>
	<div class="p-2rem">
		<el-form ref="taskEvent" :disabled="formDisabled" label-width="80px" :model="taskEventForm" :rules="taskRules" @submit.native.prevent>
			<el-form-item label="选择脚本" prop="run_script_id">
				<el-cascader :show-all-levels="false" @change="changeScript" v-model="taskEventForm.run_script_id" ref="scriptCascader" :props="propsData" :options="list" placeholder="请选择脚本,支持搜索" filterable></el-cascader>
			</el-form-item>
			<el-form-item :label="argsForm.args_title" v-if="argsForm.is_args" prop="args">
				<bt-input :placeholder="argsForm.args_holder" v-model="taskEventForm.args" width="17rem"></bt-input>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { getScripDataEvent } from '@/views/crontab/useController'

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const taskEvent = ref() // 表单实例
const formDisabled = ref(false) // 表单禁用
const scriptCascader = ref() // 脚本级联实例

const taskEventForm = reactive({
	run_script_id: '',
	script: '',
	args: '',
})
const argsForm = reactive<any>({
	is_args: '',
	args_holder: '',
	args_title: '',
}) // 响应式数据

const propsData = {
	label: 'name',
	value: 'script_id',
	children: 'script_list',
} // 脚本库数据

const taskRules = reactive({
	run_script_id: [{ required: true, message: '请选择脚本', trigger: 'change' }],
	args: [{ required: true, message: '请输入值', trigger: 'blur' }],
})

const inputValue = ref('')
const list = ref<any>([])

/**
 * @description 切换脚本
 * @param val
 */
const changeScript = (val: any) => {
	let data = scriptCascader.value.getCheckedNodes()[0].data
	taskEventForm.script = data.script
	if (data.is_args === 1) {
		argsForm.is_args = true
		argsForm.args_holder = data.args_ps
		argsForm.args_title = data.args_title
	} else {
		argsForm.is_args = false
	}
}

/**
 * @description 确认添加
 */
const onConfirm = async (close: AnyFunction) => {
	await taskEvent.value.validate()
	inputValue.value = inputValue.value !== '' ? inputValue.value + '\n' + taskEventForm.script : taskEventForm.script
	// 若选的是php脚本，替换脚本${1/./}为用户输入的版本
	if (taskEventForm.script.indexOf('php_version') !== -1) {
		inputValue.value = inputValue.value.replace('${1/./}', taskEventForm.args)
	}
	props.compData.onConfirm({
		scriptText: inputValue.value,
		args: taskEventForm.args,
	})
	close()
}

/**
 * @description 获取脚本库数据
 */
const getScriptData = async () => {
	try {
		const data = await getScripDataEvent()
		switch (props.compData.type) {
			case 'python':
				const pythonData: any[] = []
				if (Array.isArray(data)) {
					data.forEach((item: any) => {
						if (item.name === '自定义' && item.script_list.length > 0) {
							pythonData.push({
								script_id: item.script_id,
								name: item.name,
								script_list: item.script_list.filter((item: any) => item.script_type === 'python'), // 过滤出python脚本
							})
							return
						}
						if (item.name !== '服务管理' && item.script_list.length > 0) {
							pythonData.push(item)
						}
					})
				}
				list.value = pythonData.reverse() // 自定义脚本排在最前面
				break
			default:
				list.value = Array.isArray(data) ? data.filter((item: any) => item.name == '服务管理') : []
				break
		}
	} catch (error) {
		console.log(error)
	}
}

onMounted(getScriptData)

defineExpose({
	onConfirm,
})
</script>
