<template>
	<BtTabs />
	<!-- <bt-tabs
		:before-leave="handleClickTab"
		class="w-full h-full"
		type="border-card"
		position="left"
		v-model="defaultActive"
		:config="tabComponent" /> -->
</template>
<script lang="ts" setup>
import { useTabs } from '@/hooks/tools'
import { useSiteStore, SITE_STORE } from '@site/useStore'

const { settingTabActive, isJump, siteInfo } = useSiteStore()
const { resetTab } = SITE_STORE()

const defaultActive = ref(settingTabActive.value || 'project') // 菜单默认展开项

const { BtTabs } = useTabs({
	type: 'left-bg-card',
	value: defaultActive,
	options: [
		{
			label: '项目信息',
			name: 'project',
			lazy: true,
			render: () => import('@site/views/python-model/add-python/index.vue'),
		},
		{
			label: '域名管理',
			name: 'domain',
			lazy: true,
			render: () => import('@site/public/domain-manage/index.vue'),
		},
		{
			label: '外网映射',
			name: 'mapping',
			lazy: true,
			render: () => import('@site/public/external-map/index.vue'),
		},
		{
			label: '配置文件',
			name: 'configFile',
			lazy: true,
			render: () => import('@site/public/config-file/index.vue'),
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
		...(['uwsgi', 'gunicorn'].includes(siteInfo.value.project_config.stype)
			? [
					{
						label: `${siteInfo.value.project_config.stype}配置`,
						name: 'runningConfig',
						lazy: true,
						render: () => import('@site/views/python-model/running-config/index.vue'),
					},
			  ]
			: []),
		{
			label: '服务状态',
			name: 'state',
			lazy: true,
			render: () => import('@site/public/service-state/index.vue'),
		},
		{
			label: '协同服务',
			name: 'collaborativeService',
			lazy: true,
			render: () => import('@site/views/python-model/collaborative-service/index.vue'),
		},
		{
			label: '环境管理',
			name: 'envManager',
			lazy: true,
			render: () => import('@site/views/python-model/env-manage/index.vue'),
		},
		{
			label: '项目日志',
			name: 'projectLogs',
			lazy: true,
			render: () => import('@site/public/project-logs/index.vue'),
		},
		{
			label: '网站日志',
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

onMounted(() => {
	// isShowRunningConfig()
})
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
