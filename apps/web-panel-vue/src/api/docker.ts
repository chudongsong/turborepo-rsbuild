/* eslint-disable @typescript-eslint/naming-convention */

import type { ResponseResult } from '@axios/types'
import type {
	DockerSiteCreateByEnvProps,
	DockerSiteCreateByProxyProps,
	DockerSiteEnvListProps,
	DockerSiteCreateProps,
	DockerSiteDelBatchProps,
	DockerSiteGetRunLogProps,
	DockerSiteEnvVersionProps,
	DockerSiteCreateEnvProps,
	DockerSiteGetBuildLogProps,
	DockerSiteBatchDeleteDomainProps,
	DockerSiteDeleteDomainProps,
} from '@/views/docker/types'
import { useAxios } from '@/hooks/tools'

export interface hostProps {
	[key: string]: string | number
	host: string
	port: number
	username: string
	password: string
	pkey: string
	pkey_passwd: string
	ps: string
}

export interface commandProps {
	title: string
	shell: string
	new_title?: string
}

/**
 * @description 获取快速部署列表新
 * @returns { Promise }
 */
export const getAppList = (data: { p: string; row: string; query?: string }): Promise<ResponseResult> =>
	useAxios.post('/btdocker/app/get_app_list', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取快速部署列表
 * @returns { Promise }
 */
export const getQuickList = (): Promise<ResponseResult> =>
	useAxios.post('/btdocker/project/get_project_list', {
		customType: 'model',
		check: 'msg',
	})

// /**
//  * @description 更新快速部署列表
//  * @returns { Promise }
//  */
// export const refreshQuickList = (): Promise<ResponseResult> =>
// 	useAxios.post('/btdocker/project/sync_item', {
// 		customType: 'model',
// 		check: 'msg',
// 	})

/**
 * @description 获取指定项目表单配置
 * @returns { Promise }
 */
export const getFormConfig = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/project/get_project', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 一键部署指定项目
 * @returns { Promise }
 */
export const oneCreate = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/project/create_project', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 一键部署允许该端口从外部访问
 * @returns { Promise }
 */
export const allowPort = (data: any): Promise<ResponseResult> =>
	useAxios.post('/safe/firewall/create_rules', {
		data,
		customType: 'model',
		check: 'msg',
	})

// /**
//  * @description 获取项目列表
//  * @returns { Promise }
//  */
// export const getProductList = (): Promise<ResponseResult> =>
// 	useAxios.post('/btdocker/compose/compose_project_list', {
// 		customType: 'model',
// 		check: 'array',
// 	})

/**
 * @description 获取项目容器数量
 * @returns { Promise }
 */
export const getProductNum = (): Promise<ResponseResult> =>
	useAxios.post('/btdocker/compose/project_container_count', {
		customType: 'model',
		check: 'array',
	})

/**
 * @description 获取项目分组
 * @returns { Promise }
 */
export const getProjectGroups = (): Promise<ResponseResult> =>
	useAxios.post('/btdocker/dkgroup/get_project_groups', {
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 添加项目分组
 */
export const addProjectGroups = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/dkgroup/add_project_group', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 修改项目分组
 */
export const modifyProjectGroups = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/dkgroup/modify_group_status', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除项目分组
 */
export const deleteProjectGroups = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/dkgroup/delete_project_group', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 添加项目到分组
 */
export const addProjectToGroup = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/dkgroup/add_project_to_group', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取指定分组项目列表
 */
export const getProjectDetail = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/dkgroup/get_project_details', {
		data,
		customType: 'model',
		check: 'msg',
	})

export const removeProjectFromGroup = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/dkgroup/remove_project_from_group', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取项目分组详情
 */
export const getProjectGroupDetail = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/dkgroup/get_project_group_details', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置排序
 */
export const editProjectOrder = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/dkgroup/edit_project_order', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置启动间隔
 */
export const editGroupInterval = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/dkgroup/edit_group_interval', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取项目容器列表
 * @returns { Promise }
 */
export const getItemConList = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/compose/get_compose_container', {
		data,
		customType: 'model',
		check: 'array',
	})

/**
 * @description 删除容器
 * @returns { Promise }
 */
export const delContainer = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/container/del_container', {
		data,
		customType: 'model',
		check: 'msg',
	})

// /**
//  * @description 容器目录
//  * @returns { Promise }
//  */
// export const getContainerDir = (data: any): Promise<ResponseResult> =>
// 	useAxios.post('/files?action=GetDir', {
// 		data,
// 		customType: 'model',
// 		check: 'msg',
// 	})

/**
 * @description 获取指定容器日志
 * @returns { Promise }
 */
export const getContainerLog = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/container/get_logs', {
		data,
		loading: '获取日志,请稍候...',
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取指定容器监控
 * @returns { Promise }
 */
export const getContainerControl = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/status/stats', {
		data,
		customType: 'model',
		check: 'object',
	})
/**
 * @description 获取指定容器监控
 * @returns { Promise }
 */
export const getDockerSystemInfo = (): Promise<ResponseResult> =>
	useAxios.post('/btdocker/status/get_docker_system_info', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取所有容器日志
 * @returns { Promise }
 */
export const getAllContainerLog = (): Promise<ResponseResult> =>
	useAxios.post('/btdocker/container/get_logs_all', {
		loading: '获取日志,请稍候...',
		customType: 'model',
		check: 'object',
	})

/**
 * @description 清空某个容器日志
 * @returns { Promise }
 */
export const clearContainerLog = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/container/clear_log', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置容器日志切割状态
 * @returns { Promise }
 */
export const setContainerCutLog = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/container/docker_split', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置容器状态
 * param { status } data 状态stop|start|restart|pause|unpause
 * param { id } data 容器id
 * @returns { Promise }
 */
export const setContainerStatus = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/container/set_container_status', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 添加容器
 * param { data } data
 * @returns { Promise }
 */
export const AddContainerStatus = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/container/run', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description cmd添加容器
 * param { data } data
 * @returns { Promise }
 */
export const CmdAddContainer = (data: any, route?: string): Promise<ResponseResult> =>
	useAxios.post(`/btdocker/${route || `container`}/run_cmd`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取指定容器
 * param { data } data
 * @returns { Promise }
 */
export const getDockerDetail = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/container/get_container_info', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取容器终端执行命令
 * param { data } data
 * @returns { Promise }
 */
export const getConCmd = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/container/docker_shell', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 清理无用容器
 * param { data } data
 * @returns { Promise }
 */
export const clearCon = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/container/prune', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置容器重启策略
 * param { data } data
 * @returns { Promise }
 */
export const setConReset = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/container/update_restart_policy', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置容器加入网络
 * param { data } data
 * @returns { Promise }
 */
export const setConAddNet = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/network/connect', {
		data,
		loading: '加入网络,请稍候...',
		customType: 'model',
		check: 'object',
	})

/**
 * @description 设置容器断开网络
 * param { data } data
 * @returns { Promise }
 */
