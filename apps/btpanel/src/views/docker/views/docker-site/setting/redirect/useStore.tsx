import { saveFileBody,getRedirectList } from '@/api/site'
import { createRedirect, getRedirectFile, modifyRedirect, removeRedirect } from '@/api/docker'
import {getDockerSiteDomains} from '@/api/docker'
import { useDataHandle } from '@/hooks/tools'


const SITE_REDIRECT_STORE = defineStore('DOCKERSITE-REDIRECT-STORE', () => {
	const isRefreshList = ref(false) // 是否刷新列表

	/**
	 * @description 修改状态事件
	 */
	const changeStatusEvent = async (params: any) => {
		try {
			const res:any = await useDataHandle({
				loading: '正在修改，请稍后...',
				request: modifyRedirect(params),
				message: true,
			})
			return { status: res.status, msg: res.msg }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '修改状态失败' }
		}
	}

	/**
	 * @description 保存文件内容
	 * @param { string } data 内容
	 * @param { string } encoding 编码
	 * @param { string } path 路径
	 */
	const saveFileEvent = async (params: { data: string; encoding: string; path: string }) => {
		try {
			const res:any = await useDataHandle({
				loading: '正在保存内容，请稍候...',
				request: saveFileBody(params),
				data: {
					status: Boolean,
					msg: String,
				},
				message: true,
			})
			return { status: res.status, msg: res.msg }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '保存文件失败' }
		}
	}
	const delRedirectEvent = async (params: any) => {
		try {
			const res:any = await useDataHandle({
				loading: '正在删除，请稍后...',
				request: removeRedirect(params),
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
			const res: AnyObject = await useDataHandle({
				loading: '正在获取内容，请稍候...',
				request: getRedirectFile(params),
			})
			console.log(res)
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
				request: getRedirectList(params,'proxy'),
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
			const res:any = await useDataHandle({
				loading: '正在提交，请稍后...',
				request: isEdit ? modifyRedirect(params) : createRedirect(params),
				message: true,
			})
			return { status: res.status, msg: res.msg }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '添加重定向失败' }
		}
	}
	
	/**
	 * @description 获取域名信息
	 * @param params
	 * @param config
	 * @returns
	 */
	const getDomainListEvent = async (params: any,) => {
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

	return {
		changeStatusEvent,
		delRedirectEvent,
		getRedirectFileEvent,
		getRedirectDataEvent,
		submitRedirectEvent,
		isRefreshList,
		saveFileEvent,
		getDomainListEvent,
	}
})

const useSiteRedirectStore = () => storeToRefs(SITE_REDIRECT_STORE())

export { SITE_REDIRECT_STORE, useSiteRedirectStore }
