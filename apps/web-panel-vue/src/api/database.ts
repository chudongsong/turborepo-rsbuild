import { useAxios } from '@/hooks/tools'
import { ISqliteTableList } from '@/types/database'
/* eslint-disable @typescript-eslint/naming-convention */

/**
 * @description 检查数据库连接
 * @param { number | string } data.sid 服务器id
 * @returns { Promise }
 */
export const checkServerConnection = (data: { sid: number | string }): Promise<any> =>
	useAxios.post('database/CheckDatabaseStatus', {
		data,
		customType: 'default',
		check: 'object',
		// loading: '正在检查数据库连接，请稍候...',
	})

/**
 * @description 检查数据库连接
 * @param { { data: string } } data JSON字符串格式
 * @param { string } type 数据库类型
 * @returns { Promise }
 */
export const checkModuleServerConnection = (data: { data: string }, type: string): Promise<any> => {
	const req = `database/${type}/CheckDatabaseStatus`
	return useAxios.post(req, {
		data,
		customType: 'model',
		check: 'object',
		// loading: '正在检查数据库连接，请稍候...',
	})
}

/**
 * @description 获取数据库状态
 * @param {string } data.name 数据库名称
 * @returns { Promise }
 */
export const getSoftStatus = (data: { name: string }): Promise<any> =>
	useAxios.post('/panel/public/get_soft_status', {
		data,
		check: 'object',
		customType: 'model',
		// loading: '正在获取数据库状态，请稍候...',
	})

/**
 * @description 修改数据库密码
 * @param {number} data.id 数据库id
 * @param {string} data.name 数据库名称
 * @param {string} data.password 数据库密码
 * @param {string} data.data_name 数据库名称
 */
export const setPassword = (data: { id: number; name: string; password: string; data_name: string }) =>
	useAxios.post('database/ResDatabasePassword', {
		data,
		check: 'object',
		// loading: '正在修改数据库密码，请稍候...',
	})

/**
 * @description 修改数据库密码 - 模块
 * @param {string } data JSON字符串格式
 * @param {number} data.id 数据库id
 * @param {string} data.name 数据库名称
 * @param {string} data.password 数据库密码
 * @param {string} data.data_name 数据库名称
 * @param {{ type: string }} type 查询列表类型
 */
export const setsModulesPassword = (data: { data: string }, type: string) =>
	useAxios.post(`database/${type}/ResDatabasePassword`, {
		customType: 'model',
		data,
		check: 'object',
		// loading: '正在修改数据库密码，请稍候...',
	})

/**
 * @description 数据库工具箱 查询数据库表信息
 * @param {string } data.db_name 数据库名称
 */
export const getTableInfo = (data: { db_name: string }) =>
	useAxios.post('database/GetInfo', {
		data,
		check: 'object',
		// loading: '正在获取表结构，请稍候...',
	})

/**
 * @description 数据库工具箱 查询数据库表信息 - 模块
 * @param { string } data.db_name 数据库名称 -JSON字符串格式
 * @param {string} type 数据库类型
 * @returns
 */
export const getModulesTableInfo = (data: { data: string }, type: any) =>
	useAxios.post(`database/${type}/GetInfo`, {
		customType: 'model',
		data,
		check: 'object',
		// loading: '正在获取表结构，请稍候...',
	})

/**
 * @description 修改数据库工具备注
 * @param {string} data.db_name 数据库名称
 * @param {string} data.comment 备注
 * @param {string} data.table_name 数据库表名
 */
export const modifyTableComment = (data: { table_name: string; comment: string; db_name: string }) =>
	useAxios.post('database/ModifyTableComment', {
		data,
		check: 'object',
		// loading: '正在修改备注，请稍候...',
	})

/**
 * @description 导出表的结构
 */
export const exportTableStr = (data: { db_name: string; table_name: string; filename: string }) => useAxios.post('database/export_table_structure', { data, check: 'object' })

/**
 * @description 转换数据库表引擎
 * @param {string} data.table_type 表类型
 * @param {string} data.tables 表名
 * @param {string} data.db_name 数据库名
 */
export const conversionTable = (data: { table_type?: string; tables: string; db_name: string }) =>
	useAxios.post('database/AlTable', {
		data,
		check: 'object',
		// loading: '正在转换数据库表引擎，请稍候...',
	})

/**
 * @description 优化数据库表信息
 * @param {string} data.db_name 数据库名
 * @param {string} data.tables 表名
 */
export const optimizeTable = (data: { db_name: string; tables: string }) =>
	useAxios.post('database/OpTable', {
		data,
		check: 'object',
		// loading: '正在优化数据库表，请稍候...',
	})

/**
 * @description 修复数据库表信息
 * @param {string} data.db_name 数据库名
 * @param {string} data.tables 表名
 */
export const repairTable = (data: { db_name: string; tables: string }) =>
	useAxios.post('database/ReTable', {
		data,
		check: 'object',
		// loading: '正在修复数据库表，请稍候...',
	})

/**
 * @description 增加数据库 - 模块
 * @param {string} data.name 数据库名称
 * @param {string} data.password 数据库密码
 * @param {string} data.ps 备注
 * @param {string} data.db_user 数据库用户名
 * @param {number | string} data.sid 服务器id
 * @param {{ type: string }} type 数据库类型
 */
export const addModulesDatabase = (data: AnyObject, type: string) =>
	useAxios.post(`database/${type}/AddDatabase`, {
		customType: 'model',
		data: { data: JSON.stringify(data) },
		check: 'object',
	})

interface AddMysqlParams {
	name: string // 数据库名称
	password: string // 数据库密码
	ps: string // 备注
	db_user: string // 数据库用户名
	codeing: string // 数据库编码
	host: string // 数据库地址
	sid: number | string // 服务器id
	dtype: string // 数据库类型
	address: string // 数据库地址
	dataAccess: string // 数据库访问地址
	listen_ip: string // 监听地址
}
/**
 * @description 添加数据库
 * @param {AddMysqlParams} data
 *
 */
