<template>
	<bt-table-group class="">
		<template #header-left>
			<div class="flex items-center">
					<BtOperation />
			</div>
		</template>
		<template #header-right>
				<BtColumn />
		</template>
		<template #content>
			<bt-table key="storageTable" :max-height="mainHeight - 220" />
		</template>
		<template #footer-left>
				<BtBatch />
		</template>
		<template #footer-right>
				<BtPage />
		</template>
		<template #popup> </template>
	</bt-table-group>
</template>
<script lang="tsx" setup>
import { useGlobalStore } from '@store/global'
import { getDockerStore } from '@docker/useStore'
import { useCheckbox,useOperate } from '@/hooks/tools/table/column'
import { useAllTable,useOperation } from '@/hooks/tools'
import { formatTime } from '@/utils/index'
import { 
	storageTableData,
	tableBtnGroup,
	getSList,
	deleteDataEvent,
	useTableBatch,
	init,
	unmountHandler,
 } from './useController'

 import { ElTooltip } from 'element-plus'

const {
	refs: { isRefreshStorageList },
} = getDockerStore()

const { mainHeight } = useGlobalStore()

const { BtOperation } = useOperation({
	options: tableBtnGroup
})
// 手动分页刷新
const manualRefresh = (p?:number) => {
	storageTableData.isRefresh = true
	if(p && !isNaN(p)) param.value.p = p
	refresh()
}

watch(
	() => isRefreshStorageList.value,
	(val: boolean) => {
		if (val) manualRefresh()
	}
)
const { BtTable, BtPage,BtBatch,BtColumn,refresh,param } = useAllTable({
	request: data => {
		return getSList(data)
	},
	columns: [
		useCheckbox({ key: 'Name' }),
		{ label: `存储卷`, prop: 'Name', minWidth: 100, 
				render: (row: any) => {
					return (
						<ElTooltip placement={'top'}>
							{{
								default: () => <div>{row.Name}</div>,
								content: () => <div>{row.Name}</div>,
							}}
						</ElTooltip>
					)
				}, },
		{
			label: `挂载点`,
			prop: 'Mountpoint',
			minWidth: 100,
			isCustom: true,
			showOverflowTooltip: true,
		},
		{ label: `所属容器`, prop: 'container', minWidth: 100, isCustom: true },
		{ label: `设备`, prop: 'Driver', minWidth: 100, isCustom: true },
		{
			label: `创建时间`,
			prop: 'CreatedAt',
			minWidth: 100,
			isCustom: true,
			render: (row: any) => formatTime(row.CreatedAt),
		},
		{
			label: `标签`,
			prop: 'Labels',
			minWidth: 100,
			showOverflowTooltip: true,
			isCustom: true,
			render: (row: any) => {
				if (!row.Labels) return h('span', '')
				const labels = Object.entries(row.Labels) || []
				const tip = labels.map((item: any) => `${item[0]}:${item[1]}`)
				return tip.join(',')
			},
		},
		useOperate([{ onClick: deleteDataEvent, title: `删除` }]),
	],
	extension: [useTableBatch],
})

// 页面加载完成
onMounted(async () => {
	init(mainHeight, param)
})

onUnmounted(() => {
	unmountHandler()
})
</script>
