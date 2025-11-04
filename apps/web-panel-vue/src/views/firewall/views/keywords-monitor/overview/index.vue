<template>
	<div class="flex">
		<div class="w-[60%] mr-4">
			<div class="flex ml-[0.2rem] mb-[1.6rem]">
				<div v-for="(item, index) in infoPanel" :key="index" :class="'block-bg ' + (index > 0 ? 'ml-[5rem]' : '')">
					<div class="flex items-center mb-[1.2rem] text-tertiary">
						<span>{{ item.title }}</span>
					</div>
					<div :class="'font-bold text-extraLarge leading-none ' + (index !== 0 && index !== 3 && item.value > 0 ? 'text-warning' : 'text-secondary')">
						{{ item.value }}
					</div>
				</div>
			</div>
			<div class="border-1 border-lighter rounded-base p-[1.6rem]">
				<div class="card_title flex items-center text-secondary text-base mb-[1.2rem]">网站内容检测</div>
				<div v-if="siteInfo.length === 0" class="w-full h-[32rem] flex items-center justify-center">
					<el-empty description="网站内容检测为空"></el-empty>
				</div>
				<bt-table-group v-else>
					<template #content>
						<bt-table max-height="320" :column="siteInfoColumn" :data="siteInfo"></bt-table>
					</template>
				</bt-table-group>
			</div>
			<div class="border-1 border-lighter rounded-base p-[1.6rem] mt-[1.6rem]">
				<div class="card_title flex items-center text-secondary text-base mb-[1.2rem]">风险动态</div>
				<div v-if="riskInfo.length === 0" class="w-full h-[32rem] flex items-center justify-center">
					<el-empty description="风险动态为空"></el-empty>
				</div>
				<bt-table-group v-else>
					<template #content>
						<bt-table max-height="320" :column="riskInfoColumn" :data="riskInfo"></bt-table>
					</template>
				</bt-table-group>
			</div>
		</div>
		<div class="flex-1 ml-4">
			<div class="border-1 border-lighter rounded-base p-[1.6rem]">
				<div class="card_title flex items-center text-secondary text-base mb-[1.2rem]">风险历史</div>
				<div v-if="siteInfo.length" class="w-full h-[24rem]">
					<bt-echart ref="riskEchartRef" :options="getDefaultOption(siteInfo)"></bt-echart>
				</div>
				<div v-else class="w-full h-[24rem] flex items-center justify-center">
					<el-empty description="风险历史数据为空"></el-empty>
				</div>
			</div>
			<div class="border-1 border-lighter rounded-base p-[1.6rem] mt-[1.6rem]">
				<div class="card_title flex items-center text-secondary text-base mb-[1.2rem]">近7日巡检情况</div>
				<div class="w-full h-[24rem]">
					<bt-echart ref="dayRiskEchartRef" :options="getDayRiskConfig(dayRiskEchartData)"></bt-echart>
				</div>
			</div>
			<div class="border-1 border-lighter rounded-base p-[1.6rem] mt-[1.6rem]">
				<div class="card_title flex items-center text-secondary text-base mb-[1.2rem]">敏感词排行</div>
				<div v-if="!sensitiveWordEmpty" class="w-full h-[24rem]">
					<bt-echart ref="sensitiveWordEchartRef" :options="getSensitiveWordConfig(sensitiveWordEchartData)"></bt-echart>
				</div>
				<div v-else class="w-full h-[24rem] flex items-center justify-center">
					<el-empty description="敏感词排行数据为空"></el-empty>
				</div>
			</div>
		</div>
	</div>
</template>
<script lang="tsx" setup>
import type { ContentTableDataProps, RiskTableDataProps } from '@/types/firewall'
import { useDataHandle } from '@hooks/tools/data'

import { getKeywordInfo } from '@/api/firewall'
import { methodMap, openRiskDetails, riskColumn, typeMap } from '@firewall/useMethod'
import { useECharts as echarts } from '@hooks/tools'
import { checkVariable, formatTime, getDuration } from '@utils/index'

const riskEchartRef = ref() //风险历史
const dayRiskEchartRef = ref() //近7日巡检情况
const sensitiveWordEchartRef = ref() //敏感词排行

