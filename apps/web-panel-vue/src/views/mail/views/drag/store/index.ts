import { ref } from 'vue'
import { ColumnConfig, MenuCompConfig, Column_Map, Cells_Map } from '../components/base'
import type { Cell_Style_Map, CellStyle, Column_Row_Style_Map, ColumnStyle, Comp_Map, Comp_Style, DragComponentType, MoreConfigStyle } from '../components/base'
import { getRandom, cloneDeep } from '../controller'

/**
 * 递归合并对象，类似于 lodash 的 defaultsDeep
 * 将源对象的属性递归合并到目标对象，但只填充目标对象中未定义的属性
 * @param object 目标对象
 * @param sources 源对象数组
 */
export function defaultsDeep<T>(object: T, ...sources: Partial<T>[]): T {
	// 处理 null 或非对象的情况
	if (object == null || typeof object !== 'object') {
		return object
	}

	// 遍历所有源对象
	for (const source of sources) {
		if (source == null) continue

		// 遍历源对象的所有属性（包括继承的属性）
		for (const key in source) {
			const value = (object as any)[key]
			const sourceValue = source[key]

			// 如果目标值是 undefined，直接使用源值的深拷贝
			if (value === undefined) {
				;(object as any)[key] = cloneDeep(sourceValue)
				continue
			}

			// 如果两者都是对象，则递归合并
			if (value !== null && sourceValue !== null && typeof value === 'object' && typeof sourceValue === 'object' && !Array.isArray(value) && !Array.isArray(sourceValue) && !(value instanceof Date) && !(value instanceof RegExp) && !(value instanceof Map) && !(value instanceof Set)) {
				defaultsDeep(value, sourceValue)
			}
			// 如果目标值已存在，保留目标值
		}
	}

	return object
}

/**********  版本更新标记 **********/
export const version = 1.5
export const updateAnchor = {
	comp_type: {
		button: () => {
			return buttonStyle
		},
	},
}
/**********  End **********/

// 锚点有什么，就更新什么
export function updateThroughAnchor() {
	const updateCompType = Object.keys(updateAnchor.comp_type)

	Object.entries(comp_map.value).forEach(([, compItem]) => {
		if (!updateCompType.includes(compItem.type)) {
			return
		}

		Object.entries(comp_style_map.value).forEach(([key, item]) => {
			if (key === compItem.key) {
				const style = updateAnchor.comp_type[compItem.type as keyof typeof updateAnchor.comp_type]()
				item.style = defaultsDeep(item.style, style)
			}
		})
	})
}

// 抽屉显隐的visible
export const configPanelVisible = ref(false)
// 对应控制面板的type
export const configPanelType = ref('')
// 当前被编辑的组件的key(当前被编辑的column也使用这个变量)
export const currentEditCompKey = ref('')
// 当前需要提升z-index权重的columnKey
export const currentZindexColumnKey = ref('')
// 组件拖拽排序的指示器位置
export const sortIndicator = ref('bottom')
// 拖拽到舞台时，当前执行尾部追加的单元格key
export const virtualDragCell = ref('')

/********** 数据表格式定义 ***********/
// columns_source数据表（只包含columnKey）
export const columns_source = ref<string[]>([])
// column_map数据表（包含columnMap的配置，children中只包含cellKey）
export const column_map = ref<Column_Map>({})
// cell_map数据表（包含cell的具体配置）
export const cell_map = ref<Cells_Map>({})
// comp_map数据表
export const comp_map = ref<Comp_Map>({})
// cell_style_map数据表
export const cell_style_map = ref<Cell_Style_Map>({})
// column_Row_Style_Map数据表
export const column_row_style_map = ref<Column_Row_Style_Map>({})
// 拖拽出来的组件样式表（主键为key）
export const comp_style_map = ref<Record<string, Comp_Style>>({})
// 拖拽出来的组件配置表（主键为key）
export const compOptions = ref<Record<string, any>>({})
// 页面样式表
export const page_style = ref<Record<string, string | MoreConfigStyle>>({
	backgroundColor: '#ffffff',
	maxWidth: '500px',
})
/*** end ****/

// 拖拽出来的实际html结构
export const emailTemplate = ref<string>()
// 用于输出拖拽出来的配置文件
export const emailData = computed(() => {
	return {
		version: version,
		columns_source: columns_source.value,
		column_map: column_map.value,
		cell_map: cell_map.value,
		cell_style_map: cell_style_map.value,
		column_row_style_map: column_row_style_map.value,
		comp_style_map: comp_style_map.value,
		compOptions: compOptions.value,
		comp_map: comp_map.value,
		page_style: page_style.value,
	}
})

// 是否正在保存
export const isSave = ref(true)

// 自动保存方法
export const saveFn = ref<() => Promise<unknown>>(async () => false)

/**
 * @description 菜单数据源
 */
export const componentsPreset = ref<(MenuCompConfig | Partial<ColumnConfig>)[]>([
	{
		type: 'columns',
		name: '行',
		icon: 'el-semi-select',
		key: '0',
		children: [],
	},
	{
		type: 'button',
		icon: 'el-empty',
		name: '按钮',
		key: '0',
	},
	{
		type: 'divider',
		name: '分割线',
		icon: 'icon-drag',
		key: '0',
	},
	{
		type: 'header',
		name: '标题',
		icon: 'el-info-filled',
		key: '0',
	},
	{
		type: 'text',
		name: '文本',
		icon: 'file-text',
		key: '0',
	},
	{
		type: 'image',
		name: '图片',
		icon: 'el-folder-opened',
		key: '0',
	},
	{
		type: 'menu',
		name: '菜单',
		icon: 'menu-setting',
		key: '0',
	},
	// {
	// 	type: 'html',
	// 	name: 'HTML',
	// 	key: '0',
	// },
])

