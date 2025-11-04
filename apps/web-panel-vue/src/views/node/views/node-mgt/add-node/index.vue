<template>
	<div class="p-[2rem]">
		<BtForm :disabled="isVerify" />
	</div>
</template>
<script lang="ts" setup>
import { useForm } from '@/hooks/tools'
import { panelUrlVerify } from '@/utils'
import { addAndEditNode, bindAppPlugin } from '@node/useController'
import { FormInput, FormSelect, FormRadioButton, FormCustom, FormGroup, FormTextarea } from '@form/form-item'
import { useNodeAddStore } from './useStore'
import { renderForm, testConnection } from './useMethod'
import { useNodeStore } from '../../../useStore'
import { checkPanelUrl } from '@/utils/check'

import { ElAlert, ElButton } from 'element-plus'

const { isEdit, isVerify } = useNodeAddStore()

const popupLoading = inject('popupLoading',(status: Ref<boolean>,text: string) => {
	return {
		close: () => {}
	}
})

const stopPolling = ref<(() => void) | false>(false)

const { rowData, nodeCategory } = useNodeStore()

const addClassList = computed(() => nodeCategory.value.filter((item: any) => item.value !== 'all' && Number(item.value) >= 0))

const { buttonText, buttonType, buttonLoading, buttonClick, textChange } = testConnection()// 测试连接

// 表单实体
const { BtForm, submit, clearValidate, validate } = useForm({
	data: renderForm,
	options: (formData: any) => {
		return computed(() => [
			FormInput('节点名称', 'remarks', {
				attrs: { class: '!w-[32rem]', placeholder: '请输入节点名称' },
				rules: [
					{
						required: true,
						message: '节点名称不能为空',
						trigger: ['blur', 'change'],
					}
				]
			}),
			FormRadioButton('验证类型', 'verify_type', [
				{ label: 'API密钥', value: 'api' },
				{ label: 'APP插件', value: 'app' },
				{ label: 'SSH', value: 'ssh' },
				],{attrs: {
					onChange: () => {
						// 清除表单验证
						clearValidate()
					}
				}}),
			...(formData.value.verify_type === 'ssh' ? [
				FormGroup([FormInput('节点IP', 'ssh_ip', {
					attrs: {
						class: '!w-[150px]',
						placeholder: '例如:192.168.1.1',
						onInput: textChange
					},
					rules: [{ required: true, message: '请输入节点IP', trigger: ['change', 'blur'] }],
				}),FormInput('SSH端口', 'ssh_port', {
					attrs: {
						class: '!w-[70px]',
						placeholder: '22',
						onInput: textChange
					},
					rules: [{ required: true, message: '请输入SSH端口', trigger: ['change', 'blur'] }],
				})]),
				// FormInput('SSH账号', 'ssh_user', {
				// 	attrs: {
				// 		class: '!w-[320px]',
				// 		placeholder: '例如:root',
				// 		onInput: textChange
				// 	},
				// 	rules: [{ required: true, message: '请输入SSH账号', trigger: ['change', 'blur'] }],
				// }),
				FormRadioButton('认证方式', 'ssh_type', [
					{ label: '密码', value: 'password' },
					{ label: '密钥', value: 'key' },
				],{
					attrs: {
						onChange: () => {
							// 清除表单验证
							clearValidate()
							textChange()
						}
					}
				}),
				FormGroup([...(formData.value.ssh_type === 'password' ? [FormInput('SSH密码', 'ssh_password', {
					attrs: {
						class: '!w-[230px]',
						type: 'password',
						placeholder: '例如:123456',
						onInput: textChange
					},
					rules: [{ required: true, message: '请输入SSH密码', trigger: ['change', 'blur'] }],
				})]:[FormTextarea('SSH密钥', 'ssh_key', {
					attrs: {
						class: '!w-[230px]',
						placeholder: '请输入SSH密钥',
						onInput: textChange
					},
					rules: [{ required: true, message: '请输入SSH密钥', trigger: ['change', 'blur'] }],
				})]),FormCustom(() => h(ElButton,{plain:true,type:buttonType.value,class:'ml-[1.5rem] self-end mb-[1.8rem]',loading:buttonLoading.value,disabled:buttonLoading.value,onClick:() => buttonClick(formData,validate)},buttonText.value))]),
				...(formData.value.ssh_type === 'key' ? [FormInput('SSH私钥密码', 'ssh_pkey_passwd', {
					attrs: {
						class: '!w-[320px]',
						type: 'password',
						placeholder: '若没有密码，请留空',
						onInput: textChange
					},
				})]:[])
			]:[]),
			...(formData.value.verify_type === 'api' ? [FormInput('面板地址', 'address', {
				attrs: {
					class: '!w-[320px]',
					clearable: true,
					placeholder: '例如:http://192.168.1.1:88 或 https://domain.com:88',
					onInput: (val: any) => {
						formData.value.address = formData.value.address.trim()
						if (checkPanelUrl(formData.value.address)) {
							const url = new URL(formData.value.address)
							formData.value.address = url.origin
						}
					}
				},
				rules: [
					panelUrlVerify()
				],
			})]:[]),
			...(formData.value.verify_type === 'api' ? 
			[FormInput('API密钥', 'api_key', {
				attrs: { class: '!w-[32rem]', placeholder: isEdit.value ? '请输入API密钥,留空则沿用之前的密钥' : '请输入API密钥' },
				rules: [
					{
						required: !isEdit.value,
						message: 'API密钥不能为空',
						trigger: ['blur', 'change'],
					}
				]
			})] : []),
			...(formData.value.verify_type === 'app' ? [...(isVerify.value ? [FormCustom(() => {
				return h(ElAlert, {
					class: '!w-[32rem] !mb-[1rem] !ml-[10rem]',
					title: '请回到面板【堡塔APP】插件上点击确认按钮来完成验证',
					type: 'warning',
					closable: false,
				})
			})] : [FormInput('APP密钥', 'app_key', {
				attrs: { class: '!w-[32rem]', placeholder: isEdit.value ? '请输入APP插件密钥,留空则沿用之前的密钥' : '请输入APP插件密钥' },
				rules: [
					{
						required: !isEdit.value,
						message: 'APP插件密钥不能为空',
						trigger: ['blur', 'change'],
					}
				]
			})])] : []),
			FormSelect('分类', 'category_id', addClassList.value || [{ label: '默认分类', value: '0' }], {
				attrs: { class: '!w-[32rem]', placeholder: '请选择分类', defaultId: formData.value?.category_id}
			}),
			...(formData.value.verify_type === 'api' ? [({
				type: 'help',
				options: [
					{
						content: '第一步：填写面板URL地址，示例：https://192.168.1.2:8888',
					},
					{
						content: '第二步：打开面板，转到【面板设置】页面，点击【API接口配置】',
					},
					{
						isHtml: true,
						content: '<li style="color:red">第三步：配置【IP白名单】，输入您电脑的公网固定IP，如果没有固定IP，请直接填星号(*)</li>',
					},
					{
						content: '第四步：在【API接口配置】窗口中复制【接口密钥】',
					},
					{
						content: '第五步：回到节点管理窗口，粘贴到【API密钥】输入框',
					},
				],
			})] : formData.value.verify_type === 'ssh' ? [({
				type: 'help',
				options: [
					{
						content: '请输入root账户信息',
					},
				],
			})]:[({
				type: 'help',
				options: [
					{
						content: '第一步：在面板【软件商店】安装【堡塔APP】插件1.2以上版本',
					},
					{
						content: '第二步：点击【复制绑定密钥】按钮获取密钥',
					},
					{
						content: '第三步：粘贴到【APP密钥】输入框，并点击【验证】按钮',
					},
					{
						content: '第四步：回到面板【堡塔APP】插件上点击【确认】按钮来完成验证',
					},
				],
			})])
		])
	},
	submit: async (param: any, validate: any, ref: Ref<any>) => {
		await validate() // 校验表单
		if(param.value.verify_type === 'app' && param.value.app_key !== '' && rowData.value?.app_key !== param.value.app_key) {
			return new Promise(async (resolve,reject) => {
				const { close } = popupLoading(isVerify, '请先完成验证')
				stopPolling.value = await bindAppPlugin({
					remarks: param.value.remarks,
					app_key: param.value.app_key,
				}, async () => {
					close()
					resolve(await submitForm(param))
				})
				if(!stopPolling.value) {
					close()
					isVerify.value = false
					reject(false)
				}
			})
		}

		return await submitForm(param)
	},
})

