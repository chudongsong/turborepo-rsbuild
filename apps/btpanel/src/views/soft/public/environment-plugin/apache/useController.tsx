import { getFileBody, getOpeLogs, getApacheConf, setApacheConf, getApacheStatus, installPlugin, setRestartTask, getRestartTask } from '@api/soft'
import { saveFileBody } from '@api/global'
import { Message, useDataHandle, useHandleError } from '@/hooks/tools'
import { msgBoxDialog } from '@/public/index'
import SOFT_STATUS_STOP_ALERT from '../public/status-stop-alert/store'
import SOFT_SERVICE_STATUS_STORE from '../public/service-status/store'

const statusStopStore = SOFT_STATUS_STOP_ALERT()
const serviceStatusStore = SOFT_SERVICE_STATUS_STORE()

const compData = ref<any>({}) // 组件数据

const apacheLoad = {
	UpTime: '启动时间(Uptime)',
	IdleWorkers: '空闲进程(IdleWorkers)',
	TotalAccesses: '总连接数(TotalAccesses)',
	TotalKBytes: '传送总字节(TotalkBytes)',
	workermem: 'Apache使用内存',
	workercpu: 'Apache使用CPU',
	ReqPerSec: '每秒请求数(ReqPerSec)',
	RestartTime: '重启时间(RestartTime)',
	BusyWorkers: '繁忙进程(BusyWorkers)',
} as any

export const performanceData = ref<any>([]) // 性能调整数据
export const activeName = ref<string>('service') // 当前激活的tab
export const staticContent = ref<string>('') // 静态内容
export const textLoading = ref<boolean>(false) // 文本加载
export const viewLoading = ref<boolean>(false) // 视图加载
export const tableData = ref<Array<AnyObject>>([]) // 表格数据
export const logMsg = ref<string>('') // 日志信息
export const version = ref<string>('') // 版本
export const versionList = ref<any>([]) // 版本列表
export const helpList = [
	{
		// 帮助列表
		content: '此处为apache主配置文件,若您不了解配置规则,请勿随意修改',
	},
]
export const processStatus = ref<boolean>(false) // 守护进程

export const setProcessStatus = (status: boolean) => {
	useDataHandle({
		loading: '正在设置守护进程，请稍后...',
		request: setRestartTask({ status: status ? 1 : 0 }),
		message: true,
		success: (res: any) => {
			if (!res.status) processStatus.value = !status
		},
	})
}

const getProcessStatus = async () => {
	try {
		const res = await getRestartTask()
		console.log(res, 6666)
		processStatus.value = res.data.status === 1
	} catch (error) {}
}

/**
 * @description 获取nginx 性能数据
 */
export const getApacheEvent = async () => {
	await useDataHandle({
		loading: textLoading,
		request: getApacheConf(),
		data: [Array, performanceData],
	})
}

/**
 * @description 保存redis数据
 */
export const saveNginxData = async () => {
	// 提取performanceData中每一项的value
	let params: any = {}
	performanceData.value.forEach((item: any) => {
		params[item.name] = item.value
	})
	await useDataHandle({
		loading: '正在保存中，请稍后...',
		request: setApacheConf(params),
		message: true,
	})
}

/**
 * @description 获取负载状态
 */
export const getApacheLoadEvent = async () => {
	await useDataHandle({
		loading: textLoading,
		request: getApacheStatus(),
		success: res => {
			tableData.value = []
			Object.keys(res.data).forEach(key => {
				tableData.value.push({
					name: key,
					ps: apacheLoad[key],
					value: res.data[key],
				})
			})
		},
	})
}

/**
 * @description 获取配置文件
 */
export const getConfigEvent = async () => {
	await useDataHandle({
		loading: textLoading,
		request: getFileBody({ path: '/www/server/apache/conf/httpd.conf' }),
		data: {
			data: [String, staticContent],
		},
	})
}

/**
 * @description 保存配置文件
 */
export const saveFileEvent = async () => {
	await useDataHandle({
		loading: '正在保存中，请稍后...',
		request: saveFileBody({
			path: '/www/server/apache/conf/httpd.conf',
			data: staticContent.value,
			encoding: 'utf-8',
		}),
		message: true,
	})
}

/**
 * @description 获取error日志
 */
export const getErrLogsEvent = async () => {
	await useDataHandle({
		loading: textLoading,
		request: getOpeLogs({ path: '/www/wwwlogs/error_log' }),
		data: {
			msg: [String, logMsg],
		},
	})
}

/**
 * @description 安装插件
 */
export const switchVersion = async (compData: any) => {
	let [major, minor] = compData.version.split('.')
	let oldVersion = [major, minor].join('.')
	if (version.value === oldVersion) {
		Message.error('当前版本与选择版本一致')
		return
	}
	try {
		await installPlugin({
			sName: 'apache',
			version: version.value,
			min_version: '',
		})
		// 打开消息盒子
		msgBoxDialog()
	} catch (error) {
		useHandleError(error)
	}
}

/**
 * @description tab切换
 * @param tab
 */
export const handleTabClick = ({ props: { name } }: any) => {
	switch (name) {
		case 'service':
			init()
			break
		case 'performance':
			getApacheEvent()
			break
		case 'config':
			// 获取配置文件
			getConfigEvent()
			break
		case 'load':
			// 获取负载状态
			getApacheLoadEvent()
			break
		case 'logs':
			// 获取操作日志
			getErrLogsEvent()
			break
	}
}

export const init = (data?: any) => {
	activeName.value = 'service'
	if (data) compData.value = data

	// 加载服务状态
	serviceStatusStore.init(compData.value)

	// 初始化状态停止告警
	statusStopStore.init({
		name: 'apache',
	})

	version.value = compData.value.version.split('.')[0] + '.' + compData.value.version.split('.')[1]
	versionList.value = compData.value.versions

	// 获取守护进程状态
	getProcessStatus()
}
