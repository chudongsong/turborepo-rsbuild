import { getAlarmTaskList, getPushList, setPushConfig, upDateNewAlarmTask } from '@/api/global'
import { createRules, getDirUserINI, getJavaProjectInfo, getProjectRunState, getRestartProjectConfig, getSystemUserListAsync, modifyProjectAsync, setNewAlarmTask, setPath, setRestartProjectConfig } from '@/api/site'
import { useDataHandle } from '@/hooks/tools'
import { useSiteStore } from '../../useStore'

const SITE_SERVICE_STORE = defineStore('SITE-SERVICE-STORE', () => {
	const { siteInfo } = useSiteStore()

	/**
	 * @description 改变状态
	 * @param val
	 */
	const setAlertConfigEvent = async (params: any) => {
		try {
			const res = await useDataHandle({
				request: params.template_id ? upDateNewAlarmTask(params) : setNewAlarmTask({ ...params, template_id: '9' }),
				message: true,
			})
			return { data: res.data, status: res.status }
		} catch (error) {
			console.log(error)
			return { msg: '修改状态失败', status: false }
		}
	}

	/**
	 * @description 获取告警配置
	 * @returns
	 */
	const getAlarmConfig = async () => {
		try {
			const res = await getAlarmTaskList()
			// const res: AnyObject = await useDataHandle({
			//   request: getPushList(),
			//   data: { site_push: Object },
			// });
			return { data: res.data.data, status: res.status }
		} catch (error) {
			console.log(error)
			return { msg: '获取告警配置失败', status: false }
		}
	}

	/**
	 * @description 获取java服务
	 */
	const getJavaServiceEvent = async (params: any) => {
		try {
			const res = await getJavaProjectInfo(params)
			return { data: res.data, status: res.status }
		} catch (error) {
			console.log(error)
			return { msg: '获取项目配置失败', status: false }
		}
	}

	/**
	 * @description 获取重启配置
	 * @param params
	 * @returns
	 */
	const getRestartConfigEvent = async (params: any) => {
		try {
			const { data } = await useDataHandle({
				request: getRestartProjectConfig(params),
			})
			return { data, status: true }
		} catch (error) {
			console.log(error)
			return { msg: '获取重启配置失败', status: false }
		}
	}

	const setRestartStatusEvent = async (params: any) => {
		try {
			const res: AnyObject = await useDataHandle({
				loading: '正在设置状态，请稍后...',
				request: setRestartProjectConfig(params),
				message: true,
			})
			return { data: res.data, status: res.status }
		} catch (error) {
			console.log(error)
			return { msg: '设置状态失败', status: false }
		}
	}

	/**
	 * @description 保存网站目录
	 */
	const saveSitePathEvent = async (params: any) => {
		try {
			const res = await useDataHandle({
				loading: '正在保存中，请稍后...',
				request: setPath(params),
				message: true,
			})
		} catch (error) {
			console.log(error)
		}
	}

	const getRunInfoEvent = async () => {
		try {
			const res = await useDataHandle({
				request: getProjectRunState({ sitename: siteInfo.value.name }),
			})
			return { data: res.data, status: res.status }
		} catch (error) {
			console.log(error)
			return { msg: '获取运行信息失败', status: false }
		}
	}

	const getAsyncSystemUserList = async () => {
		try {
			const res = await useDataHandle({
				request: getSystemUserListAsync(),
				data: Array,
			})
			return { data: res, status: true }
		} catch (error) {
			console.log(error)
			return { msg: '获取系统用户失败', status: false }
		}
	}

	const getDirInIEvent = async (params: any) => {
		try {
			const res: any = await useDataHandle({
				request: getDirUserINI(params),
				data: { 'runPath.dirs': [Array, 'data'] },
			})
			return { data: res.data, status: res.data ? true : false }
		} catch (error) {
			console.log(error)
		}
	}

	const releasePortEvent = async (params: any) => {
		try {
			const res = await useDataHandle({
				loading: '正在放行端口，请稍后...',
				request: createRules(params),
				message: true,
			})
			return { msg: res.msg, status: res.status }
		} catch (error) {
			console.log(error)
			return { msg: '释放端口失败', status: false }
		}
	}

	const submitAsyncConfigEvent = async (params: any) => {
		try {
			const res = await useDataHandle({
				loading: '正在保存，请稍后...',
				request: modifyProjectAsync(params),
				message: true,
			})
			return { status: res.status, msg: res.msg }
		} catch (error) {
			console.log(error)
			return { msg: '保存失败', status: false }
		}
	}

	return {
		setAlertConfigEvent,
		getAlarmConfig,
		getJavaServiceEvent,
		getRestartConfigEvent,
		setRestartStatusEvent,
		saveSitePathEvent,
		getRunInfoEvent,
		getDirInIEvent,
		releasePortEvent,
		getAsyncSystemUserList,
		submitAsyncConfigEvent,
	}
})

const useSiteServiceStore = () => storeToRefs(SITE_SERVICE_STORE())

export { useSiteServiceStore, SITE_SERVICE_STORE }
