import AceDiff from 'ace-diff'
import type { aceEditorProps, editorOptionsProps, editorSessionProps, editorTabsItemsProps, fileListItemsProps, fileSaveData } from '@/types/files'

import { getFileBody } from '@api/files'

import { editorCloseDialog } from '@files/useMethods'

import { useConfirm, useMessage } from '@/hooks/tools'
import { formatTime, getRandomChart, isDev } from '@/utils/index'
import { reHistory, saveFileBody } from '@/api/global'
import FILES_ACE_STORE from './store'
const Message = useMessage()

const editorOptionsPath = `/www/server/panel/BTPanel/static/editor/ace.editor.config.json`

// 编辑器配置
export const editorOption = reactive<editorOptionsProps>({
	supportedModes: {},
	nameOverrides: {},
	encodingList: [],
	themeList: [],
	aceEditor: {
		fontFamily: "Monaco, Menlo, 'Courier New', monospace",
		editorTheme: 'monokai',
		fontSize: 14,
		softLabel: true,
		useSoftTabs: true,
		tabSize: 4,
		wrap: true,
		enableSnippets: true,
		enableLiveAutocompletion: true,
		highlightActiveLine: true,
		highlightSelectedWord: true,
		animatedScroll: true,
		showInvisibles: false,
		showFoldWidgets: true,
		showLineNumbers: true,
		showGutter: true,
		displayIndentGuides: true,
	},
})

/**
 * @description 编辑器seesion
 */
export const editorSeesion = shallowRef<editorSessionProps[]>([])

// 编辑器实例
export const editorExample = shallowRef<any>(null)

// diff编辑器实例
export const editorDiffExample = shallowRef<any>(null)

// 编辑器tabs激活项
export const editorTabsActive = shallowReactive<editorTabsItemsProps>({
	id: '',
	type: 'editor',
	title: '',
	path: '',
	mode: '',
	modeText: '',
	isReadOnly: false,
	stTime: 0,
	state: 0,
	encoding: 'UTF-8',
	historys: [],
	lineBreak: 'LF',
})

export const editorCustomToolbar = shallowRef('') // 自定义工具栏类型，为空则不显示

// 编辑器行列、总数
export const editorRowColumnCount = shallowReactive({
	row: 1,
	column: 0,
	count: 1,
})

// 编辑器tabs
export const editorTabs = ref<editorTabsItemsProps[]>([])

/**
 * @description 获取ace编辑器，钩子函数
 * @returns
 */
export const useAce = () => {
	return window.ace
}

/**
 * @description 获取ace-diff编辑器，钩子函数
 * @returns
 */
export const useDiffAce = () => {
	return AceDiff
}

/**
 * @description 获取随机数ID，钩子函数
 *
 */
export const useRandomId = () => {
	return getRandomChart(10)
}

// 文件的公共方法

export const reHistoryRow = ref()
const aceLoading = ref<any>(null)

/**
 * @description 键盘事件
 * @param {KeyboardEvent} event 键盘事件
 * @returns
 **/
export const handleKeyDown = (event: KeyboardEvent) => {
	// 检查是否按下了F5，或者组合键Command+R（macOS），或者组合键Ctrl+R（所有平台）
	if (event.key === 'F5' || (event.key === 'r' && (event.metaKey || event.ctrlKey))) {
		event.preventDefault() // 阻止刷新行为
		Message.msg({
			customClass: 'no-icon',
			message: `编辑器模式下无法刷新网页，请关闭后重试`,
			type: 'info',
			duration: 3000,
		})
		return
	}
}

/**
 * @description: 文件比对恢复
 * @param row 行数据
 */
export const recoverEvent = async (row: any) => {
	try {
		await useConfirm({
			title: `恢复历史文件`,
			width: '35rem',
			content: `是否恢复历史文件 ${formatTime(Number(row.st_mtime))}?恢复历史文件后，当前文件内容将会被替换！`,
		})
		const res = await reHistory({
			filename: row.path,
			history: row.st_mtime,
		})
		if (res.status) {
			Message.success('恢复成功')
			const index = useFindIndexTabs(editorTabsActive.id)
			editorTabs.value.splice(index, 1)
			useRefreshFileContent(row)
		} else {
			Message.request(res)
		}
	} catch (error) {}
}

/**
 * @description: 最小化打开事件挂载
 *
 **/
export const minimizeEvent = async (data: any) => {
	if (document.querySelector('.bt-dialog-header .svgtofont-icon-minmax-black')) {
		document.querySelector('.bt-dialog-header .svgtofont-icon-minmax-black')?.click()
		if (data) {
			useCreateEditorTabs(data)
		}
		return
	}
}

