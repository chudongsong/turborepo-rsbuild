<template>
	<div>
		<bt-table-group>
			<template #header-right>
				<div class="flex items-center">
					<BtSearch class="mr-1rem lt-lg:(!w-[16rem])" placeholder="请输入搜索关键字" />
					<BtRefresh />
				</div>
			</template>
			<template #content>
				<BtTable />
			</template>
			<template #footer-left>
				<BtBatch />
			</template>
			<template #footer-right>
				<BtPage />
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="ts">
import { LOG_SOFT_STORE } from '../useStore'

import { useAllTable, useBatch, useRefreshList } from '@/hooks/tools'
import { storeToRefs } from 'pinia'
import { TableBatchOptions, pluginColumn } from '../useController'

const store = LOG_SOFT_STORE()
const { refreshPlugin } = storeToRefs(store)
const { getPluginLogData } = store

const Batch = useBatch(TableBatchOptions)

const { BtTable, BtPage, BtSearch, BtRefresh, BtBatch, refresh } = useAllTable({
	request: async data => {
		const { p, limit: ROWS, search } = data
		return getPluginLogData({ p, ROWS, search })
	},
	columns: pluginColumn.value,
	extension: [Batch],
})

refreshPlugin.value = refresh
</script>

<style scoped></style>
