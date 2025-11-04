import type { RouteRecordRaw } from 'vue-router'
import { useSettingsStore } from '@vhost/views/settings/useStore'
import { Message } from '@/hooks/tools'

// vhost页面路由拦截
const beforeEnter: RouteRecordRaw['beforeEnter'] = async (to, from, next) => {
	try {
		const { getInfo, isInstall, isRunning } = useSettingsStore()
		await getInfo()

		// 参考mail模块的简洁实现：只检查安装状态，免费版判断交给组件处理
		if (!isInstall.value && to.path !== '/vhost/settings') {
			next('/vhost/settings')
			return
		}
		
		// 服务未运行跳转到设置页面
		if (!isRunning.value && isInstall.value && to.path !== '/vhost/settings') {
			Message.warn('当前服务未运行，请先启动服务')
			next('/vhost/settings')
			return
		}
		
	} catch (error) {
		console.log(error)
	}
	next()
}

const vhostRoutes: RouteRecordRaw = {
	name: 'vhost',
	path: '/vhost',
	meta: { sort: 13, icon: 'vhost', title: '多机管理' },
	component: () => import('@vhost/index.vue'),
	children: [
		{
			path: 'account',
			name: 'vhost-account',
			meta: { title: '用户' },
			beforeEnter,
			component: () => import('@vhost/views/account/index.vue'),
		},
		{
			path: 'package',
			name: 'vhost-package',
			meta: { title: '资源' },
			beforeEnter,
			component: () => import('@vhost/views/package/index.vue'),
		},
		{
			path: 'storage',
			name: 'vhost-storage',
			meta: { title: '存储' },
			beforeEnter,
			component: () => import('@vhost/views/storage/index.vue'),
		},
		{
			path: 'logs',
			name: 'vhost-logs',
			meta: { title: '日志' },
			beforeEnter,
			component: () => import('@vhost/views/logs/index.vue'),
		},
		{
			path: 'settings',
			name: 'vhost-settings',
			meta: { title: '设置' },
			beforeEnter,
			component: () => import('@vhost/views/settings/index.vue'),
		},
		{
			path: 'install',
			name: 'vhost-install',
			meta: { title: '多用户安装', ignore: true },
			beforeEnter,
			component: () => import('@vhost/views/install/index.vue'),
		},
	],
}

export default vhostRoutes
