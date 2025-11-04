<template>
	<div class="p-[2rem]">
		<el-form ref="javaAddFormRef" :model="javaAddForm" :disabled="formDisabled" label-width="9rem" :rules="rule">
			<el-form-item label="检测策略" prop="check">
				<el-select v-model="javaAddForm.check" class="!w-[22rem]" placeholder="请选择">
					<el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"> </el-option>
				</el-select>
			</el-form-item>
			<el-form-item v-show="javaAddForm.check == 'port'" label="端口" prop="port">
				<bt-input v-model="javaAddForm.port" placeholder="多个用,分隔" width="22rem" />
			</el-form-item>
			<div v-show="javaAddForm.check == 'active'" class="flex items-center mt-[1.6rem] ml-[3rem]">
				启动该项目后，在
				<bt-input v-model="javaAddForm.wait_time" type="number" width="8rem" class="!mx-[1rem]" />
				秒内自动退出则认定为启动成功
			</div>
		</el-form>
		<ul class="mt-[1.6rem] leading-8 text-small list-disc ml-[2rem]">
			<li>当前效果：{{ help }}</li>
			<li>检查策略：主要是为了确认当前项目是否启动成功，保证顺序启动时，能在合适的情况下中断后续操作</li>
			<li>任意端口监听策略（默认）：启动后，进程出现监听任意端口视为启动成功（最大等待3分钟）</li>
			<li>指定端口监听策略：启动后，进程出现监听了您指定的所有端口后，视为启动成功（最大等待3分钟）</li>
			<li>进程存活时长：启动后，进程在指定时长内未退出，则视为启动成功</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { groupProjectConfig } from '@/api/site'
import { useDataHandle, useMessage } from '@/hooks/tools'
import { checkPort } from '@/utils'

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const Message = useMessage() // 消息提示

const javaAddFormRef = ref()
const formDisabled = ref(false)
const javaAddForm = reactive<any>({
	check: 'a;;',
	port: '',
	wait_time: 180,
})
const rule = {
	check: {
		required: true,
		message: '请输入检测策略',
		trigger: 'blur',
	},
	port: [
		{
			validator: (rule: any, value: any, callback: any) => {
				const portArr = value.split(',').filter((item: any) => item !== '')
				// 检查端口是否合法
				if (portArr.some((port: any) => !checkPort(port)) && javaAddForm.check == 'port') {
					callback(new Error('请输入正确的端口'))
				} else {
					callback()
				}
			},
		},
	],
	wait_time: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (value <= 0 && javaAddForm.check == 'active') {
					callback(new Error('请输入正确的进程存活时长'))
				} else if (value == '' && javaAddForm.check == 'active') {
					callback(new Error('请输入正确的进程存活时长'))
				} else {
					callback()
				}
			},
		},
	],
}
const options = [
	{ value: 'all', label: '任意端口监听' },
	{ value: 'port', label: '指定端口监听' },
	{ value: 'active', label: '进程存活时长' },
]
const help = computed(() => {
	switch (javaAddForm.check) {
		case 'all':
			return '任意端口监听策略，执行启动后,项目进程直到出现任意一个端口监听后, 才认定为启动成功,最大默认等待3分钟'
		case 'port':
			return `指定端口监听策略，执行启动后，项目进程直到监听【${javaAddForm.port}】端口后，才认定为启动成功,最大默认等待3分钟`
		case 'active':
			return `进程存活时长，解释:启动该项目后，在【${javaAddForm.wait_time}】秒内自动退出则认定为启动成功`
		default:
			return ''
	}
})

/**
 * @description 添加
 */
const onConfirm = async (close?: any) => {
	if (javaAddForm.check == 'active') {
		if (javaAddForm.wait_time <= 0 || javaAddForm.wait_time == '') {
			return Message.error('请输入正确的进程存活时长')
		}
	}
	await javaAddFormRef.value.validate()
	useDataHandle({
		loading: formDisabled,
		request: groupProjectConfig({
			group_id: props.compData.group_id,
			project_id: props.compData.id,
			check_info: JSON.stringify({
				type: javaAddForm.check == 'all' ? 'port' : javaAddForm.check,
				port: javaAddForm.check == 'port' ? javaAddForm.port.split(',') : [],
				wait_time: javaAddForm.check == 'active' ? javaAddForm.wait_time : 180,
			}),
		}),
		success: (res: any) => {
			if (res.status) {
				props.compData.refreshEvent && props.compData.refreshEvent()
				close && close()
			}
		},
	})
}

/**
 * @description: 设置初始值
 * @param {Object} data
 */
const setValues = (data: any) => {
	javaAddForm.check = data.check_info?.type || 'all'
	if (javaAddForm.check === 'port' && data.check_info?.port.length == 0) {
		javaAddForm.check = 'all'
	}
	javaAddForm.port = data.check_info?.port.join(',') || ''
	javaAddForm.wait_time = Number(data.check_info?.wait_time || 180)
}

onMounted(() => {
	setValues(props.compData)
})

defineExpose({
	onConfirm,
})
</script>

<style lang="css" scoped>
.set-title {
	@apply text-extraLarge font-bold mt-20x px-[1rem] flex justify-between items-center;
}

:deep(.el-divider--horizontal) {
	@apply mt-[1rem];
}
</style>
