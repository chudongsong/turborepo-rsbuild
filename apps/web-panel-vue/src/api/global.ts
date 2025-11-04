/* eslint-disable @typescript-eslint/naming-convention */

import type { ResponseResult } from '@axios/types'
import { useAxios } from '@/hooks/tools'

/**
 * @description 获取公共配置信息
 * @returns { Promise<ResponseResult> }
 * @returns
 */
export const getPublicConfig = (): Promise<ResponseResult> =>
	useAxios.post('panel/public/get_public_config', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取全局配置信息
 * @returns { Promise<ResponseResult> }
 */
export const getConfigInfo = (): Promise<ResponseResult> => useAxios.post('config/get_config', { data: { status: true } })

/**
 * @description 获取企业版配置信息
 * @returns { Promise<ResponseResult> }
 */
export const getEnterpriseConfig = (): Promise<ResponseResult> =>
	useAxios.post('panel/public/get_exp_ltd', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取系统资源信息
 * @returns { Promise<ResponseResult> }
 */
export const getSystemInfo = (): Promise<ResponseResult> => useAxios.post('system/GetNetWork')

type GetDataParam = {
	p?: number
	table?: string
	limit?: number
	search?: string | number
	result?: string
	sid?: number | string
	tojs?: number | string
	type?: string
	list?: number | string
}

/**
 * @description 获取列表数据，支持网站，数据库，FTP，计划任务，备份列表
 * @param { number } data.p 页码
 * @param { string } data.table 数据来源
 * @param { number } data.limit 每页数量
 * @param { string } data.search 搜索关键字
 * @param { string } data.result 搜索结果
 * @returns { Promise<ResponseResult> }
 */
export const getDataInfo = (data: GetDataParam): Promise<ResponseResult> => useAxios.post('data/getData', { data })

/**
 * @description 获取列表数据，支持网站，数据库，FTP，计划任务，备份列表
 * @param { number } data.p 页码
 * @param { string } data.table 数据来源
 * @param { number } data.limit 每页数量
 * @param { string } data.search 搜索关键字
 * @param { string } data.result 搜索结果
 * @returns { Promise<ResponseResult> }
 */
export const getDataList = (data: GetDataParam): Promise<ResponseResult> =>
	useAxios.post('datalist/data/get_data_list', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 已安裝软件列表
 * @param { string } data.page 页数
 * @param { string } data.pre_page 每页数量
 * @returns { Promise<ResponseResult> }
 */
export const installedMsgList = (data: any): Promise<ResponseResult> =>
	useAxios.post('panel/msgbox/installed_msg_list', {
		data,
		customType: 'model',
	})
/**
 * @description 获取执行日志
 */
export const getExecLog = () => useAxios.post('files/GetExecLog', { check: 'string' })

/**
 * @description 获取任务列表
 * @param { string } data.status 任务状态
 * @returns { Promise<ResponseResult> }
 */
export const getTaskLists = (data: AnyObject): Promise<ResponseResult> => useAxios.post('task/get_task_lists', { data, check: 'array' })

/**
 * @description 取消任务
 * @param { string } data.id 任务ID
 * @returns { Promise<ResponseResult> }
 */
export const removeTask = (data: AnyObject): Promise<ResponseResult> => useAxios.post('task/remove_task', { data, check: 'msg' })

/**
 * @description 删除消息盒子任务
 * @param { { id: number } } data { id: 任务ID }
 */
export const removeTaskFile = (data: { id: number }) => useAxios.post('files/RemoveTask', { data, check: 'msg' })
type SetPsParam = {
	id: number
	ps: string
	table: string
}
/**
 * @description 设置备注
 * @param { number } data.id 数据ID
 * @param { string } data.ps 备注
 * @param { string } data.table 数据来源
 * @returns { Promise<ResponseResult> }
 */
export const setPs = (data: SetPsParam): Promise<ResponseResult> => useAxios.post('data/setPs', { data, check: 'msg' })

/**
 * @description 验证登录状态
 * @returns { Promise<ResponseResult> }
 */
export const checkLogin = (): Promise<ResponseResult> => useAxios.post('ajax/checkLogin')

/**
 * @description 重启面板
 * @returns { Promise<ResponseResult> }
 */
export const restartPanel = (): Promise<ResponseResult> => useAxios.post('system/ReWeb', { check: 'msg' })

/**
 * @description 修复面板
 * @returns { Promise<ResponseResult> }
 */
export const repairPanel = (): Promise<ResponseResult> => useAxios.post('system/RepPanel')

/**
 * @description 修复面板
 * @param { AnyObject } data force 是否修复，不传递则表示只检查，传1表示修复
 * @returns { Promise<any> }
 */
export const repairPanelNew = (data?: AnyObject) => useAxios.post('system/repair_panel', { data, check: 'object' })

/**
 * @description 更新日志
 * @returns { Promise<any> }
 */
export const getUpgradeLog = () => useAxios.post('system/get_upgrade_log', { check: 'ignore' })

/**
 * @description 服务管理
 * @param { string } data.name 服务器类型
 * @param { string } data.type 状态(stop停止)
 * @returns { Promise<ResponseResult> }
 */
export const serviceManage = (data: AnyObject): Promise<ResponseResult> => useAxios.post('system/ServiceAdmin', { data, check: 'msg' })

/**
 * @description 重启服务器
 * @returns { Promise<ResponseResult> }
 */
export const restartServer = (): Promise<ResponseResult> => useAxios.post('system/RestartServer')

/**
 * @description 获取服务器状态
 * @returns { Promise<ResponseResult> }
 */
export const getTotal = (): Promise<ResponseResult> => useAxios.post('system/GetSystemTotal', {})

/**
 * @description 获取测试版日志
 * @returns { Promise<ResponseResult> }
 */
export const getBetaLogs = (): Promise<ResponseResult> => useAxios.post('ajax/get_beta_logs')

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
 * @returns { Promise<ResponseResult> }
 */
export const bindBtUserName = (data: BindUserParam): Promise<ResponseResult> => useAxios.post('ssl/GetAuthToken', { data, check: 'msg' })

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
export const getBindCode = (data: GetCodeParam): Promise<ResponseResult> => useAxios.post('ssl/GetBindCode', { data })

/**
 * @description 获取面板历史版本
 * @returns { Promise }
 */
// export const histVersionInfo = () =>
// 	instance.jsonp(`https://www.bt.cn/Api/getUpdateLogs?type=${os}`)
export const histVersionInfo = (): Promise<ResponseResult> =>
	useAxios.post(`/panel/public/get_update_logs`, {
		check: 'array',
		customType: 'model',
	})
/**
 * @description 获取首页推荐软件列表
 * @returns { Promise }
 */
export const getSoftList = (): Promise<ResponseResult> => useAxios.post('ajax/GetSoftList')

/**
 * @description 获取软件列表
 * @param { string } data.name 软件名称
 * @param { string } data.version 软件版本
 * @param { string } data.type 软件类型
 * @param { string } data.id 软件ID
 * @returns
 */
export const installRecommendedSoft = (data: { sName: string; version: string; type: string; id: number; min_version: string | number }): Promise<ResponseResult> => useAxios.post('plugin/install_plugin', { data })

/**
 * @description 申请linux内测版
 * @returns { Promise }
 */
export const appleBeta = (): Promise<ResponseResult> => useAxios.post('ajax/apple_beta', { check: 'msg' })

/**
 * @description 切换linux正式版
 * @returns { Promise }
 */
export const toOfficial = (): Promise<ResponseResult> => useAxios.post('ajax/to_not_beta', { check: 'msg' })

/**
 * @description 获取任务消息数量
 * @returns { Promise }
 */
export const getTaskCount = (): Promise<ResponseResult> => useAxios.post('ajax/GetTaskCount')

/**
 * @description 显示进度
 */
export const getLines = (data: { num?: number; filename: string }) => {
	return useAxios.post(`ajax/get_lines`, {
		data,
		check: 'msg',
	})
}

/**
 * @description 更新面板
 * @param { boolean } data.check 请求是否检查更新
 * @param { string } data.toUpdate 是否更新面板
 * @returns { Promise }
 */
export const updatePanel = (data: { check?: boolean; toUpdate?: string } = {}): Promise<ResponseResult> => useAxios.post('ajax/UpdatePanel', { data, check: 'msg' })

/**
 * @description 获取面板更新状态或更新面板
 * @param { boolean } data.check 请求是否检查更新
 * @param { string } data.toUpdate 是否更新面板
 * @returns { Promise }
 */
export const getUpdateInfo = (data: { check?: boolean; toUpdate?: string } = {}): Promise<ResponseResult> => useAxios.post('ajax/UpdatePanel', { data, check: 'ignore' })

/**
 * @description 更新面板
 * @param { AnyObject } data force 是否修复，不传递则表示只检查，传1表示更新
 * @returns { Promise<any> }
 */
export const upgradePanelNew = (data?: AnyObject) => useAxios.post('system/upgrade_panel', { data, check: 'object' })

/**
 * @description 设置开发者模式
 * @returns { Promise }
 */
export const setDebug = (): Promise<ResponseResult> => useAxios.post('config/set_debug')
/**
 * @description 获取开发者模式
 * @returns { Promise }
 */
export const getDebug = (): Promise<ResponseResult> => useAxios.post('config/Get_debug')

/**
 * @description 获取授权信息
 * @returns { Promise }
 */
export const getAuthState = (): Promise<ResponseResult> => useAxios.post('ajax/get_pd')

/**
 * @description 获取实时任务列表
 * @param { number } data.status 状态
 * @returns { Promise }
 */
export const getTaskList = (data: AnyObject = { status: -3 }): Promise<ResponseResult> => useAxios.post('ajax/get_task_lists', { data })

/**
 * @description 获取产品购买信息
 * @returns { Promise } 返回值
 */
export const getPluginRemarks = (): Promise<ResponseResult> => useAxios.post('auth/get_plugin_remarks')

/**
 * @description 获取当前系统兼容抵扣券列表
 * @param { number } data.pid 产品ID
 * @returns { Promise } 返回值
 */
export const getVoucherPlugin = (data: { pid: number }): Promise<ResponseResult> => useAxios.post('auth/get_voucher_plugin', { data })

/**
 * @description 获取所有抵扣券列表
 * @param { number } data.pid 产品ID
 * @param { number } data.status 状态，0：未使用，1：已使用
 * @returns { Promise } 返回值
 */
export const getAllVoucherPlugin = (data: { pid: number; status: number }): Promise<ResponseResult> => useAxios.post('auth/get_all_voucher_plugin', { data })

/**
 * @description 使用抵扣券抵扣
 * @param { number } data.pid 产品ID
 */
export const createVoucherOrder = (data: { pid: number; code: string }): Promise<ResponseResult> => useAxios.post('auth/create_order_voucher_plugin', { data, check: 'object' })

/**
 * @description 获取优惠券列表
 */
export const getCoupons = (): Promise<ResponseResult> => useAxios.post('auth/get_coupons', { check: 'object' })

/**
 * @description 获取临时优惠券
 */
export const getApplyCopon = (): Promise<ResponseResult> => useAxios.post('auth/get_apply_copon', { check: 'object' })

/**
 * @description 获取产品周期价格
 * @param { number } data.pid 产品ID
 * @returns { Promise } 返回值
 */
export const getProductPrice = (data: { pid: number }): Promise<ResponseResult> => useAxios.post('auth/get_plugin_price', { data })

/**
 * @description 获取产品验证码等信息
 * @param { number } data.pid 产品ID
 * @param { number } data.cycle 周期
 * @param { number } data.source 来源
 * @param { number } data.num 台数
 * @returns { Promise } 返回值
 */
export const getProductBuyCode = (data: { pid: number; cycle: number; source: number; num: number; coupon?: string }): Promise<ResponseResult> => useAxios.post('auth/get_buy_code', { data, check: 'object' })

/**
 * @description 获取余额
 * @returns { Promise } 返回值
 */
export const getCredits = (data: { uid: number }): Promise<ResponseResult> => useAxios.post('auth/get_credits', { data, check: 'object' })

/**
 * @description 获取最后一次购买时间
 * @returns { Promise } 返回值
 */
export const getLastPaidTime = (data: { pid: number }): Promise<ResponseResult> => useAxios.post('auth/get_last_paid_time', { data, check: 'object' })

/**
 * @description 使用余额支付
 * @returns { Promise } 返回值
 */
export const createWithCreditByPanel = (data: { num: number; cycle: number; uid: number; pid: number; coupon?: string }): Promise<ResponseResult> => useAxios.post('auth/create_with_credit_by_panel', { data })

/**
 * @description 解绑授权
 * @returns { Promise } 返回值
 */
export const unbindAuthorization = (): Promise<ResponseResult> => useAxios.post('auth/unbind_authorization', { check: 'object' })

/**
 * @description 获取支付订单状态
 * @param { number } data.wxoid 订单ID
 * @returns { Promise } 返回值
 */
export const getPaymentStatus = (data: { wxoid: number; py_type?: string }): Promise<ResponseResult> => useAxios.post('auth/get_wx_order_status', { data, check: 'object' })

/**
 * @description 获取推荐内容
 * @returns { Promise } 返回值
 */
export const getRecommendContent = (): Promise<ResponseResult> => useAxios.post('ajax/get_pay_type')

/**
 * @description 获取选择目录列表
 * @param { string } data.path 路径
 * @param { boolean } data.disk 展示磁盘
 * @returns { Promise } 返回值
 */
export const getSelectDir = (data: { path: string; disk: boolean; search?: string }): Promise<ResponseResult> => useAxios.post('files/GetDir', { data })

/**
 * @description 创建文件/文件夹
 * @param { string } data.path 路径
 * @param { string } data.type 类型【File/Dir】
 * @returns { Promise } 返回值
 */
export const createSelectionfile = ({ type, path }: { path: string; type: string }): Promise<ResponseResult> => useAxios.post(`files/Create${type}`, { data: { path }, check: 'msg' })

/**
 * @description 获取插件配置页面
 * @param { string } data.name 插件名称
 * @returns { Promise } 返回值
 */
export const getPluginHtml = (data: { name: string }): Promise<ResponseResult> => useAxios.post('plugin/getConfigHtml', { data, check: 'string' })

/**
 * @description 获取插件权限
 * @param { string } data.name 插件名称
 * @returns { Promise } 返回值
 */
export const getPluginAuth = (name: string): Promise<ResponseResult> =>
	useAxios.post(`/plugin?action=a&name=${name}`, {
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取菜单列表
 * @returns { Promise } 返回值
 */
export const getMenuList = (): Promise<ResponseResult> => useAxios.post('config/get_menu_list', { check: 'array' })

/**
 * @description 设置面板菜单栏目显示状态
 * @param { Array<string> | string } data.hide_list 需要隐藏的菜单名
 * @returns { Promise }
 */
export const setHideMenuList = (data: AnyObject): Promise<ResponseResult> => useAxios.post('config/set_hide_menu_list', { data, check: 'msg' })

/**
 * @description 查找指定插件信息
 * @param { string } data.name 插件名称
 * @returns { Promise } 返回值
 */
export const getPluginInfo = (data: { sName: string }): Promise<ResponseResult> => useAxios.post('plugin/get_soft_find', { data, check: 'object' })

/**
 * @description 获取插件版本信息
 * @param { string } data.name 插件名称
 * @returns { Promise } 返回值
 */
export const inputPackageInfo = (data: { plugin_name: string; tmp_path: string; install_opt: string }): Promise<ResponseResult> => useAxios.post('plugin/input_package', { data, check: 'msg' })

/**
 * @description 获取插件版本信息
 * @param { string } data.name 插件名称
 * @param { string } data.tmp_path 插件临时路径
 * @returns { Promise } 返回值
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const inputZips = (data: { plugin_name: string; tmp_path: string }): Promise<ResponseResult> => useAxios.post('plugin/input_zip', { data, check: 'msg' })

/**
 * @description 获取插件版本信息
 * @param { string } data.name 插件名称
 * @returns { Promise } 返回值
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const getPluginUpgrades = (data: { plugin_name: string; show?: number }): Promise<ResponseResult> => useAxios.post('plugin/get_plugin_upgrades', { data, check: 'array' })

/**
 * @description 获取插件版本信息
 * @param { string } data.name 插件名称
 * @returns { Promise } 返回值
 */
export const getInstallPluginInfo = (data: { sName: string; version: string; min_version: string; type?: string }): Promise<ResponseResult> => useAxios.post('plugin/install_plugin', { data, check: 'object' })

/**
 * @description 获取软件下载进度
 * @param { string } plugin_name 插件名称
 * @returns { Promise } 返回值
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const getDownloadSpeed = (data: { plugin_name: string }): Promise<ResponseResult> => useAxios.post('plugin/get_download_speed', { data, check: 'object' })

// /**
//  * @description 创建第三方插件订单
//  * @param { string } data.name 插件名称
//  * @returns { Promise } 返回值
//  */
// export const createPluginOtherOrder = (data: {
// 	pid: number
// 	cycle: number
// 	type: number
// }): Promise<ResponseResult> => useAxios.post('auth/create_plugin_other_order', { data, check: 'ignore' })

// /**
//  * @description 获取更新提醒信息配置
//  * @param id
//  * @param name
//  */
// export const getUpdatePushConfig = ({ id, name }: { id: string; name: string }): Promise<ResponseResult> =>
// 	useAxios.post('push/get_push_config', { data: { id, name }, check: 'msg' })

/**
 * @description 获取告警配置
 * @param { string } data.id ID
 * @param { string } data.name 名称
 * @returns { Promise }
 */
export const getPanelPush = ({ id, name }: { id: string; name: string }): Promise<ResponseResult> =>
	useAxios.post('push/get_push_config', {
		data: { id, name },
		check: 'object',
	})

/**
 * @description 设置面板安全告警
 * @param { string } data.name 传值site_push
 * @param { number } data.id 时间戳
 * @param { AnyObject } data.data 表单数据
 * @returns { Promise }
 */
export const setPanelPush = (data: AnyObject): Promise<ResponseResult> => useAxios.post('push/set_push_config', { data, check: 'msg' })

/**
 * @description 设置更新提醒信息配置
 * @param data.type
 * @param data.title
 * @param data.url
 * @param data.atall
 * @param data.send
 * @param data.qq_mail
 * @param data.qq_stmp_pwd
 * @param data.hosts
 * @param data.port
 */
// eslint-disable-next-line camelcase
export const setMsgConfig = (type: string, data: AnyObject): Promise<ResponseResult> => {
	return useAxios.post(`config/set_msg_config&name=${type}`, {
		data,
		check: 'msg',
	})
}

/**
 * @description 忽略更新提醒
 * @param {string} version
 * @returns { Promise } 返回值
 */
export const ignoreVersion = ({ version }: { version: string }) => useAxios.post('ajax/ignore_version', { data: { version }, check: 'msg' })

/**
 * @description 获取msgFun
 * @param moduleName 模块名称
 * @param funName 嗯。。。大概是函数名称？
 * @param msg 消息
 */
export const getMsgFun = (moduleName: string, funName: string, msg?: string): Promise<ResponseResult> =>
	useAxios.post('config/get_msg_fun', {
		data: {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			module_name: moduleName,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			fun_name: funName,
			msg: msg || '',
		},
		check: 'msg',
	})

/**
 * @description 清空回收站
 */
export const clearRecycleBin = (): Promise<ResponseResult> =>
	useAxios.post('files/Close_Recycle_bin', {
		check: 'msg',
	})
/**
 * @description 获取回收站信息
 */
export const getRecycleData = (): Promise<ResponseResult> => useAxios.post('files/Get_Recycle_bin', { check: 'object' })

/**
 * @description 设置回收站状态
 */
export const setRecycleStatus = (data?: AnyObject): Promise<ResponseResult> => useAxios.post('files/Recycle_bin', { data, check: 'msg' })

/**
 * @description 获取插件信息
 * @param { number | string } data.type
 * @param { number | string } data.p 页码
 * @param { number | string } data.tojs
 * @param { number | string } data.force
 * @param { number | string } data.query
 * @param { number | string } data.row
 * @returns { Promise }
 */
export const getPrivilegeSoftList = (data?: AnyObject): Promise<ResponseResult> => useAxios.post('plugin/get_soft_list', { data })

// /**
//  * @description 提交问卷信息
//  */
// export const submitQuestionnaire = (data: AnyObject): Promise<ResponseResult> =>
// 	useAxios.post('config/write_nps', { data, check: 'msg' })

/**
 * @description 获取Nps问题集
 */
export const getNpsQuestion = (data: AnyObject) => useAxios.post('config/get_nps_new', { data, check: 'object' })

/**
 * @description 取消Nps访问
 */
export const ignoreNps = (data: any) => useAxios.post('config/stop_nps', { data, check: 'object' })
/**
 * @description 获取Nps问题集
 */
export const getNps = (data: AnyObject) =>
	useAxios.post('config/get_nps', {
		data: {
			version: '-1',
			product_type: data.productType,
			software_name: data.softwareName,
		},
	})
/**
 * @description 提交Nps问题集
 */
export const writeNpsQuestion = (data: AnyObject) => useAxios.post('config/write_nps_new', { data, check: 'object' })
/**
 * @description 获取Nps问题标签
 */
export const getNewNpsTag = (data: AnyObject) =>
	useAxios.post('config/get_nps_info', {
		check: 'msg',
		data,
	})

/**
 * @description 获取自定义模块
 */
export const getCustomModule = (data: AnyObject) => useAxios.post('plugin/get_make_args', { data })
/**
 * @description 添加自定义模块
 */
export const addCustomModule = (data: AnyObject) => useAxios.post('plugin/add_make_args', { data, check: 'msg' })
/**
 * @description 删除自定义模块
 */
export const delCustomModule = (data: AnyObject) => useAxios.post('plugin/del_make_args', { data, check: 'msg' })

/**
 * @description 设置自定义模块
 */
export const setCustomModule = (data: AnyObject) => useAxios.post('plugin/set_make_args', { data, check: 'msg' })

/**
 * @description 获取可领取的优惠卷
 */
export const getPaymentCouponList = () => useAxios.post('auth/get_coupon_list', { check: 'array' })

/**
 * @description 设置优惠卷提醒时间
 */
export const ignoreCouponTime = (data: AnyObject) => useAxios.post('auth/ignore_coupon_time', { data, check: 'msg' })

/**
 * @description 删除单个搜索历史
 * @param { AnyObject } data.name 搜索历史名称
 * @param { AnyObject } data.key 搜索历史类型
 * @param { AnyObject } data.val 搜索历史值
 * @returns { Promise<ResponseResult> }
 */
export const removeSearchHistory = (data: AnyObject): Promise<ResponseResult> =>
	useAxios.post('panel/history/remove_search_history', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 清楚所有搜索历史
 * @param { AnyObject } data.name 搜索历史名称
 * @param { AnyObject } data.key 搜索历史类型
 * @returns { Promise<ResponseResult> }
 */
export const clearSearchHistory = (data: AnyObject): Promise<ResponseResult> =>
	useAxios.post('panel/history/clear_search_history', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置表格头部
 */
export const setTableHeader = (data: AnyObject) => useAxios.post('config/set_table_header', { data, check: 'msg' })

/**
 * @description 获取表格头部
 */
export const getTableHeader = (data: AnyObject) => useAxios.post('config/get_table_header', { data, check: 'object' })

/**
 * @description 获取登录状态
 */
export const getLoginStatus = () => useAxios.get('favicon.ico', { customType: 'model', check: 'msg' })

/**
 * @description 保存文件内容
 * @param { AnyObject } data
 * @returns { string } 文件内容
 */
export const saveFileBody = (data: AnyObject) =>
	useAxios.post('/files?action=SaveFileBody', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取备忘录文件内容
 * @returns { string } 文件内容
 */
export const getMemoBody = () =>
	useAxios.post('/config?action=get_memo_body', {
		customType: 'model',
		check: 'string',
	})

/**
 * @description 获取文件内容
 * @param { AnyObject } data.path 文件路径
 * @returns { string } 文件内容
 */
export const getFileContent = (data: { path: string }) => useAxios.post('/files?action=GetFileBody', { data, customType: 'model' })

/**
 * @description 获取文件内容
 * @returns { Promise }
 */
export const getFileBody = (data: { path: string }): Promise<ResponseResult> => useAxios.post('files/GetFileBody', { data })

/**
 * @description 获取消息详情
 *
 */
export const getMsgInfo = (data: { msg_id: number }): Promise<any> => useAxios.post('panel/msgbox/get_msg_info', { data, customType: 'model' })

/**
 * @description 获取文件属性
 * @param {string} data.filename 文件完整路径
 * @param {string} data.history 文件时间
 * @returns { Promise }
 */
export const reHistory = (data: any) => useAxios.post(`files/re_history`, { data, check: 'object' })

/**
 * @description
 */
export const getRewriteTel = (data: AnyObject) => useAxios.post('files/read_history', { data })

/**
 * @description 删除文件/文件夹
 * @param {String} path 删除文件/文件夹路径
 * @returns { Promise }
 */
export const deleteFile = (data: { path: string; type?: string }): Promise<ResponseResult> =>
	useAxios.post(`files/${data.type === 'dir' ? 'DeleteDir' : 'DeleteFile'}`, {
		data: { path: data.path },
		check: 'object',
	})

/**
 * @description 误报
 */
export const sendBaota = (data: AnyObject) => {
	return useAxios.post(`files/send_baota`, {
		data,
		check: 'msg',
	})
}

/**
 * @description 首页安装JDK
 */
export const installJDK = (data: any) =>
	useAxios.post('/project/java/install_jdk_new', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 安装jdk
 */
export const installNewJdk = (data: { version: string }) =>
	useAxios.post('/mod/java/project/install_jdk_new', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 创建文件目录
 * @param { { path: string } } data { path: 目录 }
 */
export const createDir = (data: { path: string }) => useAxios.post('files/CreateDir', { data, check: 'msg' })

/**
 * @description 一键修复风险项
 */
export const repairRisk = (data: AnyObject) =>
	useAxios.post('safe/security/set_security', {
		data,
		customType: 'model',
		check: 'object',
	})
/**
 * @description 设置忽略项
 * @param { { m_name: string } } data { m_name: 风险项名称 }
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const setIgnore = (data: { m_name: string }) => useAxios.post('warning/set_ignore', { data, check: 'msg' })

/**
 * @description 设置漏洞忽略项
 * @param { { cve_list: [string] } } data { cve_list: 漏洞编号列表 }
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const setIgnoreVul = (data: { cve_list: string }) => useAxios.post('warning/set_vuln_ignore', { data, check: 'msg' })

/**
 * @description 检测漏洞
 * @param data -{ cve_id: 漏洞编号}
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const checkVul = (data: { cev_id: string }) => useAxios.post('warning/check_cve', { data, check: 'msg' })

/**
 * @description 检测风险
 * @param { { m_name: string } } data { m_name: 风险项名称 }
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const checkFind = (data: { m_name: string }) => useAxios.post('warning/check_find', { data, check: 'msg' })

/**

/**
 * @description 设置告警配置
 * @param data
 * @returns
 */
export const setPushConfig = (data: AnyObject): Promise<ResponseResult> => useAxios.post('push/set_push_config', { data, check: 'msg' })

/**
 * @description 开关告警任务
 * @param { number } data.task_id 任务id
 * @returns { Promise }
 */
export const setTaskStatus = (data: AnyObject): Promise<any> =>
	useAxios.post('/mod/push/task/change_task_conf', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取系统告警下一步可设置项
 * @return
 */
export const getSystemConfigProjectList = (): Promise<ResponseResult> =>
	useAxios.post('panel/push/system_push_next', {
		customType: 'model',
		check: 'array',
	})

/**
 * @description 获取首页概览数据
 */
export const getOverview = () =>
	useAxios.post('panel/overview/GetOverview', {
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取首页概览模板数据
 */
export const getTemplateOverview = () =>
	useAxios.post('panel/overview/GetTemplateOverview', {
		check: 'object',
		customType: 'model',
	})

/**
 * @description 首页负载等弹出框数据信息
 */
export const getHomeResData = () =>
	useAxios.post('monitor/process_management/specific_resource_load_type', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取告警通道状态
 * @returns { Promise }
 */
export const getAlarmModule = (): Promise<ResponseResult> => useAxios.post('config/get_msg_configs')

/**
 * @description 获取告警列表
 * @returns { Promise }
 */
export const getPushList = (): Promise<ResponseResult> => useAxios.post('push/get_push_list', { check: 'object' })

/**
 * @description 获取告警配置
 * @returns
 */
export const getMsgConfigs = () => useAxios.post('config/get_msg_configs', {})

/**
 * @description 获取消息详情
 *
 */
export const delPushConfig = (data: { name: string; id: string }): Promise<ResponseResult> => useAxios.post('push/del_push_config', { data, check: 'msg' })

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
 * @description 设置告警状态
 * @param { string } data 告警名称
 *
 */
export const setPushStatus = (data: AnyObject): Promise<ResponseResult> => useAxios.post('push/set_push_status', { data, check: 'msg' })

/**
 * @description 获取云端服务器
 */
export const getCloudServer = (data?: AnyObject) => useAxios.post('database/GetCloudServer', { data, check: 'array' })

/**
 * @description 网站-获取扫描列表
 */
export const getScanList = () => useAxios.post('project/scanning/list', { customType: 'model' })

/**
 * @description 网站-获取网站分类
 */

export const getSiteTypes = (data?: AnyObject) => useAxios.post('site/get_site_types', { data, check: 'array' })

/**
 * @description 获取消息详情
 *
 */
export const getTaskTemplate = (): Promise<ResponseResult> =>
	useAxios.post('/mod/push/task/get_task_template_list', {
		check: 'msg',
		customType: 'model',
	})
/**
 * @description 解绑宝塔账号
 * @returns { Promise }
 */
export const delToken = (): Promise<ResponseResult> => useAxios.post('ssl/DelToken', { check: 'msg' })

/**
 * @description 获取消息盒子任务
 */
export const getTaskSpeed = () => useAxios.post('files/GetTaskSpeed')

/**
 * @description 安装消息模块
 * @param { string } name 消息模块名称
 * @returns { Promise }
 */
export const installAlarmModule = ({ name }: { name: string }): Promise<ResponseResult> => useAxios.post(`config/install_msg_module&name=${name}`, { check: 'msg' })

/**
 * @description 修改用户名
 * @param { number | string } data.username1 用户名
 * @param { number | string  } data.username2 重复输入的用户名
 * @return
 */
export const setUsername = (data: AnyObject) => useAxios.post('config/setUsername', { data, check: 'msg' })

/**
 * @description 获取状态
 */
export const getSoftStatus = (data: AnyObject) =>
	useAxios.post('/panel/public/get_soft_status', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 设置系统加固临时放行
 * @param {AnyObject} data - 参数说明{time:'当下时间戳'}
 */

export const setAtuoStartSyssafe = (data?: { time: number }) => useAxios.post('crontab/set_atuo_start_syssafe', { data, check: 'msg' })

/**
 * @description 修改密码
 * @returns { Promise<ResponseResult> }
 */
export const setPassword = (data: AnyObject): Promise<ResponseResult> => useAxios.post('config/setPassword', { data, check: 'msg' })

/**
 * @description 延用上一次密码
 * @returns { Promise<ResponseResult> }
 */
export const setlastPassword = (): Promise<ResponseResult> => useAxios.post('config/setlastPassword', { check: 'msg' })

/**
 * @description 获取证书列表
 */
export const getCertList = (data: AnyObject = {}): Promise<ResponseResult> =>
	useAxios.post('ssl/get_cert_list', {
		data,
		check: 'array',
	})

/**
@description 获取绑定告警账号
@returns { Promise }
*/
export const getSenderAlarmList = (data: { refresh: number }): Promise<ResponseResult> =>
	useAxios.post('/mod/push/msgconf/get_sender_list', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取新告警列表
 * @param { number } data.page 页码
 * @param { number } data.limit 条数
 * @param { string } data.status 状态
 * @param { string } data.keyword 关键词
 * @returns { Promise }
 */
export const getAlarmTaskList = (data?: AnyObject) =>
	useAxios.post('/mod/push/task/get_task_list', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 添加告警任务
@param { number | undefined } data.task_id? 任务id   编辑时传
@param { string } data.template_id 任务模板id
@param { string } data.task_data 任务数据（JSON数据）， task_data部分按模板来填写， sender为发送通道列表，number_rule为次数控制， time_rule为时间控制
@returns { Promise }
 */
export const setNewAlarmTask = (data: AnyObject) =>
	useAxios.post('/mod/push/task/set_task_conf', {
		data,
		check: 'msg',
		customType: 'model',
	})

export const upDateNewAlarmTask = (data: AnyObject) =>
	useAxios.post('/mod/push/task/update_task_status', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 设置短信告警状态
 * @param { string } data.sender_id 告警账号id
 * @returns { Promise }
 */
export const setSmsStatus = (data: { sender_id: string }): Promise<any> =>
	useAxios.post('/mod/push/msgconf/change_sendr_used', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 设置告警账号绑定状态
 * @param { string } data.sender_id 告警账号id
 * @returns { Promise }
 */
export const setBindStatus = (data: { sender_id: string }): Promise<any> =>
	useAxios.post('/mod/push/msgconf/change_sendr_used', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 单一账号测试告警
 * @param { string } data.sender_id 告警账号id
 * @returns { Promise }
 */
export const testBindAlarm = (data: { sender_id: string }): Promise<any> =>
	useAxios.post('/mod/push/msgconf/test_send_msg', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 通用解绑告警账号（微信公众号除外）
 * @param { string } data.sender_id 告警账号id
 * @returns { Promise }
 */
export const unBindCommonAccount = (data: { sender_id: string }): Promise<any> =>
	useAxios.post('/mod/push/msgconf/remove_sender', {
		data,
		check: 'msg',
		customType: 'model',
	})
/**
 * @description 解绑微信公众号
 * @param { string } data.sender_id 告警账号id
 * @returns { Promise }
 */
export const unBindWxAccount = (data: { sender_id: string }): Promise<any> =>
	useAxios.post('/mod/push/msgconf/unbind_wx_account', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 设置默认告警账号
 */
export const setDefaultSender = (data: { sender_id: string; sender_type: string }): Promise<any> =>
	useAxios.post('/mod/push/msgconf/set_default_sender', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取绑定微信二维码
 * @returns { Promise }
 */
export const getBindWxCode = (): Promise<any> =>
	useAxios.post('/mod/push/msgconf/wx_account_auth', {
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 添加、编辑告警账号（微信公众号、短信除外）
 * @param { string } data.sender_id 编辑的告警账号id
 * @param { string } data.sender_type 告警账号类型 weixin mail webhook feishu dingding
 * @param { string } data.sender_data 告警账号数据,JSON对象
 * @returns { Promise }
 */
export const setCommonAccount = (data: { sender_id?: string; sender_type: string; sender_data?: string }): Promise<any> =>
	useAxios.post('/mod/push/msgconf/set_sender_conf', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 修改FTP服务端口
 * @param { number } data.port 服务端口
 * @returns { Promise<ResponseResult> }
 */
export const editFtpPort = (data: { port: number }): Promise<ResponseResult> => useAxios.post('ftp/setPort', { data, check: 'msg' })

/**
 * @description 数据库 修复启动
 * @returns { Promise<ResponseResult> }
 */
export const getStartErrType = (): Promise<ResponseResult> => useAxios.post('database/GetStartErrType', { check: 'msg' })

/**
 * @description 数据库 修复启动
 * @returns { Promise<ResponseResult> }
 */
export const setInnodbRecovery = (data: { re_level: number }): Promise<ResponseResult> => useAxios.post('database/SetInnodbRecovery', { data, check: 'msg' })

/**
 * @description 查找php版本
 */
export const getPhpVersion = () => useAxios.post(`site/GetPHPVersion`)

/**
 * @description 获取phpmyadmin配置
 */
export const getPhpmyadminSsl = () => useAxios.post(`ajax/get_phpmyadmin_ssl`, { check: 'object' })

/**
 * @description 设置phpmyadmin配置
 */
export const setPhpmyadminSsl = (data: AnyObject) => useAxios.post(`ajax/set_phpmyadmin_ssl`, { data, check: 'msg' })

/**
 * @description 修改phpmyadmin端口
 */
export const changePhpmyadminSslPort = (data: AnyObject) => useAxios.post(`ajax/change_phpmyadmin_ssl_port`, { data, check: 'msg' })

/**
 * @description 设置phpmyadmin密码
 */
export const setPHPMyAdminPass = (data: AnyObject) => useAxios.post(`ajax/setPHPMyAdmin`, { data, check: 'msg' })

/**
 * @description 数据库容量修改请求
 */
export const getKey = (data: AnyObject) =>
	useAxios.post('data/getKey', {
		data,
		check: 'string',
	})
/**
 * @description docker或者docker-compose安装
 * @param { number } data.type 安装模式  0官方镜像源安装（推荐） 1二进制安装
 * @param { string } data.url 模式0时安装镜像源url
 * @returns { Promise }
 */
export const dokcerInstall = (data: AnyObject): Promise<any> =>
	useAxios.post('/btdocker/setup/install_docker_program', {
		data,
		customType: 'model',
		check: 'msg',
	})
/**
@description 判断第三方登录权限
@returns { Promise<{client,login}> }  Promise.client 服务商标识 0：宝塔账号，1：腾讯云，2：阿里云   Promise.login 授权登录方式 0：宝塔账号，1：一键登录，2：授权登录
 */
export const checkLoginAuth = (): Promise<any> =>
	useAxios.post('/ssl?action=GetCloudType', {
		loading: '正在获取面板消息',
		check: 'object',
		customType: 'model',
	})
/**
@description 第三方登录
@returns { Promise }
 */
export const tencentLogin = (data: any): Promise<any> =>
	useAxios.post('/ssl?action=AuthLogin', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
@description 获取第三方登录链接
@returns { Promise }
 */
export const getOtheAccreditURL = (data: any): Promise<any> => useAxios.post('/ssl?action=GetAuthUrl', { data, check: 'object', customType: 'model' })

/**
@description 备份弹窗不再弹出
@returns { Promise }
 */
export const setBackupPopup = (): Promise<any> =>
	useAxios.post('/mod/backup_restore/com/del_migrate_tips', {
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取微信授权URL
 */
export const getWechatAuthUrl = (): Promise<any> => useAxios.post('ssl/GetWechatAuthUrl', { data: {}, check: 'msg' })

/**
 * @description 设置微信授权绑定宝塔官网
 * @param { string } data.code 授权码
 * @param { string } data.state 状态
 */
export const setWechatBindUser = (data: { code: string; state: string }): Promise<any> => useAxios.post('ssl/SetWechatBindUser', { data, check: 'msg' })

/**
 * @description 获取用户信息
 */
export const getUserInfo = (): Promise<any> => useAxios.post('ssl/GetUserInfo', { data: {}, check: 'msg' })

/**
 * @description 设置通知忽略
 */

export const setNoticeIgnore = (data: { name: string }): Promise<any> => useAxios.post('config/SetNoticeIgnore', { data, check: 'msg' })

/**
 * @description 获取指定解绑产品次数
 */

export const getUnbindCount = (data: { pid: '100000032' | '100000011' | '100000068' }): Promise<any> => useAxios.post('auth/get_auth_bind_num', { data, check: 'msg' })

/**
 * @description 升级面板环境
 */

export const updatePanelEnv = (): Promise<any> => useAxios.post('system/upgrade_env', { check: 'msg' })

/**
 * @description 获取面板环境升级日志
 */

export const getUpdatePanelEnvLog = (): Promise<any> => useAxios.post('system/upgrade_env_log', { check: 'object' })
