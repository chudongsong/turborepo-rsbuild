import { getDockerSiteDomains, addDockerSiteDomain, delDockerSiteDomain, setDockerSiteHttpsPort } from '@/api/docker'
import { Message, useDataHandle } from '@/hooks/tools'
import { useDockerSiteStore } from '@docker/views/docker-site/useStore'
import { isArray } from '@/utils'
import { assembBatchResults } from '@/public'

const SITE_DOMAIN_STORE = defineStore('DOCKERSITE-DOMAIN-STORE', () => {
	const port = ref() // 端口
	const isRefreshDomain = ref(false) // 是否刷新域名列表

	/**
	 * @description 获取域名信息
	 * @param params
	 * @param config
	 * @returns
	 */
	const getDomainListEvent = async (params: any) => {
		try {
			const res: AnyObject = await useDataHandle({
				request: getDockerSiteDomains(params),
			})
			return { data: res.data, status: true }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '获取域名信息失败' }
		}
	}

	/**
	 * @description 设置https端口
	 * @param params
	 * @returns
	 */
	const setPortEvent = async (params: any) => {
		try {
			const res: AnyObject = await useDataHandle({
				loading: '正在设置HTTPS端口，请稍候...',
				request: setDockerSiteHttpsPort(params),
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
			const res: any = await useDataHandle({
				loading: '正在添加域名，请稍后...',
				request: addDockerSiteDomain(params),
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
			const res = await delDockerSiteDomain(params)
			const data = res.data?.hasOwnProperty('status') ? res.data : res
			if (isArray(data.data)) {
				return { status: data.status, msg: data.data[0].msg }
			}
			return {
				status: data.status,
				msg: data?.data || data?.error_msg || data.msg,
			}
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
			const { data } = await delDockerSiteDomain(params)
			// let result = data.success.map((item: any) => ({ name: item, status: true })) // 成功
			// const error = Object.entries(data.error).map(([key, value]: any) => ({ name: key, msg: value, status: false })) // 失败
			// result = result.concat(error)
			const { data: result } = assembBatchResults(data)
			let res = result.map((item: any) => ({ name: item.domain, ...item }))
			return { data: res, status: true }
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
		addDomainEvent,
		setPortEvent,
		delDomainEvent,
	}
})

const useSiteDomainStore = () => {
	return storeToRefs(SITE_DOMAIN_STORE())
}

export { useSiteDomainStore, SITE_DOMAIN_STORE }
