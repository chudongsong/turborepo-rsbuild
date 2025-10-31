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
import { useSiteStore, SITE_STORE } from '@site/useStore'
import { useTabs } from '@/hooks/tools'

const { settingTabActive, isJump, siteInfo } = useSiteStore()
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
			label: '服务管理',
			name: 'project',
			lazy: true,
			render: () => import('@site/public/service-state/index.vue'),
		},
		{
			label: 'Composer',
			name: 'composer',
			lazy: true,
			render: () => import('@site/views/php-model/composer/index.vue'),
		},
		{
			label: '访问限制',
			name: 'accessRestriction',
			lazy: true,
			render: () => import('@site/views/php-model/access-restriction/index.vue'),
		},
		{
			label: '流量限制',
			name: 'limit',
			lazy: true,
			render: () => import('@site/public/flow-setting/index.vue'),
		},
		{
			label: '版本管理',
			name: 'version',
			lazy: true,
			render: () => import('@site/public/version-manage/index.vue'),
		},
		{
			label: '配置文件',
			name: 'configFile',
			lazy: true,
			render: () => import('@site/views/php-model/async-config-file/index.vue'),
		},
		{
			label: 'SSL',
			name: 'ssl',
			lazy: true,
			render: () => import('@site/public/ssl-arrange/index.vue'),
		},
		{
			label: 'PHP',
			name: 'php',
			lazy: true,
			render: () => import('@site/views/php-model/php-setting/index.vue'),
		},
		{
			label: '重定向',
			name: 'redirect',
			lazy: true,
			render: () => import('@site/public/redirect/index.vue'),
		},
		{
			label: '反向代理',
			name: 'proxy',
			lazy: true,
			render: () => import('@site/public/reverse-proxy/index.vue'),
		},
		{
			label: '防盗链',
			name: 'antiLeech',
			lazy: true,
			render: () => import('@site/public/hotlink-protection/index.vue'),
		},
		{
			label: '防篡改',
			name: 'antiTamper',
			lazy: true,
			render: () => import('@site/views/php-model/tamper-proof-core/index.vue'),
		},
		{
			label: '网站安全',
			name: 'siteSecurity',
			lazy: true,
			render: () => import('@site/views/php-model/site-safe/index.vue'),
		},
		{
			label: '项目日志',
			name: 'log',
			lazy: true,
			render: () => import('@site/views/php-model/project-logs/index.vue'),
		},
		{
			label: '其他设置',
			name: 'otherSettings',
			lazy: true,
			render: () => import('@site/views/php-model/other-setting/index.vue'),
		},
	],
})

const handleClickTab = async (tab: any) => {}

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

<style lang="css" scoped></style>
