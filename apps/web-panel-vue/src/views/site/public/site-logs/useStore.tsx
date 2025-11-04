import { changeSiteLogPath, getIpArea, getSiteErrorLogs, getSiteLogPushStatus, getSiteLogs, getSpringBootLog, getSpringBootLogList, setPushTask } from '@/api/site'
import { useDataHandle } from '@/hooks/tools/data'
import { useSiteStore } from '../../useStore'

const SITE_LOGS_STORE = defineStore('SITE-LOGS-STORE', () => {
	const { siteType, siteInfo } = useSiteStore()

	const getErrorLogsEvent = async (params: any) => {
		try {
			const { data } = await getSiteErrorLogs(params, siteType.value)
			return { data, status: true }
		} catch (error) {
			console.log(error)
			return { msg: '获取错误日志失败', status: false }
		}
	}

	const getSpringLogEvent = async (params: any) => {
		try {
			const { data: res } = await getSpringBootLogList(params)
			return { data: res.data, status: res.status }
		} catch (error) {
			console.log(error)
			return { msg: '获取日志失败', status: false }
		}
	}

	const setSpringPathEvent = async (params: any) => {
		try {
			const { data: res } = await getSpringBootLog(params)
			return { status: res.status, msg: res.data }
		} catch (error) {
			console.log(error)
			return { msg: '保存路径失败', status: false }
		}
	}

	/**
	 * @description 保存日志路径
	 */
	const saveResLogPathEvent = async (params: any) => {
		try {
			const res = await useDataHandle({
				loading: '正在保存日志路径，请稍后...',
				request: changeSiteLogPath(params),
				message: true,
			})
			return { status: res.status, msg: res.msg }
		} catch (error) {
			console.log(error)
			return { msg: '保存路径失败', status: false }
		}
	}

	const setPushTaskEvent = async (params: any) => {
		try {
			const res = await useDataHandle({
				loading: '正则处理中，请稍后...',
				request: setPushTask(params),
				message: true,
			})
			return { status: res.status, msg: res.msg }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '推送失败' }
		}
	}

	const getLogPushEvent = async () => {
		try {
			const res: AnyObject = await useDataHandle({
				request: getSiteLogPushStatus({ sitename: siteInfo.value.name }),
				data: {
					status: Boolean,
					'config.cycle': [Number, 'cycle'],
					'config.keys': [Array, 'keys'],
					'config.channel': [String, 'channel'],
				},
			})
			return { data: res, status: true }
		} catch (error) {
			console.log(error)
			return { msg: '获取推送配置失败', status: false }
		}
	}

	/**
	 * @description 显示IP归属地信息
	 */
	const getIpStatusEvent = async () => {
		try {
			const res: AnyObject = await useDataHandle({
				request: getIpArea(),
				data: { msg: [Number, 'msg'] },
			})
			return { data: res.msg, status: true }
		} catch (error) {
			console.log(error)
			return { msg: '获取IP归属地失败', status: false }
		}
	}

	/**
	 * @description 获取日志
	 * @param params
	 * @returns
	 */
	const getResLogEvent = async (params: any) => {
		try {
			const res = await getSiteLogs(params, siteType.value)
			return { data: res.data, status: res.status }
		} catch (error) {
			console.log(error)
			return { msg: '获取日志失败', status: false }
		}
	}

	return {
		getErrorLogsEvent,
		getSpringLogEvent,
		setSpringPathEvent,
		saveResLogPathEvent,
		setPushTaskEvent,
		getLogPushEvent,
		getIpStatusEvent,
		getResLogEvent,
	}
})

const useSiteLogsStore = () => storeToRefs(SITE_LOGS_STORE())

export { SITE_LOGS_STORE, useSiteLogsStore }
