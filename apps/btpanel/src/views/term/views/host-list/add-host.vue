<template>
	<BtForm class="p-[2rem]" label-width="4rem" />
</template>
<script setup lang="tsx">
import type { FormItemProps, UseFormProps } from '@/hooks/tools/form/types'
import type { TermHostProps } from '@term/types'

import { useForm } from '@/hooks/tools'
import { FormGroup, FormHelp, FormInput, FormRadioButton, FormTextarea } from '@/hooks/tools/form/form-item'
import { checkDomain, checkIp, portVerify } from '@/utils'
import { autoFillHostInfoEvent, cutAuthTypeEvent, initHostInfo, onChangeHost, submitHostForm } from './useController'

// 验证方式
const authType = [
	{ label: '密码认证', value: 'password' },
	{ label: '私钥验证', value: 'private' },
]

// 表单生成
const { BtForm, submit, clearValidate } = useForm({
	data: initHostInfo,
	options: (param: Ref<TermHostProps>) =>
		computed(() => {
			const password = [
				FormInput('密码', 'password', {
					attrs: { placeholder: '请输入SSH密码', class: 'mr-4 !w-[275px]' },
					rules: [{ required: true, message: '请输入SSH密码', trigger: ['change', 'blur'] }],
				}),
			]
			const privateKey = [
				FormTextarea('私钥', 'pkey', {
					attrs: {
						placeholder: '请输入SSH私钥',
						class: 'mr-4 !w-[275px]',
						autosize: { minRows: 4, maxRows: 4 },
					},
					rules: [{ required: true, message: '请输入SSH私钥', trigger: ['change', 'blur'] }],
				}),
				FormInput('私钥密码', 'pkey_passwd', {
					attrs: { placeholder: '请输入私钥密码', class: 'mr-4 !w-[275px]' },
					// rules: [{ required: true, message: '请输入私钥密码', trigger: ['change', 'blur'] }],
				}),
			]
			return [
				FormGroup([
					FormInput('服务器信息', 'host', {
						attrs: {
							class: 'mr-[8px] !w-[180px]',
							placeholder: '请输入服务器IP/域名',
							onInput: () => {
								param.value.ps = param.value.host
							},
							onBlur: () => autoFillHostInfoEvent(param),
						},
						rules: [{ required: true, message: '请输入服务器IP/域名', trigger: ['change', 'blur'] }, {
						validator: (rule: any, value: any, callback: any) => {
							value = value.trim() // 去除空格，防止空格占位
							if (value === '') {
								callback(new Error('服务器信息不能为空'))
							} else if (!checkDomain(value) && !checkIp(value)) {
								callback(new Error('服务器信息格式错误'))
							} else {
								callback()
							}
						},
						trigger: ['blur', 'change'],
					}],
					}),
					FormInput('', 'port', {
						attrs: { placeholder: '端口', class: '!w-[84px]' },
						rules: [{ required: true, message: '请输入端口', trigger: ['change', 'blur'] }, portVerify()],
					}),
				]),
				FormInput('账号', 'username', {
					attrs: { placeholder: '请输入SSH账号', class: 'mr-4 !w-[275px]' },
					rules: [{ required: true, message: '请输入SSH账号', trigger: ['change', 'blur'] }],
				}),
				FormRadioButton('验证方式', 'authType', authType, {
					attrs: { class: 'mr-4 !w-[275px]', onChange: () => cutAuthTypeEvent(param, clearValidate) },
				}),
				...(param?.value.authType === 'password' ? password : privateKey),
				FormInput('备注', 'ps', {
					attrs: { placeholder: '请输入备注', class: 'mr-4 !w-[275px]' },
				}),
				param?.value.authType === 'password' ? FormHelp('', [{ content: '支持快速填充主机信息，格式：[账号:密码@]服务器IP[:端口]' }]) : [],
			]
		}) as ComputedRef<FormItemProps[]>,
	submit: async (formData: Ref<TermHostProps>, validate: any) => {
		await validate()
		return await submitHostForm(formData)
	},
} as unknown as UseFormProps)

defineExpose({
	onConfirm: submit,
})
</script>
