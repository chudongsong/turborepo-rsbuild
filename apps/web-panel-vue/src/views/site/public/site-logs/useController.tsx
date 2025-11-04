import { log } from 'console'
import { Message, useConfirm, useDataHandle, useHandleError } from '@/hooks/tools'
import { fileSelectionDialog, productPaymentDialog } from '@/public'
import { useGlobalStore } from '@/store/global'
import { isString } from '@/utils'
import ProjectLogs from '@site/public/project-logs/index.vue'
import ErrorLog from '@site/public/site-logs/error-log.vue'
import ResponseLog from '@site/public/site-logs/response-log.vue'
import SafeAnalysis from '@site/public/site-logs/safe-analysis.vue'
import SpringBootLogs from '@site/public/site-logs/spring-boot-logs.vue'
import { useSiteStore } from '../../useStore'
import { SITE_LOGS_STORE } from './useStore'
import { getSiteLogFile } from '@/api/site'
import { has } from 'ramda'

const { payment } = useGlobalStore()
const { authType } = toRefs(payment.value)
const { getErrorLogsEvent, getSpringLogEvent, setSpringPathEvent, saveResLogPathEvent, setPushTaskEvent, getLogPushEvent, getIpStatusEvent, getResLogEvent } = SITE_LOGS_STORE()
const { siteType, siteInfo, isBindExtranet } = useSiteStore()

export const logLoading = ref(false) // 是否正在加载日志
export const errorLogData = ref({
	logs: '', // 日志内容
	size: '0 b', // 日志大小
}) // 错误日志数据
export const pathOptions = ref([]) // 日志路径选项
export const logType = ref('') // 日志类型
export const fullLogPopup = ref(false) // 是否显示全屏日志
export const logPopupCon = ref<HTMLElement | null>(null) // 日志弹窗ref

export const logData = reactive({
	path: '', // 日志路径
	logs: '', // 日志内容
	type: '', // 日志级别
	size: '', // 日志大小
	isNew: false, // 是否是新建项目
	isGunicorn: false, // 是否是gunicorn项目
})

export const tabActive = computed(() => {
	return siteInfo.value?.tabName || (siteType.value === 'java' ? 'projectLog' : 'response')
})
export const tabComponent = ref([
	{
		label: '响应日志',
		name: 'response',
		lazy: true,
		render: () => <ResponseLog></ResponseLog>,
	},
	{
		label: '错误日志',
		name: 'error',
		lazy: true,
		render: () => <ErrorLog></ErrorLog>,
	},
	{
		label: '日志安全分析',
		name: 'safe',
		lazy: true,
		render: () => <SafeAnalysis></SafeAnalysis>,
	},
])

export const onTabChangeEvent = (name: string) => {
	// 切换标签页时的处理逻辑
}

export const initLogs = () => {
	if (siteType.value === 'java') {
		if (!tabComponent.value.some(item => item.name === 'projectLog'))
			tabComponent.value.unshift({
				label: '项目日志',
				name: 'projectLog',
				lazy: true,
				render: () => <ProjectLogs></ProjectLogs>,
			})
		if (siteInfo.value?.project_config?.java_type === 'springboot') {
			if (!tabComponent.value.some(item => item.name === 'springbootLog'))
				tabComponent.value.push({
					label: 'springBoot日志',
					name: 'springbootLog',
					lazy: true,
					render: () => <SpringBootLogs></SpringBootLogs>,
				})
		} else {
			tabComponent.value = tabComponent.value.filter(item => item.name !== 'springbootLog')
		}
	} else {
		tabComponent.value = tabComponent.value.filter(item => item.name !== 'projectLog' && item.name !== 'springbootLog')
	}
	const specialData = ['php', 'proxy', 'html']
	// 特殊页面不显示外网映射遮罩
	if (specialData.includes(siteType.value)) isBindExtranet.value = true
	else isBindExtranet.value = siteInfo.value?.project_config?.bind_extranet ? true : false
}

/**
 * @description 获取错误日志
 */
