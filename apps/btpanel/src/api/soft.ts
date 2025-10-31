/* eslint-disable @typescript-eslint/naming-convention */
import type { DeployTableProps, SoftTableProps, delSoftParams } from '@/types/soft'

import { useAxios } from '@/hooks/tools'

/**
 * @description 获取软件列表
 * @returns { Promise }
 */
export const getSoftList = (data: SoftTableProps): Promise<any> =>
	useAxios.post('plugin/get_soft_list', {
		data,
		customType: 'default',
	})

/**
 * @description 获取热门插件列表
 * @returns { Promise }
 */
export const getHotSoftList = (): Promise<any> =>
	useAxios.post('plugin/push_plugin', {
		customType: 'default',
		check: 'array',
	})

/**
 * @description 获取历史插件列表
 * @returns { Promise }
 */
export const getHistorySoftList = (): Promise<any> =>
	useAxios.post('plugin/get_usually_plugin', {
		customType: 'default',
		check: 'array',
	})

/**
 * @description 卸载插件
 * @returns { Promise }
 */
export const delSoft = (data: delSoftParams): Promise<any> =>
	useAxios.post('plugin/uninstall_plugin', {
		data,
		loading: '正在卸载，请稍候...',
		customType: 'default',
		check: 'msg',
	})

/**
 * @description 保留配置文件
 * @returns { Promise }
 */
export const savePluginSettings = (data: { soft_name: string }): Promise<any> =>
	useAxios.post('plugin/save_plugin_settings', {
		data,
		customType: 'default',
		check: 'msg',
	})

/**
 * @description 插件修复
 * @returns { Promise }
 */
export const repairPlugin = (data: { version: string; min_version: string; plugin_name: string }): Promise<any> =>
	useAxios.post('plugin/repair_plugin', {
		data,
		loading: '正在获取最新版本，请稍候...',
		customType: 'default',
		check: 'object',
	})

/**
 * @description 插件首页显示
 * @returns { Promise }
 */
export const pluginHomeShow = (data: { sName: string }): Promise<any> =>
	useAxios.post('plugin/add_index', {
		data,
		customType: 'default',
		check: 'msg',
	})

/**
 * @description 插件首页隐藏
 * @returns { Promise }
 */
export const pluginHomeUnShow = (data: { sName: string }): Promise<any> =>
	useAxios.post('plugin/remove_index', {
		data,
		customType: 'default',
		check: 'msg',
	})

// /**
//  * @description 上传插件
//  * @returns { Promise }
//  */
// export const uploadPlugin = (data: any): Promise<any> => {
// 	console.log(data)

// 	return useAxios.post('plugin/update_zip', {
// 		data,
// 		customType: 'default',
// 		check: 'object',
// 	})
// }

/**
 * @description 获取一键部署列表
 * @returns { Promise }
 */
export const getDeployList = (data: DeployTableProps): Promise<any> =>
	useAxios.post('deployment/GetList', {
		data,
		customType: 'default',
		check: 'object',
	})

// /**
//  * @description 一键部署导入
//  * @returns { Promise }
//  */
// export const deployImport = (data: any): Promise<any> =>
// 	useAxios.post('deployment/AddPackage', {
// 		data,
// 		customType: 'default',
// 		check: 'object',
// 	})

/**
 * @description 一键部署删除
 * @returns { Promise }
 */
export const deployDel = (data: any): Promise<any> =>
	useAxios.post('deployment/DelPackage', {
		data,
		customType: 'default',
		check: 'msg',
	})

/**
 * @description 获取插件评分
 * @returns { Promise }
 */
export const getScore = (data: any): Promise<any> =>
	useAxios.post('plugin/get_score', {
		data,
		customType: 'default',
		check: 'array',
	})

/**
 * @description 评分
 * @returns { Promise }
 */
export const setScore = (data: any): Promise<any> =>
	useAxios.post('plugin/set_score', {
		data,
		customType: 'default',
		check: 'msg',
	})

/**
 * @description 获取php版本
 * @returns { Promise }
 */
export const getPHPVersion = (): Promise<any> =>
	useAxios.post('site/GetPHPVersion', {
		customType: 'default',
		check: 'array',
	})