const sensitiveWordEmpty = ref(false) //敏感词排行数据为空
const allInfoData = ref<any>({}) //全部数据
const infoPanel = ref<any[]>([])
const siteInfo = ref<ContentTableDataProps[]>([]) //网站内容检测数据
const riskInfo = ref<RiskTableDataProps[]>([]) //风险动态数据

const dayRiskEchartData = ref()
const sensitiveWordEchartData = ref()

// 获取风险历史默认配置
const getDefaultOption = (data: any = {}) => {
	let times = []
	let names = []
	let counts = []
	for (var i = 0; i < data.length; i++) {
		if (i >= 5) break
		var items = data[i]
		names.push(items.site_name)
		times.push(items.end_time - items.start_time)
		counts.push(items.scans)
	}
	const option: any = {
		legend: { left: 'left', data: ['耗时', '检测页面'] },
		grid: {
			left: 45,
			top: 50,
			right: 15,
			bottom: 20,
			backgroundColor: '#888',
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'cross' },
			formatter: function (params: any) {
				return !params.length ? '' : '检测网站: ' + params[0].name + (params.length === 2 ? '</br>耗时: ' + getDuration(params[0].value) + '</br>检测页面数量: ' + params[1].value : !params[0].seriesIndex ? '</br>耗时: ' + getDuration(params[0].value) : '</br>检测页面数量: ' + params[0].value)
			},
		},
		xAxis: {
			type: 'category',
			data: names,
			scale: true,
			triggerEvent: true,
			axisLabel: {
				formatter: function (params: any) {
					if (params.length > 6) return params.substr(0, 6) + '...'
					return params
				},
			},
		},
		yAxis: { type: 'value' },
		series: [
			{
				type: 'bar',
				name: '耗时',
				barWidth: 24,
				data: times,
				itemStyle: { color: '#fcc858' },
			},
			{
				type: 'bar',
				name: '检测页面',
				barWidth: 24,
				data: counts,
				itemStyle: { color: '#8dcf6e' },
			},
		],
	}
	return option
}

// 获取近7日巡检情况默认配置
const getDayRiskConfig = (data: any = {}) => {
	let days = Object.keys(data)
		?.map((item: any) => item)
		.sort((a, b) => (new Date(a).getTime() < new Date(b).getTime() ? -1 : 1))
	let counts = Object.values(data)?.map((item: any) => item)

	const option: any = {
		grid: {
			left: 45,
			right: 15,
			top: 50,
			bottom: 20,
			backgroundColor: '#888',
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'cross' },
			formatter: function (params: any) {
				var value = params[0].name + '</br>' + '风险次数: ' + Number(params[0].value || 0)
				return value
			},
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: days,
			axisLabel: {
				fontSize: 10,
				color: '#666',
				formatter: (value: any) => formatTime(new Date(value).getTime() / 1000, 'MM-dd'),
			},
		},
		axisLabel: { fontSize: 10, color: '#666' },
		axisLine: { show: false },
		axisTick: { show: false },
		yAxis: {
			type: 'value',
			splitNumber: 5,
			name: '风险次数/次',
			min: 0,
			axisLine: { show: false },
			axisTick: { show: false },
			axisLabel: { fontSize: 10, color: '#666' },
		},
		series: [
			{
				type: 'line',
				smooth: 0.6,
				data: counts,
				areaStyle: {
					normal: {
						// color: new echarts.graphic.LinearGradient(
						//   0,
						//   0,
						//   0,
						//   1,
						//   [
						//     { offset: 0, color: '#FF9E9E' },
						//     { offset: 1, color: '#FFF6F6' },
						//   ],
						//   false
						// ),
					},
				},
				itemStyle: {
					normal: {
						color: '#FF8585', // 改变折线点的颜色
						lineStyle: { color: '#FF8585', type: 'solid' },
					},
				},
			},
		],
	}
	return option
}

