import { saveFileBody } from '@api/global'
import { getFileBody, getOpenLiteSpeed, setOpenLiteSpeed } from '@api/soft'
import { useDataHandle } from '@hooks/tools'
import SOFT_SERVICE_STATUS_STORE from '../public/service-status/store'

const serviceStatusStore = SOFT_SERVICE_STATUS_STORE()

const compData = ref<any>({}) // 组件数据

const openLiteSpeedLoad: any = {
	enableGzipCompress: '为静态和动态响应启用GZIP/Brotli压缩.',
	gzipCompressLevel: '指定应用于动态内容的GZIP压缩级别。范围从1（最低）到9（最高）.',
	maxSSLConnections:
		'指定服务器将接受的最大并发SSL连接数<br/>\
			#因为总的并发SSL和非SSL连接不能超过“Max connections”指定的限制,<br>\
			#允许的并发SSL连接的实际数目必须低于此限制.',
	maxConnections:
		'指定服务器可以接受的最大并发连接数.<br/>\
			#这包括纯TCP连接和SSL连接',
	connTimeout: '指定在处理一个请求期间允许的最大连接空闲时间（秒）.',
	maxKeepAliveReq: '指定可通过保持活动（持久）会话服务的最大请求数.',
}

export const activeName = ref<string>('service') // 当前激活的tab
export const staticContent = ref<string>('') // 静态内容
export const textLoading = ref<boolean>(false) // 文本加载
export const viewLoading = ref<boolean>(false) // 视图加载
export const paramData = ref<any>([]) // 参数调整数据
export const helpList = [
	{
		content: '此处为openlitespeed主配置文件,若您不了解配置规则,请勿随意修改',
	},
]

/**
 * @description 获取openlitespeed配置
 */
export const getOpenLiteSpeedConf = async () => {
	await useDataHandle({
		loading: viewLoading,
		request: getOpenLiteSpeed(),
		success: res => {
			paramData.value = []
			Object.keys(res.data).forEach(key => {
				paramData.value.push({
					name: key,
					ps: openLiteSpeedLoad[key],
					value: key === 'enableGzipCompress' ? res.data[key][0] === '1' : res.data[key][0],
				})
			})
		},
	})
}

/**
 * @description 获取x配置文件
 */
const getConfigEvent = async () => {
	await useDataHandle({
		loading: textLoading,
		request: getFileBody({ path: '/usr/local/lsws/conf/httpd_config.conf' }),
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
			path: '/usr/local/lsws/conf/httpd_config.conf',
			data: staticContent.value,
			encoding: 'utf-8',
		}),
		message: true,
	})
}

/**
 * @description 保存参数设置
 */
export const saveSetting = async () => {
	let array: any = {}
	paramData.value.forEach((item: any) => {
		array[item.name] = item.name === 'enableGzipCompress' ? (item.value ? '1' : '0') : item.value
	})
	await useDataHandle({
		loading: '正在保存中，请稍后...',
		request: setOpenLiteSpeed({ array: JSON.stringify(array) }),
		message: true,
	})
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
		case 'config':
			// 获取配置文件
			getConfigEvent()
			break
		case 'setting':
			getOpenLiteSpeedConf()
	}
}

export const init = (data?: any) => {
	activeName.value = 'service'
	if (data) compData.value = data
	// 加载服务状态
	serviceStatusStore.init(compData.value)
}