export const setConOutNet = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/network/disconnect', {
		data,
		loading: '退出网络,请稍候...',
		customType: 'model',
		check: 'object',
	})

/**
 * @description 设置容器生成镜像
 * param { data } data
 * @returns { Promise }
 */
export const setConMirror = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/container/commit', {
		data,
		loading: '创建镜像,请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 更新、编辑容器
 * param { data } data
 * @returns { Promise }
 */
export const editCon = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/container/upgrade_container', {
		data,
		loading: '加载中,请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置指定compose项目的运行状态
 * @returns { Promise }
 */
export const setComposeStatus = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/compose/set_compose_status', {
		data,
		customType: 'model',
		loading: '设置状态,请稍候...',
		check: 'msg',
	})

/**
 * @description 添加项目
 * @returns { Promise }
 */
export const addProduct = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/compose/create', {
		data,
		customType: 'model',
		loading: '添加项目,请稍候...',
		check: 'msg',
	})

/**
 * @description 编辑项目
 * @returns { Promise }
 */
export const editProduct = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/compose/edit', {
		data,
		customType: 'model',
		loading: '编辑项目,请稍候...',
		check: 'msg',
	})

// /**
//  * @description 删除项目
//  * @returns { Promise }
//  */
// export const delProduct = (data: any): Promise<ResponseResult> =>
// 	useAxios.post('/btdocker/compose/remove', {
// 		data,
// 		customType: 'model',
// 		loading: '删除项目,请稍候...',
// 		check: 'msg',
// 	})

/**
 * @description 清理无用项目
 * @returns { Promise }
 */
export const clearItem = (): Promise<ResponseResult> =>
	useAxios.post('/btdocker/compose/prune', {
		customType: 'model',
		check: 'msg',
	})

// /**
//  * @description 获取部署表单信息
//  * @returns { Promise }
//  */
// export const getDeployForm = (data: any): Promise<ResponseResult> =>
// 	useAxios.post('/project/docker/model?action=project-get_project', { data, customType: 'model' })

// /**
//  * @description 获取部署表单信息
//  * @returns { Promise }
//  */
// export const getSettingConfig = (data: any): Promise<ResponseResult> =>
// 	useAxios.post('/project/docker/model?action=setup-get_config', { data, customType: 'model' })

// /**
//  * @description 获取图表信息
//  * @param { hostProps } data 主机信息
//  * @returns { Promise }
//  */
// export const getchart = (data: hostProps): Promise<ResponseResult> =>
// 	useAxios.post('/project/docker/model?action=status-stats', { data, customType: 'model' })

/**
 * @description 获取镜像列表
 * @returns { Promise }
 */
export const getMirrorList = (): Promise<ResponseResult> => useAxios.post('btdocker/image/image_list', { customType: 'model', check: 'array' })

/**
 * @description 从仓库拉取
 * @returns { Promise }
 */
export const pullStash = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/image/pull_from_some_registry', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取仓库列表
 * @returns { Promise }
 */
export const getStashList = (): Promise<ResponseResult> =>
	useAxios.post('/btdocker/registry/registry_list', {
		customType: 'model',
		check: 'array',
	})

/**
 * @description 添加仓库
 * @returns { Promise }
 */
export const addStash = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/registry/add', {
		data,
		loading: '添加仓库',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 编辑仓库
 * @returns { Promise }
 */
export const editStash = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/registry/edit', {
		data,
		loading: '编辑仓库',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除仓库
 * @returns { Promise }
 */
export const delStash = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/registry/remove', {
		data,
		loading: '删除仓库',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 导入镜像
 * @returns { Promise }
 */
export const getpullMirror = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/image/load', {
		data,
		customType: 'model',
		loading: '导入镜像',
		check: 'msg',
	})

/**
 * @description 构建镜像
 * @returns { Promise }
 */
export const getBuildMirror = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/image/build', {
		data,
		customType: 'model',
		loading: '构建镜像',
		check: 'msg',
	})

/**
 * @description 推送镜像
 * @returns { Promise }
 */
export const getPushMirror = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/image/push', {
		data,
		customType: 'model',
		loading: '推送镜像',
		check: 'msg',
	})

/**
 * @description 导出镜像
 * @returns { Promise }
 */
export const getExportMirror = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/image/save', {
		data,
		customType: 'model',
		loading: '导出镜像',
		check: 'msg',
	})

/**
 * @description 删除镜像
 * @returns { Promise }
 */
export const deleteMirror = (data: any): Promise<ResponseResult> => useAxios.post('/btdocker/image/remove', { data, customType: 'model', check: 'object' })

/**
 * @description 清理无用镜像
 * @returns { Promise }
 */
export const clearMirror = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/image/prune', {
		data,
		loading: '正在清理无用镜像,请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取网络列表
 * @returns { Promise }
 */
export const getNetList = (): Promise<ResponseResult> =>
	useAxios.post('/btdocker/network/get_host_network', {
		customType: 'model',
		check: 'array',
	})

/**
 * @description 添加网络
 * @returns { Promise }
 */
export const addN = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/network/create_network', {
		data,
		customType: 'model',
		loading: '正在添加网络,请稍候...',
		check: 'msg',
	})

/**
 * @description 删除网络
 * @returns { Promise }
 */
export const delNet = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/network/del_network', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 清理无用网络
 * @returns { Promise }
 */
