<template>
	<div class="p-[2rem]">
		<div class="flex items-center mb-[1.6rem]">
			<span class="whitespace-nowrap">自定义查看天数：</span>
			<bt-input v-model="day" type="number" :min="1" width="20rem" clearable @update:model-value="changeDay" placeholder="请输入查看天数"></bt-input>
		</div>
		<bt-table ref="networkTable" :max-height="400" :column="tableColumn" :data="tableData" :description="'网络IO总流量列表为空'" v-bt-loading="loading" v-bt-loading:title="'正在加载网络IO总流量列表，请稍后...'" />
	</div>
</template>

<script lang="ts" setup>
import { tableColumn, tableData, loading, day, changeDay, getNetWorkIoByDay } from './useController'

onMounted(() => {
	getNetWorkIoByDay(day.value.toString())
})
</script>

<style lang="css" scoped>
:deep(input[type='number']::-webkit-inner-spin-button),
:deep(input[type='number']::-webkit-outer-spin-button) {
	-webkit-appearance: none;
}

:deep(input[type='number']) {
	-moz-appearance: textfield;
}
</style>
