import { addServerProxy, bindExtranet, getPortStatus,getPythonPortStatus, modifyServerProxy, removeServerProxy, setJavaStaticFile, unbindExtranet,addPythonServerProxy } from '@/api/site'
import { Message, useDataHandle, useHandleError } from '@/hooks/tools'
import { useSiteStore } from '../../useStore'

const SITE_EXTERNAL_MAP_STORE = defineStore('SITE-EXTERNAL-MAP-STORE', () => {
	const { siteInfo, siteType } = useSiteStore()

	const isRefreshPortList = ref(false) // 是否刷新端口列表

	/**
	 * @description: 设置静态文件
	 */
	const setStaticFileEvent = async (params: any) => {
		try {
			// await staticFormRef.value.validate();
			const { status, index, path } = params
			const res: AnyObject = await useDataHandle({
				loading: '正在设置静态文件...',
				request: setJavaStaticFile({
					status: status ? 1 : 0,
					index,
					path,
					project_name: siteInfo.value.name,
				}),
				message: true,
			})
			return { status: res.status, msg: res.msg }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '设置静态文件失败' }
		}
	}

	const getJavaPortData = async () => {
		try {
			// const res: any = await useDataHandle({
			// loading: tableLoading,
			// request: getPortStatus({ project_name: siteInfo.value.name }),
			// data: { data: Array },
			// })
			const res: any = siteType.value === 'python' ? await getPythonPortStatus({ project_name: siteInfo.value.name }) : await getPortStatus({ project_name: siteInfo.value.name })
			if (!Array.isArray(res.data.data)) return { data: [], total: 0, other: {} }
			return { data: res.data.data, total: res.data.data.length, other: {} }
		} catch (error) {
			console.log(error)
			return { data: [], total: 0, other: {} }
		}
	}

	/**
	 * @description 删除反向代理
	 * @param params
	 * @returns
	 */
	const deleteProxyEvent = async (params: any) => {
		try {
			const res = await useDataHandle({
				loading: '正在删除反向代理映射...',
				request: removeServerProxy(params),
				message: true,
			})
			return { status: res.status, msg: res.msg }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '删除代理失败' }
		}
	}

	/**
	 * @description 修改状态
	 * @param params
	 * @param param1
	 * @returns
	 */
	const changeStatusEvent = async (params: any, { status }: any) => {
		let load = Message.load('正在修改状态，请稍后...')
		try {
			let type = siteType.value
			const requestFun = status ? bindExtranet : unbindExtranet
			const { data: res } = await requestFun(params, type)
			const msg = res.msg || res.data || res.error_msg
			return { status: res.status, msg }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '修改状态失败' }
		} finally {
			load.close()
		}
	}

	/**
	 * @description: 修改反向代理映射
	 */
	const saveProxyMapEvent = async (params: any, isEdit: boolean) => {
		try {
			let requestFn:any = () => {}
			switch(true){
				case siteType.value === 'python':
					// python项目
					requestFn = addPythonServerProxy
					break
				case isEdit:
					// java项目编辑
					requestFn = modifyServerProxy
					break
				case !isEdit:
					// java项目新增
					requestFn = addServerProxy
					break
			}
			const res: AnyObject = await useDataHandle({
				loading: '正在操作中，请稍后...',
				request: requestFn(params),
			})
			return { msg: res.msg, status: res.status }
		} catch (error) {
			useHandleError(error)
		}
	}

	return {
		isRefreshPortList,
		setStaticFileEvent,
		getJavaPortData,
		deleteProxyEvent,
		changeStatusEvent,
		saveProxyMapEvent,
	}
})

const useSiteExternalMapStore = () => {
	return storeToRefs(SITE_EXTERNAL_MAP_STORE())
}

export { useSiteExternalMapStore, SITE_EXTERNAL_MAP_STORE }
