<template>
	<BtTabs />
</template>

<script setup lang="tsx">
import { useTabs } from '@/hooks/tools'
import { SITE_STORE, useSiteStore } from '@site/useStore'
import DomainManage from '@site/public/domain-manage/index.vue'
import FlowLimit from '@site/public/flow-setting/flow-limit/index.vue'
import PseudoStatic from '@site/public/pseudo-static/index.vue'
import ConfigFile from '@site/public/config-file/index.vue'
import Redirect from '@site/public/redirect/index.vue'
import SiteLogs from '@site/public/site-logs/index.vue'
import SslArrange from '@site/public/ssl-arrange/index.vue'

const { settingTabActive, isJump } = useSiteStore()
const { resetTab } = SITE_STORE()

const tabActive = ref(settingTabActive.value || 'domain')

const { BtTabs } = useTabs({
	type: 'left-bg-card',
	value: tabActive,
	options: [
		{
			label: '域名管理',
			name: 'domain',
			lazy: true,
			render: () => DomainManage,
		},
		{
			label: '流量限制',
			name: 'limit',
			lazy: true,
			render: () => FlowLimit,
		},
		{
			label: '伪静态',
			name: 'pseudo',
			lazy: true,
			render: () => PseudoStatic,
		},
		{
			label: '配置文件',
			name: 'configFile',
			lazy: true,
			render: () => ConfigFile,
		},
		{
			label: '重定向',
			name: 'redirect',
			lazy: true,
			render: () => Redirect,
		},
		{
			label: 'SSL',
			name: 'ssl',
			lazy: true,
			render: () => SslArrange,
		},
		{
			label: '网站日志',
			name: 'siteLogs',
			lazy: true,
			render: () => SiteLogs,
		},
	],
})

// 监听是否跳转
watch(
	() => isJump.value,
	val => {
		if (val) {
			tabActive.value = settingTabActive.value
			resetTab()
		}
	}
)
</script>
