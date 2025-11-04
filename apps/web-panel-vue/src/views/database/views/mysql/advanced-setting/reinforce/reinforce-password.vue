<template>
	<div class="p-[2rem]">
		<BtForm class="h-[30rem]" />
		<div v-show="passwordFormData.status" class="flex justify-end pr-[18rem]">
			<el-button type="primary" @click="submit">保存</el-button>
		</div>
		<bt-help v-show="passwordFormData.status" class="mt-[4rem]" :options="helpList"></bt-help>
	</div>
</template>

<script lang="tsx" setup>
import { useForm } from '@/hooks/tools'
import { FormInput, FormSelect, FormSwitch, FormCustom, FormGroup } from '@form/form-item'
import { DATABASE_MYSQL_ADVANCED_REINFORCE_STORE } from './useStore'

// import BtInput from '@/components/form/bt-input';

const store = DATABASE_MYSQL_ADVANCED_REINFORCE_STORE()
const { passwordFormData } = storeToRefs(store)
const { getPasswordData, setPasswordData } = store

const helpList = [
	{
		content: '<span class="text-dangerDark">设置密码复杂度后 如不按照规则设置密码，可能无法正常创建数据库，修改用户密码/同步用户密码</span>',
		isHtml: true,
	},
	{
		content: '以上均为等保默认推荐值',
	},
	{
		content: () => (
			<div>
				密码验证强度类型：
				<div>
					<p>LOW：只检查密码长度</p>
					<p>MEDIUM：检查长度、数字、大写字母、小写字母、特殊字符</p>
					<p>STRONG：检查长度、数字、大写字母、小写字母、特殊字符、字典文件</p>
				</div>
			</div>
		),
	},
]

// 表单实体
const {
	BtForm,
	submit,
	ref: formRef,
} = useForm({
	data: () => passwordFormData.value,
	options: (formDataRef: any) => {
		return computed(() => [
			FormSwitch('开启密码复杂度验证', 'status', {
				attrs: {
					onChange: async (val: boolean) => {
						if (!val && passwordFormData.value.oldStatus) {
							setPasswordData({ status: false })
						} else {
							// formRef?.value.validate()
						}
					},
				},
			}),
			...(formDataRef.value.status
				? [
						FormInput('最短密码长度', 'validate_password_length', {
							slots: {
								unit: () => (
									<span class="whitespace-nowrap ml-[.5rem]">
										<span class="ml-[.5rem]">建议10位</span>
									</span>
								),
							},
							attrs: { class: '!w-[17.6rem]', placeholder: '最短密码长度' },
							rules: [
								{
									required: true,
									validator: (rule: any, value: any, callback: any) => {
										if (value === '' || isNaN(Number(value))) {
											callback(new Error('请输入正确的最短密码长度'))
										} else if (!Number.isInteger(Number(value))) {
											callback(new Error('请输入正确的最短密码长度'))
										} else if (Number(value) < 6) {
											callback(new Error('最短密码长度不能小于6'))
										} else {
											callback()
										}
									},
									trigger: 'blur',
								},
							],
						}),
						FormInput('密码最少数字个数', 'validate_password_number_count', {
							slots: {
								unit: () => (
									<span class="whitespace-nowrap ml-[.5rem]">
										<span class="ml-[.5rem]">建议至少1位</span>
									</span>
								),
							},
							attrs: { class: '!w-[19.3rem]', placeholder: '最少数字' },
							rules: [
								{
									required: true,
									validator: (rule: any, value: any, callback: any) => {
										if (value === '' || isNaN(Number(value))) {
											callback(new Error('请输入正确的密码最少数字个数'))
										} else if (!Number.isInteger(Number(value))) {
											callback(new Error('请输入正确的密码最少数字个数'))
										} else {
											callback()
										}
									},
									trigger: 'blur',
								},
							],
						}),
						FormInput('密码最少特殊字符个数', 'validate_password_special_char_count', {
							slots: {
								unit: () => (
									<span class="whitespace-nowrap ml-[.5rem]">
										<span class="ml-[.5rem]">建议至少1位</span>
									</span>
								),
							},
							attrs: { class: '!w-[19.3rem]', placeholder: '最少特殊字符' },
							rules: [
								{
									required: true,
									validator: (rule: any, value: any, callback: any) => {
										if (value === '' || isNaN(Number(value))) {
											callback(new Error('请输入正确的密码最少特殊字符个数'))
										} else if (!Number.isInteger(Number(value))) {
											callback(new Error('请输入正确的密码最少特殊字符个数'))
										} else {
											callback()
										}
									},
									trigger: 'blur',
								},
							],
						}),
						FormInput('密码最少大小写英文字符个数', 'validate_password_mixed_case_count', {
							slots: {
								unit: () => (
									<span class="whitespace-nowrap ml-[.5rem]">
										<span class="ml-[.5rem]">建议至少1位</span>
									</span>
								),
							},
							attrs: { class: '!w-[19.3rem]', placeholder: '大小写英文字符' },
							rules: [
								{
									required: true,
									validator: (rule: any, value: any, callback: any) => {
										if (value === '' || isNaN(Number(value))) {
											callback(new Error('请输入正确的最少大小写英文字符个数'))
										} else if (!Number.isInteger(Number(value))) {
											callback(new Error('请输入正确的最少大小写英文字符个数'))
										} else {
											callback()
										}
									},
									trigger: 'blur',
								},
							],
						}),
						FormGroup([
							FormSelect(
								'密码验证强度',
								'validate_password_policy',
								[
									{ label: 'LOW', value: 'LOW' },
									{ label: 'MEDIUM', value: 'MEDIUM' },
									{ label: 'STRONG', value: 'STRONG' },
								],
								{
									attrs: { class: '!w-[11.1rem]', placeholder: '验证强度' },
									rules: [
										{
											required: true,
											validator: (rule: any, value: any, callback: any) => {
												if (value === '') {
													callback(new Error('请选择验证强度'))
												} else {
													callback()
												}
											},
											trigger: 'blur',
										},
									],
								}
							),
							FormCustom(
								() => {
									return h('span', { class: 'text-small text-secondary ml-[1.5rem] leading-[3.2rem]' }, '建议设置为STRONG')
								},
								{ key: 'jump', rules: {} }
							),
						]),
				  ]
				: []),
		])
	},
	submit: async (param: Ref<any>, validate: any, ref: Ref<any>) => {
		await validate()
		setPasswordData(param.value)
	},
})

onMounted(() => {
	getPasswordData()
})

defineExpose({ init: getPasswordData })
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
