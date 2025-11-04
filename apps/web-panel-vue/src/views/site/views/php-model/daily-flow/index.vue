<!--  -->
<template>
	<div class="p-[2rem]">
		<div class="flex items-center justify-between mb-[8px]">
			<el-select v-model="selectTime" @change="handleChangeTime" class="!w-[10rem]"><el-option v-for="(item, index) in timeOptions" :key="index" :label="item.title" :value="item.key"></el-option> </el-select>
			<el-radio-group v-model="flowType" @change="handleChangeType">
				<el-radio-button label="流量趋势"></el-radio-button>
				<el-radio-button label="IP TOP 10"></el-radio-button>
			</el-radio-group>
			<bt-link @click="openLimit" v-if="!isRelease && !isTotal">流量限额>></bt-link>
		</div>
		<div>
			<BtECharts v-if="flowType === '流量趋势'" ref="totalCharts" class="h-[32rem]" />
			<!-- <div id="charts" ref="totalCharts" class="h-[32rem]"></div> -->
			<div v-if="flowType === 'IP TOP 10'">
				<bt-table :column="tableColumn" :data="tableData"></bt-table>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { removeIpRules, createIpRules, getIpFlowTrend, getIpFlowsAreasInfo } from '@/api/site'
import { useECharts } from '@/hooks/tools'
import { getByteUnit, isRelease } from '@/utils'
import { openSettingView } from '@site/views/php-model/useController'

