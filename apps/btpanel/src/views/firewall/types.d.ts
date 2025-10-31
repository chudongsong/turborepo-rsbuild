export interface IFirewalls {
	// 防火墙开关
	isFirewall: boolean
	// 禁ping开关
	isPing: boolean
	// ssh开关
	isSsh: boolean
	// ssh密码登录开关
	isSshPwd: boolean
	// ssh密钥登录开关
	isSshKey: boolean
	// ssh密钥登录开启
	isOpenSshKey: boolean
	// 入侵防御开关
	isIntrusion: boolean
	// 系统加固开关
	isSystem: boolean
	// 设置SSH密钥视图
	setSshKeyView: boolean
	// 设置SSH登录告警
	setSshLoginAlarm: boolean
	// 添加/修改端口规则
	addSafetyPort: boolean
	editSafetyPort: boolean
	// 导入规则
	importSafetyRule: boolean
	importIpRule: boolean
	importForwardRule: boolean
	importCountryRegionRule: boolean
	// 添加/修改IP规则
	addSafetyIp: boolean
	editSafetyIp: boolean
	// 添加/修改端口转发
	addSafetyForward: boolean
	editSafetyForward: boolean
	// 添加/修改地区规则
	addSafetyCountryRegion: boolean
	editSafetyCountryRegion: boolean
	// 系统加固编辑配置
	editSystem: boolean
	// 添加保护文件/目录
	addProtectFiles: boolean
	// 入侵防御打开命令日志
	openCommandLog: boolean
	// 入侵防御添加进程白名单
	addProcessWhite: boolean
	// 添加/编辑关键词监控
	editKeywordsMonitor: boolean
	// 自定义词库
	editKeywordsThesaurus: boolean
	// 立即检测
	keywordsCheckMontior: boolean
	// 修复计划任务
	keywordsRepairCrontab: boolean
	// 显示概览风险详情
	showOverviewRiskDetails: boolean
	// 显示监控列表风险详情
	showMonitorListRiskDetails: boolean
	// 显示检测历史风险详情
	showDetectionHistoryRiskDetails: boolean
	// 导入自定义词库
	importKeywordsThesaurus: boolean
	// 添加自定义词库
	addKeywordsThesaurus: boolean
	// 动态查杀开关
	isSpywareDetection: boolean
	// 添加监控目录
	addMonitorDir: boolean
	// 添加网站目录
	addWebsiteDir: boolean
	// 添加网站目录
	addSpecifyDir: boolean
	isPhpSiteStatus: boolean
}

export type StringObject = {
	[key: string]: string
}

// 端口表格数据参数
export interface PortTableDataProps {
	types: string
	status: number
	protocol: string
	id: number
	address: string
	addtime: string
	brief: string
	ports: string
	sid: number
	domain: string
}

// 端口表格事件参数
export interface PortTableEventProps {
	updatePolicy: (row: PortTableDataProps) => Promise<void>
	updataEvent: (row: PortTableDataProps) => Promise<void>
	deleteRow: (row: PortTableDataProps) => Promise<void>
	showPortDetails: (row: PortTableDataProps) => Promise<void>
	openTencentPort: (row: PortTableDataProps) => void
}

export const portsPs = reactive<StringObject>({
	'3306': 'MySQL服务默认端口',
	'888': 'phpMyAdmin默认端口',
	'22': 'SSH远程服务',
	'20': 'FTP主动模式数据端口',
	'21': 'FTP协议默认端口',
	'39000-40000': 'FTP被动模式端口范围',
	'30000-40000': 'FTP被动模式端口范围',
	'11211': 'Memcached服务端口',
	'873': 'rsync数据同步服务',
	'8888': '宝塔Linux面板默认端口',
})

// IP表格数据参数
interface AreaProps {
	carrier: string
	city: string
	continent: string
	country: string
	division: string
	en_country: string
	en_short_code: string
	info: string
	latitude: string
	longitude: string
	pronvince: string
	region: string
}

