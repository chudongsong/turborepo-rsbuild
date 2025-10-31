import type { RouteRecordRaw } from 'vue-router'
import { getMailStore } from '@mail/useStore'

// mail页面路由拦截
const beforeEnter: RouteRecordRaw['beforeEnter'] = async (to, from, next) => {
	try {
		const {
			refs: { install, tabActive },
			getMailInfo,
		} = getMailStore()
		await getMailInfo()
		if (!install.value && to.path !== '/mail/setting') {
			next('/mail/setting')
			tabActive.value = 'mail-setting'
			return
		}
	} catch (error) {
		console.log(error)
	}
	next()
}

// mail页面路由拦截
const mailRoutes: RouteRecordRaw = {
	name: 'mail',
	path: '/mail',
	meta: { sort: 14, icon: 'mail', title: '邮局管理' },
	component: () => import('@mail/index.vue'),
	redirect: '/mail/market',
	children: [
		{
			path: 'market',
			name: 'market',
			meta: {
				title: '邮件营销',
			},
			beforeEnter,
			component: () => import('@/views/mail/views/market/index.vue'),
		},
		{
			path: 'maildomain',
			name: 'maildomain',
			meta: { title: '域名' },
			component: () => import('@mail/views/domain/index.vue'),
			beforeEnter,
		},
		{
			path: 'mailbox',
			name: 'mailbox',
			meta: { title: '邮箱' },
			beforeEnter,
			component: () => import('@mail/views/mailbox/index.vue'),
		},
		{
			path: 'email',
			name: 'email',
			meta: { title: '邮件' },
			beforeEnter,
			component: () => import('@mail/views/email/index.vue'),
		},
		{
			path: 'setting',
			name: 'mail-setting',
			meta: { title: '设置' },
			beforeEnter,
			component: () => import('@mail/views/setting/index.vue'),
		},
	],
}

export default mailRoutes
