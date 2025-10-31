// 节点 持久化接口
export interface NodeStoreProps {
	tabActive: string // 当前tab，未激活
	isRefreshActiveList: boolean // 是否刷新活跃列表
	isLoading: boolean // 是否显示视图加载中
	ftpPort: number
	isSearchClick: boolean // 是否从搜索推荐点击
}

// 节点表格请求参数接口
export interface NodeTableProps {
	p: number
	limit: number
	search: string
	type_id?: number | string
	table: string
}

// 节点添加接口
export interface NodeAddProps {
	ftp_username: string
	ftp_password: string
	path: string
	ps: string
}

// 节点修改密码接口
export interface NodeEditPawProps {
	id: number
	ftp_username: string
	new_password: string
}

// 节点删除接口
export interface NodeDeleteProps {
	ids: number[]
}

// 节点修改状态接口
export interface NodeEditStatusProps {
	id: number
	username: string
	status: number
}

// 节点容量Quota接口
export interface NodeQuotaProps {
	size: number
	used: number
	free: number
	path?: string
	id?: number
}

// 节点表格数据接口
export interface NodeTableRowProps {
	name: string
	api_key: string
	address: string
	remarks: string
	category_id: string
	id?: number
	ids?: number[]
}

export interface NodeRowProps {
	address: string
	api_key: string
	category_id: string
	remarks: string
	id?: number
}

// 节点表格接口
export interface NodeTableEventProps {
	changeStatusEvent: (row: NodeTableDataProps) => void
	setQuotaEvent: (row: NodeTableDataProps, isSetup: boolean) => void
	openQuickConnectEvent: (row: NodeTableDataProps) => void
	openPawValidityEvent: (row: NodeTableDataProps) => void
	editPasswordEvent: (row: NodeTableDataProps) => void
	openLogEvent: (row: NodeTableDataProps) => Promise<void>
	deleteDataEvent: (row: NodeTableDataProps, isConfirm: boolean) => Promise<void>
	configureEvent: (row: NodeTableDataProps) => void
}

// 节点日志扫描表格接口
export interface NodeLogTableDataProps {
	id: number
	user: string
	ip: string
	time: NodeQuotaProps
	count: number
	type: string
}

// 节点日志扫描表格接口
export interface NodeLogTableEventProps {
	maskIpEvent: (row: NodeLogTableDataProps) => Promise<void>
	deleteDataEvent: (row: NodeLogTableDataProps, isConfirm: boolean) => Promise<void>
	stopDataEvent: (row: NodeLogTableDataProps) => Promise<void>
	ignoreScanEvent: (row: NodeLogTableDataProps) => Promise<void>
}

// 节点日志分析白名单表格接口
export interface NodeLogWhiteTableEventProps {
	deleteIpEvent: (row: string) => Promise<void>
}
