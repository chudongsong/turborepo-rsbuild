<template>
	<!-- 导出日志 -->
	<div class="p-[20px] pb-0 flex flex-col">
		<BtForm />
	</div>
</template>
<script lang="tsx" setup>
import BtInputNumber from '@/components/form/bt-input-number'
import { useForm } from '@/hooks/tools'
import { FormSelect, FormItemCustom } from '@/hooks/tools/form/form-item'
import { ElCheckbox } from 'element-plus'
import { storeToRefs } from 'pinia'
import { outLogEvent } from '../../useController'
import { LOG_STORE } from '../../useStore'
import { LOG_SSH_STORE } from '../../views/ssh-log/useStore'

const logsStore = LOG_STORE()
const { outDataForm, countType, configData } = storeToRefs(logsStore)
const { $reset_out } = logsStore

const { BtForm, submit } = useForm({
	data: outDataForm.value,
	options: (formData: any) => {
		const isCrontab = configData.value?.type === 'crontab'
		const isTypeInclude = countType.value.includes(configData.value?.type)
		if (isCrontab) formData.value.isOutError = outDataForm.value.isOutError
		if (isTypeInclude) formData.value.count = outDataForm.value.count
		return computed(() => [
			// <!-- 非计划任务日志展示类型 -->
			FormSelect(
				'类型',
				'type',
				isTypeInclude
					? [
							//<!-- ssh -->
							{ label: '所有日志', value: 'all' },
							{ label: '成功日志', value: 'Accepted' },
							{ label: '失败日志', value: 'Failed' },
					  ]
					: [
							{ label: '运行日志', value: 'access' },
							{ label: '异常日志', value: 'error' },
					  ],
				{
					attrs: { class: '!w-[22rem]' },
				}
			),
			...(!isTypeInclude
				? [
						FormSelect('导出范围', 'day', [{ label: '全部', value: 'all' }, { label: '近7天', value: '7' }, { label: '近30天', value: '30' }, ...(configData.value?.type != 'crontab' ? [{ label: '近180天', value: '180' }] : [])], {
							attrs: { class: '!w-[22rem]' },
						}),
				  ]
				: []),
			...(isCrontab
				? [
						// <!-- 计划任务下-可选导出异常日志 -->
						FormItemCustom(' ', () => {
							return (
								<ElCheckbox v-model={formData.value.isOutError}>
									<span class="!text-small">仅导出异常日志</span>
								</ElCheckbox>
							)
						}),
				  ]
				: []),
			...(isTypeInclude
				? [
						// <!-- ssh导出条数 -->
						FormItemCustom(
							'导出条数',
							() => {
								return <BtInputNumber v-model={formData.value.count}></BtInputNumber>
							},
							'count',
							{
								rules: [
									{ required: true, message: '请输入导出条数', trigger: 'blur' },
									// 限制为整数
									{ pattern: /^[1-9]\d*$/, message: '请输入正整数', trigger: 'blur' },
								],
							}
						),
				  ]
				: []),
		])
	},
	submit: async (params: any, validate: any) => {
		await validate()
		return await outLogEvent(configData.value.type, params.value)
	},
})

onUnmounted($reset_out)

defineExpose({
	onConfirm: submit,
})
</script>
