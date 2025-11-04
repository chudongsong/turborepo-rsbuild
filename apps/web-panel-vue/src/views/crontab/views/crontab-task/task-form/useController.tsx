import { FormItemCustom } from '@/hooks/tools/form/form-item'
import { toShell } from './form-type/to-shell' // 木马查杀
import { toPython } from './form-type/to-python' // Python脚本
import { logs } from './form-type/logs' // 网站日志切割
import { webshell } from './form-type/webshell' // 木马查杀
import { syncTime } from './form-type/sync-time' // 同步时间
import { rememory } from './form-type/rememory' // 释放内存
import { toUrl } from './form-type/to-url' // 访问URL-GET
import { postParam, toPost } from './form-type/to-post' // 访问URL-POST
import { siteRestart } from './form-type/site-restart' // 网站启停
import { logCleanup } from './form-type/log-cleanup' // 定时清理日志
import { productPaymentDialog } from '@/public' // 支付弹窗

import { useGlobalStore } from '@/store/global'

import AlertForm from './alert-form-item.vue'
import CRONTAB_TASK_STORE from '../useStore'
import FileSplitItem from './file-split-item.vue'

import { Message, useDialog } from '@/hooks/tools'
import { addMysqlIncrementCrontab, crontabAdd, crontabModify, getCrontabDataList, getSystemUserList, modifyMysqlIncrementCrontab } from '@/api/crontab'
import { getCrontabList } from '../useController'
import { path } from './form-type/path'
import { site } from './form-type/site'
import { database } from './form-type/database'
import { enterpriseBackup } from './form-type/enterprise-backup'
import { isUndefined } from '@/utils'

const { payment } = useGlobalStore()
const { rowData, typeInit } = storeToRefs(CRONTAB_TASK_STORE())

/************************公共配置篇***************************/
/**
 * @description 任务类型选项
 */
export const taskTypeOptions = [
	{ value: 'toShell', label: 'Shell脚本' },
	{ value: 'toPython', label: 'Python脚本' },
	{ value: 'site', label: '备份网站' },
	{ value: 'database', label: '备份数据库' },
	{
		label: '数据库增量备份',
		value: 'enterpriseBackup',
		render: (row: any) => {
			return (
				<div class="flex items-center">
					<span>数据库增量备份</span>
					<i class="svgtofont-icon-ltd ml-[0.4rem] text-ltd text-base"></i>
				</div>
			)
		},
	},
	{ value: 'logs', label: '网站日志切割' },
	{ value: 'path', label: '备份目录' },
	{ value: 'webshell', label: '木马查杀' },
	{ value: 'sync_time', label: '同步时间' },
	{ value: 'rememory', label: '释放内存' },
	{ value: 'toUrl', label: '访问URL-GET' },
	{ value: 'to_post', label: '访问URL-POST' },
	{ value: 'site_restart', label: '网站启停' }, // 不需要执行时间
	{ value: 'log_cleanup', label: '定时清理日志' },
] as any

// 消息通道选择
export const noticeOptions = [
	{ label: '不接收任何消息通知', value: 0 },
	{ label: '任务执行失败接收通知', value: 1 },
]

/**
 * @description 是否展示告警提醒
 */
const showNotice = (type: string): boolean => {
	const arr = ['site', 'database', 'enterpriseBackup', 'path']
	return arr.includes(type)
}

/**
 * @description 告警提示
 * @param val
 * @returns
 */
