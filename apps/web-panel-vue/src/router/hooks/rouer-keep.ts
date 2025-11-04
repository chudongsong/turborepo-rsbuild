import type { RoutesMenuProps } from '@/router/types' // 路由配置接口

const cacheMap = new Map<string, any>()

/**
 * @description 缓存路由
 * @param {RoutesMenuProps[]} routes
 * @param {boolean} keepAlive
 * @param {number} maxAge
 * @returns {RoutesMenuProps[]}
 */
function createCacheRoutes(routes: Array<RoutesMenuProps>, keepAlive: boolean = true, maxAge: number = 60 * 1000): Array<RoutesMenuProps> {
	return routes.map((route: RoutesMenuProps) => {
		cacheMap.set(route.name, new Date().getTime())
		return {
			...route,
			meta: {
				...route.meta,
				keepAlive: keepAlive || false,
				maxAge: maxAge || 0,
			},
		}
	})
}

export { createCacheRoutes, cacheMap }