interface Props {
	compData?: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const { proxy: vm }: any = getCurrentInstance() // 获取vue实例对象
const isTotal = ref<any>(props.compData?.project_config?.type === 'PHPMOD')
const totalCharts = ref()
const selectTime = ref('today')
const tableColumn = reactive([
	{
		label: 'IP地址',
		prop: 'ip',
		render: (row: any) => {
			return h(
				'span',
				{
					class: row.deny_status ? 'line-through text-disabled cursor-pointer' : 'text-primary cursor-pointer',
					on: {
						click: async () => {
							try {
								await vm.$confirm({
									title: 'IP地址',
									message: `确定要${!row.deny_status ? '封禁' : '解封'}当前ip吗？`,
									icon: 'warning',
								})
								let res: any = null
								if (!row.deny_status) {
									let params = {
										choose: 'address',
										address: row.ip,
										domain: '',
										types: 'drop',
										brief: '网站流量点击IP手动封禁',
									}
									res = await createIpRules({ data: JSON.stringify(params) })
								} else {
									res = await removeIpRules({ data: JSON.stringify({ address: row.ip }) })
								}
								vm.$message.request(res)
								getIpData()
							} catch (error) {
								console.log(error)
							}
						},
					},
				},
				row.ip
			)
		},
	},
	{
		label: '归属地',
		render: (row: any) => {
			return h('div', { class: 'flex', style: { gap: '4px' } }, [h('span', row.country), h('span', row.province), h('span', row.city)])
		},
	},
	{
		label: '造成流量',
		prop: 'flow',
		render: (row: any) => {
			return h('span', getByteUnit(row.flow))
		},
	},
])
const timeOptions = ref([
	{
		title: '今天',
		key: 'today',
	},
	{
		title: '昨天',
		key: 'yesterday',
	},
	{
		title: '近7天',
		key: 'l7',
	},
	{
		title: '近30天',
		key: 'l30',
	},
	{
		title: '近1小时',
		key: 'h1',
	},
])

const tableData = ref([])
const flowType = ref('流量趋势')

const { BtECharts, getEChart, setOption, setQuickOption } = useECharts({
	options: {
		xAxis: {
			type: 'category',
			data: [],
		},
		yAxis: {
			type: 'value',
			name: '单位:字节',
			axisLabel: {
				margin: 2,
				formatter: function (value: any, index: any) {
					if (value >= 10000 && value < 10000000) {
						value = value / 10000 + '万'
					} else if (value >= 10000000) {
						value = value / 10000000 + '千万'
					}
					return value
				},
			},
		},
		grid: {
			show: false,
			bottom: '20%',
			right: '5%',
		},
		series: [
			{
				data: [],
				type: 'line',
			},
		],
	},
})

/**
 * @description 获取echarts数据
 */
const getEcharts = async () => {
	let xData: any = []
	let yData: any = [0, 0, 0, 0, 0, 0, 0]
	let is_today = false // 是否为今天
	try {
		const res: any = await getIpFlowTrend({
			site_name: props.compData.name,
			query_date: selectTime.value,
		})
		if (res) yData = []
		res.forEach((item: any) => {
			if (selectTime.value == 'h1' || selectTime.value == 'today' || selectTime.value == 'yesterday') {
				is_today = true
			}
			xData.push(formatDateTime(String(item.time), is_today))
			yData.push(item.flow)
		})
	} catch (error) {
		console.log(error)
	}
	setQuickOption(xData, yData)
	// let chartDom = vm.$refs.totalCharts as HTMLElement
	// let myChart = echarts.init(chartDom)
	// let option: any = {
	// 	xAxis: {
	// 		type: 'category',
	// 		data: xData,
	// 	},
	// 	yAxis: {
	// 		type: 'value',
	// 		name: '单位:字节',
	// 		axisLabel: {
	// 			margin: 2,
	// 			formatter: function (value: any, index: any) {
	// 				if (value >= 10000 && value < 10000000) {
	// 					value = value / 10000 + '万'
	// 				} else if (value >= 10000000) {
	// 					value = value / 10000000 + '千万'
	// 				}
	// 				return value
	// 			},
	// 		},
	// 	},
	// 	grid: {
	// 		show: false,
	// 		bottom: '20%',
	// 		right: '5%',
	// 	},
	// 	series: [
	// 		{
	// 			data: yData,
	// 			type: 'line',
	// 		},
	// 	],
	// }
	// option && myChart?.setOption(option)
}

const getIpData = async () => {
	try {
		const res: any = await getIpFlowsAreasInfo({
			site_name: props.compData.name,
			query_date: selectTime.value,
		})
		console.log(res)
		tableData.value = res
	} catch (error) {
		console.log(error)
	}
}

const handleChangeType = (val: string) => {
	flowType.value = val
	if (val === '流量趋势') {
		getEcharts()
	} else {
		getIpData()
	}
}

const handleChangeTime = (val: string) => {
	selectTime.value = val
	if (flowType.value === '流量趋势') {
		getEcharts()
	} else {
		getIpData()
	}
}

/**
 * @description 打开流量限额
 */
const openLimit = () => {
	openSettingView({ ...props.compData, tabName: 'flowQuota' }, 'limit')
}

/**
 * @description 格式化时间 202310111409类格式专用
 */
const formatDateTime = (dateTime: any, is_today: any) => {
	let formattedDateTime = ''
	if (is_today) {
		formattedDateTime = dateTime.substring(8, 10) + ':' + (dateTime.length === 12 ? dateTime.substring(10, 12) : '00')
		return formattedDateTime
	}
	if (dateTime.length === 12 || dateTime.length === 10) {
		// 格式：xxxx-xx-xx xx:xx
		formattedDateTime = dateTime.substring(0, 4) + '-' + dateTime.substring(4, 6) + '-' + dateTime.substring(6, 8) + ' ' + dateTime.substring(8, 10) + ':' + (dateTime.length === 12 ? dateTime.substring(10, 12) : '00')
	} else if (dateTime.length === 8) {
		// 格式：xxxx-xx-xx
		formattedDateTime = dateTime.substring(0, 4) + '-' + dateTime.substring(4, 6) + '-' + dateTime.substring(6, 8)
	}
	return formattedDateTime
}

onMounted(() => {
	getEcharts()
})
</script>
