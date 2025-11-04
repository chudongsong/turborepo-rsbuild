<template>
	<div class="monitor monitor-chart w-full">
		<slot></slot>
		<BtECharts class="w-full" />
	</div>
</template>

<script lang="ts" setup>
import { getByteUnit } from '@utils/index'
import { useECharts } from '@hooks/tools/echarts/index'
import { isDark } from '@/utils/theme-config'

interface Props {
	info: Info
}

interface Info {
	info: any[]
	option: any
}

const modelVal = defineModel()
console.log(modelVal)

withDefaults(defineProps<Props>(), {
	info: () => ({
		info: [],
		option: {},
	}),
})

const echartRef = ref()

watch(modelVal, val => {
	if (val) setConfig(val)
})

// 图表组-渲染组件
const { BtECharts, getEChart, setOption } = useECharts({
	// 图表配置
	options: {
		xAxis: {
			type: 'category',
			boundaryGap: false,

			data: [],
		},
		yAxis: {
			boundaryGap: [0, '50%'],
			type: 'value',
		},
		series: [],
	},
})

/**
 * @description 设置配置
 * @param config
 */
const setConfig = async (config: any) => {
	setOption(getDefaultOption(config))
	echartRef.value = await getEChart()
	echartRef.value?.resize()
}

/**
 * @description 获取默认配置
 */
const getDefaultOption = (data: any = {}) => {
	const option: any = {
		grid: {
			right: '5%',
			bottom: '6%',
			top: '6%',
			// containLabel: true, // 是否包含标签
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'cross',
			},
			formatter: data.formatter,
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: data.tData,
			axisLine: {
				lineStyle: {
					color: isDark.value ? '#888' : '#cccccc',
				},
			},
		},
		yAxis: {
			type: 'value',
			// name: data.unit,
			boundaryGap: [0, '100%'],
			splitNumber: data.splitNumber,
			min: 0,
			...(modelVal.value?.type === 'iostat'
				? {
						axisLabel: {
							formatter: (value: number, index: number) => {
								return getByteUnit(value, false, 0)
							},
							color: '#666',
						},
				  }
				: {}),
			splitLine: {
				lineStyle: {
					color: isDark.value ? '#888' : '#cccccc',
					type: 'dashed',
				},
			},
			axisLine: {
				lineStyle: {
					color: isDark.value ? '#888' : '#cccccc',
				},
			},
		},
		series: [],
	}

	const { legend, dataZoom, list } = data
	if (legend) option.legend = legend
	if (dataZoom) option.dataZoom = dataZoom

	list.forEach((item: any) => {
		const series = {
			name: item.name,
			data: item.data,
			type: item.type || 'line',
			smooth: item.smooth || true,
			symbol: 'circle', // 样式
			symbolSize: 6, // 大小
			showSymbol: true, // 是否显示
			emphasis: {
				symbolSize: 8,
			},
			sampling: item.sampling || 'average',
			areaStyle: item.areaStyle || {},
			lineStyle: {
				...(item.lineStyle || {}),
			},
			itemStyle: {
				...(item.itemStyle || {}),
				borderColor: '#fff',
				borderWidth: '1px',
			},
		}
		option.series.push(series)
	})

	return option
}

defineExpose({
	echartRef,
	setConfig,
})
</script>

<style lang="css" scoped>
.el-col .label {
	color: var(--el-base-tertiary);
}
.monitor-chart {
	height: 38rem;
}
@media screen and (max-width: 1200px) {
	.monitor-chart {
		height: 38rem;
	}
}
@media screen and (max-width: 1520px) {
	.monitor-chart {
		height: 38rem;
	}
}
</style>