/**
 * @description 编辑器界面loading加载
 *
 */
export const useEditorLoading = async () => {
	aceLoading.value = await Message.load('正在获取文件内容，请稍候...')
}

/**
 * @description 编辑器界面loading卸载
 *
 */
export const useEditorUnLoading = async () => {
	aceLoading.value && aceLoading.value.close()
}

/**
 * @description 编辑器界面离开提示恢复
 */
export const enableRefresh = () => {
	const someChange = editorTabs.value.some((item: any) => item.state === 1)
	if (someChange) return
	window.onbeforeunload = null
}

/**
 * @description: 编辑器滚动底部监听
 */
export const handleScroll = async (path: string, p: number) => {
	let load = Message.load('正在加载，请稍候...')
	try {
		const { data: res } = (await useGetFileBody(path, 'reverse', p)) as any
		return res
	} catch (error) {
		console.log(error)
	} finally {
		load && load.close()
	}
}

/**
 * @description 获取编辑器配置，钩子函数
 */
export const useGetEditorOptions = async () => {
	const editorOptionsJson = sessionStorage.getItem('aceConfig')
	let editorOptions = {} as editorOptionsProps
	if (editorOptionsJson) editorOptions = JSON.parse(editorOptionsJson)
	const { data } = await useGetFileBody(editorOptionsPath)
	if (data?.data) {
		editorOptions = JSON.parse(data.data)
		sessionStorage.setItem('aceConfig', JSON.stringify(editorOptions))
	}
	editorOption.supportedModes = editorOptions.supportedModes || {
		Apache_Conf: ['^htaccess|^htgroups|^htpasswd|^conf|htaccess|htgroups|htpasswd'],
		CSS: ['css'],
		HTML: ['html|htm|xhtml|vue|we|wpy'],
		Java: ['java'],
		JavaScript: ['js|jsm|jsx'],
		JSON: ['json'],
		JSP: ['jsp'],
		Makefile: ['^Makefile|^GNUmakefile|^makefile|^OCamlMakefile|make'],
		Markdown: ['md|markdown'],
		MySQL: ['mysql'],
		Nginx: ['nginx|conf'],
		PHP: ['php|inc|phtml|shtml|php3|php4|php5|phps|phpt|aw|ctp|module'],
		Powershell: ['ps1'],
		Python: ['py'],
		SQL: ['sql'],
		SQLServer: ['sqlserver'],
		Text: ['txt'],
		XML: ['xml|rdf|rss|wsdl|xslt|atom|mathml|mml|xul|xbl|xaml'],
		YAML: ['yaml|yml'],
		images: ['icon|jpg|jpeg|png|bmp|gif|tif|emf'],
	}
	editorOption.nameOverrides = editorOptions.nameOverrides || { PHP_Laravel_blade: 'PHP (Blade Template)' }
	editorOption.encodingList = editorOptions.encodingList || ['ASCII', 'UTF-8', 'GBK', 'GB2312', 'BIG5']
	editorOption.themeList = editorOptions.themeList || ['chrome', 'monokai', 'tomorrow_night_bright']
	editorOption.aceEditor = editorOptions.aceEditor || {
		editorTheme: 'monokai',
		fontSize: 14,
		softLabel: false,
		useSoftTabs: true,
		tabSize: 4,
		wrap: true,
		enableSnippets: true,
		enableLiveAutocompletion: true,
		highlightActiveLine: true,
		highlightSelectedWord: true,
		animatedScroll: false,
		showInvisibles: true,
		showFoldWidgets: true,
		showLineNumbers: true,
		showGutter: true,
		displayIndentGuides: false,
	}
	editorOption.aceEditor.fontFamily = "12px/normal 'Consolas', 'Menlo', 'Monaco', 'Ubuntu Mono', 'source-code-pro', 'Courier New', monospace"
}

/**
 * @dfecription 保存编辑器配置，钩子函数
 * @returns {Promise<void>}
 */
export const useSaveEditorOptions = async () => {
	const data = JSON.stringify(editorOption)
	return await useSaveFileBody({
		data: data,
		path: editorOptionsPath,
		force: 1,
	})
}

/**
 * @description 获取编辑器配置，钩子函数
 * @returns {Promise<void>}
 */
export const useGetAceOptions = () => {
	return editorOption.aceEditor
}

/**
 * @description 创建编辑器实例，钩子函数
 * @returns {Promise<void>}
 */
