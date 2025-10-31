import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './hooks/roles' // 路由配置
import { useCreateRouterEach } from './hooks/router-each' // 路由守卫

// 创建路由地址
const router = createRouter({
	routes: [
		{
			name: 'layout',
			path: '/',
			redirect: '/home', // 重定向/home
			component: () => import('@layout/index.vue'),
			children: [
				{
					path: 'test',
					name: '/test',
					meta: { title: '测试模块' },
					component: () => import('@views/test/index.vue'),
				},
				{
					name: 'bind-user',
					path: '/bind',
					meta: { title: '绑定堡塔账号' },
					component: () => import('@views/bind-user/index.vue'),
				},
				{
					name: 'modify-password',
					path: '/modify_password',
					meta: { title: '修改密码' },
					component: () => import('@views/modify-password/index.vue'),
				},
				...routes,
			],
		},
	] as RouteRecordRaw[],
	history: createWebHistory(),
	scrollBehavior: () => ({ left: 0, top: 0 }),
})
// 创建路由守卫
useCreateRouterEach(router)

export { router }
