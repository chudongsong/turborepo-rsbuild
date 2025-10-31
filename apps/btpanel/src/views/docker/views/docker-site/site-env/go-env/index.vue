<template>
	<BtTableGroup>
		<template #header-left><LeftOperation /></template>
		<template #header-right></template>
		<template #content><BtTable class="fix-table" /></template>
		<template #footer-left>
			<BtBatch />
		</template>
		<template #footer-right><BtPage /></template>
	</BtTableGroup>
</template>

<script setup lang="tsx">
import { setCookie } from '@/utils/index'
import { useOperation } from '@/hooks/tools'
import { useCheckbox, useOperate, useStatus } from '@/hooks/tools/table/column'
import { useAllTable, useBatch, useRefreshList } from '@/hooks/tools/table/index'
import { openPathEvent } from '@table/event'
import { formatTime } from '@/utils'
import { openGoForm } from './useController'
import { openlogDialog } from '@docker/views/docker-site/site-env/useController'
import { DOCKER_SITE_ENV_STORE } from '@docker/views/docker-site/site-env/useStore'
import { DOCKER_SITE_STORE } from '@docker/views/docker-site/useStore'
import { createSite } from '@docker/views/docker-site/useController'

import BtDivider from '@/components/other/bt-divider'
import { ElPopover, ElTag } from 'element-plus'

const store = DOCKER_SITE_ENV_STORE()
const { getEnvList } = DOCKER_SITE_STORE()
const { refreshGoEnvTable } = storeToRefs(store)
const { delDockerEnv, useBatchEventHandle, cleanCache, setStatus } = store

// 左侧操作按钮
const { BtOperation: LeftOperation } = useOperation({
	options: [
		{
			type: 'button',
			label: '创建',
			active: true,
			onClick: () => {
				openGoForm()
			},
		},
		{
			type: 'button',
			label: '清理构建缓存',
			onClick: () => {
				cleanCache('go')
			},
		},
	],
})

// 批量
const useTableBatch = useBatch([{ label: '删除', value: 'delete', event: useBatchEventHandle }])

const popupClose = inject<any>('popupClose', () => {}) //     弹窗关闭

/**
 * @description 表格
 */
const { BtTable, BtPage, BtBatch, refresh } = useAllTable({
	request: (params: any) => {
		return getEnvList({
			p: params.p || 1,
			row: params.limit || 20,
			runtime_type: 'go',
		})
	},
	columns: [
		useCheckbox(),
		{ label: '名称', prop: 'name', minWidth: 100 },
		{ label: '版本', prop: 'version', minWidth: 60 },
		useStatus({
			event: () => {},
			function: row => {
				let text = '异常'
				let color = '#fc750d'
				switch (row.status) {
					case 'running':
						text = '运行中'
						color = 'var(--el-color-primary)'
						break
					case 'exited':
						text = '停止'
						color = '#ff0000'
						break
					case 'initializing':
						text = '构建中'
						color = '#555'
						break
				}
				return (
					<ElPopover placement="right" width="100" disabled={row.status === 'initializing'} popper-class="detail-popover" popper-style="min-width:60px;" trigger="hover">
						{{
							default: () => (
								<div class="flex items-center">
									<span class="bt-link cursor-pointer" onClick={() => setStatus(row.status === 'running' ? 'stop' : 'start', row, 'go')}>
										{row.status === 'running' ? '停止' : '启动'}
									</span>
									<BtDivider></BtDivider>
									<span class="bt-link cursor-pointer" onClick={() => setStatus('restart', row, 'go')}>
										重启
									</span>
								</div>
							),
							reference: () =>
								h(
									'span',
									{
										class: 'cursor-pointer',
										style: {
											color,
										},
										onClick: () => {
											setStatus(row.status === 'running' ? 'stop' : 'start', row, 'go')
										},
									},
									<span class="flex items-center">
										{text}
										<i class="svgtofont-el-loading !text-medium animation-spin" style={row.status === 'initializing' ? 'display:inline-block' : 'display:none;'}></i>
									</span>
								),
						}}
					</ElPopover>
				)
			},
		}),
		{
			label: '端口',
			prop: 'ports',
			minWidth: 250,
			render: (row: { ports: string; id: number }) => {
				const arr = Object.entries(JSON.parse(row.ports || '{}')) || []
				const str: string[] = []
				let num = 0
				for (let index = 0; index < arr.length; index++) {
					if (num >= 10) {
						str.push('......')
						break
					}
					const item: any = arr[index]
					if (item[1]) {
						str.push(`${item[1][0].HostIp || '0.0.0.0'}:${item[1][0].HostPort}-->${item[0]} `)
						num++
					}
				}
				return (
					<span key={row.id} class="whitespace-pre-wrap gap-4 leading-[2.5]">
						{str.map(con => (
							<ElTag type="success" size="default" class="mr-1">
								{con}
							</ElTag>
						))}
					</span>
				)
			},
		},
		{
			label: '创建时间',
			minWidth: 150,
			prop: 'addtime',
			render: (row: any) => {
				return <span>{row.addtime ? formatTime(Number(row.addtime), 'yyyy-MM-dd HH:mm:ss') : '--'}</span>
			},
		},
		{
			label: '运行目录',
			minWidth: 200,
			prop: 'path',
			render: (row: any) => {
				return (
					<span class="btlink truncate inline-block max-w-[20rem] leading-[3.7rem] cursor-pointer" title={row.path} onClick={() => openPathEvent(row, 'path')}>
						{row.path}
					</span>
				)
			},
		},
		useOperate([
			{
				width: 80,
				isHide: (row: any) => {
					return row.status !== 'running'
				},
				onClick: (row: any) => {
					createSite({ type: 'runEnv', formData: { type: 'go', env: `${row.name}:${row.version}` } })
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
					openGoForm(row)
				},
				title: '编辑',
			},
			{
				onClick: (row: any) => {
					delDockerEnv(row, 'go')
				},
				title: '删除',
			},
		]),
	],
	extension: [
		useTableBatch, // 批量操作
		useRefreshList(refreshGoEnvTable), // 刷新
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
