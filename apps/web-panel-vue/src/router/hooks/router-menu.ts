// /* eslint-disable no-underscore-dangle */
import type { MenuRouteProps, MenuTemplateProps } from '@router/types.d'
import { isArray } from '@/utils'
import { map, ifElse, compose, equals, head, nth, always, pipe, replace, toLower } from 'ramda'
import { ShallowRef } from 'vue'

const unicodeToChar = pipe(replace(/'/g, '"'), replace(/&#34;/g, '"')) // 替换unicode字符
// 获取模板中的菜单，规则：String -> Object，案例：'{"id":"memuAwaf"}' -> { name: 'waf' }
const menuJson = pipe(unicodeToChar, JSON.parse) as (menu: string) => MenuTemplateProps[]
// 菜单栏目进行替换，规则：String -> String，案例：memuWaf -> waf
const menuConvert = (compareValue: string) =>
	map(ifElse(compose(equals(compareValue), head), nth(1), always(compareValue)), [
		['dologin', 'exit'],
		['btwaf', 'waf'],
	])[1] || ''

// 菜单栏目名称，规则：String -> String，案例：'memuWaf' -> 'waf'
export const menuName = (str: string): string => menuConvert(pipe(replace(/memu([A|_]?)/, ''), toLower)(str) || 'home')

export const createMenuRoute = (menuLocal: string | MenuTemplateProps[]): ShallowRef<MenuRouteProps[]> => {
	const menuList = isArray(menuLocal) ? menuLocal : menuJson(menuLocal)
	const menuRoute = shallowRef<MenuRouteProps[]>([])
	menuList.forEach(({ show, id, title, children }) => {
		menuRoute.value.push({
			name: menuName(id),
			title,
			show,
			path: `/${menuName(id) || 'home'}`,
			children:
				children?.map(({ id, title, show: childrenShow }) => ({
					name: menuName(id),
					title,
					path: `/${menuName(id)}`,
					show: childrenShow,
				})) || [],
		})
	})
	return menuRoute
}
// 创建菜单路由表，基于本地菜单配置
export const menuRoute: ShallowRef<MenuRouteProps[]> = createMenuRoute(window.vite_public_menu || [])
