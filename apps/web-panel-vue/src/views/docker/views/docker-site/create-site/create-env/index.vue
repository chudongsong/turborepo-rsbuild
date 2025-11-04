<template>
	<BtForm />
</template>
<script lang="tsx" setup>
import { useForm } from '@/hooks/tools'
import { storeToRefs } from 'pinia'
// import { getRandomChart, getRandomPwd } from '@/utils';
// import { addAndEditFtp, getAddEditFtpParamTools } from '@ftp/useController';
import { FormGroup, FormInput, FormSelect, FormInputIcon, FormCustom, FormItemCustom } from '@form/form-item'
import { FormItemProps, ElPopover } from 'element-plus'
// import { useFtpStore } from '@ftp/useStore';
import { formData, openFile, createSiteByEnv, typeChangeHamdle, envChangeHamdle, curriedSetFormData } from './useController'
import { siteEnv } from '@docker/views/docker-site/useController'
import { DOCKERSITE_CREATE_SITE_BY_ENV_STORE } from './useStore'
interface FormData {
	domain: string
	type: 'php' | 'java' | 'go' | 'python'
	port: string
	env: string
	remark: string
	path: string
}
interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: false,
})
const { getEnvOptions, getPortOptions, $reset } = DOCKERSITE_CREATE_SITE_BY_ENV_STORE()
const { envOptions, portOptions, popoverFocus } = storeToRefs(DOCKERSITE_CREATE_SITE_BY_ENV_STORE())
const popupClose = inject<any>('popupClose', () => {}) //     弹窗关闭
// let setFormData:any = null
// let dataRef:any = null
// 表单实体
const {
	BtForm,
	submit,
	param: dataRef,
} = useForm({
	data: formData,
	options: (formDataRef: Ref<FormData>) => {
		// setFormData = curriedSetFormData(formDataRef)
		// dataRef = formDataRef
		getEnvOptions('php', envOptions)
		return computed(() => [
			FormItemCustom(
				'域名',
				() => {
					return (
						<ElPopover ref="popover" placement="top-start" popper-class="green-tips-popover !p-0" title="" width="400" v-model:visible={popoverFocus.value} trigger-keys={[]} trigger="focus">
							{{
								default: () => {
									return (
										<div class="!p-[12px] bg-primary text-white">
											如需填写多个域名，请换行填写，每行一个域名，默认为80端口
											<br />
											IP地址格式：192.168.1.199
											<br />
											泛解析添加方法 *.domain.com
											<br />
											如另加端口格式为 www.domain.com:88
										</div>
									)
								},
								reference: () => {
									return (
										<bt-input
											v-model={formDataRef.value.domain}
											type="textarea"
											width="52rem"
											v-popover="popover"
											rows={7}
											resize="none"
											onFocus={() => {
												popoverFocus.value = true
											}}
											onInput={() => {
												if (formDataRef.value.type === 'php') {
													formDataRef.value.path = `/www/dk_project/wwwroot/${formDataRef.value.domain.split('\n')[0]?.split(':')[0] || ''}`
												}
											}}
											placeholder={'如需填写多个域名，请换行填写，每行一个域名，默认为80端口\nIP地址格式：192.168.1.199\n泛解析添加方法 *.domain.com\n如另加端口格式为 www.domain.com:88'}
										/>
									)
								},
							}}
						</ElPopover>
					)
				},
				'domain',
				{
					rules: [{ required: true, message: '请输入域名', trigger: 'blur' }],
				}
			),
			FormGroup([
				FormSelect(
					'类型',
					'type',
					[
						{ label: 'PHP', value: 'php' },
						{ label: 'Java', value: 'java' },
						{ label: 'Go', value: 'go' },
						{ label: 'Python', value: 'python' },
					],
					{
						attrs: {
							class: '!w-[17rem]',
							onChange: async (val: 'php' | 'java' | 'go' | 'python') => {
								typeChangeHamdle(val, formDataRef)
							},
						},
						rules: [{ required: true, message: '请选择容器', trigger: 'change' }],
					}
				),
				...(formDataRef.value.type === 'php'
					? [
							FormInput('PHP-FPM端口', 'port', {
								attrs: { class: '!w-[17rem]', placeholder: '请输入端口' },
								labelAttrs: { class: 'ml-[2rem]' },
								rules: [
									{ required: true, message: '请输入端口', trigger: 'blur' },
									{
										validator: (rule: any, value: any, callback: any) => {
											if (!/^\d+$/.test(value)) {
												callback(new Error('端口号必须为数字'))
											} else if (Number(value) < 1 || Number(value) > 65535) {
												callback(new Error('请输入正确的端口号'))
											} else {
												callback()
											}
										},
										trigger: 'blur',
									},
								],
							}),
					  ]
					: [
							FormSelect('端口', 'port', portOptions.value, {
								attrs: { class: '!w-[22rem]', placeholder: '环境端口' },
								rules: [{ required: true, message: '请选择端口', filterable: true }],
							}),
					  ]),
			]),
			FormGroup([
				FormSelect('环境', 'env', envOptions.value, {
					attrs: {
						class: '!w-[22rem]',
						placeholder: '请选择环境',
						onChange: (val: string) => {
							envChangeHamdle(val, formDataRef)
						},
					},
					rules: [{ required: true, message: '请选择环境', trigger: 'change', filterable: true }],
				}),
				FormCustom(
					() => {
						return h(
							'span',
							{
								class: 'cursor-pointer text-primary h-[3.2rem] leading-[3.2rem] ml-[1.5rem] inline-block',
								onClick: () => {
									siteEnv(() => {
										getEnvOptions(formDataRef.value.type, envOptions)
									})
								},
							},
							'创建环境'
						)
					},
					{ key: 'jump', rules: {} }
				),
			]),
			FormInputIcon('运行目录', 'path', {
				attrs: { class: '!w-[320px]', placeholder: '请选择运行目录' },
				rules: [{ required: true, message: '请选择运行目录', trigger: 'change' }],
				icon: 'icon-file_mode',
				iconClick: () => {
					openFile(formDataRef)
				},
			}),
			FormInput('备注', 'remark', {
				attrs: { class: '!w-[320px]', placeholder: '请输入备注' },
				rules: [{ required: false, message: '请输入备注', trigger: 'blur' }],
			}),
		])
	},
	submit: async (param: Ref<FormData>, validate: any, ref: Ref<any>) => {
		await validate() // 校验表单
		return await createSiteByEnv(param.value, (res: { status: boolean }) => {
			if (res.status) {
				$reset()
				popupClose()
			}
		})
	},
})

// import { FTP_ADD_USER } from './store';
// import { storeToRefs } from 'pinia';

// const store = FTP_ADD_USER();

onMounted(() => {
	if (props.compData) {
		nextTick(() => {
			dataRef.value.type = props.compData.type
			dataRef.value.env = props.compData.env
			typeChangeHamdle(props.compData.type, dataRef)
		})
	}
})

onUnmounted(() => {
	// setFormData = null
	// dataRef = null
})

defineExpose({ onConfirm: submit })
</script>
