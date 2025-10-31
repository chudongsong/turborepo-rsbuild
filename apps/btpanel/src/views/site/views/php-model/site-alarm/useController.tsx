import { ElSwitch } from 'element-plus'

import { TableColumnProps } from '@/components/table/bt-table/types'

import BtInput from '@/components/form/bt-input'
import { Message, useConfirm, useDataHandle, useDataPage, useHandleError } from '@/hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'
import { openPluginView, productPaymentDialog } from '@/public'
import { defaultVerify, formatTime, getByteUnit } from '@/utils'
import { useSiteStore } from '@/views/site/useStore'
import { getDataInfo, getPluginInfo } from '@api/global'
import { createBoce, getAlarmList, getBoceList, getBoceLog, modifyBoce, removeBoce, removeTaskLog, startBoce } from '@api/site'
import { useGlobalStore } from '@/store/global'

const { siteInfo } = useSiteStore()
const { payment } = useGlobalStore()

export const tableData = ref([]) // 响应式数据
export const tableLoading = ref(false) // 响应式数据
export const pushCheckBoxRef = ref<any>(null) // 告警方式

export const boceFormRef = ref<any>(null) // 表单实例

export const dialingTestPopup = ref(false) // 拨测告警弹窗
export const dialingTestForm = reactive<any>({
	url: '',
	channel: [],
	name: '',
	cycle: 10,
	method: '',
	alarm_count: 5,
	address: 'localhost',
	methodData: '',
}) // 拨测告警表单
export const tableParams = reactive({ p: 1, limit: 12, total: 0 }) // 表格分页参数
export const domainOptions = ref<any>([]) // 域名列表
export const typeOptions = ref<any>([]) // 告警类型

export const resultColumn = [
	{ label: 'ISP', prop: 'isp' },
	{ label: '解析IP', prop: 'primary_ip' },
	{ label: '状态', prop: 'http_code' },
	{
		label: '总耗时',
		prop: 'total_time',
		render: (row: any) => set_time_limit(1000, 500, row.total_time, 'ms'),
	},
	{
		label: '解析耗时',
		prop: 'namelookup_time',
		render: (row: any) => set_time_limit(500, 100, row.namelookup_time, 'ms'),
	},
	{
		label: '连接耗时',
		prop: 'connect_time',
		render: (row: any) => set_time_limit(500, 100, row.connect_time, 'ms'),
	},
	{
		label: '处理耗时',
		prop: 'starttransfer_time',
		render: (row: any) => set_time_limit(1000, 500, row.starttransfer_time, 'ms'),
	},
	{
		label: '响应大小',
		prop: 'size_download',
		render: (row: any) => getByteUnit(row.size_download),
	},
	{
		label: '传输速度',
		prop: 'speed_download',
		render: (row: any) => getByteUnit(row.speed_download),
	},
	{
		label: '响应头',
		prop: 'header',
		width: 280,
		render: (row: any) => {
			return <BtInput type="textarea" readOnly rows={6} model-value={row.header} class="!w-full"></BtInput>
		},
	},
] // 结果数据
export const resultData = ref([]) // 响应式数据
export const resultPopup = ref(false) // 结果弹窗

export const logParams = reactive({ p: 1, total: 0, pid: 0, url: '' }) // 日志分页参数
export const logPopup = ref<boolean>(false) // 日志弹窗
export const logData = ref<any>([]) // 响应式数据