/**
 * 表单提交
 */
const submitForm = async (param: any) => {
	const { address, category_id, api_key, app_key, remarks, ssh_ip, ssh_port, ssh_type, ssh_password, ssh_key, ssh_pkey_passwd } = param.value
	let params: any = {
		...(param.value.verify_type === 'api' ? { api_key } : {}),
		...(param.value.verify_type === 'app' ? { app_key } : {}),
		...(param.value.verify_type === 'ssh' ? { ssh_conf: JSON.stringify({
			host: ssh_ip,
			port: ssh_port,
			...(ssh_type === 'password' ? { password: ssh_password } : { pkey: ssh_key, pkey_passwd: ssh_pkey_passwd }),
		})
		 } : { address }),
		category_id: category_id === 'all' ? 0 : category_id,
		remarks,
	}
	if (isEdit.value) {
		if (param.value.api_key === '') {
			params.api_key = rowData.value.api_key
		}
		if (param.value.app_key === '') {
			params.app_key = rowData.value.app_key
		}
		if(param.value.verify_type !== 'ssh'){
			params.ssh_conf = JSON.stringify(rowData.value.ssh_conf)
		}
		params.id = rowData.value.id
	}
	return await addAndEditNode(params, isEdit.value)
}

onUnmounted(() => {
	isVerify.value = false
	stopPolling.value && stopPolling.value()// 停止轮询
})

defineExpose({ onConfirm: submit })
</script>