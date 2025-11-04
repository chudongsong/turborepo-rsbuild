<template>
	<div class="h-[40rem] pt-[.5rem] overflow-hidden">
		<div class="item th">
			<div class="title">属性</div>
			<div class="con">值</div>
		</div>
		<div class="h-[36.5rem] overflow-y-auto">
			<div v-for="attr in attrList" :key="attr.title" class="item">
				<div class="title">{{ attr.title }}</div>
				<div class="con">{{ attr.value }}</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import FILES_DETAIL_STORE from './store'

const store = FILES_DETAIL_STORE()
const { fileItem, attrList } = storeToRefs(store)
</script>

<style lang="css" scoped>
.item {
	@apply flex items-center h-[3rem] p-[.5rem] hover:(bg-lighter cursor-pointer);
}

.item.th {
	@apply font-bold bg-base hover:(bg-lighter cursor-default);
}

.item .title {
	@apply w-[11rem];
}

.item .con {
	@apply flex-1;
}
</style>
