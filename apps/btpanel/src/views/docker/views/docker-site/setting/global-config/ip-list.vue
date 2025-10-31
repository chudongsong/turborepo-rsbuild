<!--  -->
<template>
	<div>
		<bt-table-group>
			<template #header-left>
				<BtOperation />
			</template>
			<!-- <template #header-right>
				<el-radio-group v-model="listData.type">
					<el-radio-button label="black">黑名单</el-radio-button>
					<el-radio-button label="white">白名单</el-radio-button>
				</el-radio-group>
			</template> -->
			<template #content>
				<bt-table v-if="tabActive !== 'ipBlackList'" ref="ipListRef" :data="listData.white" :max-height="390" :column="tableColumns">
					<template #empty>
						<div class="flex items-center justify-center">当前列表为空</div>
					</template>
				</bt-table>
				<bt-table v-else ref="ipListRef" :data="listData.black" :max-height="390" :column="tableColumns">
					<template #empty>
						<div class="flex items-center justify-center">当前列表为空</div>
					</template>
				</bt-table>
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="ipListRef" :options="TableBatchOptions" />
			</template>
		</bt-table-group>
		<bt-help
			v-if="tabActive !== 'ipBlackList'"
			class="mt-[2rem] ml-[1.6rem]"
			:options="[
				{
					content: '注意：设置IP白名单后会默认禁止除白名单以外的所有IP访问',
				},
			]"
		/>
	</div>
</template>

<script setup lang="ts">
import { useOperation } from '@/hooks/tools';
import { tabActive, globalConfig, listData, tableColumns, TableBatchOptions, initIpData, addIpView } from './useController';

const ipListRef = ref();

watch(
	() => globalConfig.value.ip_limit,
	val => {
		if (val) {
			initIpData(val);
		} else {
			listData.white = [];
			listData.black = [];
		}
	},
	{ deep: true }
);

const { BtOperation } = useOperation({
	options: [
		{
			type: 'button',
			label: `添加IP${tabActive.value === 'ipBlackList' ? '黑' : '白'}名单`,
			active: true,
			onClick: addIpView,
		},
	],
});

onMounted(() => {
	initIpData(globalConfig.value.ip_limit);
});
</script>