const addZero = (val: string) => (!isNaN(Number(val)) && Number(val) < 10 ? '0' + val : val)
const executeTips = computed(() => {
	let str = '',
		typeArr = ['day', 'day-n', 'hour', 'week', 'month', 'minute-n', 'hour-n', 'second-n'],
		weekObj: any = {
			'1': '周一',
			'2': '周二',
			'3': '周三',
			'4': '周四',
			'5': '周五',
			'6': '周六',
			'7': '周日',
		},
		stype = timeForm.value.type,
		shour = timeForm.value.hour?.toString() || '--',
		sminute = timeForm.value.minute?.toString() || '--',
		sday = timeForm.value.where1?.toString() || '--',
		sweek = timeForm.value.week?.toString() || '--',
		ssecond = timeForm.value.second?.toString() || '--'
	if (typeArr.includes(stype)) {
		const stime = `${addZero(shour)}:${addZero(sminute)} 执行一次`
		switch (stype) {
			case 'day':
				str = `每天的 ${stime}`
				break
			case 'day-n':
				str = `每隔 ${sday} 天的 ${stime}`
				break
			case 'hour':
				str = `每小时的第 ${sminute} 分钟执行一次`
				break
			case 'week':
				str = `每周 ${weekObj[sweek]} 的 ${stime}`
				break
			case 'month':
				str = `每月 ${sday} 号 ${stime}`
				break
			case 'minute-n':
				str = `每小时的第0分钟开始，每隔 ${sminute} 分钟执行一次`
				break
			case 'hour-n':
				str = `每天0点开始，每隔 ${shour} 小时的第 ${sminute} 分钟执行一次`
				break
			case 'second-n':
				str = `每隔 ${ssecond} 秒执行一次`
				break
		}
	} else {
		str = ''
	}
	return str
})

export const alertForm = ref<any>()

/**
 * @description 告警表单项
 * @returns
 */
export const alarmFormItem = (type: string) => {
	// 是否展示 N秒
	const showSeconed = type === 'toShell' || type === 'toUrl' || type === 'to_post'
	// showNotice: 是否展示告警提醒
	// showKeyword: 是否展示关键字匹配
	return FormItemCustom('', () => (
		<AlertForm ref={(el: any) => (alertForm.value = el)} showNotice={showNotice(type)} showKeyword={type === 'toShell'} showStopWeb={type === 'site'} showSecond={showSeconed} isEdit={rowData.value ? true : false}>
			{{
				center: () => (executeTips.value ? <div class="text-small ml-[10rem] mt-[1.6rem] leading-[1rem]" innerHTML={executeTips.value}></div> : null),
				bottom: () => (noticeForm.value.notice && ['site', 'database', 'path'].includes(type) ? <div class="text-small ml-10rem mt-1.2rem leading-[1rem]">检查到磁盘剩余空间小于备份文件的 5 倍或者小于 1GB 时会发送磁盘不足的提示</div> : null),
			}}
		</AlertForm>
	))
}

/**
 * @description 文件拆分表单项
 * @returns
 */
export const fileSplitItem = (type: string) => FormItemCustom('', () => <FileSplitItem rowData={rowData.value} isEnterprise={type === 'enterpriseBackup'}></FileSplitItem>)

/************************表单配置***************************/
// 备份提醒表单数据
export const timeForm = ref({
	type: 'day', // 周期类型
	week: '1', // 周几
	hour: '1', // 小时
	minute: '30', // 分钟
	second: '5', // 秒
	where1: '1', // x天xxx
	timeSet: ['1'], // 周几 多选 或者 几号 多选
	timeType: 'sday', // 备份周期类型
	specialHour: [0], // 特殊小时
	specialMinute: [0], // 特殊分钟
})

// 告警提醒表单数据
export const noticeForm = ref({
	notice: 0,
	notice_channel: 'all',
	keyword: '', // 失败关键字匹配
	flock: true, // 进程锁
})

// 文件拆分表单
export const fileSplitForm = ref<any>({
	split_value: 5, // 文件拆分数量
	split_type: '0',
	save_local: 0,
})

export const validateNumber = (rule: any, value: any, callback: any) => {
	const number = Number(value)
	if (number < 0 || number === 0) {
		callback(new Error('请输入不为0的数字'))
	} else {
		callback()
	}
}

/************************操作方法***************************/

/**
 * @description 切换任务类型
 */
