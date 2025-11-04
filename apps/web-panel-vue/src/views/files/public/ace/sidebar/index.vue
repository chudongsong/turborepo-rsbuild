<template>
	<div class="catalogue">
		<FilePath />
		<Operation class="w-[26rem]" @update:changeType="changeOpertion" />
		<FileList class="list-container" :style="styles" />
	</div>
</template>

<script setup lang="ts">
import FilePath from './file-path/index.vue'
import Operation from './operation/index.vue'
import FileList from './list/index.vue'
import { storeToRefs } from 'pinia'
import FILES_ACE_STORE from '../store'

const store = FILES_ACE_STORE()
const { mainHeight, operSize } = storeToRefs(store)

const isFullscreen = inject('fullData') as any

const styles = computed(() => {
	// 根据是否全屏计算最大高度，同时根据选择框是否显示调整底部填充
	const maxHeight = `${(isFullscreen.value ? mainHeight.value - 101 : mainHeight.value - 252) - operSize.value}px`
	return {
		maxHeight: maxHeight,
	}
})

const changeOpertion = (type: string) => {
	operSize.value = type === 'search' ? 76 : 0
}
</script>

<style lang="css" scoped>
.catalogue {
	@apply w-[auto] z-99 h-full bg-[#292929] flex flex-col;
}

.list-container {
	@apply flex-1 overflow-y-auto;
}
</style>
