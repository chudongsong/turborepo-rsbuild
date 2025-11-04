<template>
	<div>
		<bt-removed-tips />
		<bt-tabs ref="logTab" class="w-full h-full" v-model="defaultActive" :options="tabrender" />
	</div>
</template>

<script setup lang="tsx">
import AuditBase from '@database/views/mysql/advanced-setting/log-audit/audit-common.vue';
import AuditAdv from '@database/views/mysql/advanced-setting/log-audit/audit-advanced.vue';
import AuditLog from '@database/views/mysql/advanced-setting/log-audit/audit-log.vue';

import { DATABASE_MYSQL_ADVANCED_AUDIT_STORE } from './useStore';



const store = DATABASE_MYSQL_ADVANCED_AUDIT_STORE();
const { resetData } = store
interface Props {
	compData: string
}
const props = withDefaults(defineProps<Props>(), {
	compData: 'base',
})

const logTab = ref()

const defaultActive = ref(props.compData || 'base') // 菜单默认展开项

const tabrender = [
	{
		label: '基础设置',
		name: 'base',
		render: () => <AuditBase />,
	},
	{
		label: '高级设置',
		name: 'advanced',
		lazy: true,
		render: () => <AuditAdv />,
	},
	{
		label: '审计日志',
		name: 'log',
		lazy: true,
		render: () => <AuditLog />,
	},
]

// 刷新当前tab
const refreshTab = () => {
	const currentRef = logTab.value?.getRef() || null
	if (currentRef) {
		currentRef[defaultActive.value].init()
	}
}

onUnmounted(() => {
	resetData()
})

defineExpose({
	init: refreshTab
})
</script>

<style scoped></style>
