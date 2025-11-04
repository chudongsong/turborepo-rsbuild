<template>
	<div class="p-[16px]">
		<BtTable class="menu-set-table" row-key="id" :tree-props="{ children: 'children' }" max-height="360" />
	</div>
</template>

<script lang="tsx" setup>

import { useRefreshList, useTable } from '@/hooks/tools'
import { useGlobalStore } from '@/store/global'

import BtSwitch from '@/components/form/bt-switch'
import { handleMenuChange, updateMenuItems } from './controller'
import type { MenuProps } from './types'

const { isRefreshMenu } = useGlobalStore()

const { BtTable } = useTable({
	request: updateMenuItems,
	columns: [
		{
			label: '菜单栏目',
			prop: 'title',
		},
		{
			label: '是否显示',
			showOverflowTooltip: false,
			align: 'right',
			render: (row: MenuProps) => {
				const arr = ['首页', '软件商店', '设置', '退出']
				if (arr.includes(row.title)) return '不可操作'
				return <BtSwitch v-model={row.show} size="small" onChange={() => handleMenuChange(row)}></BtSwitch>
			},
		},
	],
	extension: [useRefreshList(isRefreshMenu)],
})
</script>

<style lang="css">
.menu-set-table.el-table--border .el-table__cell:first-child .cell {
	padding-left: 24px;
}
.menu-set-table.el-table--border tbody .el-table__row:nth-child(2) .el-table__cell:first-child .cell {
	padding-left: 2px;
}
.menu-set-table.el-table--border .el-table__cell:first-child .cell .el-table__placeholder {
	width: 0;
}
.menu-set-table .el-table__expand-icon {
	top: 2px;
	left: 4px;
}
</style>
