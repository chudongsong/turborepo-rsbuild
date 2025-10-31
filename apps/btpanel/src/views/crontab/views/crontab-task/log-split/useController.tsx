import { getRotateLogConfig, setRotateLog, setRotateLogStatus } from '@/api/crontab'
import { useConfirm, useDataHandle, useMessage } from '@/hooks/tools'
import { getByteUnit } from '@/utils'

const Message = useMessage()

export const logSplitRef = ref() // 表单ref

export const splitForm = ref({
	// 日志切割表单
	status: false,
	num: 180,
	compress: false,
	log_size: 10 as any,
	stype: 'day',
	hour: 2,
	minute: 0,
})
export const tips = ref('开启后默认每天 2 点 0 分进行切割日志文件，如需修改下面配置') // 提示信息
export const rules = reactive({
	num: [
		{
			validator: (rule: any, value: any, callback: any) => {
				const errorMessages = {
					empty: '请输入日志保留最新份',
					lessThanOne: '日志保留最新份必须大于0',
					notInteger: '请输入整数',
				}

				if (value === '') {
					callback(new Error(errorMessages.empty))
				} else if (isNaN(value) || Number(value) < 1) {
					callback(new Error(errorMessages.lessThanOne))
				} else if (!Number.isInteger(Number(value))) {
					callback(new Error(errorMessages.notInteger))
				} else {
					callback()
				}
			},
			trigger: 'blur',
		},
	],
	log_size: [
		{ required: true, message: '请输入日志大小', trigger: 'blur' },
		{
			validator: (rule: any, value: any, callback: any) => {
				//	大于0的数
				if (!/^\d+(\.\d+)?$/.test(value) || value <= 0) {
					callback(new Error('请输入大于0的数'))
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
	hour: [
		{ required: true, message: '请输入小时', trigger: 'blur' },
		{
			validator: (rule: any, value: any, callback: any) => {
				if (value < 0 || value > 23 || !Number.isInteger(Number(value))) {
					callback(new Error('请输入0-23之间的整数'))
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
	minute: [
		{ required: true, message: '请输入分钟', trigger: 'blur' },
		{
			validator: (rule: any, value: any, callback: any) => {
				if (value < 0 || value > 59 || !Number.isInteger(Number(value))) {
					callback(new Error('请输入0-59之间的整数'))
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
})

/**
 * @description 获取日志切割状态
 */
export const getSplitStatus = async () => {
	try {
		const res = await getRotateLogConfig()
		const { status, log_size } = res.data.value
		splitForm.value = res.data.value
		splitForm.value.status = Boolean(status)
		splitForm.value.log_size = log_size ? getByteUnit(log_size, false, 2, 'MB') : '10.00'

		tips.value = `开启后${splitForm.value.stype === 'size' ? '日志文件大小超过' : '默认每天'}${splitForm.value.stype === 'size' ? splitForm.value.log_size + 'MB' : ` ${splitForm.value.hour} 点 ${splitForm.value.minute} 分`}进行切割日志文件，如需修改下面配置`
	} catch (error) {
		console.log(error)
	}
}

export const changeSplit = async (status: boolean) => {
	splitForm.value.status = !status
	await useConfirm({
		title: '设置日志切割任务',
		content: (status ? '开启后' : '关闭后停止') + '对计划任务日志进行切割，是否继续操作？',
	})
	await useDataHandle({
		loading: '正在设置，请稍后...',
		request: setRotateLogStatus(),
		message: true,
		success: getSplitStatus,
	})
}

export const changeSplitTips = () => {
	tips.value = `开启后${splitForm.value.stype === 'size' ? '日志文件大小超过 ' : '默认每天 '}${splitForm.value.stype === 'size' ? splitForm.value.log_size + ' MB ' : `${splitForm.value.hour?.toString() || '-'} 点 ${splitForm.value.minute?.toString() || '-'} 分`}进行切割日志文件，如需修改下面配置`
}

/**
 * @description 设置小于10的数字前面加0
 */
export const addZero = (num: number) => {
	return num < 10 ? `0${num}` : `${num}`
}

/**
 * @description 确认按钮
 */
export const onConfirm = async () => {
	await logSplitRef.value.validate()
	const { stype, log_size } = splitForm.value
	if (stype === 'size' && log_size <= 0) {
		Message.error('日志大小必须大于0')
		return
	}
	let params: any = { ...splitForm.value }
	params.status = Number(splitForm.value.status)
	params.compress = Number(splitForm.value.compress)
	if (params.stype === 'day') params.log_size = 0
	await useDataHandle({
		loading: '正在设置，请稍后...',
		request: setRotateLog(params),
		message: true,
	})
	getSplitStatus()
}
