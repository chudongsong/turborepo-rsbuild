/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/naming-convention */
import { useAxios } from '@/hooks/tools'
import { ResponseResult } from '@/types'

// 设置页面的临时代理

// const tempAgent = () => ({ url: { value: '/v2', replace: '/v2' }, agent: { https: true, ip: '192.168.66.131', port: '7800', key: 'VBX6JhkGDPM1AfNzoO8tHFxVx3O6d92u' } })

export type ResData = {
	status: boolean
	code: number
	msg: string
	error_msg: string
	data: Array<unknown> | null
}

export type AccountListParams = {
	p?: number
	rows?: number
	type_id?: number
	package_id?: number
	status?: number
	sort_key?: string
	sort_value?: string
	search_key?: string
	search_value?: string
}

/**
 * @description 获取用户列表
 */
export const getAccountListApi = (data?: AccountListParams): Promise<ResponseResult> => {
	return useAxios.post('/mod/virtual/virtual/get_account_list', { data, customType: 'model' })
}

type CreateAccountParams = {
	username: number | string
	password: number | string
	package_id: number | undefined
	email: string | number
	disk_space_quota: string | number
	monthly_bandwidth_limit: number | string
	max_site_limit: number | string
	max_email_account: number | string
	max_database: number | string
	expire_date: string | number
	php_start_children: number | string
	php_max_children: number | string
	status?: number
}
/**
 * @description 创建用户
 */
export const createAccountApi = (data: CreateAccountParams): Promise<ResponseResult> => {
	return useAxios.post('/mod/virtual/virtual/create_account', { data, customType: 'model' })
}

export type ModifyAccountParams = {
	account_id: number
} & Partial<CreateAccountParams>

export type AccountRow = ModifyAccountParams & {
	account_id: number
	status: number
	remark: string
	expire_date: string
	login_url?: string
	username: string
	email: string
	mountpoint: string
	init_password?: string
	disk_space_status: number
	disk_space_used: number
	disk_space_quota: number
	monthly_bandwidth_status: number
	monthly_bandwidth_used: number
	monthly_bandwidth_limit: number
}

/**
 * @description 修改用户
 * @param { ModifyAccountParams } data 用户信息
 */
export const modifyAccountApi = (data: ModifyAccountParams): Promise<ResponseResult> => {
	return useAxios.post('/mod/virtual/virtual/modify_account', { data, customType: 'model' })
}

/**
 * @description 获取指定用户
 * @param { number } data.account_id 用户ID
 */
export const getAccountInfoApi = (data: { account_id: number }): Promise<ResponseResult> => {
	return useAxios.post('/mod/virtual/virtual/get_account_info', { data, customType: 'model' })
}

/**
 * @description 删除用户信息
 * @param { number } data.account_id 用户ID
 * @param { boolean } data.is_del_resources 是否删除资源
 */
export const removeAccountApi = (data: { account_id: number; is_del_resources?: boolean }): Promise<ResponseResult> => {
	return useAxios.post('/mod/virtual/virtual/remove_account', { data, customType: 'model' })
}

/**
 * @description 获取分类列表
 */
export const getTypeListApi = (): Promise<ResponseResult> => {
	return useAxios.post('/mod/virtual/virtual/get_type_list', { customType: 'model' })
}

/**
 * @description 添加分类，参数转换
 * @param { string } ps 分类名称
 */
export const createTypeApi = ({ ps: name }: { ps: string }): Promise<ResponseResult> => {
	return useAxios.post('/mod/virtual/virtual/create_type', { data: { name }, customType: 'model' })
}

/**
 * @description 修改分类，参数转换
 * @param { string } data.ps 分类名称
 * @param { number } data.id 分类ID
 */
export const modifyTypeApi = ({ ps: name, id: type_id }: { ps: string; id: number }): Promise<ResponseResult> => {
	return useAxios.post('/mod/virtual/virtual/modify_type', { data: { name, type_id }, customType: 'model' })
}

/**
 * @description 删除分类，参数转换
 * @param { number } id 分类ID
 */
export const removeTypeApi = ({ id: type_id }: { id: number }): Promise<ResponseResult> => {
	return useAxios.post('/mod/virtual/virtual/remove_type', { data: { type_id }, customType: 'model' })
}

type GetPackageListParams = {
	p?: number
	rows?: number
	status?: number
	sort_key?: string
	sort_value?: string
	search_key?: string
	search_value?: string
}
/**
 * @description 获取资源包模板列表
 */
export const getPackageListApi = (data?: GetPackageListParams): Promise<ResponseResult> => {
	return useAxios.post('/mod/virtual/virtual/get_package_list', { data, customType: 'model' })
}

export type CreatePackageParams = {
	package_name: string | number
	disk_space_quota: string | number
	monthly_bandwidth_limit: string | number
	max_site_limit: string | number
	max_email_account: string | number
	max_database: string | number
	php_start_children: string | number
	php_max_children: string | number
	remark: string | number
}
/**
 * @description 创建资源包模板
 */
export const createPackageApi = (data: CreatePackageParams): Promise<ResponseResult> => {
	return useAxios.post('/mod/virtual/virtual/create_package', { data, customType: 'model' })
}

type ModifyPackageParams = {
	package_id: number
} & Partial<CreatePackageParams>
/**
 * @description 修改资源包模板
 */
