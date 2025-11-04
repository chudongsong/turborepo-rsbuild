<template>
	<div class="p-[2rem]">
		<BtTableGroup>
			<template #header-left><BtOperation /></template>
			<template #header-right> </template>
			<template #content><BtTable :min-height="500" /></template>
			<template #footer-left>
				<BtBatch />
			</template>
			<template #footer-right><BtPage /></template>
		</BtTableGroup>
	</div>
</template>

<script setup lang="ts">
	import { useAllTable, useBatch, useOperation, useRefreshList } from '@/hooks/tools';
	import { getWpBackupListData, getWpBackupListOption, operation, useBatchEventHandle } from './useController';
	import useWPLocalStore from '@/views/wordpress/view/local/useStore';

	const { isRefreshBackupList } = storeToRefs(useWPLocalStore());

	const { BtOperation } = useOperation({
		options: operation(),
	});

	/**
	 * @description 批量操作
	 */
	const useTableBatch = useBatch([{ label: '删除', value: 'delete', event: useBatchEventHandle }]);

	/**
	 * @description 获取表格
	 */
	const { BtTable, BtPage, BtRecommendSearch, BtRefresh, BtColumn, BtBatch, BtTableCategory, BtErrorMask, tableRef, classList, refresh } = useAllTable({
		request: (data: any) => {
			return getWpBackupListData(data);
		},
		columns: getWpBackupListOption(),
		extension: [useTableBatch, useRefreshList(isRefreshBackupList)],
	});
</script>

<style scoped></style>
