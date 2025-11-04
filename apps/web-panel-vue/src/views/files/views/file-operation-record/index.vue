<template>
	<div class="flex flex-col p-16px">
		<bt-table-group>
			<template #header-left> </template>
			<template #header-right>
				<bt-input-search v-model="recordTableData.content" @search="searchSubmit"  :placeholder="`请输入搜索关键字`" class="!w-[30rem]" />
			</template>
			<template #content>
				<bt-table ref="favTable" height="40rem" :column="tableColumn" :data="tableData" :description="'列表为空'" v-bt-loading="isLoading" v-bt-loading:title="'正在加载列表，请稍后...'" />
			</template>
			<template #footer-left> </template>
			<template #footer-right>
				<bt-table-page v-model:page="recordTableData.p" v-model:row="recordTableData.limit" layout="prev, pager, next, total" :total="recordTableData.total" @change="getData()" />
			</template>
			<template #popup> </template>
		</bt-table-group>
		<bt-help :options="recordTableData.help" list-style="disc" class="ml-24px" />
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import FILES_OPERATION_RECORD_STORE from './store'

const store = FILES_OPERATION_RECORD_STORE()
const { isLoading, tableColumn, tableData, recordTableData } = storeToRefs(store)
const { searchSubmit, getData, $reset } = store

onMounted(() => {
	getData()
})

onUnmounted(() => {
	$reset()
})
</script>
