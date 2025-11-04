<template>
	<div class="mb-16px font-bold text-medium text-default">退信率%</div>
	<div class="flex-center !h-370px">
		<BtECharts style="height: 370px"></BtECharts>
	</div>
</template>

<script lang="ts" setup>
import { formatTime } from '@/utils'
import { useECharts } from '@/hooks/tools'
import { isDark } from '@/utils/theme-config'
import { useOverview } from '../useMethod'

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
		name: '%',
		type: 'value',
		splitLine: {
			show: true,
			lineStyle: {
				type: 'dashed',
				width: 1,
				color: isDark.value ? '#999' : '#ebeef5',
			},
		},
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
				if (format === 'HH:mm') {
					return val.match(/\d{2}:\d{2}/)[0]
				}
				return val.split(' ')[0]
			},
		},
	}
}

function getSeries(val: [string, number][] = []): any['series'] {
	return [
		{
			name: '退信率',
			type: 'line',
			data: val,
			itemStyle: {
				color: 'var(--el-color-primary)',
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
	const { bounce_rate_chart: chart } = data
	if (chart) {
		const rateData = chart.data.map(item => {
			return [getChartTime(chart.column_type, item.x), item.bounce_rate] as [string, number]
		})
		option.series = getSeries(rateData)
		option.xAxis = getXAxis(chart.column_type === 'hourly' ? 'HH:mm' : 'yyyy-MM-dd')
		setOption(option)
	}
})
</script>
