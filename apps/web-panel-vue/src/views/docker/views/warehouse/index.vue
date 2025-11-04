<template>
	<div class="relative">
		<bt-table-group>
			<template #header-left>
				<div class="flex items-center">
					<BtOperation />
				</div>
			</template>
			<template #header-right>
				<BtColumn />
			</template>
			<template #content>
				<bt-table key="wareTable" :max-height="mainHeight - 220" />
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
import { useRequestCanceler } from '@hooks/tools/axios/model/axios-cancel'
import { useGlobalStore } from '@store/global'
import { getDockerStore } from '@docker/useStore'
import { setContainerRemark } from '@/api/docker'
import { useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { useAllTable, useOperation, useDataHandle } from '@/hooks/tools'
import { getAllPsConfig } from '@docker/useMethods'
import { warehouseTableData, tableBtnGroup, getWarehouseList, editDataEvent, deleteDataEvent, useTableBatch, init, unmountHandler } from './useController'

const {
	refs: { isRefreshWarehouseList },
} = getDockerStore()

const { mainHeight } = useGlobalStore()

const { BtOperation } = useOperation({
	options: tableBtnGroup,
})
// 手动分页刷新
const manualRefresh = (p?: number) => {
	warehouseTableData.isRefresh = true
	if (p && !isNaN(p)) param.value.p = p
	refresh()
}

// 监听刷新表格
watch(
	() => isRefreshWarehouseList.value,
	value => {
		if (value) {
			manualRefresh()
		}
	}
)
const { BtTable, BtPage, BtBatch, BtColumn, refresh, param } = useAllTable({
	request: data => {
		return getWarehouseList(data)
	},
	columns: [
		useCheckbox(),
		{ label: `URL`, prop: 'url', minWidth: 100 },
		{ label: `用户`, prop: 'namespace', minWidth: 100, isCustom: true },
		{ label: `仓库名`, prop: 'name', minWidth: 100, isCustom: true },
		getAllPsConfig({
			table: 'images',
			prop: 'remark',
			edit: async (row: any) => {
				useDataHandle({
					request: setContainerRemark({
						data: JSON.stringify({ id: row.id, remark: row.remark }),
					}),
					message: true,
				})
			},
			noPlace: true,
			noCustom: true,
			width: 200,
		}),
		useOperate([
			{
				onClick: editDataEvent,
				isHide: (row: any) => {
					return row.url == 'docker.io' && row.name == 'docker官方库' && row.username == ''
				},
				title: `编辑`,
			},
			{
				onClick: deleteDataEvent,
				isHide: (row: any) => {
					return row.url == 'docker.io' && row.name == 'docker官方库' && row.username == ''
				},
				title: `删除`,
			},
		]),
	],
	extension: [useTableBatch],
})

// 页面加载完成
onMounted(async () => {
	init(mainHeight, param)
})

onBeforeUnmount(() => {
	// 取消请求
	useRequestCanceler(['/btdocker/registry/registry_list'])
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
