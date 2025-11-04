<template>
	<div class="node-master-redis">
		<bt-table-group>
			<template #header-left>
				<BtOperation />
			</template>
			<template #header-right>
				<BtSearch class="mr-[10px]" placeholder="请输入名称或地址" :class="`!w-[210px]`" />
				<BtRefresh />
			</template>
			<template #content>
				<BtTable />
			</template>
			<template #footer-left>
				<BtBatch />
			</template>
			<template #footer-right>
				<BtPage />
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="tsx">
import { useMasterRedisStore } from './useStore'
import { getRedisList } from '@/api/node'
import { useAllTable, useBatch, useRefreshList, useOperation, Message } from '@/hooks/tools'
import { useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { openAddCopyGroup, multDeleteEvent, handleManage, handleRedisGroupDelete, formatPercent } from './useController'

const { isRedisRefreshList } = useMasterRedisStore()

// 批量操作事件
const useTableBatch = useBatch([
	{
		label: '删除主从组',
		value: 'delete',
		event: multDeleteEvent,
	},
])

// 表头操作按钮
const { BtOperation } = useOperation({
	options: ref([
		{
			type: 'button',
			label: '新建主从复制组',
			active: true,
			onClick: () => openAddCopyGroup(),
		},
	]),
})

// 列配置
const columns = [
	useCheckbox({ key: 'group_id' }),
	{ label: '主从组名称', prop: 'group_name', minWidth: 120 },
	{ label: '主库地址', prop: 'master_server_ip', minWidth: 160 },
	{
		label: '内存占用',
		prop: 'memory_usage',
		minWidth: 100,
		render: (row: any) => (
			<span
				style={{
					color: row.memory_usage >= 0.95 ? 'var(--el-color-danger)' : row.memory_usage > 0.8 ? 'var(--el-color-warning)' : 'var(--el-color-primary)',
				}}>
				{formatPercent(row.memory_usage, 0)}
			</span>
		),
	},
	{
		label: 'QPS',
		prop: 'qps',
		minWidth: 80,
	},
	{ label: '连接数', prop: 'connections', minWidth: 80 },
	{
		label: '从库数量',
		prop: 'slave_count',
		minWidth: 80,
	},
	{
		label: '从库正常数',
		prop: 'normal_slaves',
		minWidth: 100,
		render: (row: any) => <span style={{ color: row.normal_slaves < row.slave_count ? 'var(--el-color-danger)' : 'var(--el-color-text-primary)' }}>{row.normal_slaves}</span>,
	},
	{
		label: '平均延迟（秒）',
		prop: 'avg_lag',
		minWidth: 100,
	},
	useOperate([
		{ title: '管理', onClick: handleManage },
		{ title: '删除', onClick: handleRedisGroupDelete },
	]),
]

const { BtTable, BtBatch, BtSearch, BtRefresh, BtPage } = useAllTable({
	request: async prarms => {
		const { data: res } = await getRedisList(prarms)
		if (!res.status) Message.error(res.msg)
		return {
			data: res.data,
			total: res.page.total_count,
			search: {},
		}
	},
	columns,
	extension: [useTableBatch, useRefreshList(isRedisRefreshList)],
	empty: () => (
		<span>
			您的列表为空，您可以
			<span class="bt-link" onClick={() => openAddCopyGroup()}>
				新建主从复制组
			</span>
		</span>
	),
})
</script>
