<template>
	<div>
		<div class="tabList" @contextmenu.prevent="openContextMenu($event)" ref="tabsElement">
			<div class="tab" v-for="(item, index) in editorTabs" :key="index" :title="item.path" :class="{ active: item.id === editorTabsActive.id }" @click="changeTab(item.id, $event)">
				<span class="file-icon-box editor-move"><i :class="`ace-${item.mode}-icon`"></i></span>
				<span class="title">{{ item.title }}</span>
				<span class="file-save-icon" :class="{ 'is-save-state': item.state === 1 }">
					<i v-show="item.state === 0" class="close svgtofont-el-close-bold" title="关闭视图" @click.stop="closeTab(item)"></i>
					<i v-show="item.state === 1" class="close svgtofont-el-warning-filled text-base !text-warning" @click.stop="closeTab(item)"></i>
				</span>
			</div>
		</div>
		<HeadRightMenu ref="contextmenu" :row="headerRightRow" />
	</div>
</template>

<script setup lang="ts">
import HeadRightMenu from './right-menu/index.vue'
import { editorTabs, editorTabsActive } from '@files/public/ace/useMethods'
import FILES_ACE_STORE from '../../store'
import { storeToRefs } from 'pinia'
import Sortable from 'sortablejs'

const store = FILES_ACE_STORE()
const { tabsElement, contextmenu, headerRightRow } = storeToRefs(store)
const { changeTab, closeTab, openContextMenu, initContentHeader, $resetContentHeader } = store

/**
 * @description: tab拖拽
 * @return {void}
 */
const rowDrop = () => {
	const tbody = document.querySelector('.tabList')
	Sortable.create(tbody as HTMLElement, {
		animation: 500,
		handle: '.editor-move',
		chosenClass: 'ghost',
	})
}

onMounted(() => {
	initContentHeader()
	nextTick(() => {
		rowDrop() // 初始化拖拽
	})
})
onUnmounted(() => {
	$resetContentHeader()
})
</script>

<style lang="css" scoped>
.file-icon-box {
	@apply text-orange font-medium min-w-[8px] h-full;
}
.file-icon-box i {
	font-style: normal;
}

.file-save-icon:hover.is-save-state .el-icon-warning {
	@apply hidden;
}
.file-save-icon:hover .svgtofont-el-close-bold {
	display: block !important;
}

.tabList {
	@apply overflow-x-auto bg-[#000] flex items-center whitespace-nowrap h-[4.4rem] cursor-pointer;
	width: 0;
	min-width: 100%;
	flex: 1 1 auto;
}
.tabList::-webkit-scrollbar {
	height: 4px;
	background: transparent;
}
.tabList::-webkit-scrollbar-thumb {
	background-color: transparent;
}
.tabList::-webkit-scrollbar-track {
	background: transparent;
}
.tabList:hover::-webkit-scrollbar-thumb {
	background-color: #444;
}
.tabList .tab {
	@apply max-w-[30rem] truncate h-[4rem] leading-[4rem] pl-[1rem] pr-[3.5rem] w-auto max-w-[30rem] inline-flex items-center;
	@apply cursor-pointer relative flex-shrink-0 text-[#ececec] border-r border-[#222] text-[1.5rem] hover:bg-[#313131];
}
.tabList .tab.active {
	@apply bg-[#222] text-[#fff];
}
.tabList .tab.active:before {
	@apply content-[''] inline-block w-full h-[.2rem] bg-primary absolute bottom-0 left-0 right-0;
}
.tabList .tab .title {
	@apply mx-[1rem] truncate;
}
.tabList .tab .close {
	@apply absolute right-[1rem] text-[#ececec] cursor-pointer;
	top: 50%;
	transform: translateY(-50%);
	transition: all 100ms;
}
</style>
