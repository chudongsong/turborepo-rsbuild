<!--  -->
<template>
	<div>
		<bt-table-group>
			<template #header-left>
				<BtOperation />
			</template>
			<template #content>
				<bt-table v-if="tabActive !== 'ipBlackList'" ref="settingIpWhiteRef" :data="listData.white" :max-height="390" :column="ipTableColumns">
					<template #empty>
						<div class="flex items-center justify-center">当前列表为空</div>
					</template>
				</bt-table>
				<bt-table v-else ref="settingIpRef" :data="listData.black" :max-height="390" :column="ipTableColumns">
					<template #empty>
						<div class="flex items-center justify-center">当前列表为空</div>
					</template>
				</bt-table>
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="tableRef" :options="TableBatchOptions" />
			</template>
		</bt-table-group>
		<bt-help
			v-if="tabActive !== 'ipBlackList'"
			class="mt-[2rem] ml-[1.6rem]"
			:options="[
				{
					content: '注意：设置IP白名单后会默认禁止除白名单以外的所有IP访问',
				},
			]" />
	</div>
</template>

<script setup lang="ts">
import { rowData,tabActive, settingIpRef, settingIpWhiteRef, listData, setIpValueEvent, initIpData, ipTableColumns, TableBatchOptions, addIpView } from './useController'
import { useOperation } from '@/hooks/tools'

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
}) // props默认值

watch(
	() => rowData.value,
	val => {
		if (val) {
			setIpValueEvent(val)
		} else {
			listData.white = []
			listData.black = []
		}
	},
	{ deep: true }
)

const tableRef = computed(() => {
	return tabActive.value === 'ipWhiteList' ? settingIpWhiteRef.value : settingIpRef.value
})

const { BtOperation } = useOperation({
	options: [
		{
			label: `添加IP${tabActive.value === 'ipBlackList' ? '黑' : '白'}名单`,
			type: 'button',
			active: true,
			onClick: addIpView,
		},
	],
})

onMounted(initIpData)
</script>