export const switchTaskType = (formData: any): any => {
	let type = formData.value.sType
	if (!type) type = 'toShell'
	switch (type) {
		// 脚本
		case 'toShell':
			return toShell(formData)
		// Python脚本
		case 'toPython':
			return toPython(formData)
		// 日志切割
		case 'logs':
			return logs(formData)
		// 木马查杀
		case 'webshell':
			return webshell(formData)
		// 同步时间
		case 'sync_time':
			return syncTime(formData)
		// 释放内存
		case 'rememory':
			// 内部没有多余操作 唯一操作在此处处理
			!rowData.value && (formData.value.name = '释放内存')
			return rememory()
		// 访问URL-GET
		case 'toUrl':
			return toUrl(formData)
		// 访问URL-POST
		case 'to_post':
			return toPost(formData)
		// 网站启停
		case 'site_restart':
			return siteRestart(formData)
		// 日志清理
		case 'log_cleanup':
			return logCleanup(formData)
		// 备份目录
		case 'path':
			return path(formData)
		// 备份网站
		case 'site':
			return site(formData)
		// 备份数据库
		case 'database':
			return database(formData)
		// 数据库增量备份
		case 'enterpriseBackup':
			return enterpriseBackup(formData)
		default:
			return () => []
	}
}

export const setTimeForm = () => {
	// 处理自定义执行周期
	const specialArr = rowData.value.special_time.split(',')
	let specialHour = [] as any,
		specialMinute = [] as any
	specialArr.forEach((item: any) => {
		specialHour.push(parseInt(item.split(':')[0]) || 0)
		specialMinute.push(parseInt(item.split(':')[1]) || 0)
		// 去重
		specialHour = Array.from(new Set(specialHour))
		specialMinute = Array.from(new Set(specialMinute))
	})
	// 处理时间表单
	const timeSet = rowData.value.timeSet ? rowData.value.timeSet.split(',') : rowData.value.time_set ? rowData.value.time_set.split(',') : ['1']
	timeForm.value = {
		type: rowData.value.type,
		hour: rowData.value.where_hour,
		minute: rowData.value.where_minute,
		where1: rowData.value.where1,
		week: rowData.value.where1,
		timeType: rowData.value.timeType || rowData.value.time_type,
		timeSet: timeSet,
		specialHour: specialHour,
		specialMinute: specialMinute,
		second: rowData.value.second || '5',
	}

	// 处理告警表单
	const noticeFiled = ['notice', 'notice_channel', 'keyword', 'flock']
	for (let key in noticeForm.value) {
		if (noticeFiled.includes(key)) {
			noticeForm.value[key] = rowData.value[key]
			if (key === 'flock') {
				noticeForm.value[key] = rowData.value[key] === 1
			}
		}
	}

	// 处理文件拆分表单
	fileSplitForm.value = {
		split_value: rowData.value.split_value,
		split_type: rowData.value.split_type,
		save_local: Number(rowData.value.save_local),
	}
}

/**
 * @description 提交表单参数
 * @param data
 * @returns
 */
export const handleSubmitParams = (data: any) => {
	let params: any = {
		name: '', // 任务名称
		sType: 'toShell', // 任务类型
		sBody: '', // 任务内容
		sName: '',
		backupTo: '',
		save: '', // 保存数量
		urladdress: '', // URL地址
		save_local: 0, // 本地保存
		notice: 0, // 是否告警
		notice_channel: '', // 告警通道
		datab_name: data.db_name || '', // 数据库名称
		tables_name: data.tb_name || '', // 表名
		keyword: '',
		flock: 1,
		version: '', // 版本
		user: '', // 执行用户
		...data,
		stop_site: Number(alertForm.value?.WebStopSite) || 0, // 是否停止网站
		...timeForm.value, // 时间表单
	}

	params = Object.assign(params, noticeForm.value)
	params.flock = Number(noticeForm.value.flock)

	// 处理时间表单
	if (params.type === 'sweek') {
		params.where1 = '5'
		params.hour = '1'
		params.minute = '5'
		params.week = '1'
		let time = [] as any
		params.specialHour.forEach((item: any) => {
			params.specialMinute.forEach((item2: any) => {
				time.push((item < 10 ? '0' + item : item) + ':' + (item2 < 10 ? '0' + item2 : item2))
				// 去重
				time = Array.from(new Set(time))
			})
		})
		params.special_time = time.join(',')
		// 自定义类型使用驼峰time
		params.time_set = params.timeSet
		params.time_type = params.timeType
		delete params.timeSet
		delete params.timeType
	}

	// 当类型为python脚本时，处理python环境参数
	if (data.sType === 'toPython') {
		params.params = JSON.stringify({ python_env: data.python_env })
		delete params.python_env
	}

	// 当类型为启停网站时，处理启停时间参数
	if (data.sType === 'site_restart') {
		params.minute = '5'
		params.where1 = '5'
		params.type = 'sweek'
	}

	// 避免传入秒 导致后端执行两套不同的逻辑
	if (timeForm.value.type !== 'second-n') {
		delete params.second
	}

	// 当类型为访问post时，处理表格参数
	if (data.sType === 'to_post') {
		params.post_param = JSON.stringify(postParam.value)
	}

	// 当类型为备份数据，添加文件拆分表格参数
	const backArr = ['database', 'enterpriseBackup', 'site', 'path']
	if (backArr.includes(data.sType) && !isUndefined(fileSplitForm.value.split_value)) {
		params = Object.assign(params, fileSplitForm.value)
	}

	// 处理多余参数
	const paramsCopy = clearOtherParams(params)
	return paramsCopy
}

