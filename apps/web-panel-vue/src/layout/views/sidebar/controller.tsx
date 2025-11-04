import type { MenuRouteProps } from '@/router/types'
import { useConfirm } from '@confirm/index'
import { msgBoxDialog, menuSettingsDialog } from '@/public'
import { useGlobalStore } from '@/store/global'
import { router } from '@/router'
import { copyText } from '@/utils'

const { disableSidebar, serverIp, menuControl, cutCollapseView } = useGlobalStore()

/**
 * @description 打开消息盒子
 */
export const openMessageBoxEvent = () => {
	if (disableSidebar.value) return
	msgBoxDialog()
}

/**
 * @description 复制IP地址
 */
export const copyIpAddressEvent = async () => {
	copyText({
		value: serverIp.value,
	}) // 复制IP地址
}

/**
 * @description 判断菜单是否选中
 * @param item 菜单参数
 * @returns 是否选中
 */
export const isActiveMenu = (item: MenuRouteProps): boolean => {
	const pathSplit = router.currentRoute.value.path.split('/')[1]
	return pathSplit === item.name
}

/**
 * @description 菜单鼠标移入
 * @returns
 */
export const menuMouseenter = (name: string) => {
	menuControl.value.menuName = name
}

/**
 * @description 菜单鼠标移出
 * @returns
 */
export const menuMouseleave = (name: string) => {
	menuControl.value.menuName = ''
}

/**
 * @description: 获取菜单选中状态
 * @param {MenuRouteProps} item 菜单参数
 * @return {string} 菜单选中状态
 */
export const getMenuActionStyle = (item: MenuRouteProps): string => {
	return isActiveMenu(item) ? 'is-active' : ''
}

/**
 * @description 退出登录
 */
export const doLoginEvent = async () => {
	try {
		await useConfirm({
			icon: 'warning-filled',
			title: '退出登录',
			content: '退出面板登录，是否继续？',
		})
		setTimeout(() => {
			window.location.href = '/login?dologin=True'
		}, 400)
	} catch (error) {
		console.error(error)
	}
}

/**
 * @description 打开菜单设置弹窗
 */
export const openMenuSettingsEvent = async () => {
	if (disableSidebar.value) return
	menuSettingsDialog()
}

/**
 * @description 伸缩菜单栏
 */
export const cutCollapseViewEvent = async () => {
	cutCollapseView()
	if (!router.currentRoute.value.path.includes('/waf')) return
	const iframPage = document.getElementById('ifrramApp') as HTMLIFrameElement // 兼容旧版的调用方法
	if (iframPage) iframPage.contentWindow?.check_shrink(menuControl.value.collapse) // 调用子页面方法
}
