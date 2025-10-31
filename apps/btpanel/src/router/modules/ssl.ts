import type { RouteRecordRaw } from 'vue-router'

const softRoutes: RouteRecordRaw = {
	name: 'ssl',
	path: '/ssl',
	meta: { sort: 12, icon: 'ssl', title: 'SSL' },
	component: () => import('@ssl/index.vue'),
	children: [
		{
			path: 'certificate',
			name: 'certificate',
			meta: { title: '证书管理' },
			component: () => import('@ssl/views/certificate-manger/index.vue'),
		},
		// {
		// 	path: 'domain',
		// 	name: 'domain',
		// 	meta: { title: '域名管理' },
		// 	component: () => import('@ssl/views/domain-manger/index.vue'),
		// },
		{
			path: 'auto-deploy',
			name: 'auto-deploy',
			meta: { title: '自动部署' },
			component: () => import('@ssl/views/auto-deploy/index.vue'),
		},
	],
}

export default softRoutes
