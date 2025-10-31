<template>
	<div>
		<bt-table-group>
			<template #header-left>
				<div class="flex items-center">共{{ compData.num }}个文件，总大小为{{ getByteUnit(compData.size) }}</div>
			</template>
			<template #content>
				<bt-table ref="tableRef" class="files-list" :column="tableColumn" :data="compData.list" :description="'回收站列表为空'" height="42.7rem" v-bt-loading="tableData.loading" v-bt-loading:title="'正在加载回收站列表，请稍后...'" />
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="tableRef" :options="tableBatchOptions"></bt-table-batch>
			</template>
			<template #footer-right>
				<bt-table-page v-model:page="tableData.p" v-model:row="tableData.limit" :total="compData.num" @change="refresh()" />
			</template>
			<template #popup> </template>
		</bt-table-group>
	</div>
</template>

<script setup lang="tsx">
import { getByteUnit } from '@/utils'
import FILES_RECYCLE_BIN_STORE from '../store'
import { storeToRefs } from 'pinia'

const store = FILES_RECYCLE_BIN_STORE()
const { compData, showPopup, tableRef, tableData, tableColumn } = storeToRefs(store)
const { tableBatchOptions, refresh, init } = store

defineExpose({
	refresh,
})
</script>
