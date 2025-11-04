<template>
	<div>
		<el-alert type="error" class="mb-[16px]" :closable="false" v-if="!localRow.php_version_status">
			<template #title>
				<div>
					温馨提示：
					<template v-if="localRow.php_version && localRow.php_version !== '静态'"> 检测到当前站点使用的 PHP-{{ localRow.php_version }} 未安装，点击 </template>
					<template v-else> 当前站点 PHP 未安装，点击 </template>
					<span class="bt-link" @click="tabActive = 'php'"> {{ localRow.php_version ? '安装或切换PHP版本' : '安装PHP' }} </span>。
				</div>
			</template>
		</el-alert>
		<BtTabs class="h-[70rem]" />
	</div>
</template>

<script setup lang="tsx">
import { useTabs } from '@/hooks/tools'
import useWPLocalConfigStore from './useStore'
import { useWPLocalStore } from '@/views/wordpress/view/local/useStore'
import { initTab } from './useController'

const { localRow } = useWPLocalStore()
const { tabActive } = storeToRefs(useWPLocalConfigStore())

const { BtTabs } = useTabs({
	type: 'left-bg-card',
	value: tabActive,
	options: [
		{
			label: '域名管理',
			name: 'domain',
			lazy: true,
			render: () => defineAsyncComponent(() => import('@/views/wordpress/view/local/site-config/domain/index.vue')),
		},
		{
			label: 'WordPress 设置',
			name: 'wordpress',
			render: () => defineAsyncComponent(() => import('@/views/wordpress/view/local/site-config/wordpress/index.vue')),
		},
		{
			name: 'security',
			label: '安全',
			lazy: true,
			render: () => defineAsyncComponent(() => import('@/views/wordpress/view/local/site-config/security/index.vue')),
		},
		{
			name: 'config',
			label: '配置',
			lazy: true,
			render: () => defineAsyncComponent(() => import('@/views/wordpress/view/local/site-config/config/index.vue')),
		},
		{
			name: 'ssl',
			label: 'SSL',
			lazy: true,
			render: () => defineAsyncComponent(() => import('@/views/wordpress/view/local/site-config/ssl/index.vue')),
		},
		{
			name: 'php',
			label: 'PHP 版本',
			lazy: true,
			render: () => defineAsyncComponent(() => import('@/views/wordpress/view/local/site-config/php/index.vue')),
		},
		{
			name: 'logs',
			label: '响应日志',
			lazy: true,
			render: () => defineAsyncComponent(() => import('@/views/wordpress/view/local/site-config/logs/index.vue')),
		},
	],
})

onMounted(initTab)
</script>

<style lang="css" scoped>
:deep(.el-tabs__nav-scroll) .el-tabs__nav.is-left {
	width: 15rem !important;
}
</style>
