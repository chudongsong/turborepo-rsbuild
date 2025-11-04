import { defineStore, storeToRefs } from 'pinia'

import { Message, useDataHandle, useHandleError } from '@/hooks/tools'

import { addLogServer, addLogSource, clearLogs, delLogSource, editLogServer, exportLogs, exportPanelActionLog, getKeywordAlarm, getLogServerList, getSiteAccessLogs, getSiteErrorLogs, getSiteListInfo, getSiteOperateLogs, logCollectList, setKeywordAlarm } from '@api/logs'

import { getPageTotal } from '@/utils'
import { LOG_STORE } from '@/views/logs/useStore'

interface LogParams {
	ipArea: boolean
	typeValue: string
	timeValue: any
	searchValue: string
	keywordSwitch: boolean
	keywordConfig: any
}

const LOG_SITE_STORE = defineStore('LOG-SITE-STORE', () => {
	const logStore = LOG_STORE()
	const { selectedWebSite } = storeToRefs(logStore)

	const isRefreshList = ref(false) // 是否刷新列表
	const isRefreshLogSystem = ref(false) // 是否刷新日志系统配置
	const siteList = ref<string[]>() // 网站列表

	// 网站日志
	const preLoading = ref(false) // 日志加载loading
	const logMsg = ref('') // 日志详细数据
	const logParams = reactive<LogParams>({
		ipArea: false, // 是否显示IP归属地信息
		typeValue: 'access',
		timeValue: '',
		searchValue: '',
		keywordSwitch: false, // 关键字告警开关
		keywordConfig: {}, // 关键字告警配置
	}) // 日志参数

	const logScanForm = ref<any>() // 表单ref
	const msgForm = reactive({
		give: '' as any,
		keyword: '',
		cycle: '',
	})

	// 操作日志
	const tableLoading = ref(false) // 表格loading

	// 日志服务系统
	const logSystemLoad = ref(false) // 表格loading
	const logSystemData = ref() // 表格数据

	const sForm = ref() // 发送源表单ref
	const sendSource = ref(false) // 设置发送源弹窗
	const sourceForm = reactive({
		site: [],
	}) // 发送源表单

	const logSystemDialog = ref(false) // 日志服务系统配置弹窗
	const logSysForm = ref() // 日志系统配置表单ref
	const logSystemList = ref<any>([]) // 日志系统配置列表
	const logSystemForm = reactive({
		ip: '',
		id: 0,
		port: '',
	}) // 日志系统配置表单

	/**
	 * @description 获取网站列表
	 */
	const getSiteList = async () => {
		try {
			const res = await useDataHandle({
				loading: '正在获取网站列表，请稍后...',
				request: getSiteListInfo(),
				data: {
					msg: [
						Array,
						(data: string[]) => {
							siteList.value = data
							selectedWebSite.value = siteList.value[0] || ''
						},
					],
				},
			})
			return { data: res.msg, status: true }
		} catch (error) {
			console.log(error)
			return { msg: '获取网站列表失败 ', status: false }
		}
	}

	/**
	 * @description 清理日志
	 * @param {string} day 天数
	 * @param {string} type 日志类型
	 */
	const clearWebLogEvent = async (day: string, type: string) => {
		try {
			// 清理日志
			const res = await useDataHandle({
				loading: '正在清理日志中，请稍后....',
				request: clearLogs({
					siteName: selectedWebSite.value,
					logType: type,
					time_search: JSON.stringify(day),
				}),
				message: true,
			})
			return { status: res.status, msg: res.msg }
		} catch (error) {
			console.log(error)
			return { msg: '清理失败', status: false }
		}
	}

	/**
	 * @description 导出日志
	 */
	const outWebLogEvent = async (day: string, type: string) => {
		try {
			const res: any = await useDataHandle({
				loading: '正在导出日志中，请稍后....',
				request: exportLogs({
					siteName: selectedWebSite.value,
					logType: type,
					time_search: JSON.stringify(day),
				}),
				data: { msg: String, status: Boolean },
			})
			if (res.status) window.open('/download?filename=' + res.msg, '_blank', 'noopener,noreferrer')
			return {
				status: res.status,
				msg: `导出${res.status ? '成功' : '失败'}`,
				data: res.msg,
			}
		} catch (error) {
			console.log(error)
			return { msg: '导出失败', status: false }
		}
	}

	/**
	 * @description 获取运行日志 or 异常日志
	 * @param {string} type 日志类型 access：运行日志 error：异常日志
	 */
	const getSiteLogsData = async (params: any) => {
		if (!selectedWebSite.value) return
		try {
			// const params = handleGetLogParams();
			const res = await useDataHandle({
				loading: preLoading,
				request: logParams.typeValue === 'error' ? getSiteErrorLogs(params) : getSiteAccessLogs(params),
				data: { msg: String },
			})
			logMsg.value = res?.msg || '暂无数据'
			return { data: res.msg || '暂无数据', status: true }
			getKeywordAlarmData() // 获取关键字告警配置
		} catch (error) {
			useHandleError(error, 'getSiteLogsData')
		}
	}

	/**
	 * @description 获取位置关键字告警配置
	 */
	const getKeywordAlarmData = async () => {
		try {
			const { data } = await getKeywordAlarm({
				sitename: selectedWebSite.value,
			})
			logParams.keywordConfig = data.config
			msgForm.give = logParams.keywordConfig.channel?.split(',').filter((item: string) => item !== '') // 告警方式
			msgForm.keyword = logParams.keywordConfig.keys?.join(',')
			msgForm.cycle = logParams.keywordConfig.cycle
			logParams.keywordSwitch = data.status

			return {
				data: { ...msgForm },
				status: true,
			}
		} catch (error) {
			useHandleError(error, 'getKeywordAlarmData')
			return {
				msg: '获取关键字告警配置失败',
				status: false,
			}
		}
	}

	/**
	 * @description 关键字告警开关
	 */
	const setKeyWordConfigEvent = async (params: any) => {
		try {
			await useDataHandle({
				loading: '正在设置关键字告警...',
				request: setKeywordAlarm(params),
				message: true,
			})
			return { status: true, msg: '设置关键字告警成功' }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '设置关键字告警失败' }
		}
	}

	/**
	 * @description 确认
	 */
	const onConfirmKeyConfig = async (params: any) => {
		try {
			await useDataHandle({
				loading: '正在设置关键字告警配置，请稍后...',
				request: setKeywordAlarm(params),
				message: true,
			})
			return { status: true, msg: '设置关键字告警成功' }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '设置关键字告警失败' }
		}
	}

	/**
	 * @description 获取位置关键字告警配置
	 */
	const getScanData = async () => {
		try {
			const { data } = await useDataHandle({
				loading: '正在获取关键字告警配置，请稍后...',
				request: getKeywordAlarm({ sitename: selectedWebSite.value }),
			})
			msgForm.cycle = data.config.cycle
			msgForm.keyword = data.config.keys.join(',')
			if (data.config.channel != '') msgForm.give = data.config.channel.split(',')
			return { data: msgForm, status: true }
		} catch (error) {
			console.log(error)
			return { msg: '获取关键字告警配置失败', status: false }
		}
	}

	/**
	 * @description 获取日志数据
	 */
	const getOperateLog = async (params: any) => {
		try {
			if (!selectedWebSite.value) return
			if (!params.search) params.search = selectedWebSite.value
			const res = await useDataHandle({
				loading: tableLoading,
				request: getSiteOperateLogs({ data: JSON.stringify(params) }),
				data: { data: Array, page: String },
			})
			return { data: res.data, total: getPageTotal(res.page), other: {} }
		} catch (error) {
			console.log(error)
			return { data: [], total: 0, other: {} }
		}
	}

	/**
	 * @description 导出日志
	 */
	const outLogs = async () => {
		try {
			const res = await exportPanelActionLog({ search: selectedWebSite.value })
			window.open('/download?filename=' + res.data.output_file, '_blank', 'noopener,noreferrer')
			return { status: true, msg: '导出成功' }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '导出失败' }
		}
	}

	/**
	 * @description 删除日志源
	 */
	const delLogSourceEvent = async (params: any) => {
		try {
			await useDataHandle({
				loading: '正在删除日志源，请稍候...',
				request: delLogSource(params),
				message: true,
				success: getLogSystemData,
			})
			return { status: true, msg: '删除成功' }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '删除失败' }
		}
	}

	/**
	 * @description 设置日志系统配置
	 */
	const logSystemConfirm = async (params: any) => {
		try {
			// 请求
			await useDataHandle({
				loading: '正在设置日志系统配置中...',
				request: params.server_id ? editLogServer(params) : addLogServer(params),
				message: true,
			})
			// logSystemDialog.value = false;
			return { status: true, msg: '设置成功' }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '设置失败' }
		}
	}

	/**
	 * @description 设置发送源
	 */
	const sendSourceConfirm = async (params: any) => {
		try {
			const res = await useDataHandle({
				loading: '正在设置日志源中...',
				request: addLogSource(params),
			})
			Message.request(res.data[0])
			sendSource.value = false
			return res
		} catch (error) {
			console.log(error)
			return { status: false, msg: '设置失败' }
		}
	}

	const tableData = ref([]) // 表格数据

	/**
	 * @description 获取日志系统数据
	 */
	const getLogSystemData = async () => {
		try {
			const res = await useDataHandle({
				loading: tableLoading,
				request: logCollectList(),
				data: Array,
			})
			return { data: res, total: res.length, other: {} }
		} catch (error) {
			console.log(error)
			return { data: [], total: 0, other: {} }
		}
	}

	/**
	 * @description 获取日志服务系统配置
	 */
	const getLogSystemSite = async () => {
		try {
			await useDataHandle({
				loading: '正在获取日志服务系统配置中,请稍后...',
				request: getLogServerList(),
				data: [Array, logSystemList],
			})
			// 未知数据
			if (logSystemList.value.length > 0) {
				logSystemForm.ip = logSystemList.value[0].ip
				logSystemForm.port = logSystemList.value[0].port
				logSystemForm.id = logSystemList.value[0].id
			}
			return { data: logSystemList.value, status: true }
		} catch (error) {
			console.log(error)
			return { msg: '获取日志服务系统配置失败', status: false }
		}
	}

	return {
		siteList,
		getSiteList,

		// 网站日志
		logParams,
		preLoading,
		logMsg,
		logScanForm,
		msgForm,
		getSiteLogsData,
		setKeyWordConfigEvent,
		clearWebLogEvent,
		outWebLogEvent,
		getKeywordAlarmData,
		getScanData,

		// 操作日志
		tableLoading,
		getOperateLog,
		outLogs,

		// 日志系统
		sForm,
		logSysForm,
		sendSource,
		logSystemDialog,
		logSystemForm,
		sourceForm,
		logSystemData,
		logSystemLoad,
		logSystemList,
		getLogSystemData,
		getLogSystemSite,
		logSystemConfirm,
		sendSourceConfirm,
		delLogSourceEvent,
		onConfirmKeyConfig,
		isRefreshLogSystem,
		isRefreshList,
	}
})

// export default LOG_SITE_STORE;

const useSiteLogStore = () => {
	return storeToRefs(LOG_SITE_STORE())
}

export { useSiteLogStore, LOG_SITE_STORE }
