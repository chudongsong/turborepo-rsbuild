<template>
	<bt-table-group class="p-[2rem]">
		<template #content>
			<bt-table :column="tableColumn" :data="tableData"></bt-table>
		</template>
		<template #footer-right>
			<bt-table-page :total="completedTotal" v-model:page="tableParam.p" v-model:row="tableParam.limit" @change="getRiskData" />
		</template>
	</bt-table-group>
</template>
<script lang="tsx" setup>
import { getRiskInfo } from '@/api/firewall'
import { useDataHandle, useDataPage } from '@/hooks/tools'
import { RiskTableDataProps } from '@/types/firewall'
import { riskColumn } from '../../useMethod'

interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
})

// 页面数据
const tableData = ref<Array<RiskTableDataProps>>([]) //列表数据
const completedTotal = ref(0) // 总条数
const tableColumn = riskColumn()

// 表格接口请求
const tableParam = reactive({
	p: 1,
	limit: 10,
	testing_id: props.compData.testing_id,
})

/**
 * @description 切换列表页面
 * @param {number} p 当前页码
 */
const getRiskData = async (p: number = 1) => {
	await useDataHandle({
		loading: '正在获取IP规则列表，请稍后...',
		request: getRiskInfo(tableParam),
		data: {
			data: [Array, tableData],
			page: useDataPage(completedTotal),
		},
	})
}

watch(
	() => props.compData,
	val => {
		tableParam.testing_id = val.testing_id
	}
)

onMounted(() => getRiskData())
</script>
