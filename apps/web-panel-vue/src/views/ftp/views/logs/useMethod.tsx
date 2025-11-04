import ActionLog from './action-log.vue'
import LoginLog from './login-log.vue'

export const tabComponent = [
	{
		label: '登录日志',
		name: 'loginLog',
		render: () => <LoginLog></LoginLog>,
	},
	{
		label: '操作日志',
		name: 'actionLog',
		lazy: true,
		render: () => <ActionLog></ActionLog>,
	},
]
