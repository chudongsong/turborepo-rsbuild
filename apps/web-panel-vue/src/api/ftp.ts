/* eslint-disable @typescript-eslint/naming-convention */
import { useAxios } from '@axios/index'
import { ResponseResult } from '@/types'
import type { FtpDeleteProps, FtpEditStatusProps } from '@/types/ftp'

/**
 * @description 停止FTP帐号 status:0 启动FTP帐号 status:1
 * @param { number } parameter.id FTP帐号ID
 * @param { string } parameter.username FTP帐号名称
 * @param { number } parameter.status FTP帐号状态
 * @returns { Promise<ResponseResult> }
 */
export const editFtpStatus = (data: FtpEditStatusProps): Promise<ResponseResult> => useAxios.post('ftp/SetStatus', { data, check: 'msg' })
export const batchFtpStatus = (data: FtpEditStatusProps): Promise<ResponseResult> => useAxios.post('/datalist/batch/batch_set_ftp_status', { data, check: 'msg', customType: 'model' })

/**
 * @description 删除FTP
 * @param { number } data.id FTP帐号ID
 * @param { string } data.username FTP帐号名称
 * @returns { Promise<ResponseResult> }
 */
export const deleteFtp = (data: FtpDeleteProps): Promise<ResponseResult> => useAxios.post('ftp/DeleteUser', { data, check: 'msg' })

/**
 * @description 修改FTP密码
 * @param { AnyObject } data.id FTP帐号ID
 * @param { AnyObject } data.ftp_username FTP帐号名称
 * @param { AnyObject } data.new_password 新密码
 * @param { AnyObject } data.path 目录
 * @returns { Promise<ResponseResult> }
 */
export const editFtp = (data: {
	id: number
	// eslint-disable-next-line @typescript-eslint/naming-convention
	ftp_username: string
	// eslint-disable-next-line @typescript-eslint/naming-convention
	new_password: string
	path: string
}): Promise<ResponseResult> => useAxios.post('ftp/SetUser', { data, check: 'msg' })

/**
 * @description 添加FTP
 * @param { string } data.ftp_username 账号名称
 * @param { string } data.ftp_password 密码
 * @param { string } data.path 目录
 * @param { string } data.ps 备注
 * @returns { Promise<ResponseResult> }
 */
export const addFtp = (data: {
	path: string
	// eslint-disable-next-line @typescript-eslint/naming-convention
	ftp_username: string
	// eslint-disable-next-line @typescript-eslint/naming-convention
	ftp_password: string
	ps: string
}): Promise<ResponseResult> => useAxios.post('ftp/AddUser', { data, check: 'msg' })

/**
 * @description 修改FTP服务端口
 * @param { number } data.port 服务端口
 * @returns { Promise<ResponseResult> }
 */
export const editFtpPort = (data: { port: number }): Promise<ResponseResult> => useAxios.post('ftp/setPort', { data, check: 'msg' })

/**
 * @description 获取ftp权限列表
 * @param { string } data.username
 * @returns { Promise<ResponseResult> }
 */
export const getFtpAccess = (data: { username: string }): Promise<ResponseResult> => useAxios.post('ftp/GetFtpUserAccess', { data, check: 'msg' })

/**
 * @description 设置ftp权限列表
 * @param { AnyObject } data
 * @returns { Promise<ResponseResult> }
 */
export const setAccess = (data: AnyObject): Promise<ResponseResult> => useAxios.post('ftp/ModifyFtpUserAccess', { data, check: 'msg' })

/**
 * @description 获取FTP日志状态/设置FTP日志状态
 * @param { AnyObject } data
 * @returns { Promise<ResponseResult> }
 */
export const exitFtpLogsStatus = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	exec_name: string
}): Promise<ResponseResult> =>
	useAxios.post('/logs/ftp/set_ftp_log', {
		customType: 'model',
		data,
		check: 'msg',
	})

/**
 * @description 查看FTP login日志
 * @param { AnyObject } data
 * @returns { Promise<ResponseResult> }
 */
export const getFtpLoginLogs = (data: AnyObject): Promise<ResponseResult> =>
	useAxios.post('/logs/ftp/get_login_log', {
		customType: 'model',
		data,
		check: 'object',
	})

/**
 * @description 查看FTP action日志
 * @param { AnyObject } data
 * @returns { Promise<ResponseResult> }
 */
export const getFtpActionLogs = (data: AnyObject): Promise<ResponseResult> => useAxios.post('/logs/ftp/get_action_log', { customType: 'model', data })

/**
 * @description 获取告警配置
 * @param { AnyObject } data
 * @returns { Promise<ResponseResult> }
 */
export const getFtpAlarm = (data: AnyObject): Promise<ResponseResult> => useAxios.post('ftp/get_cron_config', { data, check: 'object' })

