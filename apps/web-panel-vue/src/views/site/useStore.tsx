import { advanceCheckPort, createProject, getFileBody, getPhpVersion, getProjectInfo, getProjectList, getSiteTypes, getSystemUserList, modifyProject, removeProject, saveFileBody, setProject } from '@/api/site'
import { SelectOptionProps } from '@/components/form/bt-select/types'
import { Message, useDataHandle } from '@/hooks/tools'
import { useRoute } from 'vue-router'
import { getPageTotal, isString } from '@/utils'
import { ResponseResult } from '@/types'
import { useGlobalStore } from '@/store/global'

const SITE_STORE = defineStore('SITE-STORE', () => {
	const { mainWidth } = useGlobalStore()

	const settingTabActive = ref('') // 设置页面tab激活项
	const isJump = ref(false) // 是否跳转tab
	const activeType = computed(() => {
		const name = (useRoute()?.name || 'php') as string
		return name === 'otherModel' ? 'other' : name.replace('site-', '')
	})
	const isRefreshList = ref(false) // 是否刷新列表
	const isBindExtranet = ref(false) // 是否绑定外网映射
	const siteInfo = ref<any>({
		addtime: '',
		edate: '0000-00-00',
		id: null,
		index: null,
		listen: [],
		listen_ok: true,
		load_info: {},
		name: '',
		path: '',
		project_config: {},
		project_type: '',
		ps: '',
		rname: '',
		run: false,
		ssl: {},
		status: '',
		stop: '',
		type_id: 0,
	}) // 站点信息
	const siteType = ref('') // 站点类型
	const selectedList = ref([])
	const batchConfig = ref({
		enable: false,
		exclude: [],
	}) // 批量配置

	const isSiteMult = ref(false) // 是否多选

	const rowData = ref()

	const searchWidth = computed(() => {
		if (mainWidth.value > 1530) return 320
		if (mainWidth.value > 1400) return 200
		if (mainWidth.value > 1200) return 180
		return 140
	})

	/**
	 * @description 添加 获取系统用户列表
	 */
	const getRootUser = async (data: any) => {
		try {
			const res = await getSystemUserList(data)
			return { data: res.data, status: res.status }
		} catch (error) {
			console.log(error)
			return { msg: '获取用户列表失败', status: false }
		}
	}

	/**
	 * 检查端口是否被占用
	 */
	const checkPortUseEvent = async (port: any) => {
		if (!port || typeof port === 'object') return
		try {
			const res = await advanceCheckPort({ port }, 'go')
			if (!res.status) Message.request(res)
			return { status: res.status, msg: res.msg }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '检查端口失败' }
		}
	}

	/**
	 * @description 获取站点列表 -通用请求接口
	 * @param params
	 * @returns
	 */
	const getSiteList = async (params: any) => {
		try {
			const res: any = await useDataHandle({
				request: getProjectList(params, activeType.value),
				data: { data: Array, page: String },
			})
			return { data: res.data, total: getPageTotal(res.page), other: {} }
		} catch (error) {
			console.log(error)
			return { data: [], total: 0, other: {} }
		}
	}

	/**
	 * @description 获取分类列表
	 * @returns
	 */
	const getClassList = async () => {
		try {
			let classList: SelectOptionProps[] = []
			await useDataHandle({
				request: getSiteTypes(activeType.value),
				data: Array,
				success: (data: { name: string; id: number }[]) => {
					classList = [
						{ label: '全部分类', value: 'all' },
						...data.map((item: AnyObject) => ({
							label: item.name,
							value: String(item.id),
						})),
					]
				},
			})
			// 判断当前选中的项目类型是否存在 不存在则清空 并刷新列表
			// if (
			//   !typeList.value.some((item: any) => item.value === typeParams.value)
			// ) {
			//   typeParams.value = '';
			//   refreshActiveList();
			// }
			return { data: classList, status: true }
		} catch (error) {
			console.log(error)
			return { data: [], status: false }
		}
	}

	/**
	 * @description 获取项目配置信息
	 * @param params
	 * @returns
	 */
	const getProjectConfig = async (params: any) => {
		try {
			const res: AnyObject = await useDataHandle({
				request: getProjectInfo(params, activeType.value),
			})
			setSiteInfo(res.data)
			isBindExtranet.value = res.data?.project_config?.bind_extranet === 1 || false
			return { data: res.data, status: res.status }
		} catch (error) {
			console.log(error)
			return { msg: '获取失败', status: false, data: {} }
		}
	}

	/**
	 * @description 添加项目 - 通用侵犯求
	 * @param params
	 * @returns
	 */
	const addGeneralProject = async (params: any) => {
		const loading = Message.load('正在添加项目，请稍后...')
		try {
			const { data: res } = await createProject(params, activeType.value)
			const msg = res.msg || res.data || res.error_msg
			if (!msg) return { status: res.status, data: res }
			return { status: res.status, msg }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '添加项目失败' }
		} finally {
			loading.close()
		}
	}

	/**
	 * @description  编辑其他项目
	 * @param params
	 * @returns
	 */
	const editGeneralProject = async (params: any) => {
		const load = Message.load('正在编辑项目，请稍后...')
		try {
			const { data: res }: any = await modifyProject(params, activeType.value)
			if (typeof res === 'string') return { status: false, msg: res }
			const msg = res.msg || res.data || res.error_msg
			if (!msg) return { status: res.status, data: res }
			return { status: res.status, msg }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '编辑项目失败' }
		} finally {
			load.close()
		}
	}

	const delGeneralProjectEvent = async (params: any) => {
		try {
			const { data: res }: AnyObject = await useDataHandle({
				loading: `正在删除项目，请稍后...`,
				request: removeProject(params, activeType.value),
			})
			return { status: res.status, msg: res.msg || res.data || res.error_msg }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '删除项目失败' }
		}
	}

	/**
	 * @description 设置站点信息
	 * @param siteInfo
	 * @param tab
	 */
	const setSiteInfo = async (data: any, tab?: string) => {
		if (data) {
			if (data?.project_config?.type === 'PHPMOD') data.project_type = 'phpasync'
			let type = data?.project_type?.toLowerCase() || ''
			// 获取当前路由名称
			if (!type) type = activeType.value // 不存在则使用路由名称
			if (type === 'node') type = 'nodejs'
			if (type === 'nginx') type = 'proxy'
			siteInfo.value = { ...data, project_type: type }
			siteType.value = siteInfo.value?.project_type || ''
		}
		settingTabActive.value = (isString(tab) ? tab : '') || ''
		return siteInfo.value
	}

	/**
	 * @description 获取配置文件
	 * @returns
	 */
	const getFileEvent = async (params: any) => {
		try {
			const res = await getFileBody(params)
			return { data: res.data, status: res.status }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '获取配置文件失败' }
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
			const res = (await useDataHandle({
				loading: '正在保存内容，请稍候...',
				request: saveFileBody(params),
				data: {
					status: Boolean,
					msg: String,
				},
			})) as ResponseResult
			Message.msg({
				dangerouslyUseHTMLString: true,
				message: res.msg,
				type: res.status ? 'success' : 'error',
				duration: res.status ? 2000 : 0,
				showClose: !res.status,
			}) // 提示错误信息
			return { status: res.status, msg: res.msg }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '保存文件失败' }
		}
	}

	const setProjectStatusEvent = async (params: any, state: 'start' | 'stop' | 'restart', type: string) => {
		try {
			const { data: res } = await useDataHandle({
				loading: `正在${state !== 'restart' ? '设置状态' : '重启项目'}，请稍后...`,
				request: setProject(params, type, state),
			})

			Message.msg({
				customClass: 'bt-message-error-html',
				dangerouslyUseHTMLString: true,
				message: res.status ? res.msg || res.data : res.error_msg || res.data || res.msg,
				type: res.status ? 'success' : 'error',
				duration: res.status ? 3000 : 0,
				showClose: res.status ? false : true,
			}) // 提示错误信息
			const msg = res.msg || res.data || res.error_msg
			return { status: res.status, msg }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '操作失败' }
		}
	}

	const getPhpVersionList = async () => {
		try {
			const res = await useDataHandle({
				request: getPhpVersion(),
			})
			return { data: res.data, status: res.status }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '获取PHP版本失败' }
		}
	}

	/**
	 * @description 切换设置页面tab
	 * @param {string} tab tab名称
	 */
	const jumpTabEvent = (tab: string) => {
		settingTabActive.value = tab
		isJump.value = true
	}

	/**
	 * @description 重置tab
	 */
	const resetTab = () => {
		settingTabActive.value = ''
		isJump.value = false
	}

	return {
		activeType,
		isRefreshList,
		isBindExtranet,
		siteInfo,
		siteType,
		rowData,
		settingTabActive,
		isJump,
		selectedList,
		searchWidth,

		jumpTabEvent,
		resetTab,
		setSiteInfo,
		getRootUser,
		getSiteList,
		getClassList,
		getPhpVersionList,
		getProjectConfig,
		addGeneralProject,
		editGeneralProject,
		getFileEvent,
		saveFileEvent,
		checkPortUseEvent,
		delGeneralProjectEvent,
		setProjectStatusEvent,
		batchConfig,
		isSiteMult,
	}
})

const useSiteStore = () => {
	return storeToRefs(SITE_STORE())
}

export { SITE_STORE, useSiteStore }
