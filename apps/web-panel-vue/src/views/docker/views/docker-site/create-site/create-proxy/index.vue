<template>
	<BtForm />
</template>
<script lang="tsx" setup>
import { useForm } from '@/hooks/tools'
// import { getRandomChart, getRandomPwd } from '@/utils';
// import { addAndEditFtp, getAddEditFtpParamTools } from '@ftp/useController';
import { FormInput, FormSelect, FormItemCustom } from '@form/form-item'
import { ElPopover } from 'element-plus'
// import { useFtpStore } from '@ftp/useStore';
import { formData, changeHandle, createSiteByProxy } from './useController'
import { DOCKERSITE_CREATE_SITE_BY_PROXY_STORE } from './useStore'
interface FormData {
	domain: string
	name: string
	container_id: string
	port: string
	remark: string
}

const store = DOCKERSITE_CREATE_SITE_BY_PROXY_STORE()
const { popoverFocus, conOptions, portOptions } = storeToRefs(store)
const { getConOptions, $reset } = store
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
			FormSelect('容器', 'container_id', conOptions.value, {
				attrs: { class: '!w-[22rem]', placeholder: '请选择容器', onChange: (val: string) => changeHandle(val, formDataRef) },
				rules: [{ required: true, message: '请选择容器', trigger: 'change' }],
			}),
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
		return createSiteByProxy(param.value, (res: { status: boolean }) => {
			if (res.status) {
				$reset()
				popupClose()
			}
		})
	},
})

onMounted(() => {
	getConOptions(conOptions)
})

defineExpose({ onConfirm: submit })
</script>
