<template>
	<div class="p-[2rem]">
		<BtForm class="h-[36rem]" />
		<div v-show="auditBaseFormData.status" class="flex justify-start pl-[23rem]">
			<el-button type="primary" @click="submit">保存设置</el-button>
			<el-button type="default" @click="restartDatabase">重启数据库</el-button>
		</div>
		<bt-help
			v-show="auditBaseFormData.status"
			:options="[
				{
					content: '当前仅支持mysql-8.0/8.4',
				},
				{
					content: '缓冲区大小/日志记录格式/日志写入刷新方式/实时刷新需重启数据库才会生效',
				},
				{
					content: '审计日志大小将会非常大，请注意留足磁盘空间或设置仅记录登录事件，也可以在高级设置中设置过滤模式',
				},
			]"></bt-help>
	</div>
</template>

<script lang="tsx" setup>
import { useForm } from '@/hooks/tools'
import { FormInput, FormSwitch, FormGroup, FormCustom, FormRadioButton, FormSelect } from '@form/form-item'
import { DATABASE_MYSQL_ADVANCED_AUDIT_STORE } from './useStore'

import BtFormItem from '@/components/form/bt-form-item'
import BtRadio from '@/components/form/bt-radio'
import { ElTooltip } from 'element-plus'
// import BtInput from '@/components/form/bt-input';

const store = DATABASE_MYSQL_ADVANCED_AUDIT_STORE()
const { auditBaseFormData } = storeToRefs(store)
const { getAuditBaseData, setAuditBaseData, restartDatabase } = store

// 表单实体
const {
	BtForm,
	submit,
	ref: formRef,
} = useForm({
	data: () => auditBaseFormData.value,
	options: (formDataRef: any) => {
		return computed(() => [
			FormSwitch('开启日志审计', 'status', {
				attrs: {
					onChange: async (val: boolean) => {
						if (!val && auditBaseFormData.value.oldStatus) {
							setAuditBaseData({ status: false })
						} else {
							// formRef?.value.validate()
						}
					},
				},
			}),
			...(formDataRef.value.status
				? [
						FormRadioButton(
							'日志记录格式',
							'audit_log_format',
							['JSON', 'CSV', 'OLD', 'NEW'].map((key: string) => ({ label: key, value: key }))
						),
						FormInput('缓冲区大小', 'audit_log_buffer_size', {
							slots: {
								unit: () => (
									<span class="whitespace-nowrap ml-[.5rem]">
										MB<span class="ml-[2.5rem]">日志将会写入缓冲区，缓冲区满后再写入磁盘</span>
									</span>
								),
							},
							attrs: { class: '!w-[39rem]', placeholder: '缓冲区大小' },
							rules: [
								{
									required: true,
									validator: (rule: any, value: any, callback: any) => {
										if (value === '' || Number.isNaN(Number(value))) {
											callback(new Error('请输入正确的缓冲区大小'))
										} else if (!Number.isInteger(Number(value)) || Number(value) < 1) {
											callback(new Error('请输入正确的缓冲区大小'))
										} else {
											callback()
										}
									},
									trigger: 'blur',
								},
							],
						}),
						FormSelect(
							'日志记录类型',
							'audit_log_policy',
							[
								{ label: '记录所有事件（ALL）', value: 'ALL' },
								{ label: '记录登录事件（LOGINS）', value: 'LOGINS' },
								{ label: '记录查询事件（QUERIES）', value: 'QUERIES' },
							],
							{
								attrs: { class: '!w-[22rem]' },
							}
						),
						FormCustom(
							() => {
								return (
									<BtFormItem>
										{{
											default: () => (
												<BtRadio
													v-model={auditBaseFormData.value.audit_log_strategy}
													options={[
														{ label: '异步', value: 'ASYNCHRONOUS' },
														{ label: '快速异步', value: 'PERFORMANCE' },
														{ label: '同步', value: 'SYNCHRONOUS' },
													]}
													type={'button'}></BtRadio>
											),
											label: () => (
												<span class="flex items-center">
													日志写入刷新方式
													<ElTooltip effect="light" popperClass="green-tips-popover" placement="top">
														{{
															default: () => <span class="svgtofont-el-question-filled text-[var(--el-color-warning-light-3)] !text-medium cursor-pointer ml-[.5rem]"></span>,
															content: () => (
																<span class="py-[.5rem] px-[1.1rem]">
																	写入刷新方式：
																	<br />
																	异步写入：性能较好，但出现异常时可能丢失日志
																	<br />
																	快速异步写入：性能最好, 但出现异常时可能丢失更多日志
																	<br />
																	同步写入：性能较差，但不会丢失日志
																</span>
															),
														}}
													</ElTooltip>
												</span>
											),
										}}
									</BtFormItem>
								)
							},
							{
								key: 'audit_log_strategy',
								rules: {},
							}
						),
						...(auditBaseFormData.value.audit_log_strategy === 'SYNCHRONOUS'
							? [
									FormGroup([
										FormSwitch('实时刷新', 'audit_log_flush', { attrs: {} }),
										FormCustom(
											() => {
												return h('span', { class: 'text-small text-secondary ml-[3.5rem] leading-[3.2rem]' }, '开启后将实时刷新日志，可能会影响性能')
											},
											{ key: 'jump', rules: {} }
										),
									]),
							  ]
							: []),
						FormInput('文件大小限制', 'audit_log_rotate_on_size', {
							slots: {
								unit: () => (
									<span class="whitespace-nowrap ml-[.5rem]">
										MB<span class="ml-[2.5rem]">日志文件大小限制，为0则不限制大小</span>
									</span>
								),
							},
							attrs: { class: '!w-[35rem]', placeholder: '文件大小限制' },
							rules: [
								{
									required: true,
									validator: (rule: any, value: any, callback: any) => {
										if (value === '' || Number.isNaN(Number(value))) {
											callback(new Error('请输入正确的文件大小限制'))
										} else if (Number(value) < 0) {
											callback(new Error('请输入正确的文件大小限制'))
										} else {
											callback()
										}
									},
									trigger: 'blur',
								},
							],
						}),
						FormInput('文件保留份数', 'audit_log_rotations', {
							slots: {
								unit: () => (
									<span class="whitespace-nowrap ml-[.5rem]">
										份<span class="ml-[2.5rem]">日志文件最多保留份数，为0则不限制</span>
									</span>
								),
							},
							attrs: { class: '!w-[35rem]', placeholder: '文件保留份数' },
							rules: [
								{
									required: true,
									validator: (rule: any, value: any, callback: any) => {
										if (value === '' || Number.isNaN(Number(value))) {
											callback(new Error('请输入正确的文件保留份数'))
										} else if (Number(value) < 0) {
											callback(new Error('请输入正确的文件保留份数'))
										} else {
											callback()
										}
									},
									trigger: 'blur',
								},
							],
						}),
				  ]
				: []),
		])
	},
	submit: async (param: Ref<any>, validate: any, ref: Ref<any>) => {
		await validate()
		setAuditBaseData(param.value)
	},
})

onMounted(() => {
	getAuditBaseData()
})

defineExpose({ init: getAuditBaseData })
</script>

<style lang="css" scoped>
:deep(.formItem) {
	@apply flex items-center;
}
:deep(.formLabel) {
	@apply text-default mr-2rem text-right w-[10rem];
}
:deep(.formItem .formLabel) {
	@apply text-default mr-2rem text-right w-[10rem];
}
:deep(.el-form .el-form-item__label) {
	width: 21rem;
}
:deep(.formTips) {
	@apply text-tertiary text-small;
}
</style>
