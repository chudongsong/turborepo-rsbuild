<template>
	<BtTabs />
</template>
<script lang="ts" setup>
import { useTabs } from '@/hooks/tools'
import { useSiteStore, SITE_STORE } from '@site/useStore'

const { settingTabActive, isJump } = useSiteStore()
const { resetTab } = SITE_STORE()

const defaultActive = ref(settingTabActive.value || 'domain') // 菜单默认展开项

const { BtTabs } = useTabs({
	type: 'left-bg-card',
	value: defaultActive,
	options: [
		{
			label: '域名管理',
			name: 'domain',
			lazy: true,
			render: () => import('@site/public/domain-manage/index.vue'),
		},
		{
			label: 'URL代理',
			name: 'urlProxy',
			lazy: true,
			render: () => import('@site/views/reverse-proxy-model/url-proxy/index.vue'),
		},
		{
			label: '全局配置',
			name: 'golbalConfig',
			lazy: true,
			render: () => import('@site/views/reverse-proxy-model/global-config/index.vue'),
		},
		{
			label: '配置文件',
			name: 'configFile',
			lazy: true,
			render: () => import('@site/views/reverse-proxy-model/config-file/index.vue'),
		},
		{
			label: 'SSL',
			name: 'ssl',
			lazy: true,
			render: () => import('@site/public/ssl-arrange/index.vue'),
		},
		{
			label: '重定向',
			name: 'redirect',
			lazy: true,
			render: () => import('@site/public/redirect/index.vue'),
		},
		// {
		// 	label: '防盗链',
		// 	name: 'antiLeech',
		// 	lazy: true,
		// 	render: () => import('@site/public/hotlink-protection/index.vue'),
		// },
		{
			label: '日志',
			name: 'siteLogs',
			lazy: true,
			render: () => import('@site/public/site-logs/index.vue'),
		},
	],
})

// 监听是否跳转
watch(
	() => isJump.value,
	val => {
		if (val) {
			defaultActive.value = settingTabActive.value
			resetTab()
		}
	}
)
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
