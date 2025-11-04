<template>
	<div class="btn-group relative" @click.stop>
		<div class="btn" v-for="item in column" :key="item.title" @click="openPopup(item)" :title="item.title"><span class="mr-[.5rem]" :class="`${item.icon}`"></span>{{ item.title }}</div>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import FILES_ACE_STORE from '../store'

const store = FILES_ACE_STORE()
const { column } = storeToRefs(store)
const { openPopup } = store
</script>

<style lang="css" scoped>
.btn-group {
	@apply h-[3rem] flex items-center bg-[#565656];
	transition: top 100ms;
}

.btn-group .btn {
	@apply h-[3rem] flex items-center justify-center px-[1.5rem] text-base text-[#fff] border-r border-[#4c4c4c] relative cursor-pointer hover:bg-[#2f2f2f];
}

/* 媒体查询 屏幕小于880时 .btn-group .btn 左右padding调整为8px*/
@media (max-width: 880px) {
	.btn-group .btn {
		padding: 0 0.8rem;
	}
}

.btn-group .popup {
	@apply absolute top-[3rem] left-0 bg-[#444] overflow-hidden;
	z-index: 999;
	transition: all 100ms;
}

:deep(.item) {
	@apply h-[3rem] leading-[3rem] hover:bg-[#505050];
}
</style>
