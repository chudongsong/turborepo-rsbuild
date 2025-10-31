import { Message, useDialog, useConfirm, useDataHandle } from '@/hooks/tools'
import { getAvailableNodes, delectRedisGroup, getGroupDetail } from '@/api/node'
import { useMasterRedisStore } from './useStore'
import { useBatchStatus } from '@hooks/tools/table/column'
import { TableBatchDialogProps, TableBatchNextAllProps, TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { getByteUnit } from '@/utils'

const { isRedisRefreshList, redisAvailableNodes, redisGroupDetail, openNodesLoading, slaveListLoad } = useMasterRedisStore()

export const formatPercent = (val: number, fixed = 2) => {
	if (typeof val !== 'number' || isNaN(val)) return '-'
	const num = +(val * 100).toFixed(fixed)
	let str = num.toString()
	if (str.indexOf('.') > -1) {
		str = str.replace(/\.0+$/, '')
		str = str.replace(/(\.[1-9]*)0+$/, '$1')
	}
	return str + '%'
}

export const openAddCopyGroup = async () => {
	useDialog({
		title: '新建主从复制组',
		area: 60,
		btn: ['创建', '取消'],
		component: () => import('./add-copy-group/index.vue'),
	})
	try {
		const { data: res } = await getAvailableNodes()
		console.log('打开新建主从组', res.data)
		if (!res.status) Message.error(res.msg || '获取可用节点失败！')
		redisAvailableNodes.value = {
			row: res.data,
			nodes: res.data.map((item: { name: string; server_ip: string; id: string | number; group_info: any }) => ({
				label: `${item.name} - ${item.server_ip} ${item.group_info === null ? '' : `（主从组 - ${item.group_info?.group_name}）`}`,
				value: item.id,
				server_ip: item.server_ip,
				disabled: item.group_info !== null,
			})),
		}
	} catch (error) {
		console.error(error)
	} finally {
		openNodesLoading.value = false
	}
}

/**
 * @description 批量删除主从
 */
export const multDeleteEvent = async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps, selectedList: AnyObject[], options: TableBatchOptionsProps) => {
	const { label, value } = options
	const requestHandle = async (item: AnyObject, index: number) => {
		switch (value) {
			case 'delete':
				return await delectRedisGroup({ group_id: item.group_id })
				break
		}
	}
	await batchConfirm({
		title: `批量${label}`,
		content: `批量删除选中的项目后，项目将无法恢复，是否继续操作？`,
		column: [
			{
				label: '主从组名称',
				prop: 'group_name',
			},
			useBatchStatus(),
		],
		onConfirm: async () => {
			await nextAll(requestHandle)
			// 执行完毕的代码，刷新列表
			isRedisRefreshList.value = true
			// 返回false则不关闭弹窗
			return false
		},
	})
}

export const handleManage = async (row?: any) => {
	useDialog({
		title: `管理主从复制组【${row.group_name}】`,
		area: 80,
		component: () => import('./mgt-group/index.vue'),
		compData: {
			rowData: row,
		},
	})
	const { data: res } = await getGroupDetail({ group_id: row.group_id })
	if (!res.status) Message.error(res.msg || '获取主从复制组失败！')
	redisGroupDetail.value = res.data
	slaveListLoad.value = false
	console.log('主从复制组详情', res.data)
}

export const handleNodeDetail = (row?: any, type?: string) => {
	console.log('打开详情', row)
	useDialog({
		title: `${type === 'slave' ? `从节点详情【${row.data.server_ip}】` : `主节点详情【${row.value?.master_detail?.data?.address}】`}`,
		area: 70,
		component: () => import('./redis-node-detail/index.vue'),
		compData: {
			rowData: row,
			type: type || 'master', // 默认是主节点
		},
	})
}

export const handleRedisGroupDelete = async (params: any) => {
	console.log(params)
	try {
		await useConfirm({
			icon: 'warning-filled',
			title: `删除主从复制组【${params.group_name}】`,
			content: `即将删除主从复制组，是否继续操作？`,
		})
		await useDataHandle({
			loading: '正在删除主从复制组，因需重新还原所有redis相关配置进行重启操作，过程可能较长请稍等...',
			request: delectRedisGroup({ group_id: params.group_id }),
			message: true,
			success: (res: any) => {
				isRedisRefreshList.value = true
			},
		})
	} catch (err) {
		console.warn(err)
	}
}

export const openCreateStep = async (task_id: string) => {
	useDialog({
		title: '创建主从复制组',
		area: 60,
		component: () => import('./add-copy-group/redis-create-log.vue'),
		compData: {
			task_id,
		},
	})
}

