import { closeLimitNet, createFlowRule, getGeneratedFlowInfo, getLimitConfig, getLimitNet, getModulesLimitNet, getPluginInfo, removeFlowRule, setLimitConfig, setLimitNet, setLimitStatus, setModulesLimitNet, batchPhpLimit, getFlowQuotaConfigData, getFlowNumData, checkMonitorReport } from '@/api/site'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { Message, useConfirm, useDataHandle, useHandleError } from '@/hooks/tools'
import { useOperate, useStatus } from '@/hooks/tools/table/column'
import { getByteUnit } from '@/utils'
import { openResultDialog } from '../../useController'
import { useSiteStore } from '../../useStore'
import { assembBatchParams, assembBatchResults, pluginInstallDialog, productPaymentDialog } from '@/public'
import { delTaskStatus, setNewAlarmTask, setTaskStatus } from '@/api/config'

const { siteInfo, siteType, isBindExtranet, isRefreshList, selectedList, batchConfig } = useSiteStore()

export const planList = ref([
	{
		label: '论坛/博客',
		value: 0,
		items: { perserver: 300, perip: 25, limit_rate: 512 },
	},
	{
		label: '图片站',
		value: 1,
		items: { perserver: 200, perip: 10, limit_rate: 1024 },
	},
	{
		label: '下载站',
		value: 2,
		items: { perserver: 50, perip: 3, limit_rate: 2048 },
	},
	{
		label: '商城',
		value: 3,
		items: { perserver: 500, perip: 10, limit_rate: 2048 },
	},
	{
		label: '门户',
		value: 4,
		items: { perserver: 400, perip: 15, limit_rate: 1024 },
	},
	{
		label: '企业',
		value: 5,
		items: { perserver: 60, perip: 10, limit_rate: 512 },
	},
	{
		label: '视频',
		value: 6,
		items: { perserver: 150, perip: 4, limit_rate: 1024 },
	},
	{
		label: '自定义',
		value: 7,
		items: { perserver: '', perip: '', limit_rate: '' },
	},
])

export const handleCheckChange = async (val: any, param: any) => {
	if (!isMult.value) {
		if (val) {
			onConfirmLimit(param)
		} else {
			const params = {
				[siteType.value !== 'php' && siteType.value !== 'phpasync' ? 'site_id' : 'id']: siteInfo.value.id,
			}
			const res: AnyObject = await useDataHandle({
				loading: '正在关闭流量限制，请稍后...',
				request: closeLimitNet(params, siteType.value),
				message: true,
			})
			if (res.status) await getLimitRate()
		}
	}
}

export const onConfirmLimit = async (param: any) => {
	try {
		if (!isMult.value) {
			const isSpecial = ['php', 'proxy', 'phpasync'].includes(siteType.value)
			const { perserver, perip, limit_rate } = param
			const params: AnyObject = {
				perserver,
				perip,
				limit_rate,
				[isSpecial ? 'id' : 'site_id']: siteInfo.value.id,
			}
			// 网站设置中的流量限制
			const res: AnyObject = await useDataHandle({
				loading: '正在设置流量，请稍后...',
				request: isSpecial ? setLimitNet(params) : setModulesLimitNet(params, siteType.value),
				message: true,
			})
			if (res.status) getLimitRate()
			return
		}

		// 批量
		let loading = Message.load('正在设置，请稍后...')
		let asyncList = [] as Array<AnyObject> // 异步项目列表
		selectedList.value.forEach((item: any) => {
			if (item?.project_config?.type === 'PHPMOD') {
				asyncList.push({ name: item.name, msg: '异步项目不支持', status: false })
			}
		})
		// 非异步项目
		const otherList = selectedList.value.filter((item: any) => item?.project_config?.type !== 'PHPMOD')
		// 组装参数
		const { enable, exclude } = batchConfig.value
		const params = assembBatchParams(otherList, exclude, enable, { params: { ...totalLimitForm, close_limit_net: totalLimitForm.value ? 0 : 1, project_type: 'PHP' } })
		// 批量设置
		const res = await useDataHandle({ request: batchPhpLimit(params) })
		// 组装结果
		const { data } = assembBatchResults(res.data)
		// 打开结果弹窗
		openResultDialog({ resultData: asyncList.concat(data) })
		// 刷新列表 清空结果
		selectedList.value = []
		loading.close()
		isRefreshList.value = true // 刷新列表
		return true
	} catch (error) {
		console.log(error)
		return false
	}
}

