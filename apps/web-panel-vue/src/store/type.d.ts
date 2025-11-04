/**
 * @description: 全局store的类型
 * @default {GlobaStoreProps}
 */
export interface GlobaStoreProps {
	routerActive: string // 路由激活
	subrouteRouter: string // 子路由
	routesMenu: any[] // 菜单列表
	mainWidth: number // 主体宽度
	mainHeight: number // 主体高度
	iframezIndex: number // iframe层级
	isCompatible: boolean // 是否兼容模式
	isMenuCollapse: boolean // 菜单是否折叠
	isMenuCollapseAuto: boolean // 菜单是否自动折叠
	isMenuCollapseLock: boolean // 菜单是否锁定折叠
	isMenuMouserover: boolean // 菜单是否鼠标移入
	payment: GlobalStorePaymentProps // 支付相关信息
	panel: GlobalStorePanelProps // 面板相关信息
	tencent: GlobalStoreTencentProps // 腾讯专享版
	plugin: GlobalStorePluginProps // 服务器插件信息
	push: GlobalStorePushProps // 推送相关信息
	update: GlobalStoreUpdateProps // 更新相关信息
	pluginInfo: any // 插件视图信息
}

/**
 * @description: 面板相关信息
 */
export interface GlobalStorePanelProps {
	port: number // 端口
	initInstall: boolean // 是否初始化安装
	isDebug: boolean // 是否开启调试
	isFileRecycle: boolean // 是否开启文件回收站
	isDbRecycle: boolean // 是否开启数据回收站
	isShowCustomer: boolean // 是否显示客服
	sidebarTitle: string // 侧边栏标题
	msgBoxTaskCount: number // 消息盒子数量
	panelNps: boolean // NPS调查
	sitePath: string // 默认路径
	backupPath: string // 备份路径
	logsPath: string // 日志路径
}

/**
 * @description: 支付相关信息
 */
export interface GlobalStorePaymentProps {
	bindUser: string // 绑定用户
	authType: string // 授权类型
	recommendAuth: string // 推荐授权类型
	authExpirationTime: number // 授权到期时间
	voucherOpenTime: number // 优惠券开启时间
	newUserVoucherOpenTime: number // 新用户优惠券开启时间
	isGetCoupon: boolean // 是否获取优惠券
	isShowCoupon: boolean // 是否显示临时优惠券
}

export interface GlobalStoreUpdateProps {
	modulePush: any // 模块推送
	updatePush: boolean // 更新推送
	updateTaskId: string // 更新任务ID
}

/**
 * @description: 腾讯专享版
 */
export interface GlobalStoreTencentProps {
	isExclusive: boolean // 是否是腾讯专享版
	info: any // 腾讯专享版信息
}

/**
 * @description: 服务器信息
 */
export interface GlobalStorePluginProps {
	webserver: string // web服务器
	web: PluginInfoProps // 是否有web服务
	mysql: PluginInfoProps // 是否有mysql服务
	ftp: PluginInfoProps // 是否有ftp服务
	php: any[] // 是否有php服务
	phpmyadmin: PluginInfoProps // 是否有phpmyadmin服务
	memcached: PluginInfoProps // 是否有memcached服务
	redis: PluginInfoProps // 是否有redis服务
	tomcat: PluginInfoProps // 是否有tomcat服务
}

/**
 * @description: 插件信息
 */
export interface PluginInfoProps {
	status: boolean // 运行状态
	setup: boolean // 是否安装
	version?: string // 版本
	port?: number // 端口
	type?: string // 类型，仅web服务
	name?: string
	title?: string
}

/**
 * @description: 推送相关信息
 */
export interface GlobalStorePushProps {
	config: any // 推送配置
	info: any // 推送信息
	template: Array<AnyObject | boolean> // 推送模板
	alarmPopupData?: any // 告警数据
	checkedLoad: boolean // 告警方式复选框加载状态
}
