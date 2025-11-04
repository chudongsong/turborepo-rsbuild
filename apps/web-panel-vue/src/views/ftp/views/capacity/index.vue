<template>
	<div class="p-[2rem] container-dialog">
		<BtForm label-width="10rem" />
	</div>
</template>

<script setup lang="tsx">
import { isNumber } from '@/utils'
import { useFtpCapacityStore } from './useStore'
import BtAlarmOldSelect from '@/components/business/bt-alarm-old-select/index.vue'
import { $reset, init, saveCapacity } from './useMethod'
import { FormHelp, FormInput, FormItemCustom, FormSwitch } from '@/hooks/tools/form/form-item'
import { useForm } from '@/hooks/tools'

const { capacityData, useSize } = useFtpCapacityStore()

const { BtForm, submit } = useForm({
	data: capacityData.value,
	options: (formData: AnyObject) => {
		const defalut = {
			class: '!w-[220px]',
			clearable: true,
		}
		return computed(() => [
			FormInput('当前已用容量', 'useSize', {
				attrs: {
					...defalut,
					disabled: true,
				},
				slots: isNumber(useSize) ? { append: () => <span class="text-gray-500">MB</span> } : {},
			}),
			FormInput('当前容量配额', 'size', {
				attrs: {
					...defalut,
					type: 'number',
					min: 0,
				},
				slots: {
					append: () => <span class="text-gray-500">MB</span>,
				},
				rules: [
					{ required: true, message: '容量不能为空', trigger: ['blur'] },
					{
						validator: (rule: any, value: any, callback: any) => {
							if (!Number.isInteger(capacityData.value.size * 1)) {
								callback(new Error('容量必须为整数'))
							} else {
								callback()
							}
						},
						trigger: ['blur', 'change'],
					},
				],
			}),
			FormSwitch('设置告警', 'status', {}),
			...(formData.value.status
				? [
						FormInput('触发告警大小', 'alarmSize', {
							attrs: {
								...defalut,
								type: 'number',
								min: 0,
							},
							slots: {
								append: () => <span class="text-gray-500">MB</span>,
							},
							rules: [
								{ required: true, message: '触发告警大小不能为空', trigger: ['blur'] },
								{
									validator: (rule: any, value: any, callback: any) => {
										if (capacityData.value.status) {
											if (!Number.isInteger(capacityData.value.alarmNum * 1)) {
												callback(new Error('触发告警大小必须为整数'))
											} else {
												callback()
											}
										} else {
											callback()
										}
									},
									trigger: ['blur', 'change'],
								},
							],
						}),
						FormInput('触发次数', 'alarmNum', {
							attrs: {
								...defalut,
								type: 'number',
								min: 0,
							},
							slots: {
								append: () => <span class="text-gray-500">次</span>,
							},
							rules: [
								{ required: true, message: '告警次数不能为空', trigger: ['blur'] },
								{
									validator: (rule: any, value: any, callback: any) => {
										if (capacityData.value.status) {
											if (!Number.isInteger(capacityData.value.alarmNum * 1)) {
												callback(new Error('告警次数必须为整数'))
											} else {
												callback()
											}
										} else {
											callback()
										}
									},
									trigger: ['blur', 'change'],
								},
							],
						}),
						FormItemCustom(
							'告警方式',
							() => {
								return <BtAlarmOldSelect class="!w-[24rem]" v-model={formData.value.module}></BtAlarmOldSelect>
							}
							// 'module',
							// {
							// 	rules: {
							// 		module: [{ required: true, message: '请选择告警方式', trigger: 'change' }],
							// 	},
							// }
						),
				  ]
				: []),
			FormHelp('', [{ content: '需要XFS文件系统，且包含prjquota挂载参数才能使用' }, { content: 'fstab配置示例：/dev/vdc1 /data xfs defaults,prjquota 0 0' }, { content: '配额容量：如需取消容量配额，请设为“0”' }]),
		])
	},
	submit: saveCapacity,
})

defineExpose({ onConfirm: submit })

onMounted(init)
onUnmounted($reset)
</script>

<style lang="css" scoped>
.container-dialog :deep(.el-radio__label) {
	@apply text-small;
	@apply text-default;
}

.container-dialog :deep(.el-slider__runway) {
	@apply my-[1.3rem];
}

.container-dialog :deep(.el-input .el-input__inner[readonly]) {
	@apply text-default;
}

.container-dialog :deep(.el-input.read .el-input__wrapper) {
	@apply bg-light;
}

.el-message__content {
	width: 36rem;
}

.el-message__content pre {
	margin: 0 1.2rem;
	width: 92%;
	height: 100%;
	max-width: 94%;
	background-color: var(--el-color-white);
	outline: none;
	white-space: pre-wrap;
	word-wrap: break-word;
}

.ftp-verify-disk pre {
	@apply font-normal;
	background-color: var(--el-base-primary);
	color: var(--el-color-text-disabled);
	padding: 0.6rem;
	border-radius: var(--el-border-radius-default);
	margin-top: 0.6rem;
	white-space: normal;
	padding: 2px;
	margin: 2px;
}

:deep(.el-select .el-select__wrapper) {
	height: auto !important;
}
</style>
