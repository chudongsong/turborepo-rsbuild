<template>
	<div class="p-[2rem]">
		<BtForm />
	</div>
</template>

<script setup lang="tsx">
import { useForm } from '@/hooks/tools'
import { alarmRenderForm, getAlarmParams } from '../useController'
import { FormInput, FormSelect, FormTextarea, FormRadio, FormItemCustom, FormHelp } from '@form/form-item'
import BtInput from '@/components/form/bt-input'
import { useNodeAlarmStore } from '../useStore'
import BtAlarmOldSelect from '@/components/business/bt-alarm-old-select/index.vue'
import BtAlarmSelect from '@/components/business/bt-alarm-select/index.vue'
import { setNewAlarmTask } from '@/api/node'
import { Message } from '@/hooks/tools'

const { isAlarmEdit, alarmRowData, nodeAlarmRefresh } = useNodeAlarmStore()

const activeType = ref(0)
const alarmType = ref(isAlarmEdit.value ? (['222', '223'].includes(alarmRowData.value?.task_data?.tid) ? 'master' : 'clb') : 'clb')
const limitType = ['sms']

const formOptions = (formVal: any) =>
	computed(() => {
		return [
			...(!isAlarmEdit.value
				? [
						FormRadio(
							'告警类型',
							'alarmType',
							[
								{ label: '负载均衡', value: 'clb' },
								{ label: '主从复制', value: 'master' },
							],
							{
								attrs: {
									onChange: (val: string) => {
										alarmType.value = val
									},
								},
							}
						),
						alarmType.value === 'clb' &&
							FormRadio(
								'负载均衡类型',
								'lcbType',
								[
									{ label: 'HTTP负载均衡', value: 0 },
									{ label: 'TCP/UDP负载均衡', value: 1 },
								],
								{
									attrs: {
										onChange: (val: number) => {
											activeType.value = val
											formVal.value.name = ''
										},
									},
								}
							),
				  ]
				: []),
			...(alarmType.value === 'master'
				? [
						FormRadio(
							'主从复制类型',
							'masterType',
							[
								{ label: 'Mysql', value: '222' },
								{ label: 'Redis', value: '223' },
							],
							{
								attrs: {
									disabled: isAlarmEdit.value,
								},
							}
						),
				  ]
				: []),
			...(alarmType.value === 'clb'
				? [
						FormSelect('负载均衡名称', 'name', activeType.value === 0 ? alarmRowData.value?.clbList : alarmRowData.value?.tcpList, {
							attrs: { class: '!w-[32rem]', placeholder: '请选择负载均衡', filterable: true, disabled: isAlarmEdit.value },
							onChange: (val: any) => {},
							rules: [{ required: true, message: '请选择负载均衡' }],
						}),
						...(formVal.value.lcbType === 0
							? [
									FormTextarea('成功状态码', 'successCode', {
										attrs: { class: '!w-[32rem]', placeholder: '多个用逗号隔开，如：200,301,302,403,404' },
									}),
							  ]
							: [
									FormInput('连接失败次数', 'failTimes', {
										attrs: { class: '!w-[32rem]', placeholder: '如果n次后仍然无法正常连接则告警', rules: [{ required: true, message: '请输入连接失败次数' }] },
									}),
							  ]),
				  ]
				: []),
			FormItemCustom(
				'配置发送次数',
				() => (
					<div class="flex items-center">
						<BtInput v-model={formVal.value.sendTimes} class="!w-[8rem] mr-2" placeholder="请输入发送次数" type="text" />
						<span class="text-gray-400 text-small">次后停止推送，次日再次监控</span>
					</div>
				),
				'sendTimes'
			),
			FormItemCustom('告警方式', () => (
				<div>
					<BtAlarmSelect class="!w-[32rem]" v-model={formVal.value.type} multiple={true} limit={limitType} is-show-api={false} all-alarm={true} />
				</div>
			)),
			FormHelp(' ', [{ content: '每隔1分钟进行检测异常后将发送告警' }]),
		]
	})

const { BtForm, submit } = useForm({
	data: alarmRenderForm,
	options: formOptions,
	submit: async (param: any, validate: any, ref: Ref<any>) => {
		await validate()
		const data = getAlarmParams(param.value)
		// 这里用 data 作为最终提交数据
		const res = await setNewAlarmTask(data)
		Message.request(res)
		nodeAlarmRefresh.value = true
		return res.status
	},
})
defineExpose({ onConfirm: submit })

onUnmounted(() => {
	alarmRowData.value = []
})
</script>