export const getErrorLogs = async () => {
	if (!isBindExtranet.value) return
	const name = siteInfo.value.name
	const type = siteType.value
	const paramsType: AnyObject = {
		proxy: { site_name: name, type: 'error' },
		default: { siteName: name },
	}

	try {
		logLoading.value = true

		const res = await getErrorLogsEvent(paramsType[type] || paramsType.default)
		if (type === 'proxy') errorLogData.value.size = res.data.size || '0 b'
		errorLogData.value.logs = res.data?.logs || res.data?.msg || '暂无日志信息'

		return res
	} catch (error) {
		useHandleError(error)
		return { msg: '获取错误日志失败', status: false }
	} finally {
		logLoading.value = false
	}
}

/***************SpringBoot******************/

/**
 * @description 获取项目日志列表
 */
export const getSpringLogs = async () => {
	logLoading.value = true
	try {
		const params = { project_name: siteInfo.value.name }
		const { data, status } = await getSpringLogEvent(params)
		if (status) {
			pathOptions.value = data.map((item: any) => ({
				label: item,
				value: item,
			}))
			logData.logs = '正在获取日志'
			logData.path = data?.[0] || ''
			// oldPath.value = logData.path;
			setSpringLogsPath()
		}
	} catch (error) {
		console.log(error)
	} finally {
		logLoading.value = false
	}
}

export const setSpringLogsPath = async (path?: string) => {
	try {
		if (!logData.path) {
			logData.logs = '暂未在SpringBoot框架中查找到日志配置信息'
			return false
		}
		const res: any = await setSpringPathEvent({ log_file: logData.path })
		if (!res.status) Message.error(res.msg)
		logData.logs = res.msg || '获取日志失败'

		return res
	} catch (error) {
		console.log(error)
		return { msg: '保存路径失败', status: false }
	}
}

let realTimer: any = null // 实时日志定时器
export const openRealTimeLogs = () => {
	fullLogPopup.value = true
	nextTick(() => {
		// 滚动到底部
		if (logPopupCon.value) logPopupCon.value.scrollTop = logPopupCon.value.scrollHeight
	})
	realTimer && clearInterval(realTimer)
	// 开启定时器实时请求日志
	realTimer = setInterval(() => {
		getSpringLogs()
	}, 2000)
}

export const cancelRealLogs = () => {
	fullLogPopup.value = false
	clearInterval(realTimer)
	realTimer = null
}

export const initSpringBoot = () => {
	logType.value = 'java'
	logData.type = siteInfo.value.project_config?.loglevel || ''
	logData.isGunicorn = siteInfo.value.project_config?.stype === 'gunicorn'
	getSpringLogs()
}

/***************safe analysis******************/
/***************response******************/
export const logsPathValue = ref<string>('') // 日志路径
export const pathPopover = ref<boolean>(false) // 是否显示日志路径下拉框
export const responseLogData = reactive<any>({
	alert: false,
	showIp: false,
	ipData: 0,
	logs: '',
	size: '0 b',
})
const isSwitch = ref<boolean>(false) // 是否切换开关
export const alertPopup = ref<boolean>(false) // 是否显示推送配置弹窗
export const alertSetFormRef = ref<any>() // 关键字告警配置表单实例
export const alertSetForm = reactive<any>({
	cycle: 0,
	keys: '',
	channel: [],
})
export const rules = reactive({
	cycle: [{ required: true, message: '请输入周期', trigger: 'blur' }],
	keys: [{ required: true, message: '请输入关键字', trigger: 'blur' }],
	channel: [{ required: true, message: '请选择告警方式', trigger: 'blur' }],
})

/**
 * @description: 触发目录选择
 */
export const onPathChange = () => {
	fileSelectionDialog({
		type: 'dir',
		path: logsPathValue.value,
		change: (path: string) => {
			logsPathValue.value = path
			setTimeout(() => {
				pathPopover.value = true
			}, 0)
		},
	})
}

/**
 * @description 保存日志路径
 */
export const saveResLogPath = async (
	params: { site_name: string; log_path: string } = {
		site_name: siteInfo.value.name,
		log_path: logsPathValue.value,
	}
) => {
	await useConfirm({
		title: '保存日志路径',
		content: `是否保存日志路径[${logsPathValue.value}]`,
	})

	const res = await saveResLogPathEvent({
		site_name: siteInfo.value.name,
		log_path: logsPathValue.value,
	})

	if (res.status) {
		getResLogs()
		getLogsPath()
		pathPopover.value = false
	}
}

