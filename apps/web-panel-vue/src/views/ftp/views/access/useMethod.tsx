import { getFtpAccess, setAccess } from '@/api/ftp'
import { Message, useDataHandle } from '@/hooks/tools'
import { ResponseResult } from '@/types'
import { checkIp, isArray } from '@/utils'
import { useFtpStore } from '@ftp/useStore'
import { useFtpAccessStore } from './useStore'

interface RuleForm {
	username: string // 用户名
	download_bandwidth: string // 下载带宽
	upload_bandwidth: string // 上传带宽
	max_files: string // 最大文件数量
	max_size: string // 最大文件大小
	ratio: string // 上传和下载比率
	allowed_local_ips: string // 允许的本地IP地址
	denied_local_ips: string // 拒绝的本地IP地址
	allowed_client_ips: string // 允许的客户端IP地址
	denied_client_ips: string // 拒绝的客户端IP地址
	time_restrictions: string[] // 时间限制
	max_sim_sessions: string // 最大并发会话数
}

const { rowData } = useFtpStore()
const { accessFormFef, accessForm, uNum, dNum, unitForm, advancedConfiguration, skipNull, AccessData } = useFtpAccessStore()

export const validateIP = (rule: any, value: any, callback: any) => {
	if (value === '') {
		callback()
	} else if (value === '' || typeof value === 'undefined' || (value == null && !skipNull)) {
		callback(new Error('请输入正确的IP地址'))
	} else {
		if (!checkIp(value)) {
			callback(new Error('请输入正确的IP地址'))
		} else {
			callback()
		}
	}
}

export const rules = shallowReactive({
	allowed_local_ips: [
		{
			required: false,
			validator: validateIP,
			message: '请输入正确的IP地址',
			trigger: 'blur',
		},
	],
	denied_local_ips: [
		{
			required: false,
			validator: validateIP,
			message: '请输入正确的IP地址',
			trigger: 'blur',
		},
	],
	allowed_client_ips: [
		{
			required: false,
			validator: validateIP,
			message: '请输入正确的IP地址',
			trigger: 'blur',
		},
	],
	denied_client_ips: [
		{
			required: false,
			validator: validateIP,
			message: '请输入正确的IP地址',
			trigger: 'blur',
		},
	],
})

/**
 * @description: 检查需要输入ip的项是否正确
 * @param {Object} pForm 表单数据
 */
export const validateIPFieldsEvent = (pForm: AnyObject = accessForm.value) => {
	const ipFields = ['allowed_local_ips', 'denied_local_ips', 'allowed_client_ips', 'denied_client_ips']
	for (const field of ipFields) {
		if (pForm[field] !== '') {
			// 去除空格
			pForm[field] = pForm[field].replace(/\s+/g, '')
			skipNull.value = true
			validateIP(null, pForm[field], (error: any) => {
				if (error) {
					Message.error(error.message + '或将其置空')
					throw new Error(error.message)
				}
			})
		}
	}
}

/**
 * @description: 设置ftp权限
 * @param {Function} close 关闭弹窗
 * @returns {Promise} Promise
 */
export const setAccessEvent = async () => {
	const params = getSubmitParameters()
	// 检查需要输入ip的项是否正确
	validateIPFieldsEvent()
	await accessFormFef.value.validate()
	const { status }: ResponseResult = await useDataHandle({
		loading: '正在获取FTP权限数据，请稍后...',
		request: setAccess(params),
		data: { status: Boolean },
		message: true,
	})
	return status
}

/**
 * @description: 显示更多配置
 */
export const showConfig = () => {
	advancedConfiguration.value = !advancedConfiguration.value
}

/**
 * @description: 处理数据
 * @param {Object} data 数据
 * @returns {Object} { perForm, unitForms, uNums, dNums }
 */
export const handelDataParameters = (data: AnyObject = AccessData.value): any => {
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
 * @description 打开窗口
 */
export const onOpen = async () => {
	const { name } = rowData.value
	await useDataHandle({
		loading: '正在获取FTP权限数据，请稍后...',
		request: getFtpAccess({ username: name }),
		success: ({ data: res }: any) => {
			const { perForm, unitForms, uNums, dNums } = handelDataParameters(res)
			uNum.value = uNums
			dNum.value = dNums
			Object.assign(accessForm.value, perForm)
			Object.assign(unitForm.value, unitForms)
		},
	})
}

export const $reset = () => {
	rowData.value = {}
	accessForm.value = {} as RuleForm
}

/**
 * @description: 获取时间
 * @param {Date} time 时间
 * @returns {Array} [startHour, startMinute]
 */
export const getTime = (time: Date): Array<string> => {
	const startHour = time.getHours().toString().padStart(2, '0')
	const startMinute = time.getMinutes().toString().padStart(2, '0')
	return [startHour, startMinute]
}

/**
 * @description: 获取提交参数
 * @param {Object} uForm 单位表单
 * @param {Object} pForm 权限表单
 * @param {Number} uNums 上传比率
 * @param {Number} dNums 下载比率
 * @param {String} username 用户名
 * @returns {Object} 参数
 */
export const getSubmitParameters = (): AnyObject => {
	// 深拷贝表单数据
	// 将特殊三项拼接单位
	const uForm: any = unitForm.value,
		pForm: any = accessForm.value,
		uNums: any = uNum.value,
		dNums: any = dNum.value,
		username: string = rowData.value.name

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
	if (isArray(pForm.time_restrictions) && pForm.time_restrictions.length > 0) {
		const startTime = new Date(pForm.time_restrictions[0] as string)
		const endTime = new Date(pForm.time_restrictions[1] as string)
		const [startHour, startMinute] = getTime(startTime)
		const [endHour, endMinute] = getTime(endTime)
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
