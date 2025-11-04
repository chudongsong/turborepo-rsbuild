<template>
	<BtForm />
</template>
<script lang="tsx" setup>
import { useForm, closeAllDialog } from '@/hooks/tools'
import { FormGroup, FormInput, FormInputPath, FormSelect, FormCustom, FormTextarea, FormItemCustom } from '@form/form-item'
import { ElPopover } from 'element-plus'
import { formData, changeHandle, createSiteByApp } from './useController'
import { DOCKERSITE_CREATE_SITE_BY_APP_STORE } from './useStore'
import { getDockerAppStore } from '@/views/docker/views/app-store/useStore'
interface FormData {
	domain: string
	app: string
	port: string
	remark: string
}

const {
	refs: { deployMenuData },
} = getDockerAppStore()
const store = DOCKERSITE_CREATE_SITE_BY_APP_STORE()
const { popoverFocus, appOptions, portOptions } = storeToRefs(store)
const { getAppOptions, $reset } = store
const popupClose = inject<any>('popupClose', () => {}) //     弹窗关闭

// 表单实体
const { BtForm, submit } = useForm({
	data: formData,
	options: (formDataRef: Ref<FormData>) => {
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
				FormSelect('应用', 'app', appOptions.value, {
					attrs: { class: '!w-[22rem]', placeholder: '请选择应用', onChange: (val: string) => changeHandle(val, formDataRef) },
					rules: [{ required: true, message: '请选择应用', trigger: 'change' }],
				}),
				FormCustom(
					() => {
						return h(
							'span',
							{
								class: 'cursor-pointer text-primary h-[3.2rem] leading-[3.2rem] ml-[1.5rem] inline-block',
								onClick: async () => {
									const { router } = await import('@/router')
									closeAllDialog()
									deployMenuData.value.app_type = 'all'
									router.push({ name: `docker-appstore` })
								},
							},
							'安装新应用'
						)
					},
					{ key: 'jump', rules: {} }
				),
			]),
			FormSelect('端口', 'port', portOptions.value, {
				attrs: { class: '!w-[22rem]', placeholder: '请选择端口' },
				rules: [{ required: true, message: '请选择端口' }],
			}),
			FormInput('备注', 'remark', {
				attrs: { class: '!w-[320px]', placeholder: '请输入备注' },
				rules: [{ required: false, message: '请输入备注', trigger: 'blur' }],
			}),
		])
	},
	submit: async (param: Ref<FormData>, validate: any, ref: Ref<any>) => {
		await validate()
		createSiteByApp(param.value, (res: { status: boolean }) => {
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
	getAppOptions(appOptions)
})

// onUnmounted(() => {
// 	store.$reset(); // 重置数据
// });

defineExpose({ onConfirm: submit })
</script>