/**
 * @description 部署（添加站点）
 * @returns { Promise }
 */
export const addSite = (data: any): Promise<any> =>
	useAxios.post('site/AddSite', {
		data,
		customType: 'default',
		check: 'object',
	})

/**
 * @description 部署（使用站点部署）
 * @returns { Promise }
 */
export const setupPackage = (data: any): Promise<any> =>
	useAxios.post('deployment/SetupPackage', {
		data,
		// loading: '正在部署，请稍候...',
		customType: 'default',
		check: 'msg',
	})

/**
 * @description 获取部署速度
 * @param data
 * @returns
 */
export const getSpeed = (): Promise<any> =>
	useAxios.post('deployment/GetSpeed', {
		customType: 'default',
		check: 'object',
	})

/**
 * @description 获取第三方插件续费订单
 * @returns { Promise }
 */
export const getThirdRenewOrder = (data: any): Promise<any> =>
	useAxios.post('auth/create_plugin_other_order', {
		data,
		loading: '正在获取支付信息，请稍候...',
		customType: 'default',
		check: 'object',
	})

/**
 * @description 获取redis配置
 * @returns { Promise }
 */
export const getRedisConf = (): Promise<any> => useAxios.post('/plugin?name=redis&action=a&s=GetRedisConf', { customType: 'model' })

// /**
//  * @description 设置redis配置
//  * @returns { Promise }
//  */
// export const setRedisConf = (data: any): Promise<any> =>
// 	useAxios.post('/plugin?name=redis&action=a&s=SetRedisConf', {
// 		data,
// 		customType: 'model',
// 		check: 'msg',
// 	})

// /**
//  * @description 获取redis文件
//  * @returns { Promise }
//  */
// export const getRedisFile = (data: { path: string }): Promise<any> =>
// 	useAxios.post('/plugin?name=redis&action=a&s=GetRedisFile', { data, customType: 'model' })

// /**
//  * @description 保存redis文件
//  * @returns { Promise }
//  */
// export const saveRedisFile = (data: {
// 	data: string
// 	encoding: string
// 	path: string
// }): Promise<any> =>
// 	useAxios.post('/plugin?name=redis&action=a&s=SaveRedisFile', {
// 		data,
// 		customType: 'model',
// 		check: 'msg',
// 	})

// /**
//  * @description 获取redis状态
//  * @returns { Promise }
//  */
// export const getRedisStatus = (): Promise<any> =>
// 	useAxios.post('/plugin?name=redis&action=a&s=GetRedisStatus', { customType: 'model' })

// /**
//  * @description 获取redis持久化
//  * @returns { Promise }
//  */
// export const getRedisPersistence = (): Promise<any> =>
// 	useAxios.post('/plugin?name=redis&action=a&s=GetRedisPersistence', { customType: 'model' })

// /**
//  * @description 设置redis持久化
//  * @returns { Promise }
//  */
// export const setRedisPersistence = (data: any): Promise<any> =>
// 	useAxios.post('/plugin?name=redis&action=a&s=SetRedisPersistence', {
// 		data,
// 		customType: 'model',
// 		check: 'msg',
// 	})

/**
 * @description 获取文件内容
 * @returns { Promise }
 */
export const getFileBody = (data: { path: string }): Promise<any> => useAxios.post('files/GetFileBody', { data })

/**
 * @description 获取插件版本信息
 * @param { string } data.name 插件名称
 * @returns { Promise } 返回值
 */
export const installPlugin = (data: {
	sName: string
	version: string
	// eslint-disable-next-line @typescript-eslint/naming-convention
	min_version: string
	type?: number
}): Promise<any> => useAxios.post('plugin/install_plugin', { data, check: 'object' })

/**
 * @description 获取操作日志
 * @param { AnyObject } data
 * @returns { Promise }
 */
export const getOpeLogs = (data: { path: string }): Promise<any> => useAxios.post('ajax/GetOpeLogs', { data, check: 'msg' })

/**
 * @description 设置ftp日志
 * @param { AnyObject } data
 * @returns { Promise }
 */
export const setFtpLogs = (data: { exec_name: string }): Promise<any> => useAxios.post('ftp/set_ftp_logs', { data, check: 'msg' })

