<template>
	<BtForm class="p-[16px]" label-width="100px" />
</template>

<script setup lang="tsx">
import BtFormItem from '@/components/form/bt-form-item'
import BtInput from '@/components/form/bt-input'
import { useForm } from '@/hooks/tools'
import { FormAlarmSelect } from '@/public/method'
import { defaultVerify } from '@/utils'
import { initExpire, onConfirmExpire } from './useController'

const { BtForm, submit } = useForm({
	data: () => {
		const { data } = initExpire()
		return (
			data || {
				id: 0,
				dueAlarm: false,
				domainName: '',
				cycle: 30,
				allSsl: false,
				push: [],
			}
		)
	},
	options: (formData: any) =>
		computed(() => [
			{ type: 'switch', label: '到期提醒', key: 'dueAlarm' },
			{
				type: 'input',
				label: '设置站点',
				key: 'domainName',
				attrs: { width: '28rem', disabled: true },
			},
			{
				type: 'custom',
				render: () => (
					<BtFormItem label="证书有效期" prop="cycle">
						<div class="text-small flex">
							<span class="mr-4px">小于</span>
							<BtInput v-model={formData.value.cycle} class="!w-[10rem]" type="number" />
							<span class="ml-4px">天，将每天发送1次提醒。</span>
						</div>
					</BtFormItem>
				),
				rules: {
					cycle: [
						defaultVerify({ message: '请输入证书到期提示时间' }),
						{
							validator: (rule: any, value: any, callback: any) => {
								if (!/^[1-9]\d*$/.test(value)) {
									callback(new Error('请输入大于0的整数'))
								} else {
									callback()
								}
							},
							trigger: ['blur', 'change', 'input'],
						},
					],
				},
			},
			FormAlarmSelect('通知方式', 'push', {
				rules: {
					push: [defaultVerify({ message: '请选择通知方式' })],
				},
			}),
			{
				type: 'custom',
				render: () => (
					<BtFormItem label="应用配置">
						<el-checkbox v-model={formData.value.allSsl} name="type">
							将当前配置应用到所有
							<span class="text-danger">未设置过的站点</span>
						</el-checkbox>
					</BtFormItem>
				),
			},
		]),
	submit: onConfirmExpire,
})

defineExpose({
	onConfirm: submit,
})
</script>

<style scoped></style>