export const useCreateAceEditorExample = async (refs: any) => {
	const editorPath = isDev ? '/public/static/editor' : '/static/editor'
	const ace = useAce()
	const { editorTheme, fontSize, fontFamily, showInvisibles, useSoftTabs, tabSize, keyboardHandler, enableLiveAutocompletion, enableSnippets, enableBasicAutocompletion }: aceEditorProps = useGetAceOptions()
	ace.config.set('basePath', editorPath) // 设置ace编辑器路径
	ace.require('/ace/ext/language_tools') // 引入语言工具
	const example = ace.edit(refs, {
		theme: `ace/theme/${editorTheme}`, // 主题
		fontSize, // 字体大小
		fontFamily, // 字体
		showInvisibles, // 显示不可见字符
		useSoftTabs, // 使用软标签
		tabSize, // 缩进大小
		showPrintMargin: false,
		keyboardHandler, // 键盘处理程序
		enableLiveAutocompletion, // 启用实时自动补全
		enableSnippets, // 启用代码片段
		enableBasicAutocompletion, // 启用基本自动补全
	})
	useEventMount(example) // 挂载快捷键事件
	return example
}

/**
 * @description 创建diff编辑器实例
 */
export const useCreateDiffEditorExample = (refs: HTMLElement) => {
	editorDiffExample.value = refs
}

/**
 * @description 设置diff编辑器选项
 */
export const useSetDiffEditorOptions = async (options: any) => {
	const { editorTheme }: aceEditorProps = useGetAceOptions()
	const { theme = `ace/theme/${editorTheme}`, mode = '', left = {}, right = {} } = options
	const example = {
		element: editorDiffExample.value,
		theme,
		mode,
		left: {
			content: '',
			editable: false,
			copyLinkEnabled: false,
			...left,
		},
		right: {
			content: '',
			editable: false,
			copyLinkEnabled: false,
			...right,
		},
	}
	useCreateDiffEditorView(example)
	return example
}

/**
 * @description 创建diff编辑器视图
 * @param options diff编辑器配置
 */
export const useCreateDiffEditorView = (options: any) => {
	const aceDiff = useDiffAce()
	const aceDiffOpts = new aceDiff(options)
	return aceDiffOpts
}

/**
 * @description 创建编辑器seesion
 */
export const useCreateAceEditorSession = (mode: string, data: string) => {
	const ace = useAce()
	const {
		wrap, // 自动换行
	}: aceEditorProps = useGetAceOptions()
	const aceSession = ace.createEditSession(data, `ace/mode/${mode}`)
	aceSession.setOptions({
		wrap,
		readOnly: false,
	}) // 设置编辑器选项
	useMonitorMount(aceSession) // 挂载监听事件
	return aceSession
}

/**
 * @description 插入编辑器内容seesion
 */
export const useInsertAceEditorSession = (session: any) => {
	editorExample.value.setSession(session)
}

/**
 * @description 获取编辑器内容seesion
 */
export const useGetAceEditorSession = (id?: string) => {
	if (id) return editorSeesion.value.find(item => item.id === id)?.session
	return editorExample.value.getSession()
}

/**
 * @description 获取编辑器内容seesion的data
 */
export const useGetAceEditorSessionData = (id?: string) => {
	if (id) return editorSeesion.value.find(item => item.id === id)
	return editorExample.value.getSession()
}

/**
 * @description 获取编辑器内容seesion的索引
 */
export const useGetAceEditorSessionIndex = (id?: string) => {
	if (id) return editorSeesion.value.findIndex(item => item.id === id)
	return -1
}

/**
 * @description 获取文件语言模型
 */
export const useGetFileMode = (fileName: string) => {
	let filenames = fileName.match(/\.([0-9A-z]*)$/) as string[] | string
	filenames = (!Array.isArray(filenames) ? 'text' : filenames[1]) as string
	for (let name in editorOption.supportedModes) {
		var data = editorOption.supportedModes[name],
			suffixs = data[0].split('|'),
			filename = name.toLowerCase()
		for (var i = 0; i < suffixs.length; i++) {
			// toLowerCase排除文件名大小写不匹配的情况
			if (filenames.toLowerCase() == suffixs[i].toLowerCase()) {
				return { name: name, mode: filename }
			}
		}
	}
	return { name: 'Text', mode: 'text' }
}

/**
 * @description 监测文件兼容，是否支持编辑器打开
 */
export const useCheckFileCompatibility = (fileName: string) => {
	const { mode } = useGetFileMode(fileName)
	return editorOption.supportedModes[mode]
}

/**
 * @description 获取筛选id选中的tab项
 * @param {string} id 编辑器tab项id
 * @returns {editorTabsItemsProps}
 */
export const useFindTabsData = (id: string) => {
	return editorTabs.value.find(item => item.id === id) as editorTabsItemsProps
}

/**
 * @description 获取激活的编辑器tab项
 */
