<template>
	<div class="mb-16px font-bold text-medium text-default">今日发送</div>
	<div class="total-list">
		<div class="total-item">
			<div class="total-label">发件成功率</div>
			<div class="total-value text-primary text-subtitleLarge">{{ total.delivery_rate }}%</div>
		</div>
		<div class="total-item">
			<div class="total-label">发件成功</div>
			<div class="total-value text-medium">{{ total.delivered }}</div>
		</div>
		<div class="total-item">
			<div class="total-label">发件失败</div>
			<div class="total-value text-medium">{{ total.failed }}</div>
		</div>
	</div>
	<div class="w-100% h-300px">
		<BtECharts style="height: 300px"></BtECharts>
	</div>
</template>

<script lang="ts" setup>
import { startOfDay, endOfDay } from '@/views/mail/views/market/useMethod'
import { formatTime, isArray } from '@/utils'
import { useDialog, useECharts } from '@/hooks/tools'
import { time, loading, useOverview } from '../useMethod'
import ErrorDetails from './error.vue'
import { isDark } from '@/utils/theme-config'
const { onResult, getChartTime, getOverview } = useOverview()

const chartRef = ref(null)

const total = ref({
	delivered: 0, // 发件成功
	delivery_rate: 0, // 发件成功率
	failed: 0, // 发件失败
	failure_rate: 0, // 发件成功率
	sends: 0, // 发件数
})

// 图表组-渲染组件
const { BtECharts, getEChart, setOption, setQuickOption } = useECharts({
	// 图表配置
	options: {},
})

const onShowError = () => {
	useDialog({
		title: '发件失败详情',
		area: 98,
		component: ErrorDetails,
	})
}

const sendOption = shallowReactive<any>({
	tooltip: {
		trigger: 'axis',
		order: 'seriesDesc',
		axisPointer: {
			type: 'shadow',
		},
	},
	legend: {
		top: 0,
		itemGap: 16,
		icon: 'circle',
		itemWidth: 10,
		itemHeight: 10,
		data: ['发件成功', '发件失败'],
		textStyle: {
			lineHeight: 12,
			padding: [0, 0, -2, 0],
			rich: {
				a: {
					verticalAlign: 'middle',
				},
			},
		},
	},
	grid: {
		top: '16%',
		left: '2%',
		right: '2%',
		bottom: '4%',
		containLabel: true,
	},
	yAxis: {
		type: 'value',
		boundaryGap: [0, '6%'],
		splitLine: {
			show: true,
			lineStyle: {
				type: 'dashed',
				width: 1,
				color: isDark.value ? '#999' : '#ebeef5',
			},
		},
	},
	xAxis: getXAxis(),
	series: [
		{
			type: 'bar',
			name: '发件成功',
			data: [],
		},
		{
			type: 'bar',
			name: '发件失败',
			data: [],
		},
	],
	events: {
		click: params => {
			if (params.componentSubType === 'bar' && isArray(params.value) && params.value[2] === 'daily') {
				const day = new Date(params.value[0] as string)
				time.value.type = 'custom'
				time.value.data = [startOfDay(day).getTime(), endOfDay(day).getTime()]
				getOverview()
			}
		},
	},
})

function getXAxis(format = 'HH:mm'): any['xAxis'] {
	return {
		type: 'category',
		axisLabel: {
			formatter: val => {
				if (format === 'HH:mm') {
					return val.match(/\d{2}:\d{2}/)[0]
				}
				return val.split(' ')[0]
			},
		},
	}
}

const renderEcharts = (send: any) => {
	const sendFail: [string, number, string][] = []
	const sendSuccess: [string, number, string][] = []
	send.data.forEach(item => {
		sendFail.push([getChartTime(send.column_type, item.x), item.failed, send.column_type])
		sendSuccess.push([getChartTime(send.column_type, item.x), item.delivered, send.column_type])
	})
	sendOption.series = [
		{
			type: 'bar',
			name: '发件失败',
			data: sendFail,
			stack: 'total',
			itemStyle: {
				color: '#1A519B',
			},
		},
		{
			type: 'bar',
			name: '发件成功',
			data: sendSuccess,
			stack: 'total',
			itemStyle: {
				color: '#91CC75',
			},
		},
	]
	sendOption.xAxis = getXAxis(send.column_type === 'hourly' ? 'HH:mm' : 'yyyy-MM-dd')
}

onMounted(() => {
	onResult(data => {
		if (data.send_mail_chart) {
			total.value = data.send_mail_chart.dashboard
			renderEcharts(data.send_mail_chart)
			chartRef.value = getEChart() as any
			setOption(sendOption)
		}
	})
})
</script>

<style lang="scss" scoped>
.total-list {
	display: flex;
	justify-content: center;
	flex-wrap: wrap;
	margin-bottom: 16px;

	.total-item {
		width: 26%;
		text-align: center;
	}

	.total-label {
		margin-bottom: 4px;
		font-size: var(--el-font-size-base);
		color: var(--el-color-text-secondary);
	}

	.total-value {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 28px;
	}
}
</style>
