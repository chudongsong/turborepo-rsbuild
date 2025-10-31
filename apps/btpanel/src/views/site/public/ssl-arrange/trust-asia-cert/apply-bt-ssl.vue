<template>
	<div class="p-[16px]">
		<el-alert type="error" :closable="false">
			<template #title>
				<span class="text-small">
					<i calss="svgtofont-el-warning text-small text-warning"></i>
					<span> 禁止含有诈骗、赌博、色情、木马、病毒等违法违规业务信息的站点申请SSL证书，如有违反，撤销申请，停用账号。 </span>
				</span>
			</template>
		</el-alert>
		<BtForm label-width="100px" class="mt-[16px] pb-[16px]" />
	</div>
</template>

<script setup lang="tsx">
import BtFormItem from '@/components/form/bt-form-item'
import { useForm } from '@/hooks/tools'
import { checkPhone, defaultVerify } from '@/utils'
import InputPopover from '@site/public/ssl-arrange/public/input-popover.vue'
import { ElButton } from 'element-plus'
import { domainAllList, initApplyBtSSL, rowData, submitTrustApply } from './useController'

const popupClose = inject('popupClose', () => {})

const { BtForm, submit } = useForm({
	data: initApplyBtSSL,
	options: (formData: any) =>
		computed(() => [
			{
				type: 'custom',
				render: () => (
					<BtFormItem label="证书信息">
						<span class="text-primary"> TrustAsia TLS RSA CA(免费版)</span>
					</BtFormItem>
				),
			},
			{
				type: 'select',
				label: '域名',
				key: 'domain',
				options: domainAllList.value || [],
				attrs: {
					placeholder: '请选择',
					style: 'width: 15rem',
				},
				rules: [defaultVerify({ message: '请选择域名' })],
			},
			{
				type: 'custom',
				render: () => (
					<BtFormItem label="个人/公司名称" prop="orgName">
						<InputPopover customClass="!w-[36rem]" v-model={formData.value.orgName} placeholderTips="请输入个人/公司名称，必填项" />
					</BtFormItem>
				),
				rules: {
					orgName: [defaultVerify({ message: '请输入个人/公司名称' })],
				},
			},
			{
				type: 'custom',
				render: () => (
					<BtFormItem label="所在地区">
						<div class="flex flex-row">
							<BtFormItem prop="orgRegion">
								<InputPopover customClass="mr-[16px] !w-[17rem]" v-model={formData.value.orgRegion} placeholderTips="请输入所在省份，必填项" />
							</BtFormItem>
							<BtFormItem prop="orgCity">
								<InputPopover customClass="!w-[17.4rem]" v-model={formData.value.orgCity} placeholderTips="请输入所在市/县，必填项" />
							</BtFormItem>
						</div>
					</BtFormItem>
				),
				rules: {
					orgRegion: [defaultVerify({ message: '请输入所在省份' })],
					orgCity: [defaultVerify({ message: '请输入所在市/县' })],
				},
			},
			{
				type: 'custom',
				render: () => (
					<BtFormItem label="地址" prop="orgAddress">
						<InputPopover customClass="!w-[36rem]" v-model={formData.value.orgAddress} placeholderTips="请输入个人/公司地址，必填项" />
					</BtFormItem>
				),
				rules: {
					orgAddress: [defaultVerify({ message: '请输入个人/公司地址' })],
				},
			},
			{
				type: 'custom',
				render: () => (
					<BtFormItem label="手机" prop="orgPhone">
						<InputPopover customClass="!w-[36rem]" v-model={formData.value.orgPhone} placeholderTips="请输入手机号码，必填项" />
					</BtFormItem>
				),
				rules: {
					orgPhone: [
						{
							required: true,
							message: '请输入手机号码',
							validator: (rule: any, value: any, callback: any) => {
								if (checkPhone(value)) {
									callback()
								} else {
									callback(new Error('请输入正确的手机号码'))
								}
							},
							trigger: ['blur', 'change'],
						},
					],
				},
			},
			{
				type: 'custom',
				render: () => (
					<BtFormItem label="邮政编码" prop="orgPostalCode">
						<InputPopover customClass="!w-[36rem]" v-model={formData.value.orgPostalCode} placeholderTips="请输入邮政编码，必填项" />
					</BtFormItem>
				),
				rules: {
					orgPostalCode: [
						{
							required: true,
							message: '请输入邮政编码',
							validator: (rule: any, value: any, callback: any) => {
								if (value.length === 6) {
									callback()
								} else {
									callback(new Error('请输入正确的邮政编码'))
								}
							},
							trigger: ['blur', 'change'],
						},
					],
				},
			},
			{
				type: 'custom',
				render: () => (
					<BtFormItem label=" ">
						<ElButton type="primary" onClick={() => submit()}>
							{rowData.value?.ssl_id ? '提交信息' : '申请证书'}
						</ElButton>
					</BtFormItem>
				),
			},
		]),
	submit: async (param: Ref<T>, validate: () => Promise<'closed' | true>) => {
		await validate()
		const status = await submitTrustApply(param.value)
		status && popupClose()
		return status
	},
})

defineExpose({
	onConfirm: submit,
})

// onMounted(initApplyBtSSL);
</script>

<style scoped></style>
