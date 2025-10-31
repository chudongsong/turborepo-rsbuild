import { useGlobalStore } from '@/store/global'
import { defineStore } from 'pinia'
import { copyFilesDataProps, FileDataProps, FileFavoriteListProps, FileTabOptionalProps, FileTabProps, GlobalTamperStatusProps } from './types.d'
import { createNewFile, getCloudConfig, getDirSize, getDirSizeByPath, getFileList, getFilesImageList, testPath, CheckTaskStatus } from '@/api/files'
import { useRequestCanceler } from '@hooks/tools/axios/model/axios-cancel' // 取消请求
import { Message, useConfirm, useDataHandle, useDialog, useHandleError } from '@hooks/tools'
import {
	batchDelFile,
	BatchSetAuth,
	cloudStorageDialog,
	copyFiles,
	createCompress,
	createFile,
	fileBatchSet,
	FileRecyclingBinView,
	fileReName,
	FileSearchView,
	fileTaskDialog,
	getDiskList,
	getFavoriteList,
	ManageFavoritesView,
	openFile,
	openFilesUpload,
	pasteFiles,
	pathJumpEvent,
	reconstructionFile,
	renderHistoryList,
	setColumn,
	symbolicLinkView,
	fileUploadDialog,
} from '@files/useMethods'
import { clearCookie, getByteUnit, getCookie, getPageTotal, inputFocus, isUndefined, setCookie } from '@utils/index'
import { getPluginInfo, getTaskLists } from '@/api/global'
import { openPluginView, pluginInstallDialog, productPaymentDialog } from '@/public/index'
import FILES_URL_DOWN_LOAD_STORE from './views/url-down-load/store'
import FILES_LIST_VIEW_STORE from './views/file-view/store'

