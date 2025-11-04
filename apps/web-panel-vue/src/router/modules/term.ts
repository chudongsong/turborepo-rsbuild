import type { RouteRecordRaw } from 'vue-router'

const xtermRoutes: RouteRecordRaw = {
	name: 'xterm',
	path: '/xterm',
	meta: { sort: 15, title: '终端', icon: 'xterm' },
	component: () => import('@term/index.vue'),
}

export default xtermRoutes
