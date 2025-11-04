/* eslint-disable @typescript-eslint/naming-convention */
import { useAxios } from '@axios/index'
import { ResponseResult } from '@/types'
import type { NodeDeleteProps } from '@/types/node'

// 节点管理相关接口

/**
 * @description 获取节点模块启用状态
 * @returns { Promise<ResponseResult> }
 */
export const getNodeUsedStatus = (): Promise<ResponseResult> => useAxios.post('/mod/node/node/node_used_status', { check: 'object', customType: 'model' })

/**
 * @description 设置节点模块启用状态
 */
export const setNodeUsedStatus = (): Promise<ResponseResult> => useAxios.post('/mod/node/node/set_used_status', { check: 'object', customType: 'model' })

/**
 * @description 修改节点
 * @param { AnyObject } data.id 节点ID
 * @param { string } data.address 节点地址
 * @param { AnyObject } data.api_key API密钥
 * @param { AnyObject } data.category_id 节点分类ID
 * @param { AnyObject } data.remarks 备注
 * @returns { Promise<ResponseResult> }
 */
export const editNode = (data: { id: number; address?: string; remarks?: string; api_key?: string; category_id?: number }): Promise<ResponseResult> => useAxios.post('/mod/node/node/update_node', { data, check: 'msg', customType: 'model' })

/**
 * @description 添加节点
 * @param { string } data.address 节点地址
 * @param { string } data.api_key API密钥
 * @param { string } data.category_id 节点分类ID
 * @param { string } data.remarks 备注
 * @returns { Promise<ResponseResult> }
 */
export const addNode = (data: { api_key: string; address: string; category_id: string; remarks: string }): Promise<ResponseResult> => useAxios.post('mod/node/node/add_node', { data, check: 'msg', customType: 'model' })

/**
 * @description 节点列表
 * @returns { Promise<ResponseResult> }
 */
export const nodeList = (data: { p?: string; limit?: string; category_id?: string; search?: string; id?: number }): Promise<ResponseResult> => useAxios.post('mod/node/node/get_node_list', { data, check: 'object', customType: 'model' })

/**
 * @description 获取节点分类列表
 * @returns { Promise<ResponseResult> }
 */
export const getNodeClassList = (): Promise<ResponseResult> => useAxios.post('/mod/node/node/get_category_list', { check: 'object', customType: 'model' })

/**
 * @description 获取节点状态
 * @returns { Promise<ResponseResult> }
 */
export const getNodeStatus = (data: { node_data: any }): Promise<ResponseResult> => useAxios.post('/mod/node/node/get_node_status', { check: 'object', data, customType: 'model' })

/**
 * @description 删除节点
 * @param { number } data.id 节点ID
 * @param { string } data.username 节点名称
 * @returns { Promise<ResponseResult> }
 */
export const deleteNode = (data: NodeDeleteProps): Promise<ResponseResult> => useAxios.post('mod/node/node/del_node', { data, check: 'msg', customType: 'model' })

/**
 * @description 添加节点分类
 * @param { string } name 节点分类名称
 * @param { number } ids 分类ID
 * @returns { Promise<ResponseResult> }
 */
export const addNodeClass = (data: { name: string }): Promise<ResponseResult> => useAxios.post('/mod/node/node/add_category', { check: 'object', data, customType: 'model' })

/**
 * @description 删除节点分类
 * @param { number } id 节点分类ID
 * @returns
 */
export const deleteNodeClass = (data: { id: number[] }): Promise<ResponseResult> => useAxios.post('/mod/node/node/del_category', { check: 'object', data, customType: 'model' })

/**
 * @description 批量设置分类
 * @param { string } category_id 节点名称
 * @returns
 */
export const setNodeBatchClass = (data: { category_id: string; ids: number | string }): Promise<ResponseResult> => useAxios.post('/mod/node/node/bind_node_to_category', { check: 'object', data, customType: 'model' })

/**
 * @description 批量删除节点
 * @param data
 * @returns
 */
export const batchDelNode = (data: { ids: number[] }): Promise<ResponseResult> => useAxios.post('/mod/node/node/del_node', { check: 'object', data, customType: 'model' })

/**
 * @description 临时登录
 * @param data
 * @returns
 */
export const getPanelUrl = (data: { node_id: string }): Promise<ResponseResult> => useAxios.post('/mod/node/node/get_panel_url', { check: 'object', data, customType: 'model' })

