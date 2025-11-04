import {
	addCrontabType,
	cancelTaskTopList,
	crontabDelCrontab,
	deleteCrontab,
	exportCrontabToJson,
	getCrontabListApi,
	getCrontabService,
	getCrontabTypes,
	getLocalBackupPath,
	getTaskTopList,
	modifyCrontabTypeName,
	removeCrontabType,
	setAllStatus,
	setCrontabTypes,
	setStatus,
	startTask,
} from '@/api/crontab'
import { Message, useConfirm, useDataHandle, useDialog } from '@/hooks/tools'
import { openPathEvent } from '@/hooks/tools/table/event'
import { getPageTotal, isString } from '@/utils'
import CRONTAB_TASK_STORE from './useStore'
import { TableBatchEventProps, TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { useBatchStatus, useCheckbox, useOperate, useStatus, useTopMove } from '@/hooks/tools/table/column'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { batchClassDialog } from '@/public'
import { useSocket as createSocket } from '@/hooks/tools/socket'
import { CrontabDataProps } from '../../types'
import { cloudServiceMapping, openResultView } from '../../useController'

const crontabTaskStore = CRONTAB_TASK_STORE()
const { rowData } = storeToRefs(crontabTaskStore)

export const ws = createSocket({ route: '/ws_panel' }) // 设置全局socket

export const fileRef = ref() // 文件上传ref
export const crontabRef = ref<any>() // 表格 ref
export const tableData = ref([]) // 表格数据
export const tableLoading = ref(false) // 表格loading
export const tableTotal = ref(0) // 表格总数
export const tableParam = reactive({
	p: 1,
	count: 20,
	search: '',
	type_id: 'all',
	order_param: '',
}) // 表格参数
export const classOption = ref<any>([]) // 分类数据
export const serviceStatus = ref(true) // 服务状态
export const repairDialog = ref(false) // 日志弹窗
export const repairContent = ref('') // 日志内容

/**
 * @description 打开本地文件
 */
export const openLocalFile = () => fileRef.value.open()

// 特殊提示展示
export const isShowTip = computed(() => {
	const { save, sType } = rowData.value
	const arr = ['enterpriseBackup', 'logs', 'special_log', 'toShell']
	return !arr.includes(sType) && !(!save && isString(save))
})

/**
 * @description 批量处理事件
 * @param {TableBatchDialogProps} batchConfirm 选中处理事件
 * @param {TableBatchNextAllProps} nextAll 选中处理事件
 * @param {Ref<FtpTableRowProps[]>} selectList 选中的数据
 * @param {TableBatchOptionsProps} options 选中的配置
 * @returns {Promise<void>} void
 */
const useBatchEventHandle: TableBatchEventProps = async (batchConfirm, nextAll, selectList, options, clearSelection) => {
	const { label, value } = options
	const labelStr = label.replace('任务', '')

	const requestHandle = async (item: any, index: number) => {
		const requestList: Map<string, AnyFunction> = new Map([
			['exec', startTask],
			['delete', deleteCrontab],
		])
		const { id } = item
		switch (value) {
			case 'exec':
			case 'delete':
				const fn = requestList.get(value)
				if (fn) return await fn({ id })
		}
	}

	const useChangeStatus = async (instance: any, list: any) => {
		const id_list: string = JSON.stringify(list.map((item: any) => item.id))
		instance.unmount() // 关闭弹窗
		clearSelection() // 清除选择
		await useDataHandle({
			loading: '正在执行，请稍后...',
			request: setAllStatus({ id_list, type: value, if_stop: 'False' }),
			success: (res: any) => {
				const list = res.data.map((item: any) => {
					// 测试数据
					const field = Object.entries(item)[0]
					return { msg: item.status ? labelStr + '成功' : field[1], name: field[0], status: item.status }
					// 修复后数据
					// const field = Object.keys(item)[0]
					// return { status: item.status, name: field }
				})
				openResultView(list, { title: `${labelStr}计划任务` })
			},
		})
	}

	/**
	 * @description 批量导出
	 */
	const useOut = async (instance: any, list: any) => {
		const ids: string = JSON.stringify(list.map((item: any) => item.id))
		instance.unmount() // 关闭弹窗
		clearSelection() // 清除选择
		await useDataHandle({
			loading: '正在执行，请稍后...',
			request: exportCrontabToJson({ ids }),
			success: (res: any) => {
				window.open('/download?filename=' + res.msg.replace('导出成功!,下载路径为', ''), '_blank', 'noopener,noreferrer')
			},
		})
	}

	await batchConfirm({
		title: `批量${labelStr}计划任务`,
		content: `即将批量${labelStr}选中的计划任务，是否继续操作?`,
		column: [{ label: '计划任务', prop: 'rname' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
		onConfirm: async (instance: any) => {
			switch (value) {
				case 'start':
				case 'stop':
					await useChangeStatus(instance, selectList.value)
					break
				case 'delete':
				case 'exec':
					await nextAll(requestHandle)
					break
				case 'out':
					await useOut(instance, selectList.value)
					break
			}
			getCrontabList() // 执行完毕的代码，刷新列表
			return false
		},
	})
}

/**
 * @description  批量处理配置
 * @returns {TableBatchOptionsProps[]} 配置列表
 */
const batchOptions = (): TableBatchOptionsProps[] => {
	return [
		{ label: '执行任务', value: 'exec', event: useBatchEventHandle },
		{ label: '启动任务', value: 'start', event: useBatchEventHandle },
		{ label: '停止任务', value: 'stop', event: useBatchEventHandle },
		{
			label: '设置分类',
			value: 'setClass',
			event: async (batchConfirm, nextAll, selectedList, options, clearSelection) => {
				await batchClassDialog({
					name: '计划任务分类',
					options: classOption.value.filter((item: any) => item.value !== 'all' && item.value > 0),
					selectList: selectedList.value,
					request: async (data: AnyObject, close: AnyFunction) => {
						const crontab_ids = JSON.stringify(selectedList.value.map(item => item.id))
						await useDataHandle({
							loading: '正在批量设置分类，请稍后...',
							request: setCrontabTypes({ id: data.id, crontab_ids }),
							message: true,
						})
						clearSelection() // 清除选中
						close()
						getCrontabList()
					},
				})
			},
		},
		{ label: '导出任务', value: 'out', event: useBatchEventHandle },
		{ label: '删除任务', value: 'delete', event: useBatchEventHandle },
	]
}

export const TableBatchOptions = batchOptions()

/**
 * @description 打开目录
 */
export const openPath = async (close?: any) => {
	try {
		const { data } = await getLocalBackupPath({ id: rowData.value.id })
		if (data.status) {
			openPathEvent({ path: data.msg }) // 打开目录
			close && close()
		} else Message.request(data)
	} catch (error) {}
}

/**
 * @description 排序
 * @param {object} val 排序数据
 */
export const sortChange = ({ column, prop, order }: AnyObject): void => {
	tableParam.order_param = order ? prop + (order === 'ascending' ? ' asc' : ' desc') : ''
	console.log(tableParam.order_param, '23423')
	getCrontabList()
}

/**
 * @description 获取计划任务列表
 */
export const getCrontabList = async () => {
	try {
		const params = { ...tableParam }
		if (tableParam.type_id === 'all') params.type_id = ''
		await useDataHandle({
			loading: tableLoading,
			request: getCrontabListApi(params),
			data: { data: [Array, tableData], page: Object },
			success: (res: any) => {
				tableTotal.value = getPageTotal(res.page)
			},
		})
	} catch (error) {
		console.log(error)
	} finally {
		tableLoading.value = false
	}
}

/**
 * @description 获取服务状态
 */
export const getCrontabServiceEvent = async () => {
	try {
		const res = await getCrontabService()
		serviceStatus.value = Boolean(res.status)
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description: 执行任务
 * @return {void}
 */
export const startTaskEvent = async (row: any, isLog: boolean = false) => {
	let params: any = {}
	if (!isLog) params = { id: row.id }
	else params = { id: rowData.value.id }
	try {
		const res = await startTask(params)
		Message.request(res)
		if (!isLog) openLogEvent(row)
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 打开日志
 */
const openLogEvent = (row: any) => {
	rowData.value = row
	useDialog({
		title: '查看【' + (row.rname || row.name) + '】日志',
		area: 80,
		component: () => import('./task-log/index.vue'),
	})
}

/**
 * @description 置顶
 * @param row 行数据
 * @param type 置顶类型 top：置顶 untop：取消置顶
 */
const changeTaskTopEvent = async (row: any, type: string) => {
	try {
		let res: any
		if (type == 'top') {
			res = await getTaskTopList({ task_id: row.id }) // 置顶
		} else if (type == 'untop') {
			res = await cancelTaskTopList({ task_id: row.id }) // 取消置顶
		}
		Message.request(res)
		getCrontabList()
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 改变状态
 * @param row 行数据
 * @param isMult 是否是批量
 */
const changeStatusEvent = async (row: any) => {
	let load: any
	try {
		const type = !row.status // true: 启用 false: 停用
		await useConfirm({
			title: `${type ? '启用' : '停用'}计划任务`,
			content: `该计划任务${type ? '已停止' : '正在运行'}，是否要${type ? '启用' : '停用'}这个计划任务？`,
		})
		await useDataHandle({
			loading: '正在设置计划任务状态，请稍候...',
			request: setStatus({ id: Number.parseInt(row.id), if_stop: type ? 'False' : 'True' }),
			message: true,
		})
		getCrontabList()
	} catch (error) {
		console.log(error)
	} finally {
		load && load.close()
	}
}

/**
 * @description 选择数据保存
 * @param row 行数据
 */
const selectDataSaveEvent = (row: any) => {
	rowData.value = row
	useDialog({
		title: `${row.name}-备份文件`,
		area: 80,
		component: () => import('./back-detail/index.vue'),
	})
}

/**
 * @description 添加任务
 */
export const addTaskEvent = (row?: any) => {
	rowData.value = row || false
	useDialog({
		title: `${row ? (row?.id ? '编辑' : '复制') : '添加'}计划任务`,
		area: 100,
		showFooter: true,
		component: () => import('./task-form/index.vue'),
	})
}

/**
 * @description 获取分类
 */
const getTaskTypes = async () => {
	await useDataHandle({
		request: getCrontabTypes(),
		data: { msg: Array },
		success: (res: any) => {
			classOption.value = [
				...[
					{ label: '全部分类', value: 'all' },
					{ label: '系统任务', value: '-1' },
					{ label: '默认分类', value: '0' },
					{ label: '正在运行', value: '-2' },
					{ label: '已停止', value: '-3' },
				],
				...res.msg.map((item: any) => ({
					label: item.name,
					value: item.id.toString(),
				})),
			]
		},
	})
	return Promise.resolve(classOption.value || [])
}

/**
 * @description 获取分类选项
 */
export const getClassOption = {
	getClassList: getTaskTypes,
	addClass: addCrontabType,
	editClass: modifyCrontabTypeName,
	deleteClass: removeCrontabType,
}

/**
 * @description 删除数据
 * @param id 数据id
 * @param name 数据名称
 * @param isMult 是否是批量
 */
const deleteDataEvent = async ({ id, name }: any) => {
	try {
		await useConfirm({
			title: '删除计划任务',
			content: `您确定要删除计划任务【${name}】，是否继续？`,
		})
		await useDataHandle({
			loading: '正在删除计划任务，请稍候...',
			request: crontabDelCrontab({ id }),
			message: true,
		})
		getCrontabList()
	} catch (error) {
		console.log(error)
	}
}

export const tableColumns = ref([
	useCheckbox({ key: 'id' }),
	useTopMove({
		event: (row: any, type: string) => {
			changeTaskTopEvent(row, type)
		},
		param: 'sort',
	}),
	{
		label: '任务名称',
		prop: 'name',
		minWidth: 250,
		sortable: 'custom',
		showOverflowTooltip: true,
		render: (row: any) => row.rname || row.name,
	},
	{ label: '分类', prop: 'type_name', isCustom: true },
	useStatus({
		event: changeStatusEvent,
		sortable: 'custom',
		data: ['停用', '正常'],
	}),
	{ label: '执行周期', prop: 'cycle', minWidth: 150, isCustom: true, showOverflowTooltip: true },
	{
		label: '保存数量',
		isCustom: true,
		render: (row: CrontabDataProps) => {
			const backArr = ['site', 'database', 'enterpriseBack', 'path', 'mysql_increment_backup']
			if (backArr.includes(row.sType) && row.save) {
				return (
					<span>
						{row.save}份
						<span class="bt-link" onClick={() => selectDataSaveEvent(row)}>
							[查看]
						</span>
					</span>
				)
			} else if (row.sType === 'logs' || row.sType === 'special_log') {
				return `${!row.save ? '--' : row.save + '份'}`
			} else {
				return '--'
			}
		},
	},
	{
		label: '备份到',
		minWidth: 160,
		isCustom: true,
		render: (row: CrontabDataProps) => {
			if (row.sType === 'mysql_increment_backup' || row.sType === 'enterpriseBackup') {
				const data = row.backupTo.split('|')
				let str = '' // 循环data，获取每个值对应的中文名称
				data.forEach((item: any) => (str += cloudServiceMapping[item] + ','))
				return str.slice(0, -1)
			}
			// 使用接口返回的备份到数据
			const name = cloudServiceMapping[row.backupTo]
			return row.sType === 'toShell' ? '--' : name || '--'
		},
	},
	{
		label: '备份路径',
		prop: 'db_backup_path',
		width: 100,
		isCustom: true,
		showOverflowTooltip: true,
		render: (row: any) => {
			const back_table = ['site', 'database', 'path']
			if (back_table.includes(row.sType)) {
				return (
					<span class="bt-link" onClick={() => openPathEvent({ path: row.db_backup_path })}>
						{row.db_backup_path}
					</span>
				)
			}
			return '--'
		},
	},
	{
		label: '上次执行时间',
		prop: 'addtime',
		minWidth: 150,
		sortable: 'custom',
		isCustom: true,
	},
	{
		label: '上次定时任务执行结果',
		prop: 'result',
		isCustom: false,
		minWidth: 160,
		sortable: 'custom',
		render: (row: any) => <span class={row.result ? 'text-primary' : 'text-danger'}>{row.result ? '正常' : '异常'}</span>,
	},
	useOperate([
		{ onClick: (row: any) => startTaskEvent(row), title: '执行' },
		{ onClick: addTaskEvent, title: '编辑' },
		{ onClick: openLogEvent, title: '日志' },
		{ onClick: (row: any) => addTaskEvent({ ...row, id: '' }), title: '复制' },
		{ onClick: deleteDataEvent, title: '删除' },
	]),
])

/**
 * @description 修复计划任务
 */
export const repairCrontabService = async () => {
	await useConfirm({
		title: '一键修复',
		content: '此修复主要用于解决计划任务无法定时执行，请谨慎操作,是否继续?',
	})
	repairDialog.value = true
	let logsData: any = []
	repairContent.value = '开始修复计划任务...'
	ws.request('/crontab/repair_crontab_service', {
		customType: 'model',
		onMessage: (data: any) => {
			if (!data.includes('修复完成')) {
				logsData.push(data)
				repairContent.value = logsData.join('\n')
			} else {
				Message.success('修复成功')
				getCrontabServiceEvent()
				repairDialog.value = false
			}
		},
	})
}

/**
 * @description 导出数据
 */
export const exportData = async () => {
	// 若没有数据，不允许导出
	if (tableData.value.length === 0) {
		Message.error('暂无数据可导出')
		return
	}
	try {
		const res = await exportCrontabToJson()
		window.open('/download?filename=' + res.msg.replace('导出成功!,下载路径为', ''), '_blank', 'noopener,noreferrer')
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 日志切割
 */
export const logSplitDialog = () => {
	useDialog({
		title: '日志切割设置',
		area: 56,
		component: () => import('./log-split/index.vue'),
	})
}

export const init = () => {
	getCrontabList() // 获取列表
	getTaskTypes() // 获取分类
	getCrontabServiceEvent() // 获取服务
}
