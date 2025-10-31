/* eslint-disable @typescript-eslint/naming-convention */

import { useAxios } from '@/hooks/tools'
import type { ResponseResult } from '@axios/types'

const securityUrl = `/plugin?action=a&name=bt_security&s=` // 入侵防御
const systemUrl = '/plugin?name=syssafe&action=a&s=' // 系统加固
const networkScanUrl = '/plugin?name=networkscan&action=a&s=' // 网络扫描

/**
 * @description 获取安全配置数据
 */
export const getSSHInfo = (): Promise<ResponseResult> =>
	useAxios.post('safe/ssh/GetSshInfo', {
		check: 'object',
		customType: 'model',
	})

/**
 * @description 是否启用ssh
 * @param { string } data.status 是否启用 '0'禁用  '1' 启用
 */
export const setSsh = (data: { status?: string }) => useAxios.post('firewall/SetSshStatus', { data, check: 'msg' })

/**
 * @description 获取ssh登录信息
 */
export const getSSHLoginInfo = () =>
	useAxios.post('/mod/ssh/com/get_ssh_intrusion', {
		check: 'object',
		customType: 'model',
	})

/**
 * @description 获取ssh基础设置
 */
export const getSSHBasicConfig = () =>
	useAxios.post('ssh_security/get_config', {
		check: 'object',
	})

/**
 * @description 是否启用SSH密码登录
 * @param { boolean } status 是否启用
 */
export const setSshPwd = (status: boolean) => {
	const url = status ? 'set_password' : 'stop_password'
	return useAxios.post(`ssh_security/${url}`, { check: 'msg' })
}

/**
 * @description 更改ssh端口号
 * @param { number } port 端口号
 */
export const setSshPort = (port: number) => useAxios.post('firewall/SetSshPort', { data: { port }, check: 'msg' })

/**
 * @description 获取所有ssh登录日志列表数据
 * @param { number } data.data JSON字符串
 * @param { number } data.p 页码
 * @param { string } data.search 搜索内容
 * @param { string } data.select 搜索类型
 */
export const getSshLoginList = (data: { data: string }) =>
	useAxios.post('/mod/ssh/com/get_ssh_list', {
		data,
		customType: 'model',
		check: 'array',
	})

/**
 * @description ssh管理-ssh登录日志-解封ip
 * @param { string } data.address  ip地址
 */
export const removeSshIpRules = (data: { address: string }) => {
	return useAxios.post(`safe/syslog/remove_ip_rules`, {
		data: { data: JSON.stringify(data) },
		check: 'array',
		customType: 'model',
	})
}

/**
 * @description ssh管理-ssh登录日志-封禁ip
 * @param { string } data.address  ip地址
 * @param { string } data.types  类型
 * @param { string } data.brief  描述
 * @param { string } data.domain  域名
 * @param { string } data.choose  选择
 */
export const createSshIpRules = (data: { address: string; types: string; brief: string; domain: string; choose: string }) => {
	return useAxios.post(`safe/syslog/create_ip_rules`, {
		data: { data: JSON.stringify(data) },
		check: 'array',
		customType: 'model',
	})
}

/**
 * @description 获取入侵防御概览命令日志列表
 * @param { Object } data 参数
 */
export const getCommandLogData = (data: { p: number; num: number; day: string; user: string }) => {
	return useAxios.post(`${securityUrl}get_user_log`, {
		data,
		customType: 'model',
		check: 'array',
	})
}

/**
 * @description 获取入侵防御信息
 */
