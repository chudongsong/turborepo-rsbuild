import { isNavigationFailure, type NavigationGuardNext, type RouteLocationNormalized, type Router } from 'vue-router'

import { cloudVersionChanges } from '@axios/model/preload'
import { useGlobalStore } from '@/store/global'
import { useNProgress } from '@vueuse/integrations/useNProgress'
// import { form } from '@/views/soft/public/environment-plugin/mysql/useController'
// import { AxiosCanceler } from '@/hooks/axios/model/axios-cancel'

// import { delayExecAsync } from '@/public/method'

// const axiosCanceler = new AxiosCanceler() // 创建取消请求实例

let unFnTimes: number | null = null // 定时器时间

// 设置路由激活
const setRouterActive = (path: string) => {
	const { routerActive } = useGlobalStore()
	routerActive.value = path // 设置当前路由
}

// 文件缓存刷新
const fileCacheRefresh = () => {
	if (unFnTimes) clearTimeout(unFnTimes) // 清除定时器
	unFnTimes = setTimeout(() => cloudVersionChanges(), 1000) as unknown as number // 云版本变更,延迟1秒执行，防止阻塞
}

/**
 * @description 路由守卫
 * @param {Router} router	路由实例
 * @return {void}
 */
const useCreateRouterEach = (router: Router) => {
	// 创建进度条实例
	const { isLoading, progress } = useNProgress(null, {
		color: 'var(--el-color-primary)', // 颜色
		minimum: 0.1, // 最小值
		speed: 200, // 速度
		showSpinner: true, // 显示加载图标
		spinnerPosition: 'left', // 加载图标位置
		easing: 'ease', // 动画效果
		trickleSpeed: 400, // 涓流速度
	})
	// 跳入路由地址
	let toPath = ''
	// 开启加载动画
	isLoading.value = true

	// 全局路由守卫 - 前置
	router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
		isLoading.value = true // 开启加载动画
		progress.value = 0.2 // 进度条归零
		toPath = to.path // 跳入路由地址
		next()
	})

	// 全局路由守卫 - 后置
	router.afterEach((to: RouteLocationNormalized, from: RouteLocationNormalized, failure) => {
		// 路由失败，且路由地址相同
		const isFailure = isNavigationFailure(failure)
		if (isFailure) {
			console.log('路由失败', toPath)
			if (to.path === from.path) return window.location.reload() // 刷新页面
			window.location.href = toPath // 跳转地址
		}
		progress.value = 1
		setRouterActive(to.path) // 设置路由激活
		fileCacheRefresh() // 文件缓存刷新
		if (to.meta.icon !== from.meta.icon) {
			const { getGlobalInfo } = useGlobalStore()
			getGlobalInfo()
		}
	})
}

export { useCreateRouterEach }
