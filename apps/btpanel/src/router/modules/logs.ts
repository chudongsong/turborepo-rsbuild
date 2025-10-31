import type { RouteRecordRaw } from 'vue-router'

const logsRoutes: RouteRecordRaw = {
	name: 'logs',
	path: '/logs',
	meta: { sort: 10, title: '日志', icon: 'logs' },
	component: () => import('@logs/index.vue'),
	children: [
		{
			path: 'panel-log',
			name: 'panel-log',
			meta: { title: '面板日志' },
			component: () => import('@logs/views/panel-log/index.vue'),
		},
		{
			path: 'web',
			name: 'web',
			meta: { title: '网站日志' },
			component: () => import('@logs/views/web-log/index.vue'),
		},
		// {
		// 	path: 'audit',
		// 	name: 'audit',
		// 	meta: { title: '日志审计' },
		// 	component: () => import('@logs/views/audit-log/index.vue'),
		// },
		{
			path: 'ssh',
			name: 'ssh',
			meta: { title: 'SSH登录日志' },
			component: () => import('@logs/views/ssh-log/index.vue'),
		},
		{
			path: 'software',
			name: 'software',
			meta: { title: '软件日志' },
			component: () => import('@logs/views/soft-log/index.vue'),
		},
	],
}

export default logsRoutes
