<!--  -->
<template>
	<div class="p-[20px]">
		<el-form ref="passwordSiteForm" :rules="passRules" :model="passForm" :disabled="formDisabled">
			<el-form-item label="加密访问" prop="site_dir">
				<bt-input :disabled="!!compData.name" v-model="passForm.site_dir" placeholder="输入需要加密访问的目录，如：/text/" width="26rem"></bt-input>
			</el-form-item>
			<el-form-item label="名称" prop="name">
				<bt-input v-model="passForm.name" :disabled="!!compData.name" width="26rem"></bt-input>
			</el-form-item>
			<el-form-item label="用户名" prop="username">
				<bt-input v-model="passForm.username" placeholder="请输入大于三位的用户名" width="26rem"></bt-input>
			</el-form-item>
			<el-form-item label="密码" prop="password">
				<bt-input v-model="passForm.password" type="password" placeholder="请输入大于三位的密码" width="26rem"></bt-input>
			</el-form-item>
			<ul class="ml-6 mt-8 list-disc leading-10">
				<li class="text-secondary">目录设置加密访问后，会导致目录及子目录下的“反向代理”失效</li>
				<li class="text-secondary">目录设置加密访问后，访问时需要输入账号密码才能访问</li>
				<li class="text-secondary">例如我设置了加密访问 /test/ ,那我访问 http://aaa.com/test/ 时就要输入账号密码才能访问</li>
			</ul>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { Message, useConfirm } from '@/hooks/tools'
import { useHandleError } from '@/hooks/tools'
import { useDataHandle } from '@/hooks/tools'
import { modifyDirAuthPass, setDirAuth } from '@api/site'
import { has } from 'ramda'
interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})
const emits = defineEmits(['close'])

const passForm = reactive({
	site_dir: props.compData.site_dir || '',
	name: props.compData.name || '',
	username: props.compData.username || '',
	password: props.compData.password || '',
})
const formDisabled = ref<boolean>(false) // 表单是否禁用
const passwordSiteForm = ref<any>() // 表单实例

const passRules = reactive({
	site_dir: [
		{
			required: true,
			message: '请输入需要加密访问的目录',
			trigger: 'blur',
		},
	],
	name: [
		{
			required: true,
			message: '请输入名称',
			trigger: 'blur',
		},
		{
			min: 3,
			message: '名称必须大于三位',
			trigger: 'blur',
		},
	],
	username: [
		// 用户名必填，且大于三位
		{
			required: true,
			message: '请输入用户名',
			trigger: 'blur',
		},
		{
			min: 3,
			message: '用户名必须大于三位',
			trigger: 'blur',
		},
	],
	password: [
		{
			required: true,
			message: '请输入密码',
			trigger: 'blur',
		},
		{
			min: 3,
			message: '密码必须大于三位',
			trigger: 'blur',
		},
	],
})

const savePassConfig = async () => {
	await passwordSiteForm.value.validate()
	try {
		formDisabled.value = true
		const requestFun = props.compData.name ? modifyDirAuthPass : setDirAuth
		const res: any = await requestFun({
			id: props.compData.id,
			...passForm,
		})
		if (typeof res.data.tip != 'undefined' && !props.compData.name) {
			// 检测到其他地方已经设置，是否强制添加
			await useConfirm({
				title: '添加须知',
				content: res.data.tip,
				icon: 'warning-filled',
			})
			const data: AnyObject = await useDataHandle({
				loading: '正在添加，请稍后...',
				request: setDirAuth({
					id: props.compData.id,
					...passForm,
					force: true,
				}),
				message: true,
			})
			if (data.status) {
				emits('close')
				props.compData.refresh()
			}
			return
		}
		Message.request(res)
		if (res.status) {
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
