<template>
	<div class="p-2rem">
		<bt-table class="groupSortTable" row-key="name" :column="sortColumn" :max-height="330" :data="allTableData" :description="'任务列表为空'" v-bt-loading="allLoading" v-bt-loading:title="'正在加载任务列表，请稍后...'" />
	</div>
</template>

<script setup lang="ts">
import { initSort, $reset_sort, sortColumn, allTableData, allLoading } from './useController'

onMounted(initSort)
onUnmounted($reset_sort)
</script>

<style scoped></style>