/**
 * @description 设置显示IP归属地信息
 */
export const changeIpShow = async () => {
	if (authType.value !== 'ltd') {
		// 打开支付界面
		responseLogData.showIp = false
		productPaymentDialog({
			disablePro: true,
			sourceId: 184,
		})
	} else {
		getResLogs()
	}
}

/**
 * @description 切换开关
 * @param val 开关状态
 */
export const changeSwitch = async (val: boolean) => {
	isSwitch.value = true
	if (val) {
		alertPopup.value = true
	} else {
		setPushTask({}, 'switch')
	}
}

/**
 * @description 取消弹窗
 */
export const cancelPopup = () => {
	if (isSwitch.value) {
		responseLogData.alert = !responseLogData.alert
		isSwitch.value = false
	}
}

/**
 * @description 设置推送任务
 */
export const setPushTask = async (param: any, type: string) => {
	try {
		if (alertPopup.value) await alertSetFormRef.value.validate()
		let params: any = {
			sitename: siteInfo.value.name,
		}
		if (type !== 'switch') {
			if (!isSwitch.value) delete params.sitename
			params.channel = param.channel.filter((item: any) => item !== '').join(',')
			params.cycle = param.cycle
			params.keys = JSON.stringify(isString(param.keys) ? param.keys.split(',') : param.keys)
		}
		const res = await setPushTaskEvent(params)
		if (res.status) getAlertStatus()
		return res.status
	} catch (error) {
		console.log(error)
		return false
	}
}

/**
 * @description 获取告警配置
 */
export const getAlertStatus = async () => {
	try {
		const res: any = await getLogPushEvent()
		let form = {}
		if (res.status) {
			responseLogData.alert = res.data.status
			const { cycle, keys, channel } = res.data
			form = {
				cycle,
				keys,
				channel: channel.split(','),
				status: res.status,
			}
		} else {
			responseLogData.alert = false
			// alertResData.value.status = false;
		}
		Object.assign(alertSetForm, form)
		return { data: form, status: res.status }
	} catch (error) {
		console.log(error)
		return { msg: '获取告警配置失败', status: false }
	}
}

export const openKeywordsView = () => {
	alertPopup.value = true
	getAlertStatus()
}

/**
 * @description 获取ip归属地
 * @returns
 */
export const getIpStatus = async () => {
	try {
		const res = await getIpStatusEvent()
		responseLogData.showIp = res.data === 1
	} catch (error) {
		console.log(error)
		return { msg: '获取IP归属地失败', status: false }
	}
}

/**
 * @description 获取日志
 */
export const getResLogs = async (name: string = siteInfo.value.name, type: string = siteType.value) => {
	if (authType.value !== 'ltd') {
		responseLogData.showIp = false
	}
	const paramsType: AnyObject = {
		proxy: { site_name: name, type: 'access' },
		default: { siteName: name, ip_area: Number(responseLogData.showIp) },
	}

	try {
		logLoading.value = true
		const res = await getResLogEvent(paramsType[type] || paramsType.default)

		if (type === 'proxy') {
			responseLogData.logs = res.data.msg || '暂无日志信息'
			responseLogData.size = res.data.size || '0 b'
		} else {
			responseLogData.logs = res.data.msg || '暂无日志信息'
		}
		return res
	} catch (error) {
		useHandleError(error)
		return { msg: '获取日志失败', status: false }
	} finally {
		logLoading.value = false
	}
}

export const getLogsPath = () => {
	useDataHandle({
		request: getSiteLogFile({ siteName: siteInfo.value.name }),
		data: { log_file: String, status: Boolean, msg: String },
		success: (data: any) => {
			logsPathValue.value = data.log_file // 查询日志路径
			if (!data.status) Message.error(data.msg)
		},
	})
}

export const initResLog = async () => {
	if (!isBindExtranet.value) return
	await getIpStatus()
	if (siteType.value !== 'python') await getAlertStatus()
	await getResLogs()
	getLogsPath()
}
