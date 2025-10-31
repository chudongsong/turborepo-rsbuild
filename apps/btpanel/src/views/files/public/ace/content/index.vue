<template>
	<div class="">
		<FileHead />
		<FilesToolbar v-if="showToolbar" />
		<!-- 高度为100%减去顶部 44px calc(100% - 44px)-->
		<div class="relative" :style="{ height: calculatedHeight }">
			<div v-show="editorTabsActive.type === 'custom'">
				<component :is="editorTabsActive.component" />
			</div>
			<div v-show="editorTabsActive.type !== 'custom'" class="flex h-full">
				<div ref="editorRef" class="w-full ace-editor"></div>
				<div v-show="editorTabsActive.type === 'diff'" ref="editorDiffRef" class="w-full ace-editor acediff"></div>
			</div>
			<div v-show="!editorTabs.length" class="h-full w-full absolute top-0 left-0 bg-[#272822] z-999"></div>
		</div>
	</div>
</template>

<script setup lang="ts">
import FileHead from './header/index.vue'
import FilesToolbar from './editor-toolbar/index.vue'

import { editorTabs, editorTabsActive } from '@files/public/ace/useMethods'
import { storeToRefs } from 'pinia'
import FILES_ACE_STORE from '../store'
import { useGlobalStore } from '@/store/global'

const store = FILES_ACE_STORE()
const { mainWidth } = useGlobalStore()
const { mainHeight, editorRef, editorDiffRef, showToolbar } = storeToRefs(store)
const { initContent, resizeEditor } = store

const isFullscreen = inject<Ref<boolean>>('fullData', ref(false))
// import '/static/ace/ace' // 引入ace编辑器

const calculatedHeight = computed(() => {
	const width = mainWidth.value < 1280
	const full = isFullscreen.value
	if (!width && full) {
		return `${mainHeight.value - 107}px`
	} else if (width && !full) {
		return `${mainHeight.value - 260}px`
	} else if (width && full) {
		return `${mainHeight.value - 107}px`
	} else {
		return `${mainHeight.value - 260}px`
	}
	// return `${isFullscreen.value ? mainHeight.value - 99 : mainHeight.value - 260}px`
})

// const { editorOption, editorTabs } = useAceEditor() // 初始化编辑器方法

watch(isFullscreen, val => {
	resizeEditor()
})

watch(mainHeight, () => {
	resizeEditor()
})

onMounted(() => {
	initContent()
})
</script>

<style lang="css" scoped>
.ace-editor :deep(.ace_scrollbar::-webkit-scrollbar) {
	/*滚动条整体样式*/
	width: 1.5rem;
	/*高宽分别对应横竖滚动条的尺寸*/
	height: 1rem;
}

.ace-editor :deep(.ace_scrollbar::-webkit-scrollbar-thumb) {
	/*滚动条里面小方块*/
	box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
	background: #777;
	border-radius: 0;
}

.ace-editor :deep(.ace_scrollbar::-webkit-scrollbar-track) {
	/*滚动条里面轨道*/
	box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
	background: #333;
	border-radius: 0;
}
</style>
