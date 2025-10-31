<template>
	<div class="flex flex-col !h-full" v-bt-loading="loading" v-bt-loading:title="'正在获取监控数据，请稍候...'">
		<div class="card">
			<div class="title">基础信息</div>
			<div class="con flex items-center">
				<div class="p-[1.5rem] text-small font-bold">
					内存限额：<span class="text-[#919191]">{{ cont_chart.limit }}</span>
				</div>
				<div class="p-[1.5rem] text-small font-bold">
					流量情况：<span class="text-[#919191]"> 上行：{{ cont_chart.top_limit }} - 下行：{{ cont_chart.bottom_limit }} </span>
				</div>
			</div>
		</div>
		<div class="chartCon flex flex-wrap w-full justify-between">
			<div class="flex w-[49%]">
				<div class="card w-full flex-1 mb-[1rem]">
					<div class="title">CPU</div>
					<div class="chart w-full h-[19rem]"><bt-echart ref="CPURef" :options="cpuData"></bt-echart></div>
				</div>
			</div>
			<div class="flex w-[49%]">
				<div class="card w-full flex-1 mb-[1rem]">
					<div class="title">内存</div>
					<div class="chart w-full h-[19rem]"><bt-echart ref="memRef" :options="memData"></bt-echart></div>
				</div>
			</div>
			<div class="flex w-[49%]">
				<div class="card w-full flex-1 mb-[1rem]">
					<div class="title">磁盘IO</div>
					<div class="chart w-full h-[19rem]"><bt-echart ref="diskRef" :options="diskData"></bt-echart></div>
				</div>
			</div>
			<div class="flex w-[49%]">
				<div class="card w-full flex-1 mb-[1rem]">
					<div class="title">网络IO</div>
					<div class="chart w-full h-[19rem]"><bt-echart ref="netRef" :options="netData"></bt-echart></div>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup lang="ts">
import { getByteUnit, formatTime } from '@utils/index'
// import { echarts } from '@hooks/tools/echarts';
import { getContainerControl } from '@/api/docker'
import { useDataHandle } from '@hooks/tools/data'

