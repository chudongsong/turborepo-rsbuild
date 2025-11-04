<template>
	<div class="h-[3.5rem] bg-[#565656] px-[1.5rem]" @click.stop>
		<div class="btn-group">
			<div class="dir" v-show="mainWidth > 1000">文件位置：{{ editorTabsActive.path }}</div>
			<div class="flex">
				<div class="btn" @click="watchEditorCustomToolbar('lineBreak')">{{ editorTabsActive.lineBreak }}</div>
				<div class="btn" @click="watchEditorCustomToolbar('jump')">行{{ editorRowColumnCount.row }}，列{{ editorRowColumnCount.column }}</div>
				<div class="btn" @click="openHistory">历史版本：{{ editorTabsActive.historys?.length }}份</div>
				<div class="btn" @click="watchEditorCustomToolbar('tab')">{{ fileInfo.tabsData.type === 'nbsp' ? '空格' : '制表符' }}：{{ fileInfo.tabsData.number }}</div>
				<div class="btn" @click="watchEditorCustomToolbar('encode')">编码：{{ editorTabsActive.encoding }}</div>
				<div class="btn" @click="">语言：{{ editorTabsActive.modeText }}</div>
				<div v-if="editorTabsActive.isReadOnly" class="btn bg-warning !hover:bg-warning">只读模式</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { editorTabsActive, editorOption, editorRowColumnCount } from '@files/public/ace/useMethods'
import FILES_ACE_STORE from '../store'
import { storeToRefs } from 'pinia'
import { useGlobalStore } from '@/store/global'

const store = FILES_ACE_STORE()
const { mainWidth } = useGlobalStore()
const { fileInfo } = storeToRefs(store)
const { openHistory, watchEditorCustomToolbar } = store
</script>

<style lang="css" scoped>
.btn-group {
	@apply h-[3.5rem] flex items-center justify-between bg-[#565656];
	transition: top 100ms;
}

.btn-group .dir {
	@apply max-w-[50%] text-white truncate;
}

.btn-group .btn {
	@apply h-[3.5rem] flex items-center justify-center px-[1.5rem] text-base text-[#fff] border-r border-[#4c4c4c] cursor-pointer hover:bg-[#2f2f2f];
}

/* 媒体查询 屏幕小于880时 .btn-group .btn 左右padding调整为8px*/
@media (max-width: 880px) {
	.btn-group .btn {
		@apply px-[.8rem];
	}
}
</style>
