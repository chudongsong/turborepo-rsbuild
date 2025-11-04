<template>
	<div>
		<bt-table-group class="h-[59rem]">
			<template #header-left>
				<BtOperation />
			</template>
			<template #content>
				<BtTable :max-height="560" />
			</template>
		</bt-table-group>
		<bt-help class="mt-[2rem] ml-[1.6rem]" :options="helpList" />
	</div>
</template>

<script setup lang="ts">
import { useOperation, useRefreshList, useTable } from '@/hooks/tools';
import { useOperate, usePs } from '@/hooks/tools/table/column';
import { isRefreshList, helpList, addUrlEvent, getUrlList, setPsEvent, openSetting, deleteEvent } from './useController';

const { BtOperation } = useOperation({
	options: [
		{
			label: '添加反向代理',
			type: 'button',
			active: true,
			onClick: addUrlEvent,
		},
	],
});

const { BtTable,refresh } = useTable({
	request: getUrlList,
	columns: [
		{
			label: '代理目录', // 用户名
			prop: 'proxy_path',
			minWidth: 120,
		},
		{
			label: '目标', // 用户名
			prop: 'proxy_pass',
			minWidth: 200,
		},
		usePs({ request: setPsEvent, prop: 'remark' }),
		useOperate([
			{
				onClick: openSetting,
				title: '设置',
			},
			{
				onClick: deleteEvent,
				title: '删除',
			},
		]),
	],
	extension: [useRefreshList(isRefreshList)],
});
defineExpose({ init:refresh });
</script>
