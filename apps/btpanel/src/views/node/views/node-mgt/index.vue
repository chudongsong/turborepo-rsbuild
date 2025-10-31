<template>
	<div class="module-ui">
		<!-- 错误遮罩 -->
		<BtErrorMask />
		<BtTableGroup>
			<template #header-left>
				<BtOperation />
			</template>
			<template #header-right>
				<BtTableCategory class="!w-[140px] mr-[10px]" />
				<BtSearch class="mr-[10px]" placeholder="请输入节点名称" :class="`!w-[${searchWidth}px]`" />
				<BtRefresh class="mr-[10px]" :onclick="forcedFlushesHandle" />
				<BtColumn />
			</template>
			<template #content><BtTable :min-height="mainHeight" /></template>
			<template #footer-left>
				<BtBatch />
			</template>
			<template #footer-right><BtPage /></template>
		</BtTableGroup>
	</div>
</template>

<script setup lang="tsx">
import type { NodeTableRowProps } from '@node/types'

import { useNodeStore } from '@node/useStore'
import { useGlobalStore } from '@/store/global'
import { addNodeClass, deleteNodeClass, editNode } from '@/api/node'
import { useTableCategory } from '@/hooks/business'
import { useDialog, useOperation, useMessage, useDataHandle } from '@/hooks/tools'
import { useCheckbox, useOperate, usePs } from '@/hooks/tools/table/column'
import { useAllTable, useBatch, useErrorMask, useRefreshList } from '@/hooks/tools/table/index'
import { deleteNode, getClassList, getNodeList, setBatchClass, useBatchEventHandle, useNodeCpuMemory, getNodeDetail, useNodeState, restartNode } from '../../useController'
import { useNodeAddStore } from '@/views/node/views/node-mgt/add-node/useStore'

const { mainHeight } = useGlobalStore()
const { rowData, isRefreshNodeList, searchWidth, nodeStatus, nodeCategory, forcedFlushes, setNodeInfo } = useNodeStore()

const { isEdit } = useNodeAddStore()

const isLocal = (row: any) => row.api_key === 'local' && row.app_key === 'local'
const isAccess = (row: any) => {
	if (row.api_key === 'local' && row.app_key === 'local') {
		return true
	}
	if (row.lpver !== '') {
		return true
	}
	return false
}
/**
 * @description 判断是否ssh节点(科里判断)
 * @param fallbackCheck 回退检查函数
 * @returns 条件检查函数
 */
const createConditionChecker = (fallbackCheck: (row: any) => boolean) => (row: any) => {
	// 是否为ssh添加
	if (row.api_key === '' && row.app_key === '' && row.ssh_conf && Object.keys(row.ssh_conf).length) {
		return true
	}
	return fallbackCheck(row)
}

const forcedFlushesHandle = () => forcedFlushes.value = 1
/**
 * @description 添加 编辑节点地址
 * @param {NodeTableRowProps} row 数据
 */

const editNodeEvent = (row?: NodeTableRowProps) => {
	rowData.value = row
	isEdit.value = !!row
	return useDialog({
		title: `${row ? `编辑节点【${row.address}】` : '添加节点'}`,
		area: 50,
		btn: `${row ? '保存' : '确认'}`,
		compData: row ? row : {},
		component: () => import('@/views/node/views/node-mgt/add-node/index.vue'),
	})
}

const openSeetting = (row?: any) => {
	setNodeInfo.value = row
	return useDialog({
		title: `${row ? `管理节点【${row.address}】` : '节点管理'}`,
		area: 90,
		component: () => import('@/views/node/views/node-mgt/set-node/index.vue'),
	})
}

/**
 * @description 打开分类管理
 */

const useCategory = useTableCategory({
	key: 'category_id',
	name: '节点分类',
	field: 'name',
	options: () => [{ label: '全部分类', value: 'all' }],
	event: {
		get: getClassList,
		add: addNodeClass,
		delete: (params: any) => {
			return useDataHandle({
				request: deleteNodeClass(params),
				success: () => {
					nodeStatus.value = []
					isRefreshNodeList.value = true
				},
			})
		},
	},
	ignore: ['0'],
	showEdit: false,
})

const { BtOperation } = useOperation({
	options: [
		{
			type: 'button',
			label: '添加节点',
			active: true,
			onClick: () => editNodeEvent(),
		},
	],
})

/**
 * @description 批量操作
 */
const useTableBatch = useBatch([
	{
		label: '设置分类',
		value: 'setClass',
		event: async (batchConfirm, nextAll, selectedList, options, clearSelection, config) => {
			setBatchClass(selectedList, clearSelection, classList, config)
		},
	},
	{ label: '重启面板', value: 'panel', event: useBatchEventHandle },
	{ label: '重启服务器', value: 'server', event: useBatchEventHandle },
	{ label: '删除节点', value: 'delete', event: useBatchEventHandle },
])

/**
 * @description 错误遮罩
 */

const { BtTable, BtPage, BtSearch, BtRefresh, BtColumn, BtBatch, BtTableCategory, BtErrorMask, classList, config } = useAllTable({
	request: (data: any) => {
		if (data.category_id === 'all') data.category_id = ''
		if (forcedFlushes.value === 1) data.refresh = 1
		return getNodeList(data)
	},
	columns: [
		useCheckbox({ type: 'page', key: 'id' }),
		{
			label: '节点名称',
			width: 'auto',
			prop: 'remarks',
			isCustom: true,
		},
		{ label: '地址', prop: 'address', minWidth: 120 },
		useNodeState(nodeStatus),
		useNodeCpuMemory(),
		{ label: '分类', isCustom: true, prop: 'category_id', render: (row: any) => nodeCategory.value.find(item => Number(item.value) === Number(row.category_id))?.label || '默认分类' },
		useOperate([
			{ onClick: getNodeDetail, title: '访问', isHide: createConditionChecker(isAccess)},
			{ onClick: openSeetting, title: '管理', isHide: isLocal },
			{ onClick: deleteNode, title: '删除', isHide: isLocal },
			{ isMore: true, menu: [
				{ key: 'edit', title: '编辑', isHide: isLocal },
				{ key: 'panel', title: '重启面板', isHide: createConditionChecker(isLocal) },
				{ key: 'server', title: '重启服务器', isHide: createConditionChecker(isLocal) },
			],isHide: isLocal,onClick: (key: string, row: any) => {
				switch (key) {
					case 'edit':
						editNodeEvent(row)
						break
					default:
						restartNode(row, key as 'panel' | 'server')
				}
			}},
		]),
	],
	extension: [useCategory, useTableBatch, useRefreshList(isRefreshNodeList), useErrorMask()],
	empty: () => {
		return (
			<span>
				您的列表为空，您可以
				<span class="bt-link" onClick={() => editNodeEvent()}>
					创建一个节点
				</span>
			</span>
		)
	},
})

onMounted(() => {
	nextTick(() => {
		import('@/views/node/views/node-mgt/set-node/index.vue')
		import('@/views/node/views/node-mgt/set-node/ssh/index.vue')
	})
})
</script>

<style scoped>
:deep(.node_state) {
	display: inline-flex;
	align-items: center;
}
:deep(.node_state::before) {
	content: '';
	display: inline-block;
	margin-right: 5px;
	width: 6px;
	height: 6px;
	border-radius: var(--el-border-radius-circle);
	background-color: var(--el-color-primary);
	flex-shrink: 0;
}
:deep(.state_2::before) {
	background: var(--el-color-danger-dark-2);
}
:deep(.state_3::before) {
	background: var(--el-base-tertiary);
}
:deep(.state_4::before) {
	background: var(--el-base-tertiary);
}
</style>
