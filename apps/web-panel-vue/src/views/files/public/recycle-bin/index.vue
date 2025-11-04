<template>
	<div>
		<div class="px-[2rem] pt-[2rem] border-b border-base">
			<bt-tabs v-model="activeName" type="card" @change="handleTabChange">
				<el-tab-pane label="文件回收站" name="all" lazy>
					<BinHeader />
				</el-tab-pane>
				<el-tab-pane label="数据库回收站(只含mysql)" name="db" lazy>
					<BinHeader />
				</el-tab-pane>
			</bt-tabs>
		</div>
		<div class="container" v-bt-loading="loading" v-bt-loading:title="'正在获取回收站数据，请稍候...'">
			<FileBinTable v-if="activeName !== 'db'" />
			<BinTable ref="dbTableRef" v-else class="p-[2rem]" />
		</div>

		<bt-dialog title="清空异常" v-model="showPopup" :area="42" :showFooter="true" confirmText="强制删除" @confirm="deleteClearCheck" @cancel="onCancel">
			<ClearCheck />
		</bt-dialog>
	</div>
</template>

<script setup lang="ts">
import BinHeader from './bin-header/index.vue'
import BinTable from './bin-table/index.vue'
import FileBinTable from './file-bin-table/index.vue'
import ClearCheck from '@files/public/recycle-bin/clear-check/index.vue'

import { storeToRefs } from 'pinia'
import FILES_RECYCLE_BIN_STORE from './store'

const store = FILES_RECYCLE_BIN_STORE()
const { activeName, loading, binData, dbTableRef, showPopup } = storeToRefs(store)
const { init, handleTabChange, $reset, deleteClearCheck, onCancel } = store

// 表格数据
// const compData = computed(() => {
// 	return {
// 		list: binData.value.data?.list || [],
// 		type: binData.value.type || 'db',
// 		num: binData.value.data?.search_num === undefined ? binData.value.data?.db : binData.value.data?.search_num,
// 		size: binData.value.data?.all_size || 0,
// 	}
// })

// watch(
// 	() => activeName.value,
// 	() => {
// 		binData.value.type = activeName.value
// 		binData.value.time = []
// 		binData.value.search = ''
// 		if (activeName.value === 'db') {
// 			refresh({ type: 'db' })
// 		}
// 	}
// )

// watch(
// 	() => binData.value,
// 	() => {
// 		watchBinData()
// 	},
// 	{ deep: true, immediate: true }
// )

onMounted(() => init())

onUnmounted(() => $reset())
</script>

<style lang="css" scoped>
.container {
	@apply w-full h-[55rem];
}
</style>
