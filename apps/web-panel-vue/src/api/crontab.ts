/* eslint-disable @typescript-eslint/naming-convention */
import { useAxios } from '@/hooks/tools'

/**
 * @description 获取脚本列表分类
 */
export const getScriptListByType = () =>
	useAxios.post('crontab/script/get_script_list_by_type', {
		customType: 'model',
		check: 'array',
	})

/**
 * @description 获取脚本列表
 */
export const getScriptList = (data: { p: number; rows: number; type: string; search: string; type_id: string }) =>
	useAxios.post('crontab/script/get_script_list', {
		data: { data: JSON.stringify(data) },
		customType: 'model',
	})

/**
 * @description 删除脚本
 * @param {number} script_id 		脚本id
 */
export const removeScript = (data: { script_id: number }) =>
	useAxios.post('crontab/script/remove_script', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 创建脚本
 */
export const createScript = (data: AnyObject) =>
	useAxios.post('crontab/script/create_script', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 修改脚本
 */
export const modifyScript = (data: AnyObject) =>
	useAxios.post('crontab/script/modify_script', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取脚本日志
 */
export const getScriptLogs = (data: { script_id: number; p: number; rows: number }) =>
	useAxios.post('crontab/script/get_script_logs', {
		data: { data: JSON.stringify(data) },
		customType: 'model',
	})

/**
 * @description 测试脚本
 * @param {string} data JSON.stringify({ data: string })
 * @param {string} data.script_id 脚本id
 * @param {string} data.args 脚本内容
 */
export const testScript = (data: { data: string }) =>
	useAxios.post('crontab/script/test_script', {
		data,
		customType: 'model',
		check: 'ignore',
	})

/**
 * @description 获取任务列表
 * @param {number} data.p 页码
 * @param {number} data.rows 每页数量
 * @param {string} data.search 搜索关键字
 * @param {string} data.order_param 排序字段
 * @param {number} data.type_id 类型id
 */
export const getTriggerList = (data: { p: number; rows: number; search: string; order_param: string; type_id: number }) =>
	useAxios.post('crontab/trigger/get_trigger_list', {
		data: { data: JSON.stringify(data) },
		customType: 'model',
	})

/**
 * @description 删除任务
 * @param {number} trigger_id 任务id
 */
export const removeTrigger = (data: { trigger_id: number }) =>
	useAxios.post('crontab/trigger/remove_trigger', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取任务日志
 */
export const getTriggerLogs = (data: { trigger_id: number }) =>
	useAxios.post('crontab/trigger/get_trigger_logs', {
		data,
		customType: 'model',
	})

/**
 * @description 执行任务
 */

export const testTrigger = (data: { trigger_id: number }) =>
	useAxios.post('crontab/trigger/test_trigger', {
		data: { data: JSON.stringify(data) },
		check: 'object',
		customType: 'model',
	})

/**
 * @description 删除后置位任务
 */
export const removeOperatorWhere = (data: { where_id: number }) =>
	useAxios.post('crontab/trigger/remove_operator_where', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取后置位任务列表
 */

export const getOperatorWhereList = (data: { trigger_id: number }) =>
	useAxios.post('crontab/trigger/get_operator_where_list', {
		data,
		customType: 'model',
	})

/**
 * @description 获取后置位任务日志
 * @param {number} data.where_id 后置位任务id
 * @param {number} data.p 页码
 * @param {number} data.rows 每页数量
 */
export const getOperatorLogs = (data: { where_id: number; p: number; rows: number }) =>
	useAxios.post('crontab/trigger/get_operator_logs', {
		data: { data: JSON.stringify(data) },
		customType: 'model',
	})

type OperatorWhere = {
	run_script_id: number
	operator: string
	op_value: string
	run_script: string
	trigger_id?: number
	args: string
	where_id: number
}
/**
 * @description 修改后置位任务
 */
export const modifyOperatorWhere = (data: OperatorWhere) =>
	useAxios.post('crontab/trigger/modify_operator_where', {
		data: { data: JSON.stringify(data) },
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 创建后置位任务
 */
export const createOperatorWhere = (data: OperatorWhere) =>
	useAxios.post('crontab/trigger/create_operator_where', {
		data: { data: JSON.stringify(data) },
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取任务列表 所有
 */
export const getTriggerListAll = () =>
	useAxios.post('crontab/trigger/get_trigger_list_all', {
		customType: 'model',
	})

/**
 * @description 排序任务列表
 */
export const saveCustomOrder = (data: { order_list: string }) =>
	useAxios.post('crontab/trigger/save_custom_order', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 添加任务分类
 * @param {AnyObject} data - 参数说明{name:'任务分类名称'}
 */
export const addTaskScheduleType = (data: { name: string }) =>
	useAxios.post('crontab/trigger/add_trigger_type', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 修改任务分类名称
 * @param {AnyObject} data - 参数说明{id:'任务分类id',name:'任务分类名称'}
 */
export const modifyTaskScheduleTypeName = (data: { id: number; name: string }) => {
	return useAxios.post('/crontab/trigger/modify_trigger_type_name', {
		data,
		check: 'msg',
		customType: 'model',
	})
}

/**
 * @description 删除任务分类
 * @param {AnyObject} data - 参数说明{id:'任务分类id'}
 */
export const removeTaskScheduleType = (data: { id: number }) => {
	return useAxios.post('/crontab/trigger/remove_trigger_type', {
		data,
		check: 'msg',
		customType: 'model',
	})
}

/**
 * @description 获取任务编排分类数据
 */
export const getTaskSchedulesTypes = () =>
	useAxios.post('crontab/trigger/get_trigger_types', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 设置任务状态
 * @param {AnyObject} data - 参数说明{trigger_id:'任务id',status:'任务状态'}
 */
export const setTriggerStatus = (data: { trigger_id: number; status: number }) =>
	useAxios.post('crontab/trigger/set_trigger_status', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 设置任务分类数据
 */
export const setTriggerTypes = (data: { id: number | string; trigger_ids: string }) =>
	useAxios.post('crontab/trigger/set_trigger_type', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 修改任务
 */
export const modifyTrigger = (data: AnyObject) =>
	useAxios.post('crontab/trigger/modify_trigger', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 创建任务
 */
export const createTrigger = (data: AnyObject) =>
	useAxios.post('crontab/trigger/create_trigger', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取任务列表
 * @param { AnyObject } data 参数说明 { type_id: '任务类型ID' } || { search: '搜索关键字' }
 */
export const getCrontabListApi = (data?: { type_id?: number | string; search?: string; order_param?: string; count?: number; p?: number }) => useAxios.post('crontab/GetCrontab', { data })

/**
 * @description 获取服务状态
 */
export const getCrontabService = () => useAxios.post('crontab/get_crontab_service')

/**
 * @description 获取任务分类数据
 */
export const getCrontabTypes = () => useAxios.post('crontab/get_crontab_types', { check: 'object' })

/**
 * @description 执行任务
 * @param { AnyObject } data 参数说明 { id: '任务ID' }
 */
export const startTask = (data: { id: string | number }) => useAxios.post('crontab/StartTask', { data, check: 'msg' })

/**
 *
 * @param data @description 批量设置任务状态
 * @returns
 */
export const setAllStatus = (data: { id_list: string; type: string; if_stop: string }) => useAxios.post('crontab/set_cron_status_all', { data, check: 'array' })

/**
 * @description 导出任务
 */
export const exportCrontabToJson = (data?: { ids: string }) => useAxios.post('crontab/export_crontab_to_json', { data, check: 'msg' })

/**
 * @description 删除计划任务
 * @param {AnyObject} data - 参数说明{id:'任务id'}
 */
export const deleteCrontab = (data: { id: number }) => useAxios.post('crontab/DelCrontab', { data, check: 'msg' })

/**
 * @description 设置任务分类数据
 */
export const setCrontabTypes = (data: { id: number | string; crontab_ids: string }) => useAxios.post('crontab/set_crontab_type', { data, check: 'msg' })

/**
 * @description 单个执行任务
 * @param { AnyObject } data 参数说明 { id: '任务ID' }
 */
export const crontabDelCrontab = (data: { id: number }) => useAxios.post('crontab/DelCrontab', { data, check: 'msg' })

/**
 * @description 获取备份目录
 */
export const getLocalBackupPath = (data: { id: number }) => useAxios.post('crontab/get_local_backup_path', { data, check: 'msg' })

/**
 * @description 获取日志路径
 */
export const getLogPath = (data: { id: number }) => useAxios.post('crontab/get_log_path', { data, check: 'msg' })

/**
 * @description 获取任务执行日志
 * @returns
 */
export const getLogs = (data: { id: number; start_timestamp: number; end_timestamp: number }) => useAxios.post('crontab/GetLogs', { data, check: 'msg' })

/**
 * @description 清空任务执行日志
 * @param { AnyObject } data 参数说明 { id: '任务ID' }
 */
export const crontabDelLog = (data: { id: number }) => useAxios.post('crontab/DelLogs', { data, check: 'msg' })

/**
 * @description 修改任务执行状态
 * @param {AnyObject} data - 参数说明{id:'任务id'}
 */
export const setStatus = (data: { id: number; if_stop: string }) => useAxios.post('crontab/set_cron_status', { data, check: 'msg' })

/**
 * @description 获取置顶列表+设置置顶
 * @param {AnyObject} data - 参数说明{task_id:'任务id'}
 */
export const getTaskTopList = (data?: { task_id: number }) => useAxios.post('crontab/set_task_top', { data, check: 'msg' })

/**
 * @description 获取置顶列表+取消设置置顶
 * @param {AnyObject} data - 参数说明{task_id:'任务id'}
 */
export const cancelTaskTopList = (data?: { task_id: number }) => useAxios.post('crontab/cancel_top', { data, check: 'msg' })

/**
 * @description 获取任务类型
 */
export const backupDownload = (data: { cron_id: number; filename: string }) => useAxios.post('crontab/cloud_backup_download', { data, check: 'object' })

/**
 * @description 获取备份文件信息列表
 * @param {AnyObject} data - 参数说明{id:'任务id'}
 */
export const getCrontabBackupTableData = (data: { cron_id: number; p: number; rows: number }) => useAxios.post('crontab/get_backup_list', { data, check: 'object' })

/**
 * @description 计划任务-获取日志切割配置
 */
export const getRotateLogConfig = () => useAxios.post('crontab/get_rotate_log_config')

/**
 * @description 设置日志配置
 */
export const setRotateLog = (data: { status: number; compress: number; num: number; log_size: number; hour: number; minute: number }) => useAxios.post('crontab/set_rotate_log', { data, check: 'msg' })

/**
 * @description 设置日志切割状态
 */
export const setRotateLogStatus = () => useAxios.post('crontab/set_rotate_log_status', { check: 'msg' })

/**
 * @description 获取系统用户列表
 */
export const getSystemUserList = (data: { all_user: boolean }) => useAxios.post('crontab/get_system_user_list', { data, check: 'array' })

/**
 * @description 获取数据库列表
 */
export const getDatabases = (data?: AnyObject) => useAxios.post('crontab/GetDatabases', { data })

/**
 * @description 获取数据库列表
 */
export const getZone = () => useAxios.post('crontab/get_zone')

/**
 * @description 添加计划任务
 * @param { AnyObject } data 计划任务配置参数
 */
// data: CrontabSubmitForm
export const crontabAdd = (data: any) => useAxios.post('crontab/AddCrontab', { data, check: 'msg' })

/**
 * @description 修改计划任务
 * @param { AnyObject } data 计划任务配置参数
 */
export const crontabModify = (data: any) => useAxios.post('crontab/modify_crond', { data, check: 'msg' })

/**
 * @description 添加任务分类
 * @param {AnyObject} data - 参数说明{name:'任务分类名称'}
 */
export const addCrontabType = (data: { name: string }) => useAxios.post('crontab/add_crontab_type', { data, check: 'msg' })

/**
 * @description 修改任务分类名称
 * @param {AnyObject} data - 参数说明{id:'任务分类id',name:'任务分类名称'}
 */
export const modifyCrontabTypeName = (data: { id: number; name: string }) => {
	return useAxios.post('crontab/modify_crontab_type_name', { data, check: 'msg' })
}

/**
 * @description 删除任务分类
 * @param {AnyObject} data - 参数说明{id:'任务分类id'}
 */
export const removeCrontabType = (data: { id: number }) => {
	return useAxios.post('crontab/remove_crontab_type', { data, check: 'msg' })
}

/**
 * @description 计划任务添加-添加数据库增量备份
 */
export const addMysqlIncrementCrontab = (data: AnyObject) =>
	useAxios.post('project/binlog/add_mysql_increment_crontab', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 企业增量备份查询备份数据库选项
 */
export const getEnterpriseDatabase = () =>
	useAxios.post('crontab/get_databases', {
		check: 'object',
	})

/**
 * @description 检查url是否可连接
 */
export const checkUrlConnecte = (data: AnyObject) => useAxios.post('crontab/check_url_connecte', { data, check: 'object' })

/**
 * @description 计划任务编辑-修改数据库增量备份
 */

export const modifyMysqlIncrementCrontab = (data: AnyObject) => {
	return useAxios.post('project/binlog/modify_mysql_increment_crontab', {
		data,
		check: 'msg',
		customType: 'model',
	})
}

/**
 * @description 设置系统加固临时放行
 * @param {AnyObject} data - 参数说明{time:'当下时间戳'}
 */
export const setAtuoStartSyssafe = (data?: { time: number }) => useAxios.post('crontab/set_atuo_start_syssafe', { data, check: 'msg' })

/**
 * @description 获取网站站点和网站备份目标云厂商类型数据
 * @param {AnyObject} data - 参数说明{type:'site' || 'databases'}
 */
export const getCrontabDataList = (data: AnyObject) => useAxios.post('crontab/GetDataList', { data })

/**
 * @description 获取数据库列表
 */
export const getDatabasesData = (data?: AnyObject) =>
	useAxios.post('project/binlog/get_databases', {
		data,
		customType: 'model',
		check: 'default',
	})

/**
 * @description 获取python环境列表
 */
export const getPythonEnvList = (data?: AnyObject) =>
	useAxios.post('/mod/python/environment/list_environment', {
		data,
		customType: 'model',
		check: 'default',
	})
