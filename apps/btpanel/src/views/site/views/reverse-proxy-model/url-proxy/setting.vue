<template>
	<BtTabs class="p-[1.6rem]" />
</template>

<script setup lang="ts">
import { tabActive, getCommonData } from './useController';
import { useTabs } from '@/hooks/tools';

const { BtTabs } = useTabs({
	type: 'card',
	value: tabActive,
	options: [
		{
			label: '反向代理',
			name: 'proxy',
			lazy: true,
			render: () => import('@site/views/reverse-proxy-model/url-proxy/setting-proxy.vue'),
		},
		// {
		// 	label: '自定义配置',
		// 	name: 'custom',
		// 	lazy: true,
		// 	render: () => import('@site/views/reverse-proxy-model/url-proxy/setting-custom.vue'),
		// },
		{
			label: '内容替换',
			name: 'replace',
			lazy: true,
			render: () => import('@site/views/reverse-proxy-model/url-proxy/setting-replace.vue'),
		},
		{
			label: '缓存',
			name: 'cache',
			lazy: true,
			render: () => import('@site/views/reverse-proxy-model/url-proxy/setting-cache.vue'),
		},
		{
			label: '内容压缩',
			name: 'compress',
			lazy: true,
			render: () => import('@site/views/reverse-proxy-model/url-proxy/setting-compress.vue'),
		},
		{
			label: 'IP黑名单',
			name: 'ipBlackList',
			lazy: true,
			render: () => import('@site/views/reverse-proxy-model/url-proxy/setting-ip-list.vue'),
		},
		{
			label: 'IP白名单',
			name: 'ipWhiteList',
			lazy: true,
			render: () => import('@site/views/reverse-proxy-model/url-proxy/setting-ip-list.vue'),
		},
		{
			label: '防盗链',
			name: 'antiLeech',
			lazy: true,
			render: () => import('@site/public/hotlink-protection/index.vue'),
		},
	],
});

watch(
	() => tabActive.value,
	() => {
		getCommonData();
	},
	{ immediate: true }
);

onMounted(async () => {
	getCommonData();
});
</script>

<style lang="css" scoped>
:deep(.el-tabs__nav) {
	display: flex;
	align-items: center;
}
</style>
