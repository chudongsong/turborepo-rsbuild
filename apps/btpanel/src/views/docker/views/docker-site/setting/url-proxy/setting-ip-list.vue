<!--  -->
<template>
	<div>
		<bt-table-group>
			<template #header-left>
				<BtOperation />
			</template>
			<template #content>
				<bt-table v-if="tabActive !== 'ipBlackList'" ref="tableListRef" :data="listData.white" :max-height="390" :column="ipTableColumns">
					<template #empty>
						<div class="flex items-center justify-center">当前列表为空</div>
					</template>
				</bt-table>
				<bt-table v-else ref="tableListRef" :data="listData.black" :max-height="390" :column="ipTableColumns">
					<template #empty>
						<div class="flex items-center justify-center">当前列表为空</div>
					</template>
				</bt-table>
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="tableListRef" :options="TableBatchOptions" />
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
import { proxyData, tabActive, listData, setIpValueEvent, initIpData, ipTableColumns, TableBatchOptions, addIpView } from './useController';
import { useOperation } from '@/hooks/tools';

const tableListRef = ref()

watch(
	() => proxyData.value.ip_limit,
	val => {
		if (val) {
			setIpValueEvent(val);
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
			label: `添加IP${tabActive.value === 'ipBlackList' ? '黑' : '白'}名单`,
			type: 'button',
			active: true,
			onClick: addIpView,
		},
	],
});

onMounted(initIpData);
</script>
