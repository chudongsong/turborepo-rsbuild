import { getTriggerList, removeTrigger, getTriggerLogs, testTrigger, getTaskSchedulesTypes, setTriggerStatus, setTriggerTypes, addTaskScheduleType, modifyTaskScheduleTypeName, removeTaskScheduleType } from '@/api/crontab'

import { useConfirm, useDataHandle, useDataPage, useDialog } from '@/hooks/tools'
import { getScripDataEvent, resultDialog } from '../../useController'
import { useBatchStatus } from '@/hooks/tools/table/column'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { TableBatchEventProps, TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { batchClassDialog } from '@/public'

import CRONTAB_STORE from '../../useStore'
import { scriptData } from './add-task/useController'

const crontabStore = CRONTAB_STORE()
const { logCompData } = storeToRefs(crontabStore)

export const isRefreshSchedule = ref(false) // 是否刷新任务

export const total = ref(0) // 总条数
export const tableParam = reactive<any>({
	type_id: 'all',
}) // 表格参数

export const rowData = ref<any>({}) // 表格行数据
export const classOption = ref<any>([]) // 分类数据

/**
 * @description 排序
 * @param {object} val 排序数据
 */
export const sortChange = ({ column, prop, order }: AnyObject): void => {
	tableParam.order_param = order ? prop + (order === 'ascending' ? ' asc' : ' desc') : ''
	isRefreshSchedule.value = true
}

export const productData = {
	title: '任务编排-功能介绍',
	ps: '脚本库含有：服务管理、进程监控、告警通知、负载监控、网站监控等常用脚本任务，可以实现自动化的脚本定时执行、服务器状态监控和任务追踪功能。',
	source: 212,
	desc: ['脚本定时执行', '监控服务器状态', '任务追踪'],
	tabImgs: [
		{
			title: '概览',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/crontab/crontab_trigger.png',
		},
	],
}

/**
 * @description 任务排序事件
 */
export const taskSortEvent = () => {
	useDialog({
		title: '任务排序',
		area: 42,
		component: () => import('./task-sort/index.vue'),
	})
}

/**
 * @description 获取任务列表
 */
export const getTaskList = async (params: any) => {
	const res = await useDataHandle({
		request: getTriggerList(params),
		data: { data: Array, page: useDataPage(total) },
	})
	return { data: res.data, total: res.total, other: {} }
}

/**
 * @description 获取脚本库数据
 */
const getScriptType = async () => (scriptData.value = await getScripDataEvent())

/**
 * @description 执行任务
 * @param row
 */
export const executionEvent = async ({ trigger_id, name }: any) => {
	await useConfirm({
		title: '执行脚本',
		icon: 'warning-filled',
		content: `立即执行【${name}】中的脚本任务，执行过程可能等待时间较长，请耐心等待。是否继续？`,
	})

	const { data: res }: any = await useDataHandle({
		loading: '正在执行脚本，请稍后...',
		request: testTrigger({ trigger_id }),
	})
	const msg = typeof res.msg === 'string' ? res.msg : res.msg.join('\n')
	resultDialog({ msg })
}

/**
 * @description 查看事件
 */
export const openEventView = (row: any) => {
	rowData.value = row
	useDialog({
		title: '查看事件',
		area: 66,
		component: () => import('./task-event/index.vue'),
	})
}

/**
 * @description 查看日志
 * @param row
 */
export const openLogEvent = (row: any) => {
	logCompData.value = { request: getTriggerLogs, data: { trigger_id: row.trigger_id } }
	useDialog({
		title: '执行日志',
		area: 86,
		// compData: { request: getTriggerLogs, data: { trigger_id: row.trigger_id } },
		component: () => import('@/views/crontab/public/action-logs/index.vue'),
	})
}

/**
 * @description 删除事件
 * @param row
 */
export const deleteTaskEvent = async ({ trigger_id }: any) => {
	await useConfirm({
		title: '删除任务',
		icon: 'warning-filled',
		content: `删除后不再执行任务规则,是否继续操作？`,
	})
	await useDataHandle({
		loading: '正在删除任务，请稍后...',
		request: removeTrigger({ trigger_id }),
		message: true,
		success: () => {
			isRefreshSchedule.value = true
		},
	})
}

/**
 * @description 创建任务
 */
export const openAddTaskView = async (row?: any) => {
	rowData.value = row
	await getScriptType()
	useDialog({
		title: row ? '编辑任务' : '添加任务',
		area: 65,
		component: () => import('./add-task/index.vue'),
		showFooter: true,
		// compData: { ...row, isEdit: row ? true : false, scriptData, },
	})
}

/**
 * @description 修改状态
 */
export const changeStatusEvent = async ({ trigger_id, status }: any, multType?: number) => {
	const type = status === 0 ? '停用' : '启用'
	await useConfirm({
		title: `${status === 1 ? '停用' : '启用'}任务`,
		icon: 'warning-filled',
		content: `该任务已${type}，是否要${status === 1 ? '停用' : '启用'}这个任务？`,
	})

	await useDataHandle({
		loading: '正在修改任务状态，请稍后...',
		request: setTriggerStatus({ trigger_id, status: multType ?? Number(!status) }),
		message: true,
		success: () => {
			isRefreshSchedule.value = true
		},
	})
}

/**
 * @description 获取类型
 */
const getTriggerTypes = async () => {
	await useDataHandle({
		loading: '正在获取分类，请稍后...',
		request: getTaskSchedulesTypes(),
		data: { msg: Array },
		success: (res: any) => {
			classOption.value = res.msg.map((item: any) => ({ label: item.name, value: item.id }))
			classOption.value.unshift({ label: '默认分类', value: '0' })
			classOption.value.unshift({ label: '全部分类', value: 'all' })
		},
	})
	return Promise.resolve(classOption.value || [])
}

/**
 * @description 获取分类选项
 */
export const getClassOption = {
	getClassList: getTriggerTypes,
	addClass: addTaskScheduleType,
	editClass: modifyTaskScheduleTypeName,
	deleteClass: removeTaskScheduleType,
}

/**
 * @description 批量处理事件
 * @param {TableBatchDialogProps} batchConfirm 选中处理事件
 * @param {TableBatchNextAllProps} nextAll 选中处理事件
 * @param {AnyObject[]} selectedList 选中的数据
 * @param {TableBatchOptionsProps} options 选中的配置
 * @returns {Promise<void>} void
 */
const useBatchEventHandle: TableBatchEventProps = async (batchConfirm, nextAll, selectedList, options) => {
	const { label, value } = options
	const requestHandle = async (item: any, index: number) => {
		const { trigger_id } = item
		switch (value) {
			case 'start':
			case 'stop':
				const status = value === 'start' ? 1 : 0
				return await setTriggerStatus({ trigger_id, status })
			case 'delete':
				return await removeTrigger({ trigger_id })
		}
	}
	await batchConfirm({
		title: `批量${label}`,
		content: `即将批量${label}，是否继续操作！`,
		column: [{ label: '任务名', prop: 'name' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
		onConfirm: async () => {
			await nextAll(requestHandle)
			isRefreshSchedule.value = true
			return false
		},
	})
}

export const TableBatchOptions = [
	{ label: '开启任务', value: 'start', event: useBatchEventHandle },
	{ label: '停止任务', value: 'stop', event: useBatchEventHandle },
	{
		label: '设置分类', // 提取公共方法
		value: 'setClass',
		event: async (batchConfirm, nextAll, selectedList, options, clearSelection) =>
			await batchClassDialog({
				name: '设置任务编排分类',
				options: classOption.value.filter((item: any) => item.value !== '0'),
				selectList: selectedList.value,
				request: async (data: AnyObject, close: AnyFunction) => {
					const trigger_ids = JSON.stringify(selectedList.value.map(item => item.trigger_id))
					await useDataHandle({
						loading: '正在批量设置分类，请稍后...',
						request: setTriggerTypes({ id: data.id, trigger_ids }),
						message: true,
					})
					clearSelection() // 清除选中
					close()
					isRefreshSchedule.value = true
				},
			}),
	},
	{ label: '删除任务', value: 'delete', event: useBatchEventHandle },
] as TableBatchOptionsProps[]

export const init = () => {
	getTriggerTypes()
}

export const $reset = () => {
	tableParam.p = 1
	tableParam.search = ''
	tableParam.select = 'all'
	total.value = 0
	classOption.value = []
}
