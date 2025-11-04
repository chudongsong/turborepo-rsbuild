<template>
	<BtTableGroup>
		<template #header-left>
			<div class="flex items-center">
				<BtButton @click="exitCommandDialog()" type="primary">添加</BtButton>
				<span class="bt-link ml-[1rem]" @click="autoCompleteDialog">智能提示</span>
				<!-- <el-popover
					class="box-item"
					placement="left-start"
				>
					<template #reference>
					</template>
					<div>
						<div class="flex items-center">
							<span class="mr-[1rem]">智能提示</span>
							<btSwitch v-model="autoCompleteStatus" :width="36" @change="setAutoCompleteStatus" />
						</div>
					</div>
				</el-popover> -->
			</div>
		</template>
		<template #header-right>
			<BtButtonUpload url="/xterm?action=into_command" path="/tmp/incommand.csv" :success="() => refresh()">导入</BtButtonUpload>
			<BtButton class="ml-[6px]" @click="exportCommand" type="default">导出</BtButton>
		</template>
		<template #content>
			<BtTable :max-height="mainHeight - 200" />
		</template>
	</BtTableGroup>
</template>
<script lang="tsx" setup>
import type { TermCommandItemProps } from '@term/types'

import { useRefreshList, useTable } from '@/hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'
import { useGlobalStore } from '@/store/global'
import { autoCompleteDialog, commandFindClick, deleteCommandInfo, exitCommandDialog, exportCommand } from './useController'
import { useTermCommandStore } from './useStore'

const { mainHeight } = useGlobalStore()
const { getCommand, isRefreshList } = useTermCommandStore()

// 表格实例
const { BtTable, refresh } = useTable({
	request: getCommand,
	columns: [
		{
			label: '命令名称',
			prop: 'title',
			render: (row: TermCommandItemProps, index: number) => {
				return (
					<span class="flex items-center cursor-pointer" onClick={(event: MouseEvent) => commandFindClick(row, { event })}>
						<i class="svgtofont-file-text text-base mr-4px"></i>
						<div>{row.title}</div>
					</span>
				)
			},
		},
		useOperate([
			{
				title: '编辑',
				onClick: (row: TermCommandItemProps, index: number, event: MouseEvent) => {
					event.stopPropagation()
					exitCommandDialog(row)
				},
			},
			{
				title: '删除',
				onClick: (row: TermCommandItemProps, index: number, event: MouseEvent) => {
					event.stopPropagation()
					deleteCommandInfo(row)
				},
			},
		]),
	],
	extension: [useRefreshList(isRefreshList)],
})

defineExpose({ init: getCommand })
</script>
