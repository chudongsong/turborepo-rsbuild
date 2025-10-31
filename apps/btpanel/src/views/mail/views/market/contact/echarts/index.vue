<template>
	<div class="mb-16px" :show="loading">
		<div class="text-center fw-bold text-large text-darkSecondary">
			{{ active ? '订阅' : '取消订阅' }}
			趋势
		</div>
		<div class="w-96% mx-auto">
			<BtECharts class="h-[20rem]"></BtECharts>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { isArray } from '@/utils'
import { useLoading } from '@mail/useMethod'
import { getContactsEcharts } from '@/api/mail'
import { useECharts } from '@/hooks/tools'

interface Props {
	active: number
}

const props = withDefaults(defineProps<Props>(), {
	active: 0,
})

const active = toRef(props, 'active')

const getXAxis = (val: string[] = ['1月', '2月', '3月', '4月', '5月', '6月']) => {
	return [
		{
			data: val,
		},
	] as any['xAxis']
}

const getSeries = (val: number[] = [0, 0, 0, 0, 0, 0]) => {
	return [
		{
			name: 'Count',
			type: 'line',
			data: val,
			itemStyle: {
				color: 'var(--el-color-primary)',
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
						{ offset: 0, color: 'rgba(var(--el-color-primar-rgb), 0.4)' },
						{ offset: 0.7, color: 'rgba(32, 164, 58, 0)' },
					],
				},
			},
		},
	] as any['series']
}

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
		bottom: '4%',
		containLabel: true,
	},
	xAxis: getXAxis(),
	yAxis: {
		type: 'value',
	},
	series: getSeries(),
})

const { loading, setLoading } = useLoading()

// 图表组-渲染组件
const { BtECharts, getEChart, setOption, setQuickOption } = useECharts({
	// 图表配置
	options: {},
})

const getData = async () => {
	try {
		setLoading(true)
		const {
			data: { data },
		} = await getContactsEcharts({ active: active.value })
		if (
			isArray<{
				month: string
				count: number
			}>(data)
		) {
			const months = data.map(item => item.month)
			const counts = data.map(item => item.count)
			option.xAxis = getXAxis(months)
			option.series = getSeries(counts)
		}
		setOption(option)
	} finally {
		setLoading(false)
	}
}

getData()

watch(
	() => active.value,
	() => {
		getData()
	}
)
</script>
