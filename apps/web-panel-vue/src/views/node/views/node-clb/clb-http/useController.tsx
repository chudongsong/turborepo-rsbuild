import { TableBatchDialogProps, TableBatchEventProps, TableBatchNextAllProps, TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { useBatchStatus } from '@/hooks/tools/table/column'
import { useDialog, Message, useConfirm, useDataHandle } from '@/hooks/tools'
import { batchDelHttpClb } from '@/api/node'
import { useClbHttpStore } from './useStore'
import { deleteClbHttpApi, editHttpSeeting, getClbAllNode, getPhpSiteList, getNodeSites } from '@/api/node'
import { createWebSocketWithResult } from '../useController'
import { useNodeClbStore } from '../useStore'
import { checkDomain } from '@/utils'
import { isNil } from 'ramda'
const { httpRowData, isHttpClbEdit, addNodeData, nodeClbHttpRefresh, domainList } = useClbHttpStore()
const { testLinkStatus } = useNodeClbStore()

interface RestaurantItem {
	value: string
	label: string
}

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
	const template: Map<string, string> = new Map([['delete', '批量删除HTTP负载均衡']])
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
		const selectIds = selectList.value.map((item: any) => item.load_id)
		switch (value) {
			case 'delete':
				return await batchDelHttpClb({ load_ids: JSON.stringify(selectIds) })
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
				nodeClbHttpRefresh.value = true
			} catch (e) {
				Message.error('删除失败')
			} finally {
				loading.close()
			}
		},
	})
}

export const editHttpClbEvent = async (row?: any) => {
	httpRowData.value = row
	isHttpClbEdit.value = !!row
	if (!isHttpClbEdit.value) {
		const loading = Message.load('正在获取网站列表，请稍后...')
		try {
			const res = await getPhpSiteList()
			if (res.msg && res.status === false) Message.error(res.msg)
			domainList.value = res.data.map((item: any) => ({ label: item.site_name, value: item.site_id }))
		} catch (error) {
			console.log(error)
		} finally {
			loading.close()
		}
	}
	useDialog({
		isAsync: true,
		title: `${row ? `编辑【${row.ps}】` : '添加HTTP负载均衡'}`,
		area: 110,
		btn: `${row ? '保存' : '确认'}`,
		compData: row ? row : {},
		component: () => import('./add-clb-http/index.vue'),
	})
}

const defaultForm = {
	load_id: '',
	name: '',
	site_name: '',
	http_alg: 'round_robin',
	ps: '',
	request: '',
	error: '',
	qps: '',
	upstream_time: '',
	last_request_time: '',
	nodes: [],
}

export const httpRenderForm = () => {
	try {
		const data = httpRowData.value || {}
		return {
			...defaultForm,
			...data,
			http_alg: data?.http_config?.http_alg || 'round_robin',
			nodes: data?.nodes || [],
		}
	} catch (error) {
		console.log(error)
		return { ...defaultForm }
	}
}

export const addHttpNode = async () => {
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
		area: 54,
		btn: ['添加', '取消'],
		compData: {
			nodes,
		},
		component: () => import('./add-node/index.vue'),
	})
}

export const testConnection = async (formData: any, nodeSites?: any) => {
	testLinkStatus.value = true
	const { port, node_site_id, node_site_name, ...rest } = formData.value
	const isNewNode = nodeSites.some((item: any) => item.label === node_site_name)
	try {
		const ipReg = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/
		if (!formData.value.node_id) return Message.error('请选择负载均衡节点')
		if (!checkDomain(node_site_name) && !ipReg.test(node_site_name)) {
			Message.error('请输入正确的节点网站格式')
			return
		}
		if (!port) return Message.error('请输入端口')
		const params = {
			port: Number(port),
			...(isNewNode ? { node_site_id, node_site_name } : { node_site_name }),
			...rest,
		}
		await createWebSocketWithResult(
			{
				mod_name: 'node',
				sub_mod_name: 'load',
				def_name: 'check_http_node',
				ws_callback: 'check_http_node',
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
		if (!isNewNode) {
			if (!formData.value.node_id) return (testLinkStatus.value = false)
			const { data } = await getNodeSites({ node_id: formData.value.node_id })
			const newNodeId = data.data.find((item: any) => item.site_name == node_site_name)?.site_id
			formData.value.node_site_id = newNodeId
			nodeSites.push({ label: node_site_name, value: newNodeId, port: Number(port) })
		}
		testLinkStatus.value = false
	}
}

export const deleteClbHttp = async (params: any) => {
	await useConfirm({
		icon: 'warning-filled',
		title: `删除负载均衡【${params.ps}】`,
		content: `即将删除负载均衡，是否继续操作？`,
	})
	await useDataHandle({
		loading: '正在删除负载均衡，请稍后...',
		request: deleteClbHttpApi({ load_id: params.load_id }),
		message: true,
		success: (res: any) => {
			nodeClbHttpRefresh.value = true
		},
	})
}

export const errSetEvent = (row?: any) => {
	httpRowData.value = row
	useDialog({
		title: '配置高级设置',
		area: [80, 60],
		btns: false,
		compData: row,
		component: () => import('./clb-set/index.vue'),
	})
}

export const removeHttpNodeEvent = (row?: any) => {
	addNodeData.value.splice(row, 1)
}

export const HttpSeetingEvent = async (params: any) => {
	try {
		const res: { status: boolean } = await useDataHandle({
			request: editHttpSeeting(params),
			message: true,
			loading: '正在设置负载均衡，请稍后...',
			success: (data: any) => {
				if (data.msg && data.status === false) Message.error(data.msg) || Message.success('设置成功')
			},
		})
		return res.status
	} catch (error) {
		console.log(error)
		return false
	} finally {
		nodeClbHttpRefresh.value = true
	}
}

export const extractStatusCodes = (log: any) => {
	const codes = []
	const regex = /http_(\d{3})/g
	let match
	while ((match = regex.exec(log)) !== null) {
		codes.push(match[1])
	}
	return codes
}

export const batchClbHttpOptions = [
	{
		label: '删除',
		value: 'delete',
		event: useBatchEventHandle,
	},
] as TableBatchOptionsProps[]

const createFilter = (queryString: string) => {
	return (restaurant: RestaurantItem) => {
		return restaurant.label.toLowerCase().indexOf(queryString.toLowerCase()) === 0
	}
}

export const createQuerySearch = (list: any[]) => {
	return (queryString: string, cb: any) => {
		const results = queryString ? list.filter(createFilter(queryString)) : list
		cb(results)
	}
}