/**
 * @description 设置ftp到期时间
 * @param { AnyObject } data
 * @returns { Promise<ResponseResult> }
 */
export const setFtpDate = (data: AnyObject): Promise<ResponseResult> => useAxios.post('ftp/set_cron_config', { data, check: 'msg' })

/**
 * @description 设置FTP配额容量
 * @param { AnyObject } data
 * @returns { Promise<ResponseResult> }
 */
export const setFtpQuota = (data: AnyObject): Promise<ResponseResult> =>
	useAxios.post('project/quota/modify_path_quota', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取FTP日志分析配置
 * @returns { Promise<ResponseResult> }
 */
export const getAnalysisConfig = (): Promise<ResponseResult> =>
	useAxios.post('logs/ftp/get_analysis_config', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 设置FTP日志分析配置
 * @param { AnyObject } data
 * @returns { Promise<ResponseResult> }
 */
export const setAnalysisConfig = (data: AnyObject): Promise<ResponseResult> =>
	useAxios.post('logs/ftp/set_analysis_config', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description FTP日志分析
 * @param { AnyObject } data
 * @returns { Promise<ResponseResult> }
 */
export const logAnalysis = (data: AnyObject): Promise<ResponseResult> => useAxios.post('logs/ftp/log_analysis', { data, customType: 'model' })

/**
 * @description FTP日志分析设置自动任务
 * @param { AnyObject } data
 * @returns { Promise<ResponseResult> }
 */
export const setCronTask = (data: AnyObject): Promise<ResponseResult> =>
	useAxios.post('logs/ftp/set_cron_task', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 忽略IP
 * @param { AnyObject } data
 * @returns { Promise<ResponseResult> }
 */
export const setWhiteList = (data: AnyObject): Promise<ResponseResult> =>
	useAxios.post('logs/ftp/set_white_list', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取忽略IP
 * @returns { Promise<ResponseResult> }
 */
export const getWhiteList = (): Promise<ResponseResult> =>
	useAxios.post('logs/ftp/get_white_list', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 添加ip规则
 * @param { AnyObject } data
 * @returns { Promise<ResponseResult> }
 */
export const createIpRules = (data: AnyObject): Promise<ResponseResult> =>
	useAxios.post('safe/firewall/create_ip_rules', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取ftp用户列表
 * @returns { Promise<ResponseResult> }
 */
export const ftpUsers = (): Promise<ResponseResult> => useAxios.post('logs/ftp/ftp_users', { customType: 'model', check: 'array' })

/**
 * @description 修改FTP密码
 * @param { AnyObject } data
 * @returns { Promise<ResponseResult> }
 */
// export const editFtpPassword = (data: AnyObject): Promise<ResponseResult> => useAxios.post('ftp/BatchSetUserPassword', { data })
export const editFtpPassword = (data: AnyObject): Promise<ResponseResult> => useAxios.post('/datalist/batch/batch_set_ftp_password', { data, check: 'array', customType: 'model' })

/**
 * @description 获取FTP类型列表
 * @returns { Promise<ResponseResult> }
 */
export const getFtpClassList = (): Promise<ResponseResult> => useAxios.post('ftp/view_ftp_types', { check: 'object' })

/**
 * @description 添加FTP分类
 * @param { string } ps FTP分类名称
 * @returns { Promise<ResponseResult> }
 */
export const addFtpClass = (data: { ps: string }): Promise<ResponseResult> => useAxios.post('ftp/add_ftp_types', { check: 'object', data })

/**
 * @description 编辑FTP分类
 * @param { number } id FTP分类ID
 * @param { string } ps FTP分类名称
 * @returns
 */
export const editFtpClass = (data: { id: number; ps: string }): Promise<ResponseResult> => useAxios.post('ftp/update_ftp_types', { check: 'object', data })

/**
 * @description 删除FTP分类
 * @param { number } id FTP分类ID
 * @param { string } ps FTP分类名称
 * @returns
 */
export const deleteFtpClass = (data: { id: number }): Promise<ResponseResult> => useAxios.post('ftp/delete_ftp_types', { check: 'object', data })

/**
 * @description 批量设置分类
 * @param { string } ftp_names FTP名称
 * @returns
 */
export const setFtpBatchClass = (data: { ftp_names: string; id: number | string }): Promise<ResponseResult> => useAxios.post('/datalist/batch/batch_set_ftp_type', { check: 'object', data, customType: 'model' })

/**
 * @description 批量删除FTP
 * @param data
 * @returns
 */
export const batchDelFtp = (data: { ftp_names: string }): Promise<ResponseResult> => useAxios.post('/datalist/batch/batch_delete_ftp', { check: 'object', data, customType: 'model' })
