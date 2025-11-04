<template>
	<div class="p-[2rem]">
		<BtTable />
	</div>
</template>

<script setup lang="ts">
	import { useAllTable, useRefreshList } from '@/hooks/tools';
	import useWPProtectionStore from '@/views/wordpress/view/local/site-protection/useStore';
	import { getBasicListConfig, getBasicListData } from '../useController';

	const { isRefreshBasicList } = storeToRefs(useWPProtectionStore());

	/**
	 * @description 获取表格
	 */
	// const { BtTable, BtPage, BtRecommendSearch, BtRefresh, BtColumn, BtBatch, BtTableCategory, BtErrorMask, tableRef, classList, refresh } = useAllTable({
	// 	request: (data: any) => {
	// 		return getBasicListData(data);
	// 	},
	// 	columns: getBasicListConfig(),
	// 	extension: [
	// 		useRefreshList(isRefreshBasicList)
	// 	],
	// });
</script>

<style scoped></style>
