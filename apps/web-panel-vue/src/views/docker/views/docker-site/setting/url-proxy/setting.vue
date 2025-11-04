<template>
	<BtTabs class="p-[1.6rem]" />
</template>

<script setup lang="tsx">
import { tabActive, getCommonData } from './useController';
import { useTabs } from '@/hooks/tools';

import Proxy from '@docker/views/docker-site/setting/url-proxy/setting-proxy.vue';
import Custom from '@docker/views/docker-site/setting/url-proxy/setting-custom.vue';
import Replace from '@docker/views/docker-site/setting/url-proxy/setting-replace.vue';
import Cache from '@docker/views/docker-site/setting/url-proxy/setting-cache.vue';
import Compress from '@docker/views/docker-site/setting/url-proxy/setting-compress.vue';
import IplistComponent from '@docker/views/docker-site/setting/url-proxy/setting-ip-list.vue';
import Buffer from '@docker/views/docker-site/setting/url-proxy/setting-buffer.vue';


const { BtTabs } = useTabs({
	type: 'card',
	value: tabActive,
	options: [
		{
			label: '反向代理',
			name: 'proxy',
			lazy: true,
			render: () => <Proxy />,
		},
		{
			label: '自定义配置',
			name: 'custom',
			lazy: true,
			render: () => <Custom />,
		},
		{
			label: '内容替换',
			name: 'replace',
			lazy: true,
			render: () => <Replace />,
		},
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
			render: () => <IplistComponent />,
		},
		{
			label: 'IP白名单',
			name: 'ipWhiteList',
			lazy: true,
			render: () => <IplistComponent />,
		},
		{
			label: 'buffer缓冲',
			name: 'buffer',
			lazy: true,
			render: () => <Buffer />,
		},
	],
});

watch(
	() => tabActive.value,
	() => {
		getCommonData();
	}
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
