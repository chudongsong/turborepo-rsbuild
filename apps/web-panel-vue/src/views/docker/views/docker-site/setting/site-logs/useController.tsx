
import { useHandleError } from '@/hooks/tools'
import { useDockerSiteStore } from '@docker/views/docker-site/useStore'
import { SITE_LOGS_STORE } from './useStore'
import {getGlobalConfig} from '@docker/views/docker-site/setting/global-config/useController'


import ErrorLog from '@docker/views/docker-site/setting/site-logs/error-log.vue'
import ResponseLog from '@docker/views/docker-site/setting/site-logs/response-log.vue'
import Config from '@docker/views/docker-site/setting/site-logs/config.vue';

const { getErrorLogsEvent, getResLogEvent } = SITE_LOGS_STORE()
const { siteInfo } = useDockerSiteStore()

export const logLoading = ref(false) // 是否正在加载日志
export const errorLogData = ref({
	logs: '', // 日志内容
	size: '0 b', // 日志大小
}) // 错误日志数据

export const tabActive = ref<string>('response') // tab默认选中
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
		label: '配置',
		name: 'config',
		lazy: true,
		render: () => <Config />,
	},
])

export const initLogs = () => {
	tabActive.value = siteInfo.value?.tabName || 'response'
}

/**
 * @description 获取错误日志
 */
export const getErrorLogs = async () => {
	const name = siteInfo.value.name

	try {
		logLoading.value = true

		const res = await getErrorLogsEvent({ site_name: name, type: 'error' })

		errorLogData.value.size = res.data.size || '0 b'
		errorLogData.value.logs = res.data.msg || '暂无日志信息'

		return res
	} catch (error) {
		useHandleError(error)
		return { msg: '获取错误日志失败', status: false }
	} finally {
		logLoading.value = false
	}
}
export const responseLogData = reactive<any>({
	alert: false,
	showIp: false,
	ipData: 0,
	logs: '',
	size: '0 b',
})
/**
 * @description 获取日志
 */
export const getResLogs = async (name: string = siteInfo.value.name) => {

	try {
		logLoading.value = true
		const res = await getResLogEvent({ site_name: name, type: 'access' })
			responseLogData.logs = res.data.msg || '暂无日志信息'
			responseLogData.size = res.data.size || '0 b'
		return res
	} catch (error) {
		useHandleError(error)
		return { msg: '获取日志失败', status: false }
	} finally {
		logLoading.value = false
	}
}

export const initResLog = async () => {
	await getResLogs()
	getGlobalConfig()
}