// 工具函数：主/从节点详情分组
export function getNodeDetailSections(detail: any, type: 'master' | 'slave' = 'master') {
	console.log('detail_value', detail.data)
	const baseData = type == 'master' ? detail.value?.master_detail.data || {} : detail.data || {}
	const masterMemory = baseData.memory || {}
	const performance = baseData.performance || {}
	const connections = baseData.connections || {}
	const replication = baseData.replication || {}
	const masterListArr = [
		{
			name: 'base',
			label: '基础信息',
			items: [
				{ label: '节点状态', value: baseData.status === 'online' ? '在线' : '离线' },
				{ label: 'Redis版本', value: baseData.redis_version || '--' },
				{ label: '运行天数', value: (baseData.uptime_days ?? '--') + '天' },
				{ label: '监听端口', value: baseData.port ?? '--' },
				{ label: '连接数', value: baseData.connected_slaves ?? '--' },
				{ label: '角色', value: baseData.role ?? '--' },
			],
		},
		{
			name: 'memory',
			label: '内存信息',
			items: [
				{ label: '已使用内存', value: masterMemory.used_memory_human ?? '--' },
				{ label: '系统内存', value: masterMemory.max_memory ? getByteUnit(masterMemory.max_memory) : '--' },
				{ label: '内存使用率', value: masterMemory.usage_percent != null ? formatPercent(masterMemory.usage_percent) : '--', tooltip: '计算方式：已使用内存/系统内存' },
			],
		},
		{
			name: 'connection',
			label: '连接信息',
			items: [
				{ label: '当前连接数', value: connections.connected_clients ?? '--' },
				{ label: '总连接数', value: connections.total_connections ?? '--', tooltip: '仅记录TCP连接数' },
				{ label: '最大连接数限制', value: connections.max_clients ?? '--' },
				{ label: '拒绝连接数', value: connections.rejected_connections ?? '--' },
			],
		},
		{
			name: 'performance',
			label: '性能统计',
			items: [
				{ label: '当前QPS', value: performance.qps ?? '--' },
				{ label: '总执行命令数', value: performance.total_commands ?? '--' },
				{ label: '键命中次数', value: performance.keyspace_hits ?? '--' },
				{ label: '键未命中次数', value: performance.keyspace_misses ?? '--' },
				{ label: '命中率', value: performance.hit_rate != null ? formatPercent(performance.hit_rate) : '--' },
			],
		},
	]
	const slaveListArr = [
		{
			name: 'base',
			label: '基础信息',
			items: [
				{ label: 'Redis版本', value: baseData.redis_version || '--' },
				{ label: '运行天数', value: (baseData.uptime_days ?? '--') + '天' },
				{ label: '监听端口', value: baseData.tcp_port ?? '--' },
				{ label: '角色', value: replication.role ?? '--' },
				{ label: '主节点地址', value: replication.master_host ?? '--' },
				{ label: '主节点端口', value: replication.master_port ?? '--' },
			],
		},
		{
			name: 'memory',
			label: '内存信息',
			items: [
				{ label: '已使用内存', value: masterMemory.used_memory_human ?? '--' },
				{ label: '系统内存', value: masterMemory.max_memory ? getByteUnit(masterMemory.max_memory) : '--' },
				{ label: '内存使用率', value: masterMemory.usage_percent != null ? formatPercent(masterMemory.usage_percent) : '--' },
			],
		},
		{
			name: 'connection',
			label: '连接信息',
			items: [
				{ label: '当前连接数', value: connections.connected_clients ?? '--' },
				{ label: '总连接数', value: connections.total_connections ?? '--' },
				{ label: '阻塞连接数', value: connections.rejected_connections ?? '--' },
			],
		},
		{
			name: 'replication',
			label: '复制信息',
			items: [
				{ label: '主从连接状态', value: replication.master_link_status ?? '--' },
				{ label: '最后IO时间', value: replication.last_io_seconds ? replication.last_io_seconds + '秒前' : '--' },
				{ label: '同步进度', value: replication.sync_in_progress ? '是' : '否' },
				{ label: '复制偏移量', value: replication.repl_offset ?? '--' },
				{ label: '复制延迟（秒）', value: replication.lag ?? '--' },
				{ label: '是否在线', value: replication.is_online ? '是' : '否' },
			],
		},
		{
			name: 'performance',
			label: '性能统计',
			items: [
				{ label: '当前QPS', value: performance.qps ?? '--' },
				{ label: '总执行命令数', value: performance.total_commands ?? '--' },
				{ label: '键命中次数', value: performance.keyspace_hits ?? '--' },
				{ label: '键未命中次数', value: performance.keyspace_misses ?? '--' },
				{ label: '命中率', value: performance.hit_rate != null ? formatPercent(performance.hit_rate) : '--' },
			],
		},
	]
	return type == 'master' ? masterListArr : slaveListArr
}
