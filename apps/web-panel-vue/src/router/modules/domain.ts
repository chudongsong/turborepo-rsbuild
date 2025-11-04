import type { RouteRecordRaw } from 'vue-router'

const domainRoutes: RouteRecordRaw = {
	name: 'domain',
	path: '/domain',
	meta: { sort: 15, title: '域名', icon: 'domain' },
	component: () => import('@domain/index.vue'),
	children: [
		{
			path: 'register',
			name: 'register',
			meta: { title: '域名注册' },
			component: () => import('@domain/views/domain-register/index.vue'),
		},
		{
			path: 'hosting',
			name: 'hosting',
			meta: { title: '域名托管' },
			component: () => import('@domain/views/domain-manger/index.vue'),
		},
	],
}

export default domainRoutes
