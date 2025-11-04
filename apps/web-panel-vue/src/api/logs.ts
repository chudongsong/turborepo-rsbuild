/* eslint-disable @typescript-eslint/naming-convention */
import { useAxios } from '@/hooks/tools'
import type { ResponseResult } from '@/hooks/tools/types'

/**
 * @description 获取ssh页面数据
 * @param { Object } data-JSON字符串格式
 * @param { string } search - 搜索关键字
 * @param { number } limit - 每页显示数量
 * @param { string } select - 列别：ALL
 * @param { number } p - 页码
 * @returns { Promise<ResponseResult> }
 */
export const getSshLogs = (data: { data: string }): Promise<ResponseResult> => useAxios.post('/mod/ssh/com/get_ssh_list', { data, customType: 'model', check: 'array' })

/**
 * @description 获取ssh登录信息
 */
export const getSSHLoginInfo = () =>
	useAxios.post('/mod/ssh/com/get_ssh_intrusion', {
		check: 'object',
		customType: 'model',
	})

/**
 * @description 获取系统日志菜单
 * @returns
 */
export const getSystemLogMenu = (): Promise<ResponseResult> => {
	return useAxios.post('safe/syslog/get_sys_logfiles', {
		customType: 'model',
		check: 'array',
	})
}

/**
 * @description 获取系统日志信息
 * @param { Object } data-JSON字符串格式
 * @param {string} data.log_name - 日志名称
 * @param {string} data.search - 搜索关键字
 * @param {number} data.limit - 每页显示数量
 * @param {number} data.p - 页码
 * */
export const getSystemLogData = (data: { data: string }): Promise<ResponseResult> => {
	return useAxios.post('safe/syslog/get_sys_log', {
		data,
		customType: 'model',
		check: 'array',
	})
}

/**
 * @description 获取软件日志菜单信息
 * */
export const getSoftLogMenu = (): Promise<ResponseResult> => useAxios.post('monitor/soft/soft_log_list', { customType: 'model', check: 'array' })

/**
 * @description 获取软件日志信息
 * @param { Object } data-JSON字符串格式
 * @param {string} name - 日志名称
 * @param {string} search - 搜索关键字
 * */
export const getSoftLogData = (data: { data: string }): Promise<ResponseResult> => useAxios.post('monitor/soft/get_log', { data, customType: 'model', check: 'object' })

/**
 * @description 获取慢日志信息-mysqlr日志
 * @param { Object } data-JSON字符串格式
 * @param {string} search - 搜索关键字
 * @param {string} limit - 每页显示数量
 * */
export const getSlowLogData = (data: { data: string }): Promise<ResponseResult> => {
	return useAxios.post('logs/panel/get_slow_logs', {
		data,
		customType: 'model',
		check: 'object',
	})
}

/**
 * @description 获取错误日志信息
 * @param { string } data.screening- 日志筛选条件
 * */
export const getErrorLogData = (data: { screening: string }): Promise<ResponseResult> => {
	return useAxios.post('database/GetErrorLog', {
		check: 'string',
		data,
	})
}

type GetDataParam = {
	p?: number
	table: string
	limit?: number
	search?: string
	result?: string
	sid?: number | string
	tojs?: number | string
	log_type?: string
}

/**
 * @description 获取列表数据，支持网站，数据库，FTP，计划任务，备份列表
 * @param { number } data.p 页码
 * @param { string } data.table 数据来源
 * @param { number } data.limit 每页数量
 * @param { string } data.search 搜索关键字
 * @param { string } data.result 搜索结果
 * @returns { Promise<any> }
 */
export const getDataInfo = (data: GetDataParam): Promise<any> => useAxios.post('data/getData', { data, check: 'object' })

/**
 * @description 获取ftp日志开启状态
 * @param { string } exec_name - 执行名称
 * */
export const setFtpLog = (data: { exec_name: string }) =>
	useAxios.post('logs/ftp/set_ftp_log', {
		check: 'msg',
		customType: 'model',
		data,
	})

/**
 * @description 获取ftp登录日志信息
 * @param { GetDataParam } data
 * */
export const getFtpLogs = (data: GetDataParam): Promise<ResponseResult> => {
	return useAxios.post('ftp/get_login_logs', {
		data,
		check: 'object',
	})
}

