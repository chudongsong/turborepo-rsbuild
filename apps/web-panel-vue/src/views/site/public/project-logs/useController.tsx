import { changeProjectPath, getDaemonTime, setDaemonTime, setProjectLogStatus } from '@/api/site'
import { Message, useConfirm, useDataHandle, useHandleError } from '@/hooks/tools'
import { fileSelectionDialog } from '@/public'
import { getByteUnit } from '@/utils'
import { useSiteStore } from '../../useStore'
import { SITE_PROJECT_LOG_STORE } from './useStore'

interface LogDataProps {
	path: string
	logs: string
	type: string
	split: boolean
	size: string
	isNew: boolean
	isGunicorn: boolean
}

const { siteInfo, siteType, isRefreshList } = useSiteStore()
const { savePathEvent, setLogSplitEvent, getLogSplitEvent, saveSplitTaskEvent, getLogEvent } = SITE_PROJECT_LOG_STORE()

export const nohup_log = ref(siteInfo.value?.project_config?.nohup_log ? true : false) // 控制台日志
export const viewLoading = ref(false) // 视图加载状态
export const fullLogPopup = ref(false) // 全屏日志弹窗
export const realTimer = ref<any>(null) // 实时日志定时器
export const logTaskPopup = ref(false) // 日志切割配置弹窗
export const logInfoPopup = ref(false) // 查看日志切割信息弹窗
export const tips = ref('开启后默认每天2点0分进行切割日志文件，如需修改请点击') // 日志切割提示信息

export const logData = reactive<LogDataProps>({
	path: '', // 日志路径
	logs: '', // 日志内容
	type: '', // 日志级别
	split: false, // 是否切割日志
	size: '', // 日志大小
	isNew: false, // 是否是新建项目
	isGunicorn: false, // 是否是gunicorn项目
})

/**
 * @description: 触发目录选择
 */
export const onPathChange = () => {
	fileSelectionDialog({
		type: 'dir',
		path: logData.path,
		change: (path: string) => {
			logData.path = path
		},
	})
}

export const changeNohupLog = async () => {
	useDataHandle({
		loading: '正在设置控制台日志状态，请稍后...',
		request: setProjectLogStatus({
			project_name: siteInfo.value.name,
			status: nohup_log.value ? 1 : 0,
		}),
		message: true,
		success: (res: any) => {
			if (res.status) {
				isRefreshList.value = true
			} else {
				nohup_log.value = !nohup_log.value
			}
		},
	})
}

/**
 * @description: 保存日志路径事件
 */
export const savePath = async () => {
	try {
		const type = siteType.value
		const paramsType: AnyObject = {
			python: {
				data: JSON.stringify({
					name: siteInfo.value.name,
					data: { logpath: logData.path, loglevel: logData.type },
				}),
			},
			default: {
				data: JSON.stringify({
					project_name: siteInfo.value.name,
					path: logData.path,
				}),
			},
		}

		const res = await savePathEvent(paramsType[type] || paramsType.default)
		if (res.status) {
			siteInfo.value.project_config.log_path = logData.path
			getLogsInfo()
		}
		return res
	} catch (error) {
		console.log(error)
		return { status: false, msg: '保存日志路径失败' }
	}
}

/**
 * @description: 实时日志
 */
export const openRealTimeLogsEvent = () => {
	fullLogPopup.value = true
	// 开启定时器实时请求日志
	realTimer.value = setInterval(() => {
		getLogsInfo()
	}, 2000)
}

/**
 * @description: 取消实时日志事件
 */
export const cancelRealLogsEvent = () => {
	fullLogPopup.value = false
	if (realTimer.value) clearInterval(realTimer.value)
}

/**
 * @description: 打开日志切割配置
 */
export const openConfigEvent = () => {
	logTaskPopup.value = true
}

/**
 * @description 取消配置日志切割任务
 */
export const onCancelPopupEvent = () => {
	logTaskPopup.value = false
	// splitForm.type = splitForm.log_size ? '1' : '0';
	// pushFormRef.value.resetFields();
	// pushFormRef.value.clearValidate();
}

/**
 * @description: 提交配置日志切割任务
 */
