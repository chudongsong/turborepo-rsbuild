import { defineStore } from 'pinia'
import { formatTime, isObject } from '@/utils'
import { getTodayData } from '@/api/mail'
import { MailStats, MailHourly } from '@mail/types'
import { ECOption } from '@mail/types'
import { Message, useDataHandle } from '@/hooks/tools'

export const MAIL_OVERVIEW = defineStore('MAIL_OVERVIEW', () => {
	const total = ref({
		delivered: 0, // 发件成功
		bounced: 0, // 发件失败
		received: 0, // 收件成功
		rejected: 0, // 收件失败
	})

	const echartRef = ref()
	const sendEchartRef = ref()

	const sendOption = shallowReactive<ECOption>({
		tooltip: {
			trigger: 'axis',
			order: 'seriesDesc',
			axisPointer: {
				type: 'shadow',
				label: {
					formatter: (params: any) => {
						return formatTime(params.value, 'HH:mm')
					},
				},
			},
		},
		legend: {
			top: 0,
			itemGap: 16,
			icon: 'circle',
			itemWidth: 10,
			itemHeight: 10,
			data: ['发送成功', '发送失败'],
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
			right: '3%',
			bottom: '4%',
			containLabel: true,
		},
		xAxis: {
			type: 'category',
			name: '小时',
			axisLabel: {
				formatter: (val: number) => {
					return formatTime(val, 'HH:mm')
				},
			},
		},
		yAxis: {
			type: 'value',
			minInterval: 1,
			boundaryGap: [0, '6%'],
			splitLine: {
				show: true,
				lineStyle: {
					type: 'dashed',
					width: 1,
					color: '#ebeef5',
				},
			},
		},
		series: [
			{
				type: 'bar',
				name: '发送失败',
				data: [],
			},
			{
				type: 'bar',
				name: '发送成功',
				data: [],
			},
		],
	})

	const receivedOption = shallowReactive<ECOption>({
		tooltip: {
			trigger: 'axis',
			order: 'seriesDesc',
			axisPointer: {
				type: 'shadow',
				label: {
					formatter: (params: any) => {
						return formatTime(params.value, 'HH:mm')
					},
				},
			},
		},
		legend: {
			top: 0,
			itemGap: 16,
			icon: 'circle',
			itemWidth: 10,
			itemHeight: 10,
			data: ['接收成功', '接收失败'],
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
			right: '3%',
			bottom: '4%',
			containLabel: true,
		},
		xAxis: {
			type: 'category',
			name: '小时',
			axisLabel: {
				formatter: (val: number) => {
					return formatTime(val, 'HH:mm')
				},
			},
		},
		yAxis: {
			type: 'value',
			minInterval: 1,
			boundaryGap: [0, '6%'],
			splitLine: {
				show: true,
				lineStyle: {
					type: 'dashed',
					width: 1,
					color: '#ebeef5',
				},
			},
		},
		series: [
			{
				type: 'bar',
				name: '接收失败',
				data: [],
			},
			{
				type: 'bar',
				name: '接收成功',
				data: [],
			},
		],
	})

	const sendSuccess = computed(() => {
		return total.value.delivered || 0
	})

	const sendFail = computed(() => {
		return total.value.bounced || 0
	})

	const sendSuccessRate = computed(() => {
		const sum = sendFail.value + sendSuccess.value
		if (sum === 0) {
			return 0
		}
		return ((sendSuccess.value / sum) * 100).toFixed(1)
	})

	const receiveSuccess = computed(() => {
		return total.value.received || 0
	})

	const receiveFail = computed(() => {
		return total.value.rejected || 0
	})

	const receiveSuccessRate = computed(() => {
		const sum = receiveFail.value + receiveSuccess.value
		if (sum === 0) {
			return 0
		}
		return ((receiveSuccess.value / sum) * 100).toFixed(1)
	})

	const getData = async (getEChart: any, getEChartReceived: any, setOption: any, setOptionReceived: any) => {
		useDataHandle({
			request: getTodayData(),
			loading: '数据加载中...',
			success: async ({ data }: any) => {
				if (!data.status) {
					return Message.error(data.msg)
				}
				if (isObject(data.data)) {
					total.value = data.data.stats_dict
					sendEchartRef.value = await getEChart()
					echartRef.value = await getEChartReceived()
					renderEcharts(data.data.hourly_stats)
					setOption(sendOption)
					setOptionReceived(receivedOption)
				}
			},
		})
	}

	const renderEcharts = (data: MailHourly[]) => {
		const sendFail: [string, number][] = []
		const sendSuccess: [string, number][] = []

		const receiveSuccess: [string, number][] = []
		const receiveReject: [string, number][] = []
		data.forEach(item => {
			sendFail.push([item.time as any, item.bounced])
			sendSuccess.push([item.time as any, item.delivered])

			receiveSuccess.push([item.time as any, item.received])
			receiveReject.push([item.time as any, item.rejected])
		})
		sendOption.series = [
			{
				type: 'bar',
				name: '发送失败',
				data: sendFail,
				stack: 'total',
				itemStyle: {
					color: '#1A519B',
				},
			},
			{
				type: 'bar',
				name: '发送成功',
				data: sendSuccess,
				stack: 'total',
				itemStyle: {
					color: '#91CC75',
				},
			},
		]
		receivedOption.series = [
			{
				type: 'bar',
				name: '接收失败',
				data: receiveReject,
				stack: 'total',
				itemStyle: {
					color: '#1A519B',
				},
			},
			{
				type: 'bar',
				name: '接收成功',
				data: receiveSuccess,
				stack: 'total',
				itemStyle: {
					color: '#91CC75',
				},
			},
		]
	}

	const $reset = () => {
		total.value = {
			delivered: 0, // 发件成功
			bounced: 0, // 发件失败
			received: 0, // 收件成功
			rejected: 0, // 收件失败
		}
		sendEchartRef.value = null
		echartRef.value = null
	}

	return {
		total,
		sendOption,
		receivedOption,
		sendSuccess,
		sendFail,
		sendSuccessRate,
		receiveSuccess,
		receiveFail,
		receiveSuccessRate,
		getData,
		$reset,
	}
})
