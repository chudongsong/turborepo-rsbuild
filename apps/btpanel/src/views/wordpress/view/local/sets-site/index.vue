<template>
	<div class="p-[2rem]">
		<BtTableGroup>
			<template #header-left>
				<ElButton type="primary" size="default" @click="createSets">创建集合包</ElButton>
			</template>
			<template #header-right>
				<BtSearch type="wp-sets" placeholder="搜索" class="!w-[270px] mr-[10px]" />
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
import { useAllTable, useRecommendSearch, useRefreshList } from '@/hooks/tools'
import { getWpSetsData, getWpSetsListConfig, createSets } from './useController'
import { useGlobalStore } from '@/store/global'
import useWPSetsStore from '@/views/wordpress/view/local/sets-site/useStore'

const { mainHeight } = useGlobalStore()
const { isRefreshSetsList } = storeToRefs(useWPSetsStore())

/**
 * @description 获取表格
 */
const { BtTable, BtPage, BtRecommendSearch, BtRefresh, BtColumn, BtBatch, BtTableCategory, BtErrorMask, tableRef, classList, refresh, BtSearch } = useAllTable({
	request: (data: any) => {
		return getWpSetsData(data)
	},
	columns: getWpSetsListConfig(),
	extension: [useRecommendSearch('search', { name: 'wp-sets', list: [] }), useRefreshList(isRefreshSetsList)],
})
</script>

<style scoped></style>
