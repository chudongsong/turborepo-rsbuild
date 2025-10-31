<template>
	<BtTabs />
</template>

<script setup lang="ts">
import { useTabs } from '@/hooks/tools'
import { tabActive, getGlobalConfig } from './useController'

const { BtTabs } = useTabs({
	type: 'card',
	value: tabActive,
	options: [
		// {
		// 	label: '缓存',
		// 	name: 'cache',
		// 	lazy: true,
		// 	render: () => import('@site/views/reverse-proxy-model/global-config/cache.vue'),
		// },
		{
			label: '内容压缩',
			name: 'compress',
			lazy: true,
			render: () => import('@site/views/reverse-proxy-model/global-config/content-compression.vue'),
		},
		{
			label: 'IP黑名单',
			name: 'ipBlackList',
			lazy: true,
			render: () => import('@site/views/reverse-proxy-model/global-config/ip-list.vue'),
		},
		{
			label: 'IP白名单',
			name: 'ipWhiteList',
			lazy: true,
			render: () => import('@site/views/reverse-proxy-model/global-config/ip-list.vue'),
		},
		{
			label: 'http认证',
			name: 'basicauth',
			lazy: true,
			render: () => import('@site/views/reverse-proxy-model/global-config/http-auth.vue'),
		},
		{
			label: '日志',
			name: 'siteLogs',
			lazy: true,
			render: () => import('@site/views/reverse-proxy-model/global-config/log.vue'),
		},
		{
			label: 'websocket',
			name: 'websocket',
			lazy: true,
			render: () => import('@site/views/reverse-proxy-model/global-config/websocket.vue'),
		},
	],
})

watch(
	() => tabActive.value,
	val => {
		getGlobalConfig()
	}
)

	getGlobalConfig()
</script>
