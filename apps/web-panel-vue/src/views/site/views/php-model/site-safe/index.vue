<template>
	<BtTabs></BtTabs>
</template>

<script setup lang="tsx">
import { useTabs } from '@/hooks/tools'

const tabActive = ref('safeScan') // 当前激活的tab
const SafeScan = defineAsyncComponent(() => import('@site/views/php-model/site-safe/safe-scan/index.vue'))

const { BtTabs } = useTabs({
	type: 'card',
	value: tabActive,
	options: [
		{
			label: '安全扫描',
			name: 'safeScan',
			lazy: true,
			render: () => <SafeScan></SafeScan>,
		},
		{
			label: '违规词检测',
			name: 'wordDetection',
			lazy: true,
			render: () => import('@site/views/php-model/site-safe/violation-word-detection/index.vue'),
		},
		{
			label: '动态查杀',
			name: 'dynamicKilling',
			lazy: true,
			render: () => import('@site/views/php-model/site-safe/dynamic-killing/index.vue'),
		},
	],
})
</script>
