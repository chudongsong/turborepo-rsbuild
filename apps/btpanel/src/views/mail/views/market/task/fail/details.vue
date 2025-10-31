<template>
	<div class="p-20px">
		<bt-table-group>
			<template #content>
				<BtTable>
				</BtTable>
			</template>
			<template #footer-right>
				<BtPage>
				</BtPage>
			</template>
		</bt-table-group>
	</div>
</template>

<script lang="tsx" setup>
import { getTaskErrorDetails } from '@/api/mail'
import { useAllTable } from '@/hooks/tools'

interface PropsData {
	id: number
	type: string
	row: any
}

interface Props {
	compData: PropsData
}

const props = withDefaults(defineProps<Props>(), {})

const search = reactive({
	task_id: props.compData.id,
	type: props.compData.type,
	value: props.compData.type === 'domain' ? props.compData.row.domain : props.compData.row.status,
	page: 1,
	size: 10,
})

const { BtTable, BtPage, BtRefresh, BtTableCategory, BtRecommendSearch, BtColumn, BtBatch, BtErrorMask, refresh } = useAllTable({
	request: async data => {
		let params = {
			p: data.p,
			size: data.limit,
		}
		Object.assign(toRaw(search), params)
		const { data: message } = await getTaskErrorDetails(toRaw(search))
		return {
			data: message.data || [],
			total: message.total || 0,
		}
	},
	columns: [
		{
			prop: search.type === 'domain' ? 'domain' : 'status',
			label: search.type === 'domain' ? '域名' : '状态',
			width: search.type === 'domain' ? 120 : 100,
			showOverflowTooltip: true,
		},
		{
			prop: 'recipient',
			label: '收件人',
			width: 160,
			showOverflowTooltip: true,
		},
		{
			prop: 'dsn',
			label: 'Dsn',
			width: 60,
		},
		{
			prop: 'delays',
			label: '延迟',
			width: 150,
		},
		{
			prop: 'relay',
			label: '中继',
			width: 200,
			showOverflowTooltip: true,
		},
		{
			prop: 'err_info',
			label: '错误信息',
			showOverflowTooltip: true,
		},
	],
})
</script>

<style lang="scss" scoped>
:deep(.el-popper) {
	max-width: 400px !important;
}
</style>