<template>
	<div class="relative">
		<bt-table-group>
			<template #header-left>
				<div class="flex items-center">
					<!-- <BtOperation /> -->
				</div>
			</template>
			<template #header-right>
				<!-- <BtSearch /> -->
			</template>
			<template #content>
				<BtTable :max-height="mainHeight - 320" />
			</template>
			<template #footer-left>
			</template>
			<template #footer-right>
				<BtPage />
			</template>
			<template #popup> </template>
		</bt-table-group>
	</div>
</template>
<script lang="tsx" setup>
import { copyText,getByteUnit,formatTime,isArray } from '@utils/index' // 工具函数
import { useAllTable,useOperation } from '@/hooks/tools'
import { useCheckbox,useOperate } from '@/hooks/tools/table/column'
import { useGlobalStore } from '@store/global'
import { getDockerStore } from '@docker/useStore'
import { 
	getTaskData,
	openResultDialog,
 } from './useController'

const { mainHeight } = useGlobalStore()


const { BtTable, BtPage, refresh } = useAllTable({
	request: data => {
		return getTaskData(data)
	},
	columns: [
			{ label: `执行时间`, prop: 'updated_at', width: 160,render: (row: any) => formatTime(row.updated_at) },
			{
				label: `执行节点`,
				prop: 'size',
				width: 300,
				render: (row: any) => {
					const text = row.server_list[0].name
					return `${text}${row.server_list.length > 1 ? `等${row.server_list.length}个节点` : ''}`
				}
			},
			{
				label: `执行任务`,
				prop: 'script_content',
				showOverflowTooltip: true,
				render: (row: any) => {
					return row.steps.map((item: any) => item.name).join('，')
				}
			},
			useOperate([
				{ onClick: openResultDialog, width: 80, title: '执行结果' },
			]),
		],
})

defineExpose({
	init: refresh
})

</script>