/*********** 各组件默认样式 ***********/
/**
 * @description 按钮默认样式
 */
/* export const columnStyle: Comp_Style['style'] = {
	backgroundColor: '',
} */

/**
 * @description cell单元格默认样式
 */
export const cellStyle: CellStyle = {
	style: {
		backgroundColor: 'transparent',
		padding: {
			more: false,
			all: '0px',
			top: '',
			right: '',
			bottom: '',
			left: '',
		},
		border: {
			more: false,
			all: '0px',
			top: '',
			right: '',
			bottom: '',
			left: '',
		},
	},
}

/**
 * @description column内容部分默认样式
 */
export const columnStyle: ColumnStyle = {
	style: {
		backgroundColor: 'transparent',
		padding: {
			more: false,
			all: '0px',
			top: '',
			right: '',
			bottom: '',
			left: '',
		},
	},
}

/**
 * @description 按钮默认样式
 */
export const buttonStyle: Comp_Style['style'] = {
	border: {
		more: false,
		all: '',
		top: '',
		right: '',
		bottom: '',
		left: '',
	},
	padding: {
		more: true,
		all: '',
		top: '10px',
		left: '20px',
		right: '20px',
		bottom: '10px',
	},
	borderRadius: {
		more: false,
		all: '4px',
		top: '',
		left: '',
		right: '',
		bottom: '',
	},
	width: 'auto',
	lineHeight: '120%',
	color: '#ffffff',
	display: 'inline-block',
	backgroundColor: '#3AAEE0',
	FontWeight: 'normal',
	fontSize: '14px',
	textAlign: 'center',
	LetterSpacing: '0px',
}

/**
 * @description 分割线样式
 */
export const dividerStyle: Comp_Style['style'] = {
	borderTop: '1px solid #bbbbbb',
	width: '100%',
	display: 'inline-block',
	lineHeight: '1px',
	height: '0px',
	verticalAlign: 'middle',
}

/**
 * @description 头部信息样式
 */
export const headerStyle: Comp_Style['style'] = {
	position: 'relative',
	display: 'block',
	lineHeight: '140%',
	fontWeight: 'normal',
	fontSize: '22px',
	letterSpacing: '0px',
	color: '#333333',
}

/**
 * @description 文本样式
 */
export const textStyle: Comp_Style['style'] = {
	fontSize: '14px',
	fontWeight: 'normal',
	color: '#333',
	textAlign: 'left',
	lineHeight: '140%',
	letterSpacing: '0px',
}

/**
 * @description 图片上传样式
 */
export const imageStyle: Comp_Style['style'] = {
	display: 'inline-block',
	width: '100%',
}

/**
 * @description 菜单样式,样式不对等，需要使用中间件
 */
export const menuStyle: Comp_Style['style'] = {
	fontWeight: 'normal',
	fontSize: '14px',
	letterSpacing: '0px',
	color: '#444444',
	linkColor: '#0068A5',
	padding: {
		more: true,
		all: '',
		top: '5px',
		left: '15px',
		right: '15px',
		bottom: '5px',
	},
}

/**
 * @description 聚合所有默认样式
 */
export const allStyleCollection: Partial<Record<DragComponentType, Comp_Style>> = {
	button: {
		style: buttonStyle,
		general: {
			textAlign: 'center',
			padding: {
				more: false,
				all: '10px',
				top: '',
				left: '',
				right: '',
				bottom: '',
			},
		},
		info: {
			href: '',
			target: '_blank',
		},
		content: '按钮',
	},
	divider: {
		style: dividerStyle,
		general: {
			textAlign: 'center',
			padding: {
				more: false,
				all: '10px',
				top: '',
				left: '',
				right: '',
				bottom: '',
			},
		},
		info: {},
	},
	header: {
		style: headerStyle,
		general: {
			textAlign: 'left',
			padding: {
				more: false,
				all: '10px',
				top: '',
				left: '',
				right: '',
				bottom: '',
			},
		},
		info: {},
		content: '标题',
	},
	text: {
		style: textStyle,
		general: {
			padding: {
				more: false,
				all: '10px',
				top: '',
				left: '',
				right: '',
				bottom: '',
			},
		},
		info: {},
		content: '文本',
	},
	image: {
		style: imageStyle,
		general: {
			textAlign: 'center',
			padding: {
				more: false,
				all: '10px',
				top: '',
				left: '',
				right: '',
				bottom: '',
			},
		},
		info: {
			href: '',
			target: '_blank',
			src: '',
			alt: '',
		},
	},
	menu: {
		style: menuStyle,
		general: {
			textAlign: 'center',
			padding: {
				more: false,
				all: '10px',
				top: '',
				left: '',
				right: '',
				bottom: '',
			},
		},
		info: {
			layout: 'horizontal',
		},
		links: [
			{ id: getRandom(6), label: '菜单 1', href: '' },
			{ id: getRandom(6), label: '菜单 2', href: '' },
		],
	},
}
