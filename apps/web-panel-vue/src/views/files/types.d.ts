export interface FileStoreProps {
	realTask: boolean
	isRefreshFileList: boolean
	deleteFileData: any
	createListType: '' | 'dir' | 'file'
	isNoCreteItem: boolean
	fileTabActive: number
	fileTabList: FileTabProps[]
	openSearchRecom: string
	// searchParams: string
	copyFilesData: copyFilesDataProps
	favoriteList: FileFavoriteListProps[]
	diskList: any[]
	// shareTableData: any
	fileSync: any[]
	// tamperList: any[]
	fileTabActiveData: FileTabProps
	// selectList: number[]
	dirLength: number
	fileLength: number
	imageList: any[]
	fileTamper: AnyObject
	recyclingBinStatus: boolean
	columnShow: any
	searchHistory: any[]
	isAddTabs: boolean
	isShareRefresh: boolean
	globalTamperStatus: {
		status: boolean
		tip: string
	}
	navBtnHeight: number
	disabledCutTab: boolean

	fileTableWidth: AnyObject
}

export interface GlobalTamperStatusProps {
	status: boolean
	tip: string
}

export interface FileFavoriteListProps {
	name: string
	path: string
	type: 'dir' | 'file'
}

export interface FileTabOptionalProps {
	id?: string
	label?: string
	type?: 'list' | 'icon'
	loading?: boolean
	total?: number
	list?: FileDataProps[]
	imageList?: string[]
	param?: TableParamsOptionalProps
}

export interface FileTabProps {
	id: string
	label: string
	type: 'list' | 'icon'
	loading: boolean
	total: number
	param: TableParamsProps
	// catalog: string
}

// 文件表格请求参数
export interface TableParamsProps {
	p: number
	path: string
	showRow: number
	all?: 'True' | 'False'
	sort?: string
	reverse?: 'True' | 'False'
	search?: string
}

// 文件表格请求参数
export interface TableParamsOptionalProps {
	p?: number
	path?: string
	showRow?: number
	all?: 'True' | 'False'
	sort?: string
	reverse?: 'True' | 'False'
	search?: string
}

export interface fileTabActiveDataProps {
	loading: boolean
	total: number
	list: FileDataProps[]
	path: string
	type: string
}

export interface FileDataProps {
	ext: string // 文件后缀
	icon: string // 文件图标
	fileName: string // 文件名
	time: string // 文件修改时间
	ps: string // 文件备注
	size: number // 文件大小
	type: string // 文件类型
	user: string // 文件用户
	rootLevel: string // 文件权限
	isLink: string // 软连接
	isTop: boolean // 是否置顶
	isShare: boolean | number // 是否分享
	isFav: boolean // 是否收藏
	isOsPs: boolean // 是否是系统文件备注
	isPsEdit: boolean // 是否备注编辑
	isSearch: boolean // 是否搜索
	isReName: boolean // 是否重命名
	isNew: boolean // 是否新建
	isSync: string // 是否同步
	isLock: boolean // 是否加锁
	tamperProofId: number // 防篡改ID
	path: string // 文件完整路径(复制用)
	isFile: boolean // 是否是文件
}

export interface copyFilesDataProps {
	files: FileDataProps[]
	type: string
}

