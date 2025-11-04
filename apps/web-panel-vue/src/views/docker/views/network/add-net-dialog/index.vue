<template>
	<div class="p-[1.6rem]">
		<BtForm />
	</div>
</template>

<script setup lang="ts">
import { useForm } from '@/hooks/tools'
import { FormGroup, FormInput, FormSelect, FormMore, FormTextarea, FormSwitch } from '@form/form-item'
import { checkIpValidator, onConfirm, options } from './useController'

interface formDataProp {
	name: string
	driver: string
	options: string
	subnet: string
	gateway: string
	iprange: string
	labels: string
	remark: string
	subnet_v6: string // ipv6子网
	gateway_v6: string // ipv6网关
	isAdv: boolean // 是否高级设置
	ipv6: boolean // 是否设置ipv6
}

const popupClose = inject<any>('popupClose', () => {}) //     弹窗关闭

// 表单实体
const { BtForm, submit } = useForm({
	data: () => ({
		name: '',
		driver: 'bridge',
		options: '',
		subnet: '',
		gateway: '',
		iprange: '',
		labels: '',
		remark: '',
		subnet_v6: '', // ipv6子网
		gateway_v6: '', // ipv6网关
		isAdv: false, // 是否高级设置
		ipv6: false, // 是否设置ipv6
	}),
	options: (formDataRef: Ref<formDataProp>) => {
		return computed(() => [
			FormInput('网络名', 'name', {
				attrs: { class: '!w-[40rem]', placeholder: '请输入网络名' },
				rules: [{ required: true, message: '请输入网络名', trigger: 'blur' }],
			}),
			FormMore(toRef(formDataRef.value, 'isAdv')),
			...(formDataRef.value.isAdv
				? [
						FormSelect('设备', 'driver', options, {
							attrs: { class: '!w-[40rem]' },
						}),
						FormGroup([
							FormInput('ipv4子网', 'subnet', {
								attrs: { class: '!w-[15rem]', placeholder: '例：124.42.0.0/16' },
								rules: [{ validator: (rule: any, value: any, callback: any) => checkIpValidator(value, callback, '请输入正确的ipv4子网'), trigger: 'blur' }],
							}),
							FormInput('ipv4网关', 'gateway', {
								attrs: { class: '!w-[15rem]', placeholder: '例：124.42.0.254' },
								rules: [{ validator: (rule: any, value: any, callback: any) => checkIpValidator(value, callback, '请输入正确的ipv4网关'), trigger: 'blur' }],
							}),
						]),
						FormInput('ipv4范围', 'iprange', {
							attrs: { class: '!w-[40rem]', placeholder: '例：124.42.0.0/24' },
							rules: [{ validator: (rule: any, value: any, callback: any) => checkIpValidator(value, callback, '请输入正确的IP范围'), trigger: 'blur' }],
						}),
						FormSwitch('开启IPV6', 'ipv6'),
						...(formDataRef.value.ipv6
							? [
									FormGroup([
										FormInput('IPV6子网', 'subnet_v6', {
											attrs: { class: '!w-[15rem]', placeholder: '例：2001:db8::/48' },
											rules: [{ required: true, message: '请输入IPV6子网', trigger: 'blur' }],
										}),
										FormInput('IPV6网关', 'gateway_v6', {
											attrs: { class: '!w-[15rem]', placeholder: '例：2001:db8::1' },
											rules: [{ required: true, message: '请输入IPV6网关', trigger: 'blur' }],
										}),
									]),
							  ]
							: []),
						FormTextarea('备注', 'remark', {
							attrs: { placeholder: `请输入备注`, autosize: { minRows: 5, maxRows: 5 }, resize: 'none', class: 'w-[40rem]' },
						}),
				  ]
				: []),
		])
	},
	submit: async (param: Ref<formDataProp>, validate: any, ref: Ref<any>) => {
		await validate()
		onConfirm(param, popupClose)
	},
})

defineExpose({
	onConfirm: submit,
})
</script>
<style lang="css" scoped>
:deep(.el-form-item__label) {
	@apply w-[7rem] text-default;
}

:deep(.el-form .el-form-item--small.el-form-item + .el-form-item) {
	@apply mb-[1.5rem];
	margin-top: 0rem !important;
}

:deep(#two .el-form-item__label) {
	@apply min-w-0;
}
</style>
