<template>
	<div class="p-[2rem]">
		<BtForm class="h-[20rem]" />
		<div v-show="auditAdvFormData.mode !== ''" class="flex justify-start pl-[23rem]">
			<el-button type="primary" @click="submit">保存设置</el-button>
			<el-button type="default" @click="clearSubmit">清空规则</el-button>
		</div>
		<bt-help v-show="auditAdvFormData.mode !== ''" class="mt-[24rem]" :options="[{ content: '可粘贴识别快速选中多个选项，用,逗号分隔' }, { content: '重启数据库后规则将被清空，若重启请手动重新配置' }]"></bt-help>
	</div>
</template>

<script lang="tsx" setup>
import { useForm } from '@/hooks/tools'
import { FormRadioButton } from '@form/form-item'
import { DATABASE_MYSQL_ADVANCED_AUDIT_STORE } from './useStore'
import { createFormSelectItem } from './useMethod'

const store = DATABASE_MYSQL_ADVANCED_AUDIT_STORE()
const { auditAdvFormData } = storeToRefs(store)
const { getAuditBaseData, setAuditRules, getDatabase, getUser, getCommands, clearSubmit } = store

// 表单实体
const { BtForm, submit } = useForm({
	data: () => auditAdvFormData.value,
	options: () => {
		return computed(() => [
			FormRadioButton('日志记录规则模式', 'mode', [
				{ label: '允许', value: 'include' },
				{ label: '排除', value: 'exclude' },
			]),
			...(auditAdvFormData.value.mode === 'include'
				? [
						createFormSelectItem('允许记录的用户', '允许记录的用户,可多选', 'includeUser', 'audit_log_include_accounts', 'userOptions'),
						createFormSelectItem('允许记录的查询', '允许记录的查询,可多选', 'includeOrder', 'audit_log_include_commands', 'orderOptions'),
						createFormSelectItem('允许记录的数据库', '允许记录的数据库,可多选', 'includeDatabase', 'audit_log_include_databases', 'databaseOptions'),
				  ]
				: auditAdvFormData.value.mode === 'exclude'
				  ? [
							createFormSelectItem('排除记录的用户', '排除记录的用户,可多选', 'excludeUser', 'audit_log_exclude_accounts', 'userOptions'),
							createFormSelectItem('排除记录的查询', '排除记录的查询,可多选', 'excludeOrder', 'audit_log_exclude_commands', 'orderOptions'),
							createFormSelectItem('排除记录的数据库', '排除记录的数据库,可多选', 'excludeDatabase', 'audit_log_exclude_databases', 'databaseOptions'),
				    ]
				  : []),
		])
	},
	submit: async (param: typeof auditAdvFormData, validate: AnyFunction) => {
		await validate()
		setAuditRules(param.value)
	},
})

onMounted(() => {
	getDatabase()
	getUser()
	getCommands()
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
:deep(.el-tag) {
	max-width: 14rem !important;
}
</style>
