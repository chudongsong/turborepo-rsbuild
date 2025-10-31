<template>
	<div class="p-20px">
		<bt-table-group>
			<template #header-left>
				<el-radio-group size="default" v-model="search.type" @change="refresh">
					<el-radio-button label="domain">域名</el-radio-button>
					<el-radio-button label="status">状态</el-radio-button>
				</el-radio-group>
			</template>
			<template #content>
				<BtTable :max-height="340">
				</BtTable>
			</template>
		</bt-table-group>
	</div>
</template>

<script lang="tsx" setup>
import { isArray } from '@/utils'
import { getTaskError } from '@/api/mail'
import { useAllTable, useDialog } from '@/hooks/tools';
import { useOperate } from '@/hooks/tools/table/column';

import TaskDetails from './details.vue'

interface PropsData {
	row: any
}

interface Props {
	compData: PropsData
}

const props = withDefaults(defineProps<Props>(), {})


const search = reactive({
	task_id: props.compData.row.id,
	type: 'domain',
})

const onShowDetails = (row: any) => {
	useDialog({
		title: '详情',
		area: 98,
		component: TaskDetails,
		compData: {
			row,
			id: props.compData.row.id,
			type: search.type,
		}
	})
}

const { BtTable, BtPage, BtRefresh, BtTableCategory, BtRecommendSearch, BtColumn, BtBatch, BtErrorMask, refresh } = useAllTable({
	request: async data => {
		const { data: message } = await getTaskError(toRaw(search))
		return {
			data: message || [],
			total: message.length || 0,
		}
	},
	columns: [
		{
			prop: 'domain',
			label: search.type === 'domain' ? '域名' : '状态',
			render: row => {
				if (search.type === 'domain') return row.domain
				return row.status
			},
		},
		{
			prop: 'count',
			label: '数量',
		},
		useOperate((row: any) => [
			{
				title: '详情',
				onClick: () => {
					onShowDetails(row)
				},
			},
		])
	]
})

</script>