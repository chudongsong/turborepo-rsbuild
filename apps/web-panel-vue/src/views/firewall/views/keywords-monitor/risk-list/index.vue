<template>
	<bt-table-group :class="{ 'p-[2rem]': isPopup }">
		<template #content>
			<bt-table ref="table" :column="tableColumn" :data="tableData" v-bt-loading="tableLoad" :description="'风险列表为空'" :max-height="isPopup ? 500 : null" v-bt-loading:title="'正在加载风险列表，请稍后...'"></bt-table>
		</template>
		<template #footer-right>
			<bt-table-page :total="completedTotal" v-model:page="tableParam.p" v-model:row="tableParam.limit" @change="getRiskListEvent" />
		</template>
	</bt-table-group>
</template>
<script lang="tsx" setup>
import type { RiskTableDataProps } from '@firewall/types'

import { riskColumn } from '@/views/firewall/useMethod'
import { useDataHandle, useDataPage } from '@hooks/tools/data'
import { getRiskList } from '@/api/firewall'
import { useGlobalStore } from '@store/global'

interface Props {
	compData: {
		isPopup?: boolean
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		isPopup: false,
	}),
})

const { mainHeight } = useGlobalStore()

const tableLoad = shallowRef(false) // 加载状态
const tableData = ref<Array<RiskTableDataProps>>([]) //列表数据
const completedTotal = ref(0) // 总条数
const isPopup = ref(props.compData.isPopup) // 是否弹窗
const tableColumn = riskColumn()

const tableParam = shallowReactive({
	p: 1,
	limit: 20,
})

/**
 * @description 切换列表页面
 * @param {number} p 当前页码
 */
const getRiskListEvent = async () => {
	await useDataHandle({
		loading: tableLoad,
		request: getRiskList({ ...tableParam }),
		data: {
			data: [Array, tableData],
			page: useDataPage(completedTotal),
		},
	})
}

onMounted(getRiskListEvent)
</script>
