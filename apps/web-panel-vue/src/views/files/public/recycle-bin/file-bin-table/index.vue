<template>
	<div class="flex h-full w-full">
		<div class="tab">
			<div class="btn" :class="tabActive === tab.type ? 'active' : ''" v-for="tab in config" :key="tab.type" @click="toggleType(tab.type)">
				<i class="text-base" :class="tab.icon"></i>
				<span class="ml-[.5rem]">{{ `${tab.label}(${binData.data[tab.type]})` }}</span>
			</div>
		</div>
		<div class="flex-1 w-[97rem]">
			<BinTable class="p-[2rem]" ref="fileTableRef" />
		</div>
	</div>
</template>

<script setup lang="ts">
import BinTable from '@files/public/recycle-bin/bin-table/index.vue'
import { storeToRefs } from 'pinia'
import FILES_RECYCLE_BIN_STORE from '../store'

const store = FILES_RECYCLE_BIN_STORE()
const { tabActive, binData, fileTableRef } = storeToRefs(store)
const { config, toggleType } = store
</script>

<style lang="css" scoped>
.tab {
	@apply w-[13rem] h-full bg-base;
}

.btn {
	@apply w-full h-[4rem] flex items-center bg-base cursor-pointer pl-2rem;
}

:deep(.btn.active) {
	@apply bg-extraLight text-primary;
}
</style>