export const clearNet = (): Promise<ResponseResult> =>
	useAxios.post('/btdocker/network/prune', {
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取存储卷列表
 * @returns { Promise }
 */
export const getStorageList = (): Promise<ResponseResult> =>
	useAxios.post('/btdocker/volume/get_volume_list', {
		customType: 'model',
		check: 'array',
	})

/**
 * @description 添加存储卷
 * @returns { Promise }
 */
export const addStorage = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/volume/add', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除存储卷
 * @returns { Promise }
 */
export const delStorage = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/volume/remove', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 清理无用存储卷
 * @returns { Promise }
 */
export const clearStorage = (): Promise<ResponseResult> =>
	useAxios.post('/btdocker/volume/prune', {
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取服务状态
 * @returns { Promise }
 */
export const getSetting = (): Promise<ResponseResult> =>
	useAxios.post('/btdocker/setup/get_config', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取加速源
 * @returns { Promise }
 */
export const getURL = (): Promise<ResponseResult> =>
	useAxios.post('/btdocker/setup/get_registry_mirrors', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取系统信息
 * @returns { Promise }
 */
export const getSystemInfo = (): Promise<ResponseResult> =>
	useAxios.post('/btdocker/setup/get_system_info', {
		customType: 'model',
		check: 'default',
	})

/**
 * @description 设置加速url
 * @returns { Promise }
 */
export const setURL = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/setup/set_registry_mirrors', {
		data,
		loading: '设置加速url,请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除加速源
 * @returns { Promise }
 */
export const delURL = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/setup/del_com_registry_mirror', {
		data,
		loading: '获取删除加速源,请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置docker状态//start|stop|restart
 * @returns { Promise }
 */
export const setDocker = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/setup/docker_service', {
		data,
		loading: '设置docker状态,请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 修复docker程序
 * @returns { Promise }
 */
export const repairDocker = (): Promise<ResponseResult> =>
	useAxios.post('/btdocker/setup/repair_docker', {
		loading: '修复docker程序,请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置监控状态//start|stop
 * @returns { Promise }
 */
export const setMonitor = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/setup/set_docker_monitor', {
		data,
		loading: '设置监控状态,请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置监控保存天数
 * @returns { Promise }
 */
export const setMonitorDate = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/setup/set_monitor_save_date', {
		data,
		loading: '设置监控保存天数,请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置docker compose路径
 * @returns { Promise }
 */
export const setComposePath = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/setup/set_docker_compose_path', {
		data,
		loading: '设置docker compose路径,请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取docker配置文件
 * @returns { Promise }
 */
export const getConfigFile = (): Promise<ResponseResult> =>
	useAxios.post('/btdocker/setup/get_daemon_json', {
		loading: '获取配置文件,请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 修改docker配置文件
 * @returns { Promise }
 */
export const setConfigFile = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/setup/save_daemon_json', {
		data,
		loading: '修改配置文件,请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取项目模板列表
 * @returns { Promise }
 */
export const getTemplateList = (): Promise<ResponseResult> =>
	useAxios.post('/btdocker/compose/template_list', {
		customType: 'model',
		check: 'array',
	})

/**
 * @description 添加项目模板
 * @returns { Promise }
 */
export const addTemplate = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/compose/add_template', {
		data,
		loading: '添加项目模板,请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 搜索指定目录模板
 * @returns { Promise }
 */
export const searchTemplate = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/compose/get_compose_project', {
		data,
		customType: 'model',
		check: 'array',
	})
/**
 * @description 搜索官方镜像
 * @returns { Promise }
 */
export const searchOfficialTemplate = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/image/search', {
		data,
		customType: 'model',
		check: 'array',
	})
/**
 * @description 获取镜像详情
 */
export const getImageDetail = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/image/get_image_detail', {
		data,
		customType: 'model',
		check: 'array',
	})
/**
 * @description 获取镜像Tag列表
 * @returns { Promise }
 */
export const getImageTag = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/image/get_image_tags', {
		data,
		customType: 'model',
		check: 'array',
	})

/**
 * @description 添加目录模板
 * @returns { Promise }
 */
export const addDirTemplate = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/compose/add_template_in_path', {
		data,
		loading: '添加项目模板,请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取模板详细信息
 * @returns { Promise }
 */
export const getTemplateDetail = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/compose/get_template', {
		data,
		loading: '获取模板信息,请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 编辑模板
 * @returns { Promise }
 */
export const editTemplate = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/compose/edit_template', {
		data,
		loading: '添加项目模板,请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除模板
 * @returns { Promise }
 */
export const delTemplate = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/compose/remove_template', {
		data,
		loading: '删除项目模板,请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 拉取镜像
 * @returns { Promise }
 */
export const pullMirror = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/compose/pull', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取拉取镜像日志
 * @returns { Promise }
 */
export const getpullLog = (): Promise<ResponseResult> =>
	useAxios.post('/btdocker/compose/get_pull_log', {
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取容器列表
 * @returns { Promise }
 */
export const getContainerList = (): Promise<ResponseResult> =>
	useAxios.post('/btdocker/container/get_list', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 容器备份列表
 * @returns { Promise }
 */
export const getContainerBackupList = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/backup/get_backup_list', {
		data,
		customType: 'model',
		check: 'array',
	})
/**
 * @description 创建容器备份
 * @returns { Promise }
 */
export const addContainerBackup = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/backup/backup_volume', {
		data,
		customType: 'model',
		check: 'msg',
	})
/**
 * @description 创建容器备份
 * @returns { Promise }
 */
export const delContainerBackup = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/backup/remove_backup', {
		data,
		customType: 'model',
		check: 'msg',
	})
/**
 * @description 获取容器重命名
 * @returns { Promise }
 */
export const ContainerReName = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/container/rename_container', {
		data,
		customType: 'model',
		loading: '正在重命名,请稍候...',
		check: 'msg',
	})

/**
 * @description docker或者docker-compose安装
 * @param { number } data.type 安装模式  0官方镜像源安装（推荐） 1二进制安装
 * @param { string } data.url 模式0时安装镜像源url
 * @returns { Promise }
 */
export const dokcerInstall = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/setup/install_docker_program', {
		data,
		customType: 'model',
		loading: '正在安装,请稍候...',
		check: 'msg',
	})
/**
 * @description 选择证书
 */
export const getCertInfo = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/proxy/get_cert_info', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 添加端口免登录
 * @returns { Promise }
 */
export const createPortProxy = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/proxy/create_proxy', {
		data,
		customType: 'model',
		loading: '正在设置,请稍候...',
		check: 'msg',
	})
/**
 * @description 获取指定端口免登录配置
 * @returns { Promise }
 */
export const getNoPortConfig = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/proxy/get_proxy_info', {
		data,
		customType: 'model',
		check: 'object',
	})
/**
 * @description 关闭端口免登录
 * @returns { Promise }
 */
export const closePortLogin = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/proxy/close_proxy', {
		data,
		customType: 'model',
		loading: '正在关闭,请稍候...',
		check: 'msg',
	})

/**
 * @description 设置容器列表置顶
 * @returns { Promise }
 */
export const setContainerTop = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/container/set_container_to_top', {
		data,
		customType: 'model',
		loading: '正在设置,请稍候...',
		check: 'msg',
	})

/**
 * @description 设置容器列表备注
 * @returns { Promise }
 */
export const setContainerRemark = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/container/set_container_remark', {
		data,
		customType: 'model',
		loading: '正在设置,请稍候...',
		check: 'msg',
	})

// /**
//  * @description 容器管理ws请求
//  */
// export const getContainerStatus = (onMessage: AnyFunction) =>
// 	instance.modelWs('btdocker/container/get_all_stats', {
// 		check: 'ignore',
// 		customType: 'model',
// 		onMessage,
// 	})

// /**
//  * @description 容器ws请求
//  */
// export const getContainerUsed = (onMessage: AnyFunction) =>
// 	instance.modelWs('btdocker/container/get_all_stats', {
// 		check: 'ignore',
// 		customType: 'model',
// 		onMessage,
// 	})
/**
 * @description 获取容器路径
 * @returns { Promise }
 */
export const getContainerPath = (data: any): Promise<ResponseResult> =>
	useAxios.post('/btdocker/container/get_container_merged', {
		data,
		customType: 'model',
		check: 'object',
	})
/**
 * @description 获取容器备份、备注
 * @returns { Promise }
 */