export const useFindIndexTabs = (id: string) => {
	return editorTabs.value.findIndex(item => item.id === id)
}

/**
 * @description 监测tabs列表是否为空
 */
export const useCheckTabsEmpty = () => {
	return editorTabs.value.length > 0
}

/**
 * @description 创建构建构造函数，tabs项
 * return {editorTabsItemsProps}
 */
export const useCreateTabsItem = (item: editorTabsItemsProps, session?: any) => {
	const { getDataChangeTab } = FILES_ACE_STORE()
	delete item.session // 删除编辑器会话
	const tabsItem = {
		...{
			id: '',
			type: 'editor',
			title: '',
			path: '',
			mode: '',
			modeText: '',
			isReadOnly: false,
			stTime: 0,
			state: 0,
		},
		...item,
	} as editorTabsItemsProps
	console.log('创建构建构造函数，tabs项', tabsItem)
	editorTabs.value.push(tabsItem)
	getDataChangeTab() // 获取对应数据后 切换tab
	// 自定义视图
	if (item.type === 'editor' && session) {
		editorSeesion.value.push({ id: tabsItem.id as string, session })
	}
	return tabsItem
}

/**
 * @description 修改编辑器tab项可读状态
 */
export const useSetEditorTabsReadOnly = (isReadOnly: boolean = false) => {
	editorExample.value.setReadOnly(isReadOnly)
}

/**
 * @description 修改编辑器tab项焦点状态
 */
export const useSetEditorTabsFocus = () => {
	editorExample.value.focus()
}

/**
 * @description 获取编辑器tab项总行数
 */
export const useGetEditorTabsLineCount = (example: any) => {
	editorRowColumnCount.count = example.session.getLength()
}

/**
 * @description 检查是否有存在的编辑器tab项
 * @param {string} path 文件路径
 */
export const useEditorPathFilter = (path: string) => {
	return editorTabs.value.filter(item => item.path === path)
}

/**
 * @description 设置激活的编辑器tab项
 */
export const useSetEditorTabsActive = async (id: string) => {
	const activeTabs = useFindTabsData(id)
	console.log('设置激活的编辑器tab项', activeTabs)
	if (activeTabs) {
		editorTabsActive.id = id
		editorTabsActive.type = activeTabs.type
		editorTabsActive.title = activeTabs.title
		if (activeTabs.type === 'editor') {
			editorTabsActive.path = activeTabs.path
			editorTabsActive.mode = activeTabs.mode
			editorTabsActive.modeText = activeTabs.modeText
			editorTabsActive.isReadOnly = activeTabs.isReadOnly
			editorTabsActive.stTime = activeTabs.stTime
			editorTabsActive.state = activeTabs.state
			editorTabsActive.encoding = activeTabs.encoding
			editorTabsActive.historys = activeTabs.historys
			editorTabsActive.next = activeTabs.next
			editorTabsActive.pagination = activeTabs.pagination
			editorTabsActive.lineBreak = activeTabs.lineBreak
		} else {
			editorTabsActive.component = activeTabs.component
		}
	}
}

/**
 * @description 创建编辑器选项卡
 */
export const useCreateEditorTabs = async (item: fileListItemsProps) => {
	try {
		console.log('创建编辑器选项卡', item)
		let tabsItem = {} as editorTabsItemsProps
		if (item.type === 'editor') {
			const filterItem = useEditorPathFilter(item.path as string) // 检查是否有存在的编辑器tab项
			if (filterItem.length) return useCutEditorTabs(filterItem[0].id) // 切换编辑器选项卡
			const ress = await useGetFileBody(item.path as string) // 获取文件内容
			const { data, status, msg } = ress
			let requestData = data
			if (status) {
				if (msg && msg !== 'success') {
					Message.warn(msg)
				}
				// 判断文件大小
				if ((item.size as number) > 3 * 1024 * 1024) {
					Message.warn('抱歉！文件大小超过3M，暂不支持在线编辑！')
				}
				const title = item.filename || (item.path?.split('/').pop() as string)
				let mode = ''
				const { mode: modeStr, name } = useGetFileMode(title)
				mode = modeStr
				// 判断是否有指定语言类型
				if (item.mode) mode = item.mode

				// 检测行结束符类型
				const lineBreakType = useDetectLineBreakType(requestData.data)

				const editorSeesion = useCreateAceEditorSession(mode, requestData.data)
				tabsItem = useCreateTabsItem(
					{
						id: getRandomChart(10),
						path: item.path,
						type: 'editor',
						title,
						mode,
						modeText: name,
						state: 0,
						encoding: requestData.encoding,
						stTime: Number(requestData.st_mtime),
						isReadOnly: requestData.only_read,
						historys: requestData.historys || [],
						next: requestData?.next || false,
						pagination: 1,
						lineBreak: lineBreakType,
					},
					editorSeesion
				)
				useInsertAceEditorSession(editorSeesion) // 插入编辑器内容
				useSetEditorTabsReadOnly(requestData.only_read) // 设置编辑器是否只读
			} else {
				Message.error(msg)
			}
		} else {
			tabsItem = useCreateTabsItem({ ...item, id: getRandomChart(10), state: 0 })
		}
		useSetEditorTabsActive(tabsItem.id as string) // 设置激活的编辑器tab项
	} catch (error) {}
}

