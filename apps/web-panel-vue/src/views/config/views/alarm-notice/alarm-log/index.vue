<template>
	<bt-table-group>
		<template #header-right>
			<bt-radio
				type="button"
				v-model="tableParams.status"
				:options="[
					{ label: '全部', value: '' },
					{ label: '发送成功', value: true },
					{ label: '发送失败', value: false },
				]"
				@change="getList"
				class="mr-[1rem]"></bt-radio>
			<div>
				<bt-input-search v-model="tableParams.keyword" @search="getList" placeholder="请输入搜索关键词" class="!w-24rem" />
			</div>
		</template>
		<template #content>
			<bt-table v-bt-loading="tableLoad" :data="tableData" :column="tableColumn" :max-height="mainHeight - 254" description="告警日志列表为空" v-bt-loading:title="'正在加载告警日志列表，请稍后...'"> </bt-table>
		</template>
		<template #footer-right>
			<bt-table-page :total="tableTotal" v-model:page="tableParams.p" v-model:row="tableParams.limit" @change="getList" />
		</template>
	</bt-table-group>
</template>

<script lang="tsx" setup>
import type { AlarmLog } from '@config/types'
import { useGlobalStore } from '@store/global'
import { useDataHandle, useDataPage } from '@hooks/tools'

import { getPushLogs } from '@/api/config'

const { mainHeight } = useGlobalStore()

const tableData = ref<AlarmLog[]>([]) // 表格数据
const tableLoad = ref(false) // 表格loading
const tableTotal = ref(0) // 总条数
const tableParams = reactive({
	p: 1, // 当前页
	limit: 20, // 每页条数
	keyword: '', // 搜索关键词
	status: '', // 发送状态
})

const getList = async () => {
	await useDataHandle({
		loading: tableLoad,
		request: getPushLogs(toRaw(tableParams)),
		data: { data: [Array, tableData], page: useDataPage(tableTotal) },
	})
}

const tableColumn = [
	{ label: '标题', render: (row: AlarmLog) => <span innerHTML={row.log}></span> },
	{ prop: 'addtime', label: '时间', width: 150 },
]

onMounted(getList)

defineExpose({ init: getList })
</script>
