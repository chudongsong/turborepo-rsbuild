<template>
	<div class="my-10">
		<div>待处理风险</div>
		<div class="flex h-[3.2rem]">
			<span class="text-iconLarge mr-[2rem]">{{ pendingAlert.total }}</span>
			<div class="flex items-end alertNum">
				<span class="bg-danger">{{ pendingAlert.high_risk }}</span>
				<span class="bg-warning">{{ pendingAlert.medium_risk }}</span>
				<span class="bg-darkTertiary">{{ pendingAlert.low_risk }}</span>
			</div>
		</div>
		<BtECharts style="height: 60px"></BtECharts>
	</div>
</template>

<script lang="ts" setup>
import { useECharts } from '@hooks/tools'
import { formatTime } from '@/utils'
import { getPendingAlarmTrend } from '@/api/home'

const pendingAlert = reactive({
	total: 0, // 总数
	high_risk: 0, // 高风险
	medium_risk: 0, // 中风险
	low_risk: 0, // 低风险
})
const option: any = shallowReactive<any>({
	tooltip: {
		trigger: 'axis',
		axisPointer: {
			type: 'line',
			lineStyle: {
				width: 1,
				type: 'solid',
			},
		},
	},
	grid: {
		top: '16%',
		left: '-8%',
		right: '0%',
		bottom: '0%',
		containLabel: false, // 确保不包含坐标轴标签的空间
		// height: 80,
	},
	xAxis: {
		data: [],
		show: false,
	},
	yAxis: {
		show: false,
	},
	series: [],
})

// 图表组-渲染组件
const { BtECharts, getEChart, setOption, setQuickOption } = useECharts({
	// 图表配置
	options: {},
})
const getSeries = (val: number[] = [0, 0, 0, 0, 0, 0]) => {
	return [
		{
			name: '风险数量',
			type: 'line',
			data: val,
			itemStyle: {
				color: '#ec958d',
			},
			smooth: true,
			showSymbol: false,
			sampling: 'average',
			areaStyle: {
				color: {
					type: 'linear',
					x: 0,
					y: 0,
					x2: 0,
					y2: 1,
					global: false,
					colorStops: [
						{ offset: 0, color: '#fcdcd5' },
						{ offset: 1, color: '#fcdcd5' },
					],
				},
			},
		},
	] as any['series']
}

const setData = async () => {
	try {
		const { data } = await getPendingAlarmTrend()
		const xAxisData = data.trend_list.map((item: any) => formatTime(item.timestamp))
		const countsData = data.trend_list.map((item: any) => item.count)
		option.xAxis = {
			data: xAxisData,
			show: false,
		}
		option.series = getSeries(countsData)
		pendingAlert.total = data.total
		pendingAlert.high_risk = data.high_risk
		pendingAlert.medium_risk = data.medium_risk
		pendingAlert.low_risk = data.low_risk
		setOption(option)
	} catch (error) {
		console.log(error)
	}
}

defineExpose({
	setData,
})
</script>
<style lang="scss" scoped>
.alertNum {
	span {
		margin-right: 0.4rem;
		color: var(--el-color-white);
		padding: 0 6px;
	}
}
</style>
