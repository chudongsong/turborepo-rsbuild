import type { RouteRecordRaw } from 'vue-router'
import { getNodeUsedStatus } from '@/api/node'
import { Message } from '@/hooks/tools'

// 页面路由拦截
const beforeEnter: RouteRecordRaw['beforeEnter'] = async (to, from, next) => {
	try {
		const { data } = await getNodeUsedStatus()
		if (data.msg !== '未使用' && data.status === false) Message.error(data.msg)
		const isNodeInstall = to.path.includes('/node/install') // 跳转到安装页面
		if (!data.status && !isNodeInstall) {
			return next('/node/install')
		}
		if (isNodeInstall) {
			return data.status ? next('/node/node-mgt') : next()
		}
		next()
	} catch (error) {
		console.error(error)
	}
	next()
}

const nodeRoutes: RouteRecordRaw = {
	name: 'node',
	path: '/node',
	meta: { sort: 16, title: '节点管理', icon: 'node' },
	component: () => import('@node/index.vue'),
	redirect: '/node/node-mgt',
	children: [
		{
			path: 'node-mgt',
			name: 'node-mgt',
			meta: { title: '节点' },
			beforeEnter,
			component: () => import('@node/views/node-mgt/index.vue'),
		},
		{
			path: 'node-clb',
			name: 'node-clb',
			meta: { title: '负载均衡' },
			beforeEnter,
			component: () => import('@node/views/node-clb/index.vue'),
		},
		{
			path: 'master',
			name: 'master',
			meta: { title: '主从复制' },
			beforeEnter,
			component: () => import('@node/views/master/index.vue'),
		},
		{
			path: 'file-transfer',
			name: 'file-transfer',
			meta: { title: '文件互传' },
			beforeEnter,
			component: () => import('@node/views/file-transfer/index.vue'),
		},
		{
			path: 'script-mass',
			name: 'script-mass',
			meta: { title: '分发管理' },
			beforeEnter,
			component: () => import('@node/views/script-mass/index.vue'),
		},
		{
			path: 'node-alarm',
			name: 'node-alarm',
			meta: { title: '告警管理' },
			beforeEnter,
			component: () => import('@node/views/node-alarm/index.vue'),
		},
		{
			path: 'install',
			name: 'node-install',
			meta: { title: '安装', ignore: true },
			beforeEnter,
			component: () => import('@node/views/install/index.vue'),
		},
	],
}

export default nodeRoutes