/**
 * @description 刷新文件内容
 * @param {editorTabsItemsProps} item 文件列表项
 * @param {boolean} isContent 是否替换获取文件内容
 * @returns {Promise<void>}
 */
export const useRefreshFileContent = async (item: editorTabsItemsProps, isReplace: boolean = false) => {
	if (item.type !== 'editor') return
	const load = Message.load('获取文件内容中，请稍候...')
	try {
		const tabItem = useFindTabsData(item.id || '') // 获取当前激活的tab项
		const { data } = await useGetFileBody(item.path as string) // 获取文件内容
		if (isReplace) editorExample.value.session.setValue(data.data)
		tabItem.stTime = Number(data.st_mtime)
		tabItem.encoding = data.encoding
		tabItem.state = 0
		editorTabsActive.state = 0
		tabItem.isReadOnly = data.only_read
		tabItem.historys = data.historys || []
		Message.msg({
			message: `文件内容已更新！`,
			type: 'success',
		})
		useSetEditorTabsActive(tabItem.id as string) // 设置激活的编辑器tab项
	} catch (error) {
	} finally {
		load && load.close()
	}
}

/**
 * @description 删除编辑器选项卡
 * @param {string} id 编辑器tab项id
 */
export const useRemoveEditorTabs = (item: any) => {
	const { id } = item
	const index = useFindIndexTabs(id)
	const indexTabs = editorTabs.value[index] || null
	const seesionItem = useGetAceEditorSession(id)
	const seesionIndex = useGetAceEditorSessionIndex(id)
	if (item.state) return useRemoveEditorCheckTabs(item) // 删除编辑器选项卡检查
	// 卸载编辑器实例
	if (indexTabs && indexTabs.type === 'editor') seesionItem?.destroy()
	// 检查是否左右是否有tab项
	const length = editorTabs.value.length
	if (length > 1) {
		// 判断后面是否有tab项
		const activeIndex = editorTabs.value[index + 1] ? index + 1 : index - 1
		const activeId = editorTabs.value[activeIndex].id as string // 激活项id
		useCutEditorTabs(activeId, true) // 切换编辑器选项卡
	}
	// 删除编辑器tab项
	editorTabs.value.splice(index, 1)
	if (indexTabs.type === 'editor' && seesionItem) {
		editorSeesion.value[seesionIndex].session.destroy() // 销毁编辑器会话
		editorSeesion.value.splice(seesionIndex, 1)
	}
}

/**
 * @description 删除编辑器选项卡检查
 * @param id
 */
export const useRemoveEditorCheckTabs = async (item: any) => {
	try {
		editorCloseDialog('close', item)
	} catch (error) {
		console.log('error', error)
	}
}

/**
 * @description 切换编辑器选项卡
 * @param {string} id 编辑器tab项id
 */
export const useCutEditorTabs = (id: string, isRemove: boolean = false) => {
	const index = useFindIndexTabs(editorTabsActive.id || '') // 获取当前激活的index
	const cutIndex = useFindIndexTabs(id) // 获取切换的tab项
	const cutTabs = editorTabs.value[cutIndex]
	const cutSeesionTabs = useGetAceEditorSessionData(id)
	if (cutTabs.type === 'editor') {
		if (editorTabsActive.id === id && isRemove) {
			// 保存上一个编辑器内容，删除当前编辑器
			if (editorSeesion.value[index]?.session) {
				editorSeesion.value[index].session = useGetAceEditorSession()
			}
		}
		if (cutSeesionTabs) {
			useInsertAceEditorSession(cutSeesionTabs.session) // 插入编辑器内容
			useGetEditorTabsLineCount(cutSeesionTabs) // 获取编辑器tab项总行数
		}
		useSetEditorTabsReadOnly(cutTabs.isReadOnly) // 设置编辑器是否只读
		useSetEditorTabsFocus() // 设置编辑器焦点
	}
	useSetEditorTabsActive(id) // 设置激活的编辑器tab项
}

/**
 * @description 监听事件
 * @param {string} id 编辑器tab项id
 */
