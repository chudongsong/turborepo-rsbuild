<template>
	<BtTabs />
</template>

<script setup lang="ts">
import { tabActive } from './useController';
import { useTabs } from '@/hooks/tools';

const { BtTabs } = useTabs({
	type: 'left-bg-card',
	value: tabActive,
	options: [
		{
			label: '错误状态码',
			name: 'errorCode',
			lazy: true,
			render: () => import('./error-code.vue'),
		},
		{
			label: '缓存',
			name: 'cache',
			lazy: true,
			render: () => import('./cache.vue'),
		},
	],
});

</script>

<style lang="css" scoped>
</style>
