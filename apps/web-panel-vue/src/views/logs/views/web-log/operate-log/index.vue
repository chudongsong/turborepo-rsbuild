<template>
	<bt-table-group>
		<template #header-left>
			<el-button @click="outLogs">导出日志</el-button>
		</template>
		<template #header-right>
			<BtSearch class="mr-1rem !w-[24rem]" placeholder="请输入搜索关键字" />
			<BtRefresh />
		</template>
		<template #content>
			<BtTable />
		</template>
		<template #footer-right>
			<BtPage />
			<!-- <bt-table-page
        :total="tableParam.total"
        v-model:page="tableParam.p"
        v-model:row="tableParam.limit"
        @change="getOperateLog()"
      /> -->
		</template>
	</bt-table-group>
</template>
<script lang="tsx" setup>
import { useAllTable, useRefreshList } from '@/hooks/tools'
import { toHalfWidth } from '@/utils'
import { useGlobalStore } from '@store/global'
import { LOG_SITE_STORE, useSiteLogStore } from '../useStore'

const { mainHeight } = useGlobalStore() // 获取全局高度
const store = LOG_SITE_STORE()
const { getOperateLog, outLogs } = store
const { isRefreshList } = useSiteLogStore()

const { BtTable, BtPage, BtSearch, BtRefresh, refresh } = useAllTable({
	request: data => {
		const { search: keywords, ...rest } = data
		return getOperateLog({ keywords, ...rest, stype: '网站管理' })
	},
	columns: [
		{ label: '用户', prop: 'username', width: 180 },
		{ label: '操作类型', prop: 'type', width: 100 },
		{
			label: '详情',
			render: function (row: any) {
				const parser = new DOMParser()
				const doc = parser.parseFromString(row.log, 'text/html')
				return <span v-html={toHalfWidth(doc.body.innerHTML)}></span>
			},
		},
		{ label: '操作时间', width: 150, prop: 'addtime', align: 'right' },
	],
	extension: [useRefreshList(isRefreshList)],
})

defineExpose({ init: refresh })
</script>
