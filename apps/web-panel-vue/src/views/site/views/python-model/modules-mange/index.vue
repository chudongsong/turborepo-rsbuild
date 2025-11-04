<!--  -->
<template>
	<div class="relative p-[16px]">
		<bt-table-group>
			<template #header-left>
				<div class="flex items-center">
					<bt-input v-model="modulesData.name" placeholder="虚拟环境模块名称" clearable class="mr-1rem" width="27rem"></bt-input>
					<bt-input v-model="modulesData.version" placeholder="模块版本" clearable width="16rem"></bt-input>
					<el-button type="primary" class="!ml-[2rem]" @click="installModule">安装模块</el-button>
				</div>
			</template>
			<template #content>
				<BtTable :max-height="400" />
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="ts">
import { useRefreshList, useTable } from '@/hooks/tools';
import { modulesData, getTableList, isRefreshList, deleteEvent, installModule } from './useController';
import { useOperate } from '@/hooks/tools/table/column';

interface Props {
	compData?: any;
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
});

const { BtTable } = useTable({
	request: getTableList,
	columns: [
		{
			label: '模块名', // 路径
			prop: 'name',
		},
		{
			label: '版本',
			prop: 'version',
		},
		useOperate([{ onClick: deleteEvent, title: '卸载' }]),
	],
	extension: [useRefreshList(isRefreshList)],
});
</script>
