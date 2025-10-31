/**
 * @description 菜单区拖拽组件的配置
 */
export type MenuCompConfig = {
	// 菜单类型，必选
	type: DragComponentType
	// 菜单名称，必选
	name: string
	// 菜单组件唯一key，必选
	key: string
	// 菜单组件拖拽到试图区后拥有的样式，非必选
	style?: Comp_Style
	// 菜单组件的图标，非必选
	icon?: string
}

/**
 * @description 编辑区columns的配置
 */
export type ColumnConfig = {
	// 菜单类型，必选
	type: string
	// 菜单名称，必选
	name: string
	// 菜单组件唯一key，必选
	key: string
	// 子菜单，必选
	children: { width: string; key: string; children: string[] }[]
	// 菜单组件的图标，非必选
	icon?: string
}

/**
 * @description 组件菜单中预设组件枚举
 */
export enum DragComponentType {
	Columns = 'columns',
	Button = 'button',
	Divider = 'divider',
	Header = 'header',
	Text = 'text',
	Image = 'image',
	Menu = 'menu',
	Html = 'html',
	commonComp = 'commonComp', // 通用拖拽组件类型
}

/**
 * @description 拖拽区对组件的接受范围
 */
export const dragColumnsAccept = [DragComponentType.Button, DragComponentType.Divider, DragComponentType.Header, DragComponentType.Text, DragComponentType.Image, DragComponentType.Menu, DragComponentType.Html, DragComponentType.commonComp]

/**
 * @description 需要更多配置的样式
 */
export type MoreConfigStyle<K = string> = {
	more: boolean
	all: K
	top: K
	right: K
	bottom: K
	left: K
}

/**
 * @description border、padding、borderRadius等符合类型的联合类型
 */
export type RecombinationStyle = 'border' | 'padding' | 'borderRadius'

/**
 * @description RecombinationStyle的类型守卫
 */
export function isRecombinationStyle(attrKey: string): attrKey is RecombinationStyle {
	return attrKey == 'border' || attrKey == 'padding' || attrKey == 'borderRadius'
}

/**
 * @description 所有列组成的数组
 */
export type Columns_Source = string[]

/**
 * @description column_map列的数据表
 */
export type Column_Map = {
	[key: string]: {
		type: DragComponentType.Columns
		name: string
		key: string
		children: string[]
	}
}

/**
 * @description cells_map单元格的数据表
 */
export type Cells_Map = {
	[key: string]: {
		width: string
		key: string
		children: string[]
	}
}

/**
 * @description comp_map组件的数据表
 */
export type Comp_Map = {
	[key: string]: {
		key: string
		type: DragComponentType
	}
}

/**
 * @description cell单元格的默认样式
 */
export type CellStyle = {
	style: {
		backgroundColor: string
		padding: {
			more: boolean
			all: string
			top: string
			right: string
			bottom: string
			left: string
		}
		border: {
			more: boolean
			all: string
			top: string
			right: string
			bottom: string
			left: string
		}
	}
	general?: Record<string, any>
}

/**
 * @description cell_style_map单元格的样式数据表
 */
export type Cell_Style_Map = {
	[key: string]: CellStyle
}

/**
 * @description ColumnStyle行样式
 */
export type ColumnStyle = {
	style: {
		backgroundColor: string
		padding: {
			more: boolean
			all: string
			top: string
			right: string
			bottom: string
			left: string
		}
	}
	general?: Record<string, any>
}

/**
 * @description Column_Row_Style_Map行容器样式数据表
 */
export type Column_Row_Style_Map = {
	[key: string]: ColumnStyle
}

/**
 * @description
 */

/**
 * @description 组件样式样式表
 */
export type Comp_Style = {
	style: Record<string, string | MoreConfigStyle>
	general?: Record<string, string | MoreConfigStyle>
	info?: Record<string, string>
	[key: string]: any
}