/**
 * @description 节点管理配置 - 删除ssh
 * @param node_id
 * @returns
 */
export const nodeSSHDelApi = (data: { node_id: number }): Promise<ResponseResult> => useAxios.post('/mod/node/node/remove_ssh_conf', { check: 'object', data, customType: 'model' })

/**
 * @description 节点管理配置 - 设置ssh
 * @param data
 * @returns
 */
export const nodeSSHSet = (data: { port: number; password?: string; pkey?: string; pkey_passwd?: string; node_id?: number; test_case: number; host?: string }): Promise<ResponseResult> => useAxios.post('/mod/node/node/set_ssh_conf', { check: 'object', data, customType: 'model' })

/**
 * @description 节点管理配置 - 获取sshd端口
 * @param data
 * @returns
 */
export const nodeSSHPort = (data: { node_id: number }): Promise<ResponseResult> => useAxios.post('/mod/node/node/get_sshd_port', { check: 'object', data, customType: 'model' })

// 负载均衡相关接口

/**
 * @description 获取负载均衡列表
 * @param data
 * @returns
 */
export const getClbList = (data: { page?: number; page_size?: number; search?: string }): Promise<ResponseResult> => useAxios.post('/mod/node/load/http_load_list', { check: 'object', data, customType: 'model' })

/**
 * @description 批量删除负载均衡
 * @param data
 * @returns
 */
export const batchDelHttpClb = (data: { load_ids: string }): Promise<ResponseResult> => useAxios.post('/mod/node/load/multi_remove_http_load', { check: 'object', data, customType: 'model' })

/**
 * @description 批量删除TCP/UDP负载均衡
 * @param data
 * @returns
 */
export const batchDelTcpUdpClb = (data: { load_ids: string }): Promise<ResponseResult> => useAxios.post('/mod/node/load/multi_remove_tcp_load', { check: 'object', data, customType: 'model' })

/**
 * @description 删除负载均衡
 * @param data
 * @returns
 */
export const deleteClbHttpApi = (data: { load_id: number[] }): Promise<ResponseResult> => useAxios.post('/mod/node/load/remove_http_load', { check: 'object', data, customType: 'model' })

/**
 * @description 获取Http负载均衡日志
 * @param data
 * @returns
 */
export const getHttpClbLog = (data: { load_id: number; date: string; position?: number; limit?: number }): Promise<ResponseResult> => useAxios.post('/mod/node/load/log', { check: 'object', data, customType: 'model' })

/**
 * @description 导出Http负载均衡日志
 * @param data
 * @returns
 */
export const exportHttpClbLog = (data: { load_id: number; date: string }): Promise<ResponseResult> => useAxios.post('/mod/node/load/export_log', { check: 'object', data, customType: 'model' })

/**
 * @description 编辑HttpSeeting
 * @param data
 * @returns
 */
export const editHttpSeeting = (data: { load_id: number; http_codes: string }): Promise<ResponseResult> => useAxios.post('/mod/node/load/set_http_load', { check: 'object', data, customType: 'model' })

/**
 * @description 获取节点站点列表
 * @param data
 * @returns
 */
export const getClbAllNode = (data: { node_type?: 'api' | 'ssh' | 'all' | 'file_src' }): Promise<ResponseResult> => useAxios.post('/mod/node/node/get_all_node', { check: 'object', data: { node_type: data?.node_type ? data.node_type : 'api' }, customType: 'model' })

/**
 * @description 获取节点站点对应的网站
 * @param data
 * @returns
 */
export const getNodeSites = (data: { node_id: number }): Promise<ResponseResult> => useAxios.post('/mod/node/node/get_node_sites', { check: 'object', data, customType: 'model' })

/**
 * @description 获取Tcp/Udp负载均衡列表
 * @param data
 * @returns
 */
export const getTcpUdpClbList = (data: { page?: number; page_size?: number; search?: string }): Promise<ResponseResult> => useAxios.post('/mod/node/load/tcp_load_list', { check: 'object', data, customType: 'model' })

/**
 * @description 删除Tcp/Udp负载均衡
 * @param data
 * @returns
 */
export const deleteTcpUdpClb = (data: { load_id: number[] }): Promise<ResponseResult> => useAxios.post('/mod/node/load/remove_tcp_load', { check: 'object', data, customType: 'model' })

