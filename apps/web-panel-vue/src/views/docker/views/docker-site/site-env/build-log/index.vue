<template>
	<div class="p-[20px]">
		<BtLog :content="logContent" class="max-h-[45rem] h-[45rem]" />
	</div>
</template>

<script setup lang="tsx">
import BtLog from '@components/extension/bt-log/index.vue';
import {init,logContent,unmount} from './useController'

const popupClose = inject('popupClose', () => {})

onMounted(() => {
	init(popupClose)
});
onUnmounted(() => {
	unmount()
});
</script>
