<template>
	<div>
		<div :style="{ height: calculatedHeight }" class="relative pt-[20rem] bg-dark">
			<div class="flex !h-full">
				<div ref="editorRef" class="w-full ace-editor"></div>
			</div>
			<div v-show="!editorTabs.length" class="h-full w-full absolute top-0 left-0 bg-dark z-999"></div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { editorTabs } from '@files/public/ace/useMethods'
import '/public/static/editor/ace.js'
import '/public/static/editor/styles/icons.css'
import '/public/static/editor/ext-language_tools.js'
import FILES_ACE_MOBILE_STORE from '../store'
import { storeToRefs } from 'pinia'

const store = FILES_ACE_MOBILE_STORE()
const { editorRef, mainHeight } = storeToRefs(store)
const { createEditorView, initContent } = store

const calculatedHeight = computed(() => {
	return `${mainHeight.value}px`
})

onMounted(() => {
	initContent()
})
</script>

<style lang="css" scoped>
.ace-editor :deep(.ace_search) {
	width: 80vw;
}
.ace-editor :deep(.ace_searchbtn_close) {
	background-size: 150%;
	height: 50px;
	width: 30px;
	margin-right: 10px;
}
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
