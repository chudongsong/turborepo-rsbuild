import { changeProjectPath, getDaemonTime, getLogSplit, getProjectLogs, mamgerLogSplit, setDaemonTime, setLogSplit } from '@/api/site'
import { Message, useDataHandle, useHandleError } from '@/hooks/tools'
import { useSiteStore } from '../../useStore'

const SITE_PROJECT_LOG_STORE = defineStore('SITE-PROJECT-LOG-STORE', () => {
	const { siteInfo, siteType } = useSiteStore()

	/**
	 * @description: 保存日志路径事件
	 */
	const savePathEvent = async (params: any) => {
		try {
			const res = await useDataHandle({
				loading: '正在保存日志配置，请稍后...',
				request: changeProjectPath(params, siteType.value),
				message: true,
			})
			return { status: res.status, msg: res.msg }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '保存日志路径失败' }
		}
	}

	/**
	 * @description 保存日志切割配置
	 * @param params
	 * @returns
	 */
	const saveSplitTaskEvent = async (params: any) => {
		try {
			const res = await useDataHandle({
				loading: '正在设置日志切割任务，请稍后...',
				request: mamgerLogSplit(params, siteType.value),
				message: true,
			})
			return { status: res.status, msg: res.msg }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '保存日志切割配置失败' }
		}
	}

	/**
	 * @description 获取日志
	 * @param params
	 * @returns
	 */
	const getLogEvent = async (params: any) => {
		try {
			const { data } = await getProjectLogs(params, siteType.value)
			return { data, status: true }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '获取日志失败' }
		}
	}

	/**
	 * @description  设置日志切割任务
	 * @param params
	 * @param message
	 * @returns
	 */
	const setLogSplitEvent = async (params: AnyObject, message: boolean = true) => {
		let load
		try {
			load = Message.load('正在设置日志切割任务，请稍后...')
			const res = await setLogSplit(params, siteType.value)
			if (message) Message.request(res)
			return res
		} catch (error) {
			useHandleError(error)
		} finally {
			load?.close()
		}
	}

	/**
	 * @description 获取日志切割信息
	 * @param params
	 * @returns
	 */
	const getLogSplitEvent = async (params: any) => {
		try {
			const { data: res } = await getLogSplit(params, siteType.value)
			return { data: res, status: true }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '获取日志切割信息失败' }
		}
	}

	return {
		getLogEvent,
		savePathEvent,
		saveSplitTaskEvent,
		setLogSplitEvent,
		getLogSplitEvent,
	}
})

const useSiteProjectLogStore = () => storeToRefs(SITE_PROJECT_LOG_STORE())

export { SITE_PROJECT_LOG_STORE, useSiteProjectLogStore }
