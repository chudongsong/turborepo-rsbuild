// ...软件商店store模块

export interface SoftStoreProps {
	tabActive: SoftTabsTypeProps // 当前tab
	tabTypeActive: number // 软件类型
	tabDeployActive: number // 一键部署tab栏类型
	showNpsCollect: boolean // 是否显示NPS收集
	isRefreshActiveList: boolean // 是否刷新活跃列表
	isRefreshForceList: boolean // 是否强制刷新活跃列表
	isLoading: boolean // 是否显示视图加载中
	inputZipFlag: boolean // 插件是否正在安装
	speedInstallView: boolean // 安装进度弹窗
	isResetDeployPage: boolean // 是否重置一键部署页码
	// softInstalling: boolean // 软件安装中
}

// ...软件tab类型
export type SoftTabsTypeProps = 'plugin' | 'other' | 'deployment'

// 软件历史选项
export interface SoftHistoryItemProps {
	time: number // 时间
	val: string // 值
}

// 软件搜索选项
export interface SoftSearchItemProps {
	name: string // tab的值
	ename: string // tab的label
}

// 软件类型选项
export interface SoftTypeItemProps {
	id: number // tab的id
	title: string // tab的title
}

// 软件推荐选项
export interface SoftRecommendItemProps extends SoftSearchItemProps {}

// 软件推荐项
export interface SoftPushItemProps {
	title: string
	plugin: SoftRecommendItemProps[]
}

// 软件列表选项
export interface SoftTableProps {
	p: number // 页码
	type: number // 类型
	tojs?: string // 意义不明,js回调，可以为空
	force: string // 是否强制
	query: string // 查询参数
	row: number // 每页显示条数
}

// 一键部署列表参数
export interface DeployTableProps {
	type: number // 类型
	search?: string // 查询参数
	force?: string // 是否强制
}

// 一键部署类型选项
export interface DeployTypeItemProps {
	tid: number // tab的id
	title: string // tab的title
}

// 一键部署列表页码
export interface DeployTablePageProps {
	total: number // 一键部署列表总数
	page: number // 一键部署视图列表页码
	limit: number // 一键部署视图列表每页显示条数
}

// 软件列表选项
export interface SoftTableRowProps {
	title: string // 标题
	is_beta: boolean // 是否beta
	version: string // 版本
	type: number // 软件类型
	name: string // 名称
	ename: string // 英文名称
	ps: string // 描述
	author: string // 作者
	setup: string // 安装命令
	score?: number // 评分，仅一键部署有
	route: string // 路由，用于模块跳转
	endtime: number // 到期时间
	pid: number // 软件id,仅付费软件有
	price: number // 价格,仅付费软件有
	status: number // 状态，仅环境软件有
	install_checks: string // 安装路径
	index_display: number // 是否首页显示
	id: number // 软件id
	preview_url: string // 预览地址
	task: string // 任务
	icon: string // 图标
	versions: SoftVersionRowProps[] // 版本列表
	admin: boolean // 是否管理员
	enable_functions: string // 是否启用函数
	php: string // PHP版本
	project_type: string // 项目类型
	java: string
	mysql: string
	[key: string]: any
}

export interface SoftVersionRowProps {
	m_version: string // 主版本
	beta: number // 是否beta
	version: string // 子版本
	ctime: number // 创建时间
	utime: number // 更新时间
}

// export interface SoftTableDataProps {
// 	list: SoftTableListProps[] // 软件列表
// 	Mlist: SoftTableListProps[] // 模块列表
// 	loading: boolean // 加载状态
// 	total: number // 总条数
// 	searchHistory: any[] // 搜索历史
// }

// export interface DeployTableDataProps {
// 	list: any[] // 软件列表
// 	showList: any[] // 分页后显示列表
// 	search: string // 搜索参数
// 	loading: boolean // 加载状态
// 	total: number // 总条数
// 	p: number // 页码
// 	limit: number // 每页显示条数
// }

interface delSoftParams {
	sName: string // 名称
	version: string // 版本
}

export interface ServicePush {
	status: boolean
	count: number
	cycle: number
	day_limit?: number
	id?: string
	index?: number
	interval: number
	key?: string
	module: string
	module_type?: string
	project?: string
	push_count?: string
	tid?: string
	title?: string
	to_user?: AnyObject
	type?: string
	user_info?: AnyObject
	view_msg?: string
	[key: string]: any
}