// 获取敏感词排行默认配置
const getSensitiveWordConfig = (data: any = {}) => {
	var words = []
	var counts = []
	for (var i = 0; i < data.length; i++) {
		if (i >= 6) break
		var item = data[i]
		words.push(item.words)
		counts.push(item.count)
	}
	const option: any = {
		grid: {
			top: 10,
			left: 60,
			right: 15,
			bottom: 20,
			backgroundColor: '#888',
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'cross',
			},
			formatter: (params: any) => '敏感词: ' + params[0].name + '</br>' + '次数: ' + params[0].value,
		},
		xAxis: { type: 'value' },
		yAxis: {
			type: 'category',
			data: words,
			scale: true,
			triggerEvent: true,
			axisLabel: {
				formatter: function (params: any) {
					var val = ''
					if (params.length > 4) {
						val = params.substr(0, 4) + '...'
						return val
					} else {
						return params
					}
				},
			},
		},
		series: [
			{
				type: 'bar',
				data: counts,
				barWidth: 20,
				itemStyle: {
					color: function (params: any) {
						var colorList = ['#ffa688', '#ffc87d', '#98caa5', '#acce9b', '#cad48f']
						return colorList[params.dataIndex]
					},
				},
			},
		],
	}
	return option
}

/**
 * @description 获取概览数据
 */
const init = async () => {
	const res: any = await useDataHandle({
		loading: '正在获取数据，请稍后...',
		request: getKeywordInfo(),
	})
	allInfoData.value = res.data
	siteInfo.value = checkVariable(res?.data?.site_info, 'array', []) as ContentTableDataProps[] // 网站内容检测数据
	riskInfo.value = checkVariable(res?.data?.risk_info, 'array', []) as RiskTableDataProps[] // 风险动态数据
	infoPanel.value = [
		{ title: '监控网站', value: allInfoData.value.site_count },
		{ title: '总风险次数', value: allInfoData.value.risk_count },
		{ title: '今日风险次数', value: allInfoData.value.day_risk },
		{ title: '今日巡检次数', value: allInfoData.value.today_count },
	]
	nextTick(() => {
		dayRiskEchartData.value = res?.data['7day_risk']
		// riskEchartRef.value?.onSetOption(getDefaultOption(siteInfo.value)); // 风险历史
		// dayRiskEchartRef.value?.onSetOption(
		//   getDayRiskConfig(res?.data['7day_risk'])
		// ); // 近7日巡检情况
		sensitiveWordEmpty.value = !res?.data?.sensitive_word.length
		sensitiveWordEchartData.value = res?.data?.sensitive_word
		// sensitiveWordEchartRef.value?.onSetOption(
		//   getSensitiveWordConfig(res?.data?.sensitive_word)
		// ); // 敏感词排行
	})
}

// 网站内容检测配置
const siteInfoColumn = [
	{
		label: '巡检时间',
		prop: 'time',
		render: (row: any) => {
			const time = checkVariable(row.time, 'number', 0)
			return <span>{formatTime(time)}</span>
		},
	},
	{ label: '检测域名', prop: 'site_name' },
	{
		label: '检测方式',
		prop: 'method',
		render: (row: any) => methodMap[row.method],
	},
	{ label: '检测页面数', prop: 'scans' },
	{
		label: '巡检结果',
		render: (row: any) => {
			return [
				row.risks === 0 ? (
					<span class="text-primary">无风险 </span>
				) : (
					<span class="bt-link !text-danger" onClick={() => openRiskDetails(row)}>
						{row.risks}
					</span>
				),
			]
		},
	},
]

const riskInfoColumn = riskColumn() // 风险动态配置

onMounted(init)
</script>
<style lang="scss">
.card_title::before {
	content: '';
	display: inline-block;
	width: 0.4rem;
	height: 1.6rem;
	margin-right: 0.6rem;
	background-color: var(--el-color-primary);
	border-radius: var(--el-border-radius-small);
}

.block-bg {
	display: flex;
	box-shadow: 0px 0px 6px 0rem #00000020;
	flex: 1;
	flex-direction: column;
	padding-top: 2.2rem;
	padding-bottom: 2.2rem;
	margin-top: 0.5rem;
	margin-bottom: 0.5rem;
	align-items: center;
	border-radius: var(--el-border-radius-base);
	justify-content: center;
	background-position: center;
	background-size: 4rem;
	background-position-x: 8.6em;
	background-repeat: no-repeat;
	background-image: url('/static/images/firewall/overview-bg.svg');
}
</style>
