/* eslint-disable @typescript-eslint/naming-convention */
let instance: any = null

/**
 * @description 设置实例
 * @param { any } axios axios实例
 * @returns { void }
 */
export const setAxios = (axios: any) => {
	instance = axios
}

/**
 * @description 获取阿里云api配置
 * @returns { Promise }
 */
export const getAliyunApiConfig = () => {
	return instance.post('aliyun/get_config', {
		check: 'msg',
		customType: 'plugin',
	})
}

/**
 * @description 设置阿里云api配置
 * @param { string } secretId secretId
 * @param { string } secretKey secretKey
 * @returns { Promise }
 */
export const setAliyunApiConfig = (data: { secretId: string; secretKey: string }) => {
	return instance.post('aliyun/set_config', {
		check: 'msg',
		customType: 'plugin',
		data,
	})
}

/**
 * @description 解绑阿里云api配置
 * @returns { Promise }
 */
export const unbindAliyunApiConfig = () => {
	return instance.post('aliyun/cancel_config', {
		check: 'msg',
		customType: 'plugin',
	})
}

/**
 * @description 获取阿里云服务器信息
 * @returns { Promise }
 */
export const getAliyunServerInfo = () => {
	return instance.post('aliyun/get_swas_info', {
		check: 'msg',
		customType: 'plugin',
	})
}

/**
 * @description 获取阿里云快照列表
 * @returns { Promise }
 */
export const getAliyunSnapshotsList = () => {
	return instance.post('aliyun/get_disk_snapshots_list', {
		check: 'msg',
		customType: 'plugin',
	})
}

/**
 * @description 创建阿里云快照
 * @param { string } snapshot_name 快照名称
 * @param { string } disk_id 磁盘id
 * @returns { Promise }
 */
export const createAliyunSnapshots = (data: { snapshot_name: string; disk_id: string }) => {
	return instance.post('aliyun/create_disk_snapshots', {
		check: 'msg',
		customType: 'plugin',
		data,
	})
}

/**
 * @description 删除阿里云快照
 * @param { string } snapshotId 快照id
 */
export const deleteAliyunSnapshots = (data: { snapshot_id: string }) => {
	return instance.post('aliyun/delete_disk_snapshots', {
		check: 'msg',
		customType: 'plugin',
		data,
	})
}

/**
 * @description 获取阿里云数据包信息
 * @param { string } instance_id 实例id
 * @returns { Promise }
 */
export const getAliyunDataPackageInfo = (data: { instance_id: string }) => {
	return instance.post('aliyun/get_request_pack', {
		check: 'msg',
		customType: 'plugin',
		data,
	})
}

/**
@description 第三方登录
@returns { Promise }
 */
export const tencentLogin = (data: any): Promise<any> =>
	instance.post('/ssl?action=AuthLogin', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
@description 获取第三方登录链接
@returns { Promise }
 */
export const getTencentURL = (data: any): Promise<any> => instance.post('/ssl?action=GetAuthUrl', { data, check: 'msg', customType: 'model' })

type GetCodeParam = {
	username: number | string
	token: string | number
}

/**
 * @description 获取验证码
 * @param { string | number } data.username 用户名
 * @param { string | number } data.token 账号验证Token
 * @returns { Promise }
 */
export const getBindCode = (data: GetCodeParam): Promise<any> => instance.post('ssl/GetBindCode', { data })

type BindUserParam = {
	username: string
	password: string
	code?: string | number
}
/**
 * @description 绑定BT用户
 * @param { string } data.username 用户名
 * @param { string } data.password 密码
 * @param { string | number } data.code 验证码
 * @returns { Promise<any> }
 */
export const bindBtUserName = (data: BindUserParam): Promise<any> => instance.post('ssl/GetAuthToken', { data, check: 'msg' })

/**
@description 判断第三方登录权限
@returns { Promise<{client,login}> }  Promise.client 服务商标识 0：宝塔账号，1：腾讯云，2：阿里云   Promise.login 授权登录方式 0：宝塔账号，1：一键登录，2：授权登录
 */
export const checkAliyunLoginAuth = (): Promise<any> =>
	instance.post('/ssl?action=GetCloudType', {
		loading: '正在获取面板消息',
		check: 'object',
		customType: 'model',
	})