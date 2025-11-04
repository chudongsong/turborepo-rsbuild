<template>
	<bt-table-group>
		<template #header-left>
			<div class="flex items-center">
				<BtOperation />
				<div class="flex items-center ml-1rem" @click="desiredNpsDialog()">
					<i class="svgtofont-desired text-medium"></i>
					<span class="bt-link">需求反馈</span>
				</div>
			</div>
		</template>

		<template #header-right>
			<BtTableSelect />
			<BtSearch class="!w-[28rem]" placeholder="请输入搜索关键字" />
		</template>

		<template #content>
			<BtTable />
		</template>

		<template #footer-right>
			<BtPage />
		</template>
	</bt-table-group>
</template>
<script lang="tsx" setup>
import { Message, useDynamicTable, useOperation, useTableSelect, useMessage } from '@/hooks/tools'
import { toHalfWidth } from '@/utils'
import { useGlobalStore } from '@store/global'

import { desiredNpsDialog } from '@logs/useController'
import { clearLogs, getLogsInfo, ipOperateDialog, logTypeOptions, outWebSite } from './useController'

const { mainHeight } = useGlobalStore() // 获取全局高度

// 消息提示
const MessageTip = useMessage()

// 手动刷新方法
const handleRefresh = async () => {
	await refresh()
	MessageTip.success('刷新成功')
}

const { BtOperation } = useOperation({
	options: [
		{
			type: 'button',
			label: '刷新日志',
			onClick: handleRefresh,
		},
		{
			type: 'button',
			label: '导出日志',
			onClick: () => {
				// 表格数据为空时，提示无数据导出
				if (!config.data.length) return Message.error('暂无数据导出')
				outWebSite({ search: param.value.search })
			},
		},
		{
			type: 'button',
			label: '清空日志',
			onClick: () => clearLogs(refresh),
		},
		{
			type: 'button',
			label: 'IP操作统计',
			onClick: ipOperateDialog,
		},
	],
})

const tableSelect = useTableSelect({
	options: logTypeOptions,
	key: 'log_type',
	other: {
		placeholder: '请选择分类',
		filterable: true,
		class: '!w-16rem mr-1rem ',
	},
})

const { BtTable, BtSearch, BtPage, refresh, BtTableSelect, param, config } = useDynamicTable({
	request: data => {
		return getLogsInfo({
			...data,
			table: 'logs',
		})
	},
	columns: [
		{ label: '用户', prop: 'username', width: 180 },
		{ label: '操作类型', prop: 'type', width: 100, sortable: true },
		{
			label: '详情',
			render: function (row: any) {
				const parser = new DOMParser()
				const doc = parser.parseFromString(row.log, 'text/html')
				return <span v-html={toHalfWidth(doc.body.innerHTML)}></span>
			},
		},
		{
			label: '操作时间',
			width: 150,
			prop: 'addtime',
			align: 'right',
			sortable: true,
		},
	],
	extension: [tableSelect],
})
</script>
