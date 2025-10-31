import type { RouteRecordRaw } from 'vue-router'

const wpRoutes: RouteRecordRaw = {
	name: 'wp',
	path: '/wp',
	meta: { sort: 11, title: 'WP Tools', icon: 'wordpress' },
	component: () => import('@/views/wordpress/index.vue'),
	children: [
		{
			path: 'local',
			name: 'local',
			meta: { title: '本地管理' },
			component: () => import('@/views/wordpress/view/local/index.vue'),
		},
		{
			path: 'remote',
			name: 'remote',
			meta: { title: '远程管理' },
			component: () => import('@/views/wordpress/view/remote/index.vue'),
		},
	],
}

export default wpRoutes
