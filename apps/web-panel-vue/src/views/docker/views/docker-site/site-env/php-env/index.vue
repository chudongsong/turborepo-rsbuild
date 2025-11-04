<template>
	<BtTableGroup>
		<template #header-left><LeftOperation /></template>
		<template #header-right><RightOperation /></template>
		<template #content><BtTable :min-height="300" class="fix-table" /></template>
		<template #footer-left>
			<BtBatch />
		</template>
		<template #footer-right><BtPage /></template>
	</BtTableGroup>
</template>

<script setup lang="tsx">
import { useDialog, useOperation } from '@/hooks/tools'
import { useCheckbox, useOperate, useStatus } from '@/hooks/tools/table/column'
import { useAllTable, useBatch, useRefreshList } from '@/hooks/tools/table/index'
import { formatTime } from '@/utils'
import { openPhpForm, openExtendTemplate } from './useController'
import { openlogDialog } from '@docker/views/docker-site/site-env/useController'
import { DOCKER_SITE_ENV_STORE } from '@docker/views/docker-site/site-env/useStore'
import { DOCKER_SITE_STORE } from '@docker/views/docker-site/useStore'
import { createSite } from '@docker/views/docker-site/useController'

const store = DOCKER_SITE_ENV_STORE()
const { getEnvList } = DOCKER_SITE_STORE()
const { refreshEnvTable } = storeToRefs(store)
const { delDockerEnv, useBatchEventHandle, cleanCache, refreshTemplate } = store

// 左侧操作按钮
const { BtOperation: LeftOperation } = useOperation({
	options: [
		{
			type: 'button',
			label: '创建',
			active: true,
			onClick: () => {
				openPhpForm()
			},
		},
		{
			type: 'button',
			label: '扩展模板',
			onClick: () => {
				openExtendTemplate()
			},
		},
		{
			type: 'button',
			label: '清理构建缓存',
			onClick: () => {
				cleanCache('php')
			},
		},
	],
})

// 右侧操作按钮
const { BtOperation: RightOperation } = useOperation({
	options: [
		{
			type: 'button',
			label: '更新环境模板',
			onClick: () => {
				refreshTemplate('php')
			},
		},
	],
})

// 批量
const useTableBatch = useBatch([{ label: '删除', value: 'delete', event: useBatchEventHandle }])

/**
 * @description 表格
 */
const { BtTable, BtPage, BtBatch, refresh } = useAllTable({
	request: data => {
		return getEnvList({
			p: data.p || 1,
			row: data.limit || 20,
			runtime_type: 'php',
		})
	},
	columns: [
		useCheckbox(),
		{ label: '名称', prop: 'name', minWidth: 100 },
		{ label: '版本', prop: 'version', minWidth: 100 },
		useStatus({
			function: (row: any) => {
				let text = '异常'
				let color = '#ff0000'
				switch (row.status) {
					case 'normal':
						text = '正常'
						color = 'var(--el-color-primary)'
						break
					case 'initializing':
						text = '构建中'
						color = '#555'
						break
				}
				return h(
					'span',
					{
						style: {
							color,
						},
						onClick: () => {
							if (row.status !== 'normal') {
								openlogDialog(row, 'build')
							}
						},
						class: row.status !== 'normal' ? 'cursor-pointer' : '',
					},
					<span class="flex items-center">
						{text}
						<i class="svgtofont-el-loading !text-small animation-spin" style={row.status === 'initializing' ? 'display:inline-block' : 'display:none;'}></i>
					</span>
				)
			},
		} as any),
		{
			label: '创建时间',
			minWidth: 100,
			prop: 'addtime',
			render: (row: any) => {
				return <span>{row.addtime ? formatTime(Number(row.addtime), 'yyyy-MM-dd HH:mm:ss') : '--'}</span>
			},
		},
		useOperate([
			{
				width: 80,
				isHide: (row: any) => {
					return row.status !== 'normal'
				},
				onClick: (row: any) => {
					createSite({ type: 'runEnv', formData: { type: 'php', env: `${row.name}:${row.version}` } })
				},
				title: '创建网站',
			},
			{
				onClick: (row: any) => {
					openlogDialog(row)
				},
				title: '日志',
			},
			{
				onClick: (row: any) => {
					openPhpForm(row)
				},
				title: '编辑',
			},
			{
				onClick: (row: any) => {
					delDockerEnv(row, 'php')
				},
				title: '删除',
			},
		]),
	],
	extension: [
		useTableBatch, // 批量操作
		useRefreshList(refreshEnvTable), // 刷新
	],
})
defineExpose({ init: refresh })
</script>
<style scoped>
:deep(.fix-table) {
	min-height: 21rem;
}
:deep(.fix-table .el-table__inner-wrapper) {
	min-height: 21rem;
}
:deep(.el-table .el-table__row:last-child .el-table__cell) {
	border-bottom: 1px solid var(--el-color-border-dark-tertiaryer) !important;
}
</style>
