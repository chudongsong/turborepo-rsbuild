import type { RouteRecordRaw } from 'vue-router'

const firewallRoutes: RouteRecordRaw = {
	name: 'firewall',
	path: '/firewall',
	meta: { sort: 7, title: '安全', icon: 'firewall' },
	component: () => import('@firewall/index.vue'),
	children: [
		{
			path: 'system',
			name: 'system',
			meta: { title: '系统防火墙' },
			component: () => import('@firewall/views/system-firewall/index.vue'),
		},
		{
			path: 'ssh-manger',
			name: 'ssh-manger',
			meta: { title: 'SSH管理' },
			component: () => import('@firewall/views/ssh-manger/index.vue'),
		},
		{
			path: 'server-safe',
			name: 'server-safe',
			meta: { title: '服务器安全' },
			component: () => import('@firewall/views/server-safe/index.vue'),
		},
		{
			path: 'safe-detect',
			name: 'safe-detect',
			meta: { title: '安全检测' },
			component: () => import('@firewall/views/safe-detect/index.vue'),
		},
		{
			path: 'keyword',
			name: 'keyword',
			meta: { title: '违规词检测' },
			component: () => import('@firewall/views/keywords-monitor/index.vue'),
		},
		{
			path: 'php-safe',
			name: 'php-safe',
			meta: { title: 'PHP网站安全' },
			component: () => import('@firewall/views/php-site-safe/index.vue'),
		},
		{
			path: 'intrusion',
			name: 'intrusion',
			meta: { title: '入侵防御' },
			component: () => import('@firewall/views/intrusion-prevention/index.vue'),
		},
		{
			path: 'fixed',
			name: 'fixed',
			meta: { title: '系统加固' },
			component: () => import('@firewall/views/system-reinforce/index.vue'),
		},
		{
			path: 'network-scan',
			name: 'network-scan',
			meta: { title: '扫描感知' },
			component: () => import('@firewall/views/network-scan/index.vue')
		}
	],
}

export default firewallRoutes
