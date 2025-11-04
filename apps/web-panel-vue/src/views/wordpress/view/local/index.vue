<template>
	<div>
		<!-- 安装插件 -->
		<EnvDetectionMask ref="envRef" @init="refresh" />

		<BtTableGroup>
			<template #header-left><BtOperation /></template>
			<template #header-right>
				<BtRecommendSearch type="remote-wp" placeholder="请输入域名" class="!w-[270px] mr-[10px]" />
			</template>
			<template #content><BtTable :min-height="mainHeight" /></template>
			<template #footer-left>
				<BtBatch />
			</template>
			<template #footer-right><BtPage /></template>
		</BtTableGroup>
	</div>
</template>

<script setup lang="ts">
import EnvDetectionMask from '@site/public/env-detection-mask/index.vue'
import { useGlobalStore } from '@/store/global'
import { useAllTable, useBatch, useOperation, useRecommendSearch, useRefreshList } from '@/hooks/tools'
import { getWpLocalListData, operation, getWpLocalListConfig, getWpLocalBatchOperate } from './useController'
import useWPLocalStore from '@/views/wordpress/view/local/useStore'

const { isRefreshLocalList } = storeToRefs(useWPLocalStore())

const { mainHeight } = useGlobalStore()

const { BtOperation } = useOperation({
	options: operation(),
})

/**
 * @description 批量操作
 */
const useTableBatch = useBatch(getWpLocalBatchOperate())

/**
 * @description 获取表格
 */
const { BtTable, BtPage, BtRecommendSearch, BtRefresh, BtColumn, BtBatch, BtTableCategory, BtErrorMask, tableRef, classList, refresh } = useAllTable({
	request: (data: any) => {
		return getWpLocalListData(data)
	},
	columns: getWpLocalListConfig(),
	extension: [useRecommendSearch('search', { name: 'wp', list: [], showHistory: false, showRecommend: false }), useTableBatch, useRefreshList(isRefreshLocalList)],
})
</script>

<style scoped></style>
