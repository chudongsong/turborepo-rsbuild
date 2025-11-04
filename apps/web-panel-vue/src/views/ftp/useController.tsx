import type { TableColumnProps } from '@/components/data/bt-table/types'
import type { TableBatchDialogProps, TableBatchEventProps, TableBatchNextAllProps, TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import type { SelectOptionProps } from '@/components/form/bt-select/types'
import type { FtpTableRowProps } from './types'

import {
	addFtp,
	editFtp,
	editFtpPassword,
	editFtpPort,
	getFtpAccess,
	getFtpAlarm,
	setAccess as setAccessApi,
	setFtpDate,
	setFtpQuota,
	deleteFtp,
	editFtpStatus,
	getFtpActionLogs as getFtpActionLogsApi,
	getFtpClassList,
	getFtpLoginLogs as getFtpLoginLogsApi,
	setFtpBatchClass,
	exitFtpLogsStatus,
	batchDelFtp,
	batchFtpStatus,
} from '@/api/ftp'
import { useRequestCanceler } from '@hooks/tools/axios/model/axios-cancel' // 取消请求
import { getDataList, getSoftStatus } from '@api/global'
import { useConfirm, useDataHandle, useDialog, useMessage } from '@/hooks/tools'
import { isUndefined, getPageTotal } from '@/utils'
import { assembBatchParams, assembBatchResults, batchClassDialog, openResultView, productPaymentDialog } from '@/public'
import { useBatchStatus } from '@/hooks/tools/table/column'
import { useFtpStore } from '@ftp/useStore'
import { useGlobalStore } from '@/store/global'

const Message = useMessage()

type CallbackProps = (data?: any) => void

const { payment, getGlobalInfo } = useGlobalStore()

export const isSearchClick = ref(false) // 是否从搜索推荐点击

/********** FTP 添加/修改 业务 **********/

/**
 * @description: 获取提交参数
 * @param {AnyObject} form 表单数据
 * @param {Number} id 编辑时的id 添加不传
 */
export const getAddEditFtpParamTools = (form: any, id?: number) => {
	let params: any = {
		path: form.path,
		ftp_username: form.name,
	}
	if (isUndefined(id)) {
		params['id'] = id
		params['new_password'] = form.password
	} else {
		params['ftp_password'] = form.password
		params['ps'] = form.name
	}
	return params
}

/**
 * @description 添加编辑FTP
 * @param params 接口参数
 * @param ref 表单ref
 * @param isEdit 是否编辑状态
 * @param callback 回调函数
 */
export const addAndEditFtp = async (param: any, isEdit: boolean, callback?: CallbackProps) => {
	try {
		const res = await useDataHandle({
			loading: `正在${!isEdit ? '添加' : '修改'}FTP账号，请稍后...`,
			request: isEdit ? editFtp(param) : addFtp(param),
			data: { status: Boolean },
			message: true,
			success: (res: any) => {
				isRefreshFtpList.value = true // 刷新列表
				callback && callback(res) // 回调函数
			},
		})
		return res.status
	} catch (error) {
		console.log(error)
		return false
	}
}

/********** FTP 容量 业务 **********/
/**
 * @description 获取修改密码参数
 * @param form 表单数据
 * @param selectedList 表格选中数据
 */
export const getEditPwdParamsTools = (form: AnyObject, selectedList: Array<any>) => {
	const editorData = selectedList.map((item: any) => ({
		id: item.id,
		ftp_username: item.name,
		new_password: form.type == '0' ? form.password : item.password,
	}))
	return { data: JSON.stringify(editorData) }
}

/**
 * @description 批量修改FTP密码
 * @param params 接口参数 { data: JSON.stringify({...}) }
 * @param ref 表单ref
 * @param callback 回调函数
 */
export const batchEditPwd = async (params: any, ref: any, callback?: CallbackProps) => {
	await ref.value.validate()
	await useConfirm({
		title: '提示',
		width: '35rem',
		content: '修改FTP密码后，旧密码将无法登录FTP账号，是否继续操作？',
	})
	await useDataHandle({
		loading: '正在修改FTP密码，请稍候...',
		request: editFtpPassword(params),
		data: Array,
		success: (res: any) => {
			const status = res.every((item: AnyObject) => item.status)
			if (status) {
				Message.success('批量修改FTP密码成功！')
				callback && callback(res)
			}
		},
	})
}

/********** FTP 容量 业务 **********/
/**
 * @description 获取配额容量提交参数
 * @param {Object} form 表单数据 capacityData
 * @param {string} path 组件数据 rowData.path
 * @returns {Object} 提交参数
 */
export const getCapacitySubmitParamTools = (form: AnyObject, path: string) => {
	let params: any = {
		path,
		quota_type: 'ftp',
		quota_push: {
			status: form.status,
			size: Number(form.alarmSize),
			push_count: Number(form.alarmNum),
			module: form.module?.join(','),
		},
		quota_storage: { size: Number(form.size) },
	}
	return params
}

/**
 * @description 编辑FTP配额容量
 * @param params 接口参数 { data: JSON.stringify({...}) }
 * @param ref 表单ref
 * @param callback 回调函数
 */
export const editFtpCapacity = async (params: any, ref: any, callback?: CallbackProps) => {
	await ref.value.validate() // 校验表单
	// 提交数据
	await useDataHandle({
		loading: '正在提交，请稍候...',
		request: setFtpQuota(params),
		data: { status: Boolean, msg: String },
		success: (res: any) => {
			if (res.status) {
				Message.success(res.msg)
				callback && callback(res)
			} else {
				Message.msg({
					customClass: 'el-error-html-message',
					dangerouslyUseHTMLString: true,
					message: res.msg,
					showClose: true,
					type: 'error',
					duration: 0,
				})
			}
		},
	})
}

/********** FTP 修改FTP端口 业务 **********/
/**
 * @description 修改端口
 * @param port 端口 number
 * @param ref 表单ref
 * @param callback 回调函数
 */
export const editPort = async (param: any) => {
	try {
		const res = await useDataHandle({
			loading: '正在修改FTP端口，请稍后...',
			request: editFtpPort({ port: param.port }),
			data: { status: Boolean },
			message: true,
		})
		if (res.status) getGlobalInfo()
		return res.status
	} catch (error) {
		console.log(error)
		return false
	}
}

/********** FTP 密码有效期 业务 **********/
/**
 * @description 设置到期时间配置
 * @param {number} id
 */
export const setConfigData = async (id: number) => {
	try {
		const data: AnyObject = await useDataHandle({
			loading: '正在设置到期密码配置，请稍候...',
			request: getFtpAlarm({ id }),
			data: { channel: String, push_action: String },
		})
		return data
	} catch (error) {
		console.log(error)
		return { channel: '', push_action: '' }
	}
}

/**
 * @description 修改FTP密码有效期
 * @param params 接口参数
 * @param ref 表单ref
 * @param callback 回调函数
 */
export const changePwdValidity = async (params: any, ref: any, callback?: CallbackProps) => {
	// await ref.value.validate()
	// await useDataHandle({
	// 	loading: '正在设置到期密码配置，请稍候...',
	// 	request: setFtpDate(params),
	// 	data: { status: Boolean },
	// 	message: true,
	// 	success: (res: any) => {
	// 		callback && callback(res)
	// 	},
	// })
	// ftpForm.value.channel = ftpForm.value.channel.filter((item: any) => item !== '')
	// await updateFtpInfo.value.validate()
	// const param = {
	// 	id: JSON.stringify([rowData.value.id]),
	// 	end_time: (!isChange.value && !Number(rowData.value.end_time)) || selectValue.value == 0 ? 0 : new Date(datePicker.value).getTime() / 1000,
	// 	push_action: ftpForm.value.status,
	// 	channel: ftpForm.value.channel.join(','),
	// }
	// const data: ResponseResult = await useDataHandle({
	// 	loading: '正在设置到期密码配置，请稍候...',
	// 	request: setFtpDate(param),
	// 	data: { status: Boolean },
	// 	message: true,
	// })
	// isRefreshFtpList.value = true
	// // FtpViewController.Table.refreshTableData();
	// return data.status
}

/********** FTP 权限配置 业务 **********/
/**
 * @description: 处理获取FTP权限配置数据
 * @param {Object} data 数据
 * @returns {Object} { perForm, unitForms, uNums, dNums }
 */
export const getAccessParamTools = (data: AnyObject): any => {
	let perForm: AnyObject = {},
		unitForms: AnyObject = {},
		uNums: number = 0,
		dNums: number = 0
	// 循环写入表单，并判断特殊三项的单位
	for (const key in data) {
		let item = data[key]
		// 当为时间限制项时，将时间限制转换为数组并赋值
		if (['download_bandwidth', 'upload_bandwidth', 'max_size'].includes(key)) {
			// 截取unit最后两位
			const unitIndex = item.slice(-2)
			unitForms[key] = unitIndex ? unitIndex : 'MB'
			perForm[key] = item.slice(0, -2)
		} else if (key === 'time_restrictions') {
			if (item == '') {
				perForm[key] = [new Date(2021, 1, 1, 0, 0), new Date(2021, 1, 1, 23, 59)]
				continue
			}
			const timeArray = item.split('-')
			const startTime = timeArray[0]
			const endTime = timeArray[1]
			const startHour = startTime.slice(0, 2)
			const startMinute = startTime.slice(2, 4)
			const endHour = endTime.slice(0, 2)
			const endMinute = endTime.slice(2, 4)
			perForm[key] = [new Date(2021, 1, 1, Number(startHour), Number(startMinute)), new Date(2021, 1, 1, Number(endHour), Number(endMinute))]
		} else if (key === 'ratio') {
			if (item == '') item = '0:0'
			const ratioArray = item.split(':')
			uNums = Number(ratioArray[0])
			dNums = Number(ratioArray[1])
		} else {
			perForm[key] = item
		}
	}
	return { perForm, unitForms, uNums, dNums }
}

/**
 * @description 获取FTP权限配置
 * @param {string} username 用户名
 * @returns {Object} { perForm, unitForms, uNums, dNums }
 */
export const getAccess = async (username: string) => {
	try {
		const res: any = await useDataHandle({
			loading: '正在获取FTP权限数据，请稍后...',
			request: getFtpAccess({ username }),
		})
		const data = getAccessParamTools(res.data)
		return data
	} catch (error) {
		console.log(error)
		return {}
	}
}

/**
 * @description: 获取时间
 * @param {Date} time 时间
 * @returns {Array} [startHour, startMinute]
 */
export const getTimeTools = (time: Date): Array<string> => {
	const startHour = time.getHours().toString().padStart(2, '0')
	const startMinute = time.getMinutes().toString().padStart(2, '0')
	return [startHour, startMinute]
}

/**
 * @description: 获取提交参数
 * @param {Object} uForm 单位表单 unitForm
 * @param {Object} pForm 权限表单 accessForm
 * @param {Number} uNums 上传比率
 * @param {Number} dNums 下载比率
 * @param {String} username 用户名
 * @returns {Object} 参数
 */
export const getAccessSubmitParamTools = (uForm: AnyObject, pForm: AnyObject, uNums: number, dNums: number, username: string): AnyObject => {
	// 深拷贝表单数据
	// 将特殊三项拼接单位
	let params: AnyObject = {
		download_bandwidth: '',
		upload_bandwidth: '',
		max_size: '',
	}
	for (const key in uForm) {
		let item = uForm[key],
			itemP = pForm[key]
		if (['download_bandwidth', 'upload_bandwidth', 'max_size'].includes(key)) {
			if (itemP === '') {
				params[key] = '0'
			} else {
				if (item === '') item = 'KB'
				params[key] = itemP + item
			}
		}
	}
	// 转换时间格式 将time_restrictions数组中的第一项起始时间Wed Nov 08 2023 15:24:20 GMT+0800,第二项结束时间转换为字符串HHmm-HHmm
	let time_restrictions = '0000-0000'
	if (Array.isArray(pForm.time_restrictions) && pForm.time_restrictions.length > 0) {
		const startTime = new Date(pForm.time_restrictions[0] as string)
		const endTime = new Date(pForm.time_restrictions[1] as string)
		const [startHour, startMinute] = getTimeTools(startTime)
		const [endHour, endMinute] = getTimeTools(endTime)
		time_restrictions = `${startHour}${startMinute}-${endHour}${endMinute}`
	}
	pForm.ratio = `${uNums ? uNums : '0'}:${dNums ? dNums : '0'}` // 上传和下载比率
	if (pForm.ratio === '0:0') pForm.ratio = '' // 当上传和下载比率为0时，将其置空
	return {
		...pForm,
		time_restrictions,
		username,
		...params,
	}
}

/**
 * @description: 设置ftp权限
 * @param {Object} params 参数
 * @param ref 表单ref
 * @param {Function} callback 回调函数
 */
export const setAccess = async (params: any, ref: any, callback?: CallbackProps) => {
	await ref.value.validate()
	await useDataHandle({
		loading: '正在获取FTP权限数据，请稍后...',
		request: setAccessApi(params),
		data: { status: Boolean },
		message: true,
		success: (res: any) => {
			callback && callback(res)
		},
	})
}

const { isRefreshFtpList, pluginInfo, rowData } = useFtpStore()

/********** FTP公共业务 **********/

/**
 * @description 检查插件状态
 * @returns {Promise<SoftInstallOptionProps>} 插件信息
 */
export const getFtpStatus = async () => {
	try {
		const { data } = await getSoftStatus({ name: 'pure-ftpd' })
		pluginInfo.value = data
		return data
	} catch (error) {
		console.log(error)
		return {}
	}
}

/********** FTP列表业务 **********/

// 缓存对象结构：键是序列化的请求参数，值包含响应数据和时间戳
let cache: { [key: string]: { data: any; timestamp: number; } } = {}

/**
 * @description 获取FTP列表（带请求防抖缓存机制）
 * @param params 请求参数
 * @returns 当快速重复请求时，返回最近100ms内的缓存结果防止空数据
 */
export const getFtpList = async (params: any) => {
	// 生成唯一缓存键（将请求参数序列化为字符串）
	const cacheKey = JSON.stringify(params)
	const now = Date.now()
	
	try {
		// 发起实际网络请求
		const { data: { data, page, search_history, error } } = 
			await getDataList({ ...params, table: 'ftps' })

		// 更新缓存：存储响应数据和时间戳
		cache[cacheKey] = {
			data: {
				data,
				total: getPageTotal(page),
				other: { search_history, error },
			},
			timestamp: now,
		}

		return cache[cacheKey].data
		
	} catch (error) {
		// 处理请求被取消的情况
		if (error.message === 'canceled' && 
			cache[cacheKey] && 
			now - cache[cacheKey].timestamp < 100) 
		{
			// 返回100ms内的缓存数据，避免因取消请求导致界面无数据
			return cache[cacheKey].data
		}
		return { data: [], total: 0, other: { search_history: [] } }
	}
}

/**
 * @description 删除FTP用户
 * @param params 参数
 * @param callback 回调函数
 */
export const deleteFtpUser = async (params: any) => {
	try {
		// 弹出确认框
		await useConfirm({
			icon: 'warning-filled',
			title: `删除FTP用户【${params.name}】`,
			content: `删除FTP用户后，该FTP用户将失去访问权限，是否继续操作？`,
		})

		// 数据处理
		await useDataHandle({
			loading: '正在删除FTP用户，请稍后...',
			request: deleteFtp({ id: params.id, username: params.name }), //{ id, name }
			message: true,
			success: (res: any) => {
				isRefreshFtpList.value = true
			},
		})
	} catch (err) {
		console.warn(err)
	}
}

/**
 * @description 修改状态事件
 * @param params
 * @param callback
 */
export const changeFtpStatus = async ({ id, status, name: username }: any, callback?: CallbackProps) => {
	try {
		const isStatus = Boolean(Number(status))
		await useConfirm({
			title: `${!isStatus ? '启用' : '停用'}FTP用户【${username}】`,
			content: `${!isStatus ? '启用' : '停用'}选中的FTP用户后，该FTP用户将${!isStatus ? '恢复' : '失去'}访问权限，是否继续操作？`,
		})

		// 数据处理
		await useDataHandle({
			loading: '正在设置FTP状态，请稍后...',
			request: editFtpStatus({ id, username, status: Number(!Number(status)) }),
			message: true,
			success: (res: any) => {
				isRefreshFtpList.value = true
				callback && callback(res)
			},
		})
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 获取密码有效期
 * @param data
 */
export const getPwdTime = (data: any) => {
	const todayStart = Math.floor(Date.now() / 1000)
	let isEnd = new Date(Number(data.end_time)).getTime() < todayStart
	const timeDifference = Number(data.end_time) - todayStart
	const daysDifference = Math.floor(timeDifference / (60 * 60 * 24))
	// 当剩余时间距离今日小于7天时，显示橙色
	let isOrange = daysDifference < 7
	if (data.end_time === '0') {
		isEnd = false
		isOrange = false
	}
	return { isEnd, isOrange }
}

/**
 * @description 获取分类列表
 * @returns
 */
export const getClassList = async (): Promise<Array<any>> => {
	try {
		let classList: SelectOptionProps[] = []
		await useDataHandle({
			request: getFtpClassList(),
			data: { msg: Array },
			success: ({ msg: data }: { msg: { ps: string; id: number }[] }) => {
				classList = [
					{ label: '全部分类', value: 'all' },
					...data.map((item: AnyObject) => ({
						label: item.ps,
						value: String(item.id),
					})),
				]
			},
		})
		return classList || []
	} catch (error) {
		console.log(error)
		return []
	}
}

/**
 * @description 批量设置FTP分类
 * @param param0
 * @param callback
 */
export const setBatchClass = async (selectedList: Ref<FtpTableRowProps[]>, clearSelection: AnyFunction, classList: Ref<SelectOptionProps[]>, config: any) => {
	await batchClassDialog({
		name: 'Ftp分类',
		options: classList.value,
		selectList: selectedList.value,
		request: async (data: AnyObject, close: AnyFunction) => {
			const { enable, exclude } = config
			const params = assembBatchParams(selectedList.value, exclude, enable, { params: { id: data.id } })
			await useDataHandle({
				loading: '正在批量设置FTP分类，请稍后...',
				request: setFtpBatchClass(params),
				message: true,
			})
			clearSelection() // 清除选中
			isRefreshFtpList.value = true
			close()
		},
	})
}

/**
 * @description 批量处理事件
 * @param {TableBatchDialogProps} batchConfirm 选中处理事件
 * @param {TableBatchNextAllProps} nextAll 选中处理事件
 * @param {Ref<FtpTableRowProps[]>} selectList 选中的数据
 * @param {TableBatchOptionsProps} options 选中的配置
 * @returns {Promise<void>} void
 */
export const useBatchEventHandle: TableBatchEventProps = async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps, selectList: Ref<FtpTableRowProps[]>, options: TableBatchOptionsProps, clear, config): Promise<void> => {
	const { label, value } = options
	const { enable, exclude } = config as any // 获取配置
	const template: Map<string, string> = new Map([
		['start', '批量启用已选的FTP用户，启用后恢复访问权限'],
		['stop', '批量停用已选的FTP用户，停用后暂停访问权限'],
		['delete', '批量删除已选的FTP用户，删除后彻底失去访问和操作权限'],
	])

	const requestHandle = async () => {
		const requestList: Map<string, AnyFunction> = new Map([
			['start', batchFtpStatus],
			['stop', batchFtpStatus],
			['delete', batchDelFtp],
		])
		const fn = requestList.get(value)
		switch (value) {
			case 'start':
			case 'stop':
				const status = value === 'start' ? 1 : 0
				const params = assembBatchParams(selectList.value, exclude, enable, { params: { status } })
				if (fn) return await fn(params)
				break
			case 'delete':
				const delParams = assembBatchParams(selectList.value, exclude, enable)
				if (fn) return await fn(delParams)
				break
		}
	}
	await batchConfirm({
		title: `批量${label}用户`,
		content: `${template.get(value) as string}，是否继续操作！`,
		column: [{ label: '用户名', prop: 'name' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
		onConfirm: async () => {
			const res = await requestHandle()
			// 执行完毕的代码，刷新列表
			isRefreshFtpList.value = true
			const { data, msg } = assembBatchResults(res.data)
			clear && clear()
			openResultView(data, { title: `${label}用户` })
		},
	})
}

/********** FTP日志业务 **********/

/**
 * @description 获取ftp登录日志
 * @param params
 * @returns
 */
export const getFtpLoginLogs = async (params: any) => {
	try {
		const {
			data: { data, page },
		} = await getFtpLoginLogsApi(params)
		if (!Array.isArray(data)) return { data: [], total: 0 }
		return {
			data,
			total: getPageTotal(page),
		}
	} catch (error) {
		console.warn(error)
		return { data: [], total: 0 }
	}
}

/**
 * @description 获取ftp操作日志
 * @param params
 * @returns
 */
export const getFtpActionLogs = async (params: any) => {
	try {
		const {
			data: { data, page },
		} = await getFtpActionLogsApi(params)
		if (!Array.isArray(data)) return { data: [], total: 0 }
		return {
			data,
			total: getPageTotal(page),
		}
	} catch (error) {
		console.warn(error)
		return { data: [], total: 0 }
	}
}

const openLogsView = (row: FtpTableRowProps) => {
	useDialog({
		title: '查看FTP日志【' + row.name + '】',
		area: [70, 58],
		compData: row,
		component: () => import('@ftp/views/logs/index.vue'),
	})
}

/**
 * @description 打开Ftp日志界面
 * @param {FtpTableRowProps} row 行数据
 * @returns {Promise<void>} void
 */
export const openLogEvent = async (row: FtpTableRowProps): Promise<void> => {
	let load: any
	try {
		rowData.value = row
		if (payment.value.authType !== 'free') {
			load = Message.load('正在获取日志服务状态，请稍后...')
			const { status, msg } = await exitFtpLogsStatus({
				exec_name: 'getlog', // 获取日志服务状态
			})
			load.close()
			if (!status || msg === 'stop') {
				await useConfirm({
					title: '开启FTP日志服务',
					content: '开启FTP日志服务后，将记录FTP用户的访问日志，是否继续操作？',
				})
				const data: any = await useDataHandle({
					loading: '正在开启FTP日志服务，请稍后...',
					request: exitFtpLogsStatus({ exec_name: 'start' }),
					data: { status: Boolean },
					message: true,
				})
				if (data?.status) openLogsView(row)
			} else {
				openLogsView(row)
			}
		} else {
			productPaymentDialog({
				sourceId: 57,
			})
		}
	} catch (error) {
		console.log(error)
	} finally {
		load && load.close()
	}
}


/**
 * @description 卸载
 */
export const useOnUnmounted = (() => {
	// 清空缓存
	cache = {}
	// 取消初始化请求
	useRequestCanceler([
		'/ftp?action=view_ftp_types',
		'/panel/public/get_soft_status',
		'/datalist/data/get_data_list',
	])
})
