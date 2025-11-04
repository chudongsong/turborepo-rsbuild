<template>
	<BtForm class="p-2rem" />
</template>

<script setup lang="tsx">
import BtFormItem from '@/components/form/bt-form-item'
import { useForm } from '@/hooks/tools'
import BtInput from '@/components/form/bt-input'
import BtAlarmSelect from '@/components/business/bt-alarm-select/index.vue'
import { defaultVerify } from '@/utils'
import { getPushConfig, setAlertConfig } from './useController'
import { useSiteStore } from '@site/useStore'
import { msgForm } from './useController'
import { FormItemCustom } from '@/hooks/tools/form/form-item'
import { FormAlarmSelect } from '@/public'

const props = defineProps<{
	compData: {
		refreshEvent?: () => void
		type?: 'open'
	}
}>()

const { siteInfo } = useSiteStore()

const limitType = ['sms']

const { BtForm, submit } = useForm({
	data: async () => {
		const { data } = await getPushConfig()
		if (data) data.status = props.compData?.type === 'open'
		return (
			data || {
				status: props.compData?.type === 'open',
				type: 'project_status',
				title: '项目停止告警',
				project: siteInfo.value?.id,
				tid: 'site_push@9',
				interval: 600,
				count: 1,
				push_count: 1,
				module: [],
				id: '',
			}
		)
	},
	options: (formData: Ref<AnyObject>) => {
		return computed(() => [
			{
				type: 'switch',
				label: '停止告警',
				key: 'status',
				attrs: {
					onChange: (val: any) => {
						msgForm.status = val
					},
				},
			},
			{
				type: 'radio',
				label: '自动重启',
				key: 'count',
				options: [
					{ label: '自动尝试重启项目', value: 1 },
					{ label: '不做重启尝试', value: 2 },
				],
			},
			{
				type: 'custom',
				render: () => (
					<BtFormItem label="间隔时间" prop="interval">
						<div class="flex items-center">
							<BtInput class="!w-[12rem]" width="12rem" type="number" v-model={formData.value.interval}>
								{{
									append: '秒',
								}}
							</BtInput>
							<span class="text-small text-secondary ml-[12px]">后再次监控检测条件 </span>
						</div>
					</BtFormItem>
				),
				rules: {
					interval: [
						defaultVerify({ message: '请输入间隔时间' }),
						{
							// 检测必须大于0
							validator: (rule: any, value: any, callback: any) => {
								if (!/^[1-9]\d*$/.test(value) || value <= 0) {
									callback(new Error('请输入大于0的整数'))
								} else {
									callback()
								}
							},
						},
					],
				},
			},
			{
				type: 'custom',
				render: () => (
					<BtFormItem label="每天发送" prop="push_count">
						<div class="flex items-center">
							<bt-input class="!w-[12rem]" width="12rem" type="number" v-model={formData.value.push_count}>
								{{
									append: '次',
								}}
							</bt-input>
							<span class="text-small text-secondary ml-[12px]">后，当日不再发送，次日恢复 </span>
						</div>
					</BtFormItem>
				),
				rules: {
					push_count: [
						defaultVerify({ message: '请输入发送次数' }),
						{
							// 检测必须大于0
							validator: (rule: any, value: any, callback: any) => {
								// 判断是否为整数
								if (!/^[1-9]\d*$/.test(value) || value <= 0) {
									callback(new Error('请输入大于0的整数'))
								} else {
									callback()
								}
							},
						},
					],
				},
			},
			// FormItemCustom(
			// 	'告警方式',
			// 	() => {
			// 		return <BtAlarmSelect class="!w-[24rem]" v-model={formData.value.module}></BtAlarmSelect>
			// 	},
			// 	'module',
			// 	{
			// 		rules: {
			// 			module: [defaultVerify({ message: '请选择告警方式' })],
			// 		},
			// 	}
			// ),
			FormAlarmSelect('告警方式', 'module', {
				attrs: {
					limit: ['sms'],
				},
				rules: {
					module: [defaultVerify({ message: '请选择告警方式' })],
				},
			}),
			// {
			// 	type: 'custom',
			// 	render: () => (
			// 		<BtFormItem label="告警方式" prop="module">
			// 			<BtAlarmSelect v-model={formData.value.module} multiple={true} limit={['sms']} style="width: 26rem;" />
			// 		</BtFormItem>
			// 	),
			// 	rules: {
			// 		module: [defaultVerify({ message: '请选择告警方式' })],
			// 	},
			// },
		])
	},
	submit: async (param: Ref<T>, validate: any) => {
		await validate()
		return await setAlertConfig(param.value)
	},
})

defineExpose({
	onConfirm: submit,
})
</script>
