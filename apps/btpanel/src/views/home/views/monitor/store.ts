import { defineStore, storeToRefs } from 'pinia'
import { isUndefined, formatTime, getByteUnit } from '@utils/index'
import { homeData } from '@home/useMethod'
import HOME_STORE from '@home/store'

const HOME_MONITOR_STORE = defineStore('HOME-MONITOR-STORE', () => {
	const homeStore = HOME_STORE()
	const { isRefreshData } = storeToRefs(homeStore)

	const isFirst = ref(true) // 是否第一次加载
	const loading = ref(false) // 过渡效果
	const netRefs = ref() // 流量组件
	const iostatRefs = ref() // 磁盘IO组件
	const activeName = ref('net') // 当前激活，tabs名称
	const netUnit = ref(localStorage.getItem('netUnit') || 'KB') // 流量单位
	const netConfig = shallowRef({})
	const iostatConfig = shallowRef({})
	const network = ref<any>([]) // 网络数据
	const diskIo = ref<any>([]) // 磁盘IO数据

	// 资源数据
	const resource: any = reactive<any>({
		// 流量
		net: {
			selectVal: 'ALL',
			selectList: [],
			data: {
				timeList: [],
				upList: [],
				downList: [],
			},
			info: {
				up: { label: '上行', value: '0 B', bgColor: '#20a53a' },
				down: { label: '下行', value: '0 B', bgColor: ' #FF9901' },
				upTotal: { label: '总发送', value: '0 B' },
				downTotal: { label: '总接收', value: '0 B' },
			},
		},
		// 磁盘IO
		iostat: {
			selectVal: 'ALL',
			selectList: [],
			data: {
				timeList: [],
				readList: [],
				writeList: [],
				tipsList: [],
			},
			info: {
				read: { label: '读取', value: '0 B', bgColor: '#FF4683' },
				write: { label: '写入', value: '0 B', bgColor: '#6CC0CF' },
				second: {
					label: '每秒读写',
					value: `0次`,
				},
				io: { label: 'IO延迟', value: '0 ms', color: '#20a53a' },
			},
		},
	})

	// 监控单位切换
	const unitList = ref([
		{ label: 'KB/s', value: 'KB', disable: false },
		{ label: 'MB/s', value: 'MB', disable: false },
		{ label: 'GB/s', value: 'GB', disable: false },
		{ label: 'TB/s', value: 'TB', disable: false },
	])

	// 资源类型
	const enum resourceType {
		Net = 'net',
		Iostat = 'iostat',
	}

	/**
	 * @description 网络数据
	 */
	homeData.useSetCallback('network', (data: any) => {
		if (!data) return
		network.value = data
		if (activeName.value === 'net') setNet(data, netUnit.value)
		// 获取网络流量数据
		const netData = getResourceData(resourceType.Net, 'data')
		netConfig.value = getNetConfig(netData)
		// 图表加载完成后隐藏loading
		if (getRefs(activeName.value)?.echartRef?.id) loading.value = false
		initSelectList()
	})

	/**
	 * @description 磁盘IO数据
	 */
	homeData.useSetCallback('diskIo', async (data: any) => {
		if (!data) return
		diskIo.value = data
		if (activeName.value === 'iostat') setIostat(data)
		// 获取磁盘IO数据
		const iostatData = getResourceData(resourceType.Iostat, 'data')
		iostatConfig.value = getIostatConfig(iostatData)
		// 图表加载完成后隐藏loading
		if (getRefs(activeName.value)?.echartRef?.id) loading.value = false
		initSelectList()
	})

	// 获取当前显示的选择框选中值
	const selectVal = computed(() => resource[activeName.value].selectVal)

	/**
	 * @description 下拉选择框切换，记录选择值
	 * @param type 类型
	 */
	const onSelectChange = () => {
		localStorage.setItem(`home-model-active`, activeName.value)
		localStorage.setItem(`home-${activeName.value}-active`, selectVal.value)
		if (activeName.value === 'net') {
			setNet(network.value, netUnit.value)
		} else {
			setIostat(diskIo.value)
		}
	}

	/**
	 * @description 流量单位切换，记录选择值
	 */
	const onNetUnitChange = () => {
		resource.net.data.timeList = []
		resource.net.data.upList = []
		resource.net.data.downList = []
		localStorage.setItem('netUnit', netUnit.value)
		setNet(network.value, netUnit.value)
	}

	/**
	 * @description 切换tabs - 优化版本，配合keep-alive使用
	 */
	const onTabsChange = () => {
		const type = activeName.value

		// 保存当前tab状态到localStorage
		localStorage.setItem(`home-model-active`, type)

		// 恢复上次选择的设备
		const savedSelectVal = localStorage.getItem(`home-${type}-active`)
		if (savedSelectVal && resource[type].selectList.some((item: any) => item.value === savedSelectVal)) {
			resource[type].selectVal = savedSelectVal
		} else {
			resource[type].selectVal = 'ALL'
		}

		// 延迟处理图表调整，避免阻塞UI
		nextTick(() => {
			const refs = getRefs(type)
			if (refs?.echartRef) {
				// 图表实例存在时调整大小
				setTimeout(() => {
					refs.echartRef.resize()
				}, 100)
			}

			// 如果是首次加载磁盘IO，初始化配置
			if (isFirst.value && type === resourceType.Iostat) {
				isFirst.value = false
				const iostatData = getResourceData(resourceType.Iostat, 'data')
				if (refs && iostatData) {
					refs.setConfig(getIostatConfig(iostatData))
				}
			}
		})
	}

	/**
	 * @description 初始化选择框
	 */
	const initSelectList = () => {
		for (const key in resource) {
			const res = getRes(key)
			const data = resource[key]
			const { selectList: list } = data
			list.length = 0

			Object.keys(res).forEach((key: string) => {
				if (key === 'ALL') {
					if (!data.selectVal) data.selectVal = key
					list.unshift({ label: '所有', value: 'ALL' })
					return
				}
				list.push({ label: key, value: key })
			})
		}
	}

	/**
	 * @description 流量数据单位转换
	 * @param data 网络数据
	 * @param {string} unit 单位
	 */
	const getNetData = (data: any, unit: string) => {
		const { up, down, upTotal, downTotal } = data
		return {
			up: getByteUnit(up * 1024, false, 2, unit),
			down: getByteUnit(down * 1024, false, 2, unit),
			upTotal: getByteUnit(upTotal * 1024, false, 2, unit),
			downTotal: getByteUnit(downTotal * 1024, false, 2, unit),
		}
	}

	/**
	 * @description 设置流量数据
	 * @param network 网络数据
	 * @param {string} unit 单位
	 */
	const setNet = (network: any, unit: string) => {
		const { info } = getResourceData(resourceType.Net)
		const res = network[selectVal.value || 'ALL']
		if (!res) return
		const { up, down, upTotal, downTotal } = info
		const translateData = getNetData(res, unit)
		const mb = getNetData(res, 'MB')
		up.value = getByteUnit(res.up * 1024, true, 1)
		down.value = getByteUnit(res.down * 1024, true, 1)
		upTotal.value = getByteUnit(res.upTotal, true, 1)
		downTotal.value = getByteUnit(res.downTotal, true, 1)

		if (parseFloat(mb.down) * 100 == 0 || parseFloat(mb.down) * 100 == 0) {
			unitList.value = [
				{ label: 'KB/s', value: 'KB', disable: false },
				{ label: 'MB/s', value: 'MB', disable: true },
				{ label: 'GB/s', value: 'GB', disable: true },
				{ label: 'TB/s', value: 'TB', disable: true },
			]
		} else {
			const gb = getNetData(res, 'GB')
			if (parseFloat(gb.down) * 100 == 0 || parseFloat(gb.down) * 100 == 0) {
				unitList.value = [
					{ label: 'KB/s', value: 'KB', disable: false },
					{ label: 'MB/s', value: 'MB', disable: false },
					{ label: 'GB/s', value: 'GB', disable: true },
					{ label: 'TB/s', value: 'TB', disable: true },
				]
			} else {
				const tb = getNetData(res, 'TB')
				if (parseFloat(tb.down) * 100 == 0 || parseFloat(tb.down) * 100 == 0) {
					unitList.value = [
						{ label: 'KB/s', value: 'KB', disable: false },
						{ label: 'MB/s', value: 'MB', disable: false },
						{ label: 'GB/s', value: 'GB', disable: false },
						{ label: 'TB/s', value: 'TB', disable: true },
					]
				}
			}
		}
		setData(resourceType.Net, [{ key: 'timeList' }, { key: 'upList', value: translateData.up }, { key: 'downList', value: translateData.down }])
	}

	/**
	 * @description 获取流量配置
	 * @param data 网络数据
	 */
	const getNetConfig = (data: any) => ({
		dataZoom: [],
		tData: data.timeList,
		list: [
			{
				name: '上行',
				data: data.upList,
				circle: 'circle',
				itemStyle: { color: '#20a53a' },
				lineStyle: { width: 2, color: '#20a53a' },
				areaStyle: {
					color: {
						type: 'linear',
						x: 0,
						y: 0,
						x2: 0,
						y2: 1,
						global: false,
						colorStops: [
							{ offset: 0, color: 'rgba(32, 165, 58, .6)' },
							{ offset: 0.8, color: 'rgba(32, 165, 58, 0)' },
						],
					},
				},
			},
			{
				name: '下行',
				data: data.downList,
				circle: 'circle',
				itemStyle: { color: ' #FF9901' },
				lineStyle: { width: 2, color: '#FF9901' },
				areaStyle: {
					color: {
						type: 'linear',
						x: 0,
						y: 0,
						x2: 0,
						y2: 1,
						global: false,
						colorStops: [
							{ offset: 0, color: 'rgba(255, 153, 1, .6)' },
							{ offset: 0.8, color: 'rgba(255, 153, 1, 0)' },
						],
					},
				},
			},
		],
		formatter(data: any) {
			let tips = ''
			for (let i = 0; i < data.length; i++) {
				const item: any = data[i]
				if (isUndefined(item.data)) return false
				tips += `<span class="inline-block w-[1rem] h-[1rem] mr-[1rem]" style="border-radius: var(--el-border-radius-circle); background: ${item.color};"></span>${item.seriesName}：${getByteUnit(parseFloat(item.data) * 1024, true, 1)}/s ${data.length - 1 !== i ? '<br />' : ''}`
			}
			return `时间：${data[0].axisValue}<br />${tips}`
		},
	})

	/**
	 * @description 设置磁盘IO数据
	 * @param iostat 设置的数据
	 */
	const setIostat = (iostat: any) => {
		// const mb = 1024 * 1024
		const { info } = getResourceData(resourceType.Iostat)
		const selectVal = resource.iostat.selectVal
		const res = iostat[selectVal || 'ALL']
		const { read, write, second, io } = info
		if (!res) return
		const { read_bytes: readBytes, write_bytes: writeBytes } = res
		const { read_count: readCount, write_count: writeCount } = res
		const { read_time: readTime, write_time: writeTime } = res
		read.value = getByteUnit(readBytes, true, 1)
		write.value = getByteUnit(writeBytes, true, 1)
		second.value = `${readCount + writeCount} 次`
		io.value = `${writeTime > readTime ? writeTime : readTime} ms`
		const value = parseInt(io.value)
		io.color = value >= 1000 ? 'var(--el-color-danger)' : value > 100 && value < 1000 ? 'var(--el-color-warning)' : 'var(--el-color-primary)'
		setData(resourceType.Iostat, [{ key: 'timeList' }, { key: 'readList', value: readBytes }, { key: 'writeList', value: writeBytes }, { key: 'tipsList', value: res }])
	}

	/**
	 * @description 获取磁盘IO配置
	 * @param res 数据
	 */
	const getIostatConfig = (res: any) => ({
		dataZoom: [],
		// unit: `单位：MB/s`,
		type: 'iostat',
		tData: res.timeList,
		list: [
			{
				name: '读取字节数',
				data: res.readList,
				circle: 'circle',
				itemStyle: { color: '#FF4683' },
				lineStyle: { width: 2, color: '#FF4683' },
				areaStyle: {
					color: {
						type: 'linear',
						x: 0,
						y: 0,
						x2: 0,
						y2: 1,
						global: false,
						colorStops: [
							{ offset: 0, color: 'rgba(255, 70, 131, .8)' },
							{ offset: 0.8, color: 'rgba(255, 70, 131, 0)' },
						],
					},
				},
			},
			{
				name: '写入字节数',
				data: res.writeList,
				circle: 'circle',
				itemStyle: { color: '#6CC0CF' },
				lineStyle: { width: 2, color: '#6CC0CF' },
				areaStyle: {
					color: {
						type: 'linear',
						x: 0,
						y: 0,
						x2: 0,
						y2: 1,
						global: false,
						colorStops: [
							{ offset: 0, color: 'rgba(108, 192, 207, .8)' },
							{ offset: 0.8, color: 'rgba(108, 192, 207, 0)' },
						],
					},
				},
			},
		],
		formatter(data: any) {
			let tips = `时间：${data[0].axisValue}<br />`
			const options: any = {
				read_bytes: '读取字节数',
				read_count: '读取字节数',
				read_merged_count: '合并读取次数',
				read_time: '读取延迟',
				write_bytes: '写入字节数',
				write_count: '写入次数',
				write_merged_count: '合并写入次数',
				write_time: '写入延迟',
			}
			const keyList = ['read_count', 'write_count', 'read_merged_count', 'write_merged_count', 'read_time', 'write_time']
			const tipsData = res.tipsList[data[0].dataIndex]
			for (let i = 0; i < data.length; i++) {
				const item: any = data[i]
				if (isUndefined(item.data)) return false
				tips += `<span class="inline-block w-[1rem] h-[1rem] mr-[.1rem]" style="border-radius: var(--el-border-radius-circle); background: ${item.color};"></span>&nbsp;&nbsp;<span>${item.seriesName}：${getByteUnit(parseFloat(item.data), true, 1)}/s</span><br />`
			}
			keyList.forEach((key: string) => {
				const item = tipsData[key]
				const color = item > 100 && item < 1000 ? '#ff9900' : item >= 1000 ? 'red' : '#20a53a'
				const style = key.indexOf('time') > -1 ? `color: ${color}` : ''
				const timeUnit = key.indexOf('time') > -1 ? ' ms' : ` 次/秒`
				tips += `<span class="inline-block w-[1rem] h-[1rem]"></span>&nbsp;&nbsp;<span style="${style}">${options[key]}：${item + timeUnit}</span><br />`
			})
			return tips
		},
	})

	/**
	 * @description 添加数据
	 * @param type 类型
	 * @param keyList
	 * @param limit
	 */
	const setData = (type: string, keyList: Array<any>, limit: number = 8) => {
		const data = getResourceData(type, 'data')
		keyList.forEach((item: any) => {
			const { key, value } = item
			const list = data[key]
			if (list.length >= limit) list.splice(0, 1)
			if (key == 'timeList') {
				list.push(formatTime(new Date().getTime(), 'hh:mm:ss', true))
			} else {
				list.push(value)
			}
		})
	}

	/**
	 * @description 获取组件实例
	 * @param {string} type 类型
	 */
	const getRefs: any = (type: string) => {
		if (type == resourceType.Net) return netRefs.value
		if (type == resourceType.Iostat) return iostatRefs.value
	}

	/**
	 * @description 获取资源数据
	 * @param {string} type 类型
	 * @param {string} key 键值
	 */
	const getResourceData = (type: any = 'net', key: any = '') => {
		return key ? resource[type][key] : resource[type]
	}

	/**
	 * @description 获取请求数据
	 * @param {string} type 类型
	 * @returns {AnyObject} 返回数据
	 */
	const getRes = (type: string = 'net') => {
		if (type == resourceType.Net) return network.value
		if (type == resourceType.Iostat) return diskIo.value
		return {}
	}

	/**
	 * @description 初始化图表功能
	 */
	const initChart = () => {
		loading.value = true
		const type = localStorage.getItem(`home-model-active`)
		const typeActive = localStorage.getItem(`home-${type}-active`)
		if (type) {
			activeName.value = type
			resource[type].selectVal = typeActive || 'ALL'
		}
		nextTick(() => {
			isRefreshData.value = true
		})
		const netData = getResourceData(resourceType.Net, 'data') // 获取网络流量数据
		netConfig.value = getNetConfig(netData)
		const iostatData = getResourceData(resourceType.Iostat, 'data') // 获取磁盘IO数据
		iostatConfig.value = getIostatConfig(iostatData)
	}

	return {
		netRefs,
		iostatRefs,
		loading,
		iostatConfig,
		resource,
		unitList,
		activeName,
		netConfig,
		netUnit,
		initChart,
		onSelectChange,
		onNetUnitChange,
		onTabsChange,
	}
})

export default HOME_MONITOR_STORE