export const getIntrusionData = () =>
	useAxios.post(`${securityUrl}get_total_all`, {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 删除SSH用户
 * @param { string } data.username 用户名
 */
export const delSshUser = (data: { username: string }) => useAxios.post(`ssh_security/del_sys_user`, { data, check: 'msg' })

/**
 * @description 入侵防御概览防入侵状态+ssh用户开关
 * @param { boolean } status 是否开启
 * @param { string } data.user 用户名
 */
export const startUserSecurity = (status: boolean, data: { user: string }) => {
	const url = status ? 'start_user_security' : 'stop_user_security'
	return useAxios.post(`${securityUrl}${url}`, {
		data,
		customType: 'model',
		check: 'object',
	})
}

/**
 * @description 入侵防御概览日志状态+ssh日志开关
 * @param { boolean } status 是否开启
 * @param { string } data.uid  用户id
 */
export const setUserLog = (status: boolean, data: { uid: string }) => {
	const url = status ? 'start_user_log' : 'stop_user_log'
	return useAxios.post(`${securityUrl}${url}`, {
		data,
		customType: 'model',
		check: 'object',
	})
}

/**
 * @description 设置root密码
 */
export const setSSHPassword = (data: { username: string; password: string }) => {
	return useAxios.post(`ssh_security/set_root_password`, {
		data,
		check: 'msg',
	})
}

/**
 * @description 获取入侵防御概览命令日志日期
 * @param { Object } data 参数
 */
export const getLogsList = (data: { user: string }) => {
	return useAxios.post(`${securityUrl}get_logs_list`, {
		data,
		customType: 'model',
		check: 'array',
	})
}

/**
 * @description 获取防护配置配置信息
 * @param { string } data.username  用户名
 */
export const addSshUser = (data: { username: string; password: string }) => useAxios.post(`ssh_security/add_sys_user`, { data, check: 'object' })

/**
 * @description 开启SSH密钥登录
 * @param { string } data.type 类型
 * @param { string } data.ssh ssh密钥
 */
export const openSshKey = (data: { type: string; ssh: string }) => useAxios.post(`ssh_security/set_sshkey`, { data, check: 'object' })

/**
 * @description 获取SSH登录告警
 */
export const getLoginSend = () =>
	useAxios.post('ssh_security/get_login_send', {
		check: 'object',
	})

/**
 * @description 获取告警日志
 * @param { number } data.p 页码
 * @param { number } data.p_size 每页数量
 */
export const getLogs = (data: { p: number; p_size: number }) => {
	return useAxios.post('ssh_security/get_logs', { data, check: 'object' })
}

/**
 * @description 是否启用SSH告警
 */
export const setLoginSend = (status: boolean, data: { type: string }) => {
	const url = status ? 'set_login_send' : 'clear_login_send'
	return useAxios.post(`ssh_security/${url}`, { data, check: 'object' })
}

/**
 * @description 开关告警任务
 * @param { number } data.task_id 任务id
 * @returns { Promise }
 */
export const setTaskStatus = (data: { task_id: number | string; status: number | string }): Promise<any> =>
	useAxios.post('/mod/push/task/change_task_conf', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 设置防护配置配置信息
 */
export const setAntiConf = (data: { act?: boolean; maxretry?: number; findtime?: number; bantime?: number }) => useAxios.post(`ssh_security/set_anti_conf`, { data, check: 'object' })

/**
 * @description 获取防护配置配置信息
 */
export const getAntiConf = () => useAxios.post(`ssh_security/get_anti_conf`, { check: 'object' })

/**
 * @description 获取防暴破日志
 */
export const getAntiBlastLogs = () => useAxios.post(`ssh_security/get_sshd_anti_logs`, { check: 'object' })

/**
 * @description 获取IP白名单
 */
export const getIpWhiteList = () => useAxios.post(`ssh_security/return_ip`, { check: 'object' })

/**
 * @description 添加IP白名单
 * @param { string } data.ip ip地址
 */
export const addIpWhite = (data: { ip: string }) => useAxios.post(`ssh_security/add_return_ip`, { data, check: 'msg' })

/**
 * @description 删除IP白名单
 * @param { string } data.ip ip地址
 */
export const delIpWhiteList = (data: { ip: string }) => useAxios.post(`ssh_security/del_return_ip`, { data, check: 'msg' })

/**
 * @description 获取密钥
 */
export const getSshKey = () => useAxios.post('ssh_security/get_key', { check: 'msg' })

/**
 * @description 关闭SSH密钥登录
 */
export const stopSshKeyLogin = () => useAxios.post(`ssh_security/stop_key`, { check: 'msg' })

/**
 * @description 设置root登录
 */
export const setRoot = (data: { p_type: string }) => useAxios.post('ssh_security/set_root', { data, check: 'msg' })

/**
 * @description 入侵防御开关
 * @param { Object } status 参数
 */
export const setIntrusionSwitch = (status: boolean) => {
	const url = status ? 'start_bt_security' : 'stop_bt_security'
	return useAxios.post(`${securityUrl}${url}`, {
		customType: 'model',
		check: 'object',
	})
}

/**
 * @description 入侵防御进程白名单
 */
export const getProcessWhiteList = () => {
	return useAxios.post(`${securityUrl}porcess_set_up_log`, {
		customType: 'model',
		check: 'array',
	})
}

/**
 * @description 入侵防御删除进程白名单
 */
export const delProcessWhite = (data: { cmd: string }) => {
	return useAxios.post(`${securityUrl}del_porcess_log`, {
		data,
		customType: 'model',
		check: 'object',
	})
}

/**
 * @description 入侵防御添加进程白名单
 */
export const addProcessWhite = (data: { cmd: string }) => {
	return useAxios.post(`${securityUrl}add_porcess_log`, {
		data,
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 入侵防御操作日志
 * @param { Object } data 参数
 * @param { number } data.p 页码
 * @param { number } data.limit 每页数量
 */
export const getIntrusionLog = (data: { p: number; limit: number }) => {
	return useAxios.post(`${securityUrl}get_log`, {
		data,
		customType: 'model',
		check: 'object',
	})
}

/**
 * @description 获取系统加固防护配置列表+状态
 */
export const getReinforceStatus = () =>
	useAxios.post(`${systemUrl}get_safe_status`, {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 系统加固总开关
 */
export const setOpen = () => useAxios.post(`${systemUrl}set_open`, { customType: 'model', check: 'msg' })

/**
 * @description 获取防护配置配置信息
 * @param { Object } data 参数
 */
export const setSafeStatus = (data: { s_key: string }) =>
	useAxios.post(`${systemUrl}set_safe_status`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取防护配置配置信息
 * @param { Object } data 参数
 */
export const getSafeConfig = (data: { s_key: string }) =>
	useAxios.post(`${systemUrl}get_safe_config`, {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 删除保护文件/目录
 * @param { string } data.s_key s_key
 * @param { string } data.path path
 */
export const removeSafePath = (data: { s_key: string; path: string }) =>
	useAxios.post(`${systemUrl}remove_safe_path`, {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 添加保护文件/目录
 * @param { string } data.s_key s_key
 * @param { string } data.d_mode d_mode
 * @param { string } data.chattr chattr
 * @param { string } data.path path
 */
export const addSafePath = (data: { s_key: string; d_mode: string; chattr: string; path: string }) =>
	useAxios.post(`${systemUrl}add_safe_path`, {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取封锁IP信息
 */
export const getSshLimitInfo = () =>
	useAxios.post(`${systemUrl}get_ssh_limit_info`, {
		customType: 'model',
		check: 'array',
	})

/**
 * @description 添加封锁IP
 */
export const addSshLimit = (data: { ip: string }) =>
	useAxios.post(`${systemUrl}add_ssh_limit`, {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 解封IP
 */
export const removeSshLimit = (data: { ip: string }) =>
	useAxios.post(`${systemUrl}remove_ssh_limit`, {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取监控概览
 */
export const getKeywordInfo = () => {
	return useAxios.post(`/project/content/get_content_monitor_overview`, {
		customType: 'model',
		check: 'object',
	})
}

/**
 * @description 获取风险列表
 * @param { Object } data 参数 limit p
 */
export const getRiskList = (data: { limit: number; p: number }) => {
	return useAxios.post(`/project/content/get_risk_list`, {
		data,
		customType: 'model',
		check: 'object',
	})
}

/**
 * @description 获取站点违规词检测历史
 * @param { string } data.site_name 站点名称
 * @param { number } data.p 页码
 * @param { number } data.limit 每页数量
 */
export const getSingleSiteRisk = (data: { site_name: string; p: number; limit: number }) =>
	useAxios.post('project/content/get_single_site_risk', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 获取检测历史
 * @param { Object } data 参数 limit p
 */
export const getRisk = (data: { limit: number; p: number }) => {
	return useAxios.post(`/project/content/get_risk`, {
		data,
		customType: 'model',
		check: 'object',
	})
}

/**
 * @description 风险详情
 * @param { Object } data 参数 limit p
 */
export const getRiskInfo = (data: { testing_id: number; limit: number; p: number }) => {
	return useAxios.post(`/project/content/get_risk_info`, {
		data,
		customType: 'model',
		check: 'object',
	})
}

/**
 * @description 获取监控列表
 */
export const getMonitorList = () => {
	return useAxios.post(`/project/content/get_content_monitor_list`, {
		customType: 'model',
		check: 'array',
	})
}

/**
 * @description 删除监控
 * @param { number } data.id 监控id
 */
export const delMonitorData = (data: { id: number }) => {
	return useAxios.post(`/project/content/del_content_monitor_info`, {
		data,
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 立即检测
 * @param { number } data.id 监控id
 */
export const scanMonitorData = (data: { id: number }) => {
	return useAxios.post(`/project/content/scanning`, {
		data: { data: JSON.stringify(data) },
		customType: 'model',
		check: 'object',
	})
}

/**
 * @description 检测监控
 */
export const killScan = (data: { id: number }) => {
	return useAxios.post(`/project/content/kill_scanning`, {
		data: { data: JSON.stringify(data) },
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 自定义词库
 */
export const getThesaurus = () => {
	return useAxios.post(`/project/content/get_thesaurus`, {
		customType: 'model',
		check: 'array',
	})
}

/**
 * @description 清空自定义词库
 */
export const clearThesaurus = () => {
	return useAxios.post(`/project/content/clear_thesaurus`, {
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 删除自定义词库
 * @param { string } data.key 关键词
 */
export const delThesaurus = (data: { key: string }) => {
	return useAxios.post(`/project/content/del_thesaurus`, {
		data,
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 导出自定义词库
 */
export const outThesaurus = () => {
	return useAxios.post(`/project/content/out_thesaurus`, {
		customType: 'model',
		check: 'object',
	})
}

/**
 * @description 添加自定义词库
 * @param { Object } data 参数
 */
export const addThesaurus = (data: { key: string }) => {
	return useAxios.post(`/project/content/add_thesaurus`, {
		data: { data: JSON.stringify(data) },
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 获取网站列表
 * @param { Object } data 参数
 */
export const getDataList = (data: { type: string }) => {
	return useAxios.post(`crontab/GetDataList`, {
		data,
		check: 'object',
	})
}

/**
 * @description 添加/编辑监控
 * @param { Object } status/data 参数
 */
export const addMonitor = (status: boolean, data: AnyObject) => {
	const url = !status ? 'add_content_monitor_info' : 'set_content_monitor_info'
	return useAxios.post(`/project/content/${url}`, {
		data: { data: JSON.stringify(data) },
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 获取PHP网站安全首页列表
 */
export const getPhpSiteNotice = () =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=get_notice`, {
		customType: 'model',
		check: 'object',
	})

/* PHP网站安全 */
/**
 * @description 获取PHP网站安全首页列表
 */
export const getPhpSiteStatus = () =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=get_status`, {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取PHP告警信息
 * @param { Object } data 参数
 * @param { number } data.p 页码
 * @param { number } data.limit 每页数量
 */
export const getPhpAlertLog = (data: { p: number; rows: number }) =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=get_send_logs`, {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取PHP告警设置
 */
export const getPhpAlertSet = () =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=get_send_config`, {
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置PHP告警设置
 * @param { string } data.type 类型
 */
export const setPhpAlertSet = (data: { type: string }) => {
	return useAxios.post(`/plugin?action=a&name=security_notice&s=set_send`, {
		data,
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description PHP模块
 */
export const getPhpModuleList = () =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=get_index`, {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 设置PHP防护状态
 * @param { string } data.php_version PHP版本
 * @param { number } data.enable 是否开启
 */
export const setPhpModuleStatus = (data: { php_version: string; enable: number }) =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=set_php_status`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 网站ip/url白名单
 */
export const getPhpWhiteList = () =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=get_overall_info`, {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 清空白名单【ip/url】
 * @param { string } data.type 类型 ip/url
 */
export const clearWhite = (data: { type: string }) =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=empty_info`, {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 删除IP白名单那
 */
export const delIpWhite = (data: { index: number }) =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=remove_ip_white`, {
		data,
		customType: 'model',
		loading: '正在删除，请稍候...',
		check: 'msg',
	})
/**
 * @description 删除url白名单那
 * @param { number } data.index 索引
 */
export const delUrlWhite = (data: { index: number }) =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=remove_url_white`, {
		data,
		customType: 'model',
		loading: '正在删除，请稍候...',
		check: 'msg',
	})

/**
 * @description 添加到url白名单
 * @param { string } data.url_rule url规则
 */
export const addUrlWhite = (data: { url_rule: string }) =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=add_url_white`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 添加到ip白名单
 * @param { string } data.start_ip 开始ip
 * @param { string } data.end_ip 结束ip
 */
export const addPhpIpWhite = (data: { start_ip: string; end_ip: string }) =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=add_ip_white`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 从木马隔离箱中恢复
 * @param { string } data.path 路径
 */
export const recoverIsolation = (data: { path: string }) =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=Re_Recycle_bin`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除隔离箱文件
 * @param { string } data.path 文件路径
 */
export const deleteIsolation = (data: { path: string }) =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=Del_Recycle_bin`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 木马隔离箱
 */
export const getIsolationList = () =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=Get_Recycle_bin`, {
		customType: 'model',
		check: 'array',
	})

/**
 * @description 获取php网站列表
 */
export const getPhpSiteList = () =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=get_sites`, {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 删除当前网站php版本防护监视器-php
 */
export const delPhpSiteSafe = (data: any): Promise<any> =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=del_site_config`, {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 网站防护开关
 * @param { Object } data 参数
 * @param { string } data.siteName 站点名称
 * @param { boolean } data.status 是否开启
 */
export const setSiteSecurityStatus = (status: boolean, data: { siteName: string }) => {
	const param = !status ? 'stop_site' : 'start_site'
	return useAxios.post(`/plugin?action=a&name=security_notice&s=${param}`, {
		data,
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 网站日志
 * @param { number } data.p 页码
 * @param { number } data.limit 每页数量
 * @param { string } data.siteName 站点名称
 */
export const getPhpSiteLog = (data: { p: number; limit: number; siteName: string }) =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=get_domain_logs`, {
		data,
		customType: 'model',
	})

/**
 * @description 添加到url白名单-详情
 * @param { string } data.url_rule url规则
 */
export const setSiteUrlWhite = (data: { url_rule: string }) =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=wubao_url_white`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置已处理
 */
export const setIgnore = (data: { operation: number; id: number }) =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=set_ignore`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置网站监视器配置
 * @param { Object } data 参数
 * @param { string } data.domain 域名
 */
export const setSiteFileMonitor = (status: boolean, data: { domain: string; path: string; type: string; actions: string }) => {
	const type = status ? 'edit_site_config' : 'add_site_config'
	return useAxios.post(`/plugin?action=a&name=security_notice&s=${type}`, {
		data,
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 模拟攻击
 * @param { Object } data 参数
 * @param { string } data.version 版本
 */
export const startAttack = (data: { version: string }) =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=attack`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置php安全首页监控开关
 */
export const setStartService = (data: { status: string }) =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=start_service`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取防火墙统计信息
 */
export const getFirewallInfo = () =>
	useAxios.post('/firewall/com/get_firewall_info', {
		check: 'object',
		customType: 'model',
	})

/**
 * @description 获取防火墙开关状态
 */
export const getFirewallStatus = () =>
	useAxios.post('/firewall/com/get_status', {
		check: 'boolean',
		customType: 'model',
	})

/**
 * @description 初始化面板防火墙状态
 */
export const setFirewallInitStatus = () =>
	useAxios.post('/firewall/com/update_bt_firewall', {
		check: 'object',
		customType: 'model',
	})

/**
 * @description 获取网站日志信息
 */
export const getSiteLogInfo = () =>
	useAxios.post('/firewall/com/get_www_logs_size', {
		check: 'object',
		customType: 'model',
	})

/**
 * @description 清空web日志
 */
export const clearWebLogs = () => useAxios.post('files/CloseLogs', { check: 'string' })

/**
 * @description 是否启用ping
 */
export const setPing = (data: { status?: string }) =>
	useAxios.post('firewall/SetPing', {
		data,
		check: 'msg',
	})

/**
 * @description 设置防火墙开关状态
 * @param { number } data.status 状态
 */
export const setFirewallStatus = (data: { status: number; ports?: string }) =>
	useAxios.post('/firewall/com/set_status', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取所有的端口规则
 * @param { string } data.chain 数据类型  	ALL是获取所有方向，INPUT是获取入站，OUTPUT是获取出站
 */
export const getPortList = (data: { chain: string; query: string }) =>
	useAxios.post('/firewall/com/port_rules_list', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 获取监听进程
 * @param { string | number } data.port 端口
 */
export const getListeningProcesses = (data: { port: string | number }) => {
	return useAxios.post(`safe/firewall/get_listening_processes`, {
		data: { data: JSON.stringify(data) },
		check: 'object',
		customType: 'model',
	})
}

/**
 * @description 编辑端口规则
 * @param { string } data 数据
 */
export const editPortRules = (data: any, isDomain: boolean) => {
	const request = isDomain ? 'modify_domain_port_rule' : 'modify_port_rule'
	return useAxios.post(`/firewall/com/${request}`, {
		data,
		check: 'msg',
		customType: 'model',
	})
}

/**
 * @description 设置端口规则
 * @param { string } data 数据
 */
export const addPortRules = (data: any, isDomain: boolean) => {
	const request = isDomain ? 'set_domain_port_rule' : 'set_port_rule'
	return useAxios.post(`/firewall/com/${request}`, {
		data,
		check: 'msg',
		customType: 'model',
	})
}

/**
 * @description 防火墙通用导入规则
 * @param { string } data.rule 导出类型  	port  ip  forward
 * @param { string } data.file 导出文件路径
 */
export const inputRules = (data: any) => {
	if (data.rule_name === 'country_rule') {
		return useAxios.post('safe/firewall/import_rules', {
			data: { data: JSON.stringify(data) },
			check: 'msg',
			customType: 'model',
		})
	}

	return useAxios.post('/firewall/com/import_rules', {
		data,
		check: 'msg',
		customType: 'model',
	})
}
/**
 * @description 防火墙通用导出规则
 * @param { string } data.rule 导出类型  	port  ip  forward
 * @param { string } data.chain 导出数据  	ALL是获取所有方向，INPUT是获取入站，OUTPUT是获取出站
 */
export const outPutRules = (data: AnyObject) => {
	if (data.rule_name === 'country_rule') {
		return useAxios.post('safe/firewall/export_rules', {
			data: { data: JSON.stringify(data) },
			check: 'msg',
			customType: 'model',
		})
	}
	return useAxios.post('/firewall/com/export_rules', {
		data,
		check: 'msg',
		customType: 'model',
	})
}

/**
 * @description 获取所有的ip规则
 * @param { string } data.chain 数据类型  	ALL是获取所有方向，INPUT是获取入站，OUTPUT是获取出站
 */
export const getIpRulesList = (data: { chain: string; query?: string }) =>
	useAxios.post('/firewall/com/ip_rules_list', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 编辑ip规则
 * @param { string } data 数据
 */
export const editIpRules = (data: any) =>
	useAxios.post('/firewall/com/modify_ip_rule', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 设置ip规则
 * @param { string } data 数据
 */
export const setIpRules = (data: any) =>
	useAxios.post('/firewall/com/set_ip_rule', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 获取所有的端口转发规则
 */
export const getPortForward = (data: { query: string }) =>
	useAxios.post('/firewall/com/port_forward_list', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 设置端口转发规则
 * @param { string } data 数据
 */
export const setForwardRules = (data: any) =>
	useAxios.post('/firewall/com/set_port_forward', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 编辑端口转发规则
 * @param { string } data 数据
 */
export const editForwardRules = (data: any) =>
	useAxios.post('/firewall/com/modify_forward_rule', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 获取地区规则列表数据
 * @returns { Promise }
 */
export const getCountryList = (data: any) =>
	useAxios.post('safe/firewall/get_country_list', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 删除地区规则
 * @returns { Promise }
 */
export const removeCountry = (data: any) =>
	useAxios.post('safe/firewall/remove_country', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取地区数据
 * @returns { Promise }
 */
export const getCountryOptions = () =>
	useAxios.post('safe/firewall/get_countrys', {
		customType: 'model',
		check: 'array',
	})

/**
 * @description 添加地区规则
 * @returns { Promise }
 */
export const createCountry = (data: AnyObject) =>
	useAxios.post('safe/firewall/create_countrys', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 修改地区规则
 * @returns { Promise }
 */
export const modifyCountry = (data: AnyObject) =>
	useAxios.post('safe/firewall/modify_country', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取端口防扫描
 */
export const getAntiScanStatus = () => {
	return useAxios.post(`safe/firewall/get_anti_scan_status`, {
		check: 'object',
		customType: 'model',
	})
}

/**
 * @description 获取端口防扫描
 * @param { AnyObject } data 参数
 */
export const setAntiScanStatus = (data: { status: number }) => {
	return useAxios.post(`/safe/firewall/set_anti_scan_status`, {
		data: { data: JSON.stringify(data) },
		check: 'msg',
		customType: 'model',
	})
}

/**
 * @description 删除IP扫描
 */
export const delBlastIp = (data: { ip: string }) => {
	return useAxios.post(`ssh_security/del_ban_ip`, { data, check: 'msg' })
}

/**
 * @description
 * @param data
 */
export const delScanIp = (data: any) => {
	return useAxios.post(`safe/firewall/del_ban_ip`, {
		data,
		check: 'msg',
		customType: 'model',
	})
}

/**
 * @description 获取端口防扫描
 */

export const getAntiScanLogs = () => {
	return useAxios.post(`safe/firewall/get_anti_scan_logs`, {
		check: 'object',
		customType: 'model',
	})
}

/**
 * @description 添加告警任务
@param { number | undefined } data.task_id? 任务id   编辑时传
@param { string } data.template_id 任务模板id
@param { string } data.task_data 任务数据（JSON数据）， task_data部分按模板来填写， sender为发送通道列表，number_rule为次数控制， time_rule为时间控制
@returns { Promise }
 */
export const setNewAlarmTask = (data: any): Promise =>
	useAxios.post('/mod/push/task/set_task_conf', {
		data,
		check: 'msg',
		customType: 'model',
	})
// 测试版新告警列表相关end

/**
 * @description 获取安全检测
 */
export const getSafeCount = () =>
	useAxios.post(`/project/safe_detect/get_safe_count`, {
		customType: 'model',
		check: 'object',
	})
/**
 * @description 获取文件完整性检测-检测结果
 */
export const getFileIntegrityResult = (data: AnyObject) => {
	return useAxios.post(`/project/safe_detect/get_scan_res`, {
		data,
		check: 'object',
		customType: 'model',
	})
}

/**
 * @description 获取文件完整性检测-立即检测
 */
export const getFileIntegrityResultNow = () => {
	return useAxios.post(`/project/safe_detect/file_detect`, {
		check: 'msg',
		customType: 'model',
	})
}

/**
 * @description 获取文件完整性检测-立即处理
 * @param { AnyObject } data.path 路径
 */
export const getFileIntegrityResultHandle = (data: AnyObject) => {
	return useAxios.post(`/project/safe_detect/opt_dir`, {
		data,
		check: 'msg',
		customType: 'model',
	})
}
/**
 * @description 获取文件完整性检测-获取监控目录
 * @param { AnyObject } data.path 路径
 */
export const getFileMonitorList = () => {
	return useAxios.post(`/project/safe_detect/get_scan_dir`, {
		check: 'object',
		customType: 'model',
	})
}

/**
 * @description 添加文件完整性检测-目录
 * @param { AnyObject } data.dir 路径
 */
export const addFileMonitorList = (data: AnyObject) => {
	return useAxios.post(`/project/safe_detect/add_scan_dir`, {
		data,
		check: 'msg',
		customType: 'model',
	})
}

/**
 * @description 删除文件完整性检测-目录
 * @param { AnyObject } data.path 路径
 */
export const delFileMonitorList = (data: AnyObject) => {
	return useAxios.post(`/project/safe_detect/del_scan_dir`, {
		data,
		check: 'msg',
		customType: 'model',
	})
}
/**
 * @description 获取文件完整性检测-当前定时任务信息
 */
export const getFileDetectTask = () => {
	return useAxios.post(`/project/safe_detect/get_cron_file_M`, {
		check: 'object',
		customType: 'model',
	})
}
/**
 * @description 获取文件完整性检测-设置定时任务信息
 */
export const setFileDetectTask = (data: AnyObject) => {
	return useAxios.post(`/project/safe_detect/set_cron_file_info`, {
		data,
		check: 'msg',
		customType: 'model',
	})
}
/**
 * @description 删除监控目录
 * @param { Object } data 参数 path
 */
export const delMonitorDir = (data: { path: string }) =>
	useAxios.post(`/project/safe_detect/del_monitor_dir`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 停止监控/启动监控
 */
export const setMonitorDir = (status: boolean, data: AnyObject) => {
	const url = status ? 'stop_monitor_dir' : 'start_monitor_dir'
	return useAxios.post(`/project/safe_detect/${url}`, {
		data,
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 修改监控目录备注
 */
export const editMonitorDir = (data: AnyObject) => {
	return useAxios.post(`/project/safe_detect/edit_monitor_dir`, {
		data,
		customType: 'model',
		check: 'msg',
	})
}
/**
 * @description 停止/开启木马查杀全局状态
 * @param { Object } status 参数
 */
export const setServiceStatus = (status: boolean) => {
	const url = status ? 'stop_service' : 'start_service'
	return useAxios.post(`/project/safe_detect/${url}`, {
		customType: 'model',
		check: 'msg',
	})
}
/**
 * @description 木马查杀全局状态
 */
export const getServiceStatus = () =>
	useAxios.post(`/project/safe_detect/get_service_status`, {
		customType: 'model',
		check: 'object',
	})
/**
 * @description 木马查杀列表
 */
export const getMonitorDir = () =>
	useAxios.post(`/project/safe_detect/get_monitor_dir`, {
		customType: 'model',
		check: 'array',
	})
/**
 * @description 获取隔离文件数量
 */
export const getWebshellTotal = () =>
	useAxios.post(`/project/safe_detect/get_webshell_total`, {
		customType: 'model',
		check: 'number',
	})
/**
 * @description 添加监控目录
 */
export const addMonitorDir = (data: AnyObject) =>
	useAxios.post(`/project/safe_detect/add_monitor_dir`, {
		data,
		customType: 'model',
		check: 'msg',
	})
/**
 * @description 获取所有网站目录
 * @param { Object } data 参数 path
 */
export const addAllSite = () =>
	useAxios.post(`/project/safe_detect/add_all_site`, {
		customType: 'model',
		check: 'array',
	})
/**
 * @description 获取隔离文件
 */
export const getWebShellFile = () =>
	useAxios.post(`/project/safe_detect/webshell_file`, {
		customType: 'model',
		check: 'array',
	})

/**
 * @description 删除隔离文件
 * @param { Object } data 参数
 */

export const setHandleFile = (data: AnyObject) => {
	return useAxios.post(`/project/safe_detect/set_handle_file`, {
		data,
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 获取白名单目录
 */
export const getWhitePath = () =>
	useAxios.post(`/project/safe_detect/get_white_path`, {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 添加白名单目录
 */
export const addWhitePath = (data: AnyObject) =>
	useAxios.post(`/project/safe_detect/add_white_path`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除白名单目录
 * @param { Object } data
 * /
 */
export const delWhitePath = (data: AnyObject) =>
	useAxios.post(`/project/safe_detect/del_white_path`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 安全扫描
 * @param { Object } data
 * /
 */
export const startScan = () => {
	return useAxios.post(`project/scanning/startScan`, {
		check: 'object',
		customType: 'model',
	})
}

/**
 * @description 安全检测-漏洞扫描-自动化扫描-查询告警设置
 */
export const getScanStatusInfo = () => {
	return useAxios.post(`site/get_cron_scanin_info`, {
		check: 'object',
	})
}

/**
 * @description 安全检测-漏洞扫描-自动化扫描-设置告警
 */
export const setScanStatusInfo = (data: AnyObject) => {
	return useAxios.post(`site/set_cron_scanin_info`, {
		data,
		check: 'msg',
	})
}

/**
 * @description 获取防护配置配置信息
 */
export const getSshConfig = () =>
	useAxios.post(`${systemUrl}get_ssh_config`, {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取防护配置SSH服务加固配置信息
 * @param { Object } data 参数
 */
export const saveSshConfig = (data: AnyObject) =>
	useAxios.post(`${systemUrl}save_ssh_config`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取防护配置异常进程监控配置信息
 */
export const getProcessWhite = () =>
	useAxios.post(`${systemUrl}get_process_white`, {
		customType: 'model',
		check: 'array',
	})

/**
 * @description 获取防护配置异常进程监控配置信息
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const addProcessWhiteSystem = (data: { process_name: string }) =>
	useAxios.post(`${systemUrl}add_process_white`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取防护配置异常进程监控配置信息
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const removeProcessWhite = (data: { process_name: string }) =>
	useAxios.post(`${systemUrl}remove_process_white`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 修复计划任务
 * @param { Object } data 参数
 */
export const repairCron = (data: AnyObject) => {
	return useAxios.post(`/project/content/repair_cron`, {
		data,
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 获取所有的ip规则
 * @param { string } data.chain 数据类型   p: number; limit: number; query?: string
 */
export const getIpBannedData = (data: { data: string }) =>
	useAxios.post('/safe/firewall/get_malicious_ip_list', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 清空恶意IP
 * @param { string } data.chain 数据类型  	ALL是获取所有方向，INPUT是获取入站，OUTPUT是获取出站
 */
export const clearIpBannedData = () =>
	useAxios.post('/safe/firewall/remove_all_malicious_ip', {
		check: 'object',
		customType: 'model',
	})

/**
 * @description 清空恶意IP
 * @param { string } data.chain 数据类型  	ALL是获取所有方向，INPUT是获取入站，OUTPUT是获取出站
 */
export const delIpBannedData = (data: { data: string }) =>
	useAxios.post('/safe/firewall/remove_malicious_ip', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 清空恶意IP
 * @param { string } data.chain 数据类型  	ALL是获取所有方向，INPUT是获取入站，OUTPUT是获取出站
 */
export const changeIpBannedData = (data: { data: string }) =>
	useAxios.post('/safe/firewall/switch_malicious_ip', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 清空恶意IP
 * @param { string } data.chain 数据类型  	ALL是获取所有方向，INPUT是获取入站，OUTPUT是获取出站
 */
export const getIpBannedStatus = () =>
	useAxios.post('/safe/firewall/get_malicious_ip_status', {
		check: 'object',
		customType: 'model',
	})

/**
 * @description 清空恶意IP
 * @param { string } data.chain 数据类型  	ALL是获取所有方向，INPUT是获取入站，OUTPUT是获取出站
 */
export const setBannedTimeApi = (time: number) =>
	useAxios.post('/safe/firewall/set_malicious_ip_bantime', {
		data: { data: JSON.stringify({ bantime: time }) },
		check: 'object',
		customType: 'model',
	})

/**
 * @description 获取扫描感知概览
 * @param { string } data.start_timestamp 开始时间
 * @param { string } data.end_timestamp 结束时间
 */
export const getScanPerceptionOverview = (data: { start_timestamp: string; end_timestamp: string }) => {
	return useAxios.post(`${networkScanUrl}get_overview_and_scan_info`, {
		data,
		customType: 'model',
		check: 'object',
	})
}
/**
 * @description 扫描感知开关
 * @param { string } data.switch_type 开关类型
 * @param { string } data.status 开启/关闭
 */
export const toggleScanPerception = (data: { switch_type: string; status: boolean }) => {
	return useAxios.post(`${networkScanUrl}toggle_switch_status`, {
		data,
		customType: 'model',
		check: 'msg',
	})
}
/**
 * @description 导出扫描感知IP列表
 */
export const exportScanPerceptionIpList = () => {
	return useAxios.post(`${networkScanUrl}export_ip_table`, {
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 获取扫描感知详情
 * @param { string } ip ip
 */
export const getScanPerceptionDetail = (data: { ip: string }) => {
	return useAxios.post(`${networkScanUrl}get_ip_detail`, {
		data,
		customType: 'model',
	})
}
/**
 * @description 保存扫描感知详情
 * @param { number } data.minutes 分钟
 * @param { string } data.scan_count 扫描次数
 * @param { string } data.cleanup_days 清理天数
 */
export const saveScanPerceptionDetail = (data: { minutes?: string; scan_count?: string; cleanup_days?: string }) => {
	return useAxios.post(`${networkScanUrl}set_scan_sensing_rule`, {
		data,
		customType: 'model',
		check: 'msg',
	})
}
/**
 * @description 获取扫描感知实时日志
 */
export const getScanPerceptionRealTimeLog = () => {
	return useAxios.post(`${networkScanUrl}get_networkscan_log`, {
		customType: 'model',
		check: 'msg',
	})
}
/**
 * @description 获取封禁IP列表
 */
export const getBlockedIpList = () => {
	return useAxios.post('/btwaf/get_waf_drop_ip.json', {
		customType: 'model',
	})
}

/**
 * @description 封禁IP
 * @param { string } data.ip ip
 * @param { number } data.timeout 封禁时间
 */
export const blockIp = (data: { ip: string; timeout: number }) => {
	return useAxios.post('/btwaf/add_temporary_ip.json', {
		data,
		customType: 'model',
		check: 'msg',
	})
}
/**
 * @description 解封IP
 * @param { string } data.ip ip
 * @param { number } data.timeout 封禁时间
 */
export const unlockIp = (data: { ip: string; timeout: number }) => {
	return useAxios.post('/btwaf/del_temporary_ip.json', {
		data,
		customType: 'model',
		check: 'msg',
	})
}
/**
 * @description 获取扫描感知操作日志
 * @param { number } data.p 当前页
 * @param { number } data.rows 每页条数
 */
export const getScanPerceptionOperationLog = (data: { p: number; rows: number }) => {
	return useAxios.post('/networkscan/get_action_logs.json', {
		customType: 'model',
		data,
	})
}
/**
 * @description 获取SSH服务加固配置-SSH服务加固配置
 * @param { Object } data 参数
 */
export const removeSSHCron = () => {
	return useAxios.post(`/mod/ssh/com/remove_cron_job`, {
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 获取SSH服务加固配置-SSH服务加固配置
 * @param data
 * @returns
 */
export const setSSHBannedData = (data: { data: string }) =>
	useAxios.post('/mod/ssh/com/run_ban_login_failed_ip', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 添加SSH服务加固配置-SSH服务加固配置
 * @param data
 * @returns
 */
export const addSSHCron = (data: any) => {
	return useAxios.post(`/mod/ssh/com/add_cron_job`, {
		data,
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 清理缓存
 * @param data
 * @returns
 */
export const clearCacheRequest = () => {
	return useAxios.post(`/firewall/com/clean_cache`, {
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 清理登录日志
 * @param data
 * @returns
 */
export const clearLoginLog = () => {
	return useAxios.post(`/mod/ssh/com/clean_ssh_list`, {
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description SSH服务器安全模块 - 获取安全状态列表
 * @returns
 */
export const getSSHSecurityList = () => {
	return useAxios.post(`/safe/serversafe/get_security_info`, {
		customType: 'model',
		check: 'object',
	})
}

/**
 * @description 修复服务器安全
 * @returns
 */
export const repairSecurity = (data: any) => {
	return useAxios.post(`/safe/serversafe/repair_security`, {
		data,
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 安装防暴破插件
 * @param data
 * @returns
 */
export const installFail2ban = (data: any) => {
	return useAxios.post(`/safe/serversafe/install_fail2ban`, {
		data,
		customType: 'model',
		check: 'msg',
	})
}