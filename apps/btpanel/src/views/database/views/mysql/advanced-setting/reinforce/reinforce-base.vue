<template>
	<div class="p-[2rem]">
		<BtForm />
		<div class="flex justify-end pr-[28rem]">
			<el-button type="primary" @click="submit">保存</el-button>
		</div>
		<bt-help class="mt-[20rem]" :options="helpList"></bt-help>
	</div>
</template>

<script lang="tsx" setup>
import { useForm } from '@/hooks/tools'
import { FormInput } from '@form/form-item'
import { DATABASE_MYSQL_ADVANCED_REINFORCE_STORE } from './useStore'

// import BtInput from '@/components/form/bt-input';

const store = DATABASE_MYSQL_ADVANCED_REINFORCE_STORE()
const { baseFormData } = storeToRefs(store)
const { getBaseData, setBaseData } = store

const helpList = [
	{
		content: '设置180天日志可能会占用大量磁盘空间，请注意是否留有充足空间',
	},
	{
		content: '设置密码到期后需及时更新密码，否则mysq|将连接异常',
	},
	{
		content: '以上均为等保默认推荐值',
	},
]

// 表单实体
const { BtForm, submit } = useForm({
	data: () => baseFormData.value,
	options: (formDataRef: any) => {
		return computed(() => [
			FormInput('日志保存时间', 'expire_logs_days', {
				slots: {
					unit: () => (
						<span class="whitespace-nowrap ml-[.5rem]">
							天<span class="ml-[1.5rem]">建议180天</span>
						</span>
					),
				},
				attrs: { class: '!w-[20rem]', placeholder: '日志保存时间' },
				rules: [
					{
						required: true,
						validator: (rule: any, value: any, callback: any) => {
							if (value === '' || isNaN(Number(value))) {
								callback(new Error('请输入正确的日志保存时间'))
							} else if (!Number.isInteger(Number(value))) {
								callback(new Error('请输入正确的日志保存时间'))
							} else if (Number(value) < 1) {
								callback(new Error('请输入正确的日志保存时间'))
							} else {
								callback()
							}
						},
						trigger: 'blur',
					},
				],
			}),
			FormInput('等待超时时间', 'wait_timeout', {
				slots: {
					unit: () => (
						<span class="whitespace-nowrap ml-[.5rem]">
							秒<span class="ml-[1.5rem]">建议300秒</span>
						</span>
					),
				},
				attrs: { class: '!w-[20rem]', placeholder: '等待超时时间' },
				rules: [
					{
						required: true,
						validator: (rule: any, value: any, callback: any) => {
							if (value === '' || isNaN(Number(value))) {
								callback(new Error('请输入正确的等待超时时间'))
							} else if (!Number.isInteger(Number(value))) {
								callback(new Error('请输入正确的等待超时时间'))
							} else if (Number(value) < 1) {
								callback(new Error('请输入正确的等待超时时间'))
							} else {
								callback()
							}
						},
						trigger: 'blur',
					},
				],
			}),
			FormInput('命令行超时设置', 'interactive_timeout', {
				slots: {
					unit: () => (
						<span class="whitespace-nowrap ml-[.5rem]">
							秒<span class="ml-[1.5rem]">建议300秒</span>
						</span>
					),
				},
				attrs: { class: '!w-[20rem]', placeholder: '命令行超时时间' },
				rules: [
					{
						required: true,
						validator: (rule: any, value: any, callback: any) => {
							if (value === '' || isNaN(Number(value))) {
								callback(new Error('请输入正确的命令行超时时间'))
							} else if (!Number.isInteger(Number(value))) {
								callback(new Error('请输入正确的命令行超时时间'))
							} else if (Number(value) < 1) {
								callback(new Error('请输入正确的命令行超时时间'))
							} else {
								callback()
							}
						},
						trigger: 'blur',
					},
				],
			}),
			FormInput('密码到期时间', 'default_password_lifetime', {
				slots: {
					unit: () => (
						<span class="whitespace-nowrap ml-[.5rem]">
							天<span class="ml-[1.5rem]">建议90天,</span>
							<span class="text-dangerDark">请先重置mysql root密码后 再设置密码到期时间</span>
						</span>
					),
				},
				attrs: { class: '!w-[45.2rem]', placeholder: '密码到期时间' },
				rules: [
					{
						required: true,
						validator: (rule: any, value: any, callback: any) => {
							if (value === '' || isNaN(Number(value))) {
								callback(new Error('请输入正确的密码到期时间'))
							} else if (!Number.isInteger(Number(value))) {
								callback(new Error('请输入正确的密码到期时间'))
							} else if (Number(value) < 1) {
								callback(new Error('密码到期时间最低设置1天'))
							} else {
								callback()
							}
						},
						trigger: 'blur',
					},
				],
			}),
		])
	},
	submit: async (param: Ref<any>, validate: any, ref: Ref<any>) => {
		await validate()
		setBaseData(param.value)
	},
})

onMounted(getBaseData)

defineExpose({ init: getBaseData })
</script>

<style lang="css" scoped>
:deep(.formItem) {
	@apply flex items-center;
}
:deep(.formLabel) {
	@apply text-default mr-2rem text-right w-[7rem];
}
:deep(.formItem .formLabel) {
	@apply text-default mr-2rem text-right w-[7rem];
}
:deep(.el-form .el-form-item__label) {
	width: 16rem;
}
:deep(.formTips) {
	@apply text-tertiary text-small;
}
</style>