/**
 * @description 获取memcached状态
 * @returns { Promise }
 */
export const getMemcachedStatus = (): Promise<any> => useAxios.post('ajax/GetMemcachedStatus', {})

/**
 * @description 设置memcached缓存
 * @param { AnyObject } data
 * @returns { Promise }
 */
export const setMemcachedCache = (data: AnyObject): Promise<any> => useAxios.post('ajax/SetMemcachedCache', { data, check: 'msg' })

/**
 * @description 获取nginx状态
 * @returns { Promise }
 */
export const getNginxStatus = (): Promise<any> => useAxios.post('ajax/GetNginxStatus', { check: 'object' })

/**
 * @description 获取nginx配置
 * @returns { Promise }
 */
export const getNginxConf = (): Promise<any> => useAxios.post('config/GetNginxValue', { check: 'array' })

/**
 * @description 设置nginx配置
 * @returns { Promise }
 */
export const setNginxConf = (data: AnyObject): Promise<any> => useAxios.post('config/SetNginxValue', { data, check: 'msg' })

/**
 * @description 获取openlitespeed参数
 * @returns { Promise }
 */
export const getOpenLiteSpeed = (): Promise<any> => useAxios.post('config/get_ols_value', {})

/**
 * @description 设置openlitespeed参数
 * @returns { Promise }
 */
export const setOpenLiteSpeed = (data: AnyObject): Promise<any> => useAxios.post('config/set_ols_value', { data, check: 'msg' })

/**
 * @description 获取数据库状态
 * @returns { Promise }
 */
export const getDatabaseStatus = (): Promise<any> => useAxios.post('database/GetRunStatus', { check: 'object' })

/**
 * @description 获取错误日志
 * @returns { Promise }
 */
export const getErrorLog = (data?: AnyObject): Promise<any> => useAxios.post('database/GetErrorLog', { data, check: 'string' })

/**
 * @description 清空错误日志
 * @returns { Promise }
 */
export const clearErrorLog = (data?: AnyObject): Promise<any> => useAxios.post('database/GetErrorLog', { data, check: 'msg' })

/**
 * @description 获取慢查询日志
 * @returns { Promise }
 */
export const getSlowLog = (data?: AnyObject): Promise<any> => useAxios.post('database/GetSlowLogs', { data, check: 'msg' })

/**
 * @description 获取binlog列表
 * @returns { Promise }
 */
export const getBinlogList = (): Promise<any> => useAxios.post('database/GetMySQLBinlogs', { check: 'msg' })

/**
 * @description 获取binlog内容
 * @returns { Promise }
 */
export const getBinlogConfig = (data?: AnyObject): Promise<any> => useAxios.post('database/BinLog', { data, check: 'msg' })

/**
 * @description 清空binlog
 * @returns { Promise }
 */
export const clearMySQLBinlog = (data?: { days: number | string }): Promise<any> => useAxios.post('database/ClearMysqlBinLog', { data, check: 'msg' })

/**
 * @description 获取数据库信息
 * @returns { Promise }
 */
export const getDatabaseInfo = (): Promise<any> => useAxios.post('database/GetMySQLInfo', { check: 'object' })

/**
 * @description 设置数据库目录
 * @returns { Promise }
 */
export const setDataDir = (data: AnyObject): Promise<any> => useAxios.post('database/SetDataDir', { data, check: 'msg' })

/**
 * @description 设置数据库端口
 * @returns { Promise }
 */
export const SetMySQLPort = (data: AnyObject): Promise<any> => useAxios.post('database/SetMySQLPort', { data, check: 'msg' })
/**
 * @description mysql内存保护
 * @returns { Promise }
 */
export const protectionStatus = (data: AnyObject): Promise<any> => useAxios.post('database/mysql_oom_adj', { data, check: 'msg' })
/**
 * @description 获取数据库状态
 * @returns { Promise }
 */
export const getDbStatus = (): Promise<any> => useAxios.post('database/GetDbStatus', { check: 'object' })

/**
 * @description 设置数据库配置
 * @returns { Promise }
 */
export const setDbConf = (data: AnyObject): Promise<any> => useAxios.post('database/SetDbConf', { data, check: 'msg' })

