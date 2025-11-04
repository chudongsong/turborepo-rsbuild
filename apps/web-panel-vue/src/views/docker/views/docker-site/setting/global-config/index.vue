<template>
	<BtTabs class="h-[650px]" />
</template>

<script setup lang="tsx">
import { useTabs } from '@/hooks/tools'
import { tabActive, getGlobalConfig } from './useController'

import Cache from '@docker/views/docker-site/setting/global-config/cache.vue'
import Compress from '@docker/views/docker-site/setting/global-config/content-compression.vue'
import IpList from '@docker/views/docker-site/setting/global-config/ip-list.vue'
import HttpAuth from '@docker/views/docker-site/setting/global-config/http-auth.vue'
import Websocket from '@docker/views/docker-site/setting/global-config/websocket.vue'
import SetPage from '@docker/views/docker-site/setting/global-config/set-404-page.vue'
import Ipv6status from '@docker/views/docker-site/setting/global-config/ipv6-status.vue'

const { BtTabs } = useTabs({
	type: 'card',
	value: tabActive,
	options: [
		{
			label: '缓存',
			name: 'cache',
			lazy: true,
			render: () => <Cache />,
		},
		{
			label: '内容压缩',
			name: 'compress',
			lazy: true,
			render: () => <Compress />,
		},
		{
			label: 'IP黑名单',
			name: 'ipBlackList',
			lazy: true,
			render: () => <IpList />,
		},
		{
			label: 'IP白名单',
			name: 'ipWhiteList',
			lazy: true,
			render: () => <IpList />,
		},
		{
			label: 'http认证',
			name: 'basicauth',
			lazy: true,
			render: () => <HttpAuth />,
		},
		// {
		// 	label: '日志',
		// 	name: 'siteLogs',
		// 	lazy: true,
		// 	render: () => <Log />,
		// },
		{
			label: 'websocket',
			name: 'websocket',
			lazy: true,
			render: () => <Websocket />,
		},
		{
			label: '404错误页',
			name: '404',
			lazy: true,
			render: () => <SetPage />,
		},
		{
			label: 'IPv6',
			name: 'ipv6',
			lazy: true,
			render: () => <Ipv6status />,
		},
	],
})

// const tabComponent = [
// 	{
// 		title: '缓存',
// 		type: 'cache',
// 		compData: { ...props.compData },
// 		component: () => import('@docker/views/docker-site/setting/global-config/cache.vue'),
// 	},
// 	{
// 		title: '内容压缩',
// 		type: 'compress',
// 		compData: { ...props.compData },
// 		component: () => import('@docker/views/docker-site/setting/global-config/content-compression.vue'),
// 	},
// 	{
// 		title: 'IP黑名单',
// 		type: 'ipBlackList',
// 		compData: { ...props.compData, listType: 'black' },
// 		component: () => import('@docker/views/docker-site/setting/global-config/ip-list.vue'),
// 	},
// 	{
// 		title: 'IP白名单',
// 		type: 'ipWhiteList',
// 		compData: { ...props.compData, listType: 'white' },
// 		component: () => import('@docker/views/docker-site/setting/global-config/ip-list.vue'),
// 	},
// 	{
// 		title: 'http认证',
// 		type: 'basicauth',
// 		compData: { ...props.compData },
// 		component: () => import('@docker/views/docker-site/setting/global-config/http-auth.vue'),
// 	},
// 	{
// 		title: '日志',
// 		type: 'siteLogs',
// 		compData: { ...props.compData },
// 		component: () => import('@docker/views/docker-site/setting/global-config/log.vue'),
// 	},
// 	{
// 		title: 'websocket',
// 		type: 'websocket',
// 		compData: { ...props.compData },
// 		component: () => import('@docker/views/docker-site/setting/global-config/websocket.vue'),
// 	},
// ]
watch(
	() => tabActive.value,
	val => {
		getGlobalConfig()
	}
)

onMounted(async () => {
	getGlobalConfig()
})
</script>
<style scoped>
:deep(.el-tabs__nav .el-tabs__item) {
	width: 100%;
	padding: 0 1.8rem;
}
</style>
