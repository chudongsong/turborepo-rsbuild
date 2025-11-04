import type { CrontabParams } from '@/types/logs'
import type { ResponseResult } from '@/utils/axios/types'

import { defineStore, storeToRefs } from 'pinia'

import { clearLoginLogs, clearOperateLogs, clearRunLog, clearShellLogs, exportLoginLog, exportPanelLog, exportShellLogs, getCrontabLogsData, getDataInfo, getIPGeolocation, getLoginInfo, getRunLog } from '@api/logs'

import { getPageTotal } from '@/utils'

import { Message, useDataHandle } from '@/hooks/tools'
import { LOG_STORE } from '@/views/logs/useStore'

interface IpRow {
	ip: string
	info: string
	operation_num: number
}

const LOG_PANEL_STORE = defineStore('LOG-PANEL-STORE', () => {
	const logsStore = LOG_STORE()
	const { outDataForm, searchValue } = storeToRefs(logsStore)
	const isRefreshList = ref(false) // 是否刷新列表
	// 面板日志-------操作日志
	const logType = ref<string>('全部') // 操作日志 - 日志类型

	// 面板日志-------运行日志
	const logMsg = ref('') // 日志详细数据
	const size = ref<number>(0) // 日志大小
	const search = ref('') // 搜索关键字

	/**
	 * @description 导出日志
	 */
	const outWebSiteEvent = async (search: string = '') => {
		try {
			const res = await useDataHandle({
				loading: '正在导出日志，请稍后...',
				request: exportPanelLog({ search }),
			})
			// window.open('/download?filename=' + res.data.output_file);
			return { data: res.data, status: true }
		} catch (error) {
			console.log(error)
			return { data: {}, status: false, msg: '导出错误' }
		}
	}

	/**
	 * @description 获取日志数据
	 */
	const getLogsInfoEvent = async (params: any) => {
		try {
			const res = await useDataHandle({
				// loading: '正在获取日志数据，请稍后...',
				request: getDataInfo(params),
				data: { data: Array, page: String },
			})
			return { data: res.data, total: getPageTotal(res.page), other: {} }
		} catch (error) {
			console.log(error)
			return { data: [], total: 0, other: {} }
		}
	}

	/**
	 * @description 清空日志
	 */
	const clearOpLogsEvent = async () => {
		try {
			await useDataHandle({
				loading: '正在清空面板操作日志，请稍后...',
				request: clearOperateLogs(),
				message: true,
			})
			return { msg: '清空日志成功', status: true }
		} catch (error) {
			console.log(error)
			Message.error('清空日志失败')
			return { data: {}, status: false, msg: '清空错误' }
		}
	}

	/**
	 * @description 获取IP数据
	 * @returns {Promise<void>} void
	 */
	const getIpDataEvent = async () => {
		try {
			const res = await useDataHandle({
				loading: '正在获取ip数据，请稍后...',
				request: getIPGeolocation(),
				data: Array,
			})
			return { data: res, total: 0, other: {} }
		} catch (error) {
			console.log(error)
			return { data: [], total: 0, other: {} }
		}
	}

	// 面板日志-------登录日志

	// 表格左上方按钮组 - 登录日志
	const outLoginLogEvent = async (params: any) => {
		const { count: limit, type } = params
		let data = { limit, type }
		const typeValue: any = {
			Accepted: 'success',
			Failed: 'failure',
		}
		if (data.type === 'all') delete (data as { type?: string }).type // 全部时，不传select
		if (data.type === 'Accepted' || data.type === 'Failed') data.type = typeValue[data.type]
		try {
			useDataHandle({
				loading: '正在导出日志，请稍后...',
				request: exportLoginLog(data),
				success: (res: ResponseResult) => {
					window.open('/download?filename=' + res.data.output_file, '_blank', 'noopener,noreferrer')
				},
			})
			return { status: true, msg: '导出成功' }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '导出失败' }
		}
	}

	/**
	 * @description 清空登录日志
	 */
	const clearLoginLogEvent = async () => {
		try {
			await useDataHandle({
				loading: '正在清空日志，请稍后...',
				request: clearLoginLogs(),
				message: true,
			})
			return { msg: '清空日志成功', status: true }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '清空日志失败' }
		}
	}

	/**
	 * @description 获取日志数据
	 */
	const getLoginLogsEvent = async (params: any) => {
		try {
			const res: any = await useDataHandle({
				request: getLoginInfo(params),
				data: { data: Array, total: Number },
			})

			return { data: res.data, total: res.total, other: {} }
			// panelLogTable.value.$children[0]?.clearSort()
		} catch (error) {
			console.log(error)
			return { data: [], total: 0, other: {} }
		}
	}

	/**
	 * @description 获取运行日志
	 */
	const getRunDataEvent = async (search: string) => {
		try {
			await useDataHandle({
				loading: '正在获取日志数据，请稍后...',
				request: getRunLog(500, search),
				data: { data: [String, logMsg], size: [Number, size] },
				success: (res: any) => {
					return { data: res.data, size: res.size }
				},
			})
		} catch (error) {
			console.log(error)
			return { data: '暂无日志', size: 0 }
		}
	}

	/**
	 * @description 清理日志
	 */
	const clearRunLogsEvent = async () => {
		try {
			await useDataHandle({
				loading: '正在清空日志，请稍后...',
				request: clearRunLog(),
				message: true,
				success: getRunDataEvent,
			})
			return { msg: '清空日志成功', status: true }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '清空日志失败' }
		}
	}

	// 面板日志-------计划任务日志
	const logsMsg = ref('暂无数据') // 日志详细数据

	const currentItem = shallowRef<CrontabParams>({
		id: 0,
		name: '',
		type: '',
	}) // 当前选中的菜单

	const crontabForm = reactive<{ time_search: Array<number>; type: string }>({
		time_search: [],
		type: '',
	}) // crontab表单

	/**
	 * @description 获取日志菜单
	 */
	const getLogsMenu = async (params?: any) => {
		try {
			const res = await useDataHandle({
				request: getDataInfo({
					search: searchValue.value,
					limit: 9999,
					table: 'crontab',
					p: 1,
				}),
				data: { data: Array },
			})
			return { data: res.data, status: true }
		} catch (error) {
			console.log(error)
			return { data: [], status: false, msg: '获取日志菜单失败' }
		}
	}

	/**
	 * @description 获取日志详细数据
	 * @param {CrontabParams} item  当前点击的菜单项
	 */
	const getLogsDataEvent = async (params: any) => {
		try {
			const res = await useDataHandle({
				request: getCrontabLogsData(params),
				data: { msg: [String, logsMsg] },
			})
			return { data: res.msg || '当前日志为空!', status: true }
		} catch (error) {
			console.log(error)
			return { msg: '当前日志为空!', status: false }
		}
	}

	/**
	 * @description 清理木马查杀日志
	 */
	const clearShellLogEvent = async ({ id, day }: any) => {
		try {
			// 清理日志
			const res = await useDataHandle({
				loading: '正在清理日志，请稍后...',
				request: clearShellLogs({ id, day }),
				message: true,
			})
			getLogsDataEvent(currentItem.value)
			return { msg: res.msg, status: res.status }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '清理日志失败' }
		}
	}

	/**
	 * @description 导出木马查杀日志
	 */
	const outShellLogEvent = async () => {
		try {
			const { isOutError, day } = outDataForm.value
			const res: ResponseResult = await useDataHandle({
				loading: '正在导出日志，请稍后...',
				request: exportShellLogs({
					type: isOutError ? 'warring' : '',
					day: day === 'all' ? '' : day,
					id: currentItem.value.id,
				}),
				data: { status: Boolean, msg: String },
			})
			window.open('/download?filename=' + res.msg, '_blank', 'noopener,noreferrer')
			return { data: res, status: res.status }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '导出日志失败' }
		}
	}

	return {
		isRefreshList,
		// 操作日志
		logType,
		clearOpLogsEvent,
		getLogsInfoEvent,
		// 登录日志
		getLoginLogsEvent,
		// 运行日志
		search,
		logMsg,
		size,
		getRunDataEvent,
		clearRunLogsEvent,
		// 计划任务日志
		logsMsg,
		currentItem,
		crontabForm,
		getLogsMenu,
		getLogsDataEvent,

		getIpDataEvent,
		outWebSiteEvent,
		clearShellLogEvent,
		outShellLogEvent,
		outLoginLogEvent,
		clearLoginLogEvent,
	}
})

const usePanelLogStore = () => {
	const store = LOG_PANEL_STORE()
	return storeToRefs(store)
}

export { usePanelLogStore, LOG_PANEL_STORE }
