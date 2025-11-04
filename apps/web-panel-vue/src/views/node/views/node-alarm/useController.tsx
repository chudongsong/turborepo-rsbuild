import { TableBatchDialogProps, TableBatchEventProps, TableBatchNextAllProps, TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { useBatchStatus } from '@/hooks/tools/table/column'
import { useDialog, useConfirm, Message, useDataHandle } from '@/hooks/tools'
import { useTableCategory } from '@/hooks/business'
import { batchDelHttpClb, getClbList, delTaskStatus, setTaskStatus, getTcpUdpClbList } from '@/api/node'
import { useNodeAlarmStore } from './useStore'

const { alarmRowData, isAlarmEdit, nodeAlarmRefresh } = useNodeAlarmStore()

/**
 * @description 批量处理事件
 * @param {TableBatchDialogProps} batchConfirm 选中处理事件
 * @param {TableBatchNextAllProps} nextAll 选中处理事件
 * @param {Ref<FtpTableRowProps[]>} selectList 选中的数据
 * @param {TableBatchOptionsProps} options 选中的配置
 * @returns {Promise<void>} void
 */

const useBatchEventHandle: TableBatchEventProps = async (batchConfirm, nextAll, selectList, options: TableBatchOptionsProps): Promise<void> => {
	const requestHandle = async (item: any, index: number) => {
		const { id: task_id, status } = item
		const requestList = new Map<string, AnyFunction>([
			['delete', delTaskStatus],
			['start', setTaskStatus],
			['stop', setTaskStatus],
		])
		const fn = requestList.get(value)
		switch (value) {
			case 'start':
				if (fn) return await fn({ task_id, status: 1 })
				break
			case 'stop':
				if (fn) return await fn({ task_id, status: 0 })
				break
			case 'delete':
				if (fn) return await fn({ task_id })
				break
		}
	}
	const { label, value } = options
	await batchConfirm({
		title: `批量${label}告警`,
		content: `即将批量${label}告警，是否继续操作?`,
		column: [{ label: '告警名称', prop: 'title' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
		onConfirm: async () => {
			await nextAll(requestHandle)
			nodeAlarmRefresh.value = true
			return false
		},
	})
}

export const alarmRenderForm = () => {
	try {
		let alarmType = 'clb'
		if (isAlarmEdit.value) {
			alarmType = ['222', '223'].includes(alarmRowData.value?.task_data?.tid) ? 'master' : 'clb'
		}
		let form = {
			alarmType,
			lcbType: 0,
			sendTimes: alarmRowData.value?.number_rule?.day_num || 3,
			failTimes: alarmRowData.value?.task_data?.err_num || 3,
			successCode: alarmRowData.value?.task_data?.codes || '200,301,302,403,404',
			name: isAlarmEdit.value ? alarmRowData.value?.task_data?.project : '',
			type: alarmRowData.value?.sender || [],
			masterType: alarmRowData.value?.template_id || '222',
		}
		return form
	} catch (error) {
		console.log(error)
		return {}
	}
}

export const delClbAlarm = async (params: any) => {
	try {
		// 弹出确认框
		await useConfirm({
			icon: 'warning-filled',
			title: '删除告警任务',
			content: '删除后将不再告警此条任务，是否继续？',
		})

		await useDataHandle({
			loading: '正在删除告警任务，请稍候...',
			request: delTaskStatus({ task_id: params.id }),
			message: true,
			success: () => {
				nodeAlarmRefresh.value = true
			},
		})
	} catch (err) {
		console.warn(err)
	}
}

export const editAlarmEvent = async (row?: any) => {
	alarmRowData.value = row || {}
	isAlarmEdit.value = !!row
	const loading = Message.load('正在加载数据，请稍后...')
	const {
		data: { data: res },
	} = await getClbList({ page: 1, page_size: 100 })
	const {
		data: { data: res2 },
	} = await getTcpUdpClbList({ page: 1, page_size: 100 })
	loading.close()
	if (!row) {
		alarmRowData.value = {
			clbList: [],
			tcpList: [],
		}
	}
	alarmRowData.value.clbList = res.map((item: any) => ({ label: item.ps, value: item.load_id }))
	alarmRowData.value.tcpList = res2.map((item: any) => ({ label: item.ps, value: item.load_id }))
	useDialog({
		isAsync: true,
		title: `${row ? '修改' : '添加'}告警`,
		area: 48,
		btn: true,
		component: () => import('./add-alam/index.vue'),
	})
}

export const onChangeStatus = async (row: any) => {
	try {
		await useConfirm({
			title: `${row.status ? '禁用' : '启用'}【${row.title}】任务`,
			content: `您真的要${row.status ? '禁用' : '启用'}【${row.title}】这个任务吗？`,
		})
		await useDataHandle({
			loading: '正在修改告警任务状态，请稍候...',
			request: setTaskStatus({ task_id: row.id, status: Number(!row.status) }),
			message: true,
			success: () => {
				nodeAlarmRefresh.value = true
			},
		})
	} catch (error) {
		console.log(error)
	}
}

export const batchClbHttpOptions = [
	{ label: '启动', value: 'start', event: useBatchEventHandle },
	{ label: '停止', value: 'stop', event: useBatchEventHandle },
	{ label: '删除', value: 'delete', event: useBatchEventHandle },
] as TableBatchOptionsProps[]

/**
 * @description 获取告警参数
 * @param {any} formVal 表单数据
 * @returns {any} 告警参数
 */
export const getAlarmParams = (formVal: any) => {
	const { alarmType, lcbType, sendTimes, failTimes, successCode, name, type, masterType } = formVal

	// 通用配置
	const commonConfig = {
		sender: type,
		number_rule: {
			day_num: Number(sendTimes),
			total: 2,
		},
		time_rule: {
			send_interval: 0,
			time_range: [0, 86399],
		},
	}

	// 通用任务数据
	const baseTaskData = {
		status: true,
		count: 0,
		interval: 600,
	}

	switch (true) {
		case alarmType === 'clb' && lcbType === 0:
			// 负载均衡-HTTP
			return {
				template_id: '220',
				task_data: JSON.stringify({
					...commonConfig,
					task_data: {
						...baseTaskData,
						tid: '220',
						type: 'nodes_nginx_http_load_push',
						title: '节点管理-负载均衡',
						project: name,
						codes: successCode,
					},
				}),
			}
		case alarmType === 'clb' && lcbType === 1:
			// 负载均衡-TCP/UDP
			return {
				template_id: '221',
				task_data: JSON.stringify({
					...commonConfig,
					task_data: {
						...baseTaskData,
						tid: '221',
						type: 'nodes_nginx_tcp_load_push',
						title: '节点管理-tcp负载均衡',
						project: name,
						err_num: failTimes,
					},
				}),
			}
		case alarmType === 'master':
			// 主从复制
			return {
				template_id: masterType,
				task_data: JSON.stringify({
					...commonConfig,
					task_data: {
						...baseTaskData,
						tid: masterType === 'mysql' ? '222' : '223',
						type: masterType === 'mysql' ? 'nodes_mysql_slave_err_push' : 'nodes_redis_slave_err_push',
						title: masterType === 'mysql' ? '节点管理-Mysql主从告警' : '节点管理-Redis主从告警',
						project: '',
					},
				}),
			}
		default:
			return null
	}
}
