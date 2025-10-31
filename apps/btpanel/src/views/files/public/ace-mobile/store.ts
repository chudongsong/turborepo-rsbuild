import { defineStore } from 'pinia'
import {
	editorExample,
	editorTabs,
	editorTabsActive,
	enableRefresh,
	useCheckFileChange,
	useCheckTabsEmpty,
	useCreateAceEditorExample,
	useCreateEditorTabs,
	useCutEditorTabs,
	useDestroyEditorData,
	useEditorUnLoading,
	useGetEditorOptions,
	useGetFileMode,
	useRefreshFileContent,
	useRemoveEditorTabs,
	useSaveAllFiles,
	useSaveFiles,
} from '@files/public/ace/useMethods'
import { editorLeaveDialog, FilesHistoryRecordView } from '@files/useMethods'
import { clearExpandedKeys, currentPath, expandedKeys, loadNode as getLoadNode, isNewMenuShow, openFile, showContext, treeRef, treeContainerRef, isFirstLoad, newData, initStatus, createFile, getFileDirList, appendData, contextRow } from '@files/public/ace/sidebar/useMethods'
import { useGlobalStore } from '@/store/global'
import { setFileHistory } from '@/api/files'
import { Message } from '@/hooks/tools'

const FILES_ACE_MOBILE_STORE = defineStore('FILES-ACE-MOBILE-STORE', () => {
	const { mainHeight } = useGlobalStore()

	const fileItem = ref<any>() // 组件数据
	const instance = ref<any>() // 实例
	let interval: any

	const tabsElement = ref<any>(null)

	/**
	 * @description 获取数据后切换标签页
	 */
	const getDataChangeTab = () => {
		nextTick(() => {
			const newTab = editorTabs.value[editorTabs.value.length - 1]
			const newTabElement = tabsElement.value.children[editorTabs.value.length - 1]
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

	const closeTab = async (item: any) => {
		useRemoveEditorTabs(item)
	}

	// 滚轮事件
	const handleWheel = (event: any) => {
		event.preventDefault()
		const { deltaY } = event
		tabsElement.value.scrollLeft += deltaY
	}

	const initHeader = () => {
		// 加载后获取实例
		nextTick(() => {
			tabsElement.value.addEventListener('wheel', handleWheel)
		})
	}

	const $resetHeader = () => {
		if (tabsElement.value) {
			tabsElement.value.removeEventListener('wheel', handleWheel)
		}
	}

	const editorRef = ref()

	/**
	 * @description 创建编辑器视图
	 * @param {Element} el 编辑器容器
	 */
	const createEditorView = async (refs: Ref) => {
		await useGetEditorOptions() // 同步编辑器配置
		editorExample.value = await useCreateAceEditorExample(refs) // 挂载编辑器实例
	}

	const initContent = async () => {
		await createEditorView(editorRef.value)
		// 创建编辑器标签，激活当前编辑器
		if (fileItem)
			await useCreateEditorTabs({
				title: fileItem.value.fileName,
				type: 'editor',
				path: fileItem.value.path,
				size: fileItem.value.size,
			})
		await setFileHistory({ name: fileItem.value.fileName, path: fileItem.value.path })
		await useEditorUnLoading()
	}

	const isShow = ref(false)
	const dropdownMenu = ref<HTMLElement | null>(null)

	const handleClickOutside = (event: MouseEvent) => {
		if (dropdownMenu.value && !dropdownMenu.value.contains(event.target as Node)) {
			isShow.value = false
		}
	}

	const isShowTool = ref(false) // 是否显示
	const dropdownMenuRef = ref<HTMLElement | null>(null)
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
			title: '文件足迹',
			icon: 'svgtofont-left-crontab',
			click: () => {
				FilesHistoryRecordView()
			},
		},
		{
			title: '退出',
			icon: 'svgtofont-el-close',
			click: () => {
				onCancel()
			},
		},
	])

	/**
	 * @description: 打开弹窗
	 * @param {any} btn 按钮
	 */
	const openPopup = (btn: any) => {
		if (!useCheckTabsEmpty) {
			Message.error('当前页面不支持该操作')
			return
		}
		isShowTool.value = false
		// editorCustomToolbar.value = ''
		btn.click()
	}

	const handleClickOutsideEvent = (event: MouseEvent) => {
		if (dropdownMenuRef.value && !dropdownMenuRef.value.contains(event.target as Node)) {
			isShowTool.value = false
		}
	}

	const closeEvent = async () => {
		clearExpandedKeys()
		enableRefresh()
		close()
	}

	const onCancel = async () => {
		// 检查是否有未保存的数据
		const res = await useCheckFileChange()
		if (res) {
			editorLeaveDialog(closeEvent)
		} else {
			//清除缓存
			localStorage.removeItem('aceEditor')
			// 销毁编辑器
			useDestroyEditorData()
			closeEvent()
		}
		return false
	}

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

	const contextRef = ref<any>(null) // 右键菜单实例
	const changeNode = ref<any>({}) // 改变的节点

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
		const vNode = [
			h('span', {
				class: (data.isFile ? `ace-${mode}-icon ace-text-icon` : 'ace-folder-icon') + ' icon-editor-left',
				style: {
					'font-size': '4rem',
				},
			}),
			data.isReName
				? h()
				: h(
						'span',
						{
							class: 'el-tree-node__label ' + getClass(data),
							attrs: {
								title: data.fileName,
							},
						},
						data.fileName
				  ),
		]
		return h(
			'span',
			{
				class: `flex items-center ${data.isReName ? 'newFiles' : 'defaultFiles'}`,
				on: {
					contextmenu: (event: MouseEvent) => {
						event.preventDefault() // 阻止默认右键菜单
						openShowMeun(event, data)
					},
				},
			},
			vNode
		)
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

	const initList = async () => {
		nextTick(() => {
			let path = fileItem.value.path || '/www'
			const arr = path.split('/')
			arr.pop()
			currentPath.value = arr.join('/')
		})
	}

	const type = ref('btn') // 类型btn | search
	const isCheck = ref(false) // 是否包含目录文件
	const searchValue = ref('')
	const oldValue = ref([])
	const oldPath = ref('')

	const createFileData = (type: 'dir' | 'file') => {
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
		// changeValue(type.value);
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
			currentPath.value = oldPath.value
		}
	}

	const close = async () => {
		const popup = await instance.value
		popup?.unmount()
	}

	const init = () => {
		nextTick(() => {
			interval = setInterval(() => {
				const dialogEle = document.querySelector('.el-overlay-dialog') as HTMLElement
				const popupEle = dialogEle?.querySelector('.el-dialog__body') as HTMLElement
				if (popupEle) {
					// 设置dialog容器样式
					if (dialogEle) {
						dialogEle.style.alignItems = 'flex-start'
						dialogEle.style.paddingTop = '1vh'
						dialogEle.style.paddingBottom = '1vh'
					}
					// 设置内容区域样式
					popupEle.style.maxHeight = '90vh'
					popupEle.style.height = 'auto'
					popupEle.style.overflowY = 'auto'
					popupEle.style.WebkitOverflowScrolling = 'touch' // 增加弹性滚动
				}
			}, 1000)
		})
	}

	const $reset = () => {
		clearInterval(interval)
	}

	return {
		fileItem,
		instance,

		// header
		tabsElement,
		changeTab,
		getDataChangeTab,
		closeTab,
		initHeader,
		$resetHeader,

		// content
		editorRef,
		mainHeight,
		createEditorView,
		initContent,

		// sidebar
		isShow,
		dropdownMenu,
		handleClickOutside,

		// tool
		isShowTool,
		dropdownMenuRef,
		column,
		checkOperationAvailable,
		handleClickOutsideEvent,
		openPopup,

		treeProps,
		loadNode,
		renderTree,
		handleExpandChange,
		handleCollapseChange,
		initList,

		type,
		isCheck,
		searchValue,
		changeValue,
		searchFile,
		closeSearch,

		close,
		init,
		$reset,
	}
})

export default FILES_ACE_MOBILE_STORE
