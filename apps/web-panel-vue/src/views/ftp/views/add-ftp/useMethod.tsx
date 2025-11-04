import { addFtp, editFtp } from '@/api/ftp'
import { useDataHandle } from '@/hooks/tools'
import { getRandomChart, getRandomPwd, pathVerify, pawVerify } from '@/utils/'

import type { ResponseResult } from '@/types'

import { useFtpStore } from '@ftp/useStore'
import { useFtpAddStore } from './useStore'

const {
	isEdit,
	addFtpRef, // 表单ref
	ftpForm, // 表单数据
	defaultPath,
} = useFtpAddStore()
const { rowData } = useFtpStore()

export const formRuleOptions = ref({
	name: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (value.length === 0) {
					callback(new Error('FTP用户名不能为空！'))
				} else if (!/^[a-zA-Z0-9_]+$/g.test(value)) {
					callback(new Error('FTP用户名只能包含字母、数字和下划线！'))
				} else if (value.length <= 3) {
					callback(new Error('FTP用户名长度错误，需要大于3个字符！'))
				} else {
					callback()
				}
			},
			required: true,
			trigger: ['blur', 'change'],
		},
	],
	password: [pawVerify({ complex: { length: 6 } }), { required: true }],
	path: [pathVerify(), { required: true }],
})

/**
 * @description: 获取提交参数
 * @param {AnyObject} form 表单数据
 */
export const getSubmitParameters = (form: any, isEdit: boolean) => {
	let params: any = {
		path: form.path,
		ftp_username: form.name,
	}
	if (isEdit) {
		params['id'] = rowData.value.id
		params['new_password'] = form.password
	} else {
		params['ftp_password'] = form.password
		params['ps'] = form.name
	}
	return params
}

/**
 * @description 添加FTP账号
 * @param {string} name 账号名称
 */
export const addFtpUserEvent = async (close: any) => {
	try {
		await addFtpRef.value.validate() // 校验表单
		const params = getSubmitParameters(ftpForm.value, isEdit.value)
		const data: ResponseResult = await useDataHandle({
			loading: `正在${!isEdit.value ? '添加' : '修改'}FTP账号，请稍后...`,
			request: isEdit.value ? editFtp(params) : addFtp(params),
			data: { status: Boolean },
			message: true,
		})
		if (data.status) {
			close()
			// FtpViewController.Table.refreshTableData();
		}
	} catch (error) {
		// usePopper(error) // 错误异常处理
	}
}

export const openAddFtpEvent = () => {}

/**
 * @description: 初始化数据
 */
export const initData = () => {
	if ((rowData.value?.id || 0) > 0) {
		isEdit.value = true
		ftpForm.value = rowData.value
	} else {
		isEdit.value = false
		ftpForm.value = {
			name: '',
			password: getRandomPwd(16),
			path: defaultPath.value || '/www/wwwroot',
		}
	}
}

/**
 * @description 视图数据重置模块
 */
export const $reset = () => {
	ftpForm.value = {
		name: '',
		password: '',
		path: defaultPath.value || '/www/wwwroot',
	}
	rowData.value = {}
}

export const renderForm = () => {
	try {
		let path = defaultPath.value || '/www/wwwroot'
		if (isEdit.value) path = rowData.value?.path
		let form = {
			ftp_username: rowData.value?.name || '',
			path: path,
			ftp_password: rowData.value?.password || getRandomChart(12),
		}
		return form
	} catch (error) {
		console.log(error)
		return {}
	}
}
