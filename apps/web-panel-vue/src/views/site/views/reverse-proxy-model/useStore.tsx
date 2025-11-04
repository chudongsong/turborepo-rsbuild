import { addProxyProject, batchDelNginx, delProxyProject, getProxyConfigFile, proxyTcpAction } from '@/api/site'
import { Message, useDataHandle, useHandleError } from '@/hooks/tools'
import { useSiteStore } from '../../useStore'

const SITE_PROXY_STORE = defineStore(
	'SITE-PROXY-STORE',
	() => {
		const { isRefreshList } = useSiteStore()
		const proxyType = ref('http')

		const deleteProxySiteEvent = async (row: any, status: boolean) => {
			try {
				let params: any = {
					remove_path: status ? 1 : 0,
					id: row.id,
					site_name: row.name,
				}
				const res: AnyObject = await useDataHandle({
					loading: '正在删除反向代理项目，请稍候...',
					request: delProxyProject(params),
					message: true,
				})
				isRefreshList.value = true
				return { status: res.status, msg: res.msg }
			} catch (error) {
				console.log(error)
				return { status: false, msg: '删除项目失败' }
			}
		}

		/**
		 * @description 批量删除反向代理项目
		 */
		const multDeleteProxySiteEvent = async (params: any) => {
			try {
				const res: AnyObject = await useDataHandle({
					loading: '正在删除反向代理项目，请稍候...',
					request: batchDelNginx(params),
					message: false,
				})
				isRefreshList.value = true
				return {
					status: res.status,
					msg: res.msg,
					data: res.data.data.map((item: any) => ({
						...item,
						name: item.site_name,
					})),
				}
			} catch (error) {
				return { status: false, msg: '删除项目失败', data: [] }
			}
		}

		const addProxySiteEvent = async (params: any) => {
			try {
				const res = await addProxyProject(params)
				return { ...res }
			} catch (error) {
				useHandleError(error)
			}
		}

		const addProxyTcpEvent = async (params: any) => {
			try {
				const res = await proxyTcpAction(params)
				return { ...res }
			} catch (error) {
				useHandleError(error)
			}
		}
		const getConfigEvent = async (params: any) => {
			try {
				const { data: res } = await getProxyConfigFile(params)
				if (!res.status) Message.error(res.msg)
				return { data: res.data, status: res.status }
			} catch (error) {
				console.log(error)

				return { msg: '获取配置失败', status: false }
			}
		}

		return { proxyType, deleteProxySiteEvent, multDeleteProxySiteEvent, addProxySiteEvent, addProxyTcpEvent, getConfigEvent }
	},
	{
		persist: [
			{
				storage: localStorage,
				paths: ['proxyType'],
			},
		],
	}
)

const useSieProxyStore = () => {
	return storeToRefs(SITE_PROXY_STORE())
}

export { useSieProxyStore, SITE_PROXY_STORE }
