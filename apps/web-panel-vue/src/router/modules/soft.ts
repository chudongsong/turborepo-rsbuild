import type { RouteRecordRaw } from 'vue-router'

const softRoutes: RouteRecordRaw = {
	name: 'soft',
	path: '/soft',
	meta: { sort: 18, icon: 'soft', title: '软件商店' },
	component: () => import('@soft/index.vue'),
	children: [
		{
			path: 'plugin',
			name: 'plugin',
			meta: { title: '官方应用' },
			component: () => import('@soft/views/plugin/index.vue'),
		},
		{
			path: 'other',
			name: 'other',
			meta: { title: '第三方应用' },
			component: () => import('@soft/views/other/index.vue'),
		},
		{
			path: 'deployment',
			name: 'deployment',
			meta: { title: '一键部署' },
			component: () => import('@soft/views/deployment/index.vue'),
		},
	],
}

export default softRoutes
