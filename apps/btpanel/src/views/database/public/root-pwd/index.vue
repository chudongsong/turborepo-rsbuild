<template>
	<div class="px-[20px] py-[20px]">
		<el-form :model="rootPwdForm" ref="rootPwdRef" :rules="rules" @submit.native.prevent>
			<el-form-item label="数据库密码" prop="rootPwdValue">
				<bt-input-icon icon="el-refresh" v-model="rootPwdForm.rootPwdValue" @icon-click="() => (rootPwdForm.rootPwdValue = getRandomChart(16))"></bt-input-icon>
			</el-form-item>
		</el-form>
	</div>
</template>

<script lang="ts" setup>
import { setAuthStatus, setupPassword } from '@api/database'
import { useDataHandle } from '@hooks/tools'

import { getDatabaseStore } from '@database/useStore'
import { getRandomChart } from '@/utils'

interface Props {
	compData?: {
		rootPwd: string
		refresh: Function
	} // 数据
}

const {
	refs: { tabActive },
	refreshTableList,
} = getDatabaseStore()

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		rootPwd: '',
		refresh: () => {},
	}),
})

const rules = {
	rootPwdValue: [
		{ required: true, message: '请输入密码', trigger: 'blur' },
		{ min: 6, message: '密码长度至少为6位', trigger: ['blur', 'change'] },
	],
} // 表单验证规则

const rootPwdForm = reactive({ rootPwdValue: props.compData.rootPwd || '' })
const rootPwdRef = ref() // 表单实例

/**
 * @description 密码框数据变更
 */
const onConfirm = async (close: any) => {
	await rootPwdRef.value.validate()

	await useDataHandle({
		loading: '正在设置密码, 请稍后...',
		request:
			tabActive.value == 'mongodb'
				? setAuthStatus({
						data: JSON.stringify({ status: '1', password: rootPwdForm.rootPwdValue }),
				  })
				: setupPassword({ password: rootPwdForm.rootPwdValue }),
		message: true,
	})
	refreshTableList() // 刷新表格
	props.compData.refresh?.() // 刷新方法 - (已用于monggodb获取最新密码)
	// 关闭
	close()
}

defineExpose({ onConfirm: onConfirm })
</script>
