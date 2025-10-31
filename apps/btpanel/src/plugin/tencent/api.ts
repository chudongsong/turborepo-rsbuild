// eslint-disable-next-line init-declarations
let instance: any

/**
 * @description 设置实例
 */
export const setInstance = (axiosInstance: any) => {
	instance = axiosInstance
}

/**
 * @description 获取腾讯专享版信息
 */
export const getTencentInfo = () => instance.post('tencent/get_config', { check: 'object', customType: 'plugin' })

/**
 * @description 获取腾讯专享版服务器信息
 */
export const getLocalLighthouse = (data?: AnyObject) => instance.post('tencent/get_local_lighthouse', { data, check: 'default', customType: 'plugin' })

/**
 * @description 获取腾讯专享版服务器流量信息
 */
export const getRequestPack = () => instance.post('tencent/get_request_pack', { check: 'object', customType: 'plugin' })

/**
 * @description 获取腾讯专享版服务器快照
 */
export const getSnapshotsList = () => instance.post('tencent/get_snapshots_list', { check: 'object', customType: 'plugin' })

/**
 * @description 获取腾讯专享版服务器快照
 */
export const getDiskSnapshotsList = () => instance.post('tencent/get_disk_snapshots_list', { check: 'object', customType: 'plugin' })

/**
 * @description 创建快照
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const createSnapshots = (data: { SnapshotName: string }) => instance.post('tencent/create_snapshots', { data, check: 'msg', customType: 'plugin' })

/**
 * @description 创建快照
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const createDiskSnapshots = (data: { SnapshotName: string }) => instance.post('tencent/create_disk_snapshots', { data, check: 'msg', customType: 'plugin' })

/**
 * @description 添加腾讯云api
 */
export const tencentSetConfig = (data: { appid: string; secretId: string; secretKey: string }) => instance.post('tencent/set_config', { data, check: 'msg', customType: 'plugin' })

/**
 * @description 删除快照
 * @param { { SnapshotId: string } } data { SnapshotId: 快照id }
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const deleteSnapshots = (data: { SnapshotId: string }) => instance.post('tencent/delete_snapshots', { data, check: 'msg', customType: 'plugin' })

/**
 * @description 删除快照
 * @param { { SnapshotId: string } } data { SnapshotId: 快照id }
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const deleteDiskSnapshots = (data: { SnapshotId: string }) => instance.post('tencent/delete_disk_snapshots', { data, check: 'msg', customType: 'plugin' })

/**
 * @description 获取腾讯云api
 * @returns { Promise }
 */
export const updateTencent = () => instance.post('tencent/update_tencent', { check: 'msg', customType: 'plugin' })

/**
 * @description 取消腾讯云api
 * @returns
 */
export const cancelConfig = () => instance.post('tencent/cancel_config', { check: 'msg', customType: 'plugin' })

/**
 * @description 获取腾讯云主机端口
 */
export const getTencentCloudPorts = () => {
	return instance.post(`tencent/get_firewall_rules`, {
		check: 'object',
		customType: 'plugin',
	})
}

/**
 * @description 删除腾讯云规则
 */
export const delTencentRule = (data: any) =>
	instance.post('/plugin?action=a&name=tencent&s=del_firewall_rules', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 添加腾讯云规则
 */
export const addTencentRule = (data: any) =>
	instance.post('/plugin?action=a&name=tencent&s=add_firewall_rules', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 查找指定插件信息
 * @param { string } data.name 插件名称
 * @returns { Promise } 返回值
 */
export const getPluginInfo = (data: { sName: string }): Promise<any> => instance.post('plugin/get_soft_find', { data, check: 'object' })

/**
 * @description 获取腾讯云cosfs挂载列表
 */
export const getUnmountedBuckets = () => {
	return instance.post(`cosfs/get_unmounted_buckets`, {
		check: 'msg',
		customType: 'plugin',
	})
}

/**
 * @description 添加cosfs本地挂载
 */
export const mountCosfs = (data: any) =>
	instance.post('/plugin?action=a&name=cosfs&s=mount_cosfs', {
		data,
		check: 'msg',
		customType: 'model',
	})

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
export const getTencentURL = (data: any): Promise<any> => instance.post('/ssl?action=GetAuthUrl', { data, check: 'object', customType: 'model' })

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
export const checkTencentLoginAuth = (): Promise<any> =>
	instance.post('/ssl?action=GetCloudType', {
		loading: '正在获取面板消息',
		check: 'object',
		customType: 'model',
	})