/**
 * @description 获取php配置
 * @returns { Promise }
 */
export const getPHPConfig = (data: { version: string }): Promise<any> => useAxios.post('ajax/GetPHPConfig', { data, check: 'object' })

/**
 * @description 卸载软件
 * @returns { Promise }
 */
export const uninstallSoft = (data: { name: string; version: string }): Promise<any> => useAxios.post('files/UninstallSoft', { data, check: 'msg' })

/**
 * @description 安装软件
 * @returns { Promise }
 */
export const installSoft = (data: { name: string; version: string; type: string | number }): Promise<any> => useAxios.post('files/InstallSoft', { data, check: 'msg' })

/**
 * @description 获取php配置
 */
export const getPHPConf = (data: { version: string }): Promise<any> => useAxios.post('config/GetPHPConf', { data })

/**
 * @description 设置php配置
 * @returns { Promise }
 * @param { AnyObject } data
 */
export const setPHPConf = (data: AnyObject): Promise<any> => useAxios.post('config/SetPHPConf', { data, check: 'msg' })

/**
 * @description 增加禁用函数
 */
export const setPHPDisable = (data: AnyObject): Promise<any> => useAxios.post('config/setPHPDisable', { data, check: 'msg' })

/**
 * @description 获取fpm性能配置
 */
export const getFpmConfig = (data: { version: string }): Promise<any> => useAxios.post('config/getFpmConfig', { data, check: 'object' })

/**
 * @description 设置fpm性能配置
 */
export const setFpmConfig = (data: AnyObject): Promise<any> => useAxios.post('config/setFpmConfig', { data, check: 'msg' })

/**
 * @description 获取php状态
 */
export const getPHPStatus = (data: { version: string }): Promise<any> => useAxios.post('ajax/GetPHPStatus', { data, check: 'object' })

/**
 * @description 获取php慢日志
 * @returns { Promise }
 */
export const getFpmSlowLogs = (data: { version: string }): Promise<any> => useAxios.post('ajax/GetFpmSlowLogs', { data, check: 'object' })

/**
 * @description 获取php日志
 */
export const getFpmLogs = (data: { version: string }): Promise<any> => useAxios.post('ajax/GetFpmLogs', { data, check: 'msg' })

/**
 * @description 获取session配置
 */
export const getSessionConf = (data: { version: string }): Promise<any> => useAxios.post('config/GetSessionConf', { data, check: 'object' })

/**
 * @description 获取session数量
 */
export const getSessionCount = (data: { version: string }): Promise<any> => useAxios.post('config/GetSessionCount', { data, check: 'object' })

/**
 * @description 设置session配置
 */
export const setSessionConf = (data: AnyObject): Promise<any> => useAxios.post('config/SetSessionConf', { data, check: 'msg' })

/**
 * @description 清理session
 */
export const clearSessionFile = (): Promise<any> => useAxios.post('config/DelOldSession', { check: 'msg' })

/**
 * @description 获取phpinfo
 */
export const getPHPInfo = (data: { version: string }): Promise<any> => useAxios.post('ajax/GetPHPInfo', { data, check: 'string' })

export const getPHPInfoData = (data: { php_version: string }): Promise<any> => useAxios.post('ajax/php_info', { data, check: 'object' })

/**
 * @description 获取php配置
 */
export const get_php_config = (data: { version: string }): Promise<any> => useAxios.post('config/get_php_config', { data, check: 'object' })

/**
 * @description 设置php最大上传大小
 */
export const setPHPMaxSize = (data: AnyObject): Promise<any> => useAxios.post('config/setPHPMaxSize', { data, check: 'msg' })

/**
 * @description 设置php最大执行时间
 */
export const setPHPMaxTime = (data: AnyObject): Promise<any> => useAxios.post('config/setPHPMaxTime', { data, check: 'msg' })

/**
 * @description 获取apache状态
 */
export const getApacheStatus = (): Promise<any> => useAxios.post('ajax/GetApacheStatus', { check: 'object' })

/**
 * @description 设置apache 守护进程
 */
export const setRestartTask = (data: AnyObject): Promise<any> => useAxios.post('site/set_restart_task', { data, check: 'msg' })

