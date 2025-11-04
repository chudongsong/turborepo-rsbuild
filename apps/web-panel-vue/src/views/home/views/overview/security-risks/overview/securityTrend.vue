<template>
	<div class="">
		<div class="h-[4rem] leading-[4rem]">安全趋势</div>
		<BtECharts class="!h-[20rem]" />
	</div>
</template>
<script setup lang="ts">
import { useECharts } from '@hooks/tools/echarts/index'
import { getSecurityTrend } from '@/api/home'
import { formatTime } from '@/utils'

const option: any = shallowReactive<any>({
	tooltip: {
		trigger: 'axis',
		axisPointer: {
      type: "shadow",
      label: {
        show: true
      }
    }
	},
	legend: {
		bottom: 0,
		itemWidth: 12,
		itemHeight: 10,
		itemGap: 10,
		textStyle: {
			fontSize: 10,
			color: '#666666',
		},
		data: [],
	},
	grid: {
		top: '4%',
		right: '10%',
		bottom: '24%',
	},
	xAxis: [
		{
			type: 'category',
			axisTick: {
				alignWithLabel: true,
			},
			axisLabel: {
				textStyle: {
					color: '#666666',
				},
			},
			data: [],
		},
	],
	yAxis: [
		{
			type: 'value',
			min: 0,
			axisLabel: {
				textStyle: {
					color: '#666666',
				},
			},
		},
		
	],
	series: [],
})

// 图表组-渲染组件
const { BtECharts, getEChart, setOption, setQuickOption } = useECharts({
	// 图表配置
	options: {},
})
const getSeriesLine = (title: string, val: number[] = [], color: string) => {
	return [
		{
			name: title,
			type: 'line',
			lineStyle: {
				normal: {
					// width: 1,
					// shadowColor: color,
					// shadowBlur: 10,
					// shadowOffsetY: 10,
				},
			},
			smooth: true,
			showSymbol: false,
			sampling: 'average',
			data: val,
		},
	] as any['line']
}
const getSeriesBar = (title: string, val: number[] = [], color: string) => {
	return [
		{
			name: title,
			type: 'bar',
			barWidth: '8px',
			itemStyle: {
				normal: {
					color: color,
				},
			},
			data: val,
		},
	] as any['bar']
}

const setData = async () => {
	try {
		const { data } = await getSecurityTrend()
		const lineTrendUnhandledRisks: number[] = [] // 未处理风险
		const lineTrendHandledRisks: number[] = [] // 已处理风险
		const homeBar: number[] = [] // 首页柱状图
		const valBar: number[] = [] // 漏洞柱状图
		const serverBar: number[] = [] // 基线柱状图
		data.trend_list.forEach((item: any) => {
			lineTrendUnhandledRisks.push(item.unhandled_risks)
			lineTrendHandledRisks.push(item.handled_risks)
			homeBar.push(item.risk_scan)
			valBar.push(item.vul_scan)
			serverBar.push(item.server_risks)
		})
		option.xAxis[0].data = data.trend_list.map((item: any) => formatTime(item.timestamp,'MM/dd'))
		option.series = [
			...getSeriesLine('未处理风险', lineTrendUnhandledRisks, 'rgb(255,221,214,1)'),
			...getSeriesLine('已处理风险', lineTrendHandledRisks, 'var(--el-color-primary)'),
			...getSeriesBar('首页', homeBar, 'rgb(29, 159, 234, 1)'),
			...getSeriesBar('漏洞', valBar, 'rgb(30,67,180,1)'),
			...getSeriesBar('基线', serverBar, 'rgb(70,44,104,1)'),
		]
		option.legend.data = ['未处理风险', '已处理风险', '首页', '漏洞', '基线']
		setOption(option)
	} catch (error) {
		console.log(error)
	}
}
defineExpose({
	setData,
})
</script>