export const saveSplitTask = async (param: any) => {
	try {
		const { name } = siteInfo.value
		const isSpecial = ['net'].includes(siteType.value)

		if (param.type === '1' && !Number(param.log_size)) {
			Message.error('请填写日志大小')
			return false
		}

		if (!logData.split) {
			let params: any = {
				data: JSON.stringify({
					[isSpecial ? 'project_name' : 'name']: name,
				}),
			}
			await setLogSplitEvent(params, false)
		}
		const params = {
			data: JSON.stringify({
				[isSpecial ? 'project_name' : 'name']: name,
				hour: param.hour.toString(),
				minute: param.minute.toString(),
				num: param.num.toString(),
				compress: param.compress,
				log_size: param.type === '1' ? param.log_size : 0,
			}),
		}
		const res = await saveSplitTaskEvent(params)

		if (res.status) {
			logTaskPopup.value = false
			getLogsSplit()
			onCancelPopupEvent()
		}
		return res.status
	} catch (error) {
		console.log(error)
		return false
	}
}

/**
 * @description: 修改日志切割任务
 */
export const changeSplitEvent = async (status: boolean | string | number) => {
	logData.split = !status
	const isSpecial = ['net'].includes(siteType.value)

	await useConfirm({
		title: '设置日志切割任务',
		content: `${status ? '开启后' : '关闭后停止'}对该项目日志进行切割，是否继续操作？`,
	})

	let params: any = {
		data: JSON.stringify({
			[isSpecial ? 'project_name' : 'name']: siteInfo.value.name,
		}),
	}

	const res = logData.isNew ? await saveSplitTaskEvent(params) : await setLogSplitEvent(params)
	if (!logData.isNew) Message.request(res)

	if (res.status) {
		await getLogsSplit()
		await getLogsInfo()
	}
}

/**
 * @description: 获取日志信息
 */
export const getLogsInfo = async () => {
	viewLoading.value = true
	try {
		const paramsType: AnyObject = {
			python: { name: siteInfo.value.name },
			default: { project_name: siteInfo.value.name },
		}
		const params = paramsType[siteType.value] || paramsType.default

		const { data } = await getLogEvent(params)

		let path = siteInfo.value.project_config?.log_path

		logData.logs = data.data || '暂无日志信息'
		logData.path = data.path || path || ''
		logData.size = data.size || data.szie || '0B'
		viewLoading.value = false
	} catch (error) {
		useHandleError(error)
	} finally {
		viewLoading.value = false
	}
}

/**
 * @description: 切割日志
 */
export const getLogsSplit = async (type: string = siteType.value) => {
	try {
		viewLoading.value = true
		const { name } = siteInfo.value
		const paramsType: AnyObject = {
			net: {
				project_name: name,
				data: JSON.stringify({ project_name: name }),
			},
			python: { name },
			default: { data: JSON.stringify({ name }) },
		}

		const { data: res } = await getLogSplitEvent(paramsType[type] || paramsType.default)

		let form: any = {
			hour: '2',
			minute: '0',
			num: '180',
			compress: false,
			log_size: 5,
			type: '0',
		}

		if (!res.status) {
			logData.isNew = true
			logData.split = false
		} else {
			logData.isNew = false
			logData.split = res.data.status ? true : false
			form = {
				hour: res.data.hour,
				minute: res.data.minute,
				num: res.data.num,
				compress: res.data.compress,
				log_size: getByteUnit(res.data.log_size, false, 2, 'MB'),
				type: res.data.log_size ? '1' : '0',
			}
			tips.value = `开启后${form.type === '1' ? '日志文件大小超过' : '默认每天'}${form.type === '1' ? form.log_size + 'MB' : `${form.hour}点${form.minute}分`}进行切割日志文件，如需修改请点击`
		}
		viewLoading.value = false
		return { data: form, status: res.status }
	} catch (error) {
		useHandleError(error)
		return { data: {}, status: false }
	} finally {
		viewLoading.value = false
	}
}

/**
 * @description: 初始化
 */
export const initLog = () => {
	// 表单获取方法 getLogsSplit();
	getLogsInfo()
}
