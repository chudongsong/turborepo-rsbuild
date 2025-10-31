import { Message, useConfirm, useHandleError } from '@/hooks/tools'
import { fileSelectionDialog } from '@/public'
import { useGlobalStore } from '@/store/global'
import { formatTime, isArray } from '@/utils'
import { SITE_STORE, useSiteStore } from '../../useStore'
import { maskLayerLimit } from '../flow-setting/useController'
import { SITE_EXTERNAL_MAP_STORE, useSiteExternalMapStore } from './useStore'

const { activeType, siteInfo, siteType, rowData } = useSiteStore()
const { getFileEvent, saveFileEvent, setSiteInfo, getProjectConfig, jumpTabEvent } = SITE_STORE()

const { isRefreshPortList } = useSiteExternalMapStore()
const { setStaticFileEvent, deleteProxyEvent, getJavaPortData, saveProxyMapEvent, changeStatusEvent } = SITE_EXTERNAL_MAP_STORE()

export const staticData = reactive({
	status: siteInfo.value?.project_config?.static_info?.status,
	index: siteInfo.value?.project_config?.static_info?.index || 'index.html',
	path: siteInfo.value?.project_config?.static_info?.path || '',
	popup: false,
}) // 静态文件数据

export const mappingStatus = ref(false) // 外网映射状态
export const mappingType = ref(false) // 外网映射类型
export const proxyPopup = ref(false) // 反向代理弹窗

/**
 * @description: 设置静态文件路径
 */
const setPathEvent = () => {
	// fileSelectionDialog({
	//   type: 'dir',
	//   path: staticData.path,
	//   change: (path: string) => {
	//     staticData.path = path;
	//   },
	// });
}

/**
 * @description: 设置静态文件
 */
export const setStaticFile = async (params: any) => {
	// await staticFormRef.value.validate();
	const res = await setStaticFileEvent(params)
	if (res.status) {
		staticData.popup = false
		getInfo()
	}
	return res.status
}

/**
 * @description 获取域名信息
 * @returns
 */
export const getInfo = async () => {
	try {
		let { project_type, name } = siteInfo.value
		let params = project_type === 'python' ? { name } : { project_name: name }
		const res = await getProjectConfig(params)
		if (res.status && res.data.name) {
			const { project_config } = res.data
			mappingStatus.value = !!project_config.bind_extranet
			mappingType.value = project_config.java_type !== 'springboot' && project_type === 'java'
			if (project_config) setSiteInfo(res.data)

			if (project_type === 'java') {
				// getJavaPortData();
			}
		}
	} catch (error) {
		console.log(error)
		return { status: false, msg: '获取域名信息失败' }
	}
}

/**
 * @description: 打开静态文件弹窗
 */
export const openStaticPopup = () => {
	if (!mappingStatus.value) return Message.error('请先点击上方启用外网映射后再使用')
	staticData.index = siteInfo.value.project_config?.static_info?.index || 'index.html'
	staticData.path = siteInfo.value.project_config?.static_info?.path || ''
	staticData.status = true
	staticData.popup = true
}

/**
 * @description: 设置源路由
 * @param {string} val
 */
const setSourceRouteEvent = (val: string) => {
	// rowData.value.proxy_dir = val.replace(/ /g, '').replace(/\/\//g, '/')
	// rowData.value.rewrite.src_path = `${rowData.value.proxy_dir}/`.replace(/ /g, '').replace(/\/\//g, '/')
}

/**
 * @description: 删除反向代理映射
 */
export const deleteProxy = async (row: any) => {
	const params = {
		proxy_id: row.proxy_id,
		site_name: siteInfo.value.name,
	}
	const res = await deleteProxyEvent(params)
	if (res.status) {
		// resetForm();
		isRefreshPortList.value = true
	}
	return res.status
}

/**
 * @description: 处理add_headers
 */
export const setHeaders = (headersStr: string) => {
	let env = headersStr.split('\n').filter(item => item !== '')
	let arrs: any = []
	env.forEach(item => {
		let arr = item.split('=')
		arrs.push({
			k: arr[0],
			v: arr[1],
		})
	})
	return arrs
}

/**
 * @description: 路径处理逻辑提取
 */
