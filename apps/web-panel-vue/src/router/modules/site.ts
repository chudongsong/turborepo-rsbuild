import type { RouteRecordRaw } from 'vue-router'

const siteRoutes: RouteRecordRaw = {
	name: 'site',
	path: '/site',
	meta: { sort: 2, title: '网站', icon: 'site' },
	component: () => import('@site/index.vue'),
	// redirect: '/site/php',
	children: [
		{
			path: 'php',
			name: 'php',
			meta: { title: 'PHP项目' },
			component: () => import('@site/views/php-model/index.vue'),
		},
		{
			path: 'java',
			name: 'java',
			meta: { title: 'Java项目' },
			component: () => import('@site/views/java-model/index.vue'),
		},
		{
			path: 'node',
			name: 'nodejs',
			meta: { title: 'Node项目' },
			component: () => import('@site/views/node-model/index.vue'),
		},
		{
			path: 'go',
			name: 'go',
			meta: { title: 'Go项目' },
			component: () => import('@site/views/go-model/index.vue'),
		},
		{
			path: 'python',
			name: 'python',
			meta: { title: 'Python项目' },
			component: () => import('@site/views/python-model/index.vue'),
		},
		{
			path: 'net',
			name: 'net',
			meta: { title: 'Net项目', icon: 'site' },
			component: () => import('@site/views/net-model/index.vue'),
		},
		{
			path: 'nginx',
			name: 'proxy',
			meta: { title: '反向代理' },
			component: () => import('@site/views/reverse-proxy-model/index.vue'),
		},
		{
			path: 'html',
			name: 'html',
			meta: { title: 'HTML项目' },
			component: () => import('@site/views/html-model/index.vue'),
		},
		{
			path: 'other',
			name: 'otherModel',
			meta: { title: '其他项目' },
			component: () => import('@site/views/other-model/index.vue'),
		},
	],
}

export default siteRoutes
