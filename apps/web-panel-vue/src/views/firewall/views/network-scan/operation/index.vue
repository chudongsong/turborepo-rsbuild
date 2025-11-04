<template>
	<bt-table-group>
			<template #content>
				<bt-table ref="lockListRef" v-bt-loading="tableLoad" :column="tableColumn" :data="tableData" max-height="600"></bt-table>
			</template>
			<template #footer-right>
				<bt-table-page :total="tableTotal" v-model:page="tableParams.p" v-model:row="tableParams.rows" @change="init" />
			</template>
		</bt-table-group>
</template>
<script setup lang="ts">
import { getScanPerceptionOperationLog } from '@/api/firewall'
import { useDataHandle, useDataPage } from '@hooks/tools'


const tableLoad = ref(false) // 表格loading
const tableData = ref([])
const tableTotal = ref(0) // 总条数
const tableParams = reactive({
	p: 1, // 当前页
	rows: 20, // 每页条数
})
const tableColumn = ref([
	{
		label: '时间',
		prop: 'addtime',
		width: 150,
	},
	{
		label: '详情',
		prop: 'log',
	},
])

const init = async () => {
	await useDataHandle({
		loading: tableLoad,
		request: getScanPerceptionOperationLog(toRaw(tableParams)),
		data: { data: [Array, tableData], page: useDataPage(tableTotal) },
	})
}
init()
</script>