export const rules = reactive({
	name: [defaultVerify({ message: '请输入任务名称' })],
	cycle: [defaultVerify({ message: '请输入监控频率' })],
	alarm_count: [defaultVerify({ message: '请输入告警次数' })],
	channel: [defaultVerify({ message: '请选择告警方式' })],
	methodData: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (['delay', 'keyword'].includes(dialingTestForm.method) && value === '') {
					callback(new Error('请输入告警条件'))
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
})

export const useTableColumn = () => {
	return shallowRef<TableColumnProps[]>([
		{
			label: '任务名称',
			prop: 'name',
			showOverflowTooltip: true, // 超出是否展示tooltip，默认为false
		},
		{
			label: '监控频率',
			render: (row: any) => `${row.cycle}分钟`,
		},
		{
			label: '触发条件',
			prop: 'trigger_condition',
			showOverflowTooltip: true, // 超出是否展示tooltip，默认为false
		},
		{
			label: '最后执行时间',
			width: 148,
			render: (row: any) => {
				return formatTime(row.last_run_time) || '--'
			},
		},
		{
			label: '状态	',
			prop: 'method',
			width: 54,
			render: (row: any) => {
				return <ElSwitch modelValue={row.status ? true : false} size="small" onChange={() => handleChangeStatus(row)}></ElSwitch>
			},
		},
		useOperate([
			{ onClick: startTaskEvent, title: '执行' },
			{
				onClick: (row: any) => {
					dialingTestPopup.value = true
					Object.keys(dialingTestForm).forEach(key => {
						switch (key) {
							case 'method':
								dialingTestForm.method = row.status_code ? 'status_code' : row.size ? 'size' : row.delay ? 'delay' : 'keyword'
								break
							case 'methodData':
								dialingTestForm.methodData = row.delay || row.size || row.keyword || row.status_code
								break
							case 'channel':
								dialingTestForm.channel = row.channel?.split(',')
								break
							default:
								dialingTestForm[key] = row[key]
								break
						}
					})
					dialingTestForm.id = row.id
				},
				title: '编辑',
			},
			{ onClick: getLogs, title: '日志' },
			{ onClick: deleteDataEvent, title: '删除' },
		]),
	])
}

export const useLogTableColumn = () => {
	return shallowRef<TableColumnProps[]>([
		{ label: 'ID', prop: 'id', width: 80 },
		{ label: '平均耗时', prop: 'avgrage' },
		{
			label: '最快',
			prop: 'min_isp',
			render: (row: any) => {
				return (
					<span>
						{row.min_isp}（{row.min}ms）
					</span>
				)
			},
		},
		{
			label: '最快',
			prop: 'max_isp',
			render: (row: any) => {
				return (
					<span>
						{row.max_isp}（{row.max}ms）
					</span>
				)
			},
		},
		{
			label: '执行时间',
			prop: 'addtime',
			width: 150,
			render: (row: any) => {
				return formatTime(row.addtime) || '--'
			},
		},
		{
			label: '状态',
			prop: 'status',
			width: 75,
			render: (row: any) => {
				const status = row.status == 1
				return <span class={status ? 'text-primary' : 'text-danger'}>{status ? '执行成功' : '执行错误'}</span>
			},
		},
		useOperate([
			{
				onClick: deleteBoceLog,
				title: '删除',
			},
		]),
	])
}

/**
 * 设置时间额度
 * @returns
 */
export const set_time_limit = (limit1: any, limit2: any, data: any, units: string) => {
	var style_s = ''
	if (data > limit1) {
		style_s = 'text-warning'
	} else if (data > limit2) {
		style_s = 'text-[var(--el-color-warning-light-3)]'
	}
	return <span class={style_s}>{data.toFixed(2) + units}</span>
}

/**
 * @description 选择告警方式
 */
export const onGiveSelect = (val: any) => {
	dialingTestForm.channel = val
}

/**
 * @description 添加拨测告警
 */
export const addAlertEvent = async () => {
	await getDomain()
	// dialingTestForm.name为告警类型+网站url 此处为初始化
	delete dialingTestForm.id
	dialingTestForm.name = `${typeOptions.value?.find((item: any) => item.id === 'status_code')?.name} 【${domainOptions.value[0]?.name}】`
	dialingTestPopup.value = true
}

/**
 * @description 获取告警配置
 */
export const getAlarmOption = async () => {
	tableLoading.value = true
	// 请求接口
	try {
		const res = await getAlarmList()
		typeOptions.value = []
		Object.keys(res.data).forEach(key => {
			typeOptions.value.push({ id: key, name: res.data[key] })
		})
		typeOptions.value = typeOptions.value?.filter((item: any) => item.id !== 'sensitive' && item.id !== 'similarity')
		dialingTestForm.method = 'status_code'
	} catch (error) {
		console.log(error)
	}
	tableLoading.value = false
}

/**
 * @description 获取域名列表
 */
export const getDomain = async () => {
	tableLoading.value = true
	// 请求接口
	try {
		const res = await getDataInfo({
			table: 'domain',
			list: 'True',
			search: siteInfo.value.id,
		})
		domainOptions.value = []
		res.data?.forEach((item: any) => {
			domainOptions.value.push({ name: 'http://' + item.name, id: item.id })
			domainOptions.value.push({ name: 'https://' + item.name, id: item.id })
		})
		dialingTestForm.url = domainOptions.value[0]?.name
	} catch (error) {
		useHandleError(error)
	}
	tableLoading.value = false
}

/**
 * @description 获取 拨测告警列表
 */
export const getAlarmListEvent = async () => {
	const res = await useDataHandle({
		loading: tableLoading,
		request: getBoceList({
			sid: siteInfo.value.id,
			p: tableParams.p,
			row: tableParams.limit,
		}),
		data: {
			data: [Array, tableData],
			page: useDataPage(tableParams),
			row: String,
		},
	})
	tableParams.limit = Number(res.row)
}

/**
 * @description 添加修改告警
 */
export const onConfirm = async () => {
	if (payment.value.authType !== 'ltd' && dialingTestForm.address === 'node') {
		Message.error('多节点测试为企业版专享功能，请升级为企业版后使用')
		return false
	}

	await boceFormRef.value.validate()
	let params = {
		...dialingTestForm,
		channel: Array.isArray(dialingTestForm.channel) ? dialingTestForm.channel : dialingTestForm.channel.join(','),
		[dialingTestForm.method]: ['delay', 'keyword'].includes(dialingTestForm.method) ? dialingTestForm.methodData : 1,
	}
	delete params.methodData

	const requestFun = dialingTestForm.id ? modifyBoce : createBoce

	const res = await useDataHandle({
		loading: '正在提交,请稍候...',
		request: requestFun(params),
		data: {
			status: Boolean,
			msg: String,
		},
	})
	if (res.status) {
		Message.success(res.msg)
		getAlarmListEvent()
	} else {
		Message.msg({
			customClass: 'el-error-html-message',
			dangerouslyUseHTMLString: true,
			message: res.msg,
			showClose: true,
			type: 'error',
			duration: 5000,
		})
	}
	cancelForm()
}

/**
 * @description 执行告警
 */
export const startTaskEvent = async (row: any) => {
	let loading = Message.load('正在执行，请稍候...')
	try {
		const res = await startBoce({ id: row.id })
		if (res.status) {
			resultPopup.value = true
			resultData.value = res.data
			getAlarmListEvent()
		} else {
			Message.request(res)
		}
	} catch (error) {
		useHandleError(error)
	} finally {
		loading.close()
	}
}

/**
 * @description 删除告警
 */
export const deleteDataEvent = async (row: any) => {
	const res = await useDataHandle({
		loading: '正在删除，请稍后...',
		request: removeBoce({ id: row.id, action: 'del' }),
		message: true,
	})
	if (res.status) getAlarmListEvent()
}

/**
 * @description 删除日志
 */
export const deleteBoceLog = async (row: any) => {
	await useConfirm({
		title: `删除日志【${row.id}】`,
		content: '删除后，该条日志将永久删除，是否继续操作？',
	})
	const res = await useDataHandle({
		loading: '正在删除，请稍后...',
		request: removeTaskLog({ id: row.id }),
		message: true,
	})
	if (res.status) getBoceLogEvent()
}

/**
 * @description 获取日志
 */
export const getLogs = async (row: any) => {
	let loading = Message.load('正在获取日志，请稍候...')
	try {
		logParams.pid = row.id
		logParams.url = row.url
		logParams.p = 1
		getBoceLogEvent((res: any) => {
			if (!res.data.length) return Message.success('暂无日志')
			logPopup.value = true
		})
	} catch (error) {
		console.log(error)
	} finally {
		loading.close()
	}
}

/**
 * @description 获取拨测日志信息
 */
export const getBoceLogEvent = async (callback?: AnyFunction) => {
	const res = await useDataHandle({
		request: getBoceLog({ pid: logParams.pid, p: logParams.p }),
		data: {
			data: [Array, logData],
			'page.page': useDataPage(logParams),
		},
	})
	if (callback) callback(res)
}

/**
 * @description  检测节点改变
 */
export const handleChangeMethod = async (val: string) => {
	dialingTestForm.address = 'localhost'
	if (val === 'node') {
		const status = await getPluginState()
		if (status) dialingTestForm.address = 'node'
	}
}

/**
 * @description  告警类型改变
 */
export const handleChangeType = (val: string) => {
	// 清除表单methodData校验
	nextTick(() => {
		boceFormRef.value.clearValidate('methodData')
		if (val === 'status_code' || val === 'size') {
			dialingTestForm.methodData = '1'
		} else {
			dialingTestForm.methodData = ''
		}
		dialingTestForm.name = `${typeOptions.value?.find((item: any) => item.id === val)?.name} 【${dialingTestForm.url}】`
	})
}

/**
 * @description  获取插件状态
 */
export const getPluginState = async () => {
	// 请求接口
	try {
		const { data } = await getPluginInfo({
			sName: 'bt_boce',
		})
		if (data.status) return true
		if (data.endtime < 0) {
			productPaymentDialog({
				disablePro: true,
				sourceId: 182,
			})
		} else {
			await openPluginView({ name: 'bt_boce', softData: data })
		}
		return false
		// await openPluginView({ name: 'bt_boce', softData: data })
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 取消表单
 */
export const cancelForm = () => {
	dialingTestPopup.value = false
	boceFormRef.value.resetFields()
	boceFormRef.value.clearValidate()
}

/**
 * @description 修改告警状态
 */
export const handleChangeStatus = async (row: any) => {
	await useConfirm({
		title: `${row.status ? '停用拨测告警' : '启用拨测告警'}`,
		content: `${row.status ? '停用后,检测到问题时将不会发送告警通知，是否继续？' : '启用后,检测到问题时将会发送告警通知，是否继续？'}`,
		icon: 'warning-filled',
	})
	const res = await useDataHandle({
		loading: '正在设置，请稍后...',
		request: modifyBoce({
			id: row.id,
			status: row.status ? 0 : 1,
		}),
		message: true,
	})
	if (res.status) getAlarmListEvent()
}

export const handleChangeName = (val: string) => {
	dialingTestForm.name = `${typeOptions.value[0]?.name} 【${val}】`
}

/**
 * @description 刷新告警方式
 */
export const refreshPushForm = () => {
	pushCheckBoxRef.value.renderPushConfig()
}

export const tableColumns = useTableColumn()
export const logColumns = useLogTableColumn()