/**
 * @description 获取Tcp/Udp负载均衡日志
 * @param data
 * @returns
 */
export const getTcpUdpClbLog = (data: { load_id: number; date: string }): Promise<ResponseResult> => useAxios.post('/mod/node/load/tcp_log', { check: 'object', data, customType: 'model' })

/**
 * @description 导出Tcp/Udp负载均衡日志
 * @param data
 * @returns
 */
export const exportTcpUdpClbLog = (data: { load_id: number; date: string }): Promise<ResponseResult> => useAxios.post('/mod/node/load/export_tcp_log', { check: 'object', data, customType: 'model' })

/**
 * @description 获取PHP站点列表
 * @param data
 * @returns
 */
export const getPhpSiteList = (): Promise<ResponseResult> => useAxios.post('/mod/node/node/php_site_list', { check: 'object', customType: 'model' })

// 主从复制相关接口

/**
 * @description 获取主从复制列表
 * @param data
 * @returns
 */
export const getSlaveList = (data: { p?: number; limit?: number; search?: string }): Promise<ResponseResult> => useAxios.post('/mod/node/mysql_slave/slave_list', { check: 'object', data, customType: 'model' })

/**
 * @description 获取数据库列表
 * @param data
 * @returns
 */
export const getDatabaseList = (data: { slave_ip: string; p?: number; limit?: number; search?: string }): Promise<ResponseResult> => useAxios.post('/mod/node/mysql_slave/database_list', { check: 'object', data, customType: 'model' })

/**
 * @description 获取主从同步状态
 * @param data
 * @returns
 */
export const getSyncStatus = (data: { slave_ip: string }): Promise<ResponseResult> => useAxios.post('/mod/node/mysql_slave/get_sync_status', { check: 'object', data, customType: 'model' })

/**
 * @description 添加从库
 * @param data
 * @returns
 */
export const addMysqlSlave = (data: { slave_ip: string }): Promise<ResponseResult> => useAxios.post('/mod/node/mysql_slave/add_slave_server', { check: 'object', data, customType: 'model' })

/**
 * @description 获取从库信息
 * @param data
 * @returns
 */
export const getMysqlSlaveInfo = (data: { slave_ip: string }): Promise<ResponseResult> => useAxios.post('/mod/node/mysql_slave/get_slave_info', { check: 'object', data, customType: 'model' })

/**
 * @description 启动或停止从库同步
 * @param data
 * @returns
 */
export const setMysqlSlave = (data: { slave_ip: string; status: 'start' | 'stop' }): Promise<ResponseResult> => useAxios.post('/mod/node/mysql_slave/set_slave_status', { check: 'msg', data, customType: 'model' })

/**
 * @description 删除从库
 * @param data
 * @returns
 */
export const deleteMysqlSlave = (data: { slave_ip: string }): Promise<ResponseResult> => useAxios.post('/mod/node/mysql_slave/del_slave_server', { check: 'msg', data, customType: 'model' })

/**
 * @description 获取历史备份文件
 * @param data
 * @returns
 */
export const getMysqlSlaveHistory = (): Promise<ResponseResult> => useAxios.post('/mod/node/mysql_slave/get_master_sql_list', { check: 'array', customType: 'model' })

/**
 * @description 删除历史备份文件
 * @param data
 * @returns
 */
export const deleteMysqlSlaveHistory = (data: { path: string }): Promise<ResponseResult> => useAxios.post('/mod/node/mysql_slave/del_master_sql', { check: 'msg', data, customType: 'model' })

/**
 * @description 同步从库配置
 * @param data
 * @returns
 */
export const syncMysqlSlaveConfig = (data: { slave_ip: string }): Promise<ResponseResult> => useAxios.post('/mod/node/mysql_slave/sync_slave_config', { check: 'msg', data, customType: 'model' })

/**
 * @description 获取Redis主从复制组列表
 * @param data
 * @returns
 */
export const getRedisList = (data: { p?: number; limit?: number; search?: string }): Promise<ResponseResult> => useAxios.post('/mod/node/redis_slave/replication_group_list', { check: 'msg', data, customType: 'model' })

/**
 * @description 创建Redis主从复制组
 * @param data
 * @returns
 */
