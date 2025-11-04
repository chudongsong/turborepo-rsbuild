// 该模块会被网站调用，因此单独写store
import type { ResponseResult } from '@/types'

import { Message, useDataHandle } from '@/hooks/tools'

import { delSiteScanLog, getCronTask, getDetailed, getLogAnalysis, getLogAnalysisData, getSiteLogFile, getSpeedLog, setCronTask } from '@api/logs'

import { defineStore, storeToRefs } from 'pinia'

import { getPageTotal } from '@/utils'
import { getAlarmTaskList } from '@/api/global'
import { openLogProgress } from './useController'

interface scanOptionsProps {
	status: boolean
	channel: string
	cycle: number
	path: string
	task_id: string | null
}

const LOG_ANALYSE_STORE = defineStore('LOG-ANALYSE-STORE', () => {
	const isRefreshList = ref<boolean>(false) // 是否刷新列表
	const routeData = ref({
		type: 'logs',
		name: '',
	})
	const tableData = ref([]) // 表格数据
	const scanData = ref<scanOptionsProps>({
		status: false,
		channel: '',
		cycle: 0,
		path: '',
		task_id: null,
	})

	const rowData = ref<any>({}) // 表格行数据

	const logPath = ref('') // 日志路径
	const loading = ref(false) // 表格loading

	const percentum = ref(0) // 进度百分比

	const tableParam = reactive({
		p: 1,
		row: 10,
		path: '',
	}) // 表格参数

	/**
	 * @description 获取当前网站日志路径配置
	 */
	const getLogsPath = async () => {
		try {
			const res = await useDataHandle({
				loading,
				request: getSiteLogFile({ siteName: routeData.value.name }),
				data: { log_file: String, status: Boolean, msg: String },
				success: (data: any) => {
					logPath.value = data.log_file // 查询日志路径
					tableParam.path = data.log_file
					if (!data.status) Message.error(data.msg)
				},
			})
			return { data: res.log_file, status: res.status, msg: res.msg }
		} catch (error) {
			console.log(error)
			return { data: '', status: false, msg: '获取日志路径失败' }
		}
	}

	/**
	 * @description 获取日志分析表格数据
	 */
	const getLogsTableData = async (params: any) => {
		try {
			const res = await useDataHandle({
				loading,
				request: getLogAnalysisData(params),
				data: { data: Array, page: String },
			})
			return { data: res.data, total: getPageTotal(res.page) }
		} catch (error) {
			console.log(error)
			return { data: [], total: 0, other: {} }
		}
	}

	/**
	 * @description 日志扫描事件
	 */
	const logScanEvent = async () => {
		try {
			const { status, msg }: ResponseResult = await useDataHandle({
				loading,
				request: getLogAnalysis({ path: logPath.value }),
				data: { status: Boolean, msg: String },
			})
			return { status, msg }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '扫描失败' }
		}
	}

	/**
	 * @description 开始扫描定时任务
	 */
	const startScanTimer = async (callback?: any) => {
		const progress = await openLogProgress()
		const timer = setInterval(async () => {
			const { data: res_speed } = await getSpeedLog({
				path: logPath.value,
			})
			percentum.value = res_speed.msg
			if (res_speed.msg === 100) {
				clearInterval(timer)
				progress.unmount()
				Message.success('扫描完成')
				percentum.value = 0
				isRefreshList.value = true
				callback && callback()
			}
		}, 1000)
	}

	const defaultScanData = {
		status: false,
		channel: [] as string[],
		cycle: 0,
		path: '',
	}

	const defaultMsgForm = {
		give: [] as string[],
		status: false,
		cycle: 1,
		task_id: null,
	}

	/**
	 * @description 获取扫描数据
	 */
	const getScanData = async () => {
		try {
			const { data } = await useDataHandle({
				request: getAlarmTaskList(),
				success: ({ data }: any) => {
					const item = data.data.find((item: any) => item.task_data?.site_name === routeData.value.name && item.source === 'web_log_scan' && item.template_id === '110')
					if (item) {
						Object.assign(scanData.value, {
							status: item.status,
							channel: item.sender,
							cycle: 1,
							path: item.task_data.log_path,
						})

						Object.assign(msgForm, {
							give: item.sender,
							status: item.status,
							cycle: 1,
							task_id: item.id,
						})
					} else {
						Object.assign(scanData.value, defaultScanData)
						Object.assign(msgForm, defaultMsgForm)
					}
				},
			})

			return {
				data: {
					give: scanData.value.channel,
					status: scanData.value.status,
					cycle: 1,
				},
				status: true,
				msg: '获取扫描数据成功',
			}
		} catch (error) {
			console.log(error)
			return { status: false, msg: '获取扫描数据失败' }
		}
	}

	/**
	 * @description 清空日志
	 */
	const delAllLogDataEvent = async () => {
		try {
			await useDataHandle({
				loading: '正在清空日志，请稍后...',
				request: delSiteScanLog({ path: logPath.value }),
				message: true,
			})
			return { status: true, msg: '清空日志成功' }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '清空日志失败' }
		}
	}

	// 日志详情
	const tableColumn = ref() // 表格列

	// 获取表格数据
	const getDetailData = async () => {
		try {
			const res: any = await getDetailed({
				path: '/www/wwwlogs/' + routeData.value.name + '.log',
				type: rowData.value.type,
				time: rowData.value.start_time,
			})
			return {
				data: res.data.msg || [],
				status: res.status,
				msg: '获取详情数据成功',
			}
		} catch (error) {
			console.log(error)
			return { data: [], status: false, msg: '获取详情数据失败' }
		} finally {
		}
	}

	const logScanForm = ref() // 表单ref
	const msgForm = reactive({
		give: scanData.value.channel, // 告警方式
		status: Boolean(scanData.value.status), // 自动扫描状态
		cycle: 1, // 周期
		task_id: scanData.value.task_id,
	})

	/**
	 * @description 确认
	 */
	const onConfirmScanConfig = async (params: any) => {
		try {
			await useDataHandle({
				loading: '正在设置定期扫描,请稍候...',
				request: setCronTask(params),
				data: { msg: String },
				message: true,
			})
			return { status: true, msg: '设置定期扫描成功' }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '设置定期扫描失败' }
		}
	}

	// /**
	//  * @description 获取扫描数据
	//  */
	// const getScanConfig = async (callback?: AnyFunction) => {
	// 	try {
	// 		await useDataHandle({
	// 			loading: '正在获取扫描数据,请稍候...',
	// 			request: getCronTask({
	// 				path: '/www/wwwlogs/' + routeData.value.name + '.log',
	// 			}),
	// 			success: ({ data }: any) => {
	// 				if (data.channel != '') msgForm.give = data.channel
	// 				msgForm.status = data.status == 1
	// 				msgForm.cycle = data.cycle
	// 				callback && callback()
	// 			},
	// 		})
	// 		return { data: msgForm, status: true, msg: '获取扫描数据成功' }
	// 	} catch (error) {
	// 		console.log(error)
	// 		return { status: false, msg: '获取扫描数据失败' }
	// 	}
	// }

	return {
		isRefreshList,
		routeData,
		logPath,
		msgForm,
		scanData,
		tableData,
		tableParam,
		loading,
		percentum,
		rowData,
		getLogsTableData,
		logScanEvent,
		delAllLogDataEvent,

		// 日志详情
		tableColumn,
		getDetailData,

		// 日志分析表单
		logScanForm,
		// getScanConfig,
		onConfirmScanConfig,

		getLogsPath,
		getScanData,
		startScanTimer,
	}
})

const useLogAnalyseStore = () => {
	return storeToRefs(LOG_ANALYSE_STORE())
}

export { LOG_ANALYSE_STORE, useLogAnalyseStore }
