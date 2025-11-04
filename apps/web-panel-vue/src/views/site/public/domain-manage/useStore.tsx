import { getDataInfo } from '@/api/global'
import { addDomain, addProjectDomain, getHttpsPort, getOtherDomainList, multiRemoveProjectDomain, removeDomain, removeProjectDomain, setHttpsPort, setProxyHttpsPort } from '@/api/site'
import { Message, useDataHandle } from '@/hooks/tools'
import { useSiteStore } from '../../useStore'
import { isArray } from '@/utils'

const SITE_DOMAIN_STORE = defineStore('SITE-DOMAIN-STORE', () => {
	const { siteType, siteInfo } = useSiteStore()

	const port = ref() // 端口
	const isRefreshDomain = ref(false) // 是否刷新域名列表

	/**
	 * @description 获取域名信息
	 * @param params
	 * @param config
	 * @returns
	 */
	const getDomainListEvent = async (params: any, config: { isSpecial: boolean; isPort: boolean }) => {
		try {
			const res: AnyObject = await useDataHandle({
				request: config.isSpecial ? await getDataInfo(params) : await getOtherDomainList(params, siteType.value),
				// data: config.isPort
				// 	? {
				// 			'data.domain_list': Array,
				// 			'data.https_port': [Number, data => Number(data.https_port) || ''],
				// 	  }
				// 	: Array,
				...(config.isPort ? {} : { data: Array }),
			})
			return { data: config.isPort ? res.data.data : res, status: true }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '获取域名信息失败' }
		}
	}

	/**
	 * @description 获取https端口
	 */
	const getPortEvent = async () => {
		try {
			const res = await getHttpsPort({ siteName: siteInfo.value.name })
			port.value = res.data || '未开启'
			// res.data && (portForm.port = res.data);
			return { data: res.data, status: res.status }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '获取https端口失败' }
		}
	}

	/**
	 * @description 设置https端口
	 * @param params
	 * @returns
	 */
	const setPortEvent = async (params: any) => {
		try {
			const isProxy = siteType.value === 'proxy'
			const requestFun = isProxy ? setProxyHttpsPort : setHttpsPort
			const res: AnyObject = await useDataHandle({
				loading: '正在设置HTTPS端口，请稍候...',
				request: requestFun(params),
				message: true,
			})
			return { ...res }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '设置https端口失败' }
		}
	}

	/**
	 * @description 添加域名
	 * @param params
	 * @returns
	 */
	const addDomainEvent = async (params: any) => {
		try {
			const res = await useDataHandle({
				loading: '正在添加域名，请稍后...',
				request: siteType.value === 'php' ? addDomain(params) : addProjectDomain(params, siteType.value),
			})
			return { status: res.status, msg: res.msg, data: res.data }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '添加域名失败' }
		}
	}

	/**
	 * @description 删除域名
	 * @param params
	 * @returns
	 */
	const delDomainEvent = async (params: any) => {
		let loading = Message.load('正在删除域名，请稍后...')
		try {
			const type = siteType.value
			const res = type === 'php' ? await removeDomain(params) : await removeProjectDomain(params, type)
			const data = res.data?.hasOwnProperty('status') ? res.data : res
			if (isArray(data.data)) {
				return { status: data.status, msg: data.data[0].msg }
			}
			return {
				status: data.status,
				msg: data?.data || data?.error_msg || data.msg,
			}
			// Message.request({
			// 	status: data.status,
			// 	msg: data?.data || data?.error_msg || data.msg,
			// })
		} catch (error) {
			console.log(error)
			return { status: false, msg: '删除域名失败' }
		} finally {
			loading.close()
		}
	}

	/**
	 * @description 批量删除域名
	 */
	const delMultDomainEvent = async (params: any) => {
		const load = Message.load('正在删除域名，请稍后...')
		try {
			let result: any = [] // 结果
			const { data } = await multiRemoveProjectDomain(params, siteType.value)
			if (data?.success) {
				result = data.success.map((item: any) => ({ name: item, status: true })) // 成功
				const error = Object.entries(data.error).map(([key, value]: any) => ({ name: key, msg: value, status: false })) // 失败
				result = result.concat(error)
			}
			if (Array.isArray(data.data)) {
				result = data.data.map((item: any) => ({ name: item?.name || item?.domain, msg: item.msg, status: item.status }))
			}
			return { data: result, status: true }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '删除域名失败' }
		} finally {
			load.close()
		}
	}

	return {
		isRefreshDomain,
		port,
		delMultDomainEvent,
		getDomainListEvent,
		getPortEvent,
		addDomainEvent,
		setPortEvent,
		delDomainEvent,
	}
})

const useSiteDomainStore = () => {
	return storeToRefs(SITE_DOMAIN_STORE())
}

export { useSiteDomainStore, SITE_DOMAIN_STORE }
