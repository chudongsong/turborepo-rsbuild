<template>
	<BtRouterTabs contentClass="mt-[1.2rem] relative" :class="modelVal" :disabled="route.path === '/node/install'"></BtRouterTabs>
</template>

<script lang="ts" setup>
import { useRouterTabs } from '@/hooks/business/router-tabs';
import { useOnUnmounted } from './useController';
import { useRoute } from 'vue-router';

const route = useRoute()
const { BtRouterTabs } = useRouterTabs();
const modelVal = ref('')
watch(
	() => route.name,
	(name: any) => {
		// dockerTests(route,router)
		modelVal.value = name
		if (route.name !== 'node') {
			localStorage.setItem('NODE_ROUTER', name) // 获取docker路由
		}
	},
	{ immediate: true }
)
// 离开
onUnmounted(() => {
	useOnUnmounted()
})
</script>
<style>

</style>
