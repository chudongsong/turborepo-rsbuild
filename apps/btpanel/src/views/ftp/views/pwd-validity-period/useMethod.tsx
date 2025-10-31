import { getFtpAlarm, setFtpDate } from '@/api/ftp'
import { useDataHandle } from '@/hooks/tools'
import { ResponseResult } from '@/types'
import { formatTime } from '@/utils'
import { useFtpStore } from '@ftp/useStore'
import { useFtpPwdValidStore } from './useStore'

const { rowData, isRefreshFtpList } = useFtpStore()
const { updateFtpInfo, ftpForm, datePicker, isChange, selectValue } = useFtpPwdValidStore()

//选项
export const typeOptions = [
	{ label: '仅发送通知', value: '1' },
	{ label: '停用当前FTP账号', value: '2' },
	{ label: '自动修改FTP密码并发送', value: '3' },
	{ label: '不触发', value: '0' },
]

export const rule = {
	channel: [{ required: true, message: '请选择告警方式', trigger: 'blur' }],
}

/**
 * @description 日期选择事件
 */
export const datePickerChangeEvent = (val: any) => {
	isChange.value = true
	selectValue.value = val
}

/**
 * @description 设置时间选择文字信息，永久
 */
export const setTimeText = () => {
	const dateDom = document.querySelector('.date .el-input__inner') as HTMLInputElement
	if (dateDom) dateDom.value = '永久'
}

/**
 * @description 设置到期时间配置
 * @param {Object} params.id 参数
 */
export const setConfigData = async (params: AnyObject = { id: rowData.value.id }) => {
	const data: AnyObject = await useDataHandle({
		loading: '正在设置到期密码配置，请稍候...',
		request: getFtpAlarm(params),
		data: { channel: String, push_action: String },
	})
	ftpForm.value.channel = data.channel === '' ? [] : data.channel.split(',')
	ftpForm.value.status = data.push_action as string
}

/**
 * @description 修改FTP密码有效期
 */
export const changePwdValidity = async () => {
	ftpForm.value.channel = ftpForm.value.channel.filter((item: any) => item !== '')
	await updateFtpInfo.value.validate()
	const param = {
		id: JSON.stringify([rowData.value.id]),
		end_time: (!isChange.value && !Number(rowData.value.end_time)) || selectValue.value == 0 ? 0 : new Date(datePicker.value).getTime() / 1000,
		push_action: ftpForm.value.status,
		channel: ftpForm.value.channel.join(','),
	}
	const data: ResponseResult = await useDataHandle({
		loading: '正在设置到期密码配置，请稍候...',
		request: setFtpDate(param),
		data: { status: Boolean },
		message: true,
	})
	isRefreshFtpList.value = true
	return data.status
}

export const init = async () => {
	await setConfigData()
	if (rowData.value.end_time === '0') {
		setTimeText()
	} else {
		datePicker.value = formatTime(Number(rowData.value.end_time), 'yyyy-MM-dd')
	}
}

export const $reset = () => {
	rowData.value = {}
	ftpForm.value = {
		status: '1',
		channel: [],
	}
}
