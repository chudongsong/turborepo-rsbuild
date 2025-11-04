<template>
	<BtTabs />
</template>
<script lang="ts" setup>
import { useTabs } from '@/hooks/tools'
import { SITE_STORE, useSiteStore } from '@site/useStore'

const emits = defineEmits(['close'])

const { settingTabActive, isJump, siteInfo } = useSiteStore()
const { resetTab } = SITE_STORE()

const defaultActive = ref(settingTabActive.value || 'project') // 菜单默认展开项

const { BtTabs } = useTabs({
	type: 'left-bg-card',
	value: defaultActive,
	options: [
		{
			label: '项目配置',
			name: 'project',
			lazy: true,
			render: () => import('@site/views/java-model/add-java/index.vue'),
		},
		{
			label: '服务',
			name: 'state',
			lazy: true,
			render: () => import('@site/public/service-state/index.vue'),
		},
		{
			label: '外网访问',
			name: 'mapping',
			lazy: true,
			render: () => import('@site/public/external-map/index.vue'),
		},
		{
			label: '域名管理',
			name: 'domain',
			lazy: true,
			render: () => import('@site/public/domain-manage/index.vue'),
		},
		{
			label: 'SSL',
			name: 'ssl',
			lazy: true,
			render: () => import('@site/public/ssl-arrange/index.vue'),
		},
		{
			label: '配置文件',
			name: 'configFile',
			lazy: true,
			render: () => import('@site/views/java-model/config-file/index.vue'),
		},
		{
			label: '重定向',
			name: 'redirect',
			lazy: true,
			render: () => import('@site/public/redirect/index.vue'),
		},
		{
			label: '伪静态配置',
			name: 'staticConfig',
			lazy: true,
			render: () => import('@site/views/java-model/static-config/index.vue'),
		},
		// {
		// 	label: '版本管理',
		// 	name: 'projectDir',
		// 	lazy: true,
		// 	render: () => import('@site/public/version-manage/index.vue'),
		// },
		{
			label: '负载状态',
			name: 'load',
			lazy: true,
			render: () => import('@site/public/load-state/index.vue'),
		},
		// ...(siteInfo.value?.project_config?.java_type !== 'springboot'
		// 	? []
		// 	: [
		// 			{
		// 				label: '性能监控',
		// 				name: 'performance',
		// 				lazy: true,
		// 				render: () => import('@site/views/java-model/performance-monitor/index.vue'),
		// 			},
		// 	  ]),
		{
			label: '日志管理',
			name: 'logsManager',
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