export const useMonitorMount = (example: any) => {
	// 获取编辑器总行数
	editorRowColumnCount.count = example.getLength()

	// 监听编辑器内容变化
	example.on('change', () => {
		const activeTabs = useFindTabsData(editorTabsActive.id || '')
		if (activeTabs.state === 0) {
			activeTabs.state = 1
			editorTabsActive.state = 1
			// 阻止浏览器刷新
			window.onbeforeunload = function () {
				return '您有未保存的更改，确定要离开吗？'
			}
			console.log('编辑器内容变化', activeTabs)
		}
	})

	// 监听编辑器光标位置变化
	example.selection.on('changeCursor', () => {
		// 获取最新光标所在的位置
		const cursorPosition = editorExample.value.getCursorPosition()
		// 获取编辑器总行数
		editorRowColumnCount.count = example.getLength()
		editorRowColumnCount.row = cursorPosition.row + 1
		editorRowColumnCount.column = cursorPosition.column
	})

	// 添加滚动事件监听器
	example.on(
		'changeScrollTop',
		useDebounceFn(async function (scroll: any) {
			const session = example.selection.session
			const scrollTop = session.getScrollTop()
			const editorHeight = session.getScreenLength() * editorExample.value.renderer.lineHeight
			const scrollerHeight = editorExample.value.renderer.$size.scrollerHeight
			if (scrollTop + scrollerHeight >= editorHeight - 100) {
				const item = useFindTabsData(editorTabsActive.id)
				if (item.next) {
					const res = await handleScroll(item.path as string, item.pagination as number)
					item.next = res.next
					if (res?.next) {
						if (item.pagination) {
							item.pagination++
						}
						const sessionData = useGetAceEditorSession(item.id)?.getValue()
						editorExample.value.session.setValue(sessionData + res.data)
					}
				}
			}
		}),
		500
	)
}

/**
 * @description 挂载事件
 * @param example
 */
export const useEventMount = (example: any) => {
	const { watchEditorCustomToolbar } = FILES_ACE_STORE()

	// 设置键盘快捷键-保存当前文件
	example.commands.addCommand({
		name: 'saveFile',
		bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
		exec: () => {
			const activeTabs = useFindTabsData(editorTabsActive.id || '')
			useSaveFiles(activeTabs)
		},
	})

	// 设置键盘快捷键-保存全部文件
	example.commands.addCommand({
		name: 'saveAllFile',
		bindKey: { win: 'Ctrl-Shift-S', mac: 'Command-Shift-S' },
		exec: () => {
			useSaveAllFiles()
		},
	})

	// 设置键盘快捷键-关闭当前文件
	example.commands.addCommand({
		name: 'closeFile',
		bindKey: { win: 'Ctrl-W', mac: 'Command-W' },
		exec: () => {
			useRemoveEditorTabs(editorTabsActive.id)
		},
	})

	// 设置键盘快捷键-关闭全部文件
	example.commands.addCommand({
		name: 'closeAllFile',
		bindKey: { win: 'Ctrl-Shift-W', mac: 'Command-Shift-W' },
		exec: () => {
			editorTabs.value.forEach(item => {
				useRemoveEditorTabs(item.id)
			})
		},
	})

	// 设置键盘快捷键- 跳转到指定行
	example.commands.addCommand({
		name: 'goToLine',
		bindKey: { win: 'Ctrl-I', mac: 'Command-I' },
		exec: () => {
			// example.execCommand('gotoline')
			if (!useCheckTabsEmpty() || editorTabsActive.type === 'custom') {
				Message.error('当前页面不支持该操作')
			} else {
				watchEditorCustomToolbar('jump')
			}
		},
		readonly: false,
	})

	// 设置键盘快捷键- 撤销
	example.commands.addCommand({
		name: 'undo',
		bindKey: { win: 'Ctrl-Z', mac: 'Command-Z' },
		exec: () => {
			example.undo()
		},
	})
}
/**
 * @description 卸载编辑器的配置数据
 */
export const useDestroyEditorData = () => {
	// editorExample.value.destroy()
	editorExample.value = null
	editorTabsActive.id = ''
	editorTabsActive.title = ''
	editorTabsActive.path = ''
	editorTabsActive.mode = ''
	editorTabsActive.modeText = ''
	editorTabsActive.isReadOnly = false
	editorTabsActive.stTime = 0
	editorTabsActive.state = 0
	editorTabsActive.encoding = 'UTF-8'
	editorTabsActive.historys = []
	editorTabs.value = []
	editorSeesion.value = []
}

/**
 * @description 获取文件内容，钩子函数
 * @param {string} path 文件路径
 * @param {string} mode reverse
 * @param {number} p 分页
 * @returns {Promise<void>}
 */
