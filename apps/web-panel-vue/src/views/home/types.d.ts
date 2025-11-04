/**
 * @description 首页全局状态持久化
 */
export interface HomeStorePorps {
	recommendInstall: boolean // 推荐安装
	isRefreshData: number // 是否获取首页数据
	isRefreshOverview: boolean // 是否刷新概览
	// 展示系统信息
	systemInfo: {
		name: string
		simpleName: string
	}
	panelInfo: HomePanelInfo // 首页面板信息
	load: HomeLoadInfo //负载信息
	cpu: HomeCpuInfo // CPU信息
	cpuTimes: any // CPU详情
	memory: HomeMemoryInfo // 内存信息
	disk: HomeDiskItemInfo[] // 磁盘列表
	diskQuota: HomeDiskQuotaInfo[] // 磁盘配额
	recommendSoft: any[] // 推荐软件
	network: any[] // 流量
	diskIo: any[] // 磁盘io
	diskUsage: number[] // 磁盘使用情况
	refreshTime: number // 刷新时间
	overviewShowList: any // 模板信息
	specificResource: any // 特定资源
}

/**
 * @description 首页面板信息类型
 */
export interface HomePanelInfo {
	runningDays: number
	isBeta: boolean
	isUpgrade: boolean
	cloudBeta: boolean | string
	betaInfo: any
	officialInfo: any
	grayscale: any
	isSetup: boolean
	isRestart: boolean
}

/**
 * @description 首页负载信息
 */
export interface HomeLoadInfo {
	one: number // 一分钟负载
	max: number // 最大负载
	five: number // 五分钟负载
	fifteen: number // 十五分钟负载
}

/**
 * @description 首页CPU信息
 */
export interface HomeCpuInfo {
	occupy: string // 占用率
	framework: string // 框架
	coresOccupy: number[] // 三个核心的占用率
	cpuNumber: number // CPU数量
	logicCores: number // 逻辑核心
	cores: number // 物理核心
	process: number[] // 进程
}

/**
 * @description 首页内存信息
 */
export interface HomeMemoryInfo {
	memRealUsed: number // 已使用内存
	memTotal: number // 总内存
	memFree: number // 空闲内存
	memRealUsed: number // 已使用内存
	memShared: number // 共享内存
	memAvailable: number // 可用内存
	memBuffers: number // 缓冲区
	memCached: number // 缓存
	memNewRealUsed: string // 新的已使用内存
	memNewTotal: string // 新的总内存
	memNewTotalList: string[] // 新的已使用内存列表
	memNewRealUsedList: string[] // 新的已使用内存列表
}

/**
 * @description 磁盘item信息
 */
export interface HomeDiskItemInfo {
	show: boolean // 是否展示
	data: {
		filesystem: string // 文件系统
		inodes: string[] // inodes信息
		path: string // 磁盘挂载路径
		size: string[] // 磁盘大小,使用量,剩余量
		type: string // 磁盘类型
	}
	info: {
		title: string // 名称
		range: number // 范围，占用
		desc: string // 描述
	}
}

/**
 * @description 磁盘配额信息
 */
export interface HomeDiskQuotaInfo {
	diskName: string // 磁盘名称
	diskQuota: string // 磁盘配额
}

/**
 * @description 进程表格事件
 */
export interface ProcessTableEventProps {
	changeStatusEvent: (row: any) => void
	edit: (row: any) => void
	deleteRow: (row: any) => void
}

/**
 * @description 首页概览props
 */
export interface HomeOverviewProps {
	id: number // id
	name: string // 名称
	params: HomeOverviewItemParams[] // 概览参数
	repetition: boolean // 是否重复
	source: HomeStoreItemSource // 来源
	status: boolean // 状态，是否显示
	template: string // 模板
	title: string // 标题
	type: string // 类型
	value: number[] // 值
	plugin_info?: any // 插件信息
}

/**
 * @description 首页概览item参数
 */
export interface HomeOverviewItemParams {
	name: string // 名称
	source: string // 来源
}

/**
 * @description 首页概览store
 */
export interface HomeStoreItemSource {
	click: string // 点击
	href: string // 链接
}

/**
 * @interface HomeProps
 * @description 首页数据接口
 */
export interface HomeResCpuData {
	cpu_percent: string
	cwd_path: string
	exe_path: string
	explain: string
	important: number
	num_threads: number
	pid: number
	proc_name: string
	proc_survive: string
}
export interface HomeResMemoryData {
	memory_usage: string
	cwd_path: string
	exe_path: string
	explain: string
	important: number
	num_threads: number
	pid: number
	proc_name: string
	proc_survive: string
}
export interface HomeResInfo {
	active_processes: number
	cpu_name: string
	load_avg: { 1: number; 5: number; 15: number }
	logical_cpu: number
	num_phys_cores: number
	physical_cpu: number
	total_processes: number
}
/**
 * @interface HomeResData
 * @description 首页数据接口
 */
export interface HomeResData {
	CPU_high_occupancy_software_list: HomeResCpuData[]
	CPU_percentage_of_load: number
	info: HomeResInfo
	memory_high_occupancy_software_list: HomeResMemoryData[]
	percentage_of_memory_usage: number
	flag?: boolean
}

/**
 * @interface HomeTableProps
 * @description 首页弹出框表格数据事件接口
 */
export interface HomeTableEventProps {
	killEvent: (row: HomeResMemoryData | HomeResCpuData) => void
}

/**
 * @interface HomeTableProps
 * @description 首页全局数据
 */
export interface HomeStore {
	diskQuota: [
		{
			diskName?: string
			diskQuota?: number
		},
	]
	overviewStore: Array<any>
}

/**
 * @description 首页告警数据
 */
export interface AlarmDataProps {
	type: string
	data: any
	id: number
}
export interface Form {
	num: number
	usageRate: number
	give: string[]
	option: any
	type: any
	selectOptions: any[]
	typeDetection: string
	next_data: any[]
}

// 首页状态信息
export interface StateInfo {
	type: string
	title: string
	range: number
	desc?: string | { used: string; total: string; used_unit: string; total_unit: string }
	color?: string
	position?: 'top' | 'bottom' | 'left' | 'right' | 'auto' | 'auto-start' | 'auto-end' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'right-start' | 'right-end' | 'left-start' | 'left-end'
	rangeText?: string
	disabled?: boolean
}

// 告警推送
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
