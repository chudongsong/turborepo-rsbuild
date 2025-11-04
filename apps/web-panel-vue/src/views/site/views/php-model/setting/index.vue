<template>
	<BtTabs />
</template>
<script lang="tsx" setup>
import { useTabs } from '@/hooks/tools'
import { SITE_STORE, useSiteStore } from '@site/useStore'

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
			label: '子目录绑定',
			name: 'subdirectory',
			lazy: true,
			render: () => import('@site/views/php-model/subdirectory-bind/index.vue'),
		},
		{
			label: '网站目录',
			lazy: true,
			name: 'directory',
			render: () => import('@site/views/php-model/site-cataluge/index.vue'),
		},
		{
			label: '访问限制',
			name: 'access',
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
			label: '伪静态',
			name: 'pseudo',
			lazy: true,
			render: () => import('@site/public/pseudo-static/index.vue'),
		},
		{
			label: '默认文档',
			name: 'default',
			lazy: true,
			render: () => import('@site/views/php-model/default-content/index.vue'),
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
			label: 'PHP',
			lazy: true,
			name: 'php',
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
			lazy: true,
			name: 'proxy',
			render: () => import('@site/public/reverse-proxy/index.vue'),
		},
		{
			label: '防盗链',
			lazy: true,
			name: 'antiLeech',
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
			lazy: true,
			name: 'siteSecurity',
			render: () => import('@site/views/php-model/site-safe/index.vue'),
		},

		{
			label: '网站日志',
			name: 'siteLogs',
			lazy: true,
			render: () => import('@site/public/site-logs/index.vue'),
		},
		{
			label: '网站告警',
			lazy: true,
			name: 'siteAlarm',
			render: () => import('@site/views/php-model/site-alarm/index.vue'),
		},
		{
			label: '其他设置',
			name: 'otherSettings',
			lazy: true,
			render: () => import('@site/views/php-model/other-setting/index.vue'),
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
