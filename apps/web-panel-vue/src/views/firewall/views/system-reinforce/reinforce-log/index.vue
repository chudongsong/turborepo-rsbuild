<template>
	<div>
		<bt-table-group>
			<template #content>
				<bt-table ref="table" :column="tableColumn" :data="tableData" v-bt-loading="loading" :description="'日志列表为空'" v-bt-loading:title="'正在加载日志列表，请稍后...'"></bt-table>
			</template>
			<template #footer-right>
				<bt-table-page :total="completedTotal" v-model:page="tableParam.p" v-model:row="tableParam.limit" @change="getLogData" />
			</template>
		</bt-table-group>
	</div>
</template>
<script lang="tsx" setup>
import type { SystemLogTableDataProps } from '@firewall/types'

import { useGlobalStore } from '@store/global'
import { useDataHandle, useDataPage } from '@hooks/tools/data'
import { getDataInfo } from '@/api/global'

const { mainHeight } = useGlobalStore()

// 页面数据
const loading = shallowRef<boolean>(false) // 加载状态
const tableData = shallowRef<Array<SystemLogTableDataProps>>([]) //列表数据
const completedTotal = shallowRef(0) // 总条数

// 表格接口请求
const tableParam = reactive({
	p: 1,
	limit: 20,
	table: 'logs',
	order: 'id desc',
	search: '系统加固',
})

// 表格数据
const tableColumn = [
	{ label: '时间', prop: 'addtime' },
	{ label: '详情', prop: 'log' },
]

/**
 * @description 切换列表页面
 */
const getLogData = async () => {
	await useDataHandle({
		loading,
		request: getDataInfo({ ...tableParam }),
		data: {
			data: [Array, tableData],
			page: useDataPage(completedTotal),
		},
	})
}

onMounted(() => getLogData())
</script>
