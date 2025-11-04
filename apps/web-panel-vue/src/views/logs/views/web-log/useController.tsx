import { getSiteListInfo } from '@/api/logs'
import { Message, useConfirm, useDataHandle, useDialog } from '@/hooks/tools'
import { useGlobalStore } from '@/store/global'
import WebLogAnalysis from '@logs/views/web-log/analyse-log/index.vue'
import OptionLog from '@logs/views/web-log/operate-log/index.vue'
import WebSiteLog from '@logs/views/web-log/web-site-log/index.vue'
import { dateSwitch } from '../../useController'
import { LOG_STORE } from '../../useStore'
import { useLogAnalyseStore } from './analyse-log/useStore'
import { LOG_SITE_STORE, useSiteLogStore } from './useStore'
import { productPaymentDialog } from '@/public'

const { selectedWebSite, webTabActive, outDataForm, configData } = storeToRefs(LOG_STORE())
const { clearWebLogEvent, outWebLogEvent, setKeyWordConfigEvent, onConfirmKeyConfig, getKeywordAlarmData, delLogSourceEvent, sendSourceConfirm, getLogSystemSite, getSiteLogsData, logSystemConfirm } = LOG_SITE_STORE()
const { logParams, isRefreshLogSystem, isRefreshList, logSystemList } = useSiteLogStore()
const { payment } = useGlobalStore()

const { isRefreshList: isRefreshAnalyse, routeData } = useLogAnalyseStore()

export const tabComponent = [
	{
		label: '网站日志',
		name: 'WebLogs',
		lazy: true,
		render: () => <WebSiteLog></WebSiteLog>,
	},
	{
		label: '操作日志',
		name: 'OperateLog',
		lazy: true,
		render: () => <OptionLog></OptionLog>,
	},
	{
		label: 'web日志分析',
		name: 'WebLogAnalysis',
		lazy: true,
		render: () => <WebLogAnalysis></WebLogAnalysis>,
	},
]

export const siteList = ref<any[]>([]) // 网站列表

/**
 * @description 获取网站列表
 */
export const getSiteList = async () => {
	const { msg } = await useDataHandle({
		loading: '正在获取网站列表，请稍后...',
		request: getSiteListInfo(),
		data: {
			msg: Array,
		},
	})
	if (Array.isArray(msg)) {
		selectedWebSite.value = Array.isArray(msg) ? msg[0] || '' : ''
		siteList.value = msg.map((item: any) => ({ label: item, value: item }))
		return msg
	}
	siteList.value = []
	return []
}

/**
 * @description 限制时间选择
 * @param time
 * @returns
 */
export const disabledDate = (time: Date) => time.getTime() > Date.now() // 限制今天之后的时间

/**
 * @description 清理日志弹窗
 */
export const openClearLogView = () => {
	let tips = '清理相关日志可能会导致故障排查困难，请谨慎操作'
	useDialog({
		title: '清理【' + selectedWebSite.value + '】网站日志',
		area: 44,
		component: () => import('@logs/public/clear-log/index.vue'),
		compData: {
			tips,
			type: 'website',
			clearEvent: async (day: string, type: string) => {
				const time_search = dateSwitch(day)
				const res = await clearWebLogEvent(time_search, type)
				renderWebLog()
				return res.status
			},
		},
		showFooter: true,
	})
}

/**
 * @description 导出日志弹窗
 */
export const openOutLogView = () => {
	outDataForm.value.type = LOG_STORE().getType('website')
	configData.value = { type: 'website' }

	useDialog({
		title: '导出日志',
		area: 44,
		component: () => import('@logs/public/out-log/index.vue'),
		showFooter: true,
		compData: { type: 'website' },
	})
}

/**
 * @description 处理获取日志参数
 */
export const handleGetLogParams = () => {
	let params: any = {
		ip_area: logParams.value.ipArea ? 1 : 0,
		siteName: selectedWebSite.value,
		search: logParams.value.searchValue,
	}
	// 处理数据
	if (logParams.value.timeValue) {
		logParams.value.timeValue[0] = new Date(logParams.value.timeValue[0]).setHours(0, 0, 0, 0)
		logParams.value.timeValue[1] = new Date(logParams.value.timeValue[1]).setHours(23, 59, 59, 0)
		params.time_search = JSON.stringify([logParams.value.timeValue[0] / 1000, logParams.value.timeValue[1] / 1000])
	}
	if (!logParams.value.searchValue) delete params.search
	return params
}

