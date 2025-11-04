import { defineStore, storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'

import type { SoftHistoryItemProps, SoftPushItemProps, SoftRecommendItemProps, SoftSearchItemProps, SoftStoreProps, SoftTableRowProps, SoftTabsTypeProps } from '@soft/types.d'
import SOFT_OTHER_STORE from './views/other/store'
import SOFT_PLUGIN_STORE from './views/plugin/store'
import { Message, useConfirm, useLoading, useDialog } from '@hooks/tools'
import { ResponseResult } from '@/types'
import { clearSearchHistory, removeSearchHistory } from '@/api/global'
import { useRequestCanceler } from '@hooks/tools/axios/model/axios-cancel' // 取消请求
import { delayExecAsync, npsSurveyV2Dialog, openPluginView } from '@/public'
import { delSoft, getHistorySoftList, getHotSoftList, getScore, savePluginSettings, setScore } from '@/api/soft'
import { isArray, jumpRouter } from '@utils/index'
import SOFT_DEPLOY_STORE from './views/deployment/store'
import { useGlobalStore } from '@/store/global'

const SOFT_STORE = defineStore('SOFT-STORE', () => {
	const { mainWidth } = useGlobalStore()
	const router = useRouter()
	const route = useRoute()

	const tabActive = computed(() => {
		return (useRoute()?.name || 'plugin') as string
	}) // 当前tab，未激活
	const pluginType = sessionStorage.getItem('SOFT-PLUGIN-TYPE') // 插件store
	const tabTypeActive = ref<number>(pluginType ? Number(pluginType) : 0) // 软件类型，默认全部
	const deployType = sessionStorage.getItem('SOFT-DEPLOY-TYPE') // 一键部署store
	const tabDeployActive = ref<number>(deployType ? Number(deployType) : 0) // 一键部署tab栏类型
	const showNpsCollect = ref<boolean>(false) // 是否显示NPS收集

	const isLoading = ref<boolean>(false) // 是否显示视图加载中
	const inputZipFlag = ref<boolean>(false) // 插件是否正在安装
	const speedInstallView = ref<boolean>(false) // 安装进度弹窗
	const isResetDeployPage = ref<boolean>(false) // 是否重置一键部署页码
	const historyList = ref<SoftHistoryItemProps[]>([])

	const softSearchList = shallowRef<SoftSearchItemProps[]>([]) // 软件搜索排名列表
	const softRecommendList = shallowRef<SoftRecommendItemProps[]>([]) // 软件推荐列表
	const searchRef = ref() // 触发关闭
	const softHistoryParam = { name: 'get_soft_list', key: 'get_soft_list' }
	const searchVal = ref() // 搜索框值
	const showRefresh = computed(() => tabActive.value !== 'deployment') // 是否显示刷新按钮

	const isPluginView = computed(() => tabActive.value === 'plugin')

	const pluginData = ref()
	const scorePopup = ref() // 分数弹窗
	const unloadPopup = ref() // 卸载弹窗

	// 是否是特定插件
	const isSpecial = computed(() => {
		const name = pluginData.value?.name
		return name === 'total' || name === 'rsync' || name === 'syssafe' || name === 'tamper_proof'
	})

	const checked = ref(false) // 卸载-是否保存配置文件

	const closePopup = async (ref: any) => {
		const popup = await ref.value
		if (popup) popup.unmount()
	}

	/**
	 * @description 手动触发强制关闭
	 */
	const triggerHideEvent = () => {
		if (searchRef.value?.blur) searchRef.value.blur() // 关闭弹窗
		if (searchRef.value?.hidePopover) searchRef.value.hidePopover() // 关闭弹窗
	}

	/**
	 * @description 手动触发强制显示
	 */
	const triggerShowEvent = () => {
		if (searchRef.value?.showPopover) searchRef.value.showPopover() // 显示弹窗
	}

	/**
	 * @description 打开Nps需求反馈
	 */
	const openNPS = () => {
		npsSurveyV2Dialog({ type: 16, id: 993, isNoRate: true })
	}

	const refreshRouteData = async (isForce: '0' | '1' = '0', page?: number) => {
		if (tabActive.value === 'other') {
			const otherStore = SOFT_OTHER_STORE()
			const { tablePageConfig } = storeToRefs(otherStore)
			if (page) tablePageConfig.value.page = 1
			otherStore.refreshList(isForce)
		} else if (tabActive.value === 'plugin') {
			const pluginStore = SOFT_PLUGIN_STORE()
			const { tablePage } = storeToRefs(pluginStore)
			if (page) tablePage.value.page = 1
			pluginStore.refreshPluginList(isForce)
		} else if (tabActive.value === 'deployment') {
			const deployStore = SOFT_DEPLOY_STORE()
			const { tablePageConfig } = storeToRefs(deployStore)
			if (page) tablePageConfig.value.page = 1
			deployStore.refreshDeployList(isForce)
		}
	}

	/**
	 * @description 清除软件历史记录find
	 * @param {number} index 索引
	 */
	const clearSoftHistory = (index: number): void => {
		historyList.value.splice(index, 1)
		historyList.value = [...historyList.value]
	}

	/**
	 * @description: 打开插件
	 * @param {string} obj 对象信息
	 */
	const handleOpenPluginEvent = async (pluginName: string, source: number = 22) => {
		triggerHideEvent() // 关闭当前历史记录
		openPluginView({ pluginName, source })
	}

	/**
	 * @description 获取热门软件
	 */
	const getHotSoft = async () => {
		const { data }: { data: SoftPushItemProps[] } = await getHotSoftList()
		if (isArray(data) && data.length === 2) {
			softSearchList.value = data[0]?.plugin || []
			softRecommendList.value = data[1]?.plugin || []
		}
	}

	/**
	 * @description 输入历史记录事件
	 * @param {string} val 历史记录
	 */
	const inputHistoryEvent = (val: string) => {
		searchVal.value = val // 将历史记录添加到搜索框
		triggerHideEvent() // 关闭当前历史记录
		refreshRouteData('0') // 触发搜索事件
	}

	/**
	 * @description 删除指定搜索历史事件
	 * @param {string} val 搜索内容
	 * @param {number} index 索引
	 */
	const clearFindHistoryEvent = async (val: string, index: number) => {
		await useConfirm({
			icon: 'warning-filled',
			title: '删除搜索历史记录',
			content: '删除该条搜索历史【' + val + '】，是否继续？',
		})
		const loading = useLoading('正在删除指定搜索历史记录，请稍后...')
		try {
			const rdata: ResponseResult = await removeSearchHistory({
				...{ val: val },
				...softHistoryParam,
			}) // 删除指定搜索历史
			if (rdata.status) historyList.value.splice(index, 1) // 删除指定索引s
			Message.request(rdata)
			triggerShowEvent() // 显示搜索历史
		} catch (error) {
			console.error(error)
		} finally {
			loading.close()
		}
	}

	/**
	 * @description 清空所有搜索历史事件
	 */
	const clearAllHistoryEvent = async () => {
		await useConfirm({
			icon: 'warning-filled',
			title: '清空搜索历史',
			content: '清空所有搜索历史记录，是否继续？',
		})
		const loading = useLoading('正在清空搜索历史记录，请稍后...')
		try {
			const rdata: ResponseResult = await clearSearchHistory(softHistoryParam)
			if (rdata.status) historyList.value = [] // 清空搜索历史
			Message.request(rdata)
			triggerShowEvent() // 显示搜索历史
		} catch (error) {
			console.error(error)
		} finally {
			loading.close()
		}
	}

	const initHistory = () => {
		if (historyList.value.length === 0) triggerHideEvent() // 隐藏搜索历史
		// 延迟100ms获取热门软件
		delayExecAsync({ promises: [getHotSoft], delay: 100 })
	}

	/**
	 * @description 重置
	 */
	const $reset_history = () => {
		searchVal.value = ''
		historyList.value = []
		softSearchList.value = []
		softRecommendList.value = []
		showNpsCollect.value = false
	}

	// 最近使用

	const softList = useSessionStorage('softList', []) as Ref<SoftTableRowProps[]> // 最近使用列表
	const softListSliceData = computed(() => {
		return softList.value.slice(0, softNum.value) || []
	})

	const softNum = computed(() => {
		if (mainWidth.value <= 400) return 1
		return Math.floor((mainWidth.value - 200) / 120)
	})

	/**
	 * @description 获取最近使用列表
	 */
	const getHistoryInfo = async () => {
		const { data }: { data: SoftTableRowProps[] } = await getHistorySoftList()
		softList.value = data
	}

	/**
	 * @description 打开插件事件
	 * @param {SoftTableRowProps} item 插件信息
	 */
	const handleOpenRecentEvent = (item: SoftTableRowProps) => {
		openPluginView({ pluginName: item.name, type: 'default' })
	}

	const initRecently = () => {
		delayExecAsync({ promises: [getHistoryInfo], delay: 500 })
	}

	const $reset_recently = () => {
		softList.value = []
	}

	// 评分
	const loading = ref(false) // 加载状态
	// 评分分数
	const score = ref(5)
	const scoreList = shallowRef([
		{ score: 5, name: '力荐' },
		{ score: 4, name: '好' },
		{ score: 3, name: '一般' },
		{ score: 2, name: '差' },
		{ score: 1, name: '非常差' },
	])
	// 插件评分数据
	const pluginScore = reactive({
		count: 0, // 使用人数
		total: 0, // 评分人数
		avg: 0, // 平均分
		rate: 0, // 好评率
		starList: [] as number[], // 星级评分列表,从大到小
	})

	// 获取评价
	const getComment = (score: number) => {
		return scoreList.value.filter(item => {
			return item.score === score
		})[0].name
	}

	// 获取评分
	const getDetail = async () => {
		try {
			loading.value = true
			const res = await getScore({ pid: pluginData.value.id, p: 1 })
			if (res.status) {
				const scoreList = res.data.split.reverse()
				const total = res.data.total
				pluginScore.avg = Number(((scoreList[4] * 1 + scoreList[3] * 2 + scoreList[2] * 3 + scoreList[1] * 4 + scoreList[0] * 5) / total).toFixed(1))
				pluginScore.count = pluginData.value.count
				pluginScore.total = total
				pluginScore.rate = total !== 0 ? Number((Number(((scoreList[0] + scoreList[1]) / total).toFixed(2)) * 100).toFixed(0)) : 0
				for (let i = 0; i < 5; i++) {
					pluginScore.starList.push(Number((Number((scoreList[i] / total).toFixed(2)) * 100).toFixed(0)))
				}
				// score.value = res.data.score
				loading.value = false
			}
		} catch (error) {
			console.log(error)
		}
	}

	// 提交
	const onSubmitScore = async () => {
		try {
			const res = await setScore({
				pid: pluginData.value.id,
				num: score.value,
				ps: '用户未做任何评价',
			})
			if (res.status) {
				refreshRouteData()
				closePopup(scorePopup)
				Message.success(res.msg)
			} else {
				Message.error(res.msg)
			}
		} catch (error) {
			console.log(error)
		}
	}

	/**
	 * @description 软件列表评分事件
	 * @param row 行数据
	 */
	const scoreEvent = (row: any) => {
		pluginData.value = row
		scorePopup.value = useDialog({
			title: `【${row.title}】评分`, //【string】 title，组件标题，为空不显示或false，可为空
			area: 55, // 【number、string、array<number/string>】视图大小，支持数组[宽，高]，默认单位rem
			component: () => import('@soft/public/score/index.vue'), // 组件引入
		})
	}

	const $reset_score = () => {
		pluginData.value = {}
		pluginScore.starList = []
	}

	/**
	 * @description 卸载插件二次确认
	 * @param pluginData 插件信息
	 */
	const unInstallPlugin = (data: any) => {
		pluginData.value = data
		unloadPopup.value = useDialog({
			showFooter: true,
			title: '卸载', //【string】 title，组件标题，为空不显示或false，可为空
			area: 45, // 【number、string、array<number/string>】视图大小，支持数组[宽，高]，默认单位rem
			component: () => import('@soft/public/unload/index.vue'), // 组件引入
		})
	}

	const onUnInstall = async (): Promise<void> => {
		// 版本号处理
		let version = pluginData.value.version
		for (var i = 0; i < pluginData.value.versions.length; i++) {
			if (pluginData.value.versions[i].setup && pluginData.value.version.includes(pluginData.value.versions[i].m_version)) {
				version = pluginData.value.versions[i].m_version
				if (version.indexOf('.') < 0) version += '.' + pluginData.value.versions[i].version
				break
			}
		}
		// 是否保留配置
		const name = pluginData.value.name
		// 部分插件保留配置后再卸载
		if (isSpecial) {
			if (checked.value) {
				const res = await savePluginSettings({ soft_name: name })
				if (res.status) {
					return unInstall(name, version)
				} else {
					Message.error(res.msg)
				}
				return res.status
			} else {
				// 不保留配置直接卸载
				return unInstall(name, version)
			}
		} else {
			// 其他插件直接卸载
			return unInstall(name, version)
		}
	}

	// 卸载事件
	const unInstall = async (name: string, version: string): Promise<void> => {
		const ress = await delSoft({ sName: name, version: version })
		if (ress.status) {
			Message.success(ress.msg)
			refreshRouteData()
			// emits('close')
		} else {
			// emits('close')
			Message.msg({
				dangerouslyUseHTMLString: true,
				message: ress.msg,
				type: 'error',
				duration: 0,
				showClose: true,
			}) // 提示错误信息
		}
		// 回调函数
		if (pluginData.value?.callBack) pluginData.value?.callBack(ress.status)
		return ress.status
	}

	/**
	 * @description 重定向路由，如果需要缓存tab，则可以使用手动重定向
	 */
	const redirectRouter = async () => {
		if (route.name === tabActive.value) return // 防止重复跳转路由
		router.push({ name: tabActive.value })
	}

	/**
	 * @description 消息监听事件
	 * @param {Event} event 事件对象
	 */
	const messageEvent = (event: MessageEvent) => {
		if (event.data === 'refreshSoftTable') refreshRouteData() // 刷新列表
	}

	/**
	 * @description 切换tabs切换组件
	 * @param {string} name 当前tabs的name
	 */
	const cutTabsEvent = (name: string) => {
		tabActive.value = name as SoftTabsTypeProps
		jumpRouter('/soft/' + name)
	}

	const initSoftView = () => {
		// redirectRouter()
		window.addEventListener('message', messageEvent)
	}

	const $reset = () => {
		window.removeEventListener('message', messageEvent)
		// 取消初始化请求
		useRequestCanceler(['/plugin?action=get_soft_list', '/plugin?action=push_plugin', '/plugin?action=get_usually_plugin'])
	}

	return {
		tabActive,
		historyList,
		tabTypeActive,
		tabDeployActive,
		showNpsCollect,
		isLoading,
		inputZipFlag,
		speedInstallView,
		isResetDeployPage,
		isPluginView,
		redirectRouter,
		cutTabsEvent,
		initSoftView,
		$reset,

		refreshRouteData,

		//搜索
		searchRef,
		softSearchList,
		softRecommendList,
		handleOpenPluginEvent,
		getHotSoft,
		clearSoftHistory,
		clearFindHistoryEvent,
		inputHistoryEvent,
		clearAllHistoryEvent,
		initHistory,
		$reset_history,

		showRefresh,
		triggerHideEvent,
		triggerShowEvent,
		openNPS,
		searchVal,

		// 最近
		initRecently,
		handleOpenRecentEvent,
		getHistoryInfo,
		softNum,
		softList,
		softListSliceData,
		$reset_recently,

		// 评分
		scoreEvent,
		loading,
		pluginData,
		pluginScore,
		score,
		getComment,
		getDetail,
		onSubmitScore,
		$reset_score,

		// 卸载
		unInstallPlugin,
		onUnInstall,
		unInstall,
		isSpecial,
		checked,
	}
})

const useSoftStore = () => {
	const store = SOFT_STORE()
	return { ...store, ...storeToRefs(store) }
}

export { useSoftStore, SOFT_STORE }
