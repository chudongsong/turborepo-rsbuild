// Node 持久化接口
export interface NodeStoreProps {
	tabActive: string // 当前tab，未激活
	isRefreshActiveList: boolean // 是否刷新活跃列表
	isLoading: boolean // 是否显示视图加载中
	nodePort: number
	isSearchClick: boolean // 是否从搜索推荐点击
}

// Node表格请求参数接口
export interface NodeTableProps {
	p: number
	limit: number
	search: string
	type_id?: number | string
	table: string
}

// Node添加接口
export interface NodeAddProps {
	node_username: string
	node_password: string
	path: string
	ps: string
}

// Node修改密码接口
export interface NodeEditPawProps {
	id: number
	node_username: string
	new_password: string
}

// Node删除接口
export interface NodeDeleteProps {
	id: number
}

// Node修改状态接口
export interface NodeEditStausProps {
	id: number
	username: string
	status: number
}

// Node容量Quota接口
export interface NodeQuotaProps {
	size: number
	used: number
	free: number
	path?: string
	id?: number
}

// Node表格数据接口
export interface NodeTableRowProps {
	address: string
	api_key: string
	category_id: number
	remarks: string
	id: number
	node_id?: number
}

export interface ParamsProps {
	p: number
	limit: number
	search: string
	user_name: string
}

// Node表格接口
interface NodeTableEventProps {
	changeStatusEvent: (row: NodeTableDataProps) => void
	setQuotaEvent: (row: NodeTableDataProps, isSetup: boolean) => void
	openQuickConnectEvent: (row: NodeTableDataProps) => void
	openPawValidityEvent: (row: NodeTableDataProps) => void
	editPasswordEvent: (row: NodeTableDataProps) => void
	openLogEvent: (row: NodeTableDataProps) => Promise<void>
	deleteDataEvent: (row: NodeTableDataProps, isConfirm: boolean) => Promise<void>
	configureEvent: (row: NodeTableDataProps) => void
}

// Node日志扫描表格接口
export interface NodeLogTableDataProps {
	id: number
	user: string
	ip: string
	time: NodeQuotaProps
	count: number
	type: string
}

// Node日志扫描表格接口
export interface NodeLogTableEventProps {
	maskIpEvent: (row: NodeLogTableDataProps) => Promise<void>
	deleteDataEvent: (row: NodeLogTableDataProps, isConfirm: boolean) => Promise<void>
	stopDataEvent: (row: NodeLogTableDataProps) => Promise<void>
	ignoreScanEvent: (row: NodeLogTableDataProps) => Promise<void>
}

// Node日志分析白名单表格接口
export interface NodeLogWhiteTableEventProps {
	deleteIpEvent: (row: string) => Promise<void>
}

// 负载均衡
// 负载均衡节点数据接口
export interface HttpNodeData {
	node: string
	node_site: string
	port: string
	path: string
	node_status: string
	weight: string
	max_fail: string
	fail_timeout: string
	ps: string
}

// 负载均衡TCPUDP节点数据接口
export interface TcpudpNodeData {
	node: string
	port: string
	node_status: string
	weight: string
	max_fail: string
	fail_timeout: string
	ps: string
}
