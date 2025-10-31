import { useGlobalStore } from '@/store/global'
import { defineStore } from 'pinia'
import FILES_STORE from '@files/store'
import RowNameInput from '@files/public/ace/sidebar/row-name/index.vue'
import {
	useCheckFileChange,
	useDestroyEditorData,
	handleKeyDown,
	enableRefresh,
	useCheckTabsEmpty,
	editorTabsActive,
	useGetFileMode,
	editorTabs,
	editorCustomToolbar,
	editorExample,
	useCreateDiffEditorExample,
	useCreateEditorTabs,
	useEditorUnLoading,
	useGetEditorOptions,
	useCreateAceEditorExample,
	useCutEditorTabs,
	useRemoveEditorTabs,
	useSaveEditorOptions,
	editorOption,
	useSaveFiles,
	useRefreshFileContent,
	reHistoryRow,
	recoverEvent,
	useSaveAllFiles,
	editorSeesion,
	useSetEditorTabsActive,
	useGetAceEditorSession,
	useGetEditorTabsLineCount,
	useSetEditorTabsReadOnly,
	useSetEditorTabsFocus,
} from '@files/public/ace/useMethods'
import { getFileDirList as getFileDirListData, setFileHistory } from '@api/files'
import { contextRow, currentPath, newData, createFile, clearExpandedKeys, expandedKeys, initStatus, isFirstLoad, appendData, getFileDirList, treeRef, loadNode as getLoadNode, updateData as updateDataFn, isNewMenuShow, showContext } from '@files/public/ace/sidebar/useMethods'
import { editorLeaveDialog, reconstructionFile } from '@files/useMethods'
import { Message, useDataHandle, useDialog } from '@/hooks/tools'
import { editorType } from '@files/types'

