<!--  -->
<template>
	<bt-table-group>
		<template #header-left>
			<BtOperation />
		</template>
		<template #header-right>
			<BtRefresh class="mr-[10px]" />
			<BtColumn />
		</template>
		<template #content>
			<BtTable max-height="440" />
		</template>
		<template #footer-left> </template>
		<template #footer-right> </template>
	</bt-table-group>
</template>

<script setup lang="ts">
import { useAllTable, useOperation, useRefresh, useRefreshList } from '@/hooks/tools'
import { useOperate, useStatus } from '@/hooks/tools/table/column'
import { getTomcatList, isRefreshTomcatList, openInstallDailog, openSetConfigDialog, openSetting, setStatus, unInstallTomcat } from './useController'

const { BtOperation } = useOperation({
	options: [
		{
			type: 'button',
			label: '安装Tomcat',
			active: true,
			onClick: openInstallDailog,
		},
	],
})

const { BtTable, BtRefresh, BtColumn } = useAllTable({
	request: getTomcatList,
	columns: [
		{ label: '名称', prop: 't_name', isCustom: true },
		{ label: 'Tomcat版本', prop: 'version', isCustom: true },
		{ label: 'JAVA支持', prop: 'jdk_support', isCustom: true },
		{ label: '类型', width: 60, render: (row: any) => (row.type === 'global' ? '全局' : '自定义') },
		{ label: '路径', prop: 'path', isCustom: true, showOverflowTooltip: true },
		useStatus({ prop: 'running', event: (row: any) => setStatus(row, false) }),
		{ label: '端口', prop: 'port' },
		{ label: 'JDK', prop: 'jdk_version' },
		{ label: '备注', prop: 'ps' },
		useOperate([
			{ title: '修改', onClick: openSetting },
			{ title: '重载', onClick: (row: any) => setStatus(row, true) },
			{ title: '配置', onClick: openSetConfigDialog },
			{ title: '卸载', onClick: unInstallTomcat },
		]),
	],
	extension: [useRefreshList(isRefreshTomcatList)],
})
</script>

<style lang="sass" scoped></style>
