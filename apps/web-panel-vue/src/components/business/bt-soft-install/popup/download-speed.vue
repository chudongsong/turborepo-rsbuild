<template>
	<div class="p-[20px] pt-[3rem]">
		<div class="flex items-center justify-between mb-[5px]">
			<span> 正在下载{{ pluginTitle + ' ' + pluginActiveInfo.fullVersion }}，请稍后 ... </span>
			<span>{{ downloadSpeed.progress }}%</span>
		</div>
		<bt-progress :strokeWidth="5" :percentage="downloadSpeed.progress" :showText="false" />
		<div class="mt-[4px] flex justify-between items-center">
			<div class="flex">
				<span class="mr-[25px]">{{ doneSize }} / {{ totalSize }}</span>
				<span>预计还要:{{ downloadSpeed.estimated }}秒</span>
			</div>
			<span>{{ speedSize }}/s</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { INSTALL_STORE } from '../store'

const { downloadSpeed, doneSize, totalSize, speedSize, pluginTitle, pluginActiveInfo } = storeToRefs(INSTALL_STORE())
const { initDownLoad, closeDownLoad, clearTimeoutAll } = INSTALL_STORE()

onMounted(() => initDownLoad())

onUnmounted(() => closeDownLoad())

defineExpose({
	close: clearTimeoutAll,
})
</script>

<style lang="css" scoped>
.download-speed {
	@apply py-[12px] px-[16px];
}
.download-speed-top {
	@apply flex justify-between;
}
</style>