export const keyRows = [
	[
		{
			title: '文本编辑',
			items: [
				{
					buttons: ['Ctrl', 'V'],
					symbols: '+',
					tips: '粘贴内容',
				},
				{
					buttons: ['Ctrl', 'A'],
					symbols: '+',
					tips: '全选内容',
				},
				{
					buttons: ['Ctrl', 'Z'],
					symbols: '+',
					tips: '撤销操作',
				},
				{
					buttons: ['Ctrl', 'Y'],
					symbols: '+',
					tips: '反撤销操作',
				},
				{
					buttons: ['Ctrl', 'F'],
					symbols: '+',
					tips: '搜索内容',
				},
				{
					buttons: ['Ctrl', 'H'],
					symbols: '+',
					tips: '替换内容',
				},
				{
					buttons: ['Ctrl', 'Alt', '0'],
					tips: '折叠代码',
				},
				{
					buttons: ['Ctrl', 'Alt', 'Shift', '0'],
					tips: '展开代码',
				},
				{
					buttons: ['Esc'],
					tips: '退出搜索、取消自动提示',
				},
			],
		},
		{
			title: '光标移动',
			items: [
				{
					buttons: ['Home', 'End', 'Up', 'Left', 'Down', 'Right'],
				},
				{
					buttons: ['Ctrl', 'Home', 'End'],
					tips: '光标移动到文档首/尾',
				},
				{
					buttons: ['Ctrl', 'P'],
					tips: '跳转到匹配的标签',
				},
				{
					buttons: ['pageUp', 'pageDown'],
					tips: '光标上/下翻页',
				},
				{
					buttons: ['Alt', 'Left', 'Right'],
					tips: '光标移动到行首/尾',
				},
				{
					buttons: ['Ctrl', 'I'],
					tips: '跳转到指定行',
				},
				{
					buttons: ['Ctrl', 'Alt', 'Up', 'Down'],
					tips: '上/下增加光标',
				},
			],
		},
	],
	[
		{
			title: '内容选择',
			items: [
				{
					buttons: ['鼠标框选——拖动'],
				},
				{
					buttons: ['Shift', 'Home', 'End', 'Up', 'Left', 'Down', 'Right'],
				},
				{
					buttons: ['Shift', 'pageUp', 'PageDown'],
					tips: '上下翻页选中',
				},
				{
					buttons: ['Ctrl', 'Shift', 'Home'],
					tips: '当前光标至头/尾',
				},
				{
					buttons: ['Alt', '鼠标拖动'],
					tips: '块选择',
				},
			],
		},
		{
			title: '编辑',
			items: [
				{
					buttons: ['Ctrl', '/'],
					symbols: '+',
					tips: '注释&取消注释',
				},
				{
					buttons: ['Tab'],
					tips: '对齐',
				},
				{
					buttons: ['Shift', 'Tab'],
					tips: '整体前移',
				},
				{
					buttons: ['Delete'],
					tips: '删除',
				},
				{
					buttons: ['Ctrl', 'D'],
					tips: '删除整行',
				},
				{
					buttons: ['Alt', 'Shift', 'Up', 'Down'],
					tips: '复制行并添加到上一行/下一行',
				},
				{
					buttons: ['Alt', 'Delete'],
					tips: '删除光标右侧内容',
				},
				{
					buttons: ['Alt', 'Up', 'Down'],
					tips: '当前行和上一行/下一行交换',
				},
				{
					buttons: ['Ctrl', 'Shift', 'D'],
					tips: '复制行并添加到下面',
				},
			],
		},
	],
]

// ace编辑器类型
export type editorType = 'editor' | 'custom' | 'readOnly' | 'comparison' | 'diff'

// 编辑器tab项类型
export interface editorTabsItemsProps {
	id: string
	type?: editorType
	title?: string
	component?: any
	mode?: string // 编辑器语言模型
	modeText?: string // 编辑器语言模型文本显示
	state: 0 | 1 | 2 | 3 // 0 未保存，1 已修改，2 文件保存中 3 获取中
	path?: string
	stTime?: number
	historys?: string[]
	encoding?: 'ASCII' | 'UTF-8' | 'GBK' | 'GB2312' | 'BIG5' // 文件编码
	isReadOnly?: boolean // 是否只读
	session?: any
	next?: boolean // 是否有分页
	pagination?: number // 分页
}

// 编辑器会话类型
export interface editorSessionProps {
	id: string
	session: any
}

// 编辑器配置类型
export interface editorOptionsProps {
	supportedModes: AnyObject
	nameOverrides: AnyObject
	encodingList: string[]
	themeList: string[]
	aceEditor: aceEditorProps
}

// ace编辑器配置类型
export interface aceEditorProps {
	editorTheme: 'chrome' | 'monokai' // 主题
	fontSize: number // 字体大小
	fontFamily: string // 字体
	softLabel: boolean // 使用软标签
	useSoftTabs: boolean // 使用软标签
	tabSize: number // 缩进大小
	wrap: boolean // 自动换行
	enableSnippets: boolean // 启用代码片段
	enableLiveAutocompletion: boolean // 启用实时自动完成
	enableBasicAutocompletion?: boolean // 启用基本自动完成
	showPrintMargin?: boolean // 显示打印边距
	highlightActiveLine: boolean // 高亮活动行
	highlightSelectedWord: boolean // 高亮选中文本
	animatedScroll: boolean // 滚动动画
	showInvisibles: boolean // 显示不可见字符
	showFoldWidgets: boolean // 显示折叠小部件
	showLineNumbers: boolean // 显示行数
	showGutter: boolean // 显示行号
	displayIndentGuides: boolean // 显示参考线
	keyboardHandler?: string // 键盘处理程序
}

// 文件保存类型
export interface fileSaveData {
	path: string
	data: string
	encoding?: 'ASCII' | 'UTF-8' | 'GBK' | 'GB2312' | 'BIG5' // 文件编码
	st_mtime?: number // 文件修改时间
	force?: 0 | 1 // 是否强制保存，1 强制保存，0 不强制保存
	skip_conf_check?: boolean // 是否跳过配置检查
}

export interface fileListItemsProps {
	id?: string
	title?: string
	filename?: string
	type?: editorType
	component?: any
	path?: string
	size?: number
	mode?: string
}
