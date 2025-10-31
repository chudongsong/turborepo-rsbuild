import type { MenuParamProps, MenuProps } from './types'

import { getMenuList as getMenuListApi, setHideMenuList } from '@api/global'
import { Message, useDataHandle } from '@/hooks/tools'
import { isArray } from '@/utils'
import { menuName, menuRoute } from '@router/hooks/router-menu'
import { MenuRouteProps } from '@/router/types'
import { useGlobalStore } from '@/store/global'
import { getConfigStore } from '@/views/config/useStore'

const { isRefreshMenu } = useGlobalStore()

export const menuTable: any = ref()

/**
 * @description: 切换菜单项的可见性并更新隐藏菜单项列表。
 * @param {MenuProps} row - 要切换的菜单项对象。
 * @returns {Promise<void>}
 */
export const handleMenuChange = async (row: MenuProps): Promise<void> => {
	try {
		const param: MenuParamProps = { hide_list: JSON.stringify([row.id]) }
		if (row.parentId) {
			param.site_menu = 1 // 站点菜单栏目
			const data = menuTable.value.find((item: MenuProps) => item.id === row.parentId)
			// 判断是否全部隐藏，当父级不隐藏时提示子项必须保留一个
			if (data.children) {
				const showData = data.children.filter((item: MenuProps) => item.show)
				if (showData.length === 0 && data.show) {
					Message.error('子项至少保留一个显示')
					isRefreshMenu.value = true // 刷新菜单栏目
					return
				}
			}
		}

		// 当为站点菜单栏目时，判断子项是否全部为空，若为空则提示请先开启任意一项子项
		if (row.id === 'memuAsite') {
			const data = menuTable.value.find((item: MenuProps) => item.id === 'memuAsite')
			const showData = data.children.filter((item: MenuProps) => item.show)
			if (showData.length === 0 && data.show) {
				Message.error('请先开启任意一项网站子栏目')
				isRefreshMenu.value = true // 刷新菜单栏目
				return
			}
		}

		await useDataHandle({
			request: setHideMenuList(param),
			message: true,
			success: () => {
				isRefreshMenu.value = true // 刷新菜单栏目
				const {
					refs: { panelConfig },
				} = getConfigStore()
				// 若为添加隐藏 则添加到隐藏列表，否则从隐藏列表中移除
				const index = panelConfig.value.menuHide.indexOf(row.title)
				if (index > -1) {
					panelConfig.value.menuHide = panelConfig.value.menuHide
						.split('、')
						.filter((item: any) => item !== row.title)
						.join('、')
				} else {
					panelConfig.value.menuHide = panelConfig.value.menuHide ? `${panelConfig.value.menuHide}、${row.title}` : row.title
				}
			},
		})
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description: 处理菜单栏目数据
 * @param {MenuProps[]} list - 菜单栏目列表
 * @returns {MenuProps[]}
 */
const handleMenuList = (list: MenuProps[]): MenuProps[] => {
	// 设置菜单栏目显示状态，兼容不规则的名称
	return list.map(({ id, title, show, children }: MenuProps) => {
		const name: string = menuName(id)
		if (children && isArray(children)) {
			children = children.map(({ id: cname, title, show }: MenuProps) => {
				if (cname === 'proxy') cname = 'nginx'
				return { show, parentId: id, id: cname, title }
			})
		} else {
			children = false
		}
		return { name, title, show, id, children }
	})
}

/**
 * @description: 同步菜单栏目显示状态
 * @param {Array} route - 菜单栏目路由
 * @param {Array} list - 菜单栏目列表
 * @returns {MenuRouteProps[]}
 */
const syncMenuRoute = (route: MenuRouteProps[], list: MenuProps[]): MenuRouteProps[] => {
	return route.map((item: MenuRouteProps, index: number) => {
		const children = item.children?.length
			? item.children.map((it: any, idx: number) => {
					if (Array.isArray(list[index].children)) return { ...it, show: list[index].children[idx].show }
					return it
			  })
			: []
		return { ...item, show: list[index].show, children }
	})
}

/**
 * @description: 获取、更新菜单栏目显示隐藏列表
 */
export const updateMenuItems = async () => {
	try {
		const rdata: MenuProps[] = await useDataHandle({
			request: getMenuListApi(),
			data: Array,
		})
		const menuData = handleMenuList(rdata) // 处理菜单栏目数据
		menuRoute.value = syncMenuRoute(menuRoute.value, menuData) // 同步菜单栏目显示状态
		// sessionStorage.setItem('MENU-LIST', JSON.stringify(menuRoute.value)) // 缓存菜单栏目显示状态
		menuTable.value = menuData
		return { data: menuData, total: menuData.length, other: {} }
	} catch (error) {
		return { data: [], total: 0, other: {} }
	}
}
