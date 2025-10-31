import { createIpRules, deleteFtp, editFtpStatus, exitFtpLogsStatus, ftpUsers, getAnalysisConfig, getWhiteList, logAnalysis, setAnalysisConfig, setCronTask, setWhiteList } from '@api/ftp'

import { Message, useConfirm, useDataHandle, useDialog, useHandleError } from '@/hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'
import { useGlobalStore } from '@/store/global'
import type { ResponseResult } from '@/types'
import { isArray } from '@/utils'
import type { FtpLogTableDataProps } from '@ftp/types'
import { useFtpAnalysisStore } from './useStore'
import { productPaymentDialog } from '@/public'
import { isSearchClick } from '@ftp/useController'
import { useFtpStore } from '@ftp/useStore'

const { payment } = useGlobalStore()
const { isRefreshFtpList } = useFtpStore()
const { ftpAnalysisList, ruleForm, whiteTableData, ip, setScanInfo, addFtpInfo, isAutoScan, userOptions, isLoading, areaOptions } = useFtpAnalysisStore()

/**
 * @description 拉黑IP事件
 * @param {FtpLogTableDataProps} data IP信息
 * @returns {Promise<void>}
 */
export const maskIpEvent = async ({ ip }: FtpLogTableDataProps): Promise<void> => {
	await useConfirm({
		icon: 'warning-filled',
		title: 'IP封禁',
		content: '封禁【' + ip + '】后，将不再允许此IP访问服务器，是否继续操作？',
	})
	// 封禁IP参数
	const param = JSON.stringify({
		choose: 'address',
		address: ip,
		domain: '',
		types: 'drop',
		brief: 'FTP日志分析点击IP拉黑',
	})
	// 封禁IP
	const data: ResponseResult = await useDataHandle({
		loading: '正在封禁IP，请稍后...',
		request: createIpRules({ data: param }),
		data: { status: Boolean },
		message: true,
	})
	if (data.status) getScanData()
}

/**
 * @description 删除账号事件
 * @param {FtpLogTableDataProps} data 账号信息
 * @returns {Promise<void>}
 */
export const deleteDataEvent = async ({ user, id }: FtpLogTableDataProps): Promise<void | boolean> => {
	if (id === 0) {
		Message.error('匿名用户不可删除')
		return false
	}
	await useConfirm({
		icon: 'warning-filled',
		title: '删除FTP用户',
		content: '删除选中的FTP用户后，该FTP用户将彻底失去访问和操作权限，是否继续操作？',
	})
	// 删除FTP用户
	const data: ResponseResult = await useDataHandle({
		loading: '正在删除FTP用户，请稍后...',
		request: deleteFtp({ id: id, username: user }),
		data: { status: Boolean },
		message: true,
	})
	// 刷新列表
	if (data.status) {
		getScanData()
		isRefreshFtpList.value = true
	}
}

/**
 * @description 停用账号事件
 * @param {FtpLogTableDataProps} data 账号信息
 * @returns {Promise<void>}
 */
export const stopDataEvent = async ({ user, id }: FtpLogTableDataProps): Promise<void | Message> => {
	if (id === 0) return Message.error('匿名用户不可停用')
	await useConfirm({
		icon: 'warning-filled',
		title: '停用FTP用户',
		content: '停用【' + user + '】后，该FTP用户将失去访问权限，是否继续操作？',
	})
	// 停用FTP用户
	const data: ResponseResult = await useDataHandle({
		loading: '正在停用FTP用户，请稍后...',
		request: editFtpStatus({ id, username: user, status: 0 }),
		data: { status: Boolean },
		message: true,
	})
	if (data?.status) {
		getScanData()
		isRefreshFtpList.value = true
	}
}

/**
 * @description 忽略事件
 * @param {FtpLogTableDataProps} data IP信息
 */
export const ignoreScanEvent = async ({ ip }: FtpLogTableDataProps) => {
	await useConfirm({
		icon: 'warning-filled',
		title: '忽略IP',
		content: '忽略【' + ip + '】后，该IP将加入白名单中，FTP日志分析将不在记录该IP的数据，是否继续操作？',
	})
	// 忽略IP
	const data: ResponseResult = await useDataHandle({
		loading: '正在忽略IP，请稍后...',
		request: setWhiteList({ ip: ip, type: 'add' }),
		data: { status: Boolean },
		message: true,
	})
	if (data.status) getScanData()
}

