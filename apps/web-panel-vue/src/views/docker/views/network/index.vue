<template>
	<div class="relative container-table-tab">
		<bt-table-group>
			<template #header-left>
				<div class="flex items-center">
					<BtOperation />
					<a class="ml-[1rem] bt-link" @click="NPSDialog()">需求反馈</a>
				</div>
			</template>
			<template #header-right>
				<BtColumn />
			</template>
			<template #content>
				<bt-table key="NetTable" :max-height="mainHeight - 220" />
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
import { NPSDialog } from '@docker/useMethods'
import { getDockerStore } from '@docker/useStore'
import { useGlobalStore } from '@store/global'
import { useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { useAllTable, useOperation } from '@/hooks/tools'
import { formatTime } from '@/utils/index'
import { NetTableData, tableBtnGroup, getNList, deleteDataEvent, useTableBatch, init, unmountHandler } from './useController'

const {
	refs: { isRefreshNetworkList },
} = getDockerStore()

const { mainHeight } = useGlobalStore()

const { BtOperation } = useOperation({
	options: tableBtnGroup,
})
// 手动分页刷新
const manualRefresh = (p?: number) => {
	NetTableData.isRefresh = true
	if (p && !isNaN(p)) param.value.p = p
	refresh()
}

watch(
	() => isRefreshNetworkList.value,
	(val: boolean) => {
		if (isRefreshNetworkList.value) {
			manualRefresh()
		}
	}
)
const { BtTable, BtPage, BtBatch, BtColumn, refresh, param } = useAllTable({
	request: data => {
		return getNList(data)
	},
	columns: [
		useCheckbox(),
		{ label: `网络名`, prop: 'name', showOverflowTooltip: true, minWidth: 100 },
		{ label: `设备`, prop: 'driver', minWidth: 100, isCustom: true },
		{ label: `ipv4网络号`, prop: 'subnet', minWidth: 100, isCustom: true },
		{ label: `ipv4网关`, prop: 'gateway', minWidth: 100, isCustom: true },
		{ label: `ipv6网络号`, prop: 'subnetv6', minWidth: 100, isCustom: false },
		{ label: `ipv6网关`, prop: 'gatewayv6', minWidth: 100, isCustom: false },
		{
			label: `标签`,
			prop: 'labels',
			minWidth: 100,
			showOverflowTooltip: true,
			isCustom: true,
			render: (row: any) => {
				if (!row.labels) return h('span', '')
				const labels = Object.entries(row.labels) || []
				const tip = labels.map((item: any) => `${item[0]}:${item[1]}`)
				return tip.join(',')
			},
		},
		{
			label: `创建时间`,
			prop: 'time',
			minWidth: 100,
			isCustom: true,
			render: (row: any) => formatTime(row.time),
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
<style lang="css" scoped>
.pri-button {
	@apply ml-[1rem] border-[0.1rem] py-0 h-[3rem] flex items-center;
}
.danger-button:hover {
	background: rgba(var(--el-color-danger), 0.2) !important;
	color: var(--el-color-text-secondary);
	border-color: rgba(var(--el-color-danger), 0.3) !important;
}
</style>
