export interface configStorePops {
	panelClose: boolean // 关闭面板
	listenIpv6: boolean // 监听IPv6
	offlineMode: boolean // 离线模式
	debugMode: boolean // 开发者模式
	apiInterface: boolean // API接口
	onlineService: boolean // 在线客服
	improvement: boolean // 用户体验改善计划
	// webname: string // 面板别名
	// sessionTimeout: string // 超时时间
	// sitesPath: string // 默认建站目录
	// backupPath: string // 默认备份目录
	// systemdate: string // 服务器时间
	panelAdmin: string // 面板账号
	panelPassword: string // 面板密码
	bindUserInfo: string // 绑定宝塔账号
	menuHideList: Array<string> | string // 面板菜单栏隐藏
	requestType: string // 面板云端请求方式
	requestIptype: string // 面板云端请求线路
	nodeConfig: string // 面板云端通讯节点配置
	panel: AnyObject
	panelAlarm: boolean // 面板安全告警
	panelSSl: boolean // 面板SSL
	basicAuth: boolean // BasicAuth认证
	checkTwoStep: boolean // 动态口令认证
	sslVerify: boolean // 访问设备验证
	pawComplexity: boolean // 密码复杂度验证
	statusCode: number | string // 未认证响应状态
	pawExpireTime: string // 密码过期时间
	setPanel: AnyObject // 面板配置
	wxAccount: boolean // 微信公众号窗口
	mail: boolean // 邮箱窗口
	dingDing: boolean // 钉钉窗口
	weiXin: boolean // 微信窗口
	sms: boolean // 短信窗口
	feiShu: boolean // 飞书窗口
	loading: any // 加载中-全局
}

export type MessageCenter = {
	create_time: number
	id: number
	level: number
	msg_types: string[]
	read: boolean
	read_time: number
	source: string[]
	sub_id: number
	sub_type: string
	title: string
}

export type AlarmPush = {
	id: string
	count: number
	cycle: number
	interval: number
	key: string
	module: string
	module_type: string
	project: string
	push_count: number
	status: boolean
	tid: string
	title: string
	to_user: { wx_account: string }
	type: string
	user_info: { wx_account: { default: { title: string; data: string } } }
	view_msg: string
	time: string
	mode: string
}

export type AlarmPushReq = {
	[key: string]: {
		[key: string]: AlarmPush
	}
}

export type AlarmSettingReq<T = AnyObject> = {
	[key: string]: AlarmSetting<T>
}

export type AlarmLog = {
	addtime: string
	id: number
	log: string
	type: string
	uid: number
	username: string
}

export interface RiskConfig {
	title?: string
	content: Array<string>
	isShowAppCode?: boolean
	checkTip?: string
	onConfirm: () => void
	onRefresh?: () => void
	onCancel?: () => void
}

export type ssslInfoType = {
	certPem: string
	download_root: boolean
	info: AnyObject
	privateKey: string
	rep: boolean
	root_password?: string
}

export type Template = {
	tid: string
	title: string
	type: string
	name: string
	field: Field[]
}

export type Field = {
	name: string
	type: string
	attr: string
	default: string | number
	value: string | number
	unit: string
	suffix: string
	list: string[]
	style: { [key: string]: string }
	items: { title: string; value: string; url?: string }[]
	disabled?: boolean
	width?: string
	default_show?: string
	show_format?: string
}

export type AlarmPush = {
	count: number
	cycle: number
	interval: number
	key: string
	module: string
	module_type: string
	project: string
	push_count: number
	status: boolean
	tid: string
	title: string
	to_user: { wx_account: string }
	type: string
	user_info: { wx_account: { default: { title: string; data: string } } }
	view_msg: string
	time: string
	mode: string
}

export type TemplateMap = {
	[key: string]: Template
}
