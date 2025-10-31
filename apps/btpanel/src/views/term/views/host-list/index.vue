<template>
	<div>
		<div class="flex mb-[8px]">
			<BtButton @click="editHostInfo()" type="primary">添加服务器</BtButton>
		</div>
		<!-- @row-click="hostRowClick" -->
		<BtTable :max-height="mainHeight - 200" />
	</div>
</template>
<script setup lang="tsx">
import type { TermHostItemProps, TermHostProps } from '@term/types'

import { useRefreshList, useTable } from '@/hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'
import { useGlobalStore } from '@/store/global'
import { deleteHostInfo, editHostInfo } from './useController'
import { useTermHostStore } from './useStore'
import { createTerminal } from '../../useController'

const { mainHeight } = useGlobalStore()
const { getHostData, isRefreshList } = useTermHostStore()

// 表格配置
const { BtTable, refresh } = useTable({
	request: getHostData,
	columns: [
		{
			label: '服务器IP',
			render: (row: TermHostItemProps) => {
				return (
					<span class="flex items-center cursor-pointer" onClick={() => createTerminal(row)}>
						<i class="mr-4px svgtofont-el-monitor text-base" />
						<div>{row.ps}</div>
					</span>
				)
			},
		},
		useOperate([
			{
				title: '编辑',
				onClick: (row: TermHostProps, index: number, ev: MouseEvent) => {
					editHostInfo(row, refresh, ev)
				},
			},
			{
				title: '删除',
				onClick: (row: TermHostProps, index: number, ev: MouseEvent) => {
					deleteHostInfo(row, refresh, ev)
				},
			},
		]),
	],
	extension: [useRefreshList(isRefreshList)],
})

defineExpose({ init: refresh })
</script>
