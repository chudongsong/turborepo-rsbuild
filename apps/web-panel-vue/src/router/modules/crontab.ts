import type { RouteRecordRaw } from 'vue-router'

const crontabRoutes: RouteRecordRaw = {
	name: 'crontab',
	path: '/crontab',
	meta: { sort: 17, title: '计划任务', icon: 'crontab' },
	component: () => import('@crontab/index.vue'),
	children: [
		{
			path: 'task',
			name: 'task',
			meta: { title: '计划任务' },
			component: () => import('@crontab/views/crontab-task/index.vue'),
		},
		{
			path: 'library',
			name: 'library',
			meta: { title: '脚本库' },
			component: () => import('@crontab/views/script-library/index.vue'),
		},
	],
}

export default crontabRoutes
