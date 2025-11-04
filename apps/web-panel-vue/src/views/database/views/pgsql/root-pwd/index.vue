<template>
	<div class="px-[20px] py-[20px]">
		<el-form :model="adminPwdForm" ref="adminPwdRef" :rules="rules" @submit.native.prevent>
			<el-form-item label="管理员密码" prop="password">
				<bt-input-icon icon="el-refresh" v-model="adminPwdForm.password" @icon-click="() => (adminPwdForm.password = getRandomPwd(16))"></bt-input-icon>
			</el-form-item>
		</el-form>
	</div>
</template>

<script lang="ts" setup>
import { getPgSqlPassword, setPgSqlPassword } from '@/api/database'
import { getRandomPwd } from '@/utils'
import { useDataHandle } from '@hooks/tools'

const rules = {
	password: [
		{ required: true, message: '请输入密码', trigger: 'blur' },
		{ min: 6, message: '密码长度至少为6位', trigger: ['blur', 'change'] },
	],
} // 表单验证规则

const adminPwdForm = reactive({ password: '' })
const adminPwdRef = ref() // 表单实例

/**
 * @description 密码框数据变更
 */
const onConfirm = async (close: any) => {
	await adminPwdRef.value.validate()

	await useDataHandle({
		loading: '正在设置密码...',
		request: setPgSqlPassword({
			data: JSON.stringify({ password: adminPwdForm.password }),
		}),
		message: true,
		success: (res: any) => {
			if (res.status) close()
		},
	})
}

/**
 * @description 获取数据库密码
 */
const getRootPwd = async () => {
	const res = await useDataHandle({
		loading: '正在获取密码，请稍后...',
		request: getPgSqlPassword(),
		data: { msg: String },
	})
	adminPwdForm.password = res.msg || ''
}

onMounted(getRootPwd)

defineExpose({ onConfirm })
</script>
