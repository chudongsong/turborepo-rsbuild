<template>
	<div class="node-clb-http">
		<BtTableGroup>
			<template #header-left>
				<div class="flex items-center">
					<BtOperation />
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
import { useDialog } from '@/hooks/tools'
import { checkObjKey, getPageTotal, isUndefined, formatTime } from '@/utils'

import { useAllTable, useBatch, useRefreshList, useOperation, Message } from '@/hooks/tools'
import { useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { ElPopover, ElTable, ElTableColumn } from 'element-plus'

import { useNodeClbStore } from '../useStore'
import { batchClbHttpOptions, editHttpClbEvent, deleteClbHttp, errSetEvent } from './useController'
import { openLogEvent } from '../useController'
import { getClbList, getHttpClbLog } from '@/api/node'

import { useClbHttpStore } from './useStore'
const { mainHeight } = useGlobalStore()
const { nodesStatusList } = useNodeClbStore()
const { httpRowData, isHttpClbEdit, nodeClbHttpRefresh } = useClbHttpStore()

const useTableBatch = useBatch(batchClbHttpOptions)

const { BtOperation } = useOperation({
	options: [
		{
			type: 'button',
			label: '添加负载均衡',
			active: true,
			onClick: () => editHttpClbEvent(),
		}
	],
})

const { BtTable, BtPage, BtRefresh, BtSearch, BtColumn, BtBatch, BtErrorMask, refresh, config, classList } = useAllTable({
	request: async data => {
		const { p: page, limit: page_size, search } = data
		const { data: res } = await getClbList({ page, page_size, search })
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
			label: '网站',
			prop: 'site_name',
			width: 180,
			isCustom: true,
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
										<ElTable data={row.nodes} style={{ width: 'auto' }} max-height="480px" >
												<ElTableColumn prop="node_remarks" label="节点" width="120" />
												<ElTableColumn prop="node_site_name" label="节点网站" width="120" />
												<ElTableColumn prop="port" label="端口" />
												<ElTableColumn prop="path" label="验证路径" />
												<ElTableColumn prop="node_status" label="节点状态">
														{{
															default: ({ row }: any) => {
																const status = nodesStatusList.value.find(item => item.value === row.node_status)
																return <span>{status?.label || '/'}</span>
															}
														}}
												</ElTableColumn>
												<ElTableColumn prop="weight" label="权重" />
												<ElTableColumn prop="max_fail" label="最大失败次数" min-width="100" />
												<ElTableColumn prop="fail_timeout" label="恢复时间（秒）" min-width="100" />
												<ElTableColumn prop="ps" label="备注" />
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
				return <div>{row.max_upstream_time}</div>
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
			{ onClick: editHttpClbEvent, title: '编辑' },
			{ onClick: errSetEvent, title: '配置' },
			{ onClick: deleteClbHttp, title: '删除' },
		]),
	],
	extension: [
		useTableBatch,
		useRefreshList(nodeClbHttpRefresh),
	],
})
</script>
