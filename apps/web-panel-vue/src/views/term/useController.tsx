import type { ContextMenuOptionsProps } from '@/components/extension/bt-context-menu/types'
import type { TermHostProps, TermRef, TerminalConfig, TerminalInfoProps } from './types'

import { exitFullscreen, getRandomPwd, isFunction, setFullScreen } from '@/utils'
import { useTermStore } from './useStore'

const { hostActive, isSidebar, contextMenuRef, terminalRefs, contextOptions, terminalList, isFull, terminalStatusList, getAutoCompleteStatus } = useTermStore()

/**
 * @description 终端视图样式
 * @param {number} data.index 索引
 * @param {'nav' | 'view'} data.type 类型
 * @returns {string} 样式
 */
export const terminalViewStyle = ({ index, type }: { index: number; type: 'nav' | 'view' }): string => {
	return `terminal-${type}-item ${index === hostActive.value ? 'active' : ''}`
}

/**
 * @description 获取终端实例
 * @param {number} index 终端id 默认当前激活的终端id
 * @returns {TermRef | boolean}
 */
const getRefTerminal = (index: number): TermRef | boolean => {
	const id = terminalList.value[index]?.id
	if (Object.keys(terminalRefs.value).length > 0) return terminalRefs.value[`terminal-${id}`]
	return false
}

/**
 * @description 设置终端自适应
 * @returns {void}
 */
export const setRefTerminalFit = () => {
	const id = terminalList.value[hostActive.value]?.id
	nextTick(() => {
		if (Object.keys(terminalRefs.value).length > 0) {
			const activeTerm = terminalRefs.value[`terminal-${id}`] as TerminalConfig
			if (activeTerm && isFunction(activeTerm?.fitTerminal)) activeTerm.fitTerminal()
		}
	})
}

/**
 * @description 设置终端实例
 * @param {string} id 终端id
 * @returns {string} 终端id
 */
export const setRefTerminal = (el: TermRef, id: string): string => {
	terminalRefs.value[`terminal-${id}`] = el
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
 * @description 右键菜单
 * @param {TerminalInfoProps} item 服务器信息
 * @param {number} index 索引
 */
export const openContextMenu = (item: TerminalInfoProps, index: number, e: Event) => {
	contextOptions.value = onContextmenu(item, index) // 获取右键菜单选项
	contextMenuRef.value?.openMenuEvent(e) // 打开右键菜单
}

/**
 * @description 切换终端tab
 * @param {number} index 终端id
 * @returns {void | boolean}
 */
export const cutTerminalNav = async (index: number): Promise<void | boolean> => {
	if (typeof hostActive.value != 'number') return false
	hostActive.value = index
	nextTick(() => {
		const activeTerm = getRefTerminal(hostActive.value)
		if (!activeTerm) return false
	})
}

/**
 * @description 鼠标滚轮事件
 */
export const onMouseWheel = (e: WheelEvent) => {
	const terminalNavList = e.currentTarget
	if (terminalNavList) {
		;(terminalNavList as HTMLElement).scrollLeft += e.deltaY
	}
}

/**
 * @description 切换全屏
 */
export const cutFullScreen = () => {
	isFull.value = !isFull.value
	if (isFull.value) {
		setFullScreen()
		isSidebar.value = false
	} else {
		exitFullscreen()
	}
}

/**
 * @description 创建终端
 * @param {TermHostProps} hostInfo 服务器信息
 * @returns {void}
 */
export const createTerminal = (hostInfo: TermHostProps): void => {
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
				if (activeTerm && isFunction(activeTerm?.useStatus)) {
					terminalStatusList.value[id] = activeTerm?.useStatus() // 记录终端状态
					watch(
						() => activeTerm?.useStatus().value,
						val => {
							terminalStatusList.value = {
								...terminalStatusList.value,
								[id]: activeTerm?.useStatus(),
							}
						},
						{
							immediate: true,
						}
					)
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
export const closeTerminal = async (index: number): Promise<void> => {
	let prevIndex = index - 1,
		nextIndex = index + 1
	if (hostActive.value === index) {
		if (index === 0) {
			await cutTerminalNav(0)
		} else if (nextIndex <= Number(terminalList.value?.length - 1)) {
			await cutTerminalNav(nextIndex)
		} else if (prevIndex >= 0) {
			await cutTerminalNav(prevIndex)
		}
	}
	const activeTerm = getRefTerminal(index) as TerminalConfig // 获取要删除的终端实例
	if (activeTerm) activeTerm.disposeTerminal() // 销毁终端
	// 删除终端
	nextTick(() => {
		terminalList.value.splice(index, 1)
	})
	if (hostActive.value > index) hostActive.value--
}

/**
 * @description 初始化本地连接
 * @returns {void}
 */
export const initLocalConnect = (): void => {
	getAutoCompleteStatus() // 获取补全工具是否启用
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
export const fullScreenChange = (): void => {
	// 监听到屏幕变化，在回调中判断是否已退出全屏
	if (!document.fullscreenElement) {
		isFull.value = false // 隐藏了全屏的内容
		if (document.fullscreenElement) {
			document.exitFullscreen().catch(console.error)
		}
	}
}
