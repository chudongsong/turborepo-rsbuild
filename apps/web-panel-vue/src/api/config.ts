import { useAxios } from '@axios/index'
/* eslint-disable @typescript-eslint/naming-convention */
import type { ResponseResult } from '@/types'

/**
 * @description 获取消息中心
 * @returns { Promise<ResponseResult> }
 */
export const getMsgList = (data: { page: number; size: number; sub_type: string; is_read: boolean }): Promise<ResponseResult> => useAxios.post('panel/msgbox/get_msg_list', { data, customType: 'model' })

/**
 * @description 设置全部已读
 * @returns
 */
export const setReadAll = (): Promise<ResponseResult> => useAxios.post('panel/msgbox/read_all', { customType: 'model', check: 'msg' })

/**
 * @description 全部删除
 * @returns
 */
export const setDeleteAll = (): Promise<ResponseResult> =>
	useAxios.post('panel/msgbox/delete_all', {
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取告警列表
 * @returns { Promise<ResponseResult> }
 */
export const getPushList = (): Promise<ResponseResult> => useAxios.post('push/get_push_list')

/**
 * @description 设置告警状态
 * @param { Number } data.id 告警id
 * @param { String } data.name 告警名称
 * @param { Number } data.status 告警状态
 * @returns { Promise<ResponseResult> }
 */
export const setPushStatus = (data: { id: string; name: string; status: number }): Promise<ResponseResult> => useAxios.post('push/set_push_status', { data, check: 'msg' })

/**
 * @description 获取消息详情
 * @param { Number } data.id 消息id
 * @param { String } data.name 消息名称
 * @returns { Promise<ResponseResult> }
 */
export const delPushConfig = (data: { name: string; id: string }): Promise<ResponseResult> => useAxios.post('push/del_push_config', { data, check: 'msg' })

/**
 * @description 获取备份还原列表
 * @param { Number } data.page 页码
 * @param { Number } data.limit 每页数量
 * @returns { Promise<ResponseResult> }
 */
export const getBackupTaskList = (data: { page: number; limit: number }): Promise<ResponseResult> =>
	useAxios.post('/panel/whole_machine_backup/get_task_list', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 删除备份任务
 * @param { Number } data.id 任务id
 * @returns { Promise<ResponseResult> }
 */
export const delBackupTask = (data: { id: number }) =>
	useAxios.post('/panel/whole_machine_backup/del_task', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 立即执行备份
 * @param { Number } data.id 任务id
 * @returns { Promise<ResponseResult> }
 */
export const backupData = (data: { id: number }) =>
	useAxios.post('/panel/whole_machine_backup/backup', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 立即执行恢复
 * @param { Number } data.id 任务id
 * @returns { Promise<ResponseResult> }
 */
export const reductionData = (data: { id: number }) =>
	useAxios.post('/panel/whole_machine_backup/reduction', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取告警日志
 * @param { number | string } data.limit 条数
 * @param { number | string } data.p 页码
 * @param { string } data.status 状态
 * @param { string } data.keyword 关键词
 * @returns { Promise<ResponseResult> }
 */
export const getPushLogs = (data: any): Promise<ResponseResult> =>
	useAxios.post('push/get_push_logs', {
		data,
		check: 'object',
	})

/**
 * @description 获取备份数据显示列表
 * @returns { Promise<ResponseResult> }
 */
export const getDataBackupList = (): Promise<ResponseResult> =>
	useAxios.post('/panel/whole_machine_backup/get_data_list', {
		check: 'object',
		customType: 'model',
	})

/**
 * @description 添加/恢复备份
 *
 */
export const createBackupRecover = (data: AnyObject) =>
	useAxios.post('/panel/whole_machine_backup/create_task', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取备份还原数据日志
 */
export const logsRecoverDataList = (data: { id: string | number }, type: string) =>
	useAxios.post(`/panel/whole_machine_backup/${type === 'backup' ? 'get_backup_log' : 'get_reduction_log'}`, {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 关闭面板事件处理
 * @returns { Promise }
 */
export const closePanel = (): Promise<ResponseResult> => useAxios.post('config/ClosePanel', { check: 'msg' })

/**
 * @description 设置离线模式
 * @returns { Promise }
 */
export const setLocal = (): Promise<ResponseResult> => useAxios.post('config/set_local', { check: 'msg' })

/**
 * @description 监听IPv6状态
 * @returns { Promise }
 */
export const setIpv6Status = (): Promise<ResponseResult> => useAxios.post('config/set_ipv6_status', { check: 'msg' })

/**
 * @description 开发者模式
 * @returns { Promise }
 */
export const setDebug = (): Promise<ResponseResult> => useAxios.post('config/set_debug', { check: 'msg' })

/**
 * @description 设置API配置
 * @param { number } data.t_type 值传1：重置密钥、值传2：开启/关闭API配置、值传3：保存API配置(需要同传limit_addr参数)
 * @param { string } data.limit_addr IP白名单
 * @returns { Promise }
 */
export const setToken = (data: { t_type: number; limit_addr?: string }): Promise<ResponseResult> => useAxios.post('config/set_token', { data, check: 'msg' })

/**
 * @description 设置在线客服
 * @returns { Promise }
 */
export const setWorkorder = (): Promise<ResponseResult> => useAxios.post('config/show_workorder', { check: 'msg' })

/**
 * @description 设置用户体验改进计划状态
 * @param { number | string } data.status 1为开，'0'为关
 * @returns { Promise }
 */
export const setImprovement = (data: { status: number | string }): Promise<ResponseResult> => useAxios.post('config/set_improvement', { data, check: 'msg' })

/**
 * @description 设置登录归属地提示
 * @param { number | string } data.status 1为开，'0'为关
 * @returns { Promise }
 */
export const setLoginOrigin = (data: { status: number | string }): Promise<ResponseResult> => useAxios.post('config/set_login_origin', { data, check: 'msg' })

type SavePanelConfig = {
	webname?: string
	session_timeout?: number
	domain?: string
	limitip?: string
	sites_path?: string
	backup_path?: string
	address?: string
	systemdate?: string
	port?: number
}

/**
 * @description 设置面板配置
 * @param { string } data.webname 面板别名
 * @param { number } data.session_timeout 超时时间
 * @param { string } data.domain 绑定域名
 * @param { string } data.limitip 授权IP
 * @param { string } data.sites_path 默认建站目录
 * @param { string } data.backup_path 默认备份目录
 * @param { string } data.address 服务器IP
 * @param { string } data.systemdate 服务器时间
 * @returns { Promise }
 */
export const setPanelConfig = (data: SavePanelConfig): Promise<ResponseResult> => useAxios.post('config/setPanel', { data, check: 'msg' })

/**
 * @description 设置左侧菜单标题
 * @returns { Promise }
 */
export const setLeftTitle = (data: { title: string }): Promise<ResponseResult> => useAxios.post('config/set_left_title', { data, check: 'msg' })

/**
 * @description 同步服务器时间
 * @returns { Promise }
 */
export const setSyncDate = (): Promise<ResponseResult> => useAxios.post('config/syncDate', { check: 'msg' })

/**
 * @description 修改用户名
 * @param { number | string } data.username1 用户名
 * @param { number | string  } data.username2 重复输入的用户名
 * @return
 */
export const setUsername = (data: { username1: string; username2: string }) => useAxios.post('config/setUsername', { data, check: 'msg' })

/**
 * @description 设置面板密码
 * @param { number | string } data.password1 面板密码
 * @param { number | string } data.password2 重复面板密码
 * @returns { Promise }
 */
export const setPassword = (data: { password1: string; password2: string }): Promise<ResponseResult> => useAxios.post('config/setPassword', { data, check: 'msg' })

/**
 * @description 解绑宝塔账号
 * @returns { Promise }
 */
export const delToken = (): Promise<ResponseResult> => useAxios.post('ssl/DelToken', { check: 'msg' })

/**
 * @description 设置云端请求方式
 * @param { string } data.http_type 设置云端请求方式
 * @returns { Promise }
 */
export const setRequestType = (data: { http_type: string }): Promise<ResponseResult> => useAxios.post('config/set_request_type', { data, check: 'msg' })

/**
 * @description 设置云端启用节点
 * @param { number } data.node_id 设置云端节点
 * @returns { Promise }
 */
export const setNodeConfig = (data: { node_id: number }): Promise<ResponseResult> => useAxios.post('config/set_node_config', { data, check: 'msg' })

/**
 * @description 设置云端请求线路
 * @param { string } data.iptype 云端请求线路
 * @returns { Promise }
 */
export const setRequestIpType = (data: { iptype: string }): Promise<ResponseResult> => useAxios.post('config/set_request_iptype', { data, check: 'msg' })

/**
 * @description 设置-选择地区信息
 * @param url
 * @param data
 */
export const setLimitData = (data: { limit_area_status: boolean; limit_type?: string; limit_area?: string }): Promise<ResponseResult> => useAxios.post('config/set_limit_area', { data, check: 'msg' })

/**
 * @description 删除面板免端口访问配置
 */
export const delPanelGeneration = (): Promise<ResponseResult> =>
	useAxios.post('/panel/panel_reverse_generation/del_panel_generation', {
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 设置动态口令
 * @returns { Promise }
 */
export const setTwoStepAuth = (data: { act: number }): Promise<ResponseResult> => useAxios.post('config/set_two_step_auth', { data, check: 'msg' })

/**
 * @description 获取访问设备验证状态
 * @returns { Promise }
 */
export const getSslVerify = (): Promise<ResponseResult> => useAxios.post('config/get_ssl_verify')

/**
 * @description 设置访问设备验证状态
 * @returns { Promise }
 */
export const setSslVerify = (data: { status: number; crl?: string; cert?: string }): Promise<ResponseResult> => useAxios.post('config/set_ssl_verify', { data, check: 'msg' })

/**
 * @description 开关告警任务
 * @param { number } data.task_id 任务id
 * @returns { Promise }
 */
export const setTaskStatus = (data: { task_id: string; status?: number }): Promise<ResponseResult> =>
	useAxios.post('/mod/push/task/change_task_conf', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 添加告警任务
 * @param { number | undefined } data.task_id? 任务id   编辑时传
 * @param { string } data.template_id 任务模板id
 * @param { string } data.task_data 任务数据（JSON数据）， task_data部分按模板来填写， sender为发送通道列表，number_rule为次数控制， time_rule为时间控制
 * @returns { Promise }
 */
export const setNewAlarmTask = (data: any): Promise<ResponseResult> =>
	useAxios.post('/mod/push/task/set_task_conf', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 设置密码复杂度
 * @returns { Promise }
 */
export const setPasswordSafe = (): Promise<ResponseResult> => useAxios.post('config/set_password_safe', { check: 'msg' })

/**
 * @description 设置安全入口
 * @param { string } data.admin_path 安全入口
 * @returns { Promise }
 */
export const setAdminPath = (data: { admin_path: string }): Promise<ResponseResult> => useAxios.post('config/set_admin_path', { data, check: 'msg' })

/**
 * @description 设置未认证响应状态
 * @param { string | number } data.status_code 未认证响应方式的id
 * @returns { Promise }
 */
export const setNotAuthStatus = (data: { status_code: number | string }): Promise<ResponseResult> => useAxios.post('config/set_not_auth_status', { data, check: 'msg' })

/**
 * @description 获取密码过期验证状态
 * @returns { Promise }
 */
export const getPasswordConfig = (): Promise<ResponseResult> => useAxios.post('config/get_password_config')

/**
 * @description 设置密码过期时间
 * @param { string | number } data.expire 密码过期天数
 * @returns { Promise }
 */
export const setPawExpire = (data: { expire: number }): Promise<ResponseResult> => useAxios.post('config/set_password_expire', { data, check: 'msg' })

/**
 * @description 获取API配置
 * @returns { Promise }
 */
export const getToken = (): Promise<ResponseResult> => useAxios.post('config/get_token')

/**
 * @description 获取云端节点配置
 * @returns { Promise }
 */
export const getNodeConfig = (): Promise<ResponseResult> => useAxios.post('config/get_node_config')

/**
 * @description 获取动态口令认证状态
 * @returns { Promise }
 */
export const getCheckTwoStep = (): Promise<ResponseResult> => useAxios.post('config/check_two_step', { check: 'msg' })

/**
 * @description 获取面板免端口访问配置
 */
export const getPanelGeneration = (): Promise<ResponseResult> =>
	useAxios.post('panel/panel_reverse_generation/get_panel_generation', {
		check: 'object',
		customType: 'model',
	})

/**
 * @description 获取证书列表
 */
export const getCertList = (): Promise<ResponseResult> =>
	useAxios.post('ssl/get_cert_list', {
		check: 'array',
	})

/**
 * @description 获取证书信息
 */
export const getCertInfo = (data: { ssl_id: string; ssl_hash: string }): Promise<ResponseResult> =>
	useAxios.post('ssl/get_cert_info', {
		data,
		check: 'ignore',
	})

/**
 * @description 设置面板免端口访问配置
 */
export const setPanelGeneration = (data: AnyObject): Promise<ResponseResult> =>
	useAxios.post('/panel/panel_reverse_generation/set_panel_generation', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取动态口令认证状态
 * @returns { Promise }
 */
export const getTwoStepKey = (): Promise<ResponseResult> => useAxios.post('config/get_key')

/**
 * @description 获取动态口令数据
 * @returns { Promise }
 */
export const getQrcodeData = (data: { act: number }): Promise<ResponseResult> => useAxios.post('config/get_qrcode_data', { data, check: 'string' })

/**
 * @description 获取操作日志
 * @param { number } data.id 日志id
 * @returns { Promise }
 */
export const getTempOperationLogs = (data: { id: number }): Promise<ResponseResult> => useAxios.post('config/get_temp_login_logs', { data, check: 'array' })

/**
 * @description 删除临时授权链接
 * @param { number } data.id 授权id
 * @returns { Promise }
 */
export const removeTempAuthLink = (data: { id: number }): Promise<ResponseResult> => useAxios.post('config/remove_temp_login', { data, check: 'msg' })

/**
 * @description 获取临时授权列表
 * @param { string | number } data.p 页码
 * @param { string | number } data.rows 条数
 * @returns { Promise }
 */
export const getTempAuthList = (data: { p: number; rows: number }): Promise<ResponseResult> => useAxios.post('config/get_temp_login', { data })

/**
 * @description 创建临时授权链接
 * @returns { Promise }
 */
export const setTempAuthLink = (data: { expire_time: string }): Promise<ResponseResult> => useAxios.post('config/set_temp_login', { data, check: 'object' })

/**
 * @description 获取UA限制信息
 * @returns { Promise }
 */
export const getLimitUa = (): Promise<ResponseResult> => useAxios.post('config/get_limit_ua', { check: 'object' })

/**
 * @description 修改UA限制信息
 * @param { number } data.status 状态
 * @param { string } data.new_name 新名称
 * @param { string } data.ua_list UA列表
 * @param { number } data.id UA限制id
 * @returns { Promise<ResponseResult> }
 */
export const modifyLimitUa = (data: { status?: number; new_name?: string; ua_list?: string; id?: number }): Promise<ResponseResult> => useAxios.post('config/modify_ua', { data, check: 'msg' })

/**
 * @description 删除UA限制信息
 * @param { number } data.id UA限制id
 * @returns { Promise<ResponseResult> }
 */
export const delLimitUa = (data: { id: number }): Promise<ResponseResult> => useAxios.post('config/delete_ua', { data, check: 'msg' })

/**
 * @description 添加UA限制信息
 * @param { string } data.ua_list UA列表
 * @returns { Promise<ResponseResult> }
 */
export const addLimitUa = (data: { ua_list: string }): Promise<ResponseResult> => useAxios.post('config/set_ua', { data, check: 'msg' })

/**
 * @description 获取-选择地区信息
 * @returns {  Promise<ResponseResult> }
 */
export const getLimitData = (): Promise<ResponseResult> => useAxios.post('config/get_limit_area')

/**
 * @description 删除告警任务
 * @param { number } data.task_id 任务id
 * @returns { Promise }
 */
export const delTaskStatus = (data: { task_id: string | number }): Promise<any> =>
	useAxios.post('/mod/push/task/remove_task_conf', {
		data,
		check: 'msg',
		customType: 'model',
	})

interface IAlarmRecord {
	task_id: string
	record_ids: string
}

/**
 * @description 清空告警任务记录
 * @param { number } data.task_id 任务id
 * @returns { Promise }
 */
export const clearTaskRecord = (data: IAlarmRecord): Promise<any> =>
	useAxios.post('/mod/push/task/clear_task_record', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 删除单条告警任务记录
 * @param { number } data.task_id 任务id
 * @param { JSON Array } data.record_ids 记录id数组的json字符串
 * @returns { Promise }
 */
export const delTaskRecord = (data: IAlarmRecord): Promise<any> =>
	useAxios.post('/mod/push/task/remove_task_records', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取告警任务记录
 * @param { number } data.task_id 任务id
 * @param { number } data.page 页码
 * @param { number } data.size 条数
 * @returns { Promise }
 */
export const getTaskRecordList = (data: { task_id: string; page: number; size: number }): Promise<any> =>
	useAxios.post('/mod/push/task/get_task_record', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 设置BasicAuth基础认证
 * @param { string | number } data.basic_user 用户名
 * @param { string | number} data.basic_user 密码
 * @param { string } data.open 服务状态
 * @returns { Promise }
 */
export const setBasicAuth = (data: { basic_user: string; basic_pwd: string; open: string }): Promise<any> => useAxios.post('config/set_basic_auth', { data, check: 'msg' })

/**
 * @description 设置面板证书配置
 * @param { string | number } data.cert_type 面板SSL开关，0为开，1为关
 * @param { string } data.privateKey 密钥(KEY)
 * @param { string } data.certPem 证书(PEM格式)
 * @returns { Promise }
 */
export const setPanelSsl = (data: { cert_type: number; privateKey: string; certPem: string }): Promise<any> => useAxios.post('config/SetPanelSSL', { data, check: 'msg' })

/**
 * @description 保存自定义证书信息
 * @param { string } data.privateKey 密钥(KEY)
 * @param { string } data.certPem 证书(PEM格式)
 * @returns { Promise }
 */
export const savePanelSsl = (data: { privateKey: string; certPem: string }): Promise<any> => useAxios.post('config/SavePanelSSL', { data, check: 'msg' })

/**
 * @description 获取面板证书配置
 * @returns { Promise }
 */
export const getCertSource = (): Promise<any> => useAxios.post('config/get_cert_source')

/**
 * @description 获取自定义证书信息
 * @returns { Promise }
 */
export const getPanelSsl = (): Promise<any> => useAxios.post('config/GetPanelSSL')

/**
 * @description 获取信息
 */
export const getComposerLine = (data: { filename: string; num: number }) => useAxios.post('ajax/get_lines', { data, check: 'msg' })

/**
 * @description 获取进程信息
 * @param url
 * @param data
 */
export const getUrlData = (url: string, data?: AnyObject): Promise<any> =>
	useAxios.post(url, {
		data,
		check: 'array',
		customType: 'model',
	})

/**
 * @description 获取云存储插件安装情况
 * @returns { Promise }
 */
export const getCloudStorage = (): Promise<any> => useAxios.post('/panel/whole_machine_backup/check_plugins', { check: 'object', customType: 'model' })

/**
 * @description 获取本地目录配置
 * @returns { Promise }
 */
export const getLocalDir = (): Promise<any> => useAxios.post('/panel/whole_machine_backup/get_sys_backup_path_config', { check: 'object', customType: 'model' })

/**
 * @description 配置本地目录
 * @param { string } data.sys_backup_path 本地目录
 * @returns { Promise }
 */
export const setLocalDir = (data: { sys_backup_path: string }): Promise<any> => useAxios.post('/panel/whole_machine_backup/set_sys_backup_path_config', { data, check: 'msg', customType: 'model' })

/**
 * @description 删除云存储账号
 * @param { string } data.storage_type 云存储类型
 * @returns { Promise }
 */
export const delCloudStorage = (data: { storage_type: string }): Promise<any> => useAxios.post('/panel/whole_machine_backup/delete_account', { data, check: 'msg', customType: 'model' })

/**
 * @description 获取腾讯云存储方式
 * @returns { Promise }
 */
export const getTxcosStorageType = (): Promise<any> => useAxios.post('/plugin?action=a&name=txcos&s=get_pattern_list', { check: 'object', customType: 'model' })

/**
 * @description 保存腾讯云存储方式
 * @param { AnyObject } data
 * @returns { Promise }
 */
export const saveTxcosStorage = (data: AnyObject): Promise<any> => useAxios.post('/plugin?action=a&s=set_config&name=txcos', { data, check: 'msg', customType: 'model' })

/**
 * @description 修改腾讯云存储方式
 * @param { AnyObject } data
 * @returns { Promise }
 */
export const modifyTxcosStorage = (data: { pattern: string; backup_path: string }): Promise<any> => useAxios.post('/plugin?action=a&name=txcos&s=set_save_path_pattern', { data, check: 'msg', customType: 'model' })

/**
 * @description 获取腾讯云存储配置
 * @returns { Promise }
 */
export const getTxcosConfig = (): Promise<any> => useAxios.post('/plugin?action=a&name=txcos&s=get_config', { check: 'object', customType: 'model' })

/**
 * @description 保存ftp存储配置
 * @param { AnyObject } data
 * @returns { Promise }
 */
export const saveFtpConfig = (data: AnyObject): Promise<any> => useAxios.post('/plugin?action=a&s=set_config&name=ftp', { data, check: 'msg', customType: 'model' })

/**
 * @description 获取ftp存储配置
 * @returns { Promise }
 */
export const getFtpConfig = (): Promise<any> => useAxios.post('/plugin?action=a&name=ftp&s=get_config', { check: 'object', customType: 'model' })

/**
 * @description 保存阿里云存储配置
 * @param { AnyObject } data
 * @returns { Promise }
 */
export const saveAliossConfig = (data: AnyObject): Promise<any> => useAxios.post('/plugin?action=a&s=set_config&name=alioss', { data, check: 'msg', customType: 'model' })

/**
 * @description 获取阿里云存储配置
 * @returns { Promise }
 */
export const getAliossConfig = (): Promise<any> => useAxios.post('/plugin?action=a&name=alioss&s=get_config', { check: 'object', customType: 'model' })

/**
 * @description 保存七牛云存储配置
 * @param { AnyObject } data
 * @returns { Promise }
 */
export const saveQiniuConfig = (data: AnyObject): Promise<any> => useAxios.post('/plugin?action=a&s=set_config&name=qiniu', { data, check: 'msg', customType: 'model' })

/**
 * @description 获取七牛云存储配置
 * @returns { Promise }
 */
export const getQiniuConfig = (): Promise<any> => useAxios.post('/plugin?action=a&name=qiniu&s=get_config', { check: 'object', customType: 'model' })

/**
 * @description 下载备份文件
 * @param { string } data.backup_path 备份路径
 * @param { string } data.storage_type 存储类型
 * @returns { Promise }
 */
export const downloadBackup = (data: { backup_path: string; storage_type: string }): Promise<any> => useAxios.post('/panel/whole_machine_backup/backup_download', { data, check: 'object', customType: 'model' })

/**
 * @description 获取WebDAV配置
 * @returns { Promise }
 */
export const getWebdavConfig = (): Promise<any> => useAxios.post('/plugin?action=a&name=webdav&s=get_config', { check: 'object', customType: 'model' })

/**
 * @description 保存WebDAV配置
 * @param { AnyObject } data
 * @returns { Promise }
 */
export const saveWebdavConfig = (data: AnyObject): Promise<any> => useAxios.post('/plugin?action=a&name=webdav&s=set_config', { data, check: 'msg', customType: 'model' })

// 备份还原 - 新版

/**
 * @description 获取备份列表1
 */

export const getBackListApi = (): Promise<any> => useAxios.post('/mod/backup_restore/com/get_backup_list', { check: 'array', customType: 'model' })

/**
 * @description 下载备份文件
 */
export const downloadBackApi = (data: { id: string }): Promise<any> => useAxios.post('/panel/whole_machine_backup/backup_download', { data, check: 'object', customType: 'model' })

/**
 * @description 删除备份文件1
 * @param { string } data.timestamp 时间戳
 */
export const delBackApi = (data: { timestamp: string }): Promise<any> => useAxios.post('/mod/backup_restore/com/del_backup', { data, check: 'object', customType: 'model' })

/**
 * @description 取消备份1
 * @param { string } data.timestamp 时间戳
 */
export const cancelSyncApi = (data: { timestamp: string }): Promise<any> => useAxios.post('/panel/backup_restore/backup_stop', { data, check: 'object', customType: 'model' })

/**
 * @description 立即执行备份、还原任务
 * @param { string } data.timestamp 时间戳
 */
export const execSyncApi = (data: { timestamp: string }): Promise<any> => useAxios.post('/mod/backup_restore/com/exec_backup', { data, check: 'object', customType: 'model' })

/**
 * @description 还原备份文件1
 * @param { number } data.timestamp 时间戳
 * @param { number } data.auto_exit 还原时异常是否自动停止 0否 1是
 * @param { number } data.force_restore 存在同名时是否覆盖还原 0否 1是
 */
export const addRestoreApi = (data: { timestamp: number; auto_exit: number; force_restore: number }): Promise<any> => useAxios.post('/mod/backup_restore/com/add_restore', { data, check: 'object', customType: 'model' })

/**
 * @description 获取备份、还原日志
 * @param { string } data.timestamp 时间戳
 * @param { string } data.type 类型
 */
export const getSyncLogApi = (data: { timestamp: string; type: string }): Promise<any> => useAxios.post('/mod/backup_restore/com/get_exec_logs', { data, check: 'object', customType: 'model' })

/**
 * @description 获取备份、还原详情
 * @param { number } data.timestamp 时间戳
 * @returns { Promise }
 */
export const getDetailApi = (data: { timestamp: number; type: string }): Promise<any> => useAxios.post('/mod/backup_restore/com/get_details', { data, check: 'object', customType: 'model' })

/**
 * @description 获取备份、还原进度
 * @param { string } data.type 类型
 * @returns { Promise }
 */
export const getProgressApi = (data: { type: string }): Promise<any> => useAxios.post('/mod/backup_restore/com/get_progress', { data, check: 'object', customType: 'model' })

/**
 * @description 添加备份1
 * @param { string } data.backup_name 备份名称
 * @param { number } data.auto_exit 自动退出
 * @param { string } data.storage_type 存储类型
 * @param { number } data.timestamp 时间戳
 */
export const addBackupApi = (data: { backup_name: string; auto_exit: number; storage_type: string; timestamp: number }): Promise<any> => useAxios.post('/mod/backup_restore/com/add_backup', { data, check: 'object', customType: 'model' })

/**
 * @description 取消备份、还原任务
 * @param { string } data.timestamp 时间戳
 */
export const cancelSyncTaskApi = (data: { timestamp: string }): Promise<any> => useAxios.post('/mod/backup_restore/com/task_stop', { data, check: 'object', customType: 'model' })

/**
 * @description 获取备份数据统计接口
 * @returns { Promise }
 */
export const getBackTotal = (): Promise<any> => useAxios.post('/mod/backup_restore/com/get_data_total', { check: 'object', customType: 'model' })

type sshAuth = {
	auth_type: number
	server_ip: string
	ssh_port: number
	ssh_user: string
	password: string
}

/**
 * @description 检查SSH认证方式
 * @param data
 * @returns
 */
export const checkSSHAuth = (data: sshAuth) => useAxios.post('/mod/backup_restore/com/ssh_auth_check', { data, check: 'object', customType: 'model' })

/**
 * @description 开始迁移
 */
export const addMigrateTask = (data: sshAuth) => useAxios.post('/mod/backup_restore/com/add_migrate_task', { data, check: 'object', customType: 'model' })

/**
 * @description 终止迁移
 */
export const stopMigrateTask = () => useAxios.post('/mod/backup_restore/com/stop_migrate', { check: 'object', customType: 'model' })

/**
 * @description 获取迁移任务状态
 */
export const getMigrateTaskStatus = () => useAxios.post('/mod/backup_restore/com/get_migrate_status', { check: 'object', customType: 'model' })

/**
 * @description 获取迁移进度
 */
export const getMigrateProgressApi = () => useAxios.post('/mod/backup_restore/com/get_migrate_progress', { check: 'object', customType: 'model' })

/**
 * @description 获取迁移历史
 * @returns
 */
export const getMigrateHistoryApi = () => useAxios.post('/mod/backup_restore/com/get_history_migrate_list', { check: 'array', customType: 'model' })

/**
 * @description 获取迁移日志
 * @returns
 */
export const getMigrateLogApi = (data: { timestamp: string }) => useAxios.post('/mod/backup_restore/com/get_history_migrate_log', { data, check: 'object', customType: 'model' })

/**
 * @description 获取迁移详情
 * @returns
 */
export const getMigrateInfoApi = (data: { timestamp: string }) => useAxios.post('/mod/backup_restore/com/get_history_migrate_info', { data, check: 'object', customType: 'model' })

/**
 * @description 删除迁移历史
 */
export const delMigrateHistoryApi = (data: { timestamp: string }) => useAxios.post('/mod/backup_restore/com/del_history_migrate', { data, check: 'object', customType: 'model' })

/**
 * @description 获取UI配置
 * @returns
 */
export const getPanelTheme = () => useAxios.post('/config?action=get_panel_theme', { check: 'object', customType: 'model' })

/**
 * @description 设置UI配置
 */
export const setPanelTheme = (data: AnyObject) => useAxios.post('/config?action=set_panel_theme', { data, check: 'object', customType: 'model' })

/**
 * @description 更新UI配置
 */
export const updatePanelTheme = (data: AnyObject) => useAxios.post('/config?action=update_panel_theme', { data, check: 'object', customType: 'model' })

/**
 * @description 导出主题配置
 * @param { string } data.export_path 导出路径（可选）
 */
export const exportThemeConfig = (data?: { export_path?: string }) => useAxios.post('/config?action=export_theme_config', { data, check: 'object', customType: 'model' })

/**
 * @description 导入主题配置
 * @param { string } data.import_file_path 导入文件路径
 * @param { boolean } data.backup_existing 是否备份现有配置
 */
export const importThemeConfig = (data: { file_path: string; backup_existing?: boolean }) => useAxios.post('/config?action=import_theme_config', { data, check: 'object', customType: 'model' })

/**
 * @description 验证导入文件
 * @param { string } data.file_path 导入文件路径
 */
export const validateThemeFile = (data: { file_path: string }) => useAxios.post('/config?action=validate_theme_file', { data, check: 'object', customType: 'model' })

/**
 * @description 获取导出文件信息
 * @param { string } data.export_file_path 导出文件路径
 */
export const getExportFileInfo = (data: { export_file_path: string }) => useAxios.post('/config?action=get_export_file_info', { data, check: 'object', customType: 'model' })

/**
 * @description 获取服务器时区列表
 */
export const getAListOfServerTimeZones = (data: AnyObject) => useAxios.post('/panel/public/GetZoneinfo', { data, check: 'object', customType: 'model' })

/**
 * @description 设置服务器时区
 */
export const setServerTimeZones = (data: AnyObject) => useAxios.post('/panel/public/SetZone', { data, check: 'msg', customType: 'model' })
