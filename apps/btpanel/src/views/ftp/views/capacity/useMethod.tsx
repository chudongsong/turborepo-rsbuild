import type { ResponseResult } from '@/types'

import { setFtpQuota } from '@api/ftp'
import { useDataHandle } from '@data/index'
import { useFtpCapacityStore } from './useStore'
import { useFtpStore } from '@ftp/useStore'
import { Message } from '@message/index'

const { rowData } = useFtpStore()
const { capacityData, useSize } = useFtpCapacityStore()

// 校验
export const rules = reactive({
	size: [
		{ required: true, message: '容量不能为空', trigger: ['blur'] },
		{
			validator: (rule: any, value: any, callback: any) => {
				if (!Number.isInteger(capacityData.value.size * 1)) {
					callback(new Error('容量必须为整数'))
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
	alarmSize: [
		{ required: true, message: '触发告警大小不能为空', trigger: ['blur'] },
		{
			validator: (rule: any, value: any, callback: any) => {
				if (capacityData.value.status) {
					if (!Number.isInteger(capacityData.value.alarmNum * 1)) {
						callback(new Error('触发告警大小必须为整数'))
					} else {
						callback()
					}
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
	alarmNum: [
		{ required: true, message: '告警次数不能为空', trigger: ['blur'] },
		{
			validator: (rule: any, value: any, callback: any) => {
				if (capacityData.value.status) {
					if (!Number.isInteger(capacityData.value.alarmNum * 1)) {
						callback(new Error('告警次数必须为整数'))
					} else {
						callback()
					}
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
	module: [
		{
			required: true,
			validator: (rule: any, value: any, callback: any) => {
				if (capacityData.value.status) {
					if (capacityData.value.module.length === 0) {
						callback(new Error('请选择告警方式'))
					} else {
						callback()
					}
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
})

/**
 * @description 获取转换单位后的已使用容量
 */
export const useSizeFun = () => {
	if (capacityData.value.size === 0) {
		useSize.value = '未配置'
		capacityData.value.useSize = useSize.value
		return
	}
	const size = capacityData.value.size * 1024 * 1024
	if (capacityData.value.size > 0 && capacityData.value.used >= size) {
		useSize.value = '当前容量已用完'
		capacityData.value.useSize = useSize.value
		return
	}
	useSize.value = (capacityData.value.used / 1024 / 1024).toFixed(2) || 0
	capacityData.value.useSize = useSize.value
}

/**
 * @description 初始化数据
 */
export const init = () => {
	const { quota } = rowData.value
	let { quota_storage: quotaStorage, quota_push: quotaPush } = quota
	if (quotaStorage) {
		capacityData.value.used = quotaStorage.used
		capacityData.value.size = quotaStorage.size
	}
	if (quotaPush) {
		// 存在module字段时代码配置过告警
		if (typeof quotaPush.module != 'undefined') {
			capacityData.value.status = quotaPush.status
			capacityData.value.alarmSize = quotaPush.size
			capacityData.value.alarmNum = quotaPush.push_count
			capacityData.value.module = quotaPush.module.split(',')
		}
	}
	useSizeFun() //获取转换单位后的已使用容量
}

/**
 * @description 获取提交参数
 * @param {Object} form 表单数据
 * @param {AnyObject} compData 组件数据
 * @returns {Object} 提交参数
 */
export const getSubmitParameters = (form: AnyObject = capacityData.value, compData: AnyObject = rowData.value) => {
	const { path } = compData
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
 * @description 提交表单
 */
export const saveCapacity = async (param: any, validate: any) => {
	await validate() // 校验表单
	const params = getSubmitParameters(param.value) // 获取提交参数
	if (params.quota_push.status && params.quota_push.module.length === 0) {
		Message.error('请选择至少一种告警方式')
		return false
	}
	// 提交数据
	const data: ResponseResult = await useDataHandle({
		loading: '正在提交，请稍候...',
		request: setFtpQuota({ data: JSON.stringify(params) }),
		data: { status: Boolean, msg: String },
	})
	if (data.status) {
		Message.success(data.msg)
		// FtpViewController.Table.refreshTableData();
	} else {
		Message.msg({
			message: data.msg,
			showClose: true,
			dangerouslyUseHTMLString: true,
			type: 'error',
			customClass: 'bt-message-error-html', // 请求类型的消息提示，包含html格式
			duration: 0,
		})
	}
	return data.status
}

export const $reset = () => {
	capacityData.value = {
		used: 0,
		size: 0,
		status: false,
		alarmSize: 0,
		alarmNum: 0,
		alarmModel: [],
		module: [],
		option: {},
	}
	rowData.value = {}
}