export const normalizePath = (path: string) => {
	return `${path}/`.replace(/\s+/g, '').replace(/\/\//g, '/')
}

/**
 * @description: 反向代理映射准备参数
 */
export const getPrepareParams = (row: AnyObject) => {
	let paramsType: AnyObject = {
		python: {
			site_name: siteInfo.value.name,
			proxy_port: row.proxy_port,
			status: row.status ? 1 : 0,
		},
		java: {
			...row,
			status: row.status ? 1 : 0,
			site_name: siteInfo.value.name,
			rewrite: JSON.stringify(row.rewrite),
			add_headers: JSON.stringify(setHeaders(row.add_headers)),
		},
	}
	let params: any = paramsType[siteType.value]
	if (!params.isEdit) delete params.proxy_id
	delete params.isEdit
	return params
}

/**
 * @description 修改外网映射状态
 * @param { boolean } status 外网映射状态
 */
export const changeStatus = async (status: boolean | string | number) => {
	try {
		const type = siteType.value
		if (type !== 'java') {
			mappingStatus.value = !status

			await useConfirm({
				width: 40,
				title: '外网映射',
				content: `${status ? '开启' : '关闭'}外网映射后，${status ? '可以通过绑定域名进行访问' : '已绑定域名将取消关联访问'}，是否继续操作？`,
				icon: 'warning-filled',
			})
		}

		const { name, project_config } = siteInfo.value
		const paramsMap: any = {
			python: { data: JSON.stringify({ name: name }) },
			java: { data: JSON.stringify({ project_name: name }) },
			default: {
				data: JSON.stringify({
					project_name: name,
					domains: project_config.domains,
				}),
			},
		}

		const params = paramsMap[type] || paramsMap.default
		const res = await changeStatusEvent(params, { status })
		Message.request(res)
		if (res.status) {
			getInfo()
			isRefreshPortList.value = true
		}
		// 处理响应
		handleResponseEvent(res)
	} catch (error) {
		useHandleError(error)
	}
}

/**
 * @description 处理响应
 * @param { any } res 响应数据
 * @param { string } type 项目类型
 */
const handleResponseEvent = (res: any) => {
	const type = siteType.value

	// 处理java类型且包含域名的情况
	if (type === 'java' && res.msg.includes('域名')) {
		mappingStatus.value = false
		const goDomains = () => {
			jumpTabEvent('domain')
		}
		Message.msg({
			message: `${res.msg}，<span class="text-primary cursor-pointer go-domains">前往添加域名</span>`,
			duration: 3000,
			dangerouslyUseHTMLString: true,
			type: 'error',
			onClose: () => {
				if (goDomains) {
					window.removeEventListener('click', goDomains)
				}
			},
		})

		if (goDomains) {
			window.addEventListener('click', goDomains, {
				once: true,
			})
		}
		return
	}

	// 处理非java类型的情况
	if (type !== 'java') {
		if (res.status) {
			maskLayerLimit.value = false
		}
		res.status || res.data.status ? Message.success(res.data?.msg || res.data?.data || res.msg) : Message.error(res.data?.error_msg || res.data?.msg || res.data?.data)
		return
	}

	// 处理java类型但不包含域名的情况
	Message.request(res)
}

export const saveProxyMap = async (param: any, validate: any) => {
	// 校验根路由
	if (siteInfo.value.project_config?.static_info?.status && param.value.proxy_dir === '/') {
		Message.error('项目已存在根路由【/】配置，无法设置该代理目录')
		return false
	}

	// 校验表单
	await validate()

	//  访问路由默认跟代理路由一致
	param.value.rewrite.src_path = param.value.proxy_dir

	try {
		// 删除反向代理
		if (!param.value.status && param.value.proxy_id) {
			proxyPopup.value = false
			return deleteProxy(param.value)
		} else {
			param.value.rewrite.src_path = normalizePath(param.value.rewrite.src_path)
			param.value.rewrite.target_path = normalizePath(param.value.rewrite.target_path)

			let params = getPrepareParams(param.value)
			const res: any = await saveProxyMapEvent(params, param.value.isEdit)
			Message.request(res)
			if (res.status) {
				proxyPopup.value = false
				isRefreshPortList.value = true
			}
			return res.status
		}
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 		初始化外网映射
 */
export const initExternalMap = async () => {
	mappingStatus.value = Boolean(siteInfo.value.project_config?.bind_extranet)
	getInfo()
}