const FILES_ACE_STORE = defineStore('FILES-ACE-STORE', () => {
	const { routerActive, mainHeight } = useGlobalStore()

	const filesStore = FILES_STORE()
	const { bindKeydown } = filesStore

	const fileItem = ref<any>() // 组件数据
	const instance = ref<any>() // 实例

	const btnShow = ref(true) // 按钮显示隐藏
	const catalogueShow = ref(true) // 目录栏显示隐藏

	// 离开动画
	const onLeave = () => {
		btnShow.value = false
		setTimeout(() => {
			btnShow.value = true
		}, 500)
	}

	const close = async () => {
		clearExpandedKeys()
		enableRefresh()
		const popup = await instance.value
		popup?.unmount()
	}

	const onCancel = async () => {
		// 检查是否有未保存的数据
		const res = await useCheckFileChange()
		if (res) {
			if (document.querySelector('.bt-dialog-header .svgtofont-icon-minmax-black')) {
				document.querySelector('.bt-dialog-header .svgtofont-icon-minmax-black')?.click()
			}
			editorLeaveDialog(close)
			return false
		} else {
			//清除缓存
			localStorage.removeItem('aceEditor')
			// 销毁编辑器
			useDestroyEditorData()
			close()
		}
		return false
	}

	// toolbars
	const column = ref([
		{
			title: '保存',
			icon: 'svgtofont-el-select',
			click: () => {
				checkOperationAvailable() && useSaveFiles(editorTabsActive)
			},
		},
		{
			title: '全部保存',
			icon: 'svgtofont-icon-minmax-black',
			click: () => {
				checkOperationAvailable() && useSaveAllFiles()
			},
		},
		{
			title: '刷新',
			icon: 'svgtofont-el-refresh-right',
			click: async () => {
				// if (editorTabsActive.state === 1) {
				// 	await ConfirmBox.confirm({
				// 		title: `是否刷新当前文件`,
				// 		width: '35rem',
				// 		icon: 'warning',
				// 		type: 'calc',
				// 		message: `刷新当前文件会覆盖当前修改,是否继续操作？`,
				// 	})
				// }
				checkOperationAvailable() && useRefreshFileContent(editorTabsActive, true)
			},
		},
		{
			title: '搜索',
			icon: 'svgtofont-el-search',
			click: () => {
				checkOperationAvailable() && editorExample.value.execCommand('find')
			},
		},
		{
			title: '替换',
			icon: 'svgtofont-icon-log',
			click: () => {
				checkOperationAvailable() && editorExample.value.execCommand('replace')
			},
		},
		{
			title: '跳转行',
			icon: 'svgtofont-icon-login-address',
			click: () => {
				checkOperationAvailable() && watchEditorCustomToolbar('jump')
			},
		},
		{
			title: '字体大小',
			icon: 'svgtofont-left-xterm',
			click: () => {
				checkOperationAvailable() && watchEditorCustomToolbar('font')
			},
		},
		{
			title: '主题',
			icon: 'svgtofont-icon-drag',
			click: () => {
				checkOperationAvailable() && watchEditorCustomToolbar('theme')
			},
		},
		{
			title: '设置',
			icon: 'svgtofont-left-config',
			click: () => {
				checkOperationAvailable() && watchEditorCustomToolbar('set')
			},
		},
		// {
		// 	title: '文件足迹',
		// 	icon: 'svgtofont-left-crontab',
		// 	click: () => {
		// 		FilesHistoryRecordView()
		// 	},
		// },
		{
			title: '快捷键',
			icon: 'svgtofont-el-question-filled',
			click: () => {
				const editorFind = editorTabs.value.find(item => item.title === '快捷键')
				// 已经存在则切换到该标签
				if (editorFind) {
					useCutEditorTabs(editorFind.id)
					watchEditorCustomToolbar('shortcutKey')
					return
				}
				useCreateEditorTabs({
					type: 'custom',
					title: '快捷键',
					component: defineAsyncComponent(() => import('@files/public/ace/content/shortcut-key/index.vue')),
				})
			},
		},
	])

	/**
	 * @description: 检查操作是否可用
	 */
	const checkOperationAvailable = () => {
		if (!useCheckTabsEmpty() || editorTabsActive.type === 'custom') {
			Message.error('当前页面不支持该操作')
			return false
		}
		return true
	}

	/**
	 * @description: 打开弹窗
	 * @param {any} btn 按钮
	 */
	const openPopup = (btn: any) => {
		if (!useCheckTabsEmpty) {
			Message.error('当前页面不支持该操作')
			return
		}
		// editorCustomToolbar.value = ''
		btn.click()
	}

	// sidebar
	const operSize = ref(0)
	const changeOpertion = (type: string) => {
		operSize.value = type === 'search' ? 76 : 0
	}
	const isShow = ref(false) // 是否显示
	const inputRef = ref<any>(null)
	const originalPath = ref('') // 原始路径

	/**
	 * @description 当前是否点击目录路径获取焦点
	 */
	const inputFocus = () => {
		isShow.value = true
		nextTick(() => {
			inputRef.value?.focus()
		})
	}

	// 根据输入路径搜索
	const changeCurrentPath = async () => {
		try {
			isShow.value = false
			if (currentPath.value !== originalPath.value) {
				originalPath.value = currentPath.value // 更新原始值为新值
				const { data } = await useDataHandle({
					request: getFileDirListData({
						p: 1,
						showRow: 500,
						sort: 'name',
						reverse: 'False',
						path: currentPath.value,
					}),
				})
				const dirList = data.dir.map((item: any) => reconstructionFile('dir', item, undefined, data.path))
				const fileList = data.files.map((item: any) => reconstructionFile('file', item, undefined, data.path))
				newData.value = [...dirList, ...fileList]
				currentPath.value = data.path
			}
		} catch (error) {
			console.log(error)
		}
	}

	const type = ref('btn') // 类型btn | search
	const isCheck = ref(false) // 是否包含目录文件
	const searchValue = ref('')
	const oldValue = ref([])
	const oldPath = ref('')

	const handleCommand = (type: 'dir' | 'file') => {
		const { newFile, dataPathFileName } = createFile(type)
		const dataKey = dataPathFileName || (contextRow.value?.isFile ? undefined : contextRow.value?.path)
		if (dataKey) {
			const node = treeRef.value.getNode(dataKey)
			if (node) {
				node.expanded = true
			}
		}

		appendData(newFile, dataKey, treeRef)
	}

	const searchFile = async () => {
		const data = await getFileDirList(currentPath.value, searchValue.value, isCheck.value ? 'True' : undefined)
		isFirstLoad.value = false
		if (!data) return
		newData.value = data
		initStatus()
	}

	const closeSearch = () => {
		type.value = 'btn'
		// changeValue(type.value)
		// changeOpertion(type.value)
		initStatus()
	}

	const changeValue = (value: string) => {
		expandedKeys.value.length = 0
		// 初始化输入框的值
		searchValue.value = ''
		if (value === 'search') {
			oldValue.value = newData.value
			oldPath.value = currentPath.value
			newData.value = []
			isFirstLoad.value = true
		} else {
			newData.value = oldValue.value
			// 初始设置 旧路径为空时 设置原始路径
			if (currentPath.value === '') originalPath.value = oldPath.value
			currentPath.value = oldPath.value
		}
	}

	const rowNameInputRef = ref<any>(null) // 行名输入框实例
	const contextRef = ref<any>(null) // 右键菜单实例
	let changeNode = ref() // 改变的节点

	const treeProps = {
		label: 'fileName',
		key: 'path',
		isLeaf: 'isFile', // 判断是否是文件,如果是文件就为叶子没有children
	}
	const loadNode = async (node: any, resolve: any, ...attrs: any) => {
		getLoadNode(node, resolve, fileItem.value)
	}

	/**
	 * @description 渲染树节点
	 * @param h
	 * @param param1
	 * @returns
	 */
	const renderTree = (h: any, { node, data, store }: any) => {
		const { mode } = useGetFileMode(data.fileName)

		return (
			<span
				class={`flex flex-1 items-center w-full ${data.isReName ? 'newFiles' : 'defaultFiles'}`}
				onContextmenu={(event: MouseEvent) => {
					event.preventDefault() // 阻止默认右键菜单
					openShowMeun(event, data)
				}}>
				<span class={`icon-editor-left ${data.isFile ? `ace-${mode}-icon ace-text-icon` : 'ace-folder-icon'}`}></span>
				{data.isReName ? (
					<RowNameInput class="el-tree-node__label" title={data.fileName} rowData={data} refreshData={updateDataFn} v-model={changeNode} ref={rowNameInputRef} />
				) : (
					<span class={`el-tree-node__label ${getClass(data)}`} title={data.fileName}>
						{data.fileName}
					</span>
				)}
			</span>
		)
		// const vNode = [
		// 	h('span', {
		// 		class: (data.isFile ? `ace-${mode}-icon ace-text-icon` : 'ace-folder-icon') + ' icon-editor-left',
		// 	}),
		// 	data.isReName
		// 		? h(RowNameInput, {
		// 				class: 'el-tree-node__label',
		// 				attrs: {
		// 					title: data.fileName,
		// 				},
		// 				props: {
		// 					rowData: data, // 确保rowData作为prop传递
		// 					refreshData: updateDataFn,
		// 					value: changeNode,
		// 				},
		// 				on: {
		// 					'update:value': (newValue: any) => {
		// 						changeNode.value = newValue;
		// 					},
		// 				},
		// 				ref: rowNameInputRef,
		// 		  })
		// 		: h(
		// 				'span',
		// 				{
		// 					class: 'el-tree-node__label ' + getClass(data),
		// 					attrs: {
		// 						title: data.fileName,
		// 					},
		// 				},
		// 				data.fileName
		// 		  ),
		// ];
		// return h(
		// 	'span',
		// 	{
		// 		class: `flex items-center ${data.isReName ? 'newFiles' : 'defaultFiles'}`,
		// 		on: {
		// 			contextmenu: (event: MouseEvent) => {
		// 				event.preventDefault(); // 阻止默认右键菜单
		// 				openShowMeun(event, data);
		// 			},
		// 		},
		// 	},
		// 	vNode
		// );
	}

	const removeNodeFn = (removeNode: any) => {
		const node = treeRef.value.getNode(removeNode)
		if (node && removeNode.isNew) {
			treeRef.value.remove(node)
		}
		if (node && removeNode.isReName) {
			removeNode.isReName = false
		}
		isNewMenuShow.value = false
	}

	// 右键菜单
	const openShowMeun = (event: MouseEvent, data: any) => {
		// 右键时如果已经打开新建框就去除
		removeNodeFn(changeNode.value)
		showContext(event, data, contextRef) // 显示自定义右键菜单
	}

	// 节点展开
	const handleExpandChange = (data: any) => {
		if (data?.path && !expandedKeys.value.includes(data.path)) {
			expandedKeys.value.push(data.path)
		}
	}

	// 节点关闭
	const handleCollapseChange = (data: any) => {
		const index = expandedKeys.value.indexOf(data?.path)
		if (index !== -1) {
			expandedKeys.value.splice(index, 1)
			// removeNodeFn(changeNode.value)
			// isNewMenuShow.value = false
		}
		removeNodeFn(changeNode.value)
	}

	// 类名挂载
	const getClass = (data: any) => {
		const isClass = editorTabs.value.some(item => item.path === data.path)
		return isClass ? 'text-[#cca700]' : ''
	}

	const initSidebarList = () => {
		nextTick(() => {
			let path = fileItem.value.path || '/www'
			const arr = path.split('/')
			arr.pop()
			if (currentPath.value === '') originalPath.value = arr.join('/')
			currentPath.value = arr.join('/')
		})
	}

	// sidebar end

	// content

	const editorRef = ref()
	const editorDiffRef = ref()
	const showToolbar = ref(false) // 是否显示工具栏

	const watchEditorCustomToolbar = (val: any) => {
		editorCustomToolbar.value = val
		showToolbar.value = val !== ''
		if (val) window.addEventListener('click', closeToolbar)
	}

	const closeToolbar = () => {
		editorCustomToolbar.value = ''
		window.removeEventListener('click', closeToolbar)
	}

	/**
	 * @description 创建编辑器视图
	 * @param {Element} el 编辑器容器
	 */
	const createEditorView = async (refs: Ref) => {
		await useGetEditorOptions() // 同步编辑器配置
		editorExample.value = await useCreateAceEditorExample(refs) // 挂载编辑器实例
		watchAceEditor(editorOption.aceEditor) // 监听编辑器配置
	}

	/**
	 * @description 创建diff编辑器
	 *@param {Element} el 编辑器容器
	 */
	const createDiffEditorView = async (refs: any) => {
		useCreateDiffEditorExample(refs) // 挂载编辑器实例
	}

	const resizeEditor = () => {
		if (editorExample.value) {
			nextTick(() => {
				editorExample.value.resize()
			})
		}
	}

	const initContent = async () => {
		await createEditorView(editorRef.value)
		// 创建编辑器标签，激活当前编辑器
		if (fileItem.value)
			await useCreateEditorTabs({
				title: fileItem.value.fileName,
				type: (fileItem.value.type as editorType) || 'editor',
				path: fileItem.value.path,
				size: fileItem.value.size,
			})
		createDiffEditorView(editorDiffRef.value)
		await setFileHistory({ name: fileItem.value.fileName, path: fileItem.value.path })
		await useEditorUnLoading()
	}

	const tabsElement = ref<any>(null)
	const contextmenu = ref<any>(null)
	const headerRightRow = ref<any>({})

	/**
	 * @description: 获取数据 后切换tab
	 */
	const getDataChangeTab = () => {
		nextTick(() => {
			const newTab = editorTabs.value[editorTabs.value.length - 1]
			const newTabElement = tabsElement.value?.children[editorTabs.value.length - 1]
			changeTab(newTab.id, { currentTarget: newTabElement })
		})
	}

	/**
	 * @description 切换标签页
	 * @param {string} id 标签页id
	 * @param {Event | { currentTarget: HTMLElement }} event 事件对象
	 */
	const changeTab = (id: string, event: Event | { currentTarget: HTMLElement } | null) => {
		useCutEditorTabs(id)
		// 滚动到当前标签页
		if (event) {
			const target = ((event as Event).currentTarget as HTMLElement) || (event as { currentTarget: HTMLElement }).currentTarget
			const container = tabsElement.value

			const containerWidth = container.offsetWidth
			const targetOffsetLeft = target.offsetLeft
			const targetWidth = target.offsetWidth

			// 计算居中位置
			const scrollPosition = targetOffsetLeft - containerWidth / 2 + targetWidth / 2

			container.scroll({
				left: scrollPosition,
				behavior: 'smooth',
			})
		}
	}

	const openContextMenu = (event: MouseEvent) => {
		// 显示右键菜单
		contextmenu.value.show(event)
		headerRightRow.value = editorTabsActive
	}

	const closeTab = async (item: any) => {
		useRemoveEditorTabs(item)
	}

	// 滚轮事件
	const handleWheel = (event: any) => {
		event.preventDefault()
		const { deltaY } = event
		tabsElement.value.scrollLeft += deltaY
	}

	const initContentHeader = () => {
		// 加载后获取实例
		nextTick(() => {
			tabsElement.value.addEventListener('wheel', handleWheel)
		})
	}

	const $resetContentHeader = () => {
		if (tabsElement.value) {
			tabsElement.value.removeEventListener('wheel', handleWheel)
		}
	}

	const { fontSize, tabSize, editorTheme, useSoftTabs } = toRefs(editorOption.aceEditor)
	const encodingData = ref(editorTabsActive.encoding)
	// 菜单栏
	const tool = [
		{ title: '跳转到指定行', type: 'jump' },
		{ title: '设置编辑器字体大小', type: 'font' },
		{ title: '设置编辑器主题', type: 'theme' },
		{ title: '编辑器设置', type: 'set' },
		{ title: '设置文件保存编码格式', type: 'encode' },
		{ title: '设置文件保存空格设置', type: 'encode' },
		{ title: '设置文件保存行结束符', type: 'lineBreak' },
	]

	// 设置菜单
	const set = [
		{ title: '自动换行', type: 'wrap' },
		{ title: '代码自动完成', type: 'enableLiveAutocompletion' },
		{ title: '启用代码段', type: 'enableSnippets' },
		{ title: '显示隐藏字符', type: 'showInvisibles' },
		{ title: '显示行号', type: 'showLineNumbers' },
	]

	const tabData = [
		{ title: '使用空格缩进', type: 'nbsp' },
		{ title: '使用制表符缩进', type: 'tab' },
	]

	const unTitleArr = ['shortcutKey', '', 'tab']
	const line = ref(0) // 跳转行数

	/**
	 * @description: 跳转指定行
	 */
	const jumpLine = () => {
		// 判断是否为小数
		if (line.value % 1 !== 0) {
			Message.error('请输入整数')
			return
		}
		editorExample.value.gotoLine(line.value)
	}
	/**
	 * @description: 保存字体大小
	 */
	const saveFont = () => {
		if (editorOption.aceEditor.fontSize > 45 || editorOption.aceEditor.fontSize < 12) {
			Message.error('字体设置范围超过12-45')
			return
		}
		editorExample.value.setFontSize(editorOption.aceEditor.fontSize)
		useSaveEditorOptions()
	}
	/**
	 * @description: 设置主题
	 * @param {string} theme 主题
	 */
	const setTheme = (theme: 'monokai' | 'chrome') => {
		editorTheme.value = theme
		editorExample.value.setTheme('ace/theme/' + theme)
		editorOption.aceEditor.editorTheme = theme
		useSaveEditorOptions()
	}
	/**
	 * @description: 编辑器设置
	 * @param {string} type 设置类型
	 */
	const seting = (type: string) => {
		// 设置取反
		editorOption.aceEditor[type] = !editorOption.aceEditor[type]
		editorExample.value.setOption(type, editorOption.aceEditor[type])
		useSaveEditorOptions()
		watchAceEditor(editorOption.aceEditor)
	}
	/**
	 * @description: 设置编码格式
	 * @param type
	 */
	const setCode = async (type: 'ASCII' | 'UTF-8' | 'GBK' | 'GB2312' | 'BIG5') => {
		// 设置编码格式
		editorTabsActive.state = 1
		editorTabsActive.encoding = type
		await useSaveEditorOptions()
		await useSaveFiles(editorTabsActive)
		encodingData.value = type
		// 关闭设置
		// editorCustomToolbar.value = ''
	}

	/**
	 * @description: 编辑器设置缩进
	 * @param {string | number} data 设置类型
	 */
	const setTabType = (data: string | number) => {
		if (typeof data === 'string') {
			// 设置制表符
			useSoftTabs.value = data === 'tab' ? true : false
			editorOption.aceEditor.useSoftTabs = data === 'tab' ? true : false
		} else {
			tabSize.value = data
			editorOption.aceEditor.tabSize = data
		}
		useSaveEditorOptions()
	}

	// content end

	// status-bar
	const fileInfo = reactive<any>({
		line: 123,
		column: 321,
		historys: [],
		tabsData: { type: 'nbsp', number: 4 },
		encoding: 'utf-8',
		only_read: false,
		mode: 'text',
	})

	/**
	 * @description 打开历史版本
	 */
	const openHistory = () => {
		useDialog({
			title: `文件历史版本`,
			area: 55,
			component: () => import('@files/public/ace/history-version/index.vue'),
			compData: {
				editorTabsActive,
				callback: () => {
					useRefreshFileContent(editorTabsActive, true)
				},
			},
		})
	}

	const watchAceEditor = (value: any) => {
		if (value) {
			fileInfo.tabsData.number = value.tabSize
			fileInfo.tabsData.type = value.useSoftTabs ? 'tab' : 'nbsp'
		}
	}

	// status-bar end

	// diff-status-bar

	const diffReHistory = async () => {
		await recoverEvent(reHistoryRow.value)
		await useRefreshFileContent(reHistoryRow.value, true)
		reHistoryRow.value = {}
	}

	// diff-status-bar end

	// check-file-change

	const onConfirmCheckFile = async (close?: any) => {
		await useSaveAllFiles()
		//清除缓存
		localStorage.removeItem('aceEditor')
		// 销毁编辑器
		useDestroyEditorData()
		close && close()
	}

	/**
	 * @description 关闭
	 */
	const onCancelCheckFile = (close?: any) => {
		//清除缓存
		localStorage.removeItem('aceEditor')
		// 销毁编辑器
		useDestroyEditorData()
		close && close.onUnmount && close.onUnmount()
	}

	// check-file-change end

	// check-file-close

	const compDataClose = ref<any>()

	const clearEditorSessions = (activeId: any) => {
		editorTabs.value = editorTabs.value.filter((tab: any) => tab.id === activeId)
		editorSeesion.value = editorSeesion.value.filter((session: any) => session.id === activeId)
		useSetEditorTabsActive(activeId) // 设置激活的编辑器tab项

		// 清除其他编辑器会话
		const activeSession = useGetAceEditorSession(activeId)
		editorExample.value.setSession(activeSession)

		// 更新编辑器行列数和焦点
		useGetEditorTabsLineCount(editorExample.value)
		useSetEditorTabsReadOnly(compDataClose.value.item.isReadOnly)
		useSetEditorTabsFocus()
	}

	const clearEditorSessionsAll = () => {
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

	/**
	 * @description 确认事件
	 */
	const onConfirmClose = async () => {
		try {
			switch (compDataClose.value.type) {
				case 'close':
					await useSaveFiles(compDataClose.value.item)
					useRemoveEditorTabs(compDataClose.value.item)
					break
				case 'other':
					const activeId = compDataClose.value.item.id
					const modifiedTabs = editorTabs.value.filter((tab: any) => tab.id !== activeId && tab.state === 1)
					if (modifiedTabs.length > 0) {
						await Promise.all(modifiedTabs.map((tab: any) => useSaveFiles(tab)))
					}
					clearEditorSessions(activeId)
					break
				case 'all':
					await useSaveAllFiles()
					clearEditorSessionsAll()
					break
			}
		} catch (error) {
			console.error(error)
		}
		return true
	}

	const onCancelClose = (close?: any) => {
		switch (compDataClose.value.type) {
			case 'close':
				compDataClose.value.item.state = 0
				useRemoveEditorTabs(compDataClose.value.item)
				break
			case 'other':
				clearEditorSessions(compDataClose.value.item.id)
				break
			case 'all':
				clearEditorSessionsAll()
				break
		}
		close && close.onUnmount && close.onUnmount()
	}

	// check-file-close end

	const init = () => {
		window.addEventListener('keydown', handleKeyDown)
	}

	const $reset = () => {
		window.removeEventListener('keydown', handleKeyDown)
		bindKeydown() // 恢复列表键盘事件
	}

	return {
		instance, // 编辑器实例
		fileItem, // 组件数据
		routerActive,
		btnShow,
		catalogueShow,
		onLeave,
		close,
		onCancel,

		// toolbars
		column,
		openPopup,

		// sidebar
		mainHeight,
		operSize,
		changeOpertion,
		isShow,
		inputRef,
		inputFocus,
		originalPath,
		changeCurrentPath,
		type,
		isCheck,
		searchValue,
		changeValue,
		searchFile,
		handleCommand,
		closeSearch,
		contextRef,
		treeProps,
		initSidebarList,
		loadNode,
		renderTree,
		handleExpandChange,
		handleCollapseChange,

		// content
		editorRef,
		editorDiffRef,
		showToolbar,
		watchEditorCustomToolbar,
		closeToolbar,
		initContent,
		resizeEditor,
		tabsElement,
		contextmenu,
		headerRightRow,
		changeTab,
		getDataChangeTab,
		closeTab,
		openContextMenu,
		initContentHeader,
		$resetContentHeader,
		fontSize,
		tabSize,
		editorTheme,
		useSoftTabs,
		encodingData,
		line,
		tool,
		set,
		tabData,
		unTitleArr,
		saveFont,
		jumpLine,
		setCode,
		setTabType,
		setTheme,
		seting,

		// status-bar
		fileInfo,
		openHistory,
		watchAceEditor,

		// diff-status-bar
		diffReHistory,

		// check-file-change
		onConfirmCheckFile,
		onCancelCheckFile,

		// check-file-close
		compDataClose,
		onConfirmClose,
		onCancelClose,

		init,
		$reset,
	}
})

export default FILES_ACE_STORE