interface Props {
	compData?: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const CPURef = ref()
const memRef = ref()
const diskRef = ref()
const netRef = ref()

const loading = ref(false)
const cont_setInterval = ref() // 定时器

const cont_chart = reactive<any>({
	//容器图表数据
	cpu_list: [],
	mem_list: { usage: [], cache: [] },
	disk_list: { read: [], write: [] },
	network_list: { tx: [], rx: [] },
	time_list: [],
	limit: '', //内存限额
	top_limit: '', //上行流量
	bottom_limit: '', //下行流量
})

/**
 * @description 容器监控【获取并整理实时数据，刷新图表】
 * @param {Object} row 容器信息
 */
const transform_cont_chart_data = async (row: any) => {
	const _time = new Date().getTime()
	const params = JSON.stringify({ id: row.id, dk_status: row.status })

	const res: any = await useDataHandle({
		request: getContainerControl({ data: params }),
	})

	const _data = res.data
	if (!res.status) return false
	//基础信息
	cont_chart.limit = getByteUnit(_data.limit)
	cont_chart.top_limit = getByteUnit(_data.tx_total)
	cont_chart.bottom_limit = getByteUnit(_data.rx_total)
	cont_chart.time_list.push(_time)
	cont_chart.mem_list['usage'].push([_time, getByteUnit(_data.usage, false, null, 'MB')])
	cont_chart.mem_list['cache'].push([_time, getByteUnit(_data.cache, false, null, 'MB')])
	cont_chart.cpu_list.push([_time, _data.cpu_usage])
	cont_chart.disk_list['read'].push([_time, getByteUnit(_data.read_total, false, null, 'MB')])
	cont_chart.disk_list['write'].push([_time, getByteUnit(_data.write_total, false, null, 'MB')])
	cont_chart.network_list['tx'].push([_time, getByteUnit(_data.tx, false, null, 'KB')])
	cont_chart.network_list['rx'].push([_time, getByteUnit(_data.rx, false, null, 'KB')])
	const cpuOptions = transform_cont_chart_option('cpu')
	const memOptions = transform_cont_chart_option('mem')
	const diskOptions = transform_cont_chart_option('disk')
	const netOptions = transform_cont_chart_option('network')
	cpuOptions.xAxis.data = cont_chart.time_list
	cpuOptions.series[0].data = cont_chart.cpu_list
	memOptions.series[0].data = cont_chart.mem_list['usage']
	memOptions.series[1].data = cont_chart.mem_list['cache']
	diskOptions.series[0].data = cont_chart.disk_list['read']
	diskOptions.series[1].data = cont_chart.disk_list['write']
	netOptions.series[0].data = cont_chart.network_list['tx']
	netOptions.series[1].data = cont_chart.network_list['rx']
	//实时更新图表数据
	cpuData.value = cpuOptions
	memData.value = memOptions
	diskData.value = diskOptions
	netData.value = netOptions
	// CPURef.value && CPURef.value.onSetOption(cpuOptions)
	// memRef.value && memRef.value.onSetOption(memOptions)
	// diskRef.value && diskRef.value.onSetOption(diskOptions)
	// netRef.value && netRef.value.onSetOption(netOptions)
	loading.value = false
}
/**
 * @description 容器监控【图表配置处理】
 * @param {String} type 图表类型【CPU/内存/磁盘/网络】
 * @return 返回处理好的图表配置
 */
const transform_cont_chart_option = (type: any) => {
	let _unit = '/MB'
	let _option = get_default_option()
	switch (type) {
		case 'cpu':
			_option.tooltip.formatter = function (config: any) {
				const data = config[0]
				return formatTime(data.data[0]) + '<br>' + data.seriesName + ': ' + data.data[1] + '%'
			}
			_option.yAxis.min = 0
			_option.series = [
				{
					name: 'CPU',
					type: 'line',
					symbol: 'none',
					smooth: true,
					itemStyle: { normal: { color: 'rgb(0, 153, 238)' } },
				},
			]
			break
		case 'network':
			_unit = '/KB'
		case 'mem':
		case 'disk':
			var third = {
				mem: ['内存', '缓存'],
				disk: ['读取', '写入'],
				network: ['上行', '下行'],
				color: [
					{
						mem: ['rgb(185, 220, 253)', 'rgb(185, 220, 253,0.6)', 'rgb(185, 220, 253,0.3)', 'rgba(229,147,187)', 'rgba(229,147,187,0.6)', 'rgba(229,147,187,0.3)'],
						disk: ['rgb(255, 70, 131)', 'rgb(255, 70, 131,0.6)', 'rgb(255, 70, 131,0.3)', 'rgba(46, 165, 186)', 'rgba(46, 165, 186,0.6)', 'rgba(46, 165, 186,0.3)'],
						network: ['rgb(255, 140, 0)', 'rgb(255, 140, 0,0.6)', 'rgb(255, 140, 0,0.3)', 'rgb(30, 144, 255)', 'rgb(30, 144, 255,0.6)', 'rgb(30, 144, 255,0.3)'],
					},
				],
			}
			_option.tooltip.formatter = function (config: any) {
				const data = config[0]
				const time = data.data[0]
				const date = formatTime(time / 1000)
				let _tips = ''
				const _style = '<span style="display: inline-block; width: 10px; height: 10px; margin-rigth:10px; border-radius: 50%; background: '
				for (var i = 0; i < config.length; i++) {
					_tips += _style + config[i].color + ';"></span>  ' + config[i].seriesName + '：'
					_tips += config[i].data[1] + _unit + (config.length - 1 !== i ? '<br />' : '')
				}
				return '时间：' + date + '<br />' + _tips
			}
			_option.legend = { top: '18px', data: third[type] }
			_option.series = [
				{
					name: third[type][0],
					type: 'line',
					symbol: 'none',
					itemStyle: {
						normal: {
							color: third['color'][0][type][0],
							areaStyle: {
								// color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
								// 	{ offset: 0, color: third['color'][0][type][1] },
								// 	{ offset: 1, color: third['color'][0][type][2] },
								// ]),
							},
						},
					},
				},
				{
					name: third[type][1],
					type: 'line',
					symbol: 'none',
					itemStyle: {
						normal: {
							color: third['color'][0][type][4],
							areaStyle: {
								// color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
								// 	{ offset: 0, color: third['color'][0][type][4] },
								// 	{ offset: 1, color: third['color'][0][type][5] },
								// ]),
							},
						},
					},
				},
			]
			break
	}
	return _option
}
/**
 * @description 渲染容器监控图表
 * @param {Object} row 容器信息
 */
const render_cont_chart = (row: any) => {
	nextTick(() => {
		cpuData.value = transform_cont_chart_option('cpu')
		memData.value = transform_cont_chart_option('mem')
		diskData.value = transform_cont_chart_option('disk')
		netData.value = transform_cont_chart_option('network')

		CPURef.value.chart.resize()
		memRef.value.chart.resize()
		diskRef.value.chart.resize()
		netRef.value.chart.resize()
		// CPURef.value.onSetOption(transform_cont_chart_option('cpu'))
		// memRef.value.onSetOption(transform_cont_chart_option('mem'))
		// diskRef.value.onSetOption(transform_cont_chart_option('disk'))
		// netRef.value.onSetOption(transform_cont_chart_option('network'))

		transform_cont_chart_data(row) //默认加载数据
	})
}
/**
 * @description 获取默认图表配置
 * @return 返回默认图表配置
 */
const get_default_option = () => {
	return {
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'cross' },
		},
		grid: {
			x: 50, //左
			y: 50, //上
			x2: 30, //右
			y2: 30, //下
		},
		xAxis: {
			type: 'time',
			scale: true,
			splitNumber: 2, // x轴分割数,越小x轴坐标间隔越大
			boundaryGap: true,
			axisLine: { lineStyle: { color: '#666' } },
			axisLabel: { formatter: value => formatTime(value / 1000, 'hh:mm:ss') },
		},
		yAxis: {
			type: 'value',
			boundaryGap: [0, '100%'],
			splitLine: { lineStyle: { color: '#ddd' } },
			axisLine: { lineStyle: { color: '#666' } },
		},
	}
}
const activeTab = inject<any>('tabActive')

watch(
	() => activeTab.value,
	() => {
		if (activeTab.value !== 'monitor') {
			cont_setInterval.value && clearInterval(cont_setInterval.value)
			cont_setInterval.value = null
		} else {
		}
	}
)

const cpuData = ref(transform_cont_chart_option('cpu'))
const memData = ref(transform_cont_chart_option('mem'))
const diskData = ref(transform_cont_chart_option('disk'))
const netData = ref(transform_cont_chart_option('network'))

onMounted(() => {
	loading.value = true
	render_cont_chart(props.compData.row)
	cont_setInterval.value = setInterval(function () {
		transform_cont_chart_data(props.compData.row)
	}, 3000) //默认三秒获取一次数据
	// CPURef.value?.resize()
	// memRef.value?.resize()
	// diskRef.value?.resize()
	// netRef.value?.resize()
})

onBeforeUnmount(() => {
	clearInterval(cont_setInterval.value)
})
</script>
<style lang="css" scoped>
.card {
	@apply mb-[1rem] border-[1px] border-lighter rounded-base text-small text-default;
}
.card .title {
	@apply border-b-[1px] border-lighter p-[1rem];
}
</style>
