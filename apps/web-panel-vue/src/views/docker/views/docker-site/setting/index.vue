<template>
	<BtTabs />
</template>
<script lang="tsx" setup>
import { storeToRefs } from 'pinia';
import { useTabs } from '@/hooks/tools';
import { DOCKER_SITE_STORE } from '@docker/views/docker-site/useStore';

import Domain from './domain-manage/index.vue';
import SiteDir from './site-dir/index.vue';
import PseudoStatic from './pseudo-static/index.vue';
import ConfigFile from './config-file/index.vue';
import Redirect from './redirect/index.vue';
import HotlinkProtection from './hotlink-protection/index.vue';
import SiteLogs from './site-logs/index.vue';
import SitePhp from './site-php/index.vue';


const { settingTabActive,siteInfo } = storeToRefs(DOCKER_SITE_STORE());

const defaultActive = ref(settingTabActive.value || 'domain'); // 菜单默认展开项

const { BtTabs } = useTabs({
	type: 'left-bg-card',
	value: defaultActive,
	options: [
		{
			label: '域名管理',
			name: 'domain',
			lazy: true,
			render: () => <Domain />,
		},
		{
			label: '网站目录',
			name: 'dir',
			lazy: true,
			render: () => <SiteDir />,
		},
		{
			label: '反向代理',
			name: 'urlProxy',
			lazy: true,
			render: () => import('./url-proxy/index.vue'),
		},
		{
			label: '全局配置',
			name: 'golbalConfig',
			lazy: true,
			render: () => import('./global-config/index.vue'),
		},
		{
			label: '伪静态',
			name: 'pseudo',
			lazy: true,
			render: () => <PseudoStatic />,
		},
		{
			label: '配置文件',
			name: 'configFile',
			lazy: true,
			render: () => <ConfigFile />,
		},
		{
			label: 'SSL',
			name: 'ssl',
			lazy: true,
			render: () => import('./ssl/index.vue'),
		},
		...(siteInfo.value.type === 'PHP' ? [{
			label: 'PHP',
			name: 'php',
			lazy: true,
			render: () => <SitePhp />,
		}]:[]),
		{
			label: '重定向',
			name: 'redirect',
			lazy: true,
			render: () => <Redirect />,
		},
		{
			label: '防盗链',
			name: 'antiLeech',
			lazy: true,
			render: () => <HotlinkProtection />,
		},
		{
			label: '日志',
			name: 'siteLogs',
			lazy: true,
			render: () => <SiteLogs />,
		},
	],
});

// 监听是否跳转
watch(
	() => settingTabActive.value,
	val => {
		if (val) {
			defaultActive.value = settingTabActive.value;
			settingTabActive.value = ''
		}
	}
);
</script>

<style lang="css" scoped>
.bt-tabs :deep(.el-tabs__nav-wrap) {
	width: 12rem;
}
.bt-tabs :deep(.el-tabs__nav-scroll) {
	width: 100% !important;
}
.bt-tabs :deep(.el-tabs__nav .el-tabs__item) {
	width: 100%;
}
</style>
