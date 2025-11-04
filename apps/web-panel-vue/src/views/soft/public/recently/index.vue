<template>
	<div class="w-full flex items-center mb-[20px]">
		<span class="w-[80px] pr-16px text-base flex justify-end">最近使用</span>
		<div class="flex flex-1 relative flex-wrap h-[30px]">
			<div class="soft-item" v-for="item in softListSliceData" :key="item.id" @click="handleOpenRecentEvent(item)" :title="`点击打开${item.title}`">
				<img :src="checkDevImgPath(`/soft_ico/ico-${item.name}.png`)" alt="" class="w-[2.2rem] mr-[2px]" />
				<span>{{ item.title }}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { checkDevImgPath } from '@utils/index'
import { SOFT_STORE } from '@soft/store'
import { storeToRefs } from 'pinia'

const { softListSliceData } = storeToRefs(SOFT_STORE())
const { handleOpenRecentEvent, initRecently, $reset_recently } = SOFT_STORE()

onMounted(initRecently)
onUnmounted($reset_recently)
</script>

<style lang="css" scoped>
.soft-item {
	@apply flex py-[6px] px-[8px] cursor-pointer items-center mr-[8px] rounded-sm text-small;
}
.soft-item:hover {
	transition: background-color 0.3s;
	background-color: var(--el-fill-color);
	color: var(--el-color-primary);
}
.icon-img {
	@apply w-[22px] h-auto mr-[.5rem];
}
</style>