export const modifyPackageApi = (data: ModifyPackageParams): Promise<ResponseResult> => {
	return useAxios.post('/mod/virtual/virtual/modify_package', { data, customType: 'model' })
}

/**
 * @description 获取指定资源包有哪些用户在使用
 */
export const getPackageUsedListApi = (data: { package_id: number }): Promise<ResponseResult> => {
	return useAxios.post('/mod/virtual/virtual/get_package_used_list', { data, customType: 'model' })
}

/**
 * @description 删除资源包
 */
export const removePackageApi = (data: { package_id: number }): Promise<ResponseResult> => {
	return useAxios.post('/mod/virtual/virtual/remove_package', { data, customType: 'model' })
}

/**
 * @description 获取指定资源包信息
 */
export const getPackageInfoApi = (data: { package_id: number }): Promise<ResponseResult> => {
	return useAxios.post('/mod/virtual/virtual/get_package_info', { data, customType: 'model' })
}

export type GetLogsParams = {
	p?: number
	rows?: number
	log_type?: string
	log_level?: string
	search?: string
}
/**
 * @description 获取操作日志列表
 */
export const getLogsApi = (data?: GetLogsParams): Promise<ResponseResult> => {
	return useAxios.post('/mod/virtual/virtual/get_logs', { data, customType: 'model' })
}

/**
 * @description 清空日志
 */
export const cleanLogsApi = (): Promise<ResponseResult> => {
	return useAxios.post('/mod/virtual/virtual/clean_logs', { customType: 'model' })
}

/**
 * @description 获取磁盘列表
 */
export const getDiskListApi = (): Promise<ResponseResult> => {
	return useAxios.post('/mod/virtual/virtual/get_disk_list', { customType: 'model' })
}

/**
 * @description 设置默认磁盘
 * @param { string } mountpoint 磁盘挂载点
 */
export const setDefaultDiskApi = (data: { mountpoint: string }): Promise<ResponseResult> => {
	return useAxios.post('/mod/virtual/virtual/set_default_disk', { data, customType: 'model' })
}
/**
 * @description 启用磁盘配额
 * @param { string } mountpoint 磁盘挂载点
 */
export const enableDiskQuotaApi = (mountpoint: string): Promise<ResponseResult> => {
	return useAxios.post('/mod/virtual/virtual/enable_disk_quota', { data: { mountpoint }, customType: 'model' })
}

/**
 * @description
 */
export const getAccountTempLoginTokenApi = (data: { account_id: number }): Promise<ResponseResult> => {
	return useAxios.post('/mod/virtual/virtual/get_account_temp_login_token', { data, customType: 'model' })
}

/**
 * @description 获取服务信息
 */
export const getServiceInfo = (): Promise<ResponseResult> => {
	return useAxios.post('/mod/virtual/virtual/get_service_info', { customType: 'model' })
}

/**
 * @description 设置服务状态
 */
export const setServiceStatus = (type: string, data = {}): Promise<ResponseResult> => {
	return useAxios.post(`/mod/virtual/virtual/${type}_service`, { data, customType: 'model' })
}

/**
 * @description 安装服务器
 */
export const installService = (data = {}): Promise<ResponseResult> => {
	return useAxios.post(`/mod/virtual/virtual/install_service`, { data, customType: 'model' })
}

/**
 * @description 获取安装日志
 */
export const getInstallLogs = (data = {}): Promise<ResponseResult> => {
	return useAxios.post(`/mod/virtual/virtual/get_install_log`, { data, customType: 'model' })
}

/**
 * @description 获取证书信息
 */
export const getServerSslApi = (): Promise<ResponseResult> => {
	return useAxios.post('/mod/virtual/virtual/get_server_ssl', { customType: 'model' })
}

/**
 * @description 保存证书信息
 * @param { string } certificate 证书
 * @param { string } private_key 私钥
 */
export const saveServerSslApi = (certificate: string, private_key: string): Promise<ResponseResult> => {
	return useAxios.post('/mod/virtual/virtual/save_server_ssl', { data: { certificate, private_key }, customType: 'model' })
}
/**
 * @description 关闭证书
 */
export const closeServerSslApi = (): Promise<ResponseResult> => {
	return useAxios.post('/mod/virtual/virtual/close_server_ssl', { customType: 'model' })
}

/**
 * @description 获取服务器地址
 */
export const getServerAddressApi = (): Promise<ResponseResult> => {
	return useAxios.post('/mod/virtual/virtual/get_server_address', { customType: 'model' })
}

/**
 * @description 设置服务器地址
 * @param { string } address 服务器地址
 */
export const setServerAddressApi = (address: string): Promise<ResponseResult> => {
	return useAxios.post('/mod/virtual/virtual/set_server_address', { data: { address }, customType: 'model' })
}

/**
 * @description 获取云端版本信息
 */
export const getCloudVersionApi = (): Promise<ResponseResult> => {
	return useAxios.post('/mod/virtual/virtual/get_cloud_version', { customType: 'model' })
}

/**
 * @description 更新版本
 */
export const updateServiceApi = (): Promise<ResponseResult> => {
	return useAxios.post('/mod/virtual/virtual/update_service', { customType: 'model' })
}
