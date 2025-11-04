import exp from 'constants'
import { VNode } from 'vue'

export interface TableCheckboxTypes {
	checkAllCheckbox: Ref<boolean>
	checkAllIndeterminate: Ref<boolean>
	handleAllChange: (value: any, isCustom: boolean, key: string) => void
	handleScopeChange: (value: any, row: any, index: number, key: string) => void
	handleCommandChange: (value: any) => void
}

//表格列属性
export interface TableColumnProps<T = any> {
	index?: number | ((index: number) => number) | undefined
	columnKey?: string | undefined
	label?: string
	subtitle?: string
	type?: string
	prop?: string
	isCustom?: boolean
	title?: string
	isHide?: boolean | (() => boolean)
	isLtd?: boolean
	event?: (row: T) => void
	showClick?: (row: T) => void // 单独处理显示隐藏 设置列点击调用的事件
	width?: string | number | undefined
	minWidth?: string | number
	fixed?: boolean | string
	renderHeader?: ((scope: { column: TableColumnCtx<any>; $index: number }, checkbox: TableCheckboxTypes) => VNode<RendererNode, RendererElement, { [key: string]: any }>) | undefined
	headerRender?: ((scope: { column: TableColumnCtx<any>; $index: number }, checkbox: TableCheckboxTypes) => VNode<RendererNode, RendererElement, { [key: string]: any }>) | undefined
	sortable?: boolean | string
	sortMethod?: (a: any, b: any) => number
	sortBy?: string | string[] | ((row: any, index: number) => string) | undefined
	sortOrders?: ('ascending' | 'descending' | null)[] | undefined
	resizable?: boolean
	formatter?: (row: T, column: any, cellValue: any, index: any) => any
	showOverflowTooltip?: boolean
	align?: string
	headerAlign?: string
	className?: string
	labelClassName?: string
	selectable?: (row: T, index: any) => boolean
	reserveSelection?: boolean
	filters?: Array<any>
	filterPlacement?: string
	filterMultiple?: boolean
	filterMethod?: (value: any, row: any, column: any) => boolean
	filteredValue?: Array<any>
	render?: (row: T, index: number, checkbox: TableCheckboxTypes) => VNode | Array<VNode> | string
	renderList?: (row: T, index: any) => VNode | Array<AnyObject>
	slots?: {
		// 插槽
		default?: ({ row: any, column: any, $index: number }) => VNode | null // 默认值
		header?: ({ column: any, $index: number }) => VNode | null // 头部
		filterIcon?: ({ column: any }) => VNode | null // 过滤图标
	}
}
// 表格属性
export interface TableProps {
	data: any
	height: string | number
	maxHeight: string | number
	stripe: boolean
	border: boolean
	size: string
	fit: boolean
	showHeader: boolean
	highlightCurrentRow: boolean
	currentRowKey: string | number
	rowClassName: (row: any, index: any) => string
	rowStyle: (row: any, index: any) => any
	cellClassName: (row: any, column: any, cellValue: any, index: any) => string
	cellStyle: (row: any, column: any, cellValue: any, index: any) => any
	headerRowClassName: (row: any, index: any) => string
	headerRowStyle: (row: any, index: any) => any
	headerCellClassName: (row: any, column: any, cellValue: any, index: any) => string
	headerCellStyle: (row: any, column: any, cellValue: any, index: any) => any
	rowKey: (row: any) => string | number
	emptyText: string
	defaultExpandAll: boolean
	expandRowKeys: Array<string | number>
	defaultSort: AnyObject
	tooltipEffect: string
	showSummary: boolean
	sumText: string
	summaryMethod: (param: any) => any
	spanMethod: (param: any) => any
	selectOnIndeterminate: boolean
	indent: number
	lazy: boolean
	load: (row: any, treeNode: any, resolve: any) => void
	treeProps: AnyObject
	column: Array<TableColumnProps>
}

// 表格组属性
export interface TableDataProps {
	list: AnyObject[]
	total: number
	loading: boolean
}

// switch表格配置
export interface TableColumnSwitchProps {
	prop?: string
	label?: string
	size: '' | 'large' | 'default' | 'small'
	event: (e: Event, row: any) => void
}
