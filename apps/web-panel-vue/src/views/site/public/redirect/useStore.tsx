import { getDataInfo } from '@/api/global'
import { createRedirect, getFileBody, getProjectDomain, getRedirectFile, getRedirectList, modifyRedirect, removeRedirect, setErrorRedirect } from '@/api/site'
import { useDataHandle } from '@/hooks/tools'
import { useSiteStore } from '../../useStore'

const SITE_REDIRECT_STORE = defineStore('SITE-REDIRECT-STORE', () => {
	const { siteType, siteInfo } = useSiteStore()
	const isRefreshList = ref(false) // 是否刷新列表

	/**
	 * @description 修改状态事件
	 */
	const changeStatusEvent = async (params: any) => {
		try {
			const res = await useDataHandle({
				loading: '正在修改，请稍后...',
				request: modifyRedirect(params, siteType.value),
				message: true,
			})
			return { status: res.status, msg: res.msg }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '修改状态失败' }
		}
	}

	const delRedirectEvent = async (params: any) => {
		try {
			const res = await useDataHandle({
				loading: '正在删除，请稍后...',
				request: removeRedirect(params, siteType.value),
				message: true,
			})
			return { status: res.status, msg: res.msg }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '删除重定向失败' }
		}
	}

	/**
	 * @description 获取配置文件内容
	 * @param params
	 */
	const getRedirectFileEvent = async (params: any) => {
		try {
			const isSpecial = ['php', 'html', 'proxy'].includes(siteType.value)
			const res: AnyObject = await useDataHandle({
				loading: '正在获取内容，请稍候...',
				request: isSpecial ? getRedirectFile(params, siteType.value) : getFileBody(params),
			})
			if (siteType.value === 'php' || siteType.value === 'html') {
				return {
					data: {
						content: res.data[0].data,
						redirect_conf_file: res.data[1],
					},
					status: true,
				}
			}
			return {
				data: {
					content: res.data.data,
					redirect_conf_file: params.path,
				},
				status: true,
			}
		} catch (error) {
			console.log(error)
			return { status: false, msg: '获取配置文件失败' }
		}
	}

	/**
	 * @description 获取重定向数据
	 */
	const getRedirectDataEvent = async (params: any) => {
		try {
			const res = await useDataHandle({
				request: getRedirectList(params, siteType.value),
				data: Array,
			})
			return { data: res, total: res.length, other: {} }
		} catch (error) {
			console.log(error)
			return { data: [], total: 0, other: {} }
		}
	}

	/**
	 * @description 提交重定向事件
	 * @param params
	 * @param isEdit
	 * @returns
	 */
	const submitRedirectEvent = async (params: any, isEdit: boolean) => {
		try {
			const res = await useDataHandle({
				loading: '正在提交，请稍后...',
				request: isEdit ? modifyRedirect(params, siteType.value) : createRedirect(params, siteType.value),
				message: true,
			})
			return { status: res.status, msg: res.msg }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '添加重定向失败' }
		}
	}

	/**
	 * @description 获取域名
	 * @param params
	 * @returns
	 */
	const getDomainEvent = async (params: any) => {
		try {
			const isSpecial = ['php', 'html'].includes(siteType.value)
			const { data: res } = await useDataHandle({
				request: isSpecial ? getDataInfo(params) : getProjectDomain(params, siteType.value),
				// data: siteType.value === 'proxy' ? { 'data.domain_list': [Array, 'data'] } : Array,
			})
			if (siteType.value === 'proxy') {
				return { data: res.data.domain_list, status: true }
			} else {
				return { data: Array.isArray(res) ? res : res.data, status: true }
			}
		} catch (error) {
			console.log(error)
			return { status: false, msg: '获取域名失败' }
		}
	}

	/**
	 * @description 提交错误重定向事件
	 * @param params
	 * @param isEdit
	 */
	const submitErrorRedirectEvent = async (params: any, isEdit: boolean) => {
		try {
			const res = await useDataHandle({
				loading: '正在保存，请稍后...',
				request: isEdit || siteType.value === 'html' ? modifyRedirect(params, siteType.value) : setErrorRedirect(params),
				message: true,
			})
			return { status: res.status, msg: res.msg }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '添加错误重定向失败' }
		}
	}

	return {
		getDomainEvent,
		changeStatusEvent,
		delRedirectEvent,
		getRedirectFileEvent,
		getRedirectDataEvent,
		submitRedirectEvent,
		submitErrorRedirectEvent,
		isRefreshList,
	}
})

const useSiteRedirectStore = () => storeToRefs(SITE_REDIRECT_STORE())

export { SITE_REDIRECT_STORE, useSiteRedirectStore }
