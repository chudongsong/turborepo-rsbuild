import { GetDiskInfo, GetInfo, GetLoadInfo, GetNetworkInfo, SetControlInfo } from '@/api/control'
import { useConfirm, useDataHandle, useMessage } from '@/hooks/tools'
import { CpuProps, DiskProps, LoadProps, MemProps, NetworkProps, TimeProps } from '../../types'
import { deepClone, formatTime, getByteUnit, isNumber } from '@/utils'
import { cond, equals as Equals } from 'ramda'

const Message = useMessage()

export const diskUnitType = ref<string>('KB/s') // 磁盘单位
export const networkUnitType = ref<string>('KB/s') // 网络单位
export const networkIoKey = ref<string>('all') // 网络io 选项
export const days = ref<number>(7) // 天数

export const controlValue = ref(false) // 开关
export const dayAll = ref(0) // 保存天数
export const logsSize = ref(0) // 日志大小

const publicData = shallowReactive({
	// 公共数据
	day: 0,
	echartsId: '',
	echartsParams: {},
	echartsOption: {},
	topData: {},
})

export const cpu = reactive<any>({
	title: 'CPU',
	active: false,
	unitVisible: false, // echarts单位显示
	...deepClone(publicData),
}) // cpu

export const mem = reactive<any>({
	title: '内存',
	active: false,
	unitVisible: false, // echarts单位显示
	...deepClone(publicData),
}) // 内存

export const disk = reactive<any>({
	title: '磁盘IO',
	active: false,
	unitVisible: true, // echarts单位显示
	...deepClone(publicData),
}) // 磁盘

export const network = reactive<any>({
	title: '网络IO：',
	active: true,
	unitVisible: true, // echarts单位显示
	selectVal: '',
	selectList: [{ label: '全部', value: 'all' }],
	...deepClone(publicData),
}) // 网络IO

export const load = reactive<any>({
	title: '平均负载',
	active: false,
	unitVisible: false, // echarts单位显示
	...deepClone(publicData),
}) // 平均负载

export const cpuAndMemData = ref<any>([]) // cpu、内存数据

/**
 * @description	公共配置
 */
const publicConfig = {
	axisLine: { lineStyle: { color: '#666' } },
	splitLine: { lineStyle: { color: '#ddd' } },
	axisLabel: { formatter: (value: number) => formatTime_up(value / 1000) },
	nameTextStyle: { color: '#666', fontSize: 12, align: 'left' },
	series: { type: 'line', smooth: true, symbol: 'circle', showSymbol: false },
	table: [
		{ title: 'PID', width: '50px', index: 1 },
		{ title: '进程名', index: 2 },
		{ title: 'CPU占用', index: 0, unit: '%' },
		{ title: '启动用户', index: 4 },
		{ title: 'cmd', index: 3, width: '160px', custom: true },
	],
}

/**
 * @description 秒数时间戳获取格式化时间
 * @param time 时间戳
 */
