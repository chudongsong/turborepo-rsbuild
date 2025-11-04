<template>
	<div>
		<div class="tabList" @contextmenu.prevent ref="tabsElement">
			<div class="tab" v-for="(item, index) in editorTabs" :key="index" :class="{ active: item.id === editorTabsActive.id }" @click="changeTab(item.id, $event)">
				<span class="file-icon-box"><i :class="`ace-${item.mode}-icon`"></i></span>
				<span class="title !text-[4rem]">{{ item.title }}</span>
				<span class="file-save-icon" :class="{ 'is-save-state': item.state === 1 }">
					<i v-show="item.state === 0" class="close svgtofont-el-close-bold !text-[4rem]" title="关闭视图" @click.stop="closeTab(item)"></i>
					<i v-show="item.state === 1" class="close svgtofont-el-warning-filled !text-warning !text-[4rem]" @click.stop="closeTab(item)"></i>
				</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { editorTabs, editorTabsActive } from '@files/public/ace/useMethods'
import { storeToRefs } from 'pinia'
import FILES_ACE_MOBILE_STORE from '../../store'

const store = FILES_ACE_MOBILE_STORE()
const { tabsElement } = storeToRefs(store)
const { changeTab, closeTab, initHeader, $resetHeader } = store

onMounted(async () => {
	initHeader()
})
onUnmounted(() => {
	$resetHeader()
})
</script>

<style lang="css" scoped>
.file-icon-box {
	@apply text-orange font-medium min-w-[8px];
}
.file-icon-box i {
	font-style: normal;
}

.file-save-icon:hover .is-save-state .el-icon-warning {
	@apply hidden;
}
.file-save-icon:hover .is-save-state .svgtofont-el-close-bold {
	display: block !important;
}

.tabList {
	@apply overflow-x-auto flex items-center whitespace-nowrap h-[10rem] cursor-pointer mt-[1rem] w-[100vw];
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
	@apply cursor-pointer flex items-center relative flex-shrink-0 truncate h-[10rem] leading-[10rem] pl-[1rem] pr-[6rem] min-w-[40rem] max-w-[60rem] text-[#ececec] border-r border-[#222] text-[4rem] hover:bg-[#313131];
}
.tabList .tab.active {
	@apply bg-[#222] text-[#fff];
}
.tabList .tab.active:before {
	@apply content-[''] inline-block w-full h-[.6rem] bg-primary absolute bottom-0 left-0 right-0;
}

.tabList .tab .title {
	@apply mx-[1rem] truncate text-[#fff];
}

.tabList .tab .close {
	@apply absolute right-[2rem] text-[#ececec] cursor-pointer;
	top: 50%;
	transform: translateY(-50%);
	transition: all 100ms;
}
:deep([class^='ace-']:before) {
	font-size: 4rem;
}
</style>
