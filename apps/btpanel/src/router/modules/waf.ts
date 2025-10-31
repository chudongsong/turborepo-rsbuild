import type { RouteRecordRaw } from 'vue-router'

const wafRoutes: RouteRecordRaw = {
	name: 'waf',
	path: '/waf',
	meta: { sort: 8, title: 'WAF', icon: 'waf' },
	component: () => import('@views/compatible/index.vue'),
}

export default wafRoutes