export const useGetFileBody = async (path: string, mode?: string, p?: number) => {
	let params = {
		path,
		mode,
		p,
	}
	if (!mode) delete params.mode
	if (!p) delete params.p
	return await getFileBody(params)
}

/**
 * @description 保存编辑配置
 * @param aceConfig
 */
export const useSaveFileBody = async (data: fileSaveData) => {
	let params = {
		path: data.path,
		data: data.data,
		encoding: data.encoding || 'UTF-8',
		st_mtime: data.st_mtime,
		force: data.force || 0,
		skip_conf_check: data.skip_conf_check || false,
	} as fileSaveData
	if (!data.skip_conf_check) delete params.skip_conf_check
	return await saveFileBody(params)
}

/**
 * @description 保存文件内容
 */
export const useSaveFiles = async (item: editorTabsItemsProps, force: number = 0, isCheck: boolean = false) => {
	if (item.state === 0) {
		return Message.msg({
			customClass: 'no-icon',
			message: `文件未修改,无需保存！`,
			type: 'info',
		})
	}
	const load = Message.load('保存中，请稍候...')
	useSetEditorTabsReadOnly(true) // 设置只读,防止用户在保存期间编辑
	try {
		const session = useGetAceEditorSession(item.id)
		const data = session.getValue()
		const { path, encoding, stTime: st_mtime } = item
		const newData = { path, data, st_mtime, encoding, force } as fileSaveData
		if (isCheck) newData.skip_conf_check = true
		item.state = 3
		const res = await useSaveFileBody(newData as fileSaveData)
		if (!res.status) {
			if ((res as any)?.conf_check) {
				return useforcedSaveConfig(item, res.msg)
			} else {
				return useforcedSaveFiles(item, res.msg)
			}
		} else {
			Message.request(res)
		}
		enableRefresh()
		await useRefreshFileContent(item as editorTabsItemsProps, false)
	} catch (error) {
		console.log(error)
	} finally {
		load && load.close()
		useSetEditorTabsReadOnly(false) // 保存完成后,设置为可编辑
	}
}

/**
 * @description 强制保存文件
 * @param item
 * @param msg
 */
const useforcedSaveFiles = async (item: editorTabsItemsProps, msg: string) => {
	const message = msg.substr(0, msg.length - 1) + '，或选择强制保存。'
	item.state = 1
	await useConfirm({
		title: `提示`,
		width: '35rem',
		icon: 'warning',
		content: message,
	})
	await useConfirm({
		title: `是否强制保存`,
		width: '35rem',
		icon: 'warning',
		isHtml: true,
		content: '<span style="color:#333">检测到文件已被修改，强制保存将会<span style="color:red">覆盖文件内容</span>，请谨慎操作!</span>',
	})
	await useSaveFiles(item, 1)
}

/**
 * @description 强制保存配置文件
 * @param item
 * @param msg
 **/
export const useforcedSaveConfig = async (item: editorTabsItemsProps, msg: string) => {
	const message = msg.substr(0, msg.length - 1) + '，或选择强制保存。'
	item.state = 1
	await useConfirm({
		title: '提示',
		width: 60,
		isHtml: true,
		content: `<div class="custom-message-error-html">
					${message}
					<div class="leading-[1.6rem] mt-1rem">请确认您要保存的配置文件内容无误与提示信息无关，注本次保存不会重载nginx/apache配置</div>
				</div>`,
		confirmText: '继续保存',
	})
	await useSaveFiles(item, 0, true)
}

/**
 * @description 保存全部文件
 */
export const useSaveAllFiles = async () => {
	const load = Message.load('保存中，请稍候...')
	try {
		const saveFiles = []
		for (let i = 0; i < editorTabs.value.length; i++) {
			const item = editorTabs.value[i]
			if (item.state === 1) {
				saveFiles.push(useSaveFiles(item, 0))
			}
		}
		await Promise.all(saveFiles) // 保存全部文件
		enableRefresh()
	} catch (error) {
		console.log(error)
	} finally {
		load && load.close()
	}
}

/**
 * @description 关闭编辑器检查是否有文件修改
 **/
export const useCheckFileChange = async () => {
	let flag = false
	if (editorTabs.value.length > 0) {
		flag = editorTabs.value.some(tab => tab.state === 1)
	}
	return flag
}

/**
 * @description 关闭其他tab项
 * @param {editorTabsItemsProps} item 当前激活的tab项
 */
