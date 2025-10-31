<template>
	<div class="p-[2rem]">
		<BtForm class="h-[20rem]" />
		<div v-show="limitFormData.status" class="flex justify-end pr-[18rem]">
			<el-button type="primary" @click="submit">保存</el-button>
		</div>
		<bt-help v-show="limitFormData.status" class="mt-[24rem]" :options="helpList"></bt-help>
	</div>
</template>

<script lang="tsx" setup>
import { useForm } from '@/hooks/tools'
import { FormInput, FormSwitch } from '@form/form-item'
import { DATABASE_MYSQL_ADVANCED_REINFORCE_STORE } from './useStore'

// import BtInput from '@/components/form/bt-input';

const store = DATABASE_MYSQL_ADVANCED_REINFORCE_STORE()
const { limitFormData } = storeToRefs(store)
const { getLimitData, setLimitData } = store

const helpList = [
	{
		content: '以上均为等保默认推荐值',
	},
]

// 表单实体
const {
	BtForm,
	submit,
	ref: formRef,
} = useForm({
	data: () => limitFormData.value,
	options: (formDataRef: any) => {
		return computed(() => [
			FormSwitch('开启限制登录', 'status', {
				attrs: {
					onChange: async (val: boolean) => {
						if (!val && limitFormData.value.oldStatus) {
							setLimitData({ status: false })
						} else {
							// formRef?.value.validate()
						}
					},
				},
			}),
			...(formDataRef.value.status
				? [
						FormInput('验证错误锁定次数', 'connection_control_failed_connections_threshold', {
							slots: {
								unit: () => (
									<span class="whitespace-nowrap ml-[.5rem]">
										次<span class="ml-[.5rem]">密码错误超过设置次数后进行锁定</span>
									</span>
								),
							},
							attrs: { class: '!w-[35rem]', placeholder: '验证错误锁定次数' },
							rules: [
								{
									required: true,
									validator: (rule: any, value: any, callback: any) => {
										if (value === '' || isNaN(Number(value))) {
											callback(new Error('请输入正确的验证错误锁定次数'))
										} else if (!Number.isInteger(Number(value)) || Number(value) < 1) {
											callback(new Error('请输入正确的验证错误锁定次数'))
										} else {
											callback()
										}
									},
									trigger: 'blur',
								},
							],
						}),
						FormInput('最小锁定时间', 'connection_control_min_connection_delay', {
							slots: {
								unit: () => (
									<span class="whitespace-nowrap ml-[.5rem]">
										毫秒<span class="ml-[.5rem]">推荐1800000毫秒（5分钟）</span>
									</span>
								),
							},
							attrs: { class: '!w-[33.4rem]', placeholder: '最小锁定时间' },
							rules: [
								{
									required: true,
									validator: (rule: any, value: any, callback: any) => {
										if (value === '' || isNaN(Number(value))) {
											callback(new Error('请输入正确的密码最小锁定时间(毫秒)'))
										} else if (!Number.isInteger(Number(value)) || Number(value) < 1) {
											callback(new Error('请输入正确的密码最小锁定时间(毫秒)'))
										} else {
											callback()
										}
									},
									trigger: 'blur',
								},
							],
						}),
						FormInput('最长锁定时间', 'connection_control_max_connection_delay', {
							slots: {
								unit: () => (
									<span class="whitespace-nowrap ml-[.5rem]">
										<span>毫秒</span>
										<span class="ml-[.5rem]">默认2147483647毫秒</span>
									</span>
								),
							},
							attrs: { class: '!w-[30rem]', placeholder: '最长锁定时间' },
							rules: [
								{
									required: true,
									validator: (rule: any, value: any, callback: any) => {
										if (value === '' || isNaN(Number(value))) {
											callback(new Error('请输入正确的密码最长锁定时间'))
										} else if (!Number.isInteger(Number(value)) || Number(value) < 1) {
											callback(new Error('请输入正确的密码最长锁定时间'))
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
		setLimitData(param.value)
	},
})

onMounted(() => {
	getLimitData()
})

defineExpose({ init: getLimitData })
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
