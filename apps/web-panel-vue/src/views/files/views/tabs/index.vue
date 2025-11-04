<template>
	<div class="tabs-wrapper">
		<div class="tabs">
			<el-tooltip :enterable="false" :show-after="2000" transition="" v-for="(item, index) in fileTabList" :key="item.id" :content="item.param.path" placement="bottom">
				<div
					class="tab-item"
					style="position: relative"
					@contextmenu.prevent="handleRightClick($event, item, index)"
					:class="{
						on: fileTabActive === index,
						disabledTab: disabledCutTab && fileTabActive !== index,
					}"
					@click="cutTab(index)">
					<div class="flex items-center" style="margin-right: 20px">
						<bt-image src="/file/file-dir.svg" class="w-[1.8rem]"></bt-image>
						<div class="file-name">{{ item.label }}</div>
					</div>
					<div class="close" slot="reference" @click.stop="closeTab(item, item.id)">
						<i class="svgtofont-el-close" />
					</div>
				</div>
			</el-tooltip>
			<el-tooltip content="点击添加新窗口" placement="bottom" :show-after="500">
				<i v-show="isAddTabs" class="tab-add-item svgtofont-el-plus !cursor-pointer" :class="{ disabledTab: disabledCutTab }" @click="addTabEvent({ path: '/www' })"></i>
			</el-tooltip>
			<Menu ref="contextRef"></Menu>
		</div>

		<!-- 箭头切换 -->
		<div>
			<div class="tabs-icon__scroll" v-show="showLeftArrow">
				<i class="svgtofont-el-caret-left" @click="scrollLeft()"></i>
			</div>
			<div class="tabs-icon__scroll" v-show="showRightArrow">
				<i class="svgtofont-el-caret-right" @click="scrollRight()"></i>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import FILES_STORE from '@files/store'
import Menu from './menu.vue'
import { addTabEvent } from '@files/useMethods'

const store = FILES_STORE()
const { fileTabActive, fileTabList, isAddTabs, disabledCutTab, scrollWidth, showLeftArrow, showRightArrow, contextRef } = storeToRefs(store)
const { handleRightClick, watchWindowResize, watchScrollWidth, watchTabsWidth, cutTab, scrollLeft, scrollRight, closeTab } = store

watch(
	() => scrollWidth.value,
	val => {
		watchScrollWidth(val)
	}
)

watch(
	() => fileTabList.value.length,
	() => {
		watchTabsWidth()
	},
	{ immediate: true }
)

onMounted(() => {
	watchWindowResize() // 默认触发
	nextTick(() => {
		scrollWidth.value = 0
	})
})

defineExpose({
	watchWindowResize,
})
</script>

<style lang="css" scoped>
.tabs .tab-item:first-child {
	border-top-left-radius: var(--el-border-radius-medium);
}
.tabs .tab-add-item {
	border-top-right-radius: var(--el-border-radius-medium);
}
.tabs-wrapper {
	@apply flex flex-col overflow-hidden relative;
}

.tabs-icon__scroll {
	@apply absolute top-0 bottom-0 h-[3rem] leading-[3rem] text-secondary text-medium;
}

.tabs-icon__scroll:first-child {
	@apply left-0 pr-[3.4rem];
	background: linear-gradient(270deg, rgba(var(--el-color-black-rgb), 0), var(--el-fill-color-lighter) 58%);
}

.tabs-icon__scroll:last-child {
	@apply right-0 pl-[3.4rem];
	background: linear-gradient(90deg, rgba(var(--el-color-black-rgb), 0), var(--el-fill-color-dark) 58%);
}

.tabs-icon__scroll i {
	@apply p-2px cursor-pointer;
}

.tabs-icon__scroll i:hover {
	@apply bg-base text-default rounded-base;
}

.tabs {
	@apply flex flex-row overflow-x-auto overflow-y-hidden h-[3rem];
}

.tabs:after {
	@apply content-[''] border-b border-darker w-full;
}

.tabs::-webkit-scrollbar {
	@apply hidden;
}

.tab-item,
.tab-add-item {
	@apply flex cursor-pointer items-center justify-between px-8px h-[3rem] border border-darker mr-[-.1rem] mb-[-.1rem] bg-base;
}

.file-name {
	@apply ml-[.5rem] w-[10rem] overflow-ellipsis overflow-hidden whitespace-nowrap text-small leading-[1.2];
}

.close {
	@apply hidden justify-center items-center mx-[.5rem] text-secondary text-base cursor-pointer w-[1.6rem] h-[1.6rem] transition-all rounded-base;
	position: absolute;
	right: 0;
	top: 20%;
}

.tab-item:hover .close {
	display: flex !important;
	background: var(--el-fill-color-dark);
}

.tab-add-item {
	@apply min-w-[auto] px-8px;
}

.tab-add-item:hover {
	@apply bg-darker;
}

.on {
	background-color: rgba(var(--el-color-white-rgb), 1);
	border-bottom: 1px solid var(--el-color-extraLight);
	color: var(--el-color-primary);
}

.on .close {
	@apply flex;
}

.on .close:hover {
	@apply bg-darker;
}

:deep(.popper-close-tab) {
	@apply p-16px bg-white;
}

.disabledTab {
	@apply cursor-not-allowed relative;
}

.disabledTab:after {
	@apply content-[''] position-absolute w-full h-full bg-lighter left-0 z-50 h-full w-full cursor-not-allowed absolute;
}
</style>