/**
 * @description 获取扫描数据
 */
export const getScanData = async (
	params: { search: string; day: number; user: string } = {
		search: ruleForm.value.search,
		day: ruleForm.value.day === 'other' ? Number(ruleForm.value.otherDay) : Number(ruleForm.value.day),
		user: ruleForm.value.user === 'all' ? '[]' : JSON.stringify(ruleForm.value.userList),
	}
) => {
	try {
		const rdata = await logAnalysis(params)
		if (rdata.status) {
			ftpAnalysisList.value.data = []
			for (const key in rdata.data) {
				const item = rdata.data[key]
				ftpAnalysisList.value.data.push({
					time: item.exec_time,
					type: item.type,
					user: item.user,
					ip: key,
					id: item.id,
				})
			}
		}
	} catch (error) {
		useHandleError(error)
	}
}

/**
 * @description 弹窗关闭事件
 */
export const $reset = () => {
	ftpAnalysisList.value = {
		scanStatus: false,
		autoScanText: '定时自动扫描',
		btn: '立即扫描',
		data: [],
	}
	ruleForm.value = {
		login_error: true, // 多次登录失败
		time: true, // 时间
		area: true, // 地区
		anonymous: true, // 匿名用户登录
		upload_shell: true, // 上传脚本文件
		day: 7 as number | string, // 扫描天数
		otherDay: 1, // 自定义天数
		user: 'all', // 用户选择
		userList: [] as string[], // 用户列表
		cycle: 1,
		channel: [] as string[], // 信息通道
		option: {} as any, // 信息配置
		config: {
			login_error: 5,
			time: {
				start_time: 0,
				end_time: 24,
			},
			area: {
				country: [],
				city: [],
			},
			upload_shell: [],
			login_error_des: '超过5次',
			time_des: '0点至24点范围外',
			area_des: '非地区',
			upload_shell_des: '未配置',
		} as any, // 安全风险配置数据
		search: '', // 搜索条件
		status: true, // 告警状态
	}
}

// 表单验证规则
export const rules = reactive({
	login_error: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (value > 0) {
					callback()
				} else {
					callback('请输入大于0的整数')
				}
			},
			trigger: ['change'],
		},
	],
	se_time: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (!ruleForm.value.config.start_time || !ruleForm.value.config.end_time) {
					callback('开始时间和结束时间不能为空')
				} else {
					callback()
				}
			},
			trigger: ['blur'],
		},
	],
})

/**
 * @description: 地区选择
 * @param {any} value 选择的值
 */
export const countryChange = (value: any) => {
	ruleForm.value.config.area.country = value
}

/**
 * @description: 开始时间选择
 * @param {any} value 选择的值
 */
export const startChange = (value: any) => {
	ruleForm.value.config.start_time = value
}

/**
 * @description: 结束时间选择
 */
export const endChange = (value: any) => {
	ruleForm.value.config.end_time = value
}

/**
 * @description: 获取提交参数
 */
export const getSubmitParameters = (form: AnyObject = ruleForm.value.config) => {
	let params: any = {
		time: JSON.stringify({
			start_time: Number(form.start_time.split(':')[0]),
			end_time: Number(form.end_time.split(':')[0]),
		}),
		area: JSON.stringify({
			country: form.area.country,
			city: [],
		}),
		upload_shell: JSON.stringify(form.upload_shell_br.split('\n')),
		login_error: form.login_error,
	}
	return params
}

/**
 * @description: 配置后立即扫描
 */
export const onScan = async (close: AnyFunction): Promise<void | boolean> => {
	await setScanInfo.value.validate()
	const params = getSubmitParameters()
	// 提交数据
	const data: ResponseResult = await useDataHandle({
		loading: '正在提交中数据，请稍候...',
		request: setAnalysisConfig(params),
		message: true,
	})
	if (data.status) {
		getFtpLogAnalysisConfig() // 刷新数据
		close && close()
	}
}

