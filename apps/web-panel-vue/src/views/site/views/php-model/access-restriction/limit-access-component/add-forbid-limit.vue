<!--  -->
<template>
	<div class="p-[20px]">
		<el-form ref="forbidSiteForm" :rules="forbidRules" :model="forbidForm" :disabled="formDisabled">
			<el-form-item label="名称" prop="deny_name">
				<bt-input v-model="forbidForm.deny_name" :disabled="compData.name" width="26rem"></bt-input>
			</el-form-item>
			<el-form-item label="后缀" prop="suffix">
				<bt-input v-model="forbidForm.suffix" width="26rem"></bt-input>
			</el-form-item>
			<el-form-item label="访问路径" prop="dir">
				<bt-input v-model="forbidForm.dir" placeholder="URL中禁止访问的，如/api等" width="26rem"></bt-input>
			</el-form-item>
			<ul class="ml-6 mt-8 list-disc leading-10">
				<li class="text-secondary">后缀：禁止访问的文件后缀</li>
				<li class="text-secondary">访问路径：如需要禁止https://www.bt.cn/api/，则填写/api即可</li>
			</ul>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { useMessage } from '@/hooks/tools'
import { useHandleError } from '@/hooks/tools'
import { modifyDirAuthPass, setFileDeny } from '@api/site'
interface Props {
	compData: any
}

const Message = useMessage() // 消息提示

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const emits = defineEmits(['close'])

const forbidForm = reactive({
	suffix: props.compData.suffix || 'php|jsp',
	deny_name: props.compData.name || '',
	dir: props.compData.dir || '',
})

const formDisabled = ref<boolean>(false) // 表单是否禁用
const forbidSiteForm = ref<any>() // 表单实例

const forbidRules = reactive({
	dir: [
		{
			required: true,
			message: '请输入需要禁止访问的目录',
			trigger: 'blur',
		},
	],
	deny_name: [
		{
			required: true,
			message: '请输入名称',
			trigger: 'blur',
		},
	],
	suffix: [
		{
			required: true,
			message: '请输入后缀',
			trigger: 'blur',
		},
	],
})

const savePassConfig = async (close?: any) => {
	await forbidSiteForm.value.validate()
	try {
		formDisabled.value = true
		const res = await setFileDeny({
			website: props.compData.website,
			...forbidForm,
			act: props.compData.name ? 'edit' : 'add',
		})
		if (!res.status) {
			// 提示错误信息
			Message.msg({
				customClass: 'bt-message-error-html',
				dangerouslyUseHTMLString: true,
				message: res.msg,
				type: 'error',
				duration: 0,
				showClose: true,
			}) // 提示错误信息
		} else {
			if (props.compData.name) {
				res.msg = '修改成功'
			}

			Message.success(res.msg)
			props.compData.refresh()
			emits('close')
		}
	} catch (error) {
		useHandleError(error)
	} finally {
		formDisabled.value = false
	}
}
defineExpose({
	onConfirm: savePassConfig,
})
</script>