const FILES_STORE = defineStore(
	'FILES-STORE',
	() => {
		const globalStore = useGlobalStore()
		const { mainHeight, mainWidth, payment } = globalStore
		const { authType } = toRefs(payment.value)

		const defaultFileTab = {
			// 默认tab数据
			id: 'label-1',
			label: 'wwwroot',
			type: 'list', // 视图模式，默认列表模式
			loading: false, // 加载状态
			total: 0, // 总条数、
			param: {
				// 表格数据
				p: 1, // 当前页
				showRow: 500, // 每页显示条数
				path: '/www/wwwroot',
				sort: '',
				reverse: 'True',
			},
		} as FileTabProps
		const navBtnHeight = ref<number>(0) // 导航按钮高度
		const fileTabActive = ref<number>(0) // 当前活跃的tab索引
		const fileTabActiveData = ref<FileTabProps>({
			// 当前活跃的tab数据
			...defaultFileTab,
		})
		const fileTabList = ref<FileTabProps[]>([
			// tab列表
			{ ...defaultFileTab },
		])

		// tabs
		const tabsWidth = ref(0) // tabs宽度
		const isAddTabs = ref(true) // 是否允许添加tab
		const contextRef = ref<any>() // tabs右键菜单ref
		const closeTabs = reactive({
			// tabs右键关闭信息
			index: 0,
			id: '',
		})
		const scrollWidth = ref(0) // tabs滚动宽度
		const scrollContainer = ref(0) // tabs滚动容器
		const showLeftArrow = ref(false) // 是否显示左箭头
		const showRightArrow = ref(false) // 是否显示右箭头
		const tabItemLength = ref<number[]>([]) // tabs里面标签的宽度
		const tabTotalWidth = ref(0) // tabs总宽度

		// 路径栏数据
		const dirPath = ref(fileTabActiveData.value.param.path) // 路径
		const pathInputRef = ref<any>() // 路径输入框ref
		const pathInputMode = ref<boolean>(true) // 路径输入模式
		const pathListGroup = ref<any>([]) // 路径列表
		const pathFoldActive = ref(0) // 当前折叠目录索引
		const more = reactive({
			showMore: false, // 是否显示更多
			showUl: false, // 是否显示下拉列表
			list: [] as any, // 下拉列表数据
		}) // 更多操作
		// 路径栏数据 end
		// 搜索数据
		const searchVal = ref<string>('') // 搜索框值
		const searchRef = ref<any>() // 搜索ref
		const isChildren = ref<boolean>(false) // 是否包含子目录

		// 搜索数据 end
		const fileBatchNum = ref([]) // 批量数量 provide('batchNum')
		const diskList = ref<any[]>([]) // 磁盘列表
		const diskAnalysis = ref({
			reqEnd: false, // 请求结束
			isSetup: false, // 是否安装且购买
			isBuy: false, // 是否购买
		}) // 磁盘分析

		const disabledCutTab = ref<boolean>(false) // 禁用点击tab
		const recyclingBinStatus = ref<boolean>(false) // 回收站是否开启
		const columnShow = ref<any>({
			// 列表显示的列
			isLock: true,
			rootLevel: true,
			size: true,
			time: true,
			ps: true,
		})
		const createListType = ref<'' | 'dir' | 'file'>('') // 创建列表类型,默认空
		const createItem = ref<FileDataProps[]>([]) //新建项（创建文件夹、文件）
		const isNoCreteItem = ref<boolean>(false) // 不可以新建列表
		const dirList = ref<FileDataProps[]>([]) // 目录列表
		const dirLength = computed(() => {
			return dirList.value.length || 0
		}) // 目录长度
		const fileList = ref<FileDataProps[]>([]) // 文件列表
		const fileLength = computed(() => {
			return fileList.value.length || 0
		}) // 文件长度
		const imageList = ref<any[]>([]) // 当前目录下的图片缩略图列表
		const favoriteList = ref<FileFavoriteListProps[]>([]) // 收藏列表
		const searchHistory = ref<any[]>([]) // 搜索历史记录
		const globalTamperStatus = ref<GlobalTamperStatusProps>({
			status: false,
			tip: '',
		}) // 插件防篡改状态
		const fileTamper = ref<AnyObject>({}) // 当前目录下的防篡改列表
		const copyFilesData = ref<copyFilesDataProps>({
			// 复制/剪切的文件数据
			files: [], // 复制的文件数据
			type: '', // 操作类型 copy/cut
		})

		const deleteFileData = ref<any>({}) // 删除文件信息
		const imgPathItem = ref<string>('') // 图片预览路径

		const isHaveScoller = ref<boolean>(false) // 是否有滚动条

		/**
		 * @description 设置当前活跃的tab索引的值
		 * @param {FileTabProps} data 当前活跃的数据
		 */
		const updateTabActiveData = (data: FileTabOptionalProps = {}) => {
			const oldData = fileTabList.value[fileTabActive.value]
			if (data.param) data.param = { ...oldData.param, ...data.param }
			const newData = { ...oldData, ...data } as any
			// 删除原数组的数据并替换
			fileTabList.value.splice(fileTabActive.value, 1, newData)
			Object.assign(fileTabActiveData.value, newData)

			searchVal.value = fileTabActiveData.value.param.search || '' // 搜索框值
			isChildren.value = fileTabActiveData.value.param.all === 'True' // 是否包含子目录

			sizeShow.value = false // 大小 计算显示状态
			// 路径不一样时，更新路径
			if (dirPath.value !== newData.param.path) {
				dirPath.value = fileTabActiveData.value.param.path
				getPathListGroup(dirPath.value)
			}
		}

		// 计算tabs的宽度
		const computWidth = () => {
			const tabs = document.querySelector('.tabs')
			if (tabs) {
				const rect = tabs.getBoundingClientRect()
				const width = rect.width
				return width
			}
			return 0
		}

		/**
		 * @description 监听tabs宽度方法
		 */
		const watchTabsWidth = () => {
			nextTick(() => {
				// 计算tabs的宽度
				tabsWidth.value = computWidth()
				// 计算tabs里面的标签数量，判断是否可以添加标签
				const add = document.querySelectorAll('.tab-item')
				// 遍历add计算标签总宽度
				let AllWidth = 0
				add.forEach(item => {
					const rect = item.getBoundingClientRect()
					AllWidth += rect.width
				})
				isAddTabs.value = tabsWidth.value - AllWidth > 160
			})
		}

		// 更新tabs滚动
		const watchScrollWidth = (val: number) => {
			let scrollWidthValue = val
			// 判断是否显示左箭头
			showLeftArrow.value = scrollWidthValue != 0 && scrollWidthValue != -1
			if (scrollWidthValue === -1) {
				scrollWidth.value = 0
				scrollWidthValue = 0
			}
			// 判断是否显示右箭头
			showRightArrow.value = scrollContainer.value > 0 && scrollWidthValue != scrollContainer.value
			// 执行滚动
			const tabs = document.querySelector('.tabs')
			if (tabs) {
				tabs.scrollTo({ top: 0, left: scrollWidth.value, behavior: 'smooth' })
			}
		}

		//右键菜单
		const handleRightClick = (e: any, item: any, index: any) => {
			Object.assign(closeTabs, { id: item.id, index })
			// 显示右键菜单
			contextRef.value.show(e)
			return
		}

		// 监听窗口大小变化
		const watchWindowResize = () => {
			const currentSpace = mainWidth.value - 36
			tabItemLength.value = []
			tabTotalWidth.value = 0
			nextTick(() => {
				const tabItem = document.querySelectorAll('.tab-item')

				// 获取tabs总长度
				tabItem.forEach(item => {
					const rect = item.getBoundingClientRect()
					tabItemLength.value.push(rect.width)
					tabTotalWidth.value += rect.width
				})
				// 能滚动的空间（总tabs长度-当前可视空间）
				const sWidth = tabTotalWidth.value - currentSpace
				scrollContainer.value = sWidth > 0 ? sWidth : 0
				updateTabScroll(currentSpace)
			})
		}

		// 根据当前选中的标签，决定滚动条位置
		const updateTabScroll = (currentSpace: number) => {
			// 当前标签索引的标签总长度
			const width = tabItemLength.value.reduce((total, item, index) => {
				return index <= fileTabActive.value ? total + item : total
			}, 0)
			// 小于
			if (width <= currentSpace) {
				scrollWidth.value = -1
			} else {
				// 最后一个标签
				if (fileTabActive.value === fileTabList.value.length - 1) {
					scrollWidth.value = scrollContainer.value
					return
				}
				// 当前标签的长度大于可视空间，滚动到当前标签
				let mWidth = width - currentSpace + 20
				showRightArrow.value = true
				scrollWidth.value = mWidth
			}
		}

		// 向左滚动
		const scrollLeft = () => {
			const currentSpace = mainWidth.value - 36
			// 小于可视空间一般，直接滚动到最左边
			if (scrollWidth.value <= currentSpace / 2) {
				scrollWidth.value = 0
				return
			}
			scrollWidth.value -= currentSpace / 2
		}

		// 向右滚动
		const scrollRight = () => {
			const currentSpace = mainWidth.value - 36
			// 剩余长度小于可视空间一半，直接滚动到最右边
			if (scrollContainer.value <= currentSpace / 2) {
				scrollWidth.value = scrollContainer.value
				return
			}
			let scrllNewWidth = (scrollWidth.value += currentSpace / 2)
			if (scrllNewWidth > scrollContainer.value) {
				scrllNewWidth = scrollContainer.value
			}
			scrollWidth.value = scrllNewWidth
		}

		/**
		 * @description 切换标签
		 * @param {number} index 标签索引
		 */
		const cutTab = (index: number) => {
			if (disabledCutTab.value && fileTabActive.value !== index) return
			fileTabActive.value = index // 切换标签
			disabledCutTab.value = true
			createItem.value = [] // 清空新建项
			updateTabActiveData() // 更新标签数据
			refreshFilesList()
			watchWindowResize()
		}

		/**
		 * @description 关闭标签
		 * @param { FileTabProps } tab 标签
		 * @param { string } id 标签id
		 */
		const closeTab = (tab: FileTabProps, id: string) => {
			const length = fileTabList.value.length
			if (length === 1) return Message.error('至少保留一个标签页')
			const index = fileTabList.value.findIndex(item => item.id === id)
			fileTabList.value.splice(index, 1)
			if (fileTabActive.value > index) {
				// 当关闭元素在后面时
				fileTabActive.value = fileTabActive.value - 1
				updateTabActiveData() // 更新标签数据
			} else if (fileTabActive.value === index) {
				disabledCutTab.value = true
				// 当关闭元素为当前激活元素时
				fileTabActive.value = length - index === 1 ? index - 1 : index
				updateTabActiveData() // 更新标签数据
				refreshFilesList()
			}
			watchWindowResize() // 更新tabs宽度
		}

		// 关闭其它标签 只留下自己
		const closeOther = () => {
			fileTabList.value = fileTabList.value.filter((item, index) => index === closeTabs.index)
			if (closeTabs.index !== fileTabActive.value) {
				refreshFilesList()
			}
			fileTabActive.value = 0
			updateTabActiveData()
			watchWindowResize()
		}
		// 关闭右侧标签 不包含自己
		const closeRight = () => {
			fileTabList.value.splice(closeTabs.index + 1)
			let currentPath = fileTabList.value[closeTabs.index].param.path
			// 存入内存中当前路径  和留下来的路径做判断
			fileTabActive.value = closeTabs.index
			// 判断当前tab和active是不是相同的路径  是的刷新页面  不是不刷新
			if (fileTabActiveData.value.param.path !== currentPath) {
				updateTabActiveData()
				refreshFilesList()
			}
			updateTabActiveData()
			watchWindowResize()
		}

		/**
		 * @description 手动触发强制关闭
		 * @param {boolean} value 是否关闭
		 */
		const triggerEvent = (value: boolean) => {
			if (value) {
				unref(searchRef).showPopover() // 显示弹窗
			} else {
				unref(searchRef).hidePopover() // 关闭弹窗
			}
		}

		/**
		 * @description 搜索事件
		 * @returns {void} void
		 */
		const searchEvent = async (val: string) => {
			searchVal.value = val
			// 搜索
			updateTabActiveData({
				param: {
					search: searchVal.value,
					all: isChildren.value ? 'True' : 'False',
				},
			})
			await getFilesList()
		}

		// 磁盘插件检查
		const getDiskAnalysisInfo = () => {
			try {
				nextTick(async () => {
					const { data } = await getPluginInfo({ sName: 'disk_analysis' })
					Object.assign(diskAnalysis.value, {
						reqEnd: true,
						isSetup: data.status && data.setup && data.endtime > -1,
						isBuy: data.endtime > -1,
					})
				})
			} catch (error) {}
		}

		/**
		 * @description 请求实时任务队列
		 */
		const getRealTask = async (callback?: AnyFunction) => {
			// 请求实时任务队列
			const res = await getTaskLists({ status: -3 })
			const popup: any = document.querySelector('.realTaskDialog')
			if (res.data.length > 0 && !popup) {
				fileTaskDialog(callback)
			}
		}

		const handleDragOff = (e: DragEvent) => {
			e.preventDefault()
			if (fileTabActiveData.value.param.path === '/') {
				showTips()
				return
			}
			if (e?.dataTransfer?.items) {
				const isFileOrDirectory = Array.from(e?.dataTransfer?.items).some(item => item.kind === 'file')
				if (isFileOrDirectory) {
					console.log('拖拽文件', e.dataTransfer.files)
					if (!fileUploadDialog.value) openFilesUpload() // 打开文件上传窗口
				}
			}
		}
		const showTips = useThrottleFn(() => {
			Message.error('不能直接上传文件到系统根目录!')
		}, 2000)

		/**
		 * @description 路径输入模式
		 * @param {boolean} type true: 退出输入模式 false: 进入输入模式
		 */
		const cutPathInputMode = async (type: boolean) => {
			pathInputMode.value = type
			if (type) {
				if (fileTabActiveData.value.param.path === dirPath.value) return // 当路径未变化时，不做任何操作
				const path = dirPath.value
				// 当路径输入不符合规则时提示，不规则情况：如直接输入路径名，不包含/
				if (path.length > 0 && !path.includes('/')) {
					Message.error('路径输入不符合规则')
					dirPath.value = fileTabActiveData.value.param.path
					return
				} else if (path.length === 0) {
					dirPath.value = fileTabActiveData.value.param.path
					return
				}
				const res = await testPath({ path: dirPath.value })
				if (!res.data.exists) {
					try {
						await useConfirm({
							width: 50,
							title: '路径不存在',
							content: `【${path}】路径不存在,是否创建并跳转?`,
						})
					} catch (error) {
						if (error === 'cancel') {
							dirPath.value = fileTabActiveData.value.param.path
							return
						}
					}
					await useDataHandle({
						loading: '正在新建文件，请稍后...',
						request: createNewFile({
							path: path,
							type: 'dir',
						}),
						message: true,
						success: (res: any) => {
							// 跳转当前路径
							if (res.status) pathJumpEvent(path)
						},
					})
				} else {
					// let path = "你的路径";
					// // 当路径存在/\,\/时，转换为/
					// path = path.replace(/(\\\/|\/\\)/g, '/');
					// // 当路径存在多个\时，转换为一个/
					// path = path.replace(/\\\\+/g, '/');
					// // 当路径存在多个/时，转换为一个/
					// path = path.replace(/\/+/g, '/');
					const res = await pathJumpEvent(path)
					dirPath.value = res || path
				}
			} else {
				inputFocus(pathInputRef.value)
			}
		}

		/**
		 * @description 切换文件列表
		 * @param {string} path 路径
		 * @param {boolean} isEnter 是否是回车事件
		 */
		const cutDirPath = (path: string, isEnter?: boolean) => {
			if (path === '') dirPath.value = '/'
			pathInputRef.value.blur() // 失去焦点
			createItem.value = [] // 清空新建项
			setDataList() // 设置数据列表
			updateTabActiveData({
				param: {
					search: '',
					p: 1,
					all: 'False',
				},
			})
			if (!isEnter) pathJumpEvent(path)
		}

		/**
		 * @description 获取目录路径列表
		 * @param {string} path 路径
		 */
		const getPathListGroup = (path: string) => {
			if (!path) return
			const pathList = path.split('/')
			if (path === '/') return (pathListGroup.value = [{ name: '根目录', path: '/', show: true, list: [] }])
			pathListGroup.value = pathList.map((item, index) => {
				return {
					name: item === '' ? '根目录' : item,
					path: item === '' ? '/' : pathList.slice(0, index + 1).join('/'),
					show: true,
					showFold: false,
					loading: false,
					list: [],
				}
			})
			closeFoldDirList() // 关闭折叠目录列表
			nextTick(() => {
				more.list = []
				more.showMore = false
				// 计算宽度是否超出
				const pathList = document.querySelectorAll('.path-group-item')
				const listGroup = document.querySelector('.path-list-group')
				const pathListWidth = Array.from(pathList).reduce((prev, cur) => {
					return prev + cur.clientWidth + 4
				}, 0)
				setTimeout(() => {
					if (pathListWidth > (listGroup?.clientWidth || 400)) {
						// 超出,从前面开始隐藏
						let hideWidth = 20
						for (let i = pathList.length - 1; i >= 0; i--) {
							hideWidth += pathList[i].clientWidth
							if (hideWidth > (listGroup?.clientWidth || 0)) {
								pathListGroup.value[i].show = false
								more.showMore = true
								more.list = pathListGroup.value.slice(i + 1)
							}
						}
						// 再隐藏多一位
						if (more.showMore) {
							pathListGroup.value[0].show = false
							more.list = pathListGroup.value.slice(1)
						}
					}
				}, 100)
			})
		}

		/**
		 * @description 返回上一层目录
		 */
		const goBack = () => {
			if (disabledCutTab.value) return
			disabledCutTab.value = true // 防止多次点击
			if (fileTabActiveData.value.param.path == '/') {
				if (fileTabActiveData.value.param.search !== '') {
					updateTabActiveData({
						param: {
							search: '',
							all: 'False',
						},
					})
					pathJumpEvent('/')
				} else {
					disabledCutTab.value = false
					return Message.error('当前目录为根目录')
				}
			}
			let pathList = fileTabActiveData.value.param.path.split('/')
			pathList.pop()
			updateTabActiveData({
				param: {
					search: '',
					all: 'False',
				},
			})
			let newPath = pathList.join('/')
			pathJumpEvent(newPath)
		}

		/**
		 * @description 获取当前折叠目录列表
		 * @param {string} path 路径
		 * @param {number} index 索引，用于缓存数据
		 */
		const getCurrentFoldDirList = async (path: string, index: number) => {
			try {
				closeFoldDirList() // 关闭上一个折叠目录列表，如果有的话
				pathListGroup.value[index].showFold = true
				pathListGroup.value[index].loading = true
				const {
					data: { dir },
				} = await getFileList({
					path,
					p: 1,
					showRow: 2000,
				})
				pathListGroup.value[index].loading = false
				pathListGroup.value[index].list = dir.map((item: any) => {
					return {
						name: item.nm,
						path: `${path}/${item.nm}`.replace(/\/+/g, '/'),
					}
				})
				pathFoldActive.value = index
				window.addEventListener('click', closeFoldDirList) // 全局点击事件
			} catch (error) {
				console.log(error)
			}
		}

		/**
		 * @description 关闭折叠目录列表
		 */
		const closeFoldDirList = () => {
			more.showUl = false
			if (pathListGroup.value[pathFoldActive.value]) {
				pathListGroup.value = pathListGroup.value.map((item: any) => {
					return {
						...item,
						showFold: false,
					}
				})
			}
			window.removeEventListener('click', closeFoldDirList)
		}

		// 表格列属性
		const column = ref<any>([
			{
				name: '文件名',
				key: 'name',
				show: true,
				disable: true,
			},
			{
				name: '防篡改',
				key: 'isLock',
				show: true,
				disable: false,
				icon: true,
			},
			{
				name: '权限',
				key: 'rootLevel',
				show: true,
				disable: false,
			},
			{
				name: '大小',
				key: 'size',
				show: true,
				disable: false,
			},
			{
				name: '修改时间',
				key: 'time',
				show: true,
				disable: false,
			},
			{
				name: '备注',
				key: 'ps',
				show: true,
				disable: false,
			},
			{
				name: '操作',
				key: 'action',
				show: true,
				disable: true,
			},
		])
		const cloudList = [
			// 云存储列表
			{
				name: '百度云存储',
				icon: 'baidu-cloud',
				command: 'bos',
			},
			{
				name: '阿里云存储',
				icon: 'alioss-cloud',
				command: 'alioss',
			},
			{
				name: '腾讯云存储',
				icon: 'tencent-cloud',
				command: 'txcos',
			},
			{
				name: '华为云存储',
				icon: 'huawei-cloud',
				command: 'obs',
			},
		]

		const actionsBtn = [
			{
				type: 'copy',
				icon: 'copy-file-icon',
				label: '复制',
				handler: () => fileBatchSet(fileBatchNum.value, 'copy'),
			},
			{
				type: 'cut',
				icon: 'cut-file-icon',
				label: '剪切',
				hide: 1370,
				handler: () => fileBatchSet(fileBatchNum.value, 'cut'),
			},
			{
				type: 'compress',
				icon: 'compress-file-icon',
				label: '压缩',
				hide: 1446,
				handler: () => createCompress(fileBatchNum.value),
			},
			{
				type: 'auth',
				icon: 'authority-file-icon',
				label: '权限',
				hide: 1610,
				handler: () => BatchSetAuth(fileBatchNum.value),
			},
			{
				type: 'delete',
				icon: 'delete-file-icon',
				label: '删除',
				hide: 1620,
				handler: () => batchDelFile(fileBatchNum.value),
			},
		]

		/**
		 * @description 切换列显示
		 * @param {any} item 列选项
		 * @param {boolean} val 是否显示
		 */
		const handlechange = (item: any, status: boolean) => {
			item.show = status
			setColumn(item.key, status)
		}

		/**
		 * @description 创建文件
		 * @param {string} command
		 * @returns {void}
		 */
		const createCommand = (command: string): void => {
			document.querySelector('.vue-recycle-scroller')?.scroll({ top: 0 })
			switch (command) {
				case 'file':
				case 'dir':
					createListType.value = command
					watchCreateListType(command)
					break
				case 'link':
					symbolicLinkView()
					break
			}
		}

		const collectCommand = (command: any) => {
			if (command !== 'manger') {
				fileTabActiveData.value.label = command.name
				if (command.type === 'dir') {
					pathJumpEvent(command.path)
				} else {
					const newItem = {
						...command,
						fileName: command.name,
						ext: command.ext || command.name.split('.').pop(),
					}
					openFile(newItem)
				}
			} else {
				ManageFavoritesView()
			}
		}

		/**
		 * @description 处理命令
		 * @param command  命令
		 */
		const handleCommand = async (command: string) => {
			switch (command) {
				case 'upload':
					openFilesUpload()
					break
				case 'openUrlLinkDown':
					urlDownloadView()
					break
				case 'bos':
				case 'alioss':
				case 'txcos':
				case 'obs':
					const { data } = await getCloudConfig()
					const findData = data?.down?.find((item: any) => item.name === command)
					if (findData && findData?.is_conf) {
						cloudStorageDialog({
							type: 'down',
							zName: findData.title,
							pname: command,
						})
					} else {
						openPlugin(command, 73)
					}
					break
				default:
					break
			}
		}

		const urlDownloadView = () => {
			const { onConfirm } = FILES_URL_DOWN_LOAD_STORE()
			useDialog({
				title: `URL链接下载`,
				area: 50,
				btn: true,
				component: () => import('@files/views/url-down-load/index.vue'),
				onConfirm,
			})
		}

		/**
		 * @description 打开插件
		 * @param name
		 */
		const openPlugin = async (name: string, num: number) => {
			if (authType.value !== 'ltd') {
				productPaymentDialog({
					sourceId: num,
				})
				return
			}
			try {
				const { data } = await getPluginInfo({ sName: name })
				if (!data.setup) {
					// 安装
					pluginInstallDialog({
						name: data.name,
						type: 'i',
						pluginInfo: data,
					})
					return
				}
				openPluginView({
					name: name,
				}) // 打开插件
			} catch (error) {
				console.log(error)
			}
		}
		// 批量操作
		const fileBatchEvent = (name: string) => {
			switch (name) {
				case 'copy':
					fileBatchSet(fileBatchNum.value, 'copy')
					break
				case 'cut':
					fileBatchSet(fileBatchNum.value, 'cut')
					break
				case 'compress':
					createCompress(fileBatchNum.value)
					break
				case 'auth':
					BatchSetAuth(fileBatchNum.value)
					break
				case 'del':
					batchDelFile(fileBatchNum.value)
					break
			}
		}

		const handleChangeMenu = (type: 'list' | 'icon') => {
			if (fileTabActiveData.value.type !== type) {
				updateTabActiveData({ type: type })
				fileTabActiveData.value.type = type
				bindEvent()
			}
			// 清除已选中数据
			fileBatchNum.value = []
			const { selectList } = storeToRefs(FILES_LIST_VIEW_STORE())
			selectList.value = []
			if (listView.value) listView.value.selectList = []
		}

		/**
		 * @description 切换视图重新绑定事件
		 */
		const bindEvent = () => {
			nextTick(() => {
				unbindKeydown()
				initMain()
			})
		}

		const initNavBtn = async () => {
			// 判断是否打开数据库回收站
			const isOpen = localStorage.getItem('MYSQL-RECYCLE')
			if (isOpen === 'true') {
				FileRecyclingBinView('database')
				localStorage.removeItem('MYSQL-RECYCLE')
			}

			// 同步列数据
			column.value.forEach((item: any) => {
				item.show = columnShow.value[item.key]
			})
			await getDiskList()
			getFavoriteList()
		}

		const table = ref<any>(null) // 用于获取表格实例
		const iconView = ref<any>(null) // 用于获取图标视图实例
		const listView = ref<any>(null) // 用于获取图标视图实例
		const btnPopover = ref<any>(false) // 按钮提示框

		const size = ref<any>('') // 计算容量
		const sizeShow = ref<any>(false) // 计算显示
		const sizeLoad = ref<any>(false) // 计算加载
		let pollTimer: ReturnType<typeof setInterval> | null = null

		// 计算容量
		const sizeComputed = async () => {
			const store = FILES_LIST_VIEW_STORE()
			let nowPath = fileTabActiveData.value.param.path
			if (nowPath === '/') return
			try {
				sizeLoad.value = true
				if (diskAnalysis.value.reqEnd && diskAnalysis.value.isSetup && authType.value === 'ltd') {
					// 设置所有文件夹处于加载状态
					dirList.value = dirList.value.map((item: any) => {
						item.isDirComputed = true
						return item
					})
					setDataList() // 设置数据列表
					computedDir()
				} else {
					const { data } = await getDirSize({ path: nowPath })
					size.value = data
					sizeShow.value = true
					sizeLoad.value = false
				}
			} finally {
				if (size.value.length === 0 && sizeShow.value) sizeLoad.value = false
			}
		}

		// 检测是否根目录
		const checkRoot = async () => {
			if (fileTabActiveData.value.param.path === '/') {
				btnPopover.value = true
			} else {
				btnPopover.value = false
			}
		}

		const dataList = ref<any>([]) // 数据列表
		// const dataList = computed(() => {
		// 	// 数据列表
		// 	return [...createItem.value, ...dirList.value, ...fileList.value].map((item: any, index: number) => {
		// 		item.vid = index
		// 		return item
		// 	})
		// })

		//快捷键操作
		const keydown = (e: any) => {
			// 判断是否输入框
			if (e.target.className === 'el-input__inner' || e.target.tagName === 'TEXTAREA') return
			const isList = fileTabActiveData.value.type === 'list'
			// 判断是否存在弹窗
			const popup: any = document.querySelector('.el-dialog__body') || document.querySelector('.el-dialog__container')

			if (popup) {
				// 弹窗存在时，不执行快捷键操作
				if (popup.style.display !== 'none') return
			}

			let rowData: any = []

			const { selectList } = storeToRefs(FILES_LIST_VIEW_STORE())
			dataList.value.forEach((item: any) => {
				if (selectList.value.includes(item.path)) {
					rowData.push(item)
				}
			})

			// ctrl + a
			if (e.ctrlKey && e.keyCode === 65) {
				e.preventDefault()
				listView.value.handleCheckAll(true) // 表格视图全选
			}
			// ctrl + x
			if (e.ctrlKey && e.keyCode === 88) {
				// 剪切文件
				switch (rowData.length) {
					case 0:
						return
					case 1:
						// 剪切文件单文件
						copyFiles(rowData[0], 'cut')
						break
					default:
						// 剪切文件多文件
						fileBatchSet(rowData, 'cut')
						break
				}
			}
			// ctrl + c
			if (e.ctrlKey && e.keyCode === 67) {
				// 复制文件
				switch (rowData.length) {
					case 0:
						return
					case 1:
						// 复制文件单文件
						copyFiles(rowData[0], 'copy')
						break
					default:
						// 复制文件多文件
						fileBatchSet(rowData, 'copy')
						break
				}
			}
			// ctrl + v
			if (e.ctrlKey && e.keyCode === 86) {
				// 粘贴文件
				if (copyFilesData.value.files.length === 0) {
					return
				} else {
					// 粘贴文件
					pasteFiles()
				}
			}
			// f2
			if (e.keyCode === 113) {
				// 表格视图重命名文件
				switch (rowData.length) {
					case 0:
						return
					case 1:
						// 重命名文件单文件
						isList ? fileReName(rowData[0], table.value.editRow) : fileReName(rowData[0], iconView.value.editFile)
						break
				}
			}
			// enter
			if (e.keyCode === 13) {
				// 打开文件
				switch (rowData.length) {
					case 0:
						return
					case 1:
						if (rowData[0].isNew || rowData[0].isReName || rowData[0].isPs) return
						// 打开文件单文件
						openFile(rowData[0])
						break
				}
			}
			// f5
			// if (e.keyCode === 116) {
			// 	e.preventDefault()
			// 	// 表格视图刷新文件列表
			// 	refreshFilesList()
			// }
			// delete
			if (e.keyCode === 46) {
				// 表格视图删除文件
				switch (rowData.length) {
					case 0:
						return
					default:
						if (rowData[0].isNew || rowData[0].isReName) return
						// 删除文件
						batchDelFile(rowData)
						break
				}
			}
		}

		const bindKeydown = () => {
			document.addEventListener('keydown', keydown)
		}

		const unbindKeydown = () => {
			document.removeEventListener('keydown', keydown)
		}

		const watchCreateListType = (val: any) => {
			if (val === '' || isNoCreteItem.value == true) return
			createItem.value = [createFile(val)]
			setDataList() // 设置数据列表
		}

		const watchDeleteFileData = (val: any) => {
			if (Object.keys(val).length === 0) return
			const { type, path, isNew } = val
			if (isNew) createItem.value = [] // 清除新建项
			if (type === 'dir') {
				dirList.value = dirList.value.filter((dir: any) => dir.path !== path)
			} else {
				fileList.value = fileList.value.filter((file: any) => file.path !== path)
			}
			deleteFileData.value = {}
			fileTabActiveData.value.total = dataList.value.length
			setDataList() // 设置数据列表
		}

		const setDataList = () => {
			dataList.value = [...createItem.value, ...dirList.value, ...fileList.value].map((item: any, index: number) => {
				item.vid = index
				return item
			})
			FILES_LIST_VIEW_STORE().watchDataList(dataList.value)
		}

		const initMain = () => {
			sizeLoad.value = false //初始化计算整个目录的loading
			updateTabActiveData({ param: { search: '' } }) // 清空搜索框
			bindKeydown() // 恢复列表键盘事件
			// 读取剪切板数据
			const savedData = localStorage.getItem('copyOrCutData')
			if (savedData) {
				copyFilesData.value = JSON.parse(savedData)
			}
		}

		/**
		 * @description 一键计算文件夹大小
		 */
		const computedDir = async () => {
			try {
				const currentPath = fileTabActiveData.value.param.path
				const { data } = await getDirSizeByPath(currentPath) // 获取当前目录下所有文件大小
				if (!isUndefined(data.msg) && data.msg.indexOf('企业版') == -1) {
					Message.error(data.msg)
				}
				let pathList = data.list
				for (let i in pathList) {
					pathList[`${currentPath}/${i}`] = pathList[i]
				}
				size.value = getByteUnit(data.total_asize)
				setTimeout(function () {
					dirList.value = dirList.value.map((item: any) => {
						item.diskInfo = pathList[item.path]
						item.isDirComputed = false
						return item
					})
					setDataList() // 设置数据列表
				}, 300)
			} finally {
				sizeLoad.value = false
				sizeShow.value = true
			}
		}

		/**
		 * @description 刷新列表
		 */
		const refreshList = async () => {
			if (disabledCutTab.value) return
			disabledCutTab.value = true
			await getFilesList()
		}

		/**
		 * @description 刷新文件列表
		 */
		const refreshFilesList = () => {
			getFilesList()
			setCookie('Path', fileTabActiveData.value.param.path)
		}

		/**
		 * @description 获取参数
		 */
		const getParams = () => {
			const params = JSON.parse(JSON.stringify(fileTabActiveData.value.param))
			if (params.sort == 'time') params.sort = 'mtime'
			if (params.sort == 'fileName') params.sort = 'name'

			if (params.search !== undefined) {
				if (params.search === '') {
					delete params.search
				}
			}
			if (params.all !== undefined) {
				if (params.all !== 'True') {
					delete params.all
				}
			}
			return params
		}

		/**
		 * @description 刷新文件列表
		 * @returns return {string} 返回处理后的文件列表数据
		 */
		const getFilesList = async () => {
			dirList.value = []
			fileList.value = []
			dataList.value = []
			try {
				fileTabActiveData.value.loading = true

				const params = getParams()
				const { status, msg, data } = await getFileList(params)
				if (params.all == 'True' && data.is_max) {
					Message.error('当前搜索结果已超出最大值3000条！')
				}
				if (!status && typeof msg != 'undefined') {
					Message.error(msg)
					// 去除当前path的最后一个/后的内容
					const pathInfo = fileTabActiveData.value.param.path.split('/')
					pathInfo.pop()
					const path = pathInfo.join('/').replace(/\/+$/, '') || '/'
					if (path === '/') return
					updateTabActiveData({ param: { path } })
					getFilesList() // 重新获取数据
					return
				}
				const { path, dir, files, store, bt_sync, page, tamper_data, search_history, file_recycle } = data
				let { dirs: tDirs, files: tFiles, msg: pMsg, tip, rules } = tamper_data
				const imageNameList: any = []
				const isTamperOpen = tip === 'ok' // 插件防篡改是否开启状态
				globalTamperStatus.value.status = isTamperOpen
				globalTamperStatus.value.tip = isTamperOpen ? '' : tip // 插件防篡改信息
				searchHistory.value = renderHistoryList(search_history) // 搜索历史记录
				// 循环目录
				dirList.value = []
				dir.forEach((item: any, index: number) => {
					dirList.value.push(reconstructionFile('dir', item, pMsg ? '' : tDirs[index], path, bt_sync))
				})

				// 循环文件
				fileList.value = []
				files.forEach((item: any, index: number) => {
					const file = reconstructionFile('file', item, pMsg ? '' : tFiles[index], path)
					if (index === 0 && isTamperOpen) {
						fileTamper.value = rules.length > 0 ? rules.find((list: any) => list.pid === file.tamperProofId) : undefined
					}
					if (file.icon === 'images') {
						imageNameList.push(file.fileName)
					}
					fileList.value.push(file)
				})
				// 获取图片缩略图
				if (imageNameList.length > 0) {
					// 暂时取消 需要统计特殊字符显示
					// 检测imageNameList是否存在奇怪的字符 比如΢,\udcd0\udcc5等，如果存在则将这个从数组中剔除
					// const data = imageNameList.filter((item: any) => {
					// 	return !/[\u0391-\uFFE5]/.test(item)
					// })
					const { data: res } = await getFilesImageList({
						return_type: 'base64',
						height: 45,
						width: 45,
						files: imageNameList,
						path: path,
					})
					imageList.value = res ? Object.entries(res.data) : []
					FILES_LIST_VIEW_STORE().setSmallImage()
				} else {
					imageList.value = []
				}

				favoriteList.value = store // 收藏
				recyclingBinStatus.value = file_recycle // 回收站
				let label: any = path
				if (label === '/') {
					label = '根目录'
				} else {
					label = path.split('/').pop()
				}
				// 更新当前tab数据
				updateTabActiveData({
					label,
					total: getPageTotal(data.page),
					type: fileTabActiveData.value.type || 'list',
					param: {
						path: data.path,
					},
				})
				disabledCutTab.value = false // tab栏目切换+添加+返回上一级取消禁用

				await setDataList() // 设置数据列表
				checkScroller() // 检查是否存在滚动条
			} catch (err) {
				useHandleError(err)
			} finally {
				fileTabActiveData.value.loading = false
			}
		}

		const checkScroller = () => {
			// 当文件列表高度存在滚动条 设置custom-operate-head minHeight为 11rem
			nextTick(() => {
				const list = document.querySelector('.custom-tbody')
				if (list) {
					isHaveScoller.value = dataList.value.length * 36 > list.clientHeight
				}
			})
		}

		const init = () => {
			globalStore.getGlobalInfo() // 获取全局信息
			getRealTask() // 获取实时任务队列
			getDiskAnalysisInfo() // 获取磁盘插件信息
			// 检查是否打开内容搜索(首页)
			const search = getCookie('searchFile')
			if (search) {
				// 打开搜索
				FileSearchView()
				clearCookie('searchFile')
			}
			getPathListGroup(dirPath.value) // 获取路径列表
		}

		const $reset = () => {
			// 重置数组
			dirList.value = []
			fileList.value = []
			imageList.value = []
			favoriteList.value = []
			searchHistory.value = []
			showLeftArrow.value = false
			showRightArrow.value = false
			fileTabActiveData.value.param.search = ''
			// 取消初始化请求
			useRequestCanceler(['/files?action=GetDirNew', '/system?action=GetDiskInfo', '/task?action=get_task_lists', '/plugin?action=get_soft_find', '/files?action=get_files_store'])
		}

		return {
			isHaveScoller,
			authType,
			mainHeight,
			mainWidth,
			fileTabActive,
			fileTabActiveData,
			fileTabList,
			isAddTabs,
			closeTabs,
			favoriteList,
			diskList,
			dataList,
			deleteFileData,
			imgPathItem,
			recyclingBinStatus,
			copyFilesData,
			navBtnHeight,
			imageList,
			disabledCutTab,
			dirPath,
			pathInputRef,
			pathInputMode,
			pathListGroup,
			more,
			searchVal,
			searchRef,
			isChildren,
			contextRef,
			scrollWidth,
			showLeftArrow,
			showRightArrow,
			searchHistory,
			updateTabActiveData,
			getFilesList,
			triggerEvent,
			searchEvent,
			getRealTask,
			handleDragOff,
			cutPathInputMode,
			cutDirPath,
			getPathListGroup,
			getCurrentFoldDirList,
			goBack,
			closeOther,
			closeRight,
			watchTabsWidth,
			handleRightClick,
			watchWindowResize,
			watchScrollWidth,
			cutTab,
			scrollLeft,
			scrollRight,
			closeTab,
			fileBatchNum,
			createListType,
			columnShow,
			cloudList,
			actionsBtn,
			fileBatchEvent,
			handleChangeMenu,
			handleCommand,
			openPlugin,
			collectCommand,
			createCommand,
			globalTamperStatus,
			createItem,
			fileList,
			fileLength,
			dirList,
			dirLength,
			size,
			sizeShow,
			sizeLoad,
			table,
			isNoCreteItem,
			iconView,
			listView,
			btnPopover,
			diskAnalysis,
			watchDeleteFileData,
			watchCreateListType,
			sizeComputed,
			checkRoot,
			initMain,
			bindKeydown,
			unbindKeydown,
			initNavBtn,
			refreshList,
			refreshFilesList,
			init,
			$reset,
			keydown,
		}
	},
	{
		persist: [
			{
				storage: localStorage,
				paths: ['fileTabList'],
			},
		],
	}
)

export default FILES_STORE
