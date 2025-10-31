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
			<BtRadioButton />
			<div class="ml-1rem">
				<BtSearch class="w-[32rem]" placeholder="请输入搜索关键字" />
			</div>
		</template>

		<template #content>
			<BtTable @sort-change="sortChange" />
		</template>

		<template #footer-right>
			<BtPage />
		</template>
	</bt-table-group>
</template>
<script lang="tsx" setup>
import { desiredNpsDialog } from '@logs/useController'
import { useDynamicTable, useOperation, useRadioButton, useMessage } from '@/hooks/tools'
import { formatTime } from '@/utils'
import { useGlobalStore } from '@store/global'
import { LOG_PANEL_STORE } from './useStore'
import { sortChange, typeOptions, clearAllLoginLog, outLoginLog } from './useController'

const { mainHeight } = useGlobalStore() // 获取全局高度
const store = LOG_PANEL_STORE()
const { getLoginLogsEvent } = store

// 消息提示
const Message = useMessage()

// 手动刷新方法
const handleRefresh = async () => {
	await refresh()
	Message.success('刷新成功')
}

const { BtOperation } = useOperation({
	options: [
		{
			label: '刷新日志',
			type: 'button',
			onClick: handleRefresh,
		},
		{
			label: '导出日志',
			type: 'button',
			onClick: () => {
				outLoginLog(config.data)
			},
		},
		{
			label: '清空日志',
			type: 'button',
			onClick: () => {
				clearAllLoginLog(refresh)
			},
		},
	],
})

const radioButton = useRadioButton({
	options: typeOptions,
	key: 'login_type',
})

const { BtTable, BtSearch, BtPage, refresh, BtRadioButton, config } = useDynamicTable({
	request: data => {
		const { p: page, ...rest } = data
		return getLoginLogsEvent({ page, ...rest })
	},
	columns: [
		{
			label: 'IP地址（归属地）',
			prop: 'remote_addr',
			minWidth: 100,
			render: (row: any) => {
				return (
					<span>
						{row.remote_addr}({row?.area?.info || ''})
					</span>
				)
			},
		},
		// { label: '登录地址', render: (row: any) => row?.area?.info || '' },
		{ label: '用户代理', width: 800, prop: 'user_agent' },
		{
			label: '登录状态',
			render: (row: any) => <span class={`text-${row.login_type ? 'primary' : 'danger'}`}>登录{row.login_type ? '成功' : '失败'}</span>,
		},
		{
			label: '时间',
			width: 150,
			prop: 'login_time',
			sortable: true,
			align: 'right',
			render: (row: any) => formatTime(row.login_time),
		},
	],
	extension: [radioButton],
})
</script>
