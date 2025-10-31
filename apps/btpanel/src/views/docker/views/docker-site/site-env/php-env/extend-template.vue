<template>
	<div class="p-[20px]">
		<BtTableGroup>
			<template #header-left><LeftOperation /></template>
			<template #header-right></template>
			<template #content><BtTable :max-height="300" /></template>
			<template #footer-left>
				<BtBatch />
			</template>
			<template #footer-right><BtPage /></template>
		</BtTableGroup>
	</div>
</template>

<script setup lang="tsx">
import { useDialog, useOperation } from '@/hooks/tools'
import { useCheckbox, useOperate, useStatus } from '@/hooks/tools/table/column'
import { useAllTable, useBatch, useRefreshList } from '@/hooks/tools/table/index'
import { formatTime } from '@/utils'
import { getExtendTemplate, openCreateTemplateForm } from './useController'
import { openlogDialog } from '@docker/views/docker-site/site-env/useController'
import { DOCKER_SITE_ENV_PHP_STORE } from './useStore'

const store = DOCKER_SITE_ENV_PHP_STORE()
const { refreshTemplateTable } = storeToRefs(store)
const { delPhpTemplate, useBatchEventHandle } = store

// 左侧操作按钮
const { BtOperation: LeftOperation } = useOperation({
	options: [
		{
			type: 'button',
			label: '创建',
			active: true,
			onClick: () => {
				openCreateTemplateForm()
			},
		},
	],
})

// 批量
const useTableBatch = useBatch([{ label: '删除', value: 'delete', event: useBatchEventHandle }])

/**
 * @description 表格
 */
const { BtTable, BtPage, BtBatch } = useAllTable({
	request: data => {
		return getExtendTemplate({
			p: data.p || 1,
			row: data.limit || 20,
		})
	},
	columns: [
		useCheckbox(),
		{ label: '名称', prop: 'name', minWidth: 100 },
		{ label: '版本', prop: 'version', minWidth: 100 },
		{
			label: '扩展',
			minWidth: 100,
			prop: 'exts',
			// render: (row: any) => {
			// 	return (
			// 		<span>
			// 			{row.exts}
			// 		</span>
			// 	);
			// },
		},
		useOperate([
			{
				onClick: (row: any) => {
					openCreateTemplateForm(row)
				},
				title: '编辑',
			},
			{
				onClick: (row: any) => {
					delPhpTemplate(row, 'php')
				},
				title: '删除',
			},
		]),
	],
	extension: [
		useTableBatch, // 批量操作
		useRefreshList(refreshTemplateTable), // 刷新
	],
})
</script>
<style scoped>
/* :deep(.el-table .cell){
	display:block;
} */
</style>
