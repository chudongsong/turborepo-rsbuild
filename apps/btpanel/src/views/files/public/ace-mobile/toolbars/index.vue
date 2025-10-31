<template>
	<div class="flex items-center">
		<el-button :disabled="isDisabled" class="!w-[12rem] !h-[7rem] !text-[3rem]" @click="column[0].click()">保存</el-button>
		<div>
			<i class="svgtofont-el-more-filled !h-[10rem] !w-[10rem] text-right !text-[5.23rem] pl-[3rem]" style="line-height: 10rem" @click.stop="isShowTool = !isShowTool" />
			<div class="absolute bg-dark w-[40rem] right-[0] mt-[1rem] transition-all overflow-hidden h-0 z-99999" :class="{ 'h-[94rem]': isShowTool }" ref="dropdownMenuRef">
				<div class="btn text-[5.23rem] px-[1.5rem] py-[3rem] border-b-white border-b-[1px] flex items-center" v-for="item in column" :key="item.title" @click="openPopup(item)"><span class="mr-[.5rem] !text-[5.23rem]" :class="item.icon"></span>{{ item.title }}</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { editorTabs, editorTabsActive } from '@files/public/ace/useMethods'
import FILES_ACE_MOBILE_STORE from '../store'
import { storeToRefs } from 'pinia'

const store = FILES_ACE_MOBILE_STORE()
const { isShowTool, dropdownMenuRef, column } = storeToRefs(store)
const { checkOperationAvailable, handleClickOutsideEvent, openPopup } = store

const isDisabled = computed(() => {
	return editorTabs.value.length === 0 || editorTabsActive.state !== 1
})

onMounted(() => {
	document.addEventListener('click', handleClickOutsideEvent)
})

onBeforeUnmount(() => {
	document.removeEventListener('click', handleClickOutsideEvent)
})
</script>