/**
 * @description 清除多余参数
 * @param params
 */
const clearOtherParams = (params: any) => {
	if (params.sType === 'log_cleanup') {
		if (params.radioType === 1) params.log_cut_path = ''
		delete params.radioType
		delete params.clearLogType
		delete params.logText
	} else if (params.sType === 'site_restart') {
		delete params.startTime
		delete params.stopTime
	}
	delete params.specialHour
	delete params.specialMinute
	// 清除多于参数
	delete params.echo
	delete params.type_zh
	delete params.type_name
	delete params.sort
	delete params.cycle
	delete params.rname
	return params
}

/**
 * @description 提交表单
 */
export const submitForm = async (data: any) => {
	if (payment.value.authType !== 'ltd' && data.sType === 'enterpriseBackup') {
		//打开支付
		productPaymentDialog({ sourceId: 53 })
		return false
	}
	// 遮罩层
	let loading: any = Message.load('正在提交，请稍候...')
	try {
		// 是否是数据增量备份
		const isEnDataBase = data.sType === 'enterpriseBackup'
		// 具体参数
		const params = handleSubmitParams(data)

		if (isEnDataBase) {
			// 数据库增量备份特殊接口处理
			return await submitEnDatabase(params)
		} else {
			// 常规处理
			// 是否是编辑
			const isEdit = rowData.value.id
			let res: any
			if (isEdit) {
				res = await crontabModify(params)
			} else {
				res = await crontabAdd(params)
			}
			checkReinforce(res) // 检查是否开启系统加固
			Message.request(res)
			res.status && getCrontabList() // 刷新计划任务列表
			return res.status
		}
	} catch (error) {
		console.log(error)
	} finally {
		loading.close()
	}
}

/**
 * @description 提交数据库增量备份
 * @param params
 */
const submitEnDatabase = async (params: any) => {
	try {
		// 是否是编辑
		const isEdit = rowData.value.id
		if (params.tb_name === 'ALL') params.tb_name = ''
		const res = !isEdit ? await addMysqlIncrementCrontab(params) : await modifyMysqlIncrementCrontab(params)
		Message.request(res)
		getCrontabList()
		return res.status
	} catch (error) {
		console.log('submitEnDatabase -> error', error)
	}
}

/**
 * @description 检查是否开启系统加固
 * @param res
 * @returns
 */
const checkReinforce = (res: any) => {
	if (res.msg.includes('系统加固')) {
		useDialog({
			title: '临时关闭系统加固',
			area: 44,
			component: () => import('./close-system-fixed/index.vue'),
			showFooter: true,
		})
		return
	}
}

/**
 * @description 清空备份提醒表单数据
 */
export const clearTimeForm = () => {
	Object.assign(timeForm.value, {
		type: 'day', // 周期类型
		week: '1', // 周几
		hour: '1', // 小时
		minute: '30', // 分钟
		second: '5', // 秒
		where1: '1', // x天xxx
		timeSet: ['1'], // 周几 多选
		timeType: 'sday', // 备份周期类型
		specialHour: [0], // 特殊小时
		specialMinute: [0], // 特殊分钟
	})
	Object.assign(noticeForm.value, {
		notice: 0,
		notice_channel: '',
		keyword: '', // 失败关键字匹配
		flock: true, // 进程锁
	})
}