// 获取地区选项
export const getAreaOptions = () => {
	const worldData = ['美国', '中国', '印度', '日本', '德国', '英国', '法国', '俄罗斯', '巴西', '加拿大', '意大利', '澳大利亚', '韩国', '墨西哥', '印度尼西亚', '沙特阿拉伯', '南非', '阿根廷', '土耳其', '西班牙']
	areaOptions.value = worldData.map(item => ({ label: item, value: item }))
}

/**
 * @description 删除白名单IP
 * @param {string} ip - ip地址
 */
export const deleteIpEvent = async (ip: string) => {
	const data: ResponseResult = await useDataHandle({
		loading: '正在删除白名单IP，请稍后...',
		request: setWhiteList({ ip, type: 'del' }),
		data: { status: Boolean },
		message: true,
	})
	if (data.status) {
		getWhiteListData() // 刷新数据
		getScanData() // 刷新数据
	}
}

export const whiteColumn = [
	{ label: 'IP', render: (row: string) => <span>{row}</span> },
	useOperate([{ onClick: deleteIpEvent, title: '删除' }]), // 操作
]

/**
 * @description 添加白名单IP
 * @param {string} params.ip - ip地址
 * @param {string} params.type - 操作类型
 */
export const addIpEvent = async (params: { ip: string; type: string } = { ip: ip.value, type: 'add' }) => {
	if (!params.ip) {
		Message.error('请输入ip地址')
		return
	}
	if (!/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.test(params.ip)) {
		Message.error('请输入正确的ip地址')
		return
	}
	// 添加白名单IP
	await useDataHandle({
		loading: '正在添加白名单IP，请稍后...',
		request: setWhiteList(params),
		data: { status: Boolean },
		message: true,
		success: (res: any) => {
			if (res.status) {
				ip.value = ''
				getWhiteListData() // 刷新数据
				getScanData() // 刷新数据
			}
		},
	})
}

/**
 * @description 获取白名单列表数据
 */
export const getWhiteListData = async () => {
	const data: ResponseResult = await useDataHandle({
		loading: '正在获取白名单列表，请稍后...',
		request: getWhiteList(),
		data: { ip: [Array<string>, whiteTableData] },
	})
}

// 表单验证规则
export const timedScanRules = shallowReactive<Partial<Record<string, any>>>({
	otherDay: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (ruleForm.value.day === 'other') {
					if (value < 1 || !Number.isInteger(parseFloat(value))) {
						callback(new Error('天数必须大于0的整数'))
					} else {
						callback()
					}
				} else {
					callback()
				}
			},
			trigger: ['change'],
		},
	],
	userList: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (ruleForm.value.user === 'other') {
					if (value.length === 0) {
						callback('请选择指定用户')
					} else {
						callback()
					}
				} else {
					callback()
				}
			},
			trigger: ['change'],
		},
	],
	risk: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (ruleForm.value.login_error || ruleForm.value.time || ruleForm.value.area || ruleForm.value.anonymous || ruleForm.value.upload_shell) {
					callback()
				} else {
					callback('请至少选择一个安全风险')
				}
			},
			trigger: ['change'],
		},
	],
	// cycle: [
	// 	{ required: true, message: '请输入周期', trigger: 'blur' },
	// 	{
	// 		validator: (rule: any, value: any, callback: any) => {
	// 			let cycle = Number(value)
	// 			if (value === '') {
	// 				callback(new Error('周期不能为空'))
	// 			} else if (cycle < 1) {
	// 				callback(new Error('周期必须大于0'))
	// 			} else {
	// 				callback()
	// 			}
	// 		},
	// 		trigger: ['input'],
	// 	},
	// ],
	channel: [
		{
			type: 'array',
			required: true,
			message: '请至少选择一个告警方式',
			trigger: 'change',
		},
	],
})

/**
 * @description: 地区参数处理
 */
export const getAreaParameters = (area: AnyObject) => {
	const { country, city } = area
	const countries = isArray(country) ? country.join(',') : ''
	const cities = isArray(city) ? city.join(',') : ''
	return `非${countries}${countries && cities ? ',' : ''}${cities}地区`
}

/**
 * @description: 获取ftp日志分析配置
 */
