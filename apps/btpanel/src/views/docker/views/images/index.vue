<template>
	<div class="relative">
		<bt-table-group>
			<template #header-left>
				<div class="flex items-center">
					<BtOperation />
					<a class="ml-[1rem] bt-link" @click="NPSDialog">需求反馈</a>
				</div>
			</template>
			<template #header-right>
				<bt-input-icon icon="el-search" class="!mr-[1rem] !w-[26rem]" v-model="mirrorTableData.search" clearable placeholder="镜像名、ID、使用的容器" @icon-click="manualRefresh(1, mirrorTableData.search)" @clear="manualRefresh(1)" @keyup.enter="manualRefresh(1, mirrorTableData.search)" />
				<BtColumn />
			</template>
			<template #content>
				<BtTable key="ImageTable" :max-height="mainHeight - 220" />
			</template>
			<template #footer-left>
				<BtBatch />
			</template>
			<template #footer-right>
				<BtPage />
			</template>
			<template #popup> </template>
		</bt-table-group>
	</div>
</template>
<script lang="tsx" setup>
import { copyText, getByteUnit, formatTime, isArray } from '@utils/index' // 工具函数
import { NPSDialog } from '@docker/useMethods'
import { useAllTable, useOperation } from '@/hooks/tools'
import { useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { useGlobalStore } from '@store/global'
import { getDockerStore } from '@docker/useStore'
import { mirrorTableData, tableBtnGroup, getMList, createEvent, pushDataEvent, exportDataEvent, deleteDataEvent, conDetailEvent, useTableBatch, init, unmountHandler } from './useController'

import { ElTag, ElTooltip } from 'element-plus'

const {
	refs: { isRefreshTableList },
} = getDockerStore()

const { mainHeight } = useGlobalStore()

const { BtOperation } = useOperation({
	options: tableBtnGroup,
})

let isFilter = false // 是否是搜索
// 手动分页刷新
const manualRefresh = (p?: number, query?: string) => {
	mirrorTableData.isRefresh = true
	if (p && !isNaN(p)) param.value.p = p
	if (query) {
		param.value.search = query
		isFilter = true
	} else {
		isFilter = false
	}
	refresh()
}

const { BtTable, BtPage, BtBatch, BtColumn, refresh, param } = useAllTable({
	request: data => {
		return getMList(data, isFilter)
	},
	columns: [
		useCheckbox(),
		{
			label: `ID`,
			prop: 'id',
			width: 110,
			render: (row: any) => {
				const id = row.id.slice(7)
				return (
					<ElTooltip placement={'top'}>
						{{
							default: () => <div onClick={() => copyText({ value: row.id })}>{id.slice(0, 12)}</div>,
							content: () => <div>{row.id}</div>,
						}}
					</ElTooltip>
				)
			},
		},
		{ label: `镜像名`, prop: 'name', isCustom: true },
		{
			label: `大小`,
			prop: 'size',
			width: 100,
			isCustom: true,
			render: (row: any) => getByteUnit(row.size),
		},
		{
			label: `创建时间`,
			prop: 'time',
			width: 160,
			isCustom: true,
			render: (row: any) => formatTime(row.time),
		},
		{
			label: `使用镜像的容器`,
			prop: 'used',
			minWidth: 180,
			isCustom: true,
			render: (row: any) => {
				if (row.used !== 1) return '--'
				// 有容器
				if (isArray(row.containers) && row.containers.length > 0) {
					return (
						<span class="flex items-center whitespace-pre-wrap gap-4 min-h-[3rem]">
							{row.containers.map((con: any) => (
								<ElTag class="mr-1 cursor-pointer" type="primary" size="small" onClick={() => conDetailEvent(con)}>
									{con.container_name}
								</ElTag>
							))}
						</span>
					)
				} else {
					return '--'
				}
			},
		},
		useOperate([
			{ onClick: createEvent, width: 80, title: '创建容器' },
			{ onClick: pushDataEvent, title: `推送` },
			{ onClick: exportDataEvent, title: `导出` },
			{ onClick: (row: any) => deleteDataEvent(row, manualRefresh), title: `删除` },
		]),
	],
	extension: [useTableBatch],
})

watch(
	() => isRefreshTableList.value,
	(val: boolean) => {
		if (val) {
			manualRefresh()
			isRefreshTableList.value = false
		}
	}
)

// 页面加载完成
onMounted(async () => {
	init(mainHeight, param)
	// getMList()
	// tableColumn.value = contrastTableConfig(JSON.parse(localStorage.getItem('dockerMirrorTableColumn') || '[]'), tableColumn.value)
	// if (!customLimit.value.images) checkHeight()
})

onUnmounted(() => {
	unmountHandler()
})
</script>
<style lang="css" scoped>
.pri-button {
	@apply ml-[1rem] border-[0.1rem] py-0 h-[3rem] flex items-center;
}
.danger-button:hover {
	background: rgba(var(--el-color-danger), 0.2) !important;
	color: var(--el-color-text-secondary);
	border-color: rgba(var(--el-color-danger), 0.3) !important;
}
/* :deep(.el-table .cell){
	display:block;
} */
</style>
