import type { RouteRecordRaw } from 'vue-router'

const fileRoutes: RouteRecordRaw = {
	name: 'files',
	path: '/files',
	meta: { sort: 9, title: '文件', icon: 'files' },
	component: () => import('@files/index.vue'),
}

export default fileRoutes
