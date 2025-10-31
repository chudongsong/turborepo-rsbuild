import { saveFileBody } from '@api/global'
import { getFileBody, getOpeLogs, installPlugin } from '@api/soft'
import { msgBoxDialog } from '@/public/index'
import { Message, useDataHandle } from '@/hooks/tools'
import SOFT_SERVICE_STATUS_STORE from '../public/service-status/store'

const serviceStatusStore = SOFT_SERVICE_STATUS_STORE()

const compData = ref<any>({}) // 组件数据

export const activeName = ref<string>('service') // 当前激活的tab
export const staticContent = ref<string>('') // 静态内容
export const textLoading = ref<boolean>(false) // 文本加载
export const logMsg = ref<string>('') // 日志信息
export const version = ref<string>('') // 版本
export const versionList = ref<any>([]) // 版本列表

/**
 * @description 获取x配置文件
 */
const getConfigEvent = async () => {
	await useDataHandle({
		loading: textLoading,
		request: getFileBody({ path: '/www/server/tomcat/conf/server.xml' }),
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
			path: '/www/server/tomcat/conf/server.xml',
			data: staticContent.value,
			encoding: 'utf-8',
		}),
		message: true,
	})
}

/**
 * @description 获取操作日志
 */
const getOpeLogsEvent = async () => {
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
export const switchVersion = async (compData: any) => {
	let [major] = compData.version.split('.')
	if (version.value === major) {
		Message.error('当前版本与选择版本一致')
		return
	}
	try {
		await installPlugin({
			sName: 'tomcat',
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
		case 'config':
			// 获取配置文件
			getConfigEvent()
			break
		case 'logs':
			// 获取操作日志
			getOpeLogsEvent()
			break
	}
}

export const init = (data?: any) => {
	activeName.value = 'service'
	if (data) compData.value = data
	// 加载服务状态
	serviceStatusStore.init(compData.value)

	version.value = compData.value.version[0]
	versionList.value = compData.value.versions
}
