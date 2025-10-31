<template>
	<BtTable :height="305" :max-height="305" :bordered="false" :loading="loading"> </BtTable>
</template>

<script lang="tsx" setup>
import { useAllTable } from '@/hooks/tools'
import { loading, useOverview } from '../useMethod'

const { getRate, onResult } = useOverview()

const { BtTable, BtPage, BtRefresh, BtTableCategory, BtRecommendSearch, BtColumn, BtBatch, BtErrorMask, refresh, categoryRef, config } = useAllTable({
	request: async data => {
		let table: any[] = []
		onResult(data => {
			table = data.mail_providers
		})
		return {
			data: table,
			total: 0,
		}
	},
	columns: [
		{
			prop: 'mail_provider',
			label: '邮件服务商',
			showOverflowTooltip: true,
		},
		{
			prop: 'delivery_rate',
			label: '送达率',
			render: row => {
				return getRate(row.delivery_rate)
			},
		},
		{
			prop: 'open_rate',
			label: '打开率',
			render: row => {
				return getRate(row.open_rate)
			},
		},
		{
			prop: 'click_rate',
			label: '点击率',
			render: row => {
				return getRate(row.click_rate)
			},
		},
		{
			prop: 'bounce_rate',
			label: '退信率',
			render: row => {
				return getRate(row.bounce_rate)
			},
		},
	],
})
</script>