/**
 * 获取流量限制
 */
export const getLimitRate = async () => {
	try {
		const isSpecial = ['php', 'proxy', 'phpasync'].includes(siteType.value)

		const params = {
			[siteType.value !== 'php' && siteType.value !== 'phpasync' ? 'site_id' : 'id']: siteInfo.value.id,
		}

		const res: AnyObject = await useDataHandle({
			loading: viewLoading,
			request: isSpecial ? getLimitNet(params) : getModulesLimitNet(params, siteType.value),
		})
		// 若没有流量限制则返回错误信息
		if (!res.data.hasOwnProperty('limit_rate')) {
			maskLayerLimit.value = true
			Message.error('获取流量限制失败')
			maskLayerLimit.value = true
			maskTip.value = res.data.msg
			return { status: false, msg: '获取流量限制失败' }
		}
		maskLayerLimit.value = false
		totalLimitForm.limit_rate = res.data.limit_rate
		totalLimitForm.perserver = res.data.perserver
		totalLimitForm.perip = res.data.perip
		if (Object.values(res.data).every((item: any) => item === 0)) {
			// 关闭
			totalLimitForm.value = false
			totalLimitForm.type = 0
			handleChange(0)
		} else {
			totalLimitForm.type = res.data.value - 1
			totalLimitForm.value = true
		}
		if (totalLimitForm.type === -1) {
			totalLimitForm.type = 7
		}
		return totalLimitForm
	} catch (error) {
		console.log(error)
		return { status: false, msg: '获取流量限制失败' }
	}
}