/**
 * @description 获取apache 守护进程
 */
export const getRestartTask = (): Promise<any> => useAxios.post('site/get_restart_task', { check: 'msg' })

/**
 * @description 获取apache配置
 */
export const getApacheConf = (): Promise<any> => useAxios.post('config/GetApacheValue', { check: 'array' })

/**
 * @description 设置apache配置
 */
export const setApacheConf = (data: AnyObject): Promise<any> => useAxios.post('config/SetApacheValue', { data, check: 'msg' })

/**
 * @description 获取推送列表
 */
export const getPushList = (): Promise<any> =>
	useAxios.post('push/get_push_list', {
		check: 'object',
	})

/**
 * @description 获取订单统计 - 是否购买支付
 */
export const getOrderStat = (data: { oid: number; type: string | number }): Promise<any> =>
	useAxios.post('auth/get_order_stat', {
		data,
		check: 'number',
	})

export const delDataBaseFile = (data: { path: string }): Promise<any> =>
	useAxios.post('files/DeleteFile', {
		data,
		check: 'msg',
	})

/**
 * @description 获取项目环境
 */
export const checkProjectEnv = () =>
	useAxios.post('deployment/check_project_env', {
		check: 'object',
	})

/**
 * @description 部署 java添加springboot项目
 */
export const getJarPath = (data: { dname: string; sitename: string }) =>
	useAxios.post('deployment/GetJarPath', {
		data,
		check: 'object',
	})

/**
 * @description 部署 java添加springboot项目
 */
export const addJavaProject = (data: AnyObject) =>
	useAxios.post('/mod/java/project/create_project', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 部署 创建动态项目
 */
export const createAsync = (data: AnyObject) => useAxios.post('/mod/php/php_async/create_project', { data, customType: 'model', check: 'object' })

/**
 * @description 获取java项目信息
 */
export const getJavaInfo = () =>
	useAxios.post('/mod/java/project/get_system_info', {
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 一键部署日志
 */
export const getInLog = (): Promise<any> =>
	useAxios.post('deployment/GetInLog', {
		check: 'msg',
	})

/**
 * @description 服务管理
 * @param { string } data.name 服务器类型
 * @param { string } data.type 状态(stop停止)
 * @returns { Promise<any> }
 */
export const serviceManage = (data: AnyObject): Promise<any> => useAxios.post('system/ServiceAdmin', { data, check: 'msg' })

/**
 * @description 保存文件内容
 * @param { AnyObject } data
 * @returns { string } 文件内容
 */
export const saveFileBody = (data: AnyObject) => useAxios.post('/files?action=SaveFileBody', { data, customType: 'model', check: 'object' })

/**
 * @description 获取迁移mysql进度
 * @param { AnyObject } data
 * @returns { string }
 */
export const getMysqMvSpeed = () => useAxios.post('database/GetmvDataDirSpeed', { check: 'object' })

/**
 * @description 更新最新扩展列表
 * @param data
 * @returns
 */
export const getRegetCloudPHPExt = () => useAxios.post('plugin/RegetCloudPHPExt', { check: 'object' })

/**
 * @description 删除php扩展列表
 * @returns
 */
export const uninstallPecl = (data: { phpv: string; name: string }) => useAxios.post('config/phpPeclUninstall', { data, check: 'msg' })

/**
 * @description 安装pecl扩展 config?action=phpPeclInstall
 */
export const installPecl = (data: { version: string; name: string }) => useAxios.post('config/phpPeclInstall', { data, check: 'msg' })

/**
 * @description 获取已安装的pecl列表 config?action=GetPeclInstallList
 */
export const getPeclList = (data: { version: string }) => useAxios.post('config/GetPeclInstallList', { data, check: 'array' })

/**
 * @description 获取pecl安装日志 config?action=GetPhpPeclLog
 */
export const getPeclLog = (data: { version: string }) => useAxios.post('config/GetPhpPeclLog', { data, check: 'msg' })

/**
 * @description 导入插件v2
 * @returns { Promise }
 */
export const uploadPlugin = (data: any): Promise<any> => useAxios.post('plugin?action=update_zip', { data, customType: 'model', check: 'object' })