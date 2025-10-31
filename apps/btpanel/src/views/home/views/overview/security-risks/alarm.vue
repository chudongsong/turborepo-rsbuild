<template>
	<div>
		<div class="text-large mb-6">全局告警设置</div>
		<BtForm />
	</div>
</template>
<script setup lang="tsx">
import BtFormItem from '@/components/form/bt-form-item'
import { useDataHandle, useForm } from '@/hooks/tools'
import { FormAlarmSelect } from '@/public/method'
import { defaultVerify } from '@/utils'
import { getWebshellConfig, setSender } from '@/api/home'
import { ElButton } from 'element-plus'
import { useGlobalStore } from '@store/global'
import { productPaymentDialog } from '@/public'

const { payment } = useGlobalStore()

const { authType } = toRefs(payment.value)
// 初始化配置
const initExpire = async () => {
	const { data } = await getWebshellConfig()
	const { status, safe_type, sender } = data.data.alertable
	return {
		data: {
			status,
			safe_type,
			sender,
		},
	}
}
const { BtForm, submit } = useForm({
	data: async () => {
		const { data } = await initExpire()
		if (data.sender.length > 0) {
			// 过滤空值
			data.sender = data.sender.filter((item: any) => {
				if (item && item !== '') {
					return item
				}
			})
		}
		return (
			data || {
				sender: [],
				status: false,
				safe_type: [],
			}
		)
	},
	options: (formData: any) =>
		computed(() => [
			{ type: 'switch', label: '告警开关', key: 'status' },
			{
				type: 'custom',
				render: () => (
					<BtFormItem label="类型">
						<el-checkbox-group v-model={formData.value.safe_type}>
							<el-checkbox value="webshell">恶意文件告警</el-checkbox>
						</el-checkbox-group>
					</BtFormItem>
				),
			},
			FormAlarmSelect('通知方式', 'sender', {
				attrs: {
					class: '!w-24rem',
					limit: ['sms'],
				},
				rules: {
					sender: [{ required: true, message: '请选择告警方式', trigger: 'change' }],
				},
			}),
			{
				type: 'custom',
				render: () => (
					<BtFormItem label=" ">
						<ElButton type="primary" onClick={submit}>
							{'保存'}
						</ElButton>
					</BtFormItem>
				),
			},
		]),
	submit: async (formData: typeof formVal, validate: any) => {
		if (authType.value !== 'ltd') {
			// 弹出支付
			productPaymentDialog({
				sourceId: 68,
			})
			return
		}
		await validate()
		await useDataHandle({
			loading: '正在保存配置，请稍后...',
			request: setSender(toRaw(formData.value)),
			message: true,
		})
	},
})
</script>
