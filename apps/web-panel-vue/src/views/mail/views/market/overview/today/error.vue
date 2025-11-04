<template>
	<div class="p-20px">
		<BtTable :max-height="600"> </BtTable>
	</div>
</template>

<script lang="tsx" setup>
import { isArray } from '@/utils'
import { useLoading } from '@mail/useMethod'
import { getErrorDetails } from '@/api/mail'
import { useAllTable } from '@/hooks/tools'

const { BtTable, BtPage, BtRefresh, BtTableCategory, BtRecommendSearch, BtColumn, BtBatch, BtErrorMask, refresh, categoryRef, config } = useAllTable({
	request: async params => {
		const { data: { data } } = await getErrorDetails()
		return { 
			data: data || [],
			total: data.length || 0,
		}
	},
	columns: [
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
			prop: 'delay',
			label: '延迟',
			width: 70,
		},
		{
			prop: 'delays',
			label: '延迟',
			width: 150,
		},
		{
			prop: 'status',
			label: '状态',
			width: 100,
			showOverflowTooltip: true,
			render: row => {
				return row.status
			},
		},
		{
			prop: 'relay',
			label: '中继',
			width: 200,
			showOverflowTooltip: true,
		},

		{
			prop: 'err_info',
			label: '详情',
			showOverflowTooltip: true,
		},
	],
})
</script>

<style lang="scss" scoped></style>
