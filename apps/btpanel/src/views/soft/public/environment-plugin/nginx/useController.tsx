import { saveFileBody } from '@api/global'
import { getFileBody, getNginxStatus, getNginxConf, setNginxConf, getOpeLogs, installPlugin } from '@api/soft'
import { getByteUnit } from '@utils/index'
import { msgBoxDialog } from '@/public/index'
import { Message, useDataHandle } from '@hooks/tools'
import SOFT_STATUS_STOP_ALERT from '../public/status-stop-alert/store'
import SOFT_SERVICE_STATUS_STORE from '../public/service-status/store'
import { has } from 'ramda'

const statusStopStore = SOFT_STATUS_STOP_ALERT()
const serviceStatusStore = SOFT_SERVICE_STATUS_STORE()

const compData = ref<any>({}) // 组件数据

const nginxLoad = {
	active: '活动连接(Active connections)',
	accepts: '总连接次数(accepts)',
	handled: '总握手次数(handled)',
	requests: '总请求数(requests)',
	Reading: '请求数(Reading)',
	Writing: '响应数(Writing)',
	Waiting: '驻留进程(Waiting)',
	worker: '工作进程(Worker)',
	workercpu: 'Nginx占用CPU(Workercpu)',
	workermen: 'Nginx占用内存(Workermen)',
} as AnyObject

export const performanceData = ref<any>([]) // 性能调整数据
export const activeName = ref<string>('service') // 当前激活的tab
export const staticContent = ref<string>('') // 静态内容
export const textLoading = ref<boolean>(false) // 文本加载
export const viewLoading = ref<boolean>(false) // 视图加载
export const tableData = ref<Array<AnyObject>>([]) // 表格数据
export const logMsg = ref<string>('') // 日志信息
export const version = ref<string>('') // 版本
const currentVersion = ref<string>('') // 当前版本
export const versionList = ref<any>([]) // 版本列表

/**
 * @description 获取nginx 性能数据
 */
const getNginxEvent = async () => {
	await useDataHandle({
		loading: viewLoading,
		request: getNginxConf(),
		data: [Array, performanceData],
	})
}

/**
 * @description 保存数据
 */
export const saveNginxData = async () => {
	// 提取performanceData中每一项的value
	let params: any = {}
	performanceData.value.forEach((item: any) => {
		params[item.name] = item.value
	})
	await useDataHandle({
		loading: '正在保存中，请稍后...',
		request: setNginxConf(params),
		message: true,
	})
}

/**
 * @description 获取负载状态
 */
const getNginxLoadEvent = async () => {
	await useDataHandle({
		loading: textLoading,
		request: getNginxStatus(),
		success: (res: any) => {
			if (has('status', res) && !res.status) {
				Message.msg({
					message: res.msg || '获取数据失败',
					type: 'error',
					dangerouslyUseHTMLString: true,
					customClass: 'bt-message-error-html ',
					showClose: true,
				})
			} else {
				tableData.value = []
				const data = ['bytes', 'bytes_read', 'bytes_written']

				Object.keys(res.data).forEach(key => {
					tableData.value.push({
						name: key,
						ps: nginxLoad[key],
						value: data.includes(key) ? getByteUnit(Number(res.data[key])) : res.data[key],
					})
				})

				// 将活动连接放在第一位
				const activeConnectionIndex = tableData.value.findIndex(item => item.name === 'active')
				if (activeConnectionIndex > -1) {
					const [activeConnection] = tableData.value.splice(activeConnectionIndex, 1)
					tableData.value.unshift(activeConnection)
				}
			}
		},
	})
}

/**
 * @description 获取配置文件
 */
const getConfigEvent = async () => {
	await useDataHandle({
		loading: textLoading,
		request: getFileBody({ path: '/www/server/nginx/conf/nginx.conf' }),
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
			path: '/www/server/nginx/conf/nginx.conf',
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
		request: getOpeLogs({ path: '/www/wwwlogs/nginx_error.log' }),
		data: {
			msg: [String, logMsg],
		},
	})
}

/**
 * @description 安装插件
 */
export const switchVersion = async () => {
	if (version.value === currentVersion.value) {
		Message.error('当前版本与选择版本一致')
		return
	}
	try {
		await installPlugin({
			sName: 'nginx',
			version: version.value,
			min_version: '',
		})
		// 打开消息盒子
		msgBoxDialog()
	} catch (error) {
		console.log(error)
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
			getNginxEvent()
			break
		case 'config':
			getConfigEvent() // 获取配置文件
			break
		case 'load':
			getNginxLoadEvent() // 获取负载状态
			break
		case 'logs':
			getErrLogsEvent() // 获取操作日志
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
		name: 'nginx',
	})

	version.value = compData.value.version.split('.')[0] + '.' + compData.value.version.split('.')[1]
	currentVersion.value = compData.value.version.split('.')[0] + '.' + compData.value.version.split('.')[1]
	versionList.value = compData.value.versions
}
