import type { RouteRecordRaw } from 'vue-router'

const controlRoutes: RouteRecordRaw = {
	name: 'control',
	path: '/control',
	meta: { sort: 6, title: '监控', icon: 'control' },
	component: () => import('@control/index.vue'),
	children: [
		{
			path: 'monitor',
			name: 'monitor',
			meta: { title: '系统监控' },
			component: () => import('@control/views/system-monitor/index.vue'),
		},
		{
			path: 'daily',
			name: 'daily',
			meta: { title: '面板日报' },
			component: () => import('@control/views/panel-daily/index.vue'),
		},
	],
}

export default controlRoutes
