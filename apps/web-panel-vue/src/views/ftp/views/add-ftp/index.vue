<template>
	<div class="p-[2rem]">
		<BtForm />
	</div>
</template>
<script lang="ts" setup>
import { useForm } from '@/hooks/tools'
import { getRandomChart, pathVerify, pawVerify } from '@/utils'
import { addAndEditFtp } from '@ftp/useController'
import { FormInput, FormInputPath, FormInputPaw } from '@form/form-item'
import { useFtpAddStore } from './useStore'
import { fileSelectionDialog } from '@/public'
import { renderForm } from './useMethod'
import { useFtpStore } from '@ftp/useStore'

const { isEdit, defaultPath } = useFtpAddStore()

const { rowData } = useFtpStore()

// 表单实体
const { BtForm, submit } = useForm({
	data: renderForm,
	options: (formData: any) => {
		return computed(() => [
			FormInput('用户名', 'ftp_username', {
				attrs: {
					class: '!w-[320px]',
					clearable: true,
					placeholder: '请输入用户名',
					disabled: isEdit.value,
					onInput: (val: string) => {
						formData.value.path = `${defaultPath.value}${formData.value.ftp_username.length > 0 ? '/' + formData.value.ftp_username : ''}`
					},
				},
				rules: [
					{
						validator: (rule: any, value: any, callback: any) => {
							if (value.length === 0) {
								callback(new Error('FTP用户名不能为空！'))
							} else if (!/^[a-zA-Z0-9_]+$/g.test(value)) {
								callback(new Error('FTP用户名只能包含字母、数字和下划线！'))
							} else if (value.length <= 3) {
								callback(new Error('FTP用户名长度错误，需要大于3个字符！'))
							} else {
								callback()
							}
						},
						trigger: ['blur', 'change'],
					},
				],
			}),
			FormInputPaw('密码', 'ftp_password', { attrs: { class: '!w-[32rem]', placeholder: '请输入密码' }, rules: [pawVerify({ complex: { length: 6 } })] }, () => (formData.value.ftp_password = getRandomChart(12))),
			FormInputPath('根目录', 'path', { attrs: { class: '!w-[32rem]', placeholder: '请输入根目录' }, rules: [pathVerify()] }, () => {
				fileSelectionDialog({
					type: 'dir',
					path: '/www/wwwroot',
					change: path => {
						formData.value.path = path
					},
				})
			}),
		])
	},
	submit: async (param: any, validate: any, ref: Ref<any>) => {
		await validate() // 校验表单
		const { ftp_username, path, ftp_password } = param.value
		let params: any = {
			ftp_username,
			path,
			[isEdit.value ? 'new_password' : 'ftp_password']: ftp_password,
			ps: ftp_username,
		}
		if (isEdit.value) params.id = rowData.value.id
		return await addAndEditFtp(params, isEdit.value)
	},
})

defineExpose({ onConfirm: submit })
</script>
