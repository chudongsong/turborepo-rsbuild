/* eslint-disable @typescript-eslint/naming-convention */
import type { ResponseResult } from '@axios/types'
import { useAxios } from '@/hooks/tools'

/**
 * @description 获取首页软件列表
 */
export const getHomeSoftList = (): Promise<ResponseResult> => useAxios.post('plugin/get_index_list')

/**
 * @description 获取软件商店已安装的软件列表
 */
export const getHomeInstallSoftList = (data: AnyObject = {}): Promise<ResponseResult> => useAxios.post('plugin/get_soft_list', { data, check: 'object' })

/**
 * @description 添加软件到首页
 */
export const addSoftToHome = (sName: string): Promise<ResponseResult> => useAxios.post('plugin?action=add_index', { data: { sName }, customType: 'model', check: 'msg' })

/**
 * @description 移除首页软件
 */
export const removeSoftToHome = (sName: string): Promise<ResponseResult> =>
	useAxios.post('plugin?action=remove_index', {
		data: { sName },
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取安全风险
 */
export const getRiskInfo = (data: { force?: number } = {}): Promise<ResponseResult> => useAxios.post('warning/get_list', { data })

/**
 * @description 获取安全风险列表
 */
export const getRiskList = (): Promise<ResponseResult> => useAxios.post('warning/get_result', { check: 'object' })
/**
 * @description 获取安全总览
 */
export const getSafeOverview = (): Promise<ResponseResult> => useAxios.post('project/safecloud/get_safe_overview', { customType: 'model' })
/**
 * @description 获取待处理告警趋势
 */
export const getPendingAlarmTrend = (): Promise<ResponseResult> => useAxios.post('project/safecloud/get_pending_alarm_trend', { customType: 'model' })
/**
 * @description 安全趋势
 */
export const getSecurityTrend = (): Promise<ResponseResult> => useAxios.post('project/safecloud/get_security_trend', { customType: 'model' })
/**
 * @description 安全动态
 */
export const getSecurityDynamic = (): Promise<ResponseResult> => useAxios.post('project/safecloud/get_security_dynamic', { customType: 'model' })
/**
 * @description 设置入侵检测开关
 */
export const setHids = (): Promise<ResponseResult> => useAxios.post('/plugin?action=a&name=bt_hids&s=set_process', { customType: 'model' })

/**
 * @description 设置首页软件排序
 * @param { AnyObject } data { ssort: 名称排序字符串 }
 */
export const setHomeSoftSort = (data: AnyObject): Promise<ResponseResult> => useAxios.post('plugin/sort_index', { data })

/**
 * @description 清理内存
 */
export const cleanMemory = (): Promise<ResponseResult> => useAxios.post('system/ReMemory')

/**
 * @description 首页负载等弹出框数据信息
 */
export const getHomeResData = (): Promise<ResponseResult> =>
	useAxios.post('monitor/process_management/specific_resource_load_type', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 首页负载等弹出框结束进程
 * @param {AnyObject} data {pid:number}
 */
export const killProcess = (data: AnyObject): Promise<ResponseResult> =>
	useAxios.post('monitor/process_management/kill_process_all', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取扫描进度条进度
 * @returns { Promise }
 */

export const getScanningProgress = (): Promise<ResponseResult> => useAxios.post('warning/get_scan_bar', { check: 'object' })

/**
 * @description 获取修复进度条进度
 * @returns { Promise }
 */

export const getRepairProgress = (): Promise<ResponseResult> => useAxios.post('safe/security/get_repair_bar', { check: 'object', customType: 'model' })

/**
 * @description 获取首页概览数据
 */
export const getOverview = (): Promise<ResponseResult> => useAxios.post('panel/overview/GetOverview', { check: 'array', customType: 'model' })
/**
 * @description 添加首页概览
 */
export const addOverview = (data: AnyObject): Promise<ResponseResult> =>
	useAxios.post('panel/overview/AddOverview', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 修改首页概览
 */
export const setOverview = (data: AnyObject): Promise<ResponseResult> => useAxios.post('panel/overview/SetOverview', { data, check: 'msg', customType: 'model' })
export const sortOverview = (data: AnyObject): Promise<ResponseResult> => useAxios.post('panel/overview/SortOverview', { data, check: 'msg', customType: 'model' })

/**
 * @description 删除首页概览
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const delOverview = (data: { overview_id: number }): Promise<ResponseResult> => useAxios.post('panel/overview/DelOverview', { data, check: 'msg', customType: 'model' })

/**
 * @description 获取首页概览模板数据
 */
export const getTemplateOverview = (): Promise<ResponseResult> => useAxios.post('panel/overview/GetTemplateOverview', { check: 'msg', customType: 'model' })

/**
 * @description 获取扫描中断时数据
 */
export const getTemplateList = (): Promise<ResponseResult> => useAxios.post('warning/get_tmp_result')

/**
 * @description 扫描中断
 */
export const killGetList = (): Promise<ResponseResult> => useAxios.post('warning/kill_get_list')

/**
 * @description 获取腾讯专享版信息
 */
export const getTencentInfo = (): Promise<ResponseResult> => useAxios.post('tencent/get_config', { check: 'object', customType: 'plugin' })

/**
 * @description 获取腾讯专享版服务器信息
 */
export const getLocalLighthouse = (): Promise<ResponseResult> => useAxios.post('tencent/get_local_lighthouse', { check: 'object', customType: 'plugin' })

/**
 * @description 获取腾讯专享版服务器流量信息
 */
export const getRequestPack = (): Promise<ResponseResult> => useAxios.post('tencent/get_request_pack', { check: 'msg', customType: 'plugin' })

/**
 * @description 获取腾讯专享版服务器快照
 */
export const getSnapshotsList = (): Promise<ResponseResult> => useAxios.post('tencent/get_snapshots_list', { check: 'msg', customType: 'plugin' })

/**
 * @description 创建快照
 */
export const createSnapshots = (data: { SnapshotName: string }): Promise<ResponseResult> => useAxios.post('tencent/create_snapshots', { data, check: 'msg', customType: 'plugin' })

/**
 * @description 添加腾讯云api
 */
export const tencentSetConfig = (data: { appid: string; secretId: string; secretKey: string }): Promise<ResponseResult> => useAxios.post('tencent/set_config', { data, check: 'msg', customType: 'plugin' })

/**
 * @description 删除快照
 * @param { { SnapshotId: string } } data { SnapshotId: 快照id }
 */
export const deleteSnapshots = (data: { SnapshotId: string }): Promise<ResponseResult> => useAxios.post('tencent/delete_snapshots', { data, check: 'msg', customType: 'plugin' })

/**
 * @description 获取腾讯云api
 * @returns { Promise }
 */
export const updateTencent = (): Promise<ResponseResult> => useAxios.post('tencent/update_tencent', { check: 'msg', customType: 'plugin' })

/**
 * @description 取消腾讯云api
 * @returns
 */
export const cancelConfig = (): Promise<ResponseResult> => useAxios.post('tencent/cancel_config', { check: 'msg', customType: 'plugin' })

/**
 * @description 设置磁盘别名
 */
export const setDiskRname = (data: { path: string; name: string }): Promise<ResponseResult> => useAxios.post('system/set_rname', { data, check: 'msg' })

/**
 * @description 获取SSH登录信息
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const indexSshInfo = (data: { log_type: string }) => useAxios.post('/mod/ssh/com/index_ssh_info', { data, check: 'array', customType: 'model' })

export const getPDF = () => useAxios.post('/safe/exportreport/get_pdf', { check: 'object', customType: 'model' })

/**
 * @description 获取安全风险扫描总数
 */
export const getSafecloudList = (): Promise<ResponseResult> => useAxios.post('/project/safecloud/get_safecloud_list', { check: 'object', customType: 'model' })
/**
 * @description 获取恶意文件检测结果
 * @param { {day: number}} data {day: 天数}
 * @returns { Promise }
 */
export const getWebshellResult = (data: { day?: number } = {}): Promise<ResponseResult> => useAxios.post('/project/safecloud/get_webshell_result', { data, customType: 'model', check: 'object' })
/**
 * @description 获取漏洞扫描检测结果
 */
export const getVulnInfo = (): Promise<ResponseResult> => useAxios.post('/project/scanning/get_vuln_info', { check: 'object', customType: 'model' })
/**
 * @description 获取恶意文件配置
 * @returns { Promise }
 */
export const getWebshellConfig = (): Promise<ResponseResult> => useAxios.post('/project/safecloud/get_config', { customType: 'model', check: 'object' })

/**
 * @description 修改恶意文件配置
 * @param { {quarantine:boolean,dynamic_detection:boolean} } data { quarantine: 是否自动拦截, dynamic_detection: 是否开启动态检测 }
 */
export const setWebshellConfig = (data: { quarantine?: boolean; dynamic_detection?: boolean; scan_oss?: boolean; delete_monitor_path?: string; exclude_dirs?: string; add_monitor_path?: string; add_exclude_path?: string; delete_exclude_path?: string }): Promise<ResponseResult> =>
	useAxios.post('/project/safecloud/set_config', { data, customType: 'model', check: 'object' })
/**
 * @description 忽略恶意文件
 * @param { {filepath:string,md5:string,filename:string,risk:number} } data { filepath: 文件路径, md5: 文件md5, filename: 文件名, risk: 风险等级 }
 */
export const ignoreWebshellFile = (data: { filepath: string; md5: string; filename: string; risk: number }): Promise<ResponseResult> => useAxios.post('/project/safecloud/ignore_file', { data, customType: 'model', check: 'object' })
/**
 * @description 处理恶意文件
 * @param { {file_list: string,action_type: string} } data { file_list: 文件列表, action_type: 操作类型 }
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const dealWebshellFile = (data: { file_list: string; action_type: string }): Promise<ResponseResult> => useAxios.post('/project/safecloud/deal_webshell_file', { data, customType: 'model', check: 'object' })

/**
 * @description 修改告警配置
 * @param { {sender: string,status: boolean,send_type: string} } data { sender: 发送通道, status: 是否开启, send_type: 发送类型 }
 * @returns { Promise }
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const setSender = (data: { sender: string; status: boolean; send_type: string }): Promise<ResponseResult> => useAxios.post('/project/safecloud/set_alarm_config', { data, customType: 'model', check: 'object' })
