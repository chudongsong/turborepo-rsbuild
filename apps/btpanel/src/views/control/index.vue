<template>
	<BtRouterTabs :content-class="'mt-[1.2rem]'" />
</template>

<script lang="ts" setup>
import { useRequestCanceler } from '@hooks/tools/axios/model/axios-cancel' // 取消请求
import { useRouterTabs } from '@/hooks/business/router-tabs';
// import CONTROL_STORE from '@control/store';
// import { storeToRefs } from 'pinia';

// const store = CONTROL_STORE();
// const { tabActive } = storeToRefs(store);
const { BtRouterTabs } = useRouterTabs({
	contentClass: 'mt-[16px]',
});

useEventListener(window, 'mousemove', (e) => {
	window.__LAST_VIEWPORT_MOUSE__ = { x: e.clientX, y: e.clientY, ok: true }
})
// 离开
onUnmounted(() => {

	// 取消初始化请求
	useRequestCanceler([
		'/config?action=SetControl',
		'/ajax?action=GetCpuIo',
		'/ajax?action=get_load_average',
		'/ajax?action=GetNetWorkIo',
		'/ajax?action=GetDiskIo',
	])
})
</script>

<style lang="css" scoped>
:deep(.el-tabs__content) {
	@apply overflow-visible
	overflow-y: visible !important;
}
:deep(#pane-systemMonitor) {
	@apply bg-transparent p-0;
}
:deep(#pane-panelDaily) {
	@apply bg-transparent p-0;
}
</style>
