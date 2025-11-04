import type { TableColumnProps } from '@/components/data/bt-table/types'
import type { TableBatchDialogProps, TableBatchEventProps, TableBatchNextAllProps, TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import type { SelectOptionProps } from '@/components/form/bt-select/types'
import type { NodeTableRowProps } from './types'

import { addNode, editNode, deleteNode as deleteNodeApi, getNodeClassList, setNodeBatchClass, batchDelNode, nodeList, getPanelUrl, getNodeStatus, restartNode as restartNodeApi, bindApp, verifyApp } from '@/api/node'
import { useRequestCanceler } from '@hooks/tools/axios/model/axios-cancel' // 取消请求
import { useConfirm, useDataHandle, useMessage, useDialog } from '@/hooks/tools'
import { getPageTotal } from '@/utils'
import { assembBatchParams, assembBatchResults, batchClassDialog } from '@/public'
import { useBatchStatus } from '@/hooks/tools/table/column'
import { useNodeStore } from './useStore'

type CallbackProps = (data?: any) => void

export const isSearchClick = ref(false) // 是否从搜索推荐点击

/**
 * @description 添加编辑FTP
 * @param params 接口参数
 * @param ref 表单ref
 * @param isEdit 是否编辑状态
 * @param callback 回调函数
 */
export const addAndEditNode = async (param: any, isEdit: boolean, callback?: CallbackProps) => {
	try {
		const res: any = await useDataHandle({
			loading: `正在${!isEdit ? '添加' : '修改'}节点，请稍后...`,
			request: isEdit ? editNode(param) : addNode(param),
			data: { status: Boolean },
			message: true,
			success: (res: any) => {
				nodeStatus.value = []
				isRefreshNodeList.value = true // 刷新列表
				callback && callback(res) // 回调函数
			},
		})
		return res.status
	} catch (error) {
		console.log(error)
		return false
	}
}

const { isRefreshNodeList, rowData, nodeCategory, nodeStatus, forcedFlushes } = useNodeStore()

/********** 节点公共业务 **********/

/**
 * @description 获取节点状态
 * @param row 节点数据
 * @returns 节点状态
 */

export const useNodeState = (params: any) => {
	return {
		label: '状态',
		isCustom: true,
		render: (row: any) => {
			const status_txt = ['在线', '', '离线', '异常', '重启中...']
			return <span class={'node_state state_' + row.data.status}>{status_txt[row.data.status]}</span>
		},
	}
}

/********** 节点列表业务 **********/

// 缓存对象结构：键是序列化的请求参数，值包含响应数据和时间戳
let cache: { [key: string]: { data: any; timestamp: number } } = {}

/**
 * @description 获取节点列表（带请求防抖缓存机制）
 * @param params 请求参数
 * @returns 当快速重复请求时，返回最近100ms内的缓存结果防止空数据
 */
export const getNodeList = async (params: any) => {
	if (!params.category_id && params.category_id !== 0) {
		delete params.category_id
	}
	// 生成唯一缓存键（将请求参数序列化为字符串）
	const cacheKey = JSON.stringify(params)
	const now = Date.now()

	try {
		// 发起实际网络请求
		const {
			data: { data, page, error },
		} = await nodeList({ ...params })
		// 更新缓存：存储响应数据和时间戳
		cache[cacheKey] = {
			data: {
				data,
				total: getPageTotal(page),
				other: { error },
			},
			timestamp: now,
		}
		return cache[cacheKey].data
	} catch (error) {
		// 处理请求被取消的情况
		if ((error as Error).message === 'canceled' && cache[cacheKey] && now - cache[cacheKey].timestamp < 100) {
			return cache[cacheKey].data
		}
		return { data: [], total: 0 }
	} finally {
		delete params.refresh
		forcedFlushes.value = 0
	}
}

/**
 * @description 获取节点详情
 * @param {NodeTableRowProps} row 数据
 */

export const getNodeDetail = async (row?: any) => {
	useDataHandle({
		request: getPanelUrl({ node_id: row.id }),
		// request: getPanelUrl({ address: row.address, api_key: row.api_key }),
		loading: '正在前往访问节点，请稍后...',
		success: (res: any) => {
			if (res.data.status) {
				window.open(`${res.data.data.target_panel_url}`, '_blank')
			}
		},
	})
}

/**
 * @description 删除节点
 * @param params 参数
 * @param callback 回调函数
 */
export const deleteNode = async (params: any) => {
	try {
		// 弹出确认框
		await useConfirm({
			icon: 'warning-filled',
			title: `删除节点【${params.address}】`,
			content: `删除节点后，将失去该节点的访问权限，是否继续操作？`,
		})

		// 数据处理
		await useDataHandle({
			loading: '正在删除节点，请稍后...',
			request: deleteNodeApi({ ids: params.id }), //{ id, name }
			message: true,
			success: (res: any) => {
				nodeStatus.value = []
				isRefreshNodeList.value = true
			},
		})
	} catch (err) {
		console.warn(err)
	}
}

/**
 * @description 获取分类列表
 * @returns
 */
export const getClassList = async (): Promise<Array<any>> => {
	try {
		let classList: SelectOptionProps[] = []
		await useDataHandle({
			request: getNodeClassList(),
			data: { msg: Array },
			success: ({ msg: data }: { msg: { name: string; id: number }[] }) => {
				classList = [
					{ label: '全部分类', value: 'all' },
					{ label: '默认分类', value: '0' },
					...data.map((item: AnyObject) => {
						return {
							label: item.name,
							value: String(item.id),
						}
					}),
				]
				nodeCategory.value = classList
			},
		})
		return classList || []
	} catch (error) {
		console.log(error)
		return []
	}
}

/**
 * @description 批量设置节点
 * @param param0
 * @param callback
 */

export const setBatchClass = async (selectedList: Ref<NodeTableRowProps[]>, clearSelection: AnyFunction, classList: Ref<SelectOptionProps[]>, config: any) => {
	await batchClassDialog({
		name: '节点分类',
		options: classList.value.filter(item => item.value !== 'all'),
		selectList: selectedList.value,
		request: async (data: AnyObject, close: AnyFunction) => {
			const setIdsList = selectedList.value.map(item => item.id)
			const { enable, exclude } = config
			const params = assembBatchParams(selectedList.value, exclude, enable, { params: { category_id: Number(data.id), ids: JSON.stringify(setIdsList) } })
			await useDataHandle({
				loading: '正在批量设置节点分类，请稍后...',
				request: setNodeBatchClass(params),
				message: true,
			})
			clearSelection() // 清除选中
			nodeStatus.value = []
			isRefreshNodeList.value = true
			close()
		},
	})
}

/**
 * @description 批量处理事件
 * @param {TableBatchDialogProps} batchConfirm 选中处理事件
 * @param {TableBatchNextAllProps} nextAll 选中处理事件
 * @param {Ref<NodeTableRowProps[]>} selectList 选中的数据
 * @param {TableBatchOptionsProps} options 选中的配置
 * @returns {Promise<void>} void
 */

export const useBatchEventHandle: TableBatchEventProps = async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps, selectList: Ref<NodeTableRowProps[]>, options: TableBatchOptionsProps, clear, config): Promise<void> => {
	const { label, value } = options
	const { enable, exclude } = config as any // 获取配置
	const template: Map<string, string> = new Map([
		['delete', '批量删除已选的节点，删除后将失去该节点的访问和操作权限'],
		['panel', '批量重启已选的节点面板'],
		['server', '批量重启已选的节点服务器'],
	])
	const requestHandle = async () => {
		const requestList: Map<string, AnyFunction> = new Map([['delete', batchDelNode]])
		const fn = requestList.get(value)
		switch (value) {
			case 'start':
			case 'stop':
				const status = value === 'start' ? 1 : 0
				const params = assembBatchParams(selectList.value, exclude, enable, { params: { status } })
				if (fn) return await fn(params)
				break
			case 'delete':
				const delParams = assembBatchParams(selectList.value, exclude, enable, { params: { ids: JSON.stringify(selectList.value.map(item => item.id)) } })
				if (fn) return await fn(delParams)
				break
		}
	}
	const restartRequest = async (item: any, type: 'panel' | 'server') => {
		const { id } = item
		return await restartNodeApi(id, type)
	}
	if (value === 'panel' || value === 'server') {
		for (const item of selectList.value) {
			if (item.api_key === 'local' && item.app_key === 'local') {
				useMessage().error('本机节点无法操作')
				return
			}
		}
	}
	await batchConfirm({
		title: `批量${label}`,
		content: `${template.get(value) as string}，是否继续操作！`,
		column: [{ label: '地址', prop: 'address' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
		onConfirm: async () => {
			if (value === 'panel' || value === 'server') {
				await nextAll((item: any) => restartRequest(item, value))
				isRefreshNodeList.value = true
				return
			}
			const res = await requestHandle()
			// 执行完毕的代码，刷新列表
			nodeStatus.value = []
			isRefreshNodeList.value = true
			const { data, msg } = assembBatchResults(res.data)
			clear && clear()
			if (res?.status || res?.data?.status) {
				useMessage().success(msg || '操作成功！')
			} else {
				useMessage().error(msg || '操作失败，请重试')
			}
		},
	})
}

/**
 * @description 获取节点CPU/内存
 * @returns
 */

export const useNodeCpuMemory = () => {
	return {
		isCustom: true,
		label: 'CPU/内存',
		render: (row: any) => {
			if (row?.data?.status == 4) return '--'
			return row?.data?.status == 2 ? '-- / --' : `${row.data.cpu_usage}核 (${row.data.cpu}%) / ${row.data.memNewTotal} (${row.data.memory}%)`
		},
	}
}

/**
 * @description 卸载
 */
export const useOnUnmounted = () => {
	// 清空缓存
	cache = {}
	// 取消初始化请求
	useRequestCanceler(['/mod/node/node/get_category_list', '/panel/public/get_soft_status', '/mod/node/node/get_node_list'])
}

/**
 * @description 重启节点
 * @param row 节点数据
 * @param type 类型
 */
export const restartNode = async (row: any, type: 'panel' | 'server') => {
	await useConfirm({
		icon: 'warning-filled',
		title: `重启${type === 'panel' ? '面板' : '服务器'}`,
		content: `即将重启节点【${row.remarks}】${type === 'panel' ? '面板' : '服务器'}，是否继续操作？`,
	})
	await useDataHandle({
		request: restartNodeApi(row.id, type),
		loading: `正在重启${type === 'panel' ? '面板' : '服务器'}，请稍后...`,
		message: true,
		success: () => {
			isRefreshNodeList.value = true // 刷新列表
		},
	})
}
let pollingTimer: ReturnType<typeof setTimeout> | null = null

/**
 * @description 绑定app插件
 * @param params 参数
 */
export const bindAppPlugin = async (params: any, callback?: CallbackProps) => {
	const res: any = await useDataHandle({
		request: bindApp(params),
	})
	if (res.data.status) {
		// 每隔2秒轮询verifyAppPlugin，status为true时停止，并提供手动终止方法
		let isPollingStopped = false

		const stopPolling = () => {
			isPollingStopped = true
			if (pollingTimer) {
				clearTimeout(pollingTimer)
				pollingTimer = null
			}
		}

		const pollVerify = async () => {
			if (isPollingStopped) return
			await verifyAppPlugin(params, (verifyRes: any) => {
				if (verifyRes && verifyRes.status) {
					stopPolling()
					callback && callback(verifyRes)
				} else if (!isPollingStopped) {
					pollingTimer = setTimeout(pollVerify, 2000)
				}
			})
		}

		// 启动轮询
		isPollingStopped = false
		pollVerify()

		// 返回手动终止方法
		return stopPolling
	} else {
		useMessage().error(res.data.msg)
		return false
	}
}

/**
 * @description 验证app插件
 * @param params 参数
 */
export const verifyAppPlugin = async (params: any, callback?: CallbackProps) => {
	const res: any = await useDataHandle({
		request: verifyApp(params),
	})
	callback && callback(res.data)
}
