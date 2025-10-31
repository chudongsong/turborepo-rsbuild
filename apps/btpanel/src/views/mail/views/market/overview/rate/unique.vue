<template>
	<div class="mb-16px font-bold text-medium text-default">独立打开率%</div>
	<div class="flex-center h-200px">
		<BtECharts style="height: 200px"></BtECharts>
	</div>
</template>

<script lang="ts" setup>
import { formatTime } from '@/utils'
import { useOverview } from '../useMethod'
import { useECharts } from '@/hooks/tools'

const { onResult, getChartTime } = useOverview()

const option = shallowReactive<any>({
	tooltip: {
		trigger: 'axis',
		order: 'seriesDesc',
		axisPointer: {
			type: 'shadow',
		},
	},
	grid: {
		top: '16%',
		left: '2%',
		right: '2%',
		bottom: '2%',
		containLabel: true,
	},
	yAxis: {
		type: 'value',
		splitLine: {
			show: true,
			lineStyle: {
				type: 'dashed',
				width: 1,
				color: '#ebeef5',
			},
		},
		name: '%',
		max: ({ max }) => {
			return max > 100 ? 100 : max
		},
	},
	xAxis: getXAxis(),
	series: getSeries(),
})

function getXAxis(format = 'HH:mm'): any['xAxis'] {
	return {
		type: 'category',
		axisLabel: {
			formatter: val => {
				return formatTime(val, format)
			},
		},
	}
}

function getSeries(val: [string, number][] = []): any['series'] {
	return [
		{
			name: '独立打开率',
			type: 'line',
			data: val,
			itemStyle: {
				color: '#1a519b',
			},
			smooth: false,
			showSymbol: false,
			sampling: 'average',
		},
	]
}

// 图表组-渲染组件
const { BtECharts, getEChart, setOption, setQuickOption } = useECharts({
	// 图表配置
	options: {},
})

onResult(data => {
	const { open_rate_chart: chart } = data
	if (chart) {
		const rateData = chart.data.map(item => {
			return [getChartTime(chart.column_type, item.x), item.open_rate] as [string, number]
		})
		option.series = getSeries(rateData)
		option.xAxis = getXAxis(chart.column_type === 'hourly' ? 'HH:mm' : 'yyyy-MM-dd')
		setOption(option)
	}
})
</script>