export const useCloseOtherTabs = async (item: editorTabsItemsProps) => {
	const activeId = item.id
	const modifiedTabs = editorTabs.value.filter(tab => tab.id !== activeId && tab.state === 1)
	if (modifiedTabs.length > 0) {
		editorCloseDialog('other', item)
	} else {
		editorTabs.value = editorTabs.value.filter(tab => tab.id === activeId)
		editorSeesion.value = editorSeesion.value.filter(session => session.id === activeId)
		useSetEditorTabsActive(activeId) // 设置激活的编辑器tab项

		// 清除其他编辑器会话
		const activeSession = useGetAceEditorSession(activeId)
		editorExample.value.setSession(activeSession)

		// 更新编辑器行列数和焦点
		useGetEditorTabsLineCount(editorExample.value)
		useSetEditorTabsReadOnly(item.isReadOnly)
		useSetEditorTabsFocus()
	}
}

/**
 * @description 关闭全部tab项
 */
export const useCloseAllTabs = async () => {
	const checkRes = await useCheckFileChange()
	if (checkRes) {
		try {
			editorCloseDialog('all')
		} catch (error) {
			console.log('保存文件时出错：', error)
		}
	} else {
		// 清除所有编辑器会话和tabs
		editorTabs.value.forEach(tab => {
			const session = useGetAceEditorSession(tab.id)
			if (session) {
				session.destroy()
			}
		})

		editorTabs.value = []
		editorSeesion.value = []
		editorExample.value.setSession(null) // 清除编辑器的会话
	}
}

/**
 * 检测文本的行结束符类型
 * @param text 需要检测的文本内容
 * @returns 返回行结束符类型：'CRLF'或默认'LF'
 */
export const useDetectLineBreakType = (text: string): string => {
	if (!text) return 'LF'

	// 只检查文件的前20000个字符或整个文件（取较小值）
	// 这通常足以确定行结束符类型，同时避免处理大文件时的性能问题
	const sampleText = text.length > 20000 ? text.substring(0, 20000) : text

	// 使用indexOf代替includes，找到第一个匹配后就立即返回
	if (sampleText.indexOf('\r\n') !== -1) {
		return 'CRLF'
	}

	// 默认返回LF
	return 'LF'
}

/**
 * 设置行结束符类型
 * @param id 选项卡ID
 * @param type 要设置的行结束符类型：'CRLF'或'LF'
 */
export const useSetLineBreak = (id: string, type: string) => {
	// 根据ID查找编辑器选项卡
	const tabItem = useFindTabsData(id)
	if (!tabItem) return

	// 如果当前行结束符与目标类型相同，则不需要转换
	if (tabItem.lineBreak === type) {
		return
	}

	// 显示确认对话框
	const typeText = type === 'CRLF' ? 'CRLF' : 'LF'
	const currentTypeText = tabItem.lineBreak === 'CRLF' ? 'CRLF' : 'LF'

	useConfirm({
		title: '更改行结束符',
		isHtml: true,
		content: `<div class="custom-message-error-html">
					确定要将文件 "${tabItem.title}" 的行结束符从 ${currentTypeText} 更改为<span style="color:red">${typeText}</span> 吗？
					<div class="leading-[1.6rem]">
						此操作将修改文件中所有的行结束符，并在<span style="color:red">保存</span>后生效。
					</div>
				</div>`,
		confirmText: '保存',
		cancelText: '取消',
		onConfirm: async () => {
			try {
				// 获取编辑器会话
				const session = useGetAceEditorSession(tabItem.id)
				if (!session) return true

				// 获取当前文本内容
				let content = session.getValue()

				// 转换行结束符
				if (type === 'CRLF' && tabItem.lineBreak === 'LF') {
					// 将LF转换为CRLF - 使用字符串替换更安全
					content = content.replace(/\n/g, '\r\n')
				} else if (type === 'LF' && tabItem.lineBreak === 'CRLF') {
					// 将CRLF转换为LF
					content = content.replace(/\r\n/g, '\n')
				}

				// 更新编辑器内容
				session.setValue(content)

				// 更新选项卡的行结束符类型
				tabItem.lineBreak = type

				// 如果文件已经有更改，则标记为已修改
				if (tabItem.state === 0) {
					tabItem.state = 1
				}

				// 发送保存请求
				await useSaveFiles(tabItem)

				// 提示成功
				Message.success(`已将行结束符更改为 ${typeText}`)
				return true
			} catch (error) {
				console.error('更改行结束符失败:', error)
				Message.error('更改行结束符失败')
				return false
			}
		},
	}).catch(() => {
		// 用户取消操作，不做任何处理
	})
}

/**
 * @description 销毁所有的编辑器会话
 */
export const useDestroyAllEditorSession = () => {
	editorSeesion.value.forEach(session => session.destroy())
	editorSeesion.value = []
}
