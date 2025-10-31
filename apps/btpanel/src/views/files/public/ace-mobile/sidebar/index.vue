<template>
	<div class="flex items-center">
		<i class="svgtofont-menu-setting !text-[5.23rem]" @click.stop="isShow = !isShow" />
		<div class="flex flex-col ml-[2.4rem]" v-if="editorTabs.length">
			<span class="mb-[10px] text-[4rem] max-w-[60rem] truncate pb-[5px]">{{ editorTabsActive.title }}</span>
			<span class="text-[3rem] w-[60rem] truncate pb-[4px]">{{ editorTabsActive.path }}</span>
		</div>
		<div class="ml-[2.4rem] text-[4rem]" v-else>在线文本编辑器</div>
		<div class="transition-all overflow-hidden absolute left-0 top-[12rem]" :class="[isShow ? 'w-[55vw]' : 'w-0', editorTabs.length ? 'top-[23.5rem]' : '']" ref="dropdownMenu">
			<SidebarOperation />
			<SidebarList />
		</div>
	</div>
</template>

<script setup lang="ts">
import { editorTabsActive, editorTabs } from '@files/public/ace/useMethods'
import { storeToRefs } from 'pinia'
import FILES_ACE_MOBILE_STORE from '../store'
import SidebarList from './list/index.vue'
import SidebarOperation from './operation/index.vue'

const store = FILES_ACE_MOBILE_STORE()
const { isShow, dropdownMenu } = storeToRefs(store)
const { handleClickOutside } = store

onMounted(() => {
	document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
	document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped></style>