/**
 * @description 渲染网站日志
 */
export const renderWebLog = () => {
	const params = handleGetLogParams()
	getSiteLogsData(params)
	if (logParams.value.typeValue !== 'error') getKeywordAlarmData()
}

/**
 * @description 显示IP归属地信息
 */
export const setKeywordConfig = () => {
	useDialog({
		title: '关键字告警配置',
		area: 62,
		component: () => import('@logs/views/web-log/web-site-log/keyword-config.vue'),
		showFooter: true,
	})
}

export const changeKeywordStatus = async (val: boolean) => {
	const { keywordConfig: config } = logParams.value
	if ((!config.keys.length || !config.channel || !config.cycle) && val) {
		logParams.value.keywordSwitch = !val
		// Message.error('请先配置关键字告警')
		setKeywordConfig()
		return
	}
	const params: any = { sitename: selectedWebSite.value }
	// 关键字告警开关打开时，传递告警周期、关键字、告警渠道
	if (val) {
		params.cycle = logParams.value.keywordConfig.cycle
		params.keys = JSON.stringify(logParams.value.keywordConfig.keys)
		params.channel = logParams.value.keywordConfig.channel
	}
	const { status } = await setKeyWordConfigEvent(params)
	if (status) logParams.value.keywordSwitch = val
}

/**
 * @description IP归属地信息改变事件
 */
export const changeIpArea = (val: any) => {
	if (payment.value.authType !== 'ltd') {
		logParams.value.ipArea = !val
		return productPaymentDialog({ sourceId: 107 })
	}
	renderWebLog()
}

/**
 * @description 关键字告警配置保存
 * @param param
 * @param validate
 * @param ref
 */
export const saveKeywordConfig = async (param: Ref<T>, validate: () => Promise<'closed' | true>, ref: Ref<any>) => {
	try {
		await validate()
		// 参数处理 {cycle，channel，keys}
		const params = {
			cycle: param.value.cycle,
			channel: param.value.give.join(','),
			keys: JSON.stringify(param.value.keyword.split(',')),
		}
		const res = await onConfirmKeyConfig(params)
		getKeywordAlarmData()
		return res.status
	} catch (error) {
		console.log(error)
	}
}

/******************* 操作日志 *******************/
/******************* 日志服务系统 *******************/

/**
 * @description 获取日志源列表
 * @param id
 */
export const delLogSource = async (row: any) => {
	await useConfirm({
		title: '删除【' + row.site_name + '】日志源',
		icon: 'warning-filled',
		content: '是否删除【' + row.site_name + '】?',
	})

	const params = {
		server_id: row.server.id,
		source_type: row.source_type,
		source_list: JSON.stringify([row.site_name]),
	}

	await delLogSourceEvent(params)
}

/**
 * @description 提交日志系统配置
 * @param param
 * @param validate
 * @param ref
 * @param any
 * @returns
 */
export const submitLogSystemConfig = async (param: any) => {
	try {
		// 参数处理 待定
		let sList = logSystemList.value.length > 0
		let params: any = {
			server_data: JSON.stringify({
				ip: param.ip,
				port: param.port,
			}),
		}
		if (sList) {
			params['server_id'] = logSystemList.value[0]?.id
		} else {
			params['server_type'] = 'bt_log_server'
		}
		const res = await logSystemConfirm(params)
		if (res.status) getLogSystemSite()
		return res.status
	} catch (error) {
		console.log(error)
	}
}

export const submitSendSource = async (param: any) => {
	try {
		const params = {
			server_id: param.server_id,
			source_type: 'site',
			source_list: JSON.stringify(param.site),
		}
		const res = await sendSourceConfirm(params)
		// 刷新列表
		isRefreshLogSystem.value = true
		return res.status
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 判断日志类型
 * @param type
 */
export const judgeLogType = (type: string) => {
	if (type === 'WebLogs') {
		renderWebLog()
	} else if (type === 'WebLogAnalysis') {
		isRefreshAnalyse.value = true
		routeData.value.name = selectedWebSite.value
	} else {
		isRefreshList.value = true
	}
}