export const getFtpLogAnalysisConfig = async () => {
	isLoading.value = true
	try {
		const { data } = await getAnalysisConfig()
		const { area, cron_task_status, time, login_error, upload_shell, cron_task } = data
		ruleForm.value.config = {
			...data,
			login_error_des: `超过${login_error}次`,
			time_des: `${time.start_time}点至${time.end_time}点范围外`,
			area_des: getAreaParameters(area),
			upload_shell_des: isArray(upload_shell) ? upload_shell.join(',') : '',
		}

		if (isAutoScan.value && cron_task_status) {
			const { task_type, cycle, channel } = cron_task
			Object.assign(ruleForm.value, {
				anonymous: task_type.anonymous,
				area: task_type.area,
				login_error: task_type.login_error,
				time: task_type.time,
				upload_shell: task_type.upload_shell,
				cycle,
				channel: channel ? channel.split(',') : [],
				status: !!cron_task_status,
			})
		} else {
			Object.assign(ruleForm.value, {
				anonymous: true,
				area: true,
				login_error: true,
				time: true,
				upload_shell: true,
			})
		}
	} catch (error) {
		useHandleError(error)
	} finally {
		isLoading.value = false
	}
}

/**
 * @description 设置扫描触发条件
 */
export const openLogsSetScanConditionEvent = () => {
	useDialog({
		title: '扫描触发条件',
		area: [50, 34],
		btn: ['保存', '取消'],
		component: () => import('@ftp/views/logs-analysis/scan.vue'),
	})
}

/**
 * @description: FTP用户选择事件
 * @param {string} val 用户选择的值
 */
export const userChange = (val: string) => {
	ruleForm.value.user = val
	if (val === 'other') {
		ruleForm.value.anonymous = false
	}
}

/**
 * @description 获取全部ftp用户
 */
