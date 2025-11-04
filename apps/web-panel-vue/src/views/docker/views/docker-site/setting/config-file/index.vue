<template>
	<div>
		<BtTabs @change="getConfigData" />
		<!-- <bt-tabs type="card" v-model="tabActive" :config="tabComponent" @tab-click="handleClickTab">
		</bt-tabs> -->
	</div>
</template>

<script setup lang="tsx">
import { useTabs } from '@/hooks/tools';
import { tabActive,getConfigData } from './useController';

import Files from './files.vue';

// 配置文件内容列表
const configList = reactive({
	site_conf: '', // 主配置文件
	http_block: '', // http配置块
	server_block: '', // server配置块
});
provide('configList', configList);
provide('tabActive', tabActive);

const { BtTabs } = useTabs({
	type: 'card',
	value: tabActive,
	options: [
		{
			label: '主配置文件',
			name: 'master',
			render: () => <Files type="master" />,
		},
		{
			label: '自定义配置文件',
			name: 'custom',
			lazy: true,
			render: () => <Files type="custom" />,
		},
	],
});

defineExpose({
	init:getConfigData,
});
</script>

<style lang="css" scoped>
:deep(.el-tabs__nav) {
	display: flex;
	align-items: center;
}
</style>
