<template>
	<div class="relative p-2rem">
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
				<bt-table key="templateTable" :max-height="410" />
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
import { 
	templateTableData,
	tableBtnGroup,
	getTList,
	editDataEvent,
	pullDataEvent,
	deleteDataEvent,
	useTableBatch,
	unmountHandler,
 } from './useController'
import { useCheckbox,useOperate } from '@/hooks/tools/table/column'
import { useAllTable,useOperation } from '@/hooks/tools'

import { getDockerStore } from '@docker/useStore'

const {
	refs: { isRefreshTemplateList },
} = getDockerStore()


const { BtOperation } = useOperation({
	options: tableBtnGroup
})
// 手动分页刷新
const manualRefresh = (p?:number) => {
	templateTableData.isRefresh = true
	if(p && !isNaN(p)) param.value.p = p
	refresh()
}

watch(
	() => isRefreshTemplateList.value,
	(val: boolean) => {
		if (isRefreshTemplateList.value) {
			manualRefresh()
		}
	}
)

const { BtTable, BtPage,BtBatch,BtColumn,refresh,param } = useAllTable({
	request: data => {
		return getTList(data)
	},
	columns: [
		useCheckbox(),
		{ label: `模板名`, prop: 'name', minWidth: 100 },
		{ label: `路径`, prop: 'path', minWidth: 100, isCustom: true },
		{ label: `备注`, prop: 'remark', minWidth: 100, isCustom: true },
		useOperate([
			{ onClick: editDataEvent, title: `编辑` },
			{ onClick: pullDataEvent, width: 60, title: `拉取镜像` },
			{ onClick: deleteDataEvent, title: `删除` },
		]),
	],
	extension: [useTableBatch],
})
onUnmounted(() => {
	unmountHandler()
})
</script>