export const initFlowLimit = async () => {
	try {
		let type: any = siteInfo.value.project_type?.toLowerCase()
		if (type === 'node') type = 'nodejs'
		if (type === 'nodejs') {
			// nodejs 项目 需要判断是否开启外网
			isBindExtranet.value = siteInfo.value.project_config?.bind_extranet
			if (!isBindExtranet.value) {
				maskLayerLimit.value = true
				return totalLimitForm
			} else {
				maskLayerLimit.value = false
			}
		} else {
			isBindExtranet.value = true
		}

		if (!isMult.value) {
			await getLimitRate()
		} else {
			await handleChange(0)
		}
		return totalLimitForm
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 选择方案
 */
export const handleChange = (val: number) => {
	const { perserver, perip, limit_rate } = planList.value[val].items
	totalLimitForm.perserver = perserver
	totalLimitForm.perip = perip
	totalLimitForm.limit_rate = limit_rate
}

export const isMult = computed(() => selectedList.value.length > 0) // 是否多选

export const maskLayerLimit = ref(false) // 遮罩层
export const maskLayer = ref(false) // 遮罩层
export const maskTip = ref('') // 遮罩提示

export const totalLimitForm = reactive({
	value: true,
	perserver: 300 as any,
	perip: 25 as any,
	limit_rate: 512 as any,
	type: 0,
})

export const viewLoading = ref(false) // 加载状态

/*******************************流量限额*************************************/

/**
 * @description 确认添加动态检查
 * @param close
 */
export const onConfirmSetting = async (param: any) => {
	try {
		let params: any = handleParams(param)
		const res: AnyObject = await useDataHandle({
			loading: '正在添加告警任务，请稍候...',
			request: setNewAlarmTask(params),
			message: true,
			success: (res: any) => {},
		})
		console.log(res, 'res')
		if (res.status) isRefreshFlowList.value = true
		return res.status
	} catch (error) {
		console.log(error)
		return false
	}
}

/**
 * @description 确认添加累计限制
 * @param close
 */
export const onConfirmTotalSetting = async (param: any) => {
	try {
		const params: any = {
			template_id: 131,
			task_data: {
				task_data: getTotalData(param),
				sender: param.sender,
				number_rule: { day_num: 0, total: Number(param.total) },
				time_rule: {
					send_interval: 0,
					time_range: [0, 86399],
				},
			},
		}
		params.task_data = JSON.stringify(params.task_data)
		const res: AnyObject = await useDataHandle({
			loading: '正在添加告警任务，请稍候...',
			request: setNewAlarmTask(params),
			message: true,
			success: (res: any) => {},
		})
		console.log(res, 'res')
		if (res.status) isRefreshFlowList.value = true
		return res.status
	} catch (error) {
		console.log(error)
		return false
	}
}

/**
 * @description 获取累计数据
 */
const getTotalData = (param: any) => {
	const data: { [key: string]: any } = {}
	data.tid = 131
	data.type = 'monitor_traffic_total'
	data.title = '[监控报表]网站流量限额提醒'
	data.status = true
	data.count = 0
	data.interval = 600
	data.project = ''
	data.site = siteInfo.value.name
	data.cycle = Number(param.cycle)
	data.traffic = Number(param.traffic)
	data.traffic_unit = param.traffic_unit
	return data
}

/**
 * @description 获取数据
 */
const getData = (param: any) => {
	const data: { [key: string]: any } = {}
	data.tid = param.type === 'total' ? 130 : 132
	data.type = param.type === 'total' ? 'monitor_traffic_attack' : 'monitor_http_flood'
	data.title = param.type === 'total' ? '[监控报表]网站流量异常告警' : '[监控报表]网站请求异常告警'
	data.status = true
	data.count = 0
	data.interval = 600
	data.project = ''
	data.site = siteInfo.value.name
	data.cycle = Number(param.cycle)
	data.cycle_unit = param.cycle_unit
	if (param.type === 'total') {
		data.traffic = Number(param.traffic)
		data.traffic_unit = param.traffic_unit
	} else {
		data.request = Number(param.request)
		data.request_unit = param.request_unit
	}
	return data
}

/**
 * @description 处理参数
 */
const handleParams = (param: any) => {
	const params: any = {
		template_id: param.type === 'total' ? 130 : 132,
		task_data: {
			task_data: getData(param),
			sender: param.sender,
			number_rule: { day_num: 0, total: Number(param.total) },
			time_rule: {
				send_interval: 0,
				time_range: [0, 86399],
			},
		},
	}
	params.task_data = JSON.stringify(params.task_data)
	return params
}

/**
 * @description 修改状态
 */
export const changeStatusEvent = async (row: any) => {
	const status = !row.limit_status
	await useConfirm({
		title: (status ? '开启' : '关闭') + '流量限额配置',
		icon: 'warning-filled',
		content: (status ? '开启' : '关闭') + '检测到问题时将' + (status ? '会' : '不会') + '发送告警通知，是否继续？',
	})
	const res: AnyObject = await useDataHandle({
		loading: '正在设置，请稍后...',
		request: setLimitStatus({
			id: row.id,
			limit_status: status,
			site_name: siteInfo.value.name,
		}),
		message: true,
	})
	isRefreshFlowList.value = true
}

/**
 * @description 获取流量限制信息
 */
export const getFlowNum = async () => {
	viewLoading.value = true
	try {
		const { data: res } = await getGeneratedFlowInfo({
			site_name: siteInfo.value.name,
		})
		totalForm.value.length = getByteUnit(Number(res.length))
		totalForm.value.request = getByteUnit(Number(res.request))
	} catch (error) {
		useHandleError(error)
	} finally {
		viewLoading.value = false
	}
}

/**
 * @description 获取流量限额配置
 */
export const getFlowConfig = async () => {
	try {
		const res = await getLimitConfig({ site_name: siteInfo.value.name })
		return { data: res.data, total: res.data.length, other: {} }
	} catch (error) {
		useHandleError(error)
	}
}

/**
 * @description 获取插件状态
 */
export const checkPluginStatus = async () => {
	try {
		const { data: pluginData } = await getPluginInfo({ sName: 'monitor' })
		pluginStatus.value.total_status = pluginData.setup && pluginData.endtime >= 0
		if (!pluginStatus.value.total_status) {
			maskLayer.value = true
		}
		// const { data } = await setLimitConfig({ sName: 'total' })
		// pluginStatus.value = data
		// console.log(pluginStatus.value, 'pluginStatus.value')
		// if (!data.nginx_status || !data.total_status) {
		// 	maskLayer.value = true
		// }
	} catch (error) {
		console.log(error)
	}
}

// 查询插件是否安装、购买
export const getPluginMessage = async () => {
	try {
		const { data } = await getPluginInfo({ sName: 'total' })
		maskLayer.value = data.setup && data.endtime >= 0 ? false : true
		if (data.setup && data.endtime > 0) {
			getFlowNum()
			return await getFlowConfig()
		}
		return { data: [], total: 0, other: {} }
	} catch (error) {
		console.log(error)
		return { data: [], total: 0, other: {} }
	}
}

/**
 * @description 删除
 */
export const deleteEvent = async (row: any) => {
	await useConfirm({
		title: '删除',
		icon: 'warning-filled',
		content: '是否删除此条流量限额配置？',
	})
	const res: AnyObject = await useDataHandle({
		loading: '正在删除，请稍后...',
		request: removeFlowRule({ site_name: siteInfo.value.name, id: row.id }),
		message: true,
	})
	isRefreshFlowList.value = true
}

export const pluginStatus = ref({
	nginx_status: false,
	total_status: false,
	buy_status: false,
}) // 插件状态

export const totalOptions = [
	{ label: '1小时', value: '1h' },
	{ label: '1天', value: '1day' },
	{ label: '30天', value: '30day' },
	{ label: '自然月', value: 'month' },
] // 累计流量限额周期
export const momentOptions = [
	{ label: '10分钟', value: '10m' },
	{ label: '30分钟', value: '30m' },
] // 实时流量限额周期

export const totalForm = ref({
	length: '--',
	request: '--',
}) // 累计流量

export const isRefreshFlowList = ref(false) // 刷新流量限额列表

/**
 * @description 打开购买或安装插件
 * @param type
 */
export const openBuyAndInstall = async (type: string) => {
	if (type === 'buy') {
		// 打开支付
		productPaymentDialog({
			sourceId: 142,
		})
	} else {
		try {
			const { data } = await getPluginInfo({ sName: 'monitor' })
			await pluginInstallDialog({
				name: data.name,
				type: 'i',
				pluginInfo: data,
			})
		} catch (error) {
			console.log(error)
		}
	}
}

/**
 * @description 获取流量限额配置
 */
export const getFlowQuotaConfig = async () => {
	try {
		const { data } = await getFlowQuotaConfigData({ site_name: siteInfo.value.name })
		return { data: data.data, total: data.data.length, other: {} }
	} catch (error) {
		console.log(error)
		return { data: [], total: 0, other: {} }
	}
}

export const flowOptions = [
	{ label: '流量', value: 'traffic' },
	{ label: '请求', value: 'request' },
]

export const flowUnitOptions = [
	{ label: 'MB', value: 'mb' },
	{ label: 'GB', value: 'gb' },
]

export const requestUnitOptions = [
	{ label: '次', value: 'c' },
	{ label: '千次', value: 'kc' },
	{ label: '百万次', value: 'mc' },
]

export const flowQuotaConfig = ref({
	traffic: '--',
	request: '--',
})

/**
 * @description 数字千位分隔
 * @param num 需要格式化的数字
 * @returns 格式化后的字符串
 */
const formatNumber = (num: number | string): string => {
	if (!num) return '0'
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const getFlowQuotaData = async () => {
	try {
		if (!pluginStatus.value.total_status) {
			flowQuotaConfig.value.traffic = '--'
			flowQuotaConfig.value.request = '--'
			return
		}
		// 获取今日日期
		const today = new Date()
		const year = today.getFullYear()
		const month = String(today.getMonth() + 1).padStart(2, '0')
		const day = String(today.getDate()).padStart(2, '0')
		const dateStr = `${year}-${month}-${day}`
		const { data } = await getFlowNumData({
			SiteName: siteInfo.value.name,
			part_type: 'hour',
			start_date: dateStr,
			end_date: dateStr,
		})
		flowQuotaConfig.value.traffic = getByteUnit(Number(data.total.sent_bytes)) ?? 0
		flowQuotaConfig.value.request = formatNumber(Number(data.total.request)) ?? 0
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 删除流量请求告警
 */
export const deleteFlowQuotaConfig = async (row: any) => {
	try {
		await useConfirm({
			title: `删除${row.task_data.title}`,
			icon: 'warning-filled',
			content: `是否删除${row.title}？`,
		})
		await useDataHandle({
			loading: '正在删除告警任务，请稍候...',
			request: delTaskStatus({ task_id: row.id }),
			message: true,
		})
		isRefreshFlowList.value = true
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 切换状态
 */
export const onChangeStatus = async (row: any) => {
	await useConfirm({
		title: `${row.status ? '禁用' : '启用'}【${row.title}】任务`,
		content: `您真的要${row.status ? '禁用' : '启用'}【${row.title}】这个任务吗？`,
	})
	await useDataHandle({
		loading: '正在修改告警任务状态，请稍候...',
		request: setTaskStatus({ task_id: row.id, status: Number(!row.status) }),
		message: true,
	})
	isRefreshFlowList.value = true
}
