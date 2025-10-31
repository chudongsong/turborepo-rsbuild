<template>
	<div class="flex flex-col items-center mt-[8%]" :style="{ 'min-height': mainHeight - 200 + 'px' }">
		<BtForm size="default" class="bind-user-info w-[44rem] bind-form" />
	</div>
</template>

<script lang="tsx" setup>
import type { FormItemProps } from '@/hooks/tools/form/types'

import BtButton from '@/components/base/bt-button'
import { FormCustom, FormInput, FormInputIcon } from '@/hooks/tools/form/form-item'
import { useForm } from '@/hooks/tools/index'
import { useGlobalStore } from '@store/global' // 持久化状态
import { handleSetlastPassword, modifyPassword, modifyPawForm, refreshPwd } from './useController'

const { mainHeight } = useGlobalStore() // 持久化状态

// 表单配置
const formOptions = computed(() => [
	FormCustom(() => {
		return (
			<div class="text-center !mb-[22px] flex justify-center">
				<h3 class="text-extraLarge font-bold text-default inline-block mr-2 mt-12px">当前面板密码已过期，请立即修改密码！</h3>
			</div>
		)
	}),
	FormInputIcon('新的密码', 'password1', {
		icon: 'el-refresh',
		iconClick: refreshPwd,
		attrs: {
			placeholder: '请输入新的密码',
			style: { width: '32rem' },
		},
		rules: [
			{ required: true, message: '请输入新的密码', trigger: ['blur', 'change'] },
			{ min: 6, message: '密码长度必须大于5位', trigger: ['blur', 'change'] },
		],
	}),
	FormInput('确认密码', 'password2', {
		attrs: {
			placeholder: '重复输入密码，确认新的密码',
			style: { width: '32rem' },
		},
		rules: [
			{ required: true, message: '请再次输入密码', trigger: ['blur', 'change'] },
			{
				validator: (rule: any, value: string, callback: any) => {
					if (value !== modifyPawForm.password1) {
						callback(new Error('两次输入密码不一致'))
					} else {
						callback()
					}
				},
				trigger: ['blur', 'change'],
			},
		],
	}),
	FormCustom(() => {
		return (
			<>
				<BtButton class="w-[100%] mt-[1.2rem]" type="primary" onClick={modifyPassword}>
					修改密码
				</BtButton>
				<div class="flex justify-end mt-1rem">
					<span class="bt-link" onClick={handleSetlastPassword}>
						延用上一次密码
					</span>
				</div>
			</>
		)
	}),
])

// 表单数据
const { BtForm } = useForm({
	data: () => modifyPawForm,
	options: formOptions as ComputedRef<FormItemProps[]>,
	submit: async (formData: typeof modifyPawForm, validate: any) => {
		await validate()
		return modifyPassword()
	},
})

onMounted(refreshPwd)
</script>

<style lang="css" scoped>
.bind-user-info {
	padding: 4.6rem 32px 12px;
}
.bind-form .el-input__inner {
	height: 4rem;
	line-height: 4rem;
}
.bind-form .el-form .el-form-item--small.el-form-item + .el-form-item {
	margin-top: 2.4rem !important;
}
</style>
