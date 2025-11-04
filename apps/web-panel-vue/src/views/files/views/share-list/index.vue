<template>
	<div class="flex flex-col p-2rem lib-box">
		<bt-table-group>
			<template #header-left> </template>
			<template #header-right>
				<bt-input-search v-model="shareTableData.file_name" @search="searchSubmit"  :placeholder="`请输入分享名称`" />
			</template>
			<template #content>
				<bt-table ref="favTable" max-height="40rem" :column="tableColumn" :data="tableData" :description="'分享列表为空'" v-bt-loading="isLoading" v-bt-loading:title="'正在加载分享列表，请稍后...'" />
			</template>
			<template #footer-left> </template>
			<template #footer-right>
				<bt-table-page :total="shareTableData.total" v-model:page="shareTableData.p" v-model:row="shareTableData.limit" layout="prev, pager, next, total" @change="getShareData" />
			</template>
			<template #popup> </template>
		</bt-table-group>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import FILES_SHARE_LIST_STORE from './store'

const store = FILES_SHARE_LIST_STORE()
const { isLoading, tableData, shareTableData, tableColumn } = storeToRefs(store)
const { getShareData, searchSubmit, $reset } = store

onMounted(() => {
	// 获取分享列表
	getShareData()
})

onUnmounted($reset)
</script>