// 表格数据参数
export interface IpTableDataProps {
	types: string
	id: number
	address: string
	addtime: string
	area: AreaProps
	brief: string
}

// IP表格事件参数
export interface IpTableEventProps {
	updatePolicy: (row: IpTableDataProps) => Promise<void>
	updataEvent: (row: IpTableDataProps) => Promise<void>
	deleteRow: (row: IpTableDataProps) => Promise<void>
}

// 端口转发 表格数据参数
export interface ForwardTableDataProps {
	id: number
	addtime: string
	ended_ip: string
	ended_port: string
	protocol: string
	start_port: string
}

// 端口转发 表格事件参数
export interface ForwardTableEventProps {
	updataEvent: (row: ForwardTableDataProps) => Promise<void>
	deleteRow: (row: ForwardTableDataProps) => Promise<void>
}

// 地区表格数据参数
export interface CountryRegionTableDataProps {
	id: number
	ports: string
	types: string
	country: string
	brief: string
	addtime: string
}

// 地区表格事件参数
export interface CountryRegionTableEventProps {
	updataEvent: (row: CountryRegionTableDataProps) => Promise<void>
	deleteRow: (row: CountryRegionTableDataProps) => Promise<void>
}

// SSH登录日志表格数据参数
interface SshAreaProps {
	info: string
}

export interface SshLoginLogProps {
	address: string
	area: SshAreaProps
	port: string
	status: number
	time: string
	user: string
}

// 安全检测-木马查杀 表格数据参数
export interface TrojanTableDataProps {
	index: string
	open: boolean
	path: string
	ps: string
}

// 安全检测-木马查杀 表格事件参数
export interface TrojanTableEventProps {
	changeStatus: (row: TrojanTableDataProps) => Promise<void>
	setPsEvent: (row: TrojanTableDataProps) => Promise<void>
	scanRow: (row: TrojanTableDataProps) => Promise<void>
	deleteRow: (row: TrojanTableDataProps) => Promise<void>
}

// 违规词检测-概览
export const typeMap = reactive<StringObject>({
	title: '标题',
	body: '网页内',
	keywords: '关键词',
	descriptions: '描述',
	title_update: '标题更新',
	keywords_update: '关键词更新',
	description_update: '描述更新',
	tail_hash_update: '尾部script代码块更新',
	title_hash_update: '头部head代码块更新',
})

export const methodMap = reactive<StringObject>({
	1: '全站扫描',
	2: '快速扫描',
	3: '单URL',
})

// 风险动态表格数据参数
export interface RiskTableDataProps {
	id: number
	content: string
	new_content_file: string
	risk_content: string
	risk_type: string
	site_id: number
	site_name: string
	source_content_file: string
	source_file: string
	testing_id: string
	url: string
	time: number
}

// 风险动态表格事件参数
export interface RiskTableEventProps {
	showRiskDetails: (row: RiskTableDataProps) => Promise<void>
}

// 网站内容检测表格数据参数
export interface ContentTableDataProps {
	id: number
	end_time: number
	pid: number
	time: number
	site_name: string
	method: number
	risks: number
	scans: number
	site_id: number
	start_time: number
	testing_id: string
}

// 网站内容检测表格事件参数
export interface ContentTableEventProps {
	showFileEvent: (row: ContentTableDataProps) => Promise<void>
}

// 违规词检测-监控列表 表格数据参数
export interface MonitorTableDataProps {
	cron_id: number
	crontab_info: any
	crontab_status: number
	id: number
	is_local: number
	last_risk_count: number
	last_scan_time: any
	method: number
	name: string
	scan_config: any
	send_msg: number
	send_type: string
	site_name: string
	testing_id: string
	time: number
	url: string
}

// 违规词检测-监控列表 表格事件参数
export interface MonitorTableEventProps {
	getScanEvent: (row: MonitorTableDataProps) => Promise<void>
	updataRow: (row: MonitorTableDataProps) => Promise<void>
	deleteRow: (row: MonitorTableDataProps) => Promise<void>
}