const formatTime_up = (timestamp: number) => {
	const date = new Date(timestamp * 1000)
	const month = date.getMonth() + 1
	const day = date.getDate()
	const hours = date.getHours()
	const minutes = date.getMinutes()
	return `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}\n${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

/**
 * @description 获取cpu、内存信息
 * @param start 开始时间
 * @param end 结束时间
 */
const getCpuAndMenData = async (start: any, end: any) => {
	await useDataHandle({
		request: GetInfo({ start, end }),
		data: [Array, cpuAndMemData],
	})
}

/**
 * @description 取监控状态
 */
export const GetStatus = async () => {
	useDataHandle({
		request: SetControlInfo({ type: '-1' }),
		data: {
			status: [Boolean, controlValue],
			day: [Number, (day: number) => ((dayAll.value = day), (days.value = day))],
			size: [Number, logsSize],
		},
	})
}

/**
 * @description 设置监控状态
 */
export const SetControl = async (isSwitch?: boolean) => {
	let day = dayAll.value
	let type = controlValue.value ? '1' : '0'
	if (day < 1) {
		if (isSwitch === true) controlValue.value = !controlValue.value
		return Message.error('保存天数不合法')
	}
	if (!/^-?\d+$/.test(day + '')) return Message.error('保存天数必须为整数')

	await useDataHandle({
		loading: '正在设置监控状态，请稍后...',
		request: SetControlInfo({ type: type, day: day }),
		message: true,
		success: async (res: any) => {
			await initAllData()
			if (res.status) days.value = day
		},
	})
}

/**
 * @description 获取默认echart配置
 * @param startTime 开始时间
 * @param endTime 结束时间
 */
const getDefaultOption = ({ startTime, endTime }: TimeProps) => {
	var interval = ((endTime - startTime) / 3) * 1000
	return {
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'line' },
			enterable: true,
			position: function (pos: any, params: any, dom: any, rect: any, size: any) {
				let left = 0
				let top = 0
				let pointX = window.__LAST_VIEWPORT_MOUSE__?.x || 0 // 鼠标x坐标  基于屏幕
				let pointY = window.__LAST_VIEWPORT_MOUSE__?.y || 0 // 鼠标y坐标  基于屏幕
				const chartX = pointX - pos[0] // 图表x坐标  基于屏幕
				const chartY = pointY - pos[1] // 图表y坐标  基于屏幕
				const tooltipWidth = size.contentSize[0] || 0 // tooltip宽度
				const tooltipHeight = size.contentSize[1] || 0 // tooltip高度
				left = pos[0] - tooltipWidth - 20 // 鼠标x坐标(基于图表) - 图表宽度 - 20
				top = pos[1] - tooltipHeight - 30 // 鼠标y坐标(基于图表) - 图表高度 - 30
				// 防左溢出
				if (chartX < tooltipWidth) left = pos[0] + 20
				// 防上溢出
				if (chartY < tooltipHeight && chartY < 300) top = pos[1] + 20
				// if (chartY < tooltipHeight) top = 10 - chartY
				// 防右溢出
				if (pointX + tooltipWidth + 20 > window.innerWidth) left = pos[0] - tooltipWidth - 20
				return [left, top]
			},
		},
		grid: { bottom: 80 },
		xAxis: {
			type: 'time',
			boundaryGap: ['1%', '0%'],
			minInterval: interval,
			axisLine: publicConfig.axisLine,
			axisLabel: publicConfig.axisLabel,
		},
		yAxis: {
			type: 'value',
			boundaryGap: [0, '100%'],
			axisLine: publicConfig.axisLine,
			splitLine: publicConfig.splitLine,
		},
		// toolbox: {
		// 	feature: {
		// 		dataZoom: {
		// 			show: true,
		// 			yAxisIndex: 'none',
		// 			icon: {
		// 				zoom: 'path://M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.48-5.34C15.41 5.01 12.4 2 8.91 2S2.41 5.01 2.41 8.39 5.42 14.78 8.91 14.78c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6.59 0C6.01 14 4 11.99 4 9.39S6.01 4.78 8.91 4.78 13.82 6.79 13.82 9.39 11.81 14 8.91 14z',
		// 				back: 'path://M835.19488 606.90432l-2.12992 2.31424a30.72 30.72 0 0 0 45.2608 41.45152l274.20672-270.17216 2.49856-2.6624a51.2 51.2 0 0 0-1.88416-69.65248L872.448 21.83168l-2.31424-2.12992a30.72 30.72 0 0 0-41.12384 1.69984l-2.12992 2.31424a30.72 30.72 0 0 0 1.69984 41.12384l231.64928 236.25728H389.87776C177.37728 301.11744 4.17792 461.0048 4.17792 659.51744c0 196.32128 169.3696 354.85696 378.63424 358.35904l7.0656 0.06144h576.2048a30.72 30.72 0 0 0 2.9696-61.29664l-2.9696-0.14336H389.87776c-179.6096 0-324.25984-133.5296-324.25984-296.96 0-161.3824 141.04576-293.62176 317.5424-296.89856l6.71744-0.06144 693.32992-0.02048-248.0128 244.36736z',
		// 			},
		// 		},
		// 	},
		// },
		brush: {
			xAxisIndex: [0, 1],
			brushType: 'lineX',
			brushMode: 'single',
			throttleType: 'debounce',
			throttleDelay: 1000,
			// 不显示工具条按钮，纯靠全局光标激活
			toolbox: [],
		},
		dataZoom: [
			{ type: 'inside', start: 0, end: 100, zoomLock: true },
			{
				bottom: 10,
				start: 0,
				end: 100,
				handleIcon: 'path://M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
				handleSize: '80%',
				handleStyle: {
					color: '#fff',
					shadowBlur: 3,
					shadowColor: 'rgba(var(--el-color-black-rgb), 0.6)',
					shadowOffsetX: 2,
					shadowOffsetY: 2,
				},
			},
		],
		series: [{}],
	}
}

// 统计图图例定位
const echartsPositon = (refs: any, config: any) => {
	let boxWidth = config.size.contentSize[0],
		boxHeight = config.size.contentSize[1],
		winWidth = window.innerWidth,
		winHeight = window.innerHeight,
		_box = document.getElementById(refs)?.getBoundingClientRect(),
		_x = config.pos[0] + _box?.left,
		_y = config.pos[1] + _box?.top,
		_top = 0,
		_left = 0
	if (_x + boxWidth + 80 < winWidth) {
		_left = config.pos[0] + 20
	} else {
		_left = config.pos[0] - boxWidth - 20
	}

	if (_y + boxHeight + 80 < winHeight) {
		_top = config.pos[1] + 20
	} else {
		_top = config.pos[1] - boxHeight - 20
	}
	if (_y - boxHeight < 0) _top = 0 - (_box?.top || 0) + 10
	return [_left, _top]
}

/**
 * @description 设置公共配置
 * @param option 配置
 * @param echartsId echartsId
 */
const setPublicOptions = (option: any, echartsId?: string) => {
	option.tooltip.padding = 0
	option.tooltip.backgroundColor = 'rgba(255,255,255,0.95)'
	option.tooltip.borderColor = 'var(--el-color-border-dark-tertiaryer)'
	// option.tooltip.appendToBody = true
	if (echartsId) {
		option.tooltip.position = function (pos: any, params: any, dom: any, rect: any, size: any) {
			return echartsPositon(echartsId, { pos: pos, size: size })
		}
	}
}

/**
 * @description 生成获取cpu图表配置
 * @param {CpuProps} data cpu数据
 */
const getCpuOption = ({ startTime, endTime, yData, topData }: CpuProps) => {
	let option = reactive<any>(getDefaultOption({ startTime, endTime }))
	option.tooltip.formatter = function (config: any) {
		let legendList = ''
		for (var i = 0; i < config.length; i++) {
			const item = config[i]
			legendList += `
				<div class="select-data">
					<span class="status" style="background-color: ${item.color}"></span>
					<span>${item.seriesName}：${isNumber(item.data[1]) ? item.data[1].toFixed(2) : 0}%</span>
				</div>`
		}
		return echartsFormatter({
			time: config[0].axisValueLabel,
			data: topData[config[0].axisValue],
			width: '51rem',
			legend: legendList,
		})
	}
	setPublicOptions(option)
	option.yAxis.name = '百分比'
	option.yAxis.min = 0
	option.yAxis.max = 100
	option.series = [
		{
			name: 'CPU',
			...publicConfig.series,
			itemStyle: { color: 'rgb(0, 153, 238)' },
			data: yData,
		},
	]
	return option
}

/**
 * @description 获取内存图表配置
 * @param {MemProps} data 内存数据
 */
const getMemOption = ({ startTime, endTime, zData, topData, echartsId }: MemProps) => {
	let option = reactive<any>(getDefaultOption({ startTime, endTime }))
	option.tooltip.formatter = function (config: any) {
		let legendList = ''
		for (var i = 0; i < config.length; i++) {
			var item = config[i]
			legendList += `
				<div class="select-data">
					<span class="status" style="background-color: ${item.color}"></span>
					<span>${item.seriesName}：${isNumber(item.data[1]) ? item.data[1].toFixed(2) : 0}%</span>
				</div>`
		}
		return echartsFormatter({
			time: config[0].axisValueLabel,
			data: topData[config[0].axisValue],
			width: '55rem',
			table: [
				{ title: 'PID', width: '50px', index: 1 },
				{ title: '进程名', width: '100px', index: 2 },
				{ title: '内存占用', index: 0 },
				{ title: '启动用户', index: 4 },
				{ title: 'cmd', index: 3, width: '200px' },
			],
			legend: legendList,
		})
	}
	option.tooltip.className = 'mem-tooltip'
	setPublicOptions(option, echartsId)
	option.yAxis.name = '百分比'
	option.yAxis.min = 0
	option.yAxis.max = 100
	option.series = [
		{
			name: '内存',
			...publicConfig.series,
			itemStyle: { color: 'rgb(0, 153, 238)' },
			data: zData,
		},
	]
	return option
}

/**
 * @description 生成磁盘IO图表配置
 * @param {DiskProps} data 磁盘数据
 */
const getDiskOption = ({ unit, startTime, endTime, rData, wData, zData, yData, topData, echartsId }: DiskProps) => {
	let option = reactive<any>(getDefaultOption({ startTime, endTime }))
	const unitData = unit || ''
	option.tooltip.formatter = function (config: any) {
		var legendList = ''
		for (var i = 0; i < config.length; i++) {
			var item = config[i],
				_unit = ''
			if (item.seriesName === '读写次数') _unit = '次/s'
			if (item.seriesName === '读写延迟') _unit = 'ms'
			if (item.seriesName === '读取' || item.seriesName === '写入') _unit = unitData
			legendList += '<div class="select-data">' + '<span class="status" style="background-color: ' + item.color + '"></span>' + '<span>' + item.seriesName + '：' + (isNumber(item.data[1]) ? item.data[1].toFixed(2) : 0) + ' ' + _unit + '</span>' + '</div>'
		}

		// 单位转换
		const unit = (val: any) => {
			if (typeof val !== 'number') return '--'
			return getByteUnit(val)
		}

		return echartsFormatter({
			time: config[0].axisValueLabel,
			data: topData[config[0].axisValue],
			width: '650px',
			table: [
				{ title: 'PID', width: '50px', index: 3 },
				{ title: '进程名', width: '100px', index: 4 },
				{ title: '磁盘占用', width: '70px', index: 0, unit },
				{ title: '读取', width: '70px', index: 1, unit },
				{ title: '写入', width: '70px', index: 2, unit },
				{ title: '启动用户', index: 6 },
				{ title: 'cmd', index: 5, width: '200px' },
			],
			legend: legendList,
		})
	}
	setPublicOptions(option, echartsId) // 设置公共配置
	option.legend = { top: '18px', data: ['读取', '写入', '读写次数', '读写延迟'] }
	option.series = [
		{
			name: '读取',
			...publicConfig.series,
			itemStyle: { color: 'rgb(255, 70, 131)' },
			data: rData,
		},
		{
			name: '写入',
			...publicConfig.series,
			itemStyle: { color: 'rgba(46, 165, 186, .7)' },
			data: wData,
		},
		{
			name: '读写次数',
			...publicConfig.series,
			itemStyle: { color: 'rgba(30, 144, 255)' },
			data: yData,
		},
		{
			name: '读写延迟',
			...publicConfig.series,
			itemStyle: { color: 'rgba(255, 140, 0)' },
			data: zData,
		},
	]
	return option
}

/**
 * @description: 生成网络配置
 * @param {NetworkProps} data	数据
 */
const getNetworkOption = ({ unit, startTime, endTime, yData, zData, echartsId }: NetworkProps) => {
	var option = reactive<any>(getDefaultOption({ startTime, endTime }))
	option.tooltip.formatter = function (config: any) {
		var data = config[0]
		var time = data.data[0]
		var date = formatTime(time / 1000)
		var _tips = ''
		for (var i = 0; i < config.length; i++) {
			var item = config[i]
			_tips += `
				<div class="select-data">
					<span class="status" style="background-color: ${item.color}"></span>
					<span>${item.seriesName}：${isNumber(item.data[1]) ? item.data[1].toFixed(3) : 0} ${unit}</span>
				</div>`
		}
		return echartsFormatter({
			width: '280px',
			time: config[0].axisValueLabel,
			legend: _tips,
		})
	}
	setPublicOptions(option, echartsId)
	option.legend = { top: '18px', data: ['上行', '下行'] }
	option.series = [
		{
			name: '上行',
			...publicConfig.series,
			itemStyle: { color: 'rgb(255, 70, 131)' },
			data: yData,
		},
		{
			name: '下行',
			...publicConfig.series,
			itemStyle: { color: 'rgba(46, 165, 186, .7)' },
			data: zData,
		},
	]

	return option
}

/**
 * @description 设置统计图图例
 */
const echartsFormatter = (config: any) => {
	const time = config.time,
		legend = config.legend
	let thead = '',
		tbody = '',
		colgroup = ''
	if (typeof config.data === 'undefined') config.data = []
	if (typeof config.table === 'undefined') config.table = publicConfig.table
	for (var i = 0; i < config.data.length; i++) {
		const item = config.data[i]
		if (i === 0) thead += '<tr>'
		tbody += '<tr>'
		for (var j = 0; j < config.table.length; j++) {
			const tableItem = config.table[j]
			if (i === 0) {
				thead += `<th style="width:${tableItem.width || 'auto'}">${tableItem.title}</th>`
				colgroup += `<col ${tableItem.width ? `style="width:${tableItem.width}"` : ''}>`
			}
			let value = '',
				itemVal = item[tableItem.index]
			if (typeof tableItem.unit === 'function') {
				value = tableItem.unit(itemVal)
			} else {
				value = itemVal + (tableItem.unit || '')
			}
			tbody += '<td title="' + value + '" ' + (tableItem.custom ? 'style="width:' + tableItem.width + '"' : '') + '>' + value + '</td>'
		}
		if (i === 0) thead += '</tr>'
		tbody += '</tr>'
	}

	return `<div class="echarts-tooltip" style="width:${config.width || '40rem'}">
			<div class="formatter-header">
				<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABHNCSVQICAgIfAhkiAAAAgBJREFUWIXtWN1xgzAMlkQ3YoCaYaJji8AWPjJM3AEYCasPNT3XZ2xBk17b43uCiy190b8AOHHixN8GPkpQ3/cmfrfWukfIPUyw73vjvTci8oqIJndGRBwivk3TNPwoQWYeAOC689p4hOgugsFq971KYhBRt8f9pD3IzEOOnIg4ABiJqCOibpomBIARAMbw2xd47+/BAyqoLJiznIi4pmnGmjW2rK615IuGYEbBeLvdBs3dQALTuA0yqwZqageCYBOTOxLs8zy7tm0xltW2Lc7z7Er3qv+AmSV+DzF2GJfL5R6XpZqri0mSBjMRdd8hBwDQNM0Yv3vvTel8kaCIvEbPTpMQaUdJYa11cXbHOnIoJknsCkR8KxFbluW6WoOZi64LskyqI4dNC9YsEcN7f08VLcuy2WmIyGl1qQv1VuZuCUfEqrs1UBN8hLIVT2l1JWW5llYisqfVbRJMhZfKQVo6RMTtKUklixazOMxzJjxvloO1na1hUHNhmCE/dZTOFl0clxZN0FtrVbVSW76qBNNyUCodWqSDR62vFwkGa3zGFyKaPQGeInN3zJ2LoWr86cAAByaa3JqgGTxU8yARdYlrrsx81QydaxuEryObevBQj05bi9K6uQF8xNOaSJWNT+2BX780/a+1MwUzD5rFnYiq9fEpBGM869PHiRMn/jreAZxNPtSJHlfLAAAAAElFTkSuQmCC" alt="path" />
				<span>日期：${time}</span>
			</div>
			<div class="formatter-body">
				${legend}
				<div class="process-top5 ${!config.data.length ? 'hide' : ''}">
				<div class="process-header"></div>
				<table>
					<colgroup>
						${colgroup}
					</colgroup>
					<thead>
					<tr>${thead}</tr>
					</thead>
					<tbody>${tbody}</tbody>
				</table>
				</div>
			</div>
			</div>`
}

/**
 * @description: 生成平均负载配置项
 * @param {LoadProps} data	数据
 */
const getLoadOption = ({ startTime, endTime, yData, zData, aData, bData, topData, echartsId }: LoadProps) => {
	var option = reactive<any>(getDefaultOption({ startTime, endTime }))
	var interval = ((endTime - startTime) / 3) * 1000
	option.tooltip.formatter = function (config: any) {
		var selectList = '',
			resource = ''
		for (var i = 0; i < config.length; i++) {
			var item = config[i]
			switch (item.seriesName) {
				case '1分钟':
				case '5分钟':
				case '15分钟':
					selectList += `
						<div class="select-data">
							<span class="status" style="background-color: ${item.color}"></span>
							<span>${item.seriesName}：${isNumber(item.data[1]) ? item.data[1].toFixed(2) : 0}</span>
						</div>`
					break
				case '资源使用率':
					resource = isNumber(item.data[1]) ? item.data[1].toFixed(2) : '0'
					break
			}
		}
		return echartsFormatter({
			time: config[0].axisValueLabel,
			data: topData[config[0].axisValue],
			width: '50rem',
			legend: `
				<div class="select-data">
					<span class="status"></span>
					<span>资源使用率：${resource}%</span>
				</div>
				<div class="${config[0].seriesName === '资源使用率' ? 'hide' : ''}">
					${selectList}
				</div>
			`,
		})
	}
	setPublicOptions(option, echartsId)
	option.legend = {
		data: ['1分钟', '5分钟', '15分钟'],
		right: '16%',
		top: '10px',
	}
	option.axisPointer = {
		link: { xAxisIndex: 'all' },
		lineStyle: {
			color: '#aaaa',
			width: 1,
		},
	}

	// 直角坐标系内绘图网格
	option.grid = [
		{ left: '5%', bottom: 80, right: '55%', width: '40%', height: 'auto' },
		{ bottom: 80, left: '55%', width: '40%', height: 'auto' },
	]

	// 直角坐标系grid的x轴
	option.xAxis = [
		{
			type: 'time',
			boundaryGap: ['1%', '0%'],
			minInterval: interval,
			axisLine: publicConfig.axisLine,
			axisLabel: publicConfig.axisLabel,
		},
		{
			type: 'time',
			gridIndex: 1,
			boundaryGap: ['1%', '0%'],
			minInterval: interval,
			axisLine: publicConfig.axisLine,
			axisLabel: publicConfig.axisLabel,
		},
	]
	option.yAxis = [
		{
			scale: true,
			name: '资源使用率',
			min: 0,
			max: function (value: any) {
				if (value.max >= 100) return Math.ceil(value.max) // 最大值超过100
				if (value.max >= 80) return 100 // 最大值超过80
				return parseInt((value.max + 10).toString().slice(0, 1) + '0') // 小于80取当前最大值的首位数字
			},
			splitLine: { ...publicConfig.splitLine, show: true }, // y轴网格显示
			nameTextStyle: publicConfig.nameTextStyle, // 坐标轴名样式
			axisLine: publicConfig.axisLine,
		},
		{
			scale: true,
			name: '负载详情',
			gridIndex: 1,
			splitLine: { ...publicConfig.splitLine, show: true },
			nameTextStyle: publicConfig.nameTextStyle,
			axisLine: publicConfig.axisLine,
		},
	]
	option.dataZoom[0].xAxisIndex = [0, 1]
	option.dataZoom[1].type = 'slider'
	option.dataZoom[1].left = '5%'
	option.dataZoom[1].right = '5%'
	option.dataZoom[1].xAxisIndex = [0, 1]
	option.series = [
		{
			name: '资源使用率',
			...publicConfig.series,
			lineStyle: {
				itemStyle: {
					width: 2,
					color: 'rgb(255, 140, 0)',
				},
			},
			itemStyle: { color: 'rgb(255, 140, 0)' },
			data: yData,
		},
		{
			xAxisIndex: 1,
			yAxisIndex: 1,
			name: '1分钟',
			...publicConfig.series,
			lineStyle: {
				itemStyle: {
					width: 2,
					color: 'rgb(30, 144, 255)',
				},
			},
			itemStyle: { color: 'rgb(30, 144, 255)' },
			data: zData,
		},
		{
			xAxisIndex: 1,
			yAxisIndex: 1,
			name: '5分钟',
			...publicConfig.series,
			lineStyle: {
				itemStyle: {
					width: 2,
					color: 'rgb(0, 178, 45)',
				},
			},
			itemStyle: { color: 'rgb(0, 178, 45)' },
			data: aData,
		},
		{
			xAxisIndex: 1,
			yAxisIndex: 1,
			name: '15分钟',
			type: 'line',
			smooth: true,
			symbol: 'circle',
			showSymbol: false,
			lineStyle: {
				itemStyle: {
					width: 2,
					color: 'rgb(147, 38, 255)',
				},
			},
			itemStyle: { color: 'rgb(147, 38, 255)' },
			data: bData,
		},
	]
	option.textStyle = {
		color: '#666',
		fontSize: 12,
	}

	return option
}

/**
 * @description: 生成图表配置项
 * @param {any} data	图表数据
 * @param {string} type	类型
 */
const getOption = (data: any, type: string) => {
	const optionFn: {
		[key: string]: (data: any) => any
	} = {
		cpu: (data: any) => getCpuOption(data),
		mem: (data: any) => getMemOption(data),
		disk: (data: any) => getDiskOption(data),
		network: (data: any) => getNetworkOption(data),
		load: (data: any) => getLoadOption(data),
	}
	return optionFn[type](data)
}

/**
 * @description 生成图表配置项
 * @param data 数据
 */
const generateAllOption = (data: any, type: string) => {
	const currentData = { cpu, mem, disk, network, load }[type]
	currentData.echartsOption = getOption({ ...data, topData: currentData.topData, echartsId: currentData.echartsId }, type)
}

/**
 * @description	获取今天的日期
 */
const getToday = () => {
	const mydate = new Date()
	return formatTime(mydate.getTime() / 1000, 'yyyy/MM/dd')
}

/**
 * @description	获取前几天的日期
 * @param {number} day	天数
 */
const getBeforeData = (day: number) => {
	const now = new Date(getToday())
	const now_time = now.getTime()
	const before_days_time = (now_time - day * 24 * 3600 * 1000) / 1000
	return formatTime(before_days_time, 'yyyy/MM/dd')
}

/**
 *@description 处理选择的天数
 * @param day	天数
 */
export const getData = (day: number) => {
	const now = Math.floor(new Date().getTime() / 1000)
	let b = 0 // 开始时间
	let e = now // 结束时间

	if (day == 0) {
		b = new Date(getToday() + ' 00:00:00').getTime() / 1000
	} else if (day == 1) {
		b = new Date(getBeforeData(day) + ' 00:00:00').getTime() / 1000
		e = new Date(getBeforeData(day) + ' 23:59:59').getTime() / 1000
	} else {
		b = new Date(getBeforeData(day - 1) + ' 00:00:00').getTime() / 1000
	}
	b = Math.floor(b)
	e = Math.floor(e)
	return { b, e }
}

/**
 * @description 设置全部的echarts配置
 * @param day 天数
 */
const setAllData = async (day: number, infoFunc: any, type: string) => {
	const { b: start, e: end } = getData(day)
	// 根据类型判断调用哪个函数
	const data = { cpu, mem, disk, network, load }[type]
	await infoFunc(start, end)
	generateAllOption(data.echartsParams, type)
}

/**
 * @description	获取时间戳
 * @param date	时间
 * @param endDate	结束时间
 */
const GetTime = (date: any, endDate: any) => {
	const endParts = endDate.split(' ')[0].split('/')
	const endMonth = parseInt(endParts[0], 10)
	const endDay = parseInt(endParts[1], 10)

	const today = new Date()
	const str = date.split(' ')
	const dateParts = str[0].split('/')
	const timeParts = str[1].split(':')

	const month = parseInt(dateParts[0], 10)
	const day = parseInt(dateParts[1], 10)
	const hours = parseInt(timeParts[0], 10)
	const minutes = parseInt(timeParts[1], 10)

	let year = today.getFullYear()
	const currentMonth = today.getMonth() + 1 // 当前月份
	const currentDay = today.getDate()

	// 如果月份大于当前月份，或者月份相同且日期大于今天，则认为是去年
	if (month > currentMonth || (month === currentMonth && day > currentDay)) {
		year -= 1
	}

	const newDate = new Date(year, month - 1, day, hours, minutes)
	return newDate.getTime()
}

/**
 * @description	数据处理
 * @param	{Array}	data
 */
export const SetData = (data: any) => {
	if (data !== undefined && data.length > 0) {
		let time
		for (let i = 0; i < data.length; i++) {
			if (typeof data[i].addtime === 'number') continue
			time = GetTime(data[i].addtime, data[data.length - 1].addtime)
			data[i].addtime = time
		}
	}
}

// 时间比对
export const timeCompare = (time1: any, time2: any) => {
	// 前五位数据
	const time = formatTime_up(time1).slice(0, 5)
	const otherTime = formatTime_up(time2).slice(0, 5)
	return time !== otherTime
}

/**
 * @description 获取cpu、内存信息
 * @param start 开始时间
 * @param end 结束时间
 * @param type 类型
 */
const getCpuAndMemInfo = async (start: any, end: any, type: string, notRequest?: boolean): Promise<any> => {
	try {
		let data = []
		// 首次加载的时候不多次请求
		if (!notRequest) await getCpuAndMenData(start, end)
		data = cpuAndMemData.value
		if (data.length === 0) {
			if (type === 'CPU') {
				cpu.echartsParams = {
					startTime: 0,
					endTime: 0,
					yData: [],
				}
			} else {
				mem.echartsParams = {
					startTime: 0,
					endTime: 0,
					zData: [],
				}
			}
			return
		}
		SetData(data) //设置数据
		if (timeCompare(data[data.length - 1].addtime / 1000, start)) {
			// Message.error('数据不全,将为您显示最新保存的数据！')
		}
		if (type === 'CPU') {
			let yData = []
			if (data.length > 0) {
				for (var i = 0; i < data.length; i++) {
					let item = data[i]
					yData.push([item.addtime, item.pro])
					if (cpu.topData === undefined) cpu.topData = {}
					cpu.topData[item.addtime] = item.cpu_top
				}
				let startTime = data[0].addtime
				let endTime = data[data.length - 1].addtime
				cpu.echartsParams = {
					startTime,
					endTime,
					yData,
				}
			}
		} else {
			let zData = []
			if (data.length > 0) {
				for (var i = 0; i < data.length; i++) {
					let item = data[i]
					zData.push([item.addtime, item.mem])
					if (mem.topData === undefined) mem.topData = {}
					mem.topData[item.addtime] = item.memory_top.map((itm: any) => {
						if (isNumber(itm[0])) itm[0] = getByteUnit(itm[0])
						return itm
					})
				}
				let startTime = data[0].addtime
				let endTime = data[data.length - 1].addtime
				mem.echartsParams = {
					startTime,
					endTime,
					zData,
				}
			}
		}
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 获取echarts id
 * @param id
 */
export const acceptAllId = (id: string, type: string) => {
	switch (type) {
		case 'cpu':
			cpu.echartsId = id
			break
		case 'mem':
			mem.echartsId = id
			break
		case 'disk':
			disk.echartsId = id
			break
		case 'network':
			network.echartsId = id
			break
		case 'load':
			load.echartsId = id
			break
	}
}

/**
 * @description 清理记录
 */
export const CloseControl = async () => {
	try {
		await useConfirm({
			type: 'calc',
			title: '清空记录',
			width: '35rem',
			content: `您真的要清空所有监控记录吗？`,
		})
		// 清理记录
		useDataHandle({
			request: SetControlInfo({ type: 'del' }),
			message: true,
			success: () => {
				window.location.reload() // 刷新
			},
		})
	} catch (error) {}
}

/**
 *
 * @description 改变天数
 * @param day 天数
 * @param type 类型
 */
export const changeAllDay = async (day: any, type: string, notRequest?: boolean) => {
	// 公共处理函数，用于处理cpu、内存、磁盘、网络、负载的日期切换
	const commonLogic = async (infoFunc: (start: any, end: any) => Promise<any>, dataKey: string) => {
		const data = { cpu, mem, disk, network, load }[dataKey]
		data.day = day
		if (Array.isArray(day)) {
			await infoFunc(day[0], day[1])
			generateAllOption(data.echartsParams, dataKey)
		} else {
			await setAllData(data.day, infoFunc, dataKey)
		}
	}
	// 根据类型判断调用哪个函数
	await cond([
		[Equals('cpu'), async () => await commonLogic((start, end) => getCpuAndMemInfo(start, end, 'CPU', notRequest), 'cpu')],
		[Equals('mem'), async () => await commonLogic((start, end) => getCpuAndMemInfo(start, end, '内存', notRequest), 'mem')],
		[Equals('disk'), async () => await commonLogic(getDiskControlInfo, 'disk')],
		[Equals('network'), async () => await commonLogic(getNetworkControlInfo, 'network')],
		[Equals('load'), async () => await commonLogic(getLoadControlInfo, 'load')],
	])(type)
}

/**
 * @description 获取磁盘信息
 * @param start 开始时间
 * @param end 结束时间
 */
const getDiskControlInfo = async (start: any, end: any): Promise<any> => {
	await useDataHandle({
		request: GetDiskInfo({ start, end }),
		data: Array,
		success: (data: any) => {
			if (data.length === 0) {
				disk.echartsParams = {
					unit: diskUnitType.value,
					startTime: 0,
					endTime: 0,
					rData: [],
					wData: [],
					zData: [],
					yData: [],
				}
				return
			}
			SetData(data) //设置数据
			// 将时间戳转换为日期 并比对两个时间戳的xxxx-xx-xx是否相等，如果不相等则说明数据不全
			if (timeCompare(data[data.length - 1].addtime / 1000, start)) {
				// Message.error('数据不全,将为您显示最新保存的数据！')
			}

			let rData = [] as any
			let wData = [] as any
			let zData = [] as any
			let yData = [] as any
			let unit_size = 1

			let _unit = diskUnitType.value
			switch (_unit) {
				case 'MB/s':
					unit_size = 1024
					break
				case 'GB/s':
					unit_size = 1024 * 1024
					break
				default:
					unit_size = 1
					break
			}
			let is_gt_MB = false
			let is_gt_GB = false
			data?.forEach((item: any) => {
				let read: any = (item.read_bytes / 1024).toFixed(3)
				let write: any = (item.write_bytes / 1024).toFixed(3)
				rData.push([item.addtime, read / unit_size])
				wData.push([item.addtime, write / unit_size])
				yData.push([item.addtime, item.read_count + item.write_count])
				zData.push([item.addtime, item.read_time + item.write_time])
				if (disk.topData === undefined) disk.topData = {}
				disk.topData[item.addtime] = item.disk_top
				let read_MB = read / 1024
				let write_MB = write / 1024
				if ((read_MB >= 1 || write_MB >= 1) && !is_gt_MB) {
					is_gt_MB = true
				}
				if (is_gt_MB) {
					let read_GB = read_MB / 1024
					let write_GB = write_MB / 1024
					if ((read_GB >= 1 || write_GB >= 1) && !is_gt_GB) {
						is_gt_GB = true
					}
				}
			})

			if (data.length > 0) {
				let startTime = data[0].addtime / 1000
				let endTime = data[data.length - 1].addtime / 1000
				disk.echartsParams = {
					unit: _unit,
					startTime,
					endTime,
					rData,
					wData,
					zData,
					yData,
				}
			}
		},
	})
}

/**
 * @description 获取网络Io数据
 * @param start	开始时间
 * @param end	结束时间
 */
const getNetworkControlInfo = async (start: any, end: any): Promise<any> => {
	await useDataHandle({
		request: GetNetworkInfo({ start, end }),
		data: Array,
		success: (data: any) => {
			if (data.length === 0) {
				network.echartsParams = {
					unit: networkUnitType.value,
					startTime: 0,
					endTime: 0,
					yData: [],
					zData: [],
				}
				return
			}
			if (network.selectList.length === 1) {
				Object.keys(data[0]['down_packets']).forEach(key => {
					network.selectList.push({ title: key, value: key })
				})
			}

			SetData(data) // 设置数据
			if (timeCompare(data[data.length - 1].addtime / 1000, start)) {
				// Message.error('数据不全,将为您显示最新保存的数据！')
			}
			let yData = [] as any,
				zData = [] as any,
				unit_size = 1,
				_unit = networkUnitType.value,
				is_network = 0,
				network_io_key = networkIoKey.value || ''
			if (network_io_key === 'all') network_io_key = ''
			switch (_unit) {
				case 'MB/s':
					unit_size = 1024
					break
				case 'GB/s':
					unit_size = 1024 * 1024
					break
				default:
					unit_size = 1
					break
			}
			let is_gt_MB = false
			let is_gt_GB = false
			data?.forEach((items: any) => {
				if (is_network < 1 && typeof items.down_packets === 'object') {
					if (typeof network_io_key != 'undefined' && network_io_key != '') {
						if (typeof items.down_packets === 'object') {
							zData.push([items.addtime, items.down_packets[network_io_key] / unit_size])
						} else {
							zData.push([items.addtime, 0])
						}
					} else {
						zData.push([items.addtime, items.down / unit_size])
					}
					if (typeof network_io_key != 'undefined' && network_io_key != '') {
						if (typeof items.up_packets === 'object') {
							yData.push([items.addtime, items.up_packets[network_io_key] / unit_size])
						} else {
							yData.push([items.addtime, 0])
						}
					} else {
						yData.push([items.addtime, items.up / unit_size])
					}
					let up_MB = items.up / 1024
					let down_MB = items.down / 1024
					if ((up_MB >= 1 || down_MB >= 1) && !is_gt_MB) {
						is_gt_MB = true
					}
					if (is_gt_MB) {
						let up_GB = up_MB / 1024
						let down_GB = down_MB / 1024
						if ((up_GB >= 1 || down_GB >= 1) && !is_gt_GB) {
							is_gt_GB = true
						}
					}
				}
			})
			if (data.length > 0) {
				let startTime = data[0].addtime / 1000
				let endTime = data[data.length - 1].addtime / 1000
				network.echartsParams = {
					unit: _unit,
					startTime,
					endTime,
					yData,
					zData,
				}
			}
		},
	})
}

/**
 * @description 获取平均负载信息
 * @param start	开始时间
 * @param end	结束时间
 */
const getLoadControlInfo = async (start: any, end: any): Promise<any> => {
	await useDataHandle({
		request: GetLoadInfo({ start, end }),
		data: Array,
		success: (data: any) => {
			if (data.length === 0) {
				load.echartsParams = {
					startTime: 0,
					endTime: 0,
					yData: [],
					zData: [],
					aData: [],
					bData: [],
				}
				return
			}
			SetData(data) //设置数据
			if (timeCompare(data[data.length - 1].addtime / 1000, start)) {
				// Message.error('数据不全,将为您显示最新保存的数据！')
			}
			let aData = [] as any
			let bData = [] as any
			let yData = [] as any
			let zData = [] as any
			if (data === undefined) return
			data?.forEach((item: any) => {
				zData.push([item.addtime, item.one])
				yData.push([item.addtime, item.pro])
				aData.push([item.addtime, item.five])
				bData.push([item.addtime, item.fifteen])
				if (load.topData === undefined) load.topData = {}
				load.topData[item.addtime] = item.cpu_top
			})
			if (data.length > 0) {
				let startTime = data[0].addtime / 1000
				let endTime = data[data.length - 1].addtime / 1000
				load.echartsParams = {
					startTime,
					endTime,
					yData,
					zData,
					aData,
					bData,
				}
			}
		},
	})
}

/**
 * @description: 网络修改单位
 * @param val
 */
export const changeNetworkUnit = (val: any) => {
	networkIoKey.value = val === 'all' ? '' : val
	// setNetworkData(network.day)
	setAllData(network.day, getNetworkControlInfo, 'network')
}

/**
 * @description 初始化生成所有内容的echarts配置项
 * @param type 类型 单独刷新某个类型的数据
 */
export const initAllData = async (type?: string) => {
	try {
		// 先加载 CPU 数据 men第一次加载的时候不多次请求
		if (!type || type === 'cpu') await changeAllDay(cpu.day, 'cpu')
		const tasks = [
			{ condition: !type || type === 'load', day: load.day, key: 'load' },
			{ condition: !type || type === 'mem', day: mem.day, key: 'mem', notRequest: !type },
			{ condition: !type || type === 'network', day: network.day, key: 'network' },
			{ condition: !type || type === 'disk', day: disk.day, key: 'disk' },
		]
		const promises = tasks.filter(task => task.condition).map(task => changeAllDay(task.day, task.key, task?.notRequest))
		await Promise.allSettled(promises)
		// if (type) Message.success('刷新成功')
	} catch (error) {
		console.log('初始化数据时出错:', error)
	}
	// try {
	// 	if (!type || type === 'load') await changeAllDay(load.day, 'load')
	// 	if (!type || type === 'cpu') await changeAllDay(cpu.day, 'cpu')
	// 	if (!type || type === 'mem') await changeAllDay(mem.day, 'mem', true) // 首次加载的时候不多次发送cpuInfo请求
	// 	// 磁盘、网络
	// 	if (!type || type === 'network') await changeAllDay(network.day, 'network')
	// 	if (!type || type === 'disk') await changeAllDay(disk.day, 'disk')
	// 	if (type) Message.success('刷新成功')
	// } catch (error) {}
}
