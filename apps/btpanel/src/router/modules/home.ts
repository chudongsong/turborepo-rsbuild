import type { RouteRecordRaw } from 'vue-router'

const homeRoutes: RouteRecordRaw = {
	name: 'home',
	path: '/home',
	meta: { sort: 1, title: '首页', icon: 'home' },
	component: () => import('@home/index.vue'),
}

export default homeRoutes