interface ActionLogDataParam extends GetDataParam {
	type: string
}
/**
 * @description 获取ftp操作日志信息
 * @param { ActionLogDataParam } data
 * */
export const getActionLogData = (data: ActionLogDataParam): Promise<ResponseResult> => {
	return useAxios.post('logs/ftp/get_action_log', {
		check: 'object',
		customType: 'model',
		data,
	})
}

interface DockerLogDataParam extends GetDataParam {
	ROWS: string
}
/**
 * @description 获取docker日志信息
 * @param { DockerLogDataParam } data
 * */
export const getDockerLog = (data: DockerLogDataParam): Promise<ResponseResult> =>
	useAxios.post('monitor/soft/get_docker_log?name=Docker', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取软件日志信息 -php
 * @param { Object } data-JSON字符串格式
 * */
export const getSoftLogPhp = (data: { data: string }): Promise<ResponseResult> => useAxios.post('monitor/soft/get_log', { data, customType: 'model', check: 'array' })

/**
 * @description 获取堡塔防入侵日志
 * @param { DockerLogDataParam } data.data
 */
export const getBtSecurityLog = (data: { data: string }): Promise<ResponseResult> =>
	useAxios.post('monitor/soft/get_bt_security_log?name=bt_security', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取宝塔系统加固日志
 * @param { DockerLogDataParam } data.data
 */
export const getSysSafeLog = (data: { data: string }): Promise<ResponseResult> =>
	useAxios.post('monitor/soft/get_syssafe_log?name=syssafe', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 面板日志 获取运行日志
 * @returns { Promise<ResponseResult> }
 */
export const getRunLog = (limit?: number, search?: string): Promise<ResponseResult> => {
	const param: any = {}
	if (limit) param.limit = limit
	if (search) param.search = search
	return useAxios.post('logs/panel/get_panel_error_logs', {
		data: param,
		check: 'object',
		customType: 'model',
	})
}

/**
 * @description 清空面板运行日志
 */
export const clearRunLog = () => useAxios.post('config/clean_panel_error_logs', { check: 'msg' })

/**
 * @description 清空面板操作日志数据
 * @returns { Promise<ResponseResult> }
 */
export const clearOperateLogs = (): Promise<ResponseResult> => useAxios.post('ajax/delClose', { check: 'msg' })

/**
 * @description 获取ip统计数据
 */
export const getIPGeolocation = (): Promise<ResponseResult> => useAxios.post('logs/panel/IP_geolocation', { customType: 'model', check: 'array' })

/**
 * @description 获取页面数据
 * @param {string} data.type - 类型
 * @param {number} data.id - id
 * @param {string} data.time_search - 时间搜索
 */
export const getCrontabLogsData = (data: { type: string; id: number; time_search: string }): Promise<ResponseResult> => useAxios.post('crontab/GetLogs', { data, check: 'object' })

/**
 * @description 网站日志-获取网站列表数据
 */
export const getSiteListInfo = (): Promise<any> => useAxios.post('/logs/site/get_site_list', { check: 'object', customType: 'model' })

/**
 * @description 网站日志- 获取网站访问日志信息
 * @param { string } data.siteName - 网站名称
 * @param { string } data.search - 搜索关键字
 * @param { string } data.time_search - 时间搜索
 * */
export const getSiteAccessLogs = (data: { siteName: string; search?: string; time_search?: string }): Promise<ResponseResult> => useAxios.post('logs/site/get_site_access_logs', { data, customType: 'model', check: 'msg' })

/**
 * @description 获取网站错误日志信息
 * @param { string } data.siteName - 网站名称
 * @param { string } data.search - 搜索关键字
 * @param { string } data.time_search - 时间搜索
 * */
export const getSiteErrorLogs = (data: { siteName: string; search?: string; time_search?: string }): Promise<ResponseResult> => {
	return useAxios.post('logs/site/get_site_error_logs', {
		data,
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 网站日志- 获取网站操作日志信息
 * @param { string } data.data - JSON字符串格式
 * @param { string } data.search - 搜索关键字
 * @param { number } data.limit - 每页显示数量
 * @param { number } data.p - 页码
 * @param { string } data.stype - 列别
 * @param { string } data.keywords: 关键字
 * */
export const getSiteOperateLogs = (data: { data: string }): Promise<ResponseResult> => {
	return useAxios.post('logs/panel/get_logs_bytype', {
		data,
		customType: 'model',
		check: 'object',
	})
}

/**
 * @description 获取日志分析-网站日志路径
 * @param { string } data.siteName - 网站名称
 * */
export const getSiteLogFile = (data: { siteName: string }): Promise<ResponseResult> => {
	return useAxios.post('logs/site/get_site_log_file', {
		data,
		customType: 'model',
		check: 'object',
	})
}

/**
 * @description 日志分析-获取定时任务配置
 * @param { string } data.path - 路径
 * */
export const getCronTask = (data: { path: string }): Promise<ResponseResult> => {
	return useAxios.post('ajax/get_cron_task', { check: 'object', data })
}

/**
 * @description 日志分析-设置定时任务
 * @param { string } data.path - 路径
 * @param { string | number } data.cycle - 周期
 * @param { number } data.status - 状态
 * @param { string } data.channel - 通道
 * */
export const setCronTask = (data: { path: string; cycle: string | number; status: number; channel: string }): Promise<ResponseResult> => {
	return useAxios.post('ajax/set_cron_task', { check: 'msg', data })
}

/**
 * @description 获取web日志分析信息
 * @param { number } data.p - 页码
 * @param { number } data.row - 每页显示数量
 * @param { string } data.path - 路径
 * */
export const getLogAnalysisData = (data: { p: number; row: number; path: string }): Promise<ResponseResult> => {
	return useAxios.post('ajax/get_result', {
		data,
		check: 'object',
	})
}

/**
 * @description 日志分析-点击日志扫描-获取日志分析信息
 * @param { string } data.path - 路径
 * */
export const getLogAnalysis = (data: { path: string }): Promise<ResponseResult> => {
	return useAxios.post('ajax/log_analysis', {
		data,
		check: 'msg',
	})
}

/**
 * @description 获取网站日志信息
 * @param { string } data.path -  ·路径
 * */
export const getSpeedLog = (data: { path: string }): Promise<ResponseResult> => {
	return useAxios.post('ajax/speed_log', { data, check: 'object' })
}

/**
 * @description 获取网站日志信息
 * @param { string } data.path - 路径
 * @param { string } data.type - 类型
 * @param { string | number } data.time - 时间
 * */
export const getDetailed = (data: { path: string; type: string; time: string | number }): Promise<ResponseResult> => {
	return useAxios.post('ajax/get_detailed', { data, check: 'object' })
}

/**
 * @description 导出查杀日志
 * @param { string } data.type - 类型
 * @param { string } data.day - 时间
 * @param { number } data.id - id
 */
export const exportShellLogs = (data: { type: string; day: string; id: number }): Promise<ResponseResult> => useAxios.post('crontab/download_logs', { data, check: 'msg' })

/**
 * @description 清理查杀日志
 * @param { number } data.id - id
 * @param { string } data.day - 时间
 */
export const clearShellLogs = (data: { id: number; day: string }): Promise<ResponseResult> => useAxios.post('crontab/clear_logs', { data, check: 'msg' })

/**
 * @description 导出网站日志
 * @param { string } data.siteName - 网站名称
 * @param { string } data.time_search - 时间
 * @param { string } data.logType - 日志类型
 */
export const exportLogs = (data: { siteName: string; time_search: string; logType: string }): Promise<ResponseResult> => useAxios.post('logs/site/download_logs', { data, customType: 'model', check: 'msg' })

/**
 * @description 清理所有日志
 * @param { string } data.siteName - 网站名称
 * @param { string } data.time_search - 时间
 * @param { string } data.logType - 日志类型
 */
export const clearLogs = (data: { siteName: string; time_search: string; logType: string }): Promise<ResponseResult> => useAxios.post('logs/site/clear_logs', { data, check: 'object', customType: 'model' })

/**
 * @description 获取ssh导出路径
 * @param { number } data.count - 数量
 * */
export const getSshPath = (data: { data: string }): Promise<ResponseResult> => {
	return useAxios.post('safe/syslog/export_ssh_log', {
		data,
		customType: 'model',
		check: 'object',
	})
}

/**
 * @description 清空登录日志
 * @returns { Promise<AnyObject> }
 */
export const clearLoginLogs = (): Promise<ResponseResult> => useAxios.post('/logs/panel/clear_panel_login_log', { check: 'object', customType: 'model' })

/**
 * @description 获取面板登录日志
 *	@param { string } data.search - 搜索关键字
 *	@param { number } data.limit - 每页显示数量
 *	@param { string } data.login_type - 登录类型
 *	@param { number } data.page - 页码
 */
export const getLoginInfo = (data: { search: string; limit: number; login_type: string; page: number }): Promise<ResponseResult> =>
	useAxios.post('/logs/panel/get_panel_login_log', {
		check: 'object',
		customType: 'model',
		data,
	})

/**
 * @description 删除网站操作日志
 */
export const exportPanelLog = (data: { search: string }) => useAxios.post('/logs/panel/export_panel_log', { data, check: 'object', customType: 'model' })

/**
 * @description 获取日志发送列表
 * @returns { Promise<ResponseResult> }
 */
export const logCollectList = (): Promise<ResponseResult> => useAxios.post('logs/logserver/collect_list', { customType: 'model', check: 'array' })

/**
 * @description 添加日志发送源
 * @returns { Promise<ResponseResult> }
 */
export const addLogSource = (data: { server_id: number; source_type: string; source_list: string }): Promise<ResponseResult> => useAxios.post('logs/logserver/add_source', { data, customType: 'model', check: 'array' })

/**
 * @description 删除日志发送源
 * @returns { Promise<ResponseResult> }
 */
export const delLogSource = (data: { server_id: number; source_type: string; source_list: string }): Promise<ResponseResult> => useAxios.post('logs/logserver/remove_source', { data, customType: 'model', check: 'msg' })

/**
 * @description 修改日志服务器列表
 */
export const editLogServer = (data: { server_data: string; server_id?: number; server_type?: string }): Promise<ResponseResult> => useAxios.post('logs/logserver/modify_logserver', { data, customType: 'model', check: 'msg' })

/**
 * @description 添加日志服务器列表
 */
export const addLogServer = (data: ResponseResult): Promise<ResponseResult> => useAxios.post('logs/logserver/add_logserver', { data, customType: 'model', check: 'msg' })

/**
 * @description 获取日志服务器列表
 * @returns { Promise<AnyObject> }
 */
export const getLogServerList = (): Promise<ResponseResult> => useAxios.post('logs/logserver/server_list', { customType: 'model', check: 'array' })

/**
 * @description 获取网站日志关键词告警信息
 * */
export const getKeywordAlarm = (data: { sitename: string }): Promise<ResponseResult> => {
	return useAxios.post('/monitor/sitelogpush/get_site_log_push_status', {
		data,
		check: 'object',
		customType: 'model',
	})
}

/**
 * @description 设置网站日志关键词告警
 * */
export const setKeywordAlarm = (data: AnyObject): Promise<ResponseResult> => {
	return useAxios.post('/monitor/sitelogpush/set_push_task', {
		data,
		check: 'msg',
		customType: 'model',
	})
}

/**
 * @description 导出面板操作日志
 * @param { AnyObject } data 参数说明 { search: '搜索关键字' }
 */
export const exportPanelActionLog = (data: { search: string }) => useAxios.post('/logs/panel/export_domain_log', { data, check: 'object', customType: 'model' })

/**
 * @description 删除web分析日志
 * */
export const delSiteScanLog = (data: { path: string }) => {
	return useAxios.post('/ajax?action=remove_analysis', {
		data,
		check: 'object',
		customType: 'model',
	})
}

/**
 * @description 删除软件日志
 * */

export const delSoftLog = (data: { type: number; id?: number; path?: string }) => {
	return useAxios.post('/monitor/soft/del_soft_log', {
		data,
		check: 'msg',
		customType: 'model',
	})
}

/**
 * @description 删除面板登录日志
 * */
export const exportLoginLog = (data: AnyObject) => {
	return useAxios.post('/logs/panel/export_penel_login_log', {
		data,
		check: 'object',
		customType: 'model',
	})
}

/**
 * @description ssh管理-ssh登录日志-封禁ip
 */
export const createSshIpRules = (data: { data: string }) => {
	return useAxios.post(`safe/syslog/create_ip_rules`, {
		data,
		check: 'array',
		customType: 'model',
	})
}

/**
 * @description ssh管理-ssh登录日志-解封ip
 */
export const removeSshIpRules = (data: { data: string }) => {
	return useAxios.post(`safe/syslog/remove_ip_rules`, {
		data,
		check: 'array',
		customType: 'model',
	})
}
