import type { RouteRecordRaw } from 'vue-router'
import { getDockerStore } from '@docker/useStore'
import { Message } from '@/hooks/tools'

// 子账号页面路由拦截
// eslint-disable-next-line consistent-return
const beforeEnter: RouteRecordRaw['beforeEnter'] = async (to, from, next) => {
	try {
		const {
			refs: { settingData },
			getDockerState,
		} = getDockerStore()
		await getDockerState()
		// 未安装跳转到安装页面
		if (!to.path.includes('/docker')) return next('/docker/install')
		// 是否已安装
		const isInstall = settingData.value.docker_installed && settingData.value.docker_compose_installed
		// 是否正在安装
		const installing = !!settingData.value.installing
		// 是否运行
		const isOpen = settingData.value.service_status
		console.log(1, to.path)
		// 未安装或安装中跳转到安装页面
		if ((!isInstall || installing) && !to.path.includes('/docker/install')) {
			return next('/docker/install')
		}
		console.log(2, to.path)
		// 服务未运行跳转到设置页面
		if (!isOpen && isInstall && !installing && to.path !== '/docker/setting') {
			Message.warn('当前服务未运行，请先启动服务')
			return next('/docker/setting')
		}

		console.log(3, to.path)
		// 安装成功跳转到应用商店
		if (to.path.includes('/docker/install')) {
			return isInstall && !installing ? next('/docker/appstore') : next()
		}
		next()
	} catch (error) {
		console.error(error)
	}
	next()
}
const dockerRoutes: RouteRecordRaw = {
	name: 'docker',
	path: '/docker',
	meta: { sort: 5, title: 'Docker', icon: 'docker' },
	// beforeEnter,
	component: () => import('@docker/index.vue'),
	children: [
		{
			path: 'appstore',
			name: 'docker-appstore',
			meta: { title: '应用商店' },
			beforeEnter,
			component: () => import('@docker/views/app-store/index.vue'),
		},
		{
			path: 'conmanger',
			name: 'docker-conmanger',
			meta: { title: '总览' },
			beforeEnter,
			component: () => import('@docker/views/container-manger/index.vue'),
		},
		{
			path: 'dockersite',
			name: 'docker-site',
			meta: { title: '网站' },
			beforeEnter,
			component: () => import('@docker/views/docker-site/index.vue'),
		},
		{
			path: 'containers',
			name: 'docker-containers',
			meta: { title: '容器' },
			beforeEnter,
			component: () => import('@docker/views/container/index.vue'),
		},
		{
			path: 'cloudimages',
			name: 'docker-cloudimages',
			meta: { title: '线上镜像' },
			beforeEnter,
			component: () => import('@docker/views/cloud-images/index.vue'),
		},
		{
			path: 'images',
			name: 'docker-images',
			meta: { title: '本地镜像' },
			beforeEnter,
			component: () => import('@docker/views/images/index.vue'),
		},
		{
			path: 'orchestration',
			name: 'docker-orchestration',
			meta: { title: '容器编排' },
			beforeEnter,
			component: () => import('@docker/views/orchestration/index.vue'),
		},
		{
			path: 'network',
			name: 'docker-network',
			meta: { title: '网络' },
			beforeEnter,
			component: () => import('@docker/views/network/index.vue'),
		},
		{
			path: 'storage',
			name: 'docker-storage',
			meta: { title: '存储卷' },
			beforeEnter,
			component: () => import('@docker/views/storage/index.vue'),
		},
		{
			path: 'warehouse',
			name: 'docker-warehouse',
			meta: { title: '仓库' },
			beforeEnter,
			component: () => import('@docker/views/warehouse/index.vue'),
		},
		{
			path: 'setting',
			name: 'docker-setting',
			meta: { title: '设置' },
			beforeEnter,
			component: () => import('@docker/views/setting/index.vue'),
		},
		{
			path: 'install',
			name: 'docker-install',
			meta: { title: 'Docker安装', ignore: true },
			beforeEnter,
			component: () => import('@docker/views/install/index.vue'),
		},
	],
}

export default dockerRoutes
