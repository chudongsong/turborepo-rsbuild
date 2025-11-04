import { TableBatchDialogProps, TableBatchEventProps, TableBatchNextAllProps, TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { useBatchStatus } from '@/hooks/tools/table/column'
import { useDialog, useConfirm, useDataHandle, Message } from '@/hooks/tools'
import { deleteTcpUdpClb, getClbAllNode, batchDelTcpUdpClb } from '@/api/node'
import { useClbTcpudpStore } from './useStore'
import { useSocket, Socket } from '@/hooks/tools/socket'
import { useNodeClbStore } from '../useStore'
import { createWebSocketWithResult } from '../useController'

const { tcpudpRowData, isTcpudpClbEdit, nodeClbTcpudpRefresh } = useClbTcpudpStore()
const { testLinkStatus } = useNodeClbStore()

/**
 * @description 批量处理事件
 * @param {TableBatchDialogProps} batchConfirm 选中处理事件
 * @param {TableBatchNextAllProps} nextAll 选中处理事件
 * @param {Ref<FtpTableRowProps[]>} selectList 选中的数据
 * @param {TableBatchOptionsProps} options 选中的配置
 * @returns {Promise<void>} void
 */

export const useBatchEventHandle: TableBatchEventProps = async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps, selectList: Ref<any[]>, options: TableBatchOptionsProps): Promise<void> => {
	const { label, value } = options
	const template: Map<string, string> = new Map([['delete', '批量删除TCP/UDP负载均衡']])
	let sslIndexList: any = [],
		sslHashList: any = []
	selectList.value.forEach((item: any) => {
		if (item.hash !== undefined && item.hash !== null) {
			sslHashList.push(item.hash)
		} else if (item.index !== undefined && item.index !== null) {
			sslIndexList.push(item.index)
		}
	})
	const requestHandle = async () => {
		switch (value) {
			case 'delete':
				return await batchDelTcpUdpClb({ load_ids: JSON.stringify(selectList.value.map((item: any) => item.load_id)) })
		}
	}
	await useDialog({
		title: `批量${label}负载均衡`,
		area: 46,
		component: () => import('@components/extension/bt-result/index.vue'),
		compData: {
			resultTitle: `批量${label}负载均衡`,
			resultData: selectList.value,
			resultColumn: [{ label: '名称', prop: 'ps' }, useBatchStatus()] as TableColumnProps[],
			autoTitle: `批量${label}负载均衡`,
		},
		showFooter: true,
		onConfirm: async () => {
			const loading = Message.load('正在删除，请稍候...')
			try {
				await requestHandle()
				Message.success('删除成功')
				nodeClbTcpudpRefresh.value = true
			} catch (e) {
				Message.error('删除失败')
			} finally {
				loading.close()
			}
		},
	})
}

export const editTcpudpClbEvent = (row?: any) => {
	tcpudpRowData.value = row
	isTcpudpClbEdit.value = !!row
	useDialog({
		isAsync: true,
		title: `${row ? `编辑【${row.ps}】` : '添加TCP/UDP负载均衡'}`,
		area: 74,
		btn: `${row ? '保存' : '确认'}`,
		compData: row ? row : {},
		component: () => import('./add-clb-tcpudp/index.vue'),
	})
}

export const tcpudpRenderForm = () => {
	console.log(tcpudpRowData.value)
	try {
		let form = {
			load_id: tcpudpRowData.value?.load_id || 0,
			name: tcpudpRowData.value?.name || '',
			type: tcpudpRowData.value?.tcp_config?.type || 'tcp',
			host: tcpudpRowData.value?.tcp_config?.host || '127.0.0.1',
			port: tcpudpRowData.value?.tcp_config?.port || null,
			proxy_timeout: tcpudpRowData.value?.tcp_config?.proxy_timeout || 8,
			proxy_connect_timeout: tcpudpRowData.value?.tcp_config?.proxy_connect_timeout || 86400,
			ps: tcpudpRowData.value?.ps || '',
			nodes: tcpudpRowData.value?.nodes || [],
		}
		return form
	} catch (error) {
		console.log(error)
		return {}
	}
}

export const addTcpudpNode = async () => {
	const res: any = await useDataHandle({
		loading: '正在获取节点列表，请稍后...',
		request: getClbAllNode(),
	})
	if (res.msg && res.status === false) Message.error(res.msg)
	const nodes = res.data.data.map((item: any) => ({
		label: item.remarks,
		value: item.id,
		server_ip: item.server_ip,
		version: item.version,
		useful_version: item.useful_version,
	}))
	useDialog({
		title: '添加节点',
		area: 56,
		btn: true,
		compData: {
			nodes,
		},
		component: () => import('./add-tcpudp-node/index.vue'),
	})
}

export const testTcpudpConnection = async (formData: any) => {
	try {
		testLinkStatus.value = true
		const { port, ...rest } = formData
		if (rest.node_id == '') {
			Message.error('请选择负载均衡节点')
			return false
		}
		const params = {
			type: 'tcp',
			port: Number(port),
			...rest,
		}
		await createWebSocketWithResult(
			{
				mod_name: 'node',
				sub_mod_name: 'load',
				def_name: 'check_tcp_node',
				ws_callback: 'check_tcp_node',
				data: {
					...params,
				},
			},
			{
				loading: false,
			}
		)
	} catch (error) {
		console.log(error)
	} finally {
		testLinkStatus.value = false
	}
}

export const deleteTcpudpClb = async (params: any) => {
	try {
		// 弹出确认框
		await useConfirm({
			icon: 'warning-filled',
			title: `删除负载均衡【${params.ps}】`,
			content: `即将删除负载均衡，是否继续操作？`,
		})
		await useDataHandle({
			loading: '正在删除负载均衡，请稍后...',
			request: deleteTcpUdpClb({ load_id: params.load_id }),
			message: true,
			success: (res: any) => {
				nodeClbTcpudpRefresh.value = true
			},
		})
	} catch (err) {
		console.warn(err)
	}
}

export const batchClbTcpudpOptions = [
	{
		label: '删除',
		value: 'delete',
		event: useBatchEventHandle,
	},
] as TableBatchOptionsProps[]
