<template>
	<div class="node-clb-tcpudp">
		<BtTableGroup>
			<template #header-left>
				<div class="flex items-center">
					<bt-btn-group :options="tableBtnGroup" />
				</div>
			</template>
			<template #header-right>
				<div class="flex items-center">
					<BtSearch class="mr-[10px]" placeholder="请输入负载名称" :class="`!w-[210px]`" />
					<BtRefresh class="mr-[10px]" />
					<BtColumn />
				</div>
			</template>
			<template #content>
				<BtTable :min-height="mainHeight" />
			</template>
			<template #footer-left>
				<BtBatch />
			</template>
			<template #footer-right>
				<BtPage />
			</template>
		</BtTableGroup>
	</div>
</template>

<script setup lang="tsx">
import { useGlobalStore } from '@/store/global'
import { getTcpUdpClbList } from '@/api/node'
import { getPageTotal, formatTime } from '@/utils'
import { useAllTable, useBatch, useRefreshList, Message } from '@/hooks/tools'
import { useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { ElPopover, ElTable, ElTableColumn } from 'element-plus'

import { batchClbTcpudpOptions, editTcpudpClbEvent, deleteTcpudpClb } from './useController'
import { useClbTcpudpStore } from './useStore'
import { openLogEvent } from '../useController'

const { mainHeight } = useGlobalStore()
const { nodeClbTcpudpRefresh } = useClbTcpudpStore()


const tableBtnGroup: any = [
	{
		content: '添加负载均衡',
		dropdownClass: 'bg-white',
		splitButton: true,
		active: true,
		event: () => editTcpudpClbEvent()
	},
]

const useTableBatch = useBatch(batchClbTcpudpOptions)

const { BtTable, BtPage, BtRefresh, BtColumn, BtBatch, BtSearch, BtErrorMask, classList, config } = useAllTable({
	request: async (data: any) => {
		const { p: page, limit: page_size, search } = data
		const { data: res } = await getTcpUdpClbList({ page, page_size, search })
		if (res.msg && res.status === false) Message.error(res.msg)
		return {
			data: res.data,
			total: getPageTotal(res.page),
			other: {},
		}
	},
	columns: [
		useCheckbox({ type: 'page', key: 'load_id' }),
		{
			label: '负载均衡名称',
			prop: 'ps',
		},
		{
			label: '监听地址',
			prop: 'host',
			isCustom: true,
			render: (row: any) => {
				return (<span>{row.tcp_config.host}:{row.tcp_config.port}</span>)
			},
		},
		{
			label: '节点数量',
			prop: 'nodes',
			isCustom: true,
			render: (row: any) => {
				return (
						<ElPopover 
								trigger="hover" 
								title="节点详细信息"
								placement="bottom" 
								popper-class="node-clb-popover"
								width='auto'
								open-delay={100} 
								close-delay={0}
						>
								{{
								default: () => (
										<ElTable data={row?.nodes} max-height="480px" >
												<ElTableColumn prop="host" label="节点IP" width="110" />
												<ElTableColumn prop="requests" label="请求数" />
												<ElTableColumn prop="errors" label="错误数" />
												<ElTableColumn prop="qps" label="并发数" />
												<ElTableColumn prop="max_upstream_time" label="回源耗时（秒）" width="120" />
												<ElTableColumn prop="ps" label="备注" width="120" />
												<ElTableColumn prop="last_update" label="上次访问" width="150">{row?.nodes?.last_update === 0 ? '--' : formatTime(row?.nodes.last_update)}</ElTableColumn>
										</ElTable>
										),
										reference: () => <div style={`color: var(--el-base-tertiary);`}>{row.nodes.length}<span class="ml-4px size-12px bt-ico-ask">!</span></div>,
								}}
						</ElPopover>
				)
			},
		},
		{
			label: '请求数',
			prop: 'requests',
			isCustom: true,
		},
		{
			label: '错误数',
			prop: 'errors',
			isCustom: true,
		},
		{
			label: '并发数',
			prop: 'qps',
			isCustom: true,
		},
		{
			label: '回源耗时（秒）',
			prop: 'max_upstream_time',
			isCustom: true,
			render: (row: any) => {
				return (<span>{row.max_upstream_time}</span>)
			},
		},
		{
			label: '上次访问',
			prop: 'last_update',
			isCustom: true,
			render: (row: any) => {
				return <div>{row.last_update === 0 ? '--' : formatTime(row.last_update)}</div>
			},
		},
		useOperate([
			{ onClick: openLogEvent, title: '日志' },
			{ onClick: editTcpudpClbEvent, title: '编辑' },
			{ onClick: deleteTcpudpClb, title: '删除' },
		]),
	],
	extension: [
		useTableBatch,
		useRefreshList(nodeClbTcpudpRefresh),
	],
})

</script>