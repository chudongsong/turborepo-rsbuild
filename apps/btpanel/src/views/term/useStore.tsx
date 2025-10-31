import { ContextMenuOptionsProps } from '@/components/extension/bt-context-menu/types'
import { useGlobalStore } from '@/store/global'
import { defineStore, storeToRefs } from 'pinia'
import { useRequestCanceler } from '@hooks/tools/axios/model/axios-cancel' // 取消请求
import { useMessage, useDataHandle } from '@/hooks/tools'
import { getAutoComplete, setAutoComplete } from '@/api/xterm'
import { TerminalInfoProps, TerminalRefsProps, TerminalStatus } from './types'
const TERM_STORE = defineStore('TERM-STORE', () => {
	const { mainHeight, mainWidth } = useGlobalStore()
	const isFull = ref(false) // 是否全屏
	const isSidebar = ref(true) // 是否显示右侧视图
	const hostActive = ref(0) // 当前激活的服务器
	const contextMenuRef = ref() // 右键菜单实例
	const terminalList = ref<TerminalInfoProps[]>([]) // 终端列表
	const contextOptions = shallowRef<ContextMenuOptionsProps[]>([]) // 右键菜单列表
	const terminalRefs = shallowRef<TerminalRefsProps>({}) // 终端实例
	const terminalStatusList = shallowRef<TerminalStatus>({}) // 终端状态
	const tabView = ref('serverList') // tab切换
	const autoCompleteStatus = ref(false) // 补全工具是否启用

	const isRefreshList = ref(false) // 是否刷新列表

	const termHeight = computed(() => (mainHeight.value ? mainHeight.value - 32 : '100%')) // 实时高度

	const termViewWidth = computed(() => {
		if (isFull.value) return 'calc(100% - 32px)'
		return mainWidth.value ? mainWidth.value - 32 - (isSidebar.value ? 316 : 0) + 'px' : '100%'
	}) // 实时宽度

	// 切换右侧视图
	const cutSidebar = () => {
		isSidebar.value = !isSidebar.value
		return true
	}

	/**
	 * @description 获取补全工具是否启用
	 */
	const getAutoCompleteStatus = async () => {
		try {
			const res = await getAutoComplete()
			autoCompleteStatus.value = res.status
		} catch (error) {
			console.error(error)
			autoCompleteStatus.value = false
		}
	}

	/**
	 * @description 设置补全工具是否启用
	 */
	const setAutoCompleteStatus = async () => {
		try {
			await useDataHandle({
				loading: '正在设置，请稍后...',
				request: setAutoComplete(autoCompleteStatus.value ? 0 : 1),
				message: true,
			})
			getAutoCompleteStatus()
		} catch (error) {
			console.error(error)
			autoCompleteStatus.value = !status
		}
	}
	/**
	 * @description 离开页面后重置状态
	 */
	const $reset = () => {
		isFull.value = false
		isSidebar.value = true
		hostActive.value = 0
		contextOptions.value = []
		terminalList.value = []
		terminalRefs.value = {}
		terminalStatusList.value = {}
		tabView.value = 'serverList'
		// @ts-ignore
		window.commandDatabase = null // 重置命令库
		// 取消初始化请求
		useRequestCanceler(['/xterm?action=get_host_list'])
	}

	return {
		isFull,
		isSidebar,
		hostActive,
		termHeight,
		termViewWidth,
		contextMenuRef,
		terminalList,
		terminalRefs,
		contextOptions,
		terminalStatusList,
		cutSidebar,
		tabView,
		$reset,
		isRefreshList,
		autoCompleteStatus,
		getAutoCompleteStatus,
		setAutoCompleteStatus,
	}
})

/**
 * @description 获取状态管理
 * @returns {TermStoreProps}
 */
const useTermStore = () => {
	const termStore = TERM_STORE()
	return { ...termStore, ...storeToRefs(termStore) }
}

export { useTermStore }