export const getAllFtpUser = async () => {
	try {
		const { data } = await ftpUsers()
		if (isArray(data)) {
			userOptions.value = []
			data.forEach((item: any) => {
				userOptions.value.push({
					label: item,
					value: item,
				})
			})
			ruleForm.value.userList = data.length > 0 ? [data[0]] : []
		}
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description: 获取提交参数
 * @param {AnyObject} form 表单数据
 * @param {boolean} isAuto 是否自动扫描
 */
export const getTimeScanParameters = (form: AnyObject = ruleForm.value, isAuto: boolean = isAutoScan.value) => {
	let params: any = {}
	const search = JSON.stringify({
		anonymous: form.anonymous,
		area: form.area,
		login_error: form.login_error,
		time: form.time,
		upload_shell: form.upload_shell,
	})
	if (!isAuto) {
		params = {
			search,
			day: form.day === 'other' ? Number(form.otherDay) : form.day,
			username: form.user === 'all' ? '[]' : JSON.stringify(form.userList),
		}
	} else {
		params = {
			task_type: search,
			cycle: 1,
			channel: form.channel.join(','),
			status: form.status ? 1 : 0,
		}
	}
	return params
}

/**
 * @description: 配置后立即扫描
 */
export const onTimedScanConfirm = async (close: AnyFunction): Promise<void | boolean> => {
	await addFtpInfo.value.validate()
	let load: any
	try {
		load = Message.load('扫描中...')
		const params = getTimeScanParameters()
		ruleForm.value.search = params?.search || params?.task_type
		if (!isAutoScan.value) {
			const rdata = await logAnalysis(params)
			Message.request({
				status: rdata.status,
				msg: rdata.status ? '扫描成功' : '扫描失败',
				time: 500,
			})
			if (rdata.status) {
				ftpAnalysisList.value.data = []
				for (const key in rdata.data) {
					const item = rdata.data[key]
					ftpAnalysisList.value.data.push({
						time: item.exec_time,
						type: item.type,
						user: item.user,
						ip: key,
						id: item.id,
					})
					// 数据根据时间降序
					ftpAnalysisList.value.data.sort((a: any, b: any) => {
						return new Date(b.time?.replace(/-/g, '/')).getTime() - new Date(a.time?.replace(/-/g, '/')).getTime()
					})
				}
				ftpAnalysisList.value.btn = '重新扫描'
				ftpAnalysisList.value.scanStatus = true
				close()
			}
		} else {
			// 设置自动任务
			const rdata = await setCronTask(params)
			Message.request(rdata)
			if (rdata.status) {
				getFtpLogAnalysisConfig() // 刷新数据
			}
			close()
		}
	} catch (error) {
		useHandleError(error)
	} finally {
		load?.close()
	}
}

export const initTimeScan = () => {
	ruleForm.value.config = {
		login_error: 5,
		time: {
			start_time: 0,
			end_time: 24,
		},
		area: {
			country: [],
			city: [],
		},
		upload_shell: [],
		login_error_des: '超过5次',
		time_des: '0点至24点范围外',
		area_des: '非地区',
		upload_shell_des: '未配置',
	}
	getAllFtpUser()
	getFtpLogAnalysisConfig()
}

export const initScan = () => {
	const delivery = ruleForm.value.config
	Object.assign(ruleForm.value.config, {
		...delivery,
		start_time: delivery.time.start_time < 10 ? `0${delivery.time.start_time}:00` : `${delivery.time.start_time}:00`,
		end_time: delivery.time.end_time < 10 ? `0${delivery.time.end_time}:00` : `${delivery.time.end_time}:00`,
		upload_shell_br: delivery.upload_shell.join('\n'),
	})
	getAreaOptions()
}

// 表格列数据
export const useLogsScanTableColumn = [
	{ label: '类型', prop: 'type', minWidth: 100 },
	{ label: '用户名', prop: 'user', minWidth: 60 },
	{ label: 'IP', prop: 'ip' },
	{ label: '操作时间', prop: 'time' },
	useOperate([
		{ onClick: maskIpEvent, title: 'IP拉黑', width: 50 },
		{ onClick: deleteDataEvent, title: '删除账号', width: 60 },
		{ onClick: stopDataEvent, title: '停用账号', width: 60 },
		{ onClick: ignoreScanEvent, title: '忽略' },
	]), // 操作
]

/**
 * @description 打开FTP日志白名单
 */
export const openFtpLogsWhiteListEvent = () =>
	useDialog({
		title: 'FTP日志白名单',
		area: [70, 45],
		component: () => import('@ftp/views/logs-analysis/whitelist.vue'),
	})

/**
 * @description 打开分析条件事件
 * @param {number} type 0:自动扫描 1:立即扫描
 */
export const openAnalysisConditionEvent = (type: number) => {
	useDialog({
		title: `FTP日志${!type ? '自动分析推送' : '分析条件'}`,
		area: !type ? [70] : [66, 30],
		btn: !type ? '保存配置' : '立即扫描',
		component: () => import('@ftp/views/logs-analysis/timed-scan.vue'),
	})
}

/**
 * @description 判断是否开启日志服务
 * @param {number} type 0:自动扫描 1:立即扫描
 */
export const openLogsAnalysis = async (type: number) => {
	isAutoScan.value = !Boolean(type)
	if (payment.value.authType === 'ltd') {
		// 获取日志服务状态
		const { status, msg }: ResponseResult = await useDataHandle({
			loading: '正在获取日志服务状态，请稍后...',
			request: exitFtpLogsStatus({ exec_name: 'getlog' }),
			data: { status: Boolean, msg: String },
		})
		// 未开启日志服务
		if (!status || msg === 'stop') {
			await useConfirm({
				icon: 'warning-filled',
				title: '开启FTP日志服务',
				content: 'FTP日志服务未启动，无法记录访问日志，是否启动日志服务?',
			})
			const data: ResponseResult = await useDataHandle({
				loading: '正在开启FTP日志服务，请稍后...',
				request: exitFtpLogsStatus({ exec_name: 'start' }),
				data: { status: Boolean },
				message: true,
			})
			if (data?.status) openAnalysisConditionEvent(type)
		}
		openAnalysisConditionEvent(type)
	} else {
		Message.error('企业版专享功能！')
		await productPaymentDialog({
			sourceId: isSearchClick.value ? 260 : 220,
		})
	}
}

export const scanList = [
	{ icon: 'user', title: '多次登录失败' },
	{ icon: 'login-address', title: '登录地区异常' },
	{ icon: 'shell-file', title: '上传脚本文件' },
	{ icon: 'anonymous', title: '匿名用户登录' },
	{ icon: 'login-time', title: '登录时间异常' },
]

export const scanWeekOption = [
	{ label: '7天', value: 7 },
	{ label: '30天', value: 30 },
	{ label: '自定义', value: 'other' },
]

export const userOption = [
	{ label: '全部', value: 'all' },
	{ label: '指定用户', value: 'other' },
]