export const getContainerInfo = (): Promise<ResponseResult> =>
	useAxios.post('/btdocker/container/get_other_container_data', {
		customType: 'model',
		check: 'array',
	})
/**
 * @description 卸载docker
 * @returns { Promise }
 */
export const dokcerUnInstall = (data: { type: number }): Promise<ResponseResult> =>
	useAxios.post('/btdocker/setup/uninstall_docker_program', {
		data,
		customType: 'model',
		loading: '正在卸载,请稍候...',
		check: 'msg',
	})

/**
 * @description 卸载docker
 * @returns { Promise }
 */
export const checkUnstaillStatus = (): Promise<ResponseResult> =>
	useAxios.post('/btdocker/setup/uninstall_status', {
		customType: 'model',
		loading: '正在检查状态,请稍候...',
		check: 'msg',
	})

/**
 * @description 检测编排模板是否应用
 * @returns { Promise }
 */
export const checkTemplateUsed = (data: { id: number }): Promise<ResponseResult> =>
	useAxios.post('/btdocker/compose/check_use_template', {
		data,
		customType: 'model',
		loading: '正在检查状态,请稍候...',
		check: 'msg',
	})

/**
 * @description 开启、关闭docker  ipv6
 * @returns { Promise }
 */
export const setDockerIpv6 = (data: { status: number; ipaddr?: string }): Promise<ResponseResult> =>
	useAxios.post('/btdocker/setup/set_ipv6_global', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 仓库备注编辑
 * @returns { Promise }
 */
export const editStashRemark = (data: { id: number | string; remark: string }): Promise<ResponseResult> =>
	useAxios.post('/btdocker/registry/set_remark', {
		data,
		customType: 'model',
		check: 'msg',
	})
// 新容器分组相关
/**
 * @description 获取容器分组列表
 * @returns { Promise }
 */
export const getContainerGroupList = (): Promise<ResponseResult> =>
	useAxios.post('/btdocker/dkgroup/get_group', {
		customType: 'model',
		check: 'array',
	})
/**
 * @description 添加容器分组
 * @param { group_name } data 分组名称
 * @param { container_info } data 容器名数组
 * @param { interval } data 间隔
 * @returns { Promise }
 */
export const addContainerGroup = (data: { group_name: string; container_info: string; interval: string }): Promise<ResponseResult> =>
	useAxios.post('/btdocker/dkgroup/add_group', {
		data,
		customType: 'model',
		check: 'msg',
	})
/**
 * @description 编辑容器分组
 * @param { id } data 分组id
 * @param { group_name } data 分组名称
 * @param { container_info } data 容器名数组
 * @param { interval } data 间隔
 * @returns { Promise }
 */
export const editContainerGroup = (data: { id: string; group_name: string; container_info: string; interval: string }): Promise<ResponseResult> =>
	useAxios.post('/btdocker/dkgroup/update_group', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除容器分组
 * @param { id } data 分组id
 * @returns { Promise }
 */
export const delContainerGroup = (data: { id: string }): Promise<ResponseResult> =>
	useAxios.post('/btdocker/dkgroup/del_group', {
		data,
		customType: 'model',
		check: 'msg',
	})
/**
 * @description 设置容器分组状态
 * @param { id } data 分组id
 * @param { status } data 状态
 * @returns { Promise }
 */
export const setContainerGroupStatus = (data: { id: string; status: 'stop' | 'start' }): Promise<ResponseResult> =>
	useAxios.post('/btdocker/dkgroup/modify_group_status', {
		data,
		customType: 'model',
		check: 'msg',
	})
/**
 * @description 获取指定容器分组信息
 * @param { id } data 分组id
 * @param { status } data 状态
 * @returns { Promise }
 */
export const getContainerGroup = (data: { id: string }): Promise<ResponseResult> =>
	useAxios.post('/btdocker/dkgroup/get_info', {
		data,
		customType: 'model',
		check: 'msg',
	})
/**
 * @description 获取容器分组可添加容器信息
 * @returns { Promise }
 */
export const getContainerUnAdd = (): Promise<ResponseResult> =>
	useAxios.post('/btdocker/dkgroup/docker_list', {
		customType: 'model',
		check: 'object',
	})
// 新容器分组相关end
/**
 * @description 容器编排获取容器日志
 * @returns { Promise }
 */
export const getComposeConLog = (data: any): Promise<any> =>
	useAxios.post('/mod/docker/com/get_project_container_logs', {
		data,
		loading: '获取日志,请稍候...',
		customType: 'model',
		check: 'ignore',
	})
/**
 * @description 获取DockerApp列表
 */
export const getDockerAppList = (data: { app_type: string; row: number; p: string; force?: number }) =>
	useAxios.post('/mod/docker/com/get_apps', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取Docker分类数据
 */
export const getDockerType = (): Promise<any> =>
	useAxios.post('/mod/docker/com/get_tags', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 卸载指定的App
 */
export const uninstallDockerApp = (data: { id: string; type: string }): Promise<any> =>
	useAxios.post('/mod/docker/com/remove_app', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取备份列表
 */
export const getBackupList = (data: { id: string }): Promise<any> =>
	useAxios.post('/mod/docker/com/get_backup_list', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 备份指定的App
 */
export const backupDockerApp = (data: { id: string }): Promise<any> =>
	useAxios.post('/mod/docker/com/backup_app', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除备份
 */
export const deleteBackup = (data: { id: string; file_name: string }): Promise<any> =>
	useAxios.post('/mod/docker/com/delete_backup', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 恢复备份
 */
export const restoreBackup = (data: { id: string; file_name: string; backup: boolean }): Promise<any> =>
	useAxios.post('/mod/docker/com/restore_backup', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取已安装的App
 */
export const getInstalledApps = (data: { app_type: string; p: number; row: number; query: string }): Promise<any> =>
	useAxios.post('/mod/docker/com/get_installed_apps', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取App日志
 */
export const getAppRunLog = (data: { service_name: string; app_name: string }): Promise<any> =>
	useAxios.post('/mod/docker/com/get_app_log', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取App安装日志
 */
export const getAppInstallLog = (data: { service_name: string }): Promise<any> =>
	useAxios.post('/mod/docker/com/get_app_installed_log', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 安装App
 */
export const installApp = (data: AnyObject): Promise<any> =>
	useAxios.post('/mod/docker/com/create_app', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取依赖App
 */
export const getDependenceApps = (data: { depend_app: string }): Promise<any> =>
	useAxios.post('/mod/docker/com/get_dependence_apps', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置App状态
 */
export const setAppStatus = (data: { service_name: string; app_name: string; status: string }): Promise<any> =>
	useAxios.post('/mod/docker/com/set_app_status', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 移除App
 */
export const removeApp = (data: { id: string; delete_data: number }): Promise<any> =>
	useAxios.post('/mod/docker/com/remove_app', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 更新App
 */
export const updateApp = (data: AnyObject): Promise<any> =>
	useAxios.post('/mod/docker/com/update_app', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 更新版本
 */
export const getUpdateVersions = (data: { id: string }): Promise<any> =>
	useAxios.post('/mod/docker/com/update_versions', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 设置容器编排备注
 */
export const setComposeRemark = (data: { name: string; remark: string; path: string }): Promise<any> =>
	useAxios.post('/mod/docker/com/edit_remark', {
		data,
		customType: 'model',
		check: 'msg',
	})
// docker网站

/**
 * @description 获取网站列表
 * @returns { Promise }
 *
 * @param { data } data
 * @param { data } data
 */
export const getSiteList = (data: { p: number; row: number; query: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/docker/com/get_site_list', {
		data,
		customType: 'model',
		check: 'msg',
	})
/**
 * @description 设置网站状态
 * @returns { Promise }
 *
 * @param { data } data.id 网站id
 * @param { data } data.status 0关闭 1开启
 * @param { data } data.site_name 网站名称
 */
export const setSiteStatus = (data: { id: number; status: 0 | 1; site_name: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/docker/com/set_site_status', {
		data,
		customType: 'model',
		check: 'msg',
	})
/**
 * @description 设置网站备注
 * @returns { Promise }
 *
 * @param { data } data.id 网站id
 * @param { data } data.status 0关闭 1开启
 * @param { data } data.remark 网站名称
 */
export const setSiteRemark = (data: { id: number; remark: string; site_name: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/docker/com/set_remak', {
		data,
		customType: 'model',
		check: 'msg',
	})
/**
 * @description 删除网站
 * @returns { Promise }
 *
 * @param { data } data.id 网站id
 * @param { data } data.remove_path 0不删除网站目录  1删除网站目录
 */
export const delDockerSite = (data: { id: number; site_name: string; remove_path: 0 | 1 }): Promise<ResponseResult> =>
	useAxios.post('/mod/docker/com/delete_site', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 批量删除网站
 * @returns { Promise }
 *
 * @param { data } data.id 网站id列表
 * @param { data } data.remove_path 0不删除网站目录  1删除网站目录
 */
export const delBatchDockerSite = (data: DockerSiteDelBatchProps): Promise<ResponseResult> =>
	useAxios.post('/mod/docker/com/batch_delete_site', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 创建网站
 * @returns { Promise }
 */
export const createDockerSite = (data: DockerSiteCreateByEnvProps | DockerSiteCreateByProxyProps | DockerSiteCreateProps): Promise<ResponseResult> =>
	useAxios.post('/mod/docker/com/create_site', {
		data,
		customType: 'model',
		check: 'msg',
	})
/**
 * @description 获取环境列表
 * @returns { Promise }
 */
export const getDockerSiteEnvList = (data: DockerSiteEnvListProps): Promise<ResponseResult> =>
	useAxios.post('/mod/docker/com/get_runtime_list', {
		data,
		customType: 'model',
		check: 'msg',
	})
/**
 * @description 获取容器和app信息列表
 * @returns { Promise }
 */
export const getDockerSiteConAndAppList = (data: { type: 'container' | 'app' }): Promise<ResponseResult> =>
	useAxios.post('/mod/docker/com/get_some_info', {
		data,
		customType: 'model',
		check: 'msg',
	})
/**
 * @description 创建网站
 * @returns { Promise }
 */
export const setDockerSiteEdate = (data: { id: string; edate: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/docker/com/set_site_edate', {
		data,
		customType: 'model',
		check: 'msg',
	})
/**
 * @description 删除环境
 * @returns { Promise }
 */
export const delEnv = (data: { id: number }): Promise<ResponseResult> =>
	useAxios.post('/mod/docker/com/delete_runtime', {
		data,
		customType: 'model',
		check: 'msg',
	})
/**
 * @description 批量删除环境
 * @returns { Promise }
 */
export const delBatchEnv = (data: { ids: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/docker/com/batch_delete_runtime', {
		data,
		customType: 'model',
		check: 'msg',
	})
/**
 * @description 清理构建缓存
 * @returns { Promise }
 */
export const cleanBuildCache = (): Promise<ResponseResult> =>
	useAxios.post('/mod/docker/com/build_prune', {
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 更新环境模板
 * @returns { Promise }
 */
export const refreshEnvTemplate = (): Promise<ResponseResult> =>
	useAxios.post('/mod/docker/com/check_templates', {
		data: { force_update: 1 },
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取环境日志
 * @returns { Promise }
 */
export const getEnvLog = (data: DockerSiteGetRunLogProps | DockerSiteGetBuildLogProps): Promise<ResponseResult> =>
	useAxios.post('/mod/docker/com/get_runtime_logs', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取运行环境版本信息
 * @returns { Promise }
 */
export const getEnvVersion = (data: DockerSiteEnvVersionProps): Promise<ResponseResult> =>
	useAxios.post('/mod/docker/com/get_runtime_versions', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取php扩展源列表
 * @returns { Promise }
 */
export const getEnvExtend = (data: { version: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/docker/com/get_all_exts', {
		data,
		customType: 'model',
		check: 'msg',
	})
/**
 * @description 获取php扩展模板列表
 * @returns { Promise }
 */
export const getEnvExtendTemplate = (data: { p: number; row: number }): Promise<ResponseResult> =>
	useAxios.post('/mod/docker/com/get_php_ext_list', {
		data,
		customType: 'model',
		check: 'msg',
	})
/**
 * @description 创建指定运行环境
 * @returns { Promise }
 */
export const createEnv = (data: DockerSiteCreateEnvProps): Promise<ResponseResult> =>
	useAxios.post(`/mod/docker/com/${data.id ? 'modify_runtime' : 'create_runtime'}`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置运行环境
 * @returns { Promise }
 */
export const setEnvStatus = (data: { runtime_status: 'stop' | 'restart' | 'start'; compose_file: string }): Promise<ResponseResult> =>
	useAxios.post('/mod/docker/com/set_runtime_status', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 创建/编辑扩展模板
 * @returns { Promise }
 */
export const setPhpTemplate = (data: { version: string; exts: string; name?: string; id?: number }): Promise<ResponseResult> =>
	useAxios.post(`/mod/docker/com/${data.id ? 'modify_php_ext_template' : 'create_php_ext_template'}`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除扩展模板
 * @returns { Promise }
 */
export const delPhpTemplate = (data: { id: number }): Promise<ResponseResult> =>
	useAxios.post(`/mod/docker/com/delete_php_ext_template`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 批量删除扩展模板
 * @returns { Promise }
 */
export const delBatchPhpTemplate = (data: { ids: string }): Promise<ResponseResult> =>
	useAxios.post(`/mod/docker/com/batch_delete_php_ext_template`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取默认页面配置
 */
export const getDefaultViewConfig = (data: { default_type: 'all' | 'index' | '404' | 'not_found' | 'stop' }) => useAxios.post('/mod/docker/com/get_default_body', { data, customType: 'model', check: 'object' })

/**
 * @description 设置默认页面配置
 */
export const setDefaultViewConfig = (data: AnyObject) => useAxios.post('/mod/docker/com/set_default_body', { data, customType: 'model', check: 'msg' })

/**
 * @description 设置404页面状态
 */
export const set404ViewStatus = (data: { auto_create: '1' | '0' }) => useAxios.post('/mod/docker/com/set_auto_create_404', { data, customType: 'model', check: 'msg' })

/**
 * @description 获取默认站点
 */
export const getDefaultSite = () => useAxios.post('/mod/docker/com/get_default_site', { customType: 'model', check: 'object' })

/**
 * @description 设置默认站点
 */
export const setDefaultSite = (data: { site_name: string }) => useAxios.post('/mod/docker/com/set_default_site', { data, customType: 'model', check: 'msg' })

/**
 * @description 获取HTTPS防窜站
 */
export const getHttpsMode = () => useAxios.post('site/get_https_mode', { check: 'boolean' })
/**
 * @description 获取HTTPS管理信息
 */
export const getHttpsInfo = () => useAxios.post('site/get_https_settings', { check: 'object' })

/**
 * @description 设置全局HTTP2HTTPS
 */
export const setGlobalHttp2https = (data: { status: 1 | 0 }) => useAxios.post('site/set_global_http2https', { data, check: 'msg' })
/**
 * @description 设置HTTPS防窜站
 */
export const setHttpsMode = () => useAxios.post('site/set_https_mode', { check: 'msg' })

/**
 * @description 获取docker网站分类列表
 */
export const getCateList = () => useAxios.post('/mod/docker/com/get_site_types', { customType: 'model', check: 'msg' })
/**
 * @description 新增、编辑分类
 */
export const setCate = (data: { name: string; id?: string }) => useAxios.post(`/mod/docker/com/${data.id ? 'edit_site_type' : 'add_site_type'}`, { data, customType: 'model', check: 'msg' })
/**
 * @description 删除分类
 */
export const delCate = (data: { id: string }) => useAxios.post('/mod/docker/com/del_site_type', { data, customType: 'model', check: 'msg' })
/**
 * @description 网站设置分类
 */
export const setDockerSiteCate = (data: { id: string; classify: string }) => useAxios.post('/mod/docker/com/set_site_type', { data, customType: 'model', check: 'msg' })

/**
 * @description 获取网站域名
 */
export const getDockerSiteDomains = (data: { id: string; site_name: string }) => useAxios.post('/mod/docker/com/get_domain_list', { data, customType: 'model', check: 'msg' })

/**
 * @description 为指定网站添加域名
 */
export const addDockerSiteDomain = (data: { id: string; site_name: string; domains: string }) => useAxios.post('/mod/docker/com/add_domain', { data, customType: 'model', check: 'msg' })

/**
 * @description 删除、批量删除网站域名
 */
export const delDockerSiteDomain = (data: DockerSiteDeleteDomainProps | DockerSiteBatchDeleteDomainProps) => useAxios.post(`/mod/docker/com/${!!data.del_domain_list ? 'batch_del_domain' : 'del_domain'}`, { data, customType: 'model', check: 'msg' })

/**
 * @description 设置指定网站https端口
 */
export const setDockerSiteHttpsPort = (data: { site_name: string; https_port: string }) => useAxios.post('/mod/docker/com/set_https_port', { data, customType: 'model', check: 'msg' })

/**
 * @description 添加网站项目url代理
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const addProxyUrlData = (data: { site_name: string; proxy_path: string; proxy_pass: string; proxy_host: string; proxy_type: string; remark?: string }) =>
	useAxios.post('/mod/docker/com/add_proxy', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 添加网站项目url代理内容替换
 */
export const addProxyUrlReplace = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	oldstr: string
	newstr: string
	proxy_path: string
	sub_type: string
}) =>
	useAxios.post('/mod/docker/com/add_sub_filter', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 删除网站项目url代理
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const delProxyUrlData = (data: { site_name: string; proxy_path: string }) =>
	useAxios.post('/mod/docker/com/del_url_proxy', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 删除网站项目url代理内容替换
 */
export const delProxyUrlReplace = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	oldstr: string
	newstr: string
	proxy_path: string
}) =>
	useAxios.post('/mod/docker/com/del_sub_filter', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 添加网站项目url代理
 */
export const editProxyUrlDataRemark = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	// eslint-disable-next-line @typescript-eslint/naming-convention
	proxy_path: string
	remark: string
}) =>
	useAxios.post('/mod/docker/com/set_url_remark', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 编辑网站项目url代理
 */
export const editProxyUrlInfo = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	proxy_path: string
	proxy_host: string
	proxy_pass: string
	proxy_type: string
	websocket: number
	proxy_connect_timeout: string
	proxy_send_timeout: string
	proxy_read_timeout: string
	remark?: string
}) =>
	useAxios.post('/mod/docker/com/set_url_proxy', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取网站项目url信息
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const getProxyUrlData = (data: { site_name: string; proxy_path?: string }) =>
	useAxios.post('/mod/docker/com/get_proxy_list', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 添加网站项目url代理ip黑白
 */
export const proxyUrlAddLimit = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	proxy_path: string
	ip_type: string
	ips: string
}) =>
	useAxios.post('/mod/docker/com/add_url_ip_limit', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 批量删除网站项目url代理ip黑白
 * @param { string } data.site_name 站点名称
 * @param { string } data.proxy_path 反向代理路径
 * @param { string } data.ip_type ip类型 // black/white;
 * @param { string } data.ips ip列表 // 多个ip换行
 */
export const proxyUrlBatchDelLimit = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	proxy_path: string
	ip_type: string
	ips: string
}) =>
	useAxios.post('/mod/docker/com/batch_del_url_ip_limit', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 设置网站项目url代理缓存
 */
export const proxyUrlCache = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	// eslint-disable-next-line @typescript-eslint/naming-convention
	proxy_path: string
	// eslint-disable-next-line @typescript-eslint/naming-convention
	cache_status: number
	expires?: string
}) =>
	useAxios.post('/mod/docker/com/set_url_cache', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 设置网站项目url代理内容压缩
 */
export const proxyUrlCompress = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	proxy_path: string
	gzip_status: number
	gzip_min_length: string
	gzip_comp_level: string
	gzip_types: string
}) =>
	useAxios.post('/mod/docker/com/set_url_gzip', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 删除网站项目url代理ip黑白
 * @param { string } data.site_name 站点名称
 * @param { string } data.proxy_path 反向代理路径
 * @param { string } data.ip_type ip类型 // black/white;
 * @param { string } data.ip ip地址
 */
export const proxyUrlDelLimit = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	proxy_path: string
	ip_type: string
	ip: string
}) =>
	useAxios.post('/mod/docker/com/del_url_ip_limit', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 设置网站项目url代理自定义配置
 */
export const setProxyUrlCustom = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	custom_conf: string
	proxy_path: string
}) =>
	useAxios.post('/mod/docker/com/set_url_custom_conf', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 清理反向代理缓存
 * @param {} data
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const clearProxyCache = (data: { site_name: string }) =>
	useAxios.post('/mod/docker/com/clear_cache', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取反向代理网站项目全局配置信息
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const proxyGetGlobal = (data: { site_name: string }) =>
	useAxios.post('/mod/docker/com/get_global_conf', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 添加反向代理网站项目全局代理basicauth
 */
export const proxyGlobalAddBasic = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	auth_path: string
	username: string
	password: string
	name: string
}) =>
	useAxios.post('/mod/docker/com/add_dir_auth', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 添加反向代理网站项目全局ip黑白
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const proxyGlobalAddLimit = (data: { site_name: string; ip_type: string; ips: string }) =>
	useAxios.post('/mod/docker/com/add_ip_limit', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 批量删除反向代理网站项目全局ip黑白
 * @param { string } data.site_name 站点名称
 * @param { string } data.ip_type ip类型 // black/white;
 * @param { string } data.ips ip列表 // 多个ip换行
 */
export const proxyGlobalBatchDelLimit = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	ip_type: string
	ips: string
}) =>
	useAxios.post('/mod/docker/com/batch_del_ip_limit', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 设置反向代理网站项目全局代理缓存
 */
export const proxyGlobalCache = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	cache_status: number
	expires: string
}) =>
	useAxios.post('/mod/docker/com/set_global_cache', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 设置反向代理网站项目全局代理内容压缩
 */
export const proxyGlobalCompress = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	gzip_status: number
	gzip_min_length: string
	gzip_comp_level: string
	gzip_types: string
}) =>
	useAxios.post('/mod/docker/com/set_global_gzip', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 删除反向代理网站项目全局代理basicauth
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const proxyGlobalDelBasic = (data: { site_name: string; auth_path: string; name: string }) =>
	useAxios.post('/mod/docker/com/del_dir_auth', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 删除反向代理网站项目全局ip黑白
 * @param { string } data.site_name 站点名称
 * @param { string } data.ip_type ip类型 // black/white;
 * @param { string } data.ips ip列表 // 多个ip换行
 */
export const proxyGlobalDelLimit = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	ip_type: string
	ip: string
}) =>
	useAxios.post('/mod/docker/com/del_ip_limit', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 编辑反向代理网站项目全局代理basicauth
 */
export const proxyGlobalEditBasic = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	auth_path: string
	username: string
	password: string
	name: string
}) =>
	useAxios.post('/mod/docker/com/set_dir_auth', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 设置反向代理网站项目全局日志配置
 * @param { string } data.site_name 站点名称
 * @param { string } data.log_type 日志类型 // default/file/rsyslog/off
 * @param { string } data.log_path 日志路径 // 如果log_type是file，只能传目录，/www/wwwlogs这样；如果log_type是rsyslog，则log_path传ip
 */
export const proxyGlobalSetLogs = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	log_type: string
	log_path: string
}) =>
	useAxios.post('/mod/docker/com/set_global_log', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 设置反向代理网站项目全局websocket
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const proxyGlobalSetWebsocket = (data: { site_name: string; websocket_status: number }) =>
	useAxios.post('/mod/docker/com/set_global_websocket', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取反向代理网站项目配置文件
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const getProxyConfigFile = (data: { site_name: string }) =>
	useAxios.post('/mod/docker/com/get_nginx_config', {
		data,
		check: 'object',
		customType: 'model',
	})
/**
 * @description 保存反向代理网站项目配置文件
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const saveProxyConfigFile = (data: { site_name: string; conf_type: string; body: string }) =>
	useAxios.post('/mod/docker/com/save_block_config', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 创建反向代理网站项目重定向
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const createRedirect = (data: { redirecttype: string; site_name: string; domainorpath: string; redirectpath: string; tourl: string; redirectdomain: string; redirectname: string }) =>
	useAxios.post('/mod/docker/com/CreateRedirect', {
		data,
		check: 'msg',
		customType: 'model',
	})
/**
 * @description 编辑反向代理网站项目重定向
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const modifyRedirect = (data: { redirecttype: string; site_name: string; domainorpath: string; redirectpath: string; tourl: string; redirectdomain: string; redirectname: string; type: '0' | '1' }) =>
	useAxios.post('/mod/docker/com/ModifyRedirect', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 删除反向代理网站项目重定向
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const removeRedirect = (data: { site_name: string; redirectname: string }) =>
	useAxios.post('/mod/docker/com/DeleteRedirect', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取向代理网站项目重定向配置文件
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const getRedirectFile = (data: { path: string }) =>
	useAxios.post('/mod/docker/com/GetRedirectFile', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 获取防盗链
 */
export const getSecurity = (data: AnyObject) => useAxios.post('/mod/docker/com/GetSecurity', { data, customType: 'model', check: 'object' })

/**
 * @description
 */
export const setSecurity = (data: AnyObject) => useAxios.post('/mod/docker/com/SetSecurity', { data, customType: 'model', check: 'msg' })

/**
 * @description 获取docker网站日志
 */
export const getSiteLog = (data: { site_name: string; type: 'access' | 'error' }) => useAxios.post('/mod/docker/com/GetSiteLogs', { data, customType: 'model', check: 'msg' })

/**
 * @description 删除伪静态模板
 */
export const delRewriteTel = (data: AnyObject) => useAxios.post('site/DelRewriteTel', { data, check: 'msg' })

/**
 * @description 获取伪静态列表
 */
export const getRewriteLists = (data: { siteName: string }) => useAxios.post('site/GetRewriteList', { data, check: 'object' })
/**
 * @description 伪静态规则列表
 */
export const getRewrite = (data: { site_name: string }) => useAxios.post('/mod/docker/com/get_site_rewrite', { data, customType: 'model', check: 'msg' })

/**
 * @description 设置伪静态模板
 */
export const setRewriteTel = (data: AnyObject) => useAxios.post('site/SetRewriteTel', { data, check: 'msg' })
/**
 * @description 设置伪静态
 */
export const setRewrite = (data: { site_name: string; rewrite_conf: string }) => useAxios.post('/mod/docker/com/set_site_rewrite', { data, customType: 'model', check: 'msg' })

/**
 * @description 获取指定网站404页面的内容
 */
export const get404Content = (data: { site_name: string }) => useAxios.post('/mod/docker/com/get_404_body', { data, customType: 'model' })

/**
 * @description 设置指定网站404页面的开启状态
 */
export const set404Status = (data: { site_name: string; status: '1' | '0' }) => useAxios.post('/mod/docker/com/set_404_status', { data, customType: 'model', check: 'msg' })

/**
 * @description 设置指定网站404页面的内容
 */
export const set404Content = (data: { site_name: string; file_body: string; encoding: string }) => useAxios.post('/mod/docker/com/set_404_body', { data, customType: 'model', check: 'msg' })

/**
 * @description 设置指定网站ipv6状态
 */
export const seIpv6Status = (data: { site_name: string; ipv6_status: '1' | '0' }) => useAxios.post('/mod/docker/com/set_site_ipv6', { data, customType: 'model', check: 'msg' })

/**
 * @description 获取指定网站的网站目录
 */
export const getDockerSiteDir = (data: { id: number }) => useAxios.post('/mod/docker/com/get_site_path', { data, customType: 'model', check: 'msg' })

/**
 * @description 设置指定网站的网站目录
 */
export const setDockerSiteDir = (data: { id: number; path: string; site_name: string }) => useAxios.post('/mod/docker/com/set_site_path', { data, customType: 'model', check: 'msg' })

/**
 * @description 获取指定网站的运行目录
 */
export const setDockerSiteRunDir = (data: { id: number; run_path: string; site_name: string }) => useAxios.post('/mod/docker/com/set_site_run_path', { data, customType: 'model', check: 'msg' })

/**
 * @description 获取指定网站的防跨站和子目录
 */
export const getDockerSiteDirUserINI = (data: { id: number }) => useAxios.post('/mod/docker/com/GetDirUserINI', { data, customType: 'model', check: 'msg' })

/**
 * @description 设置指定网站的防跨站
 */
export const setDockerSiteini = (data: { id: number; status: 1 | 0 }) => useAxios.post('/mod/docker/com/SetDirUserINI', { data, customType: 'model', check: 'msg' })

/**
 * @description 获取指定网站PHP版本信息
 */
export const getDockerSitePhp = (data: { id: number }) => useAxios.post('/mod/docker/com/get_php_project_info', { data, customType: 'model', check: 'msg' })

/**
 * @description 切换指定网站的PHP版本
 */
export const setDockerSitePhp = (data: { id: number; runtime_name: string }) => useAxios.post('/mod/docker/com/switch_php_version', { data, customType: 'model', check: 'msg' })

/**
 * @description 设置指定网站的buffer
 */
export const setDockerSiteBuffer = (data: { site_name: number; proxy_path: string; status: 0 | 1 }) => useAxios.post('/mod/docker/com/set_proxy_buffering', { data, customType: 'model', check: 'msg' })

/**
 * @description 获取指定网站的buffer
 */
export const getDockerSiteBuffer = (data: { site_name: number }) => useAxios.post('/mod/docker/com/get_proxy_buffering', { data, customType: 'model', check: 'msg' })

/**
 * @description 应用mysql改密
 */
export const updateDockerMysqlPassword = (data: { id: string; mysql_path: string; mysql_pwd: string }) => useAxios.post('/mod/docker/com/update_mysql_pwd', { data, customType: 'model', check: 'msg' })

/**
 * @description 获取ollama模型列表
 */
export const getOllamaModelList = (data: { search: string; p: number; row: number }) => useAxios.post('/mod/docker/com/get_models_list', { data, customType: 'model', check: 'msg' })

/**
 * @description 获取ollama模型详情
 */
export const getOllamaModelDetail = (data: { model_name: string; model_version: string; service_name: string }) => useAxios.post('/mod/docker/com/show_model_info', { data, customType: 'model', check: 'msg' })

/**
 * @description 下载ollama模型
 */
export const downloadOllamaModel = (data: { model_name: string; service_name: string; model_version: string }) => useAxios.post('/mod/docker/com/down_models', { data, customType: 'model', check: 'msg' })

/**
 * @description 删除ollama模型
 */
export const delOllamaModel = (data: { model_name: string; service_name: string; model_version: string }) => useAxios.post('/mod/docker/com/del_models', { data, customType: 'model', check: 'msg' })

/**
 * @description 获取gpu系统信息
 */
export const getGpuSystemInformation = () => useAxios.post('/mod/docker/gpu/get_system_info', { customType: 'model', check: 'msg' })

/**
 * @description 获取GPU所有设备信息
 */
export const getAllGpuDeviceInformation = () => useAxios.post('/mod/docker/gpu/get_all_device_info', { customType: 'model', check: 'msg' })
/**
 * @description 通过索引查询GPU信息
 */
export const getGpuInfoByIndex = (data: { index: number }) => useAxios.post('/mod/docker/gpu/get_info_by_index', { data, customType: 'model', check: 'msg' })

/**
 * @description 获取数据库应用终端命令
 * @param {string} appname - 应用名称
 * @param {string} id - 应用容器id
 * @param {string} password - 应用密码
 * @returns {Promise<ResponseResult>}
 */
export const getDatabaseTerminalCmd = (data: { appname: string; id: string; password: string }) => useAxios.post('/mod/docker/com/client_db_shell', { data, customType: 'model', check: 'msg' })

/**
 * @description 设置docker参数
 */
export const setDockerGlobal = (data: any) => useAxios.post('/btdocker/setup/set_docker_global', { data, customType: 'model', check: 'msg' })

/**
 * @description 更新docker-compose版本
 */
export const updateDockerComposeVersion = () => useAxios.post('/btdocker/setup/update_compose', { customType: 'model', check: 'msg' })

/**
 * @description 获取apphub配置信息
 */
export const getDockerApphubConfig = () => useAxios.post('/mod/docker/com/get_apphub_config', { customType: 'model', check: 'msg' })

/**
 * @description 设置apphub git配置
 */
export const setDockerApphubGit = (data: { git_url: string; git_branch: string; password?: string; name?: string }) => useAxios.post('/mod/docker/com/set_apphub_git', { data, customType: 'model', check: 'msg' })

/**
 * @description 导入git apphub
 */
export const importGitApphub = () => useAxios.post('/mod/docker/com/import_git_apphub', { customType: 'model', check: 'msg' })

/**
 * @description 导入zip apphub
 */
export const importZipApphub = (data: { sfile: string[] }) => useAxios.post('/mod/docker/com/import_zip_apphub', { data, customType: 'model', check: 'msg' })

/**
 * @description 安装apphub
 */
export const installApphub = () => useAxios.post('/mod/docker/com/install_apphub', { customType: 'model', check: 'msg' })

/**
 * @description 设置应用商店目录
 */
export const setDockerProjectPath = (data: { path: string }) => useAxios.post('/btdocker/setup/set_dk_project_path', { data, customType: 'model', check: 'msg' })

/**
 * @description 解析zip apphub
 */
export const parserZipApphub = (data: { sfile: string }) => useAxios.post('/mod/docker/com/parser_zip_apphub', { data, customType: 'model', check: 'msg' })

/**
 * @description 获取应用compose文件
 * @returns { Promise }
 */
export const getAppComposeFile = (data: { app_name: string; gpu: boolean; appid: number }): Promise<ResponseResult> =>
	useAxios.post('/mod/docker/com/get_app_compose', {
		data,
		customType: 'model',
		check: 'object',
	})
