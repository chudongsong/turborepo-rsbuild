import type { TableColumnProps } from '@/components/data/bt-table/types'
import { RecommendProps } from '@/components/business/bt-search-history/types'
import type { ConfigProps as ClassConfig } from '@/components/extension/bt-table-class/types'
// 表格参数类型
export interface TableParamsProps {
	page: number // 分页数
	limit: number // 每页显示数量
	search?: string // 搜索参数
	type?: string // 分类参数
	sort?: string // 排序类型
	sortField?: string // 排序字段
}

//  表格请求参数
export interface UseTableProps {
	request: (data: { p: number; search: string; limit: number }) => Promise<TableResponseProps> // 请求参数
	sort?: any // 是否排序
	columns: TableColumnProps[] // 表格列
	extension?: { init: any; request?: (data) => void }[] // 扩展参数
	empty?: string | Component // 空数据提示
	onSelectionChange?: (data: any) => void // 选中数据
}

// 表格返回参数
export interface UseTableReturnProps {
	BtTable: ReturnType<typeof defineComponent> // 表格组件
	tableRef: Ref<any> // 表格实例
	tableParam: Ref<AnyObject> // 表格参数
	tableConfig: TableConfigProps // 表格配置
	refresh: () => void // 刷新表格数据
}

//  表格请求参数
export interface TableResponseProps {
	data: AnyObject[] // 表格数据
	total: number // 表格总数
	other?: Record<string, any> // 其他数据
}

// 表格扩展初始化参数
export interface TableExtProps<T> {
	ref: Ref<any>
	config: TableConfigProps
	columns: Ref<TableColumnProps[]>
	param: Ref<Record<string, any>>
	refresh: () => void
}

// 表格设置配置
export interface TableConfigProps {
	data: AnyObject[] // 表格数据
	total: number // 表格总数
	other?: Record<string, any> // 其他数据
	loading: boolean // 表格加载状态
	loadingTitle?: string // 加载标题	// page: number; // 分页数
	pageKeys: Record<string, string> // 分页键名
}

export interface ConfigProps {
	prop?: string
	label?: string
	data?: any
	labelClassName?: string
	width?: number
	minWidth?: number
	event?: (row: any) => void
}

// 表格配置
export interface ConfigEventProps extends ConfigProps {
	label?: string
	minWidth?: number
	text?: string
	title?: string
	onClick?: any
	isCustom?: boolean
	event: AnyFunction
	width?: number
	sortable?: boolean | string
	function?: AnyFunction
}

export interface TableInstallExtProps {
	tableConfig: TableConfigProps
	tableCol: Ref<TableColumnProps[]>
	refreshTableData: () => void
}
