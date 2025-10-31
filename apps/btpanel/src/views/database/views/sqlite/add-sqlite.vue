<template>
	<div class="p-24px">
		<el-form :model="ruleForm" ref="addDataBaseForm" :rules="rules" @submit.native.prevent>
			<el-form-item :label="'路径'" prop="path">
				<bt-input-icon v-model="ruleForm.path" v-trim icon="icon-file_mode" name="path" @icon-click="onPathChange" placeholder="请选择数据库文件" width="28rem" />
			</el-form-item>
			<el-form-item label="名称">
				<bt-input width="28rem" v-model="ruleForm.name" placeholder="可以不填写，默认为数据库文件名"></bt-input>
			</el-form-item>
		</el-form>
	</div>
</template>
<script lang="ts" setup>
import { addModulesDatabase } from '@/api/database'
import { fileSelectionDialog } from '@/public/index'
import { getDatabaseStore } from '@/views/database/useStore'
import { useDataHandle } from '@hooks/tools'

interface ruleFormProps {
	name: string
	path: string
}

const { refreshTableList } = getDatabaseStore()

const addDataBaseForm = ref()
const ruleForm = ref<ruleFormProps>({
	name: '',
	path: '',
}) //添加表单数据

const rules = {
	path: [
		{
			required: true,
			message: '请选择数据库文件',
			trigger: ['blur', 'change'],
		},
	],
} // 表单校验规则

const onPathChange = () => {
	fileSelectionDialog({
		type: 'file',
		path: '',
		change: (path: string) => (ruleForm.value.path = path),
	})
}

/**
 * @description 数据库表单提交方法
 */
const onConfirm = async (close: any) => {
	await addDataBaseForm.value.validate()
	await useDataHandle({
		loading: '正在添加数据库，请稍后...',
		request: addModulesDatabase(ruleForm.value, 'sqlite'),
		message: true,
	})
	refreshTableList()
	close()
}

defineExpose({ onConfirm })
</script>

<style lang="css" scoped>
:deep(.el-select .el-input--small input.el-input__inner) {
	padding-right: 2.4rem;
}
</style>