// 违规词检测-检测历史 表格数据参数
export interface HistoryTableDataProps {
	id: number
	is_status: number
	pid: number
	site_id: number
	site_name: string
	scans: string
	start_time: number
	end_time: number
	time: number
	risks: number
	status: number
	testing_id: string
}

// 违规词检测-检测历史 表格事件参数
export interface HistoryTableEventProps {
	showHistoryDetails: (row: HistoryTableDataProps) => Promise<void>
	openHistoryReport: (row: HistoryTableDataProps) => Promise<void>
}

// PHP网站安全 - 首页列表数据接口
export interface PhpSiteTableDataProps {
	address: string
	addtime: number
	domain: string
	fun_name: string
	id: number
	intercept: string
	risk: number
	solution: string
	url: string
}

// 入侵防御 - 概览表格数据参数
interface totalProps {
	totla: number
	day_totla: number
}
export interface IntrusionOverviewTableDataProps {
	0: string
	1: string
	2: string
	3: boolean
	4: totalProps
	5: boolean
	6: string
}

// 入侵防御 - 概览表格事件参数
export interface IntrusionOverviewTableEventProps {
	changeIntrusion: (row: IntrusionOverviewTableDataProps, val: boolean) => Promise<void>
	changeOpen: (row: IntrusionOverviewTableDataProps, index: number, val: boolean) => Promise<void>
	getLogs: (row: IntrusionOverviewTableDataProps) => Promise<void>
}

// 入侵防御 - 进程白名单表格事件参数
export interface ProcessWhiteTableEventProps {
	deleteRow: (row: any) => Promise<void>
}

// 入侵防御 - 拦截日志表格数据参数
export interface InterceptLogTableDataProps {
	addtime: string
	log: string
}

// 系统加固 - 防护配置表格数据参数
export interface SystemTableDataProps {
	key: string
	name: string
	ps: string
	open: boolean
}

// 系统加固 - 防护配置表格事件参数
export interface SystemTableEventProps {
	changeOpen: (row: SystemTableDataProps, val: boolean) => Promise<void>
	updateRow: (row: SystemTableDataProps) => Promise<void>
}

// 系统加固 - 封锁IP表格数据参数
export interface SystemIpTableDataProps {
	address: string
	end: number
}

// 系统加固 - 封锁IP表格事件参数
export interface SystemIpTableEventProps {
	removeSshLimitEvent: (row: SystemIpTableDataProps) => Promise<void>
}

// 系统加固 - 操作日志表格数据参数
export interface SystemLogTableDataProps {
	id: number
	addtime: string
	log: string
	type: string
	uid: number
	username: string
}

// SSH管理 - 登录告警表格数据参数
export interface SshLoginAlarmTableDataProps {
	log: string
	addtime: string
}

// SSH管理 - 登录告警通知开关参数
export interface SshLoginAlarmSwitchProps {
	title: string
	name: string
	value: boolean
	setup?: boolean
	config?: boolean
}

// SSH管理 - 登录告警白名单表格数据参数
export interface SshLoginAlarmWhiteTableDataProps {
	ip: string
}

// SSH管理 - 登录告警白名单表格事件参数
export interface SshLoginAlarmWhiteTableEventProps {
	deleteRow: (row: SshLoginAlarmWhiteTableDataProps) => Promise<void>
}

// 安全检测 - 木马查杀 - 白名单表格数据参数
export interface TrojanWhiteTableDataProps {
	path: string
	type: string
	typeTitle: string
}

// 安全检测 - 木马查杀 - 白名单表格事件参数
export interface TrojanWhiteTableEventProps {
	deleteRow: (row: TrojanWhiteTableDataProps) => Promise<void>
}

// 安全检测 - 监控列表 - 自定义词库表格事件参数
export interface MonitorKeywordsTableEventProps {
	deleteRow: (row: any) => Promise<void>
}
