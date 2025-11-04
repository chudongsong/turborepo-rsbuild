import ResponseLog from '@site/public/site-logs/response-log.vue'
import SafeAnalysis from '@views/wordpress/view/local/site-config/logs/analyse-log.vue'
import ErrorLog from '@site/public/site-logs/error-log.vue'

export const tabComponent = ref([
	{
		label: '响应日志',
		name: 'response',
		lazy: true,
		render: () => <ResponseLog></ResponseLog>,
	},
	{
		label: '错误日志',
		name: 'error',
		lazy: true,
		render: () => <ErrorLog></ErrorLog>,
	},
	{
		label: '日志安全分析',
		name: 'safe',
		lazy: true,
		render: () => <SafeAnalysis></SafeAnalysis>,
	},
])
