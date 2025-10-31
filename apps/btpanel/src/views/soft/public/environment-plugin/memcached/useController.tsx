import { getFileBody, getMemcachedStatus, setMemcachedCache, installPlugin } from '@api/soft'
import { saveFileBody } from '@api/global'
import { getByteUnit } from '@utils/index'
import { msgBoxDialog } from '@/public/index'
import { Message, useDataHandle } from '@hooks/tools'
import SOFT_SERVICE_STATUS_STORE from '../public/service-status/store'

const serviceStatusStore = SOFT_SERVICE_STATUS_STORE()

const compData = ref<any>({}) // 组件数据

const memcachedLoad = {
	bind: '监听IP',
	port: '监听端口',
	cachesize: '最大缓存容量',
	maxconn: '最大连接数限制',
	curr_connections: '当前打开的连接数',
	cmd_get: 'GET请求数',
	get_hits: 'GET命中次数',
	get_misses: 'GET失败次数',
	hit: 'GET命中率',
	curr_items: '当前被缓存的数据行数',
	evictions: '因内存不足而被清理的缓存行数',
	bytes: '当前已使用内存',
	bytes_read: '请求总大小',
	bytes_written: '发送总大小',
} as AnyObject

export const activeName = ref<string>('service') // 当前激活的tab
export const staticContent = ref<string>('') // 静态内容
export const textLoading = ref<boolean>(false) // 文本加载
export const viewLoading = ref<boolean>(false) // 视图加载
export const tableData = ref<Array<AnyObject>>([]) // 表格数据

export const performanceForm = reactive({
	ip: '',
	cachesize: '',
	maxconn: '',
	port: '',
	btn_set_memcached: '',
}) // 性能调整数据
export const version = ref<string>('') // 版本
export const versionList = ref<any>([]) // 版本列表

/**
 * @description 获取redis数据
 */
const getMemcachedEvent = async () => {
	await useDataHandle({
		loading: textLoading,
		request: getMemcachedStatus(),
		success: (res: any) => {
			performanceForm.ip = res.data.bind
			performanceForm.cachesize = res.data.cachesize
			performanceForm.maxconn = res.data.maxconn
			performanceForm.port = res.data.port
		},
	})
}

/**
 * @description 保存redis数据
 */
export const saveMemcachedData = async () => {
	await useDataHandle({
		loading: '正在保存中，请稍后...',
		request: setMemcachedCache(performanceForm),
		message: true,
	})
}

/**
 * @description 获取负载状态
 */
const getMemcachedStatusEvent = async () => {
	await useDataHandle({
		loading: textLoading,
		request: getMemcachedStatus(),
		success: (res: any) => {
			tableData.value = []
			const data = ['bytes', 'bytes_read', 'bytes_written']
			Object.keys(res.data).forEach(key => {
				if (key !== 'limit_maxbytes') {
					tableData.value.push({
						name: key,
						ps: memcachedLoad[key],
						value: data.includes(key) ? getByteUnit(Number(res.data[key])) : res.data[key],
					})
				}
			})
		},
	})
}

/**
 * @description 获取配置文件
 */
const getConfigEvent = async () => {
	await useDataHandle({
		loading: textLoading,
		request: getFileBody({ path: '/etc/init.d/memcached' }),
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
			path: '/etc/init.d/memcached',
			data: staticContent.value,
			encoding: 'utf-8',
		}),
		message: true,
	})
}

/**
 * @description 安装插件
 */
export const switchVersion = async (compData: any) => {
	let [major, minor] = compData.version.split('.')
	let oldVersion = [major, minor].join('.')
	if (version.value === oldVersion) {
		return Message.error('当前版本与选择版本一致')
	}
	try {
		await installPlugin({
			sName: 'memcached',
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
			getMemcachedEvent()
			break
		case 'config':
			getConfigEvent() // 获取配置文件
			break
		case 'load':
			getMemcachedStatusEvent() // 获取负载状态
			break
	}
}

export const init = (data?: any) => {
	activeName.value = 'service'
	if (data) compData.value = data
	// 加载服务状态
	serviceStatusStore.init(compData.value)

	version.value = compData.value.version.split('.')[0] + '.' + compData.value.version.split('.')[1]
	versionList.value = compData.value.versions
}
