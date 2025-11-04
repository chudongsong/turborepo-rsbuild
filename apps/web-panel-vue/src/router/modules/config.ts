import type { RouteRecordRaw } from 'vue-router'

const configRoutes: RouteRecordRaw = {
	name: 'config',
	path: '/config',
	meta: { sort: 19, title: '设置', icon: 'config' },
	component: () => import('@config/index.vue'),
	children: [
		{
			path: 'common',
			name: 'common',
			meta: { title: '常用设置' },
			component: () => import('@config/views/common-settings/index.vue'),
		},
		{
			path: 'panel',
			name: 'panel',
			meta: { title: '面板设置' },
			component: () => import('@config/views/panel-settings/index.vue'),
		},
		{
			path: 'safe',
			name: 'safe',
			meta: { title: '安全设置' },
			component: () => import('@config/views/safe-settings/index.vue'),
		},
		// {
		// 	path: 'whole',
		// 	name: 'whole',
		// 	meta: { title: '全部设置' },
		// 	component: () => import('@config/views/all-settings/index.vue'),
		// },
		{
			path: 'ui',
			name: 'ui',
			meta: { title: '界面设置' },
			component: () => import('@config/views/ui-settings/index.vue'),
		},
		{
			path: 'alarm',
			name: 'alarm',
			meta: { title: '告警通知' },
			component: () => import('@config/views/alarm-notice/index.vue'),
		},
		// {
		// 	path: 'message',
		// 	name: 'message',
		// 	meta: { title: '消息中心' },
		// 	component: () => import('@config/views/message-center/index.vue'),
		// },
		{
			path: 'back',
			name: 'back',
			meta: { title: '备份还原' },
			component: () => import('@config/views/new-sync/index.vue'),
		},
		{
			path: 'migrate',
			name: 'migrate',
			meta: { title: '整机迁移' },
			component: () => import('@config/views/migrate/index.vue'),
		},
	],
}

export default configRoutes