export const createRedisGroup = (data: { group_name: string | number; master_node_id: number; slave_node_ids: number[]; master_ip: string; redis_password: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/node/redis_slave/create_replication_group', { check: 'object', data, customType: 'model' })

/**
 * @description 获取可用的Redis节点
 * @param data
 * @returns
 */
export const getAvailableNodes = (): Promise<ResponseResult> => useAxios.post('/mod/node/redis_slave/get_available_nodes', { check: 'msg', customType: 'model' })

/**
 * @description 删除Redis主从复制组
 * @param data
 * @returns
 */
export const delectRedisGroup = (data: { group_id?: string }): Promise<ResponseResult> => useAxios.post('/mod/node/redis_slave/delete_replication_group', { check: 'msg', data, customType: 'model' })

/**
 * @description 获取Redis主从复制组创建进度
 * @param data
 * @returns
 */
export const getCreationStatus = (data: { task_id?: string }): Promise<ResponseResult> => useAxios.post('/mod/node/redis_slave/get_creation_status', { check: 'object', data, customType: 'model' })

/**
 * @description 获取Redis主从复制组详情
 * @param data
 * @returns
 */
export const getGroupDetail = (data: { group_id?: string }): Promise<ResponseResult> => useAxios.post('/mod/node/redis_slave/get_group_detail', { check: 'object', data, customType: 'model' })

/**
 * @description 删除Redis从节点
 * @param data
 * @returns
 */
export const removeRedisGroupSlave = (data: { group_id: string; slave_node_id: number | string }): Promise<ResponseResult> => useAxios.post('/mod/node/redis_slave/remove_slave', { check: 'object', data, customType: 'model' })

/**
 * @description 添加Redis从节点到主从复制组
 * @param data
 * @returns
 */
export const addSlaveToRedisGroup = (data: { group_id: string; new_slave_node_id: number | string }): Promise<ResponseResult> => useAxios.post('/mod/node/redis_slave/add_slave_to_group', { check: 'object', data, customType: 'model' })

/**
 * @description 重新连接Redis从节点
 * @param data
 * @returns
 */
export const reconnectRedisSlave = (data: { group_id: string; slave_node_id: number | string }): Promise<ResponseResult> => useAxios.post('/mod/node/redis_slave/reconnect_slave', { check: 'object', data, customType: 'model' })

// 告警管理相关接口

/**
 * @description 获取告警列表
 * @param data
 * @returns
 */
export const getAlarmList = (data: { p?: number; rows?: number; keyword?: string; template_ids: '["220", "221", "222", "223"]' }): Promise<ResponseResult> => useAxios.post('/mod/push/task/get_task_list', { check: 'object', data, customType: 'model' })

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

// ---------------------------文件-----------------------------

/**
 * @description 获取文件列表
 * @param { number } data.node_id 节点id
 * @param { string } data.path 路径
 * @param { number } data.p 页码
 * @param { number } data.showRow 每页条数
 * @returns { Promise }
 */
export const getNodeFileList = (data: { p: number; showRow: number; node_id: string; path: string; search?: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/node/file_transfer/file_list', {
		data,
		check: 'object',
		customType: 'model',
		skipPending: true,
	})

/**
 * @description 获取文件夹大小
 * @param { number } data.node_id 节点id
 * @param { string } data.path 路径
 * @returns { Promise }
 */
export const getNodeFileSize = (data: { node_id: string; path: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/node/file_transfer/dir_size', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 创建文件分发任务
 * @param { string } data.source_node_id 源节点id
 * @param { string } data.target_node_id 目标节点id
 * @param { string[] } data.source_path_list 源路径列表
 * @param { string } data.target_path 目标路径
 * @returns { Promise }
 */
export const createFileTransferTask = (data: { source_node_id: string; target_node_id: string; source_path_list: string; target_path: string; default_mode: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/node/file_transfer/create_filetransfer_task', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 删除文件
 * @param { string } data.node_id 节点id
 * @param { string } data.path 文件完整路径
 * @param { string } data.is_dir 是否为文件夹， 1 是文件夹， 0文件
 * @returns { Promise }
 */
export const deleteNodeFile = (data: { node_id: string; path: string; is_dir: number }): Promise<ResponseResult> =>
	useAxios.post('/mod/node/file_transfer/delete_file', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 检查文件是否存在
 * @param { string } data.node_id 节点id
 * @param { string } data.files 文件完整路径
 * @returns { Promise }
 */
export const checkNodeFile = (data: { node_id: string; files: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/node/file_transfer/upload_check', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 新建文件夹
 * @param { string } data.node_id 节点id
 * @param { string } data.path 路径
 * @param { string } data.name 文件夹名称
 * @returns { Promise }
 */
export const createNodeFile = (data: { node_id: string; path: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/node/file_transfer/create_dir', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 重启面板/服务器
 * @param data
 * @returns
 */
export const restartNode = (node_id: string, type: 'panel' | 'server'): Promise<ResponseResult> =>
	useAxios.post(`/mod/node/node/${type === 'panel' ? 'restart_bt_panel' : 'server_reboot'}`, {
		data: { node_id },
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 绑定app插件
 * @param data
 * @returns
 */
export const bindApp = (data: { remarks: string; app_key: string }): Promise<ResponseResult> =>
	useAxios.post(`/mod/node/node/bind_app`, {
		data,
		check: 'ignore',
		customType: 'model',
	})

/**
 * @description 验证app插件
 * @param data
 * @returns
 */
export const verifyApp = (data: { remarks: string; app_key: string }): Promise<ResponseResult> =>
	useAxios.post(`/mod/node/node/bind_app_status`, {
		data,
		check: 'ignore',
		customType: 'model',
	})

// ---------------------------命令分发相关接口-----------------------------

/**
 * @description 添加脚本
 * @param { string } data.script_type 脚本类型 python | shell
 * @param { string } data.content 脚本内容
 * @param { string } data.name 脚本名称
 * @param { string } data.description 描述信息，备注信息
 * @param { string } data.group_id 分组id，默认为0，在默认分组中
 * @returns { Promise<ResponseResult> }
 */
export const createScript = (data: { script_type: 'python' | 'shell'; content: string; name: string; description: string; group_id?: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/node/executor/create_script', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 修改脚本
 * @param { string } data.id 脚本的数据库id
 * @param { string } data.script_type 脚本类型 python | shell
 * @param { string } data.content 脚本内容
 * @param { string } data.name 脚本名称
 * @param { string } data.description 描述信息，备注信息
 * @param { string } data.group_id 分组id，默认为0，在默认分组中
 * @returns { Promise<ResponseResult> }
 */
export const modifyScript = (data: { id: string; script_type: 'python' | 'shell'; content: string; name: string; description: string; group_id?: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/node/executor/modify_script', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 删除脚本
 * @param { string } data.id 脚本的数据库id
 * @returns { Promise<ResponseResult> }
 */
export const deleteScript = (data: { id: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/node/executor/delete_script', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取脚本列表
 * @param { string } data.p 页数
 * @param { string } data.limit 每页数量
 * @param { string } data.group_id 分组id，默认为 -1
 * @param { string } data.script_type 脚本类型 python | shell | all
 * @param { string } data.search 搜索 名称，描述，内容
 * @returns { Promise<ResponseResult> }
 */
export const getScriptList = (data: { p: string; limit: string; group_id?: string; script_type?: 'python' | 'shell' | 'all'; search?: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/node/executor/get_script_list', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 批量删除脚本
 * @param { string } data.script_ids 脚本id列表
 * @returns { Promise<ResponseResult> }
 */
export const batchDeleteScript = (data: { script_ids: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/node/executor/bath_delete_script', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 创建脚本分组
 * @param { string } data.name 脚本分组名称
 * @param { string } data.description 描述信息，备注信息
 * @returns { Promise<ResponseResult> }
 */
export const createScriptGroup = (data: { name: string; description: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/node/executor/create_script_group', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 删除脚本分组
 * @param { string } data.id 脚本分组id
 * @returns { Promise<ResponseResult> }
 */
export const deleteScriptGroup = (data: { id: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/node/executor/delete_script_group', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取所有脚本分组
 * @returns { Promise<ResponseResult> }
 */
export const getScriptGroupList = (): Promise<ResponseResult> =>
	useAxios.post('/mod/node/executor/get_script_group_list', {
		check: 'object',
		customType: 'model',
	})

/**
 * @description 批量设置脚本的分组
 * @param { string } data.group_id 分组id
 * @param { string } data.script_ids 脚本id列表
 * @returns { Promise<ResponseResult> }
 */
export const batchSetScriptGroup = (data: { group_id: string; script_ids: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/node/executor/batch_set_script_group', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 创建命令分发任务
 * @param { string } data.node_ids 选择的服务器信息
 * @param { string } data.script_id 选择的脚本id
 * @param { string } data.script_content 使用自定义脚本，不在脚本库中的使用
 * @param { string } data.script_type 使用自定义脚本时的，脚本类型
 * @returns { Promise<ResponseResult> }
 */
export const createExecutorTask = (data: { node_ids: string; script_id?: string; script_content?: string; script_type?: 'python' | 'shell' }): Promise<ResponseResult> =>
	useAxios.post('/mod/node/executor/create_task', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 获取任务列表
 * @param { string } data.p 页数
 * @param { string } data.limit 每页数量
 * @param { string } data.script_type 脚本类型 all | python | shell
 * @param { string } data.search 搜索 名称，描述，内容
 * @param { string } data.node_id 包含指定服务器的
 * @returns { Promise<ResponseResult> }
 */
export const getExecutorTaskList = (data: { p: string; limit: string; script_type?: 'all' | 'python' | 'shell'; search?: string; node_id?: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/node/executor/get_task_list', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 获取任务详情
 * @param { string } data.task_id 任务id
 * @returns { Promise<ResponseResult> }
 */
export const getExecutorTaskInfo = (data: { task_id: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/node/executor/get_task_info', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 重试任务
 * @param { string } data.task_id 任务id
 * @returns { Promise<ResponseResult> }
 */
export const retryExecutorTask = (data: { task_id: number; log_id: number }): Promise<ResponseResult> =>
	useAxios.post('/mod/node/executor/retry_task', {
		data,
		check: 'msg',
		customType: 'model',
	})

// ---------------------------分发任务流程相关接口-----------------------------

/**
 * @description 标记用户开始了下次任务编辑
 * @returns { Promise<ResponseResult> }
 */
export const nextFlowTip = (): Promise<ResponseResult> =>
	useAxios.post('/mod/node/executor/next_flow_tip', {
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取任务流程列表
 * @param { string } data.p 页数
 * @param { string } data.limit 每页数量
 * @returns { Promise<ResponseResult> }
 */
export const getFlowTaskList = (data: { p: string; limit: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/node/executor/flow_task_list', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 获取文件传输任务的具体信息
 * @param { string } data.task_id 任务id
 * @returns { Promise<ResponseResult> }
 */
export const getTransferFileTaskInfo = (data: { task_id: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/node/executor/get_transferfile_task_info', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 获取命令执行任务的具体信息
 * @param { string } data.task_id 任务id
 * @returns { Promise<ResponseResult> }
 */
export const getCommandTaskInfo = (data: { task_id: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/node/executor/get_command_task_info', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 删除执行过的任务流程
 * @param { string } data.flow_ids 要删除的流程id
 * @returns { Promise<ResponseResult> }
 */
export const removeFlow = (data: { flow_ids: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/node/executor/remove_flow', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 用于数据目录选择
 * @param { string } data.node_id 节点id
 * @param { string } data.path 路径
 * @returns { Promise<ResponseResult> }
 */
export const nodeGetDir = (data: { node_id: string; path: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/node/file_transfer/node_get_dir', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 检查目标目录是否可用作上传
 * @param { string } data.path 待检查目录
 * @param { string } data.node_ids 节点id列表
 * @returns { Promise<ResponseResult> }
 */
export const fileDstPathCheck = (data: { path: string; node_ids: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/node/executor/file_dstpath_check', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 停止任务
 * @param { string } data.flow_ids 要删除的流程id
 * @returns { Promise<ResponseResult> }
 */
export const stopFlowTask = (data: { flow_id: number }): Promise<ResponseResult> =>
	useAxios.post('/mod/node/executor/stop_flow', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 设置负载均衡缓存
 * @param { number } data.load_id 负载均衡id
 * @param { number } data.proxy_cache_status 缓存状态
 * @param { string } data.cache_time 缓存时间
 * @param { string } data.cache_suffix 缓存文件后缀
 * @returns { Promise<ResponseResult> }
 */
export const setClbCache = (data: { load_id: number; proxy_cache_status: number; cache_time: string; cache_suffix: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/node/load/set_http_cache', {
		data,
		check: 'object',
		customType: 'model',
	})
