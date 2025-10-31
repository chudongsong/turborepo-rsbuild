<template>
	<BtRouterTabs />
</template>
<script setup lang="ts">
import { useRouterTabs } from '@/hooks/business/router-tabs'
import { SOFT_STORE } from '@soft/store'
// import { storeToRefs } from 'pinia';

// const { tabActive } = storeToRefs(SOFT_STORE());
const { initSoftView, $reset } = SOFT_STORE()
const { BtRouterTabs } = useRouterTabs()

onMounted(initSoftView)
onUnmounted($reset)
</script>
<style lang="css" scoped>
/* 软件默认图标 */
/* :deep(.soft-ico-img::after) {
	@apply content-[''] w-[2.4rem] h-[2.4rem] block;
	background-size: 100%;
	background: url('/static/images/soft_ico/icon_plug.svg');
} */
</style>
