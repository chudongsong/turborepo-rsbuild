<template>
	<bt-table-group>
		<template #content>
			<bt-table ref="table" :column="tableColumn" :data="tableData" v-bt-loading="tableLoading" :description="'操作日志列表为空'" v-bt-loading:title="'正在加载操作日志列表，请稍后...'"></bt-table>
		</template>
		<template #footer-right>
			<bt-table-page :total="pageTotal" v-model:page="tableParam.p" v-model:row="tableParam.limit" @change="getLogData" />
		</template>
	</bt-table-group>
</template>
<script lang="tsx" setup>
import { getIntrusionLog } from '@/api/firewall'
import { InterceptLogTableDataProps } from '@/types/firewall'
import { useDataHandle, useDataPage } from '@hooks/tools/data'
import { useGlobalStore } from '@store/global'

const { mainHeight } = useGlobalStore()

const tableLoading = ref<boolean>(false) // 加载状态
const tableData = ref<Array<InterceptLogTableDataProps>>() //列表数据
const tableParam = reactive({
	p: 1,
	limit: 20,
}) // 表格接口请求
const pageTotal = ref(0) // 总条数

// 表格数据
const tableColumn = [
	{ label: '操作', prop: 'log' },
	{ label: '时间', prop: 'addtime' },
]

/**
 * @description 切换列表页面
 * @param {number} p 当前页码
 */
const getLogData = async (p: number = 1) => {
	await useDataHandle({
		loading: tableLoading,
		request: getIntrusionLog({ ...tableParam, p: p }),
		data: {
			data: [Array, tableData],
			page: useDataPage(pageTotal),
		},
	})
}

onMounted(() => getLogData())
</script>
