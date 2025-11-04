import { ContextMenuOptionsProps } from '@/components/base/bt-context-menu/types'
import { useGlobalStore } from '@/store/global'
import { type TermHostProps, type TermRef, type TerminalConfig, type TerminalInfoProps, type TerminalRefs, type TerminalStatus } from '@/types/term'
import { useDialog } from '@hooks/tools'
import { exitFullscreen, getRandomPwd, setFullScreen } from '@utils/index'
import { defineStore, storeToRefs } from 'pinia'

// import type { TermStoreProps } from '@term/types'

// // 全局状态
// const useXtermStore = defineStore('TERM-STORE', {
// 	state: ():TermStoreProps => ({
// 		refreshServerTable: false, // 刷新服务器列表
// 	}),
// 	getters: {},
// 	actions: {},
// 	persist: [
// 		{
// 			storage: localStorage,
// 			paths: [],
// 		},
// 	],
// })

// /**
//  * @description 获取状态管理
//  */
// const getXtermStore = () => {
// 	const termStore = useXtermStore()
// 	return { refs: storeToRefs(termStore), ...termStore }
// }

// export { getXtermStore }

// export default getXtermStore

const TERM_STORE = defineStore('TERM-STORE', () => {
	const globalStore = useGlobalStore()
	const { mainHeight } = storeToRefs(globalStore)

	const contextMenuRef = ref() // 右键菜单实例
	const contextOptions = shallowRef<ContextMenuOptionsProps[]>([]) // 右键菜单列表

	const isFull = ref(false) // 是否全屏
	const isSidebar = ref(true) // 是否显示右侧视图
	const hostActive = ref(0) // 当前激活的服务器
	const terminalList = ref<TerminalInfoProps[]>([]) // 终端列表
	const terminalRefs: TerminalRefs = {} // 终端实例
	const terminalStatusList = shallowRef<TerminalStatus>({}) // 终端状态

	const hostListRef = ref() // 主机列表
	const videoListRef = ref() // 视频列表
	const commandListRef = ref() // 命令列表
	const tabView = ref('serverList') // tab切换

	const height = computed(() => (mainHeight.value ? `${mainHeight.value - 32}px` : '100%')) // 实时高度

	/**
	 * @description 终端Class，包括导航和视图
	 * @param {number} data.index 终端下标
	 * @param {string} data.type 类型
	 * @returns {string} 终端Class
	 */
	const terminalViewStyle = ({ index, type }: { index: number; type: 'nav' | 'view' }): string => {
		return `terminal-${type}-item ${index === hostActive.value ? 'active' : ''}`
	}

	/**
	 * @description 切换终端tab
	 * @param {number} index 终端id
	 * @returns {void | boolean}
	 */
	const cutTerminalNav = async (index: number): Promise<void | boolean> => {
		if (typeof hostActive.value != 'number') return false
		hostActive.value = index
		nextTick(() => {
			const activeTerm = getRefTerminal(hostActive.value)
			if (!activeTerm) return false
		})
	}

	/**
	 * @description 右键菜单
	 * @param {TerminalInfoProps} item 服务器信息
	 * @param {number} index 索引
	 */
	const openContextMenu = (item: TerminalInfoProps, index: number, e: Event) => {
		// 获取右键菜单选项
		contextOptions.value = onContextmenu(item, index)
		// 打开右键菜单
		contextMenuRef.value?.openMenuEvent(e)
	}

	/**
	 * @description 鼠标滚轮事件
	 */
	const onMouseWheel = (e: WheelEvent) => {
		const terminalNavList = e.currentTarget
		if (terminalNavList) {
			;(terminalNavList as HTMLElement).scrollLeft += e.deltaY
		}
	}

	/**
	 * @description 获取终端实例
	 * @param {number} index 终端id 默认当前激活的终端id
	 * @returns {TermRef | boolean}
	 */
	const getRefTerminal = (index: number): TermRef | boolean => {
		const id = terminalList.value[index]?.id
		if (Object.keys(terminalRefs).length > 0) return terminalRefs[`terminal-${id}`]
		return false
	}

	/**
	 * @description 设置终端实例
	 * @param {string} id 终端id
	 * @returns {string} 终端id
	 */
	const setRefTerminal = (el: TermRef, id: string): string => {
		terminalRefs[`terminal-${id}`] = el
		return `terminal-${id}`
	}

	/**
	 * @description 导航栏菜单右键实现
	 * @param {TerminalInfoProps} item 服务器信息
	 * @param {number} index 索引
	 * @returns {Array} 菜单列表
	 */
	const onContextmenu = (item: TerminalInfoProps, index: number): Array<ContextMenuOptionsProps> => {
		const items = [
			{
				label: '复制会话',
				divided: true,
				onClick: () => createTerminal(item.hostInfo),
			},
			{
				label: '关闭会话',
				onClick: () => {
					closeTerminal(index)
				},
			},
		]
		if (terminalList.value?.length > 1) {
			items.push({
				label: '关闭其他会话',
				onClick: () => {
					terminalList.value = [item] // 保留当前会话
					cutTerminalNav(0)
				},
			})
		}
		if (terminalList.value?.length - 1 != index) {
			items.push({
				label: '关闭右侧会话',
				onClick: () => {
					terminalList.value.splice(index + 1, terminalList.value.length - index - 1)
					cutTerminalNav(index)
				},
			})
		}
		return items
	}

	/**
	 * @description 切换全屏
	 */
	const cutFullScreen = () => {
		isFull.value = !isFull.value
		if (isFull.value) {
			setFullScreen()
			isSidebar.value = false
		} else {
			exitFullscreen()
		}
	}

	/**
	 * @description 切换终端右侧栏显示
	 */
	const cutSidebar = () => {
		isSidebar.value = !isSidebar.value
	}

	/**
	 * @description 创建终端
	 * @param {TermHostProps} hostInfo
	 * @returns {void}
	 */
	const createTerminal = (hostInfo: TermHostProps): void => {
		const id = getRandomPwd(8) // 随机id
		terminalList.value.push({ id, hostInfo })
		nextTick(async () => {
			const index = terminalList.value?.length - 1
			if (terminalList.value?.length > 0) {
				await cutTerminalNav(index) // 切换终端tab
				nextTick(() => {
					const activeTerm = getRefTerminal(hostActive.value) as TerminalConfig // 获取当前激活的终端实例
					if (!activeTerm) return false
					// 获取当前终端状态
					if (activeTerm && typeof activeTerm?.useStatus === 'function') {
						const isStatus = typeof activeTerm === 'object' && activeTerm?.useStatus()
						// 记录终端状态
						terminalStatusList.value[id] = isStatus
					}
				})
			}
		})
	}

	/**
	 * @description 关闭终端
	 * @param {staring} index 终端id
	 * @returns {void}
	 */
	const closeTerminal = async (index: number): Promise<void> => {
		let prevIndex = index - 1,
			nextIndex = index + 1
		if (hostActive.value === index) {
			if (nextIndex <= Number(terminalList.value?.length - 1)) {
				await cutTerminalNav(nextIndex)
			} else if (prevIndex >= 0) {
				await cutTerminalNav(prevIndex)
			}
		} else if (hostActive.value > index) hostActive.value--
		const activeTerm = getRefTerminal(index) as TerminalConfig // 获取要删除的终端实例
		if (activeTerm) {
			// // 停止监听
			// (terminalWatchList[`terminal-${terminalList.value[index].id}`] as AnyFunction)()
			// terminalWatchList[`terminal-${terminalList.value[index].id}`] = null
			// 销毁终端
			activeTerm.disposeTerminal()
		}
		// 删除终端
		nextTick(() => {
			terminalList.value.splice(index, 1)
		})
	}

	/**
	 * @description 初始化本地连接
	 * @returns {void}
	 */
	const initLocalConnect = (): void => {
		// 创建本地终端，初始化参数禁止其他参数，仅host
		createTerminal({
			host: '127.0.0.1',
			ps: '本地服务器',
		})
		window.addEventListener('fullscreenchange', fullScreenChange)
	}

	/**
	 * @description 判断全屏
	 * @returns {void}
	 */
	const fullScreenChange = (): void => {
		// 监听到屏幕变化，在回调中判断是否已退出全屏
		if (!document.fullscreenElement) {
			isFull.value = false // 隐藏了全屏的内容
			if (document.fullscreenElement) {
				document.exitFullscreen().catch(console.error)
			}
		}
	}

	/**
	 * @description 切换标签页
	 * @param {AnyObject} tab 标签页
	 * @returns {Promise<void>}
	 */
	const onCutTabs = async (tab: AnyObject): Promise<void> => {
		tabView.value = tab.props.name
		switch (tab.props.name) {
			case tabsName.serverList:
				await hostListRef.value.getHost()
				break
			case tabsName.videoList:
				await import('@term/views/video-list/index.vue')
				nextTick(async () => {
					await videoListRef.value.getVideo()
					await videoListRef.value.getVideoStatus()
				})
				break
			case tabsName.commonList:
				await import('@term/views/command-list/index.vue')
				nextTick(async () => {
					await commandListRef.value.getCommand()
				})
				break
		}
	}

	const $reset = () => {
		// 销毁终端
		Object.values(terminalRefs).map((item: TerminalConfig) => {
			if (item) item.disposeTerminal()
		})
		// 移除监听
		window.removeEventListener('fullscreenchange', fullScreenChange)
		terminalList.value = []
		terminalStatusList.value = {}
	}

	return {
		height,
		terminalStatusList,
		terminalList,
		isFull,
		isSidebar,
		terminalRefs,
		hostActive,
		contextOptions,
		hostListRef,
		videoListRef,
		commandListRef,
		tabView,
		onCutTabs,
		onMouseWheel,
		cutTerminalNav,
		openContextMenu,
		closeTerminal,
		terminalViewStyle,
		setRefTerminal,
		fullScreenChange,
		cutFullScreen,
		createTerminal,
		cutSidebar,
		initLocalConnect,
		$reset,
	}
})

export default TERM_STORE