export const addDatabase = (data: AddMysqlParams) => useAxios.post('database/AddDatabase', { data, check: 'object' })

/**
 * @description 获取导入数据库大小信息
 * @param { { name: string } } data 数据库名称
 */
export const getImportSize = (data: { name: string }) =>
	useAxios.post(`database/GetImportSize`, {
		data,
		check: 'object',
	})

/**
 * @description 获取备份数据库大小信息
 * @param { number  } data.id 数据库id
 */
export const getBackupSize = (data: { id: number }) =>
	useAxios.post(`database/GetBackupSize`, {
		data,
		check: 'object',
	})

/**
 * @description 查询模块数据库权限 （mongodb）
 * @param {string} data.user_name JSON字符串格式-数据库用户名称
 */
export const getModulePermission = (data: { data: string }, type: string) =>
	useAxios.post(`database/${type}/GetDatabaseAccess`, {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 设置模块数据库权限（mongodb）
 * @param { { data: {user_name:string;db_permission:string} } } data JSON字符串格式
 * db_permission:数据库权限 user_name:数据库用户名称
 * 注:db_permission： Array<string> 权限
 */
export const setModulePermission = (data: { data: string }, type: string) =>
	useAxios.post(`database/${type}/SetDatabaseAccess`, {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 同步数据库
 * @param {{ type: number; ids:string; }}  data { type:同步类型,ids:同步id,string数组 }
 * @param {number} type 1:同步到云端 2:从云端同步
 */
export const syncDataToServer = (data: { ids: string }, type?: number) => {
	if (type === 0) {
		return useAxios.post(`database/SyncToDatabases&type=${type}`, {
			data,
			check: 'object',
		})
	}
	return useAxios.post(`/datalist/batch/batch_sync_db_to_server`, {
		data,
		check: 'object',
		customType: 'model',
	})
}

/**
 * @description 同步数据库 - 模块
 * @param {{ type: number; ids:Array<number>; }}  data -JSON字符串格式
 * { type:同步类型,ids:同步id }
 * @param {{ type: number }} type 查询列表类型
 */
export const syncModuleDataToServer = (data: { data: string }, tab: string) =>
	useAxios.post(`database/${tab}/SyncToDatabases`, {
		customType: 'model',
		data,
		check: 'object',
	})

/**
 * @description 同步数据库到面板（从服务器获取）
 * @param {string}  data.sid { sid:服务器id}
 */
export const syncDataToPanel = (data: { sid: number }) => useAxios.post('database/SyncGetDatabases', { data, check: 'msg' })

/**
 * @description 模块-同步数据库到面板 从服务器获取
 * @param {{ sid: Number; }}  data -JSON字符串格式 { sid:服务器id}
 * @param {{ type: string }} type  类型
 */
export const syncModuleDataToPanel = (data: { data: string }, type: string) =>
	useAxios.post(`database/${type}/SyncGetDatabases`, {
		customType: 'model',
		data,
		check: 'msg',
	})

/**
 * @description 开启安全认证
 * @param {{ status: string; }}  data-JSON { status:开启状态} 1开启 0关闭
 */
export const setAuthStatus = (data: { data: string }) =>
	useAxios.post(`database/mongodb/set_auth_status`, {
		customType: 'model',
		data,
		check: 'msg',
	})

/**
 * @description 列表查询 - mysql
 * @param {string} data.table 查询表名
 * @param {string} data.search 查询条件
 * @param {string} data.limit 分页参数
 * @param {string} data.p 分页参数
 * @param {string} data.order 排序参数
 */
export const getMysqlList = (data: { p: number; limit: number; search: string; table: string; order?: string }) =>
	useAxios.post(`datalist/data/get_data_list`, {
		customType: 'model',
		data,
		check: 'object',
	})

/**
 * @description 列表查询 - 模块
 * @param {string} data.table 查询表名
 * @param {string} data.search 查询条件
 * @param {string} data.limit 分页参数
 * @param {string} data.p 分页参数
 * @param {string} data.sid 查询列表类型
 * @param {string} type 查询列表类型
 */
export const getModulesList = (data: { data?: string }, type: string) =>
	useAxios.post(`database/${type}/get_list`, {
		customType: 'model',
		data,
		check: 'object',
	})

/**
 * @description 列表查询是否配置远程数据库-mysql
 * @param {string} type 查询列表类型
 */
export const getMysqlCloudServer = () =>
	useAxios.post(`database/GetCloudServer`, {
		check: 'array',
	})

/**
 * @description 列表查询是否配置远程数据库 - 模块
 * @param { { type: string } } data.type { type: 查询远程数据库类型 }
 * @param {string} type 查询列表类型
 */
export const getModulesCloudServer = (data: { data: string }, type: string) =>
	useAxios.post(`database/${type}/GetCloudServer`, {
		customType: 'model',
		check: 'array',
		data,
	})

/**
 * @description 查询mongodb是否开启安全认证等配置信息
 */
export const getMongodbConfig = () =>
	useAxios.post(`database/mongodb/get_root_pwd`, {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 修改密码 -mysql
 * @param {string} data.password 数据库密码
 */
export const setupPassword = (data: { password: string }) => useAxios.post('database/SetupPassword', { data, check: 'msg' })

/**
 * @description 删除远程数据库 -mysql
 * @param {number} data.id 数据库id
 */
export const removeServer = (data: { id: number }) =>
	useAxios.post('database/RemoveCloudServer', {
		data,
		check: 'object',
	})

/**
 * @description 删除模块远程数据库
 * @param {number}  data.id { id:远程数据库id}
 * @param {string} type 查询列表类型
 */
export const removeModuleServer = (data: { data: string }, type: string) =>
	useAxios.post(`database/${type}/RemoveCloudServer`, {
		customType: 'model',
		data,
		check: 'object',
	})

interface CloudServerParams {
	db_host: string // 数据库地址
	db_port: string | number // 数据库端口
	db_user: string // 数据库用户名
	db_password: string // 数据库密码
	ps: string // 备注
	type?: string // 数据库类型
	sid?: number | string // 服务器id
}

interface AddBinlogBackupTaskParams {
	id: number // 数据库ID（必需）
	schedule_type: 'daily' | 'weekly' | 'interval' | 'hours' // 调度类型（必需）
	incremental_backup_interval: number // 增量备份间隔(分钟)（必需）

	// daily 类型需要：
	schedule_time?: string // 执行时间 HH:mm:ss

	// weekly 类型需要：
	weekday?: number // 星期几 (0=周日, 1=周一, ..., 6=周六)

	// interval 类型需要：
	interval_days?: number // 间隔天数
	start_date?: string // 开始日期 YYYY-MM-DD

	// hours 类型需要：
	interval_hours?: number // 间隔小时数
}

interface GetBackupFilesParams {
	page?: number // 页码（可选，默认1）
	limit?: number // 每页记录数（可选，默认20，最大100）
	backup_type?: 'all' | 'full' | 'incremental' // 备份类型（可选）
	date?: string // 指定日期（可选）：YYYY-MM-DD格式
	id?: number // 数据库ID（可选）：指定数据库
}

interface GetBackupLogsParams {
	id?: number // 数据库ID（可选）：不提供则获取所有数据库日志
}

interface RestoreBinlogDataParams {
	id: number // 数据库ID（必需）
	restore_time: string // 还原时间点（必需）：YYYY-MM-DD HH:mm:ss
}

/**
 * @description 增加远程数据库 -mysql
 * @param {CloudServerParams} data
 */
export const addServer = (data: CloudServerParams) =>
	useAxios.post('database/AddCloudServer', {
		data,
		check: 'object',
	})

/**
 * @description 增加模块远程数据库
 * @param {CloudServerParams} data.data JSON字符串格式
 * @param {string} type 查询列表类型
 */
export const addModulesServer = (data: { data: string }, type: string) =>
	useAxios.post(`database/${type}/AddCloudServer`, {
		customType: 'model',
		data,
		check: 'object',
	})

/**
 * @description 修改远程数据库
 * @param {CloudServerParams} data
 */
export const modifyServer = (data: CloudServerParams) =>
	useAxios.post('database/ModifyCloudServer', {
		data,
		check: 'object',
	})

/**
 * @description 修改模块远程数据库
 * @param {CloudServerParams} data.data JSON字符串格式
 * @param {string} type 查询列表类型
 */
export const modifyModulesServer = (data: AnyObject, type: string) =>
	useAxios.post(`database/${type}/ModifyCloudServer`, {
		customType: 'model',
		data,
		check: 'object',
	})

/**
 * @description 批量备份数据库 - mysql
 * @param {number} data.id 数据库id
 * @param {Array<string>} data.table_list 表备份参数 表名列表 -其他模块
 * @param {string} data.storage_type 表备份参数 备份类型
 * @param {string} data.file_type 表备份参数 备份文件类型
 * @param {Array<string>} data.collection_list 表备份参数 表名列表 - mongodb
 */
export const backDatabase = (data: { data?: string; id?: number }) => useAxios.post('database/ToBackup', { data, check: 'object' })

export const batchBackMysqlData = (data: any) => useAxios.post('/datalist/batch/batch_backup_mysql', { data, check: 'object', customType: 'model' })

/**
 * @description 批量备份数据库-module
 * @param {number} data.id 数据库id
 * @param {Array<string>} data.table_list 表备份参数 表名列表 -其他模块
 * @param {string} data.storage_type 表备份参数 备份类型
 * @param {string} data.file_type 表备份参数 备份文件类型
 * @param {Array<string>} data.collection_list 表备份参数 表名列表 - mongodb
 * @param {string} type 数据库类型
 */
export const backModuleDatabase = (data: { data?: string }, type: string) =>
	useAxios.post(`database/${type}/ToBackup`, {
		customType: 'model',
		data,
		check: 'object',
	})

/**
 * @description 删除备份数据库
 * @param {number} data.id 备份id
 */
export const delBackup = (data: { id: number }) => useAxios.post('database/DelBackup', { data, check: 'object' })

/**
 * @description 常规备份 恢复数据库 导入数据库
 * @param {string} data.file 备份文件路径
 * @param {string} data.name 数据库名称
 * @param {boolean} data.disk_check 是否检查磁盘空间
 */
export const restoreBack = (data: { file: string; name: string; disk_check?: boolean }) => useAxios.post('database/InputSql', { data, check: 'object' })

/**
 * @description 常规备份 恢复数据库 导入数据库
 * @param {string} data.data JSON字符串格式
 * @param {string} data.file 备份文件路径
 * @param {string} data.name 数据库名称
 * @param {string} type 数据库类型
 */
export const restoreModuleBack = (data: { data: string }, type: string) =>
	useAxios.post(`database/${type}/InputSql`, {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 获取下载地址
 * @param {string} data.filename 文件名
 * @param {number} data.cron_id 定时任务id
 */
export const backupDownload = (data: { filename: string; cron_id?: number }) => useAxios.post('crontab/cloud_backup_download', { data })

/**
 * @description 导入 - 获取备份信息
 * @param {string} data.p 分页参数
 * @param {string} data.search 查询条件
 * @param {string} data.limit 分页限制
 * */
export const getBackup = (data: { p: number; search: string; limit: number }) => useAxios.post('database/GetBackup', { data, check: 'object' })

/**
 * @description 导入 - 获取备份信息 - module
 * */
export const getModulesBackup = (data: { data: string }, type: string) =>
	useAxios.post(`database/${type}/GetBackup`, {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 检查数据库删除数据 -mysql
 * @param {Array<number>} data.ids 数据库id列表 JSON数组
 */
export const checkDelData = (data: { ids: string }) => useAxios.post('database/check_del_data', { data, check: 'object' })

/**
 * @description 删除弹窗查询数据库信息
 * @param {string} data.data JSON字符串格式
 * @param {Array<number>} data.ids 数据库id列表 JSON数组
 */
export const checkModulesDelData = (data: { data: string }, type: string) =>
	useAxios.post(`database/${type}/check_del_data`, {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 删除数据库 模块删除+mysql通用
 * @param {number} data.id 数据库id
 * @param {string} data.name 数据库名称
 * @param {string} type 数据库类型
 */
export const deleteDatabase = (data: { id?: number; name?: string; path?: string }, type?: string) => {
	if (type) {
		return useAxios.post(`database/${type}/DeleteDatabase`, {
			data: { data: JSON.stringify(data) },
			check: 'msg',
			customType: 'model',
		})
	}
	return useAxios.post('database/DeleteDatabase', { data, check: 'msg' })
}

export const batchDelMysqlData = (data: any) => useAxios.post('/datalist/batch/batch_delete_database', { data, check: 'object', customType: 'model' })

/**
 * @description 修改管理员数据库密码 - pgsql
 * @param {string} data.password 数据库密码
 */
export const setPgSqlPassword = (data: { data: string }) =>
	useAxios.post('database/pgsql/set_root_pwd', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 获取管理员数据库密码 - pgsql
 */
export const getPgSqlPassword = () =>
	useAxios.post('database/pgsql/get_root_pwd', {
		check: 'object',
		customType: 'model',
	})

/**
 * @description 列表查询
 * @param {number} data.sid 服务器id
 */
export const getRedisKey = (data: { data: string }) =>
	useAxios.post(`database/redis/get_list`, {
		customType: 'model',
		data,
		check: 'array',
	})

/**
 * @description redis查询指定key 的value数据
 * @param {string} data.data JSON字符串格式
 * @param {number } data.limit 分页参数
 * @param {number } data.db_idx 数据库索引
 * @param {string } data.search 查询条件
 * @param {number } data.sid 服务器id
 * @param {number } data.p 分页参数
 */
export const getRedisKeyValue = (data: { data: string }) =>
	useAxios.post(`database/redis/get_db_keylist`, {
		customType: 'model',
		check: 'object',
		data,
	})

/**
 * @description 清空数据库-redis
 * @param {string} data JSON字符串格式
 * @param {Array<number>} data.id_list 数据库key索引
 * @param {number} data.sid 服务器id
 */
export const clearRedisDb = (data: { data: string }) =>
	useAxios.post(`database/redis/clear_flushdb`, {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 获取备份列表-redis
 * @param {string} data JSON字符串格式
 * @param {string} data.sort 排序方式
 */
export const getRedisBackupList = (data: { data: string }) =>
	useAxios.post(`database/redis/get_backup_list`, {
		data,
		customType: 'model',
		check: 'array',
	})

/**
 * @description 添加redis值
 * @param {string} data JSON字符串格式
 * @param {string} data.db_idx 数据库key
 * @param {string} data.name 数据库name
 * @param {string} data.val 数据库value
 * @param {number} data.endtime 数据库过期时间
 * @param {number} data.sid 服务器id
 */
export const setRedisValue = (data: { data: string }) =>
	useAxios.post(`database/redis/set_redis_val`, {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 删除redis值
 * @param {string} data JSON字符串格式
 * @param {string} data.db_idx 数据库key
 * @param {string} data.key 数据库name
 * @param {number} data.sid 服务器id
 */
export const delRedisValue = (data: { data: string }) => {
	return useAxios.post(`database/redis/del_redis_val`, {
		data,
		check: 'object',
		customType: 'model',
	})
}

/**
 * @description 删除redis值
 * @param {string} data JSON字符串格式
 * @param {string} data.db_idx 数据库key
 * @param {string} data.key 数据库name
 * @param {number} data.sid 服务器id
 */
export const delBatchRedisValue = (data: { data: string }) => {
	return useAxios.post(`/datalist/batch/batch_delete_redis`, {
		data,
		check: 'object',
		customType: 'model',
	})
}

/**
 * @description 数据库root密码获取 mysql
 * @param {string} data.table 数据库名称
 * @param {string} data.key 数据库key
 * @param {number} data.id 数据库id
 */
export const getMysqlRootPwd = (data: { table: string; key: string; id: number }) =>
	useAxios.post('data/getKey', {
		data,
		check: 'string',
	})

/**
 * @description 获取所有备份 - mysql
 * @param {number} data.p 分页参数 - 页码
 * @param {number} data.limit 分页参数 - 每页显示数量
 */
export const getMysqlAllBackup = (data: { p: number; limit: number }) => useAxios.post('database/GetAllBackup', { data, check: 'object' })

/**
 * @description 获取详细备份信息 - mysql - 数据库备份
 * @param {string} data.file 备份文件路径
 */
export const getMysqlBackupInfo = (data: { file: string }) => useAxios.post('database/GetBackupInfo', { data, check: 'object' })

/**
 * @description 导入数据库
 * @param {string} data.file 备份文件路径
 */
export const inputDatabase = (data: { file: string }) => useAxios.post('database/InputSqlAll', { data, check: 'msg' })

/**
 * @description 根据sid获取可备份的数据库
 * @param {number} data.sid 服务器id
 */
export const getBackupDatabase = (data: { sid: number }) => useAxios.post('database/GetBackupDatabase', { data, check: 'object' })

/**
 * @description 备份数据库 - 常规
 * @param {number} data.sid 服务器id
 * @param {String} data.db_list 数据库名称列表 string格式
 */
export const backupDatabase = (data: { sid: number; db_list: string }) => useAxios.post('database/ToBackupAll', { data, check: 'object' })

/**
 * @description 查询数据库权限 -mysql
 * @param {string} data.name 数据库名称
 */
export const getPermission = (data: { name: string }) => useAxios.post('database/GetDatabaseAccess', { data, check: 'msg' })

/**
 * @description 设置数据库权限 -mysql
 * @param {string} data.name 数据库名称
 * @param {string} data.dataAccess 数据库访问地址
 * @param {string} data.access 数据库权限
 * @param {string} data.address 数据库地址
 */
export const setPermission = (data: { name: string; dataAccess: string; access: string; address: string }) => useAxios.post('database/SetDatabaseAccess', { data, check: 'object' })

/**
 * @description 查询增量数据库发送请求-检测是否开启二进制日志
 */
export const getBinlogStatus = () =>
	useAxios.post('project/binlog/get_binlog_status', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 企业增量备份查询备份数据库选项
 */
export const getDatabaseOptions = () =>
	useAxios.post('project/binlog/get_databases', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description  企业增量备份查询详细信息
 * @param {number} data.db_name 数据库名称
 * @param {number} data.p 分页参数
 * @param {string} data.limit 分页参数
 */
export const getIncrementBackData = (data: { p: number; limit: number; db_name: string }) =>
	useAxios.post('project/binlog/get_increment_crontab', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 执行任务-企业增量备份
 * @param {number} data.id 任务id
 */
export const startIncrementTask = (data: { id: number }) => useAxios.post('crontab/StartTask', { data, check: 'object' })

/**
 * @description 获取任务执行日志
 */
export const getIncrementLogs = (data: { id: number }) => useAxios.post('crontab/GetLogs', { data, check: 'object' })

/**
 * @description 清空任务执行日志
 * @param { number } data.id  任务ID
 */
export const clearIncrementLog = (data: { id: number }) => useAxios.post('crontab/DelLogs', { data, check: 'object' })

/**
 * @description 删除增量数据库备份请求
 * @param { number } data.id  任务ID
 */
export const delIncrementData = (data: { id: number }) =>
	useAxios.post('crontab/DelCrontab', {
		data,
		check: 'object',
	})

/**
 * @description 获取备份信息记录
 * @param { number } data.cron_id  任务ID
 * */
export const getIncrementRecord = (data: { cron_id: number }) =>
	useAxios.post('project/binlog/get_backup', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 恢复备份信息记录
 * @param { number } data.cron_id  任务ID
 * */
export const restoreRecord = (data: { cron_id: number; node_time: string }) =>
	useAxios.post('project/binlog/restore_time_database', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 导出备份信息记录
 * @param { number } data.cron_id  任务ID
 * @param { string | number } data.node_time  时间节点
 * */
export const outRecord = (data: { cron_id: number; node_time: string | number }) => {
	return useAxios.post('project/binlog/export_time_database', {
		data,
		customType: 'model',
		check: 'object',
	})
}

/**
 * @description 修改增量备份任务
 * @returns
 */
export const modifyIncrementData = (data: AnyObject) => {
	return useAxios.post('project/binlog/modify_mysql_increment_crontab', {
		data,
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 添加增量备份任务
 * @returns
 */
export const addIncrementData = (data: AnyObject) =>
	useAxios.post('project/binlog/add_mysql_increment_crontab', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 添加数据库配额容量
 * @returns
 */
export const addDatabaseQuota = (data: string) =>
	useAxios.post('project/quota/modify_database_quota', {
		data: { data },
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 恢复数据库写入权限
 * @param {{ db_name: string; }}  data { db_name:数据库名称}
 */
export const restoreDataAuth = (data: AnyObject) =>
	useAxios.post(`project/quota/recover_database_insert_accept`, {
		customType: 'model',
		data,
		check: 'msg',
	})

/**
 * @description 获取显示日志 数据库导入-mysql
 */
export const getImportLog = () => useAxios.post('database/GetImportLog', { check: 'msg' })

/**
 * @description 获取导入状态
 */
export const getImportStatus = () => useAxios.post('database/GetImportStatus', { check: 'object' })

/**
 * @description 设置MySQL守护进程状态
 * @returns
 */
export const setRestartTask = (data: { status: number }) => useAxios.post('database/set_restart_task', { data, check: 'msg' })

/**
 * @description 获取MySQL守护进程状态
 */
export const getRestartTask = () => useAxios.post('database/get_restart_task', { check: 'ignore' })

/**
 * @description 获取数据库信息-关联服务
 */
export const getMysqlInfo = () =>
	useAxios.post('panel/sitelink/get_mysql_info', {
		customType: 'model',
		check: 'array',
	})

/**
 * @description 获取站点信息
 */
export const getSiteInfo = () =>
	useAxios.post('panel/sitelink/get_site_info', {
		check: 'array',
		customType: 'model',
	})

/**
 * @description 修改ftp链接
 */
export const modifyFtpLink = (data: AnyObject) =>
	useAxios.post('panel/sitelink/modify_ftp_link', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 修改mysql链接
 */
export const modifyMysqlLink = (data: AnyObject) =>
	useAxios.post('panel/sitelink/modify_mysql_link', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取ftp信息
 */
export const getFtpInfo = () => useAxios.post('panel/sitelink/get_ftp_info', { customType: 'model' })

/**
 * @description 删除索引
 * */
export const delIndexList = (data: { sid: number; db_name: string; tb_name: string }) => {
	return useAxios.post('project/sphinx_search/del_index_list', {
		data,
		customType: 'model',
		check: 'object',
	})
}

/**
 * @description 获取索引列表
 * @returns
 * */
export const getIndexList = (data: { sid: number }) => {
	return useAxios.post('project/sphinx_search/get_index_list', {
		data,
		customType: 'model',
		check: 'object',
	})
}

/**
 * @description 获取数据库信息-敏感词检测
 *
 * @returns
 * */
export const getSphinxDatabase = (data: { sid: number | string }) =>
	useAxios.post('project/sphinx_search/get_database', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取用户数据
 * @returns
 */
export const getUserData = (data?: { search?: string; sid: number | string }) => useAxios.post('database/GetMysqlUser', { data, check: 'object' })

/**
 * @description 设置告警状态
 * @param { string } data 告警名称
 */
export const setPushStatus = (data: { name: string; id: number; status: number }): Promise<any> => useAxios.post('push/set_push_status', { data, check: 'object' })

/**
 * @description 删除用户管理
 * @returns
 */
export const delMysqlUser = (data: { username: string; host: string; sid: number }) => useAxios.post('database/DelMysqlUser', { data, check: 'msg' })

/**
 * @description 导出用户数据
 * @returns
 */
export const exportUserData = (data: { username: string; host: string; sid: number }) => useAxios.post('database/GetUserGrants', { data, check: 'string' })

/**
 * @description 获取数据库数据
 * @returns
 */
export const getDatabasesList = (data: { sid: number }) => useAxios.post('database/GetDatabasesList', { data, check: 'object' })

interface IUser {
	sid: number
	username: string
	host: string
	password?: string
	db_name: string
	tb_name: string
}
interface IGrants extends IUser {
	with_grant: number
	access: string
}

/**
 * @description 添加用户管理
 * @returns
 */
export const addUser = (data: IUser) => useAxios.post('database/AddMysqlUser', { data, check: 'msg' })

/**
 * @description 删除用户数据
 */
export const delUserGrants = (data: IGrants) => {
	return useAxios.post('database/DelUserGrants', { data, check: 'msg' })
}

/**
 * @description 添加用户数据
 */
export const addUserGrants = (data: IGrants) => {
	return useAxios.post('database/AddUserGrants', { data, check: 'msg' })
}

/**
 * @description 修改用户密码
 */
export const changeUserPass = (data: { username: string; password: string; host: string; sid: number }) => useAxios.post('database/ChangeUserPass', { data, check: 'msg' })

/**
 * @description 获取自动备份数据库配置
 * @param {string} data.name 数据库名称
 */
export const getAutoConfig = (data: { name: string }) =>
	useAxios.post(`crontab/get_auto_config`, {
		data,
		check: 'msg',
	})

/**
 * @description 设置自动备份数据库配置
 * @param {string} data.name 数据库名称
 * @param {number} data.status 状态
 */
export const setAutoConfig = (data: { name: string; status: number }) =>
	useAxios.post(`crontab/set_auto_config`, {
		data,
		check: 'msg',
	})

/**
 * @description 获取数据库分类
 * @param data
 * @returns
 */
export const getDbTypes = (data: { db_type: string }) => useAxios.post('database/view_database_types', { data, check: 'object' })

/**
 * @description 添加数据库分类
 */
export const addDbTypes = (data: { db_type: string; ps: string }) => useAxios.post('database/add_database_types', { data, check: 'object' })

/**
 * @description 删除数据库分类
 */
export const delDbTypes = (data: { id: number; db_type: string }) => useAxios.post('database/delete_database_types', { data, check: 'object' })

/**
 * @description 修改数据库分类
 */
export const modifyDbTypes = (data: { db_type: string; id: number; ps: string }) => useAxios.post('database/update_database_types', { data, check: 'object' })

/**
 * @description 设置pgsql数据库权限
 * @param {string} data 数据库 JSON字符串格式
 */
export const setPgSqlAuth = (data: { data: string }) =>
	useAxios.post('/database/pgsql/modify_pgsql_listen_ip', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 同步数据库sqllite
 * @param {AnyObject} data 请求数据库信息
 * @param {number} type 1:同步到云端 2:从云端同步
 */
export const syncToSqlite = (data: AnyObject, type?: string) =>
	useAxios.post(`database/SyncToDatabases&type=${type}`, {
		data,
		check: 'msg',
	})

/**
 * @description 获取指定数据库所有表数据
 */
export const getSqliteTableList = (data: { path: string }) =>
	useAxios.post('database/sqlite/get_table_list', {
		data: { data: JSON.stringify(data) },
		customType: 'model',
		check: 'array',
	})

/**
 * @description 查询sql语句
 */
export const querySql = (data: { path: string; sql_shell: string }) =>
	useAxios.post('database/sqlite/query_sql', {
		data: { data: JSON.stringify(data) },
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取指定数据库表信息
 */
export const getSqliteTableInfo = (data: { path: string; table: string; p: number; search: string }) =>
	useAxios.post('database/sqlite/get_table_info', {
		data: { data: JSON.stringify(data) },
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取指定数据库表字段
 */
export const getSqliteKeys = (data: { path: string; table: string }) =>
	useAxios.post('database/sqlite/get_keys_bytable', {
		data: { data: JSON.stringify(data) },
		customType: 'model',
		check: 'array',
	})

/**
 * @description 删除表数据
 */
export const deleteTableData = (data: { path: string; table: string; where_data: any }) =>
	useAxios.post('database/sqlite/delete_table_data', {
		data: { data: JSON.stringify(data) },
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 插入表数据
 */
export const createTableData = (data: { data: string }) =>
	useAxios.post('database/sqlite/create_table_data', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 修改表数据
 */
export const updateTableData = (data: { data: string }) =>
	useAxios.post('database/sqlite/update_table_info', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 备份sqlite数据库
 */
export const getSqliteBackup = (data: { data: string }) =>
	useAxios.post('database/sqlite/get_backup_list', {
		data,
		customType: 'model',
		check: 'array',
	})

/**
 * @description 删除sqlite数据库备份
 */
export const delSqliteBackup = (data: { data: string }) =>
	useAxios.post('database/sqlite/DelBackup', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 备份sqlite数据库
 */
export const backupSqlite = (data: { data: string }) =>
	useAxios.post('database/sqlite/ToBackup', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置数据库分类
 */
// export const setDbTypes = (data: AnyObject) => useAxios.post('database/set_database_type_by_name', { data, check: 'object' })
export const setDbTypes = (data: AnyObject) => useAxios.post('/datalist/batch/batch_set_mysql_type', { data, check: 'object', customType: 'model' })

/**
 * @description 获取等保基础设置 - mysql
 */
export const getDatabaseTimeOut = () => useAxios.post('database/GetTimeOut', { check: 'object' })

/**
 * @description 设置等保基础设置 - mysql
 * @param {object} data.wait_timeout 等待超时时间
 * @param {object} data.interactive_timeout 交互超时时间
 * @param {object} data.default_password_lifetime 密码到期限制
 * @param {object} data.expire_logs_days 日志保存时间
 */
export const setDatabaseTimeOut = (data: { wait_timeout: string; interactive_timeout: string; default_password_lifetime: string; expire_logs_days: string }) => useAxios.post('database/SetTimeOut', { data, check: 'object' })

/**
 * @description 获取密码复杂度设置 - mysql
 */
export const getDatabasePasswordConfig = () => useAxios.post('database/GetValidatePasswordConfig', { check: 'object' })

/**
 * @description 设置密码复杂度设置 - mysql
 * @param {object} data.wait_timeout 等待超时时间
 * @param {object} data.interactive_timeout 交互超时时间
 * @param {object} data.default_password_lifetime 密码到期限制
 * @param {object} data.expire_logs_days 日志保存时间
 */
export const setDatabasePasswordConfig = (data: { status: 'on' | 'off'; validate_password_length?: string; validate_password_mixed_case_count?: string; validate_password_number_count?: string; validate_password_special_char_count?: string; validate_password_policy?: string }) =>
	useAxios.post('database/SetValidatePasswordConfig', { data, check: 'object' })

/**
 * @description 获取登录限制设置 - mysql
 */
export const getDatabaseLoginLimit = () => useAxios.post('database/GetLoginFailed', { check: 'object' })

/**
 * @description 设置登录限制 - mysql
 * @param {object} data.status 状态
 * @param {object} data.connection_control_failed_connections_threshold 连接失败次数
 * @param {object} data.connection_control_min_connection_delay 最小连接延迟
 * @param {object} data.connection_control_max_connection_delay 最大连接延迟
 */
export const setDatabaseLoginLimit = (data: { status: 'on' | 'off'; connection_control_failed_connections_threshold?: string; connection_control_min_connection_delay?: string; connection_control_max_connection_delay?: string }) => useAxios.post('database/SetLoginFailed', { data, check: 'object' })

/**
 * @description 获取审计日志设置 - mysql
 */
export const getDatabaseAuditLog = () => useAxios.post('database/GetAuditLogConfig', { check: 'object' })

/**
 * @description 设置审计日志设置 - mysql
 * @param {object} data.status 状态
 * @param {object} data.audit_log_buffer_size 日志缓冲区大小 单位为字节
 * @param {object} data.audit_log_file 审计日志名称
 * @param {object} data.audit_log_flush 审计日志刷新
 * @param {object} data.audit_log_format 存储日志类型
 * @param {object} data.audit_log_policy 审计日志记录策略
 * @param {object} data.audit_log_rotate_on_size 日志文件最大大小，0为不限制
 * @param {object} data.audit_log_rotations 保留的最大日志文件数
 * @param {object} data.audit_log_strategy 日志写入类型
 */
export const setDatabaseAuditLog = (data: {
	status: 'on' | 'off'
	audit_log_buffer_size?: number
	audit_log_file?: string
	audit_log_flush?: 'ON' | 'OFF'
	audit_log_format?: 'JSON' | 'OLD' | 'NEW' | 'CSV'
	audit_log_policy?: 'ALL' | 'LOGINS' | 'QUERIES'
	audit_log_rotate_on_size?: number
	audit_log_rotations?: string
	audit_log_strategy?: 'ASYNCHRONOUS' | 'PERFORMANCE' | 'SYNCHRONOUS'
}) => useAxios.post('database/SetAuditLogConfig', { data, check: 'object' })

/**
 * @description 获取审计日志高级设置数据库列表 - mysql
 */
export const getAuditAdvDatabaseList = () => useAxios.post('database/GetDatabaseList', { data: { id: 0 }, check: 'array' })
/**
 * @description 获取审计日志高级设置用户列表 - mysql
 */
export const getAuditAdvUserList = () => useAxios.post('database/GeUserHostList', { data: { id: 0 }, check: 'array' })
/**
 * @description 获取审计日志高级设置查询列表 - mysql
 */
export const getAuditAdvOrderList = () => useAxios.post('database/GetMysqlCommands', { data: { id: 0 }, check: 'array' })

/**
 * @description 设置审计日志高级设置 - mysql
 * @param {'exclude' | 'include'} data.type 操作类型 exclude 排除 include 包含
 * @param {string} data.accounts 记录的用户
 * @param {string} data.commands 记录的语句
 * @param {string} data.databases 记录的数据库
 */
export const setDatabaseAuditLogRules = (data: { type: 'exclude' | 'include'; accounts: string; commands: string; databases: string }) => useAxios.post('database/SetAuditLogRules', { data, check: 'msg' })
/**
 * @description 获取审计日志--日志 - mysql
 */
export const getAuditLog = () => useAxios.post('database/GetAuditLog', { check: 'msg' })

/**
 * @description 刷新写入权限状态
 * @returns
 */
export const databaseQuotaCheck = () => useAxios.post('project/quota/database_quota_check', { check: 'number', customType: 'model' })

/**
 * @description 检查数据库是否加密
 * @param data
 * @returns
 */
export const checkDatabasePass = (data: AnyObject) => {
	return useAxios.post('database/is_zip_password_protected', { data, check: 'boolean' })
}

/**
 * @description 备份数据库 - sqlite
 * @param data
 * @returns
 */
export const backupSqliteData = (data: { data: ISqliteTableList }) => {
	return useAxios.post('/datalist/batch/batch_backup_sqlite', {
		data,
		check: 'object',
		customType: 'model',
	})
}

/**
 * @description 删除数据库 - sqlite
 * @param data
 * @returns
 */
export const deleteSqliteData = (data: { data: ISqliteTableList }) => {
	return useAxios.post('/datalist/batch/batch_delete_sqlite', {
		data,
		check: 'object',
		customType: 'model',
	})
}

/**
 * @description 批量设置权限 - mysql
 * @param data
 * @returns
 */
export const batchSetMysqlAuth = (data: any) => {
	return useAxios.post('/datalist/batch/batch_set_mysql_access', {
		data,
		check: 'object',
		customType: 'model',
	})
}

// /**
//  * @description 批量设置权限 - mysql
//  * @param data
//  * @returns
//  */
// export const batchSetMysqlAuth = (data: any) => {
// 	return useAxios.post('/datalist/batch/batch_set_mysql_access', {
// 		data,
// 		check: 'object',
// 		customType: 'model',
// 	})
// }

/**
 * @description 增量备份--获取数据库详细信息- mysql
 * @param {AddBinlogBackupTaskParams} data 备份任务参数
 * @returns {Promise<any>} 返回任务配置信息
 */
export const getIncrementBackupInfo = (data: { id: number }) => {
	return useAxios.post('/mod/mysql_binlog_backup/com/get_db_info', {
		data,
		check: 'object',
		customType: 'model',
	})
}
/**
 * @description 增量备份--添加备份任务- mysql
 * @param {AddBinlogBackupTaskParams} data 备份任务参数
 * @returns {Promise<any>} 返回任务配置信息
 */
export const addIncrementTask = (data: AddBinlogBackupTaskParams) => {
	return useAxios.post('/mod/mysql_binlog_backup/com/add_binlog_backup_task', {
		data,
		check: 'msg',
		customType: 'model',
	})
}

/**
 * @description 获取单个备份任务配置
 * @param {number} data.id 数据库ID
 * @returns {Promise<any>} 返回任务配置信息或null
 */
export const getBinlogBackupTask = (data: { id: number }) => {
	return useAxios.post('/mod/mysql_binlog_backup/com/get_backup_task_list', {
		data,
		check: 'object',
		customType: 'model',
	})
}

/**
 * @description 获取备份文件列表
 * @param {GetBackupFilesParams} data 查询参数
 * @returns {Promise<any>} 返回备份文件列表
 */
export const getBinlogBackupFiles = (data: GetBackupFilesParams) => {
	return useAxios.post('/mod/mysql_binlog_backup/com/get_backup_files_list', {
		data,
		check: 'object',
		customType: 'model',
	})
}

/**
 * @description 删除备份任务
 * @param {number} data.id 数据库ID
 * @returns {Promise<any>} 删除结果
 */
export const delBinlogBackupTask = (data: { id: number }) => {
	return useAxios.post('/mod/mysql_binlog_backup/com/del_binlog_backup_task', {
		data,
		check: 'msg',
		customType: 'model',
	})
}

/**
 * @description 获取备份日志
 * @param {GetBackupLogsParams} data 查询参数
 * @returns {Promise<any>} 返回日志列表
 */
export const getBinlogBackupLogs = (data: GetBackupLogsParams) => {
	return useAxios.post('/mod/mysql_binlog_backup/com/get_backup_logs', {
		data,
		check: 'object',
		customType: 'model',
	})
}

/**
 * @description 删除备份文件
 * @param {string} data.backup_id 备份文件ID
 * @returns {Promise<any>} 删除结果
 */
export const deleteBinlogBackupFile = (data: { backup_id: string }) => {
	return useAxios.post('/mod/mysql_binlog_backup/com/delete_backup_file', {
		data,
		check: 'msg',
		customType: 'model',
	})
}

/**
 * @description 还原备份数据
 * @param {RestoreBinlogDataParams} data 还原参数
 * @returns {Promise<any>} 返回任务ID
 */
export const restoreBinlogData = (data: RestoreBinlogDataParams) => {
	return useAxios.post('/mod/mysql_binlog_backup/com/restore_binlog_data', {
		data,
		check: 'object',
		customType: 'model',
	})
}

/**
 * @description 获取还原进度
 * @param {string} data.task_id 还原任务ID
 * @returns {Promise<any>} 返回还原进度信息
 */
export const getRestoreProgress = (data: { task_id: string }) => {
	return useAxios.post('/mod/mysql_binlog_backup/com/get_restore_progress', {
		data,
		check: 'object',
		customType: 'model',
	})
}

/**
 * @description 清空备份
 * @param {number} data.id 数据库ID
 * @returns {Promise<any>} 清空结果
 */
export const clearBinlogBackup = (data: { id: number }) => {
	return useAxios.post('/mod/mysql_binlog_backup/com/cleanup_all_backups', {
		data,
		check: 'msg',
		customType: 'model',
	})
}
