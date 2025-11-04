import { openEditorView, determineFileType, reconstructionFile } from '@files/useMethods'
import { useFindTabsData, editorTabsActive } from '@files/public/ace/useMethods'
import { getFileDirList as getFileDirListData } from '@api/files'
import type { FileDataProps } from '@files/types'
import { useDataHandle, useHandleError, useMessage } from '@/hooks/tools'
import { storeToRefs } from 'pinia'
import FILES_STORE from '@/views/files/store'
import FILES_ACE_STORE from '../store'

const Message = useMessage()

// const { fileLength } = useFilesStore()

export const currentPath = ref('') // 当前路径
export let newData: any = ref([]) // 上一级数据
export const currentSelectedNode = ref<any>(null) // 当前选中的节点
export const contextRow = ref<FileDataProps | null>(null) // 右键菜单的值
export const expandedKeys = ref<string[]>([]) //记录展开的节点keys
export const isNewMenuShow = ref<boolean>(false) //是否显示新建菜单
export const isFirstLoad = ref<boolean>(true) //首次加载
export const treeRef = ref<any>(null) //树组件实例
export const treeContainerRef = ref<any>(null) //树节点容器实例
export const reNameInputRef = ref<any>(null) //新建框、重命名框实例

/**
 * @description 清空状态
 *
 */
export const initStatus = () => {
	// 重置当前选中节点
	currentSelectedNode.value = null
	contextRow.value = null
	isNewMenuShow.value = false
}

/**
 * @description 获取指定文件下的目录列表
 * @param {string} path 文件完整路径
 * @returns {Promise<void>} void
 */
export const getFileDirList = async (path: string, search?: string, isAll?: 'True' | 'False') => {
	let param: any = {
		p: 1,
		showRow: 500,
		sort: 'name',
		reverse: 'False',
		path: path,
		search: search || '',
	}
	if (isAll) param['all'] = isAll
	try {
		const { data } = await getFileDirListData(param)
		const dirList: any = []
		const fileList: any = []

		// 循环目录
		data.dir.forEach((item: any) => {
			dirList.push(reconstructionFile('dir', item, undefined, data.path))
		})

		// 循环文件
		data.files.forEach((item: any) => {
			fileList.push(reconstructionFile('file', item, undefined, data.path))
		})
		return [...dirList, ...fileList]
	} catch (error) {
		console.log(error)
		return []
	}
}

/**
 * @description 加载节点
 * @param node 当前加载节点
 * @param resolve
 * @param attrs
 * @returns
 */
export const loadNode = async (node: any, resolve: any, fileItem: FileDataProps) => {
	// 新建目录返回空数组
	if (node.data.isNew) {
		return resolve([])
	}

	const activeTab = useFindTabsData(editorTabsActive.id || '')

	// 如果是回收站,不展开
	expandedKeys.value = expandedKeys.value.filter((item: string) => item !== '.Recycle_bin')
	if (node.data.fileName === '.Recycle_bin') {
		Message.error('此为回收站目录，请在右上角按【回收站】按钮打开')
		resolve([])
		return
	}
	// 初始状态,展示根目录
	if (node.level === 0) {
		const path = activeTab?.path || fileItem.path
		const arr = path.split('/')
		arr.pop()
		const data = await getFileDirList(arr.join('/') || '/www')
		newData.value = data
		return resolve(data)
	}
	// 打开下级目录
	if (node.level > 0) {
		const data = await getFileDirList(node.data.path)
		return resolve(data)
	}
	if (node.upper) {
		return resolve(node.upper)
	}
}

/**
 * @description 打开上一级
 * @param path 当前路径
 */
export const upperLevel = async () => {
	expandedKeys.value.length = 0
	const path = currentPath.value
	if (path === '/') {
		Message.error('已经是根目录了')
		return
	}
	const arr = path.split('/')
	arr.pop()
	let newPath = arr.join('/')
	if (!newPath) {
		newPath = '/'
	}
	currentPath.value = newPath
	const data = await getFileDirList(newPath)
	newData.value = data
	initStatus()
}

/**
 * @description: 打开文件
 * @param data 文件数据
 * @param node 节点数据
 * @param ref 节点实例
 */
export const openFile = async (data: any, node: any, ref: any) => {
	// 获取当前选中的节点
	if (!contextRow.value) {
		currentSelectedNode.value = node
	}
	// 如果是目录就返回
	if (!data.isFile) return
	if (data?.path?.includes('/dev/pts')) {
		Message.error('系统目录文件不支持编辑')
		return
	}
	if (determineFileType(data.fileName?.split('.').pop()) !== 'text') {
		Message.error('暂不支持该类型文件编辑')
		return
	}
	// 如果是文件就打开文件
	openEditorView(data)
}

/**
 * @description 显示行右键菜单
 * @param e
 * @param row 当前选择的数据
 */
export const showContext = (e: any, row: any, contextRef: any) => {
	e.preventDefault()
	e.stopPropagation()
	contextRow.value = row || null
	// 显示右键菜单
	contextRef.value.show(e)
	isNewMenuShow.value = false
}

/**
 * @description 更新当前打开文件夹的数据
 * @param key 关键词
 *
 */
export const updateData = async (key?: string) => {
	const data = await getFileDirList(currentPath.value, key ?? '')
	newData.value = data
	initStatus()
}

/**
 * @description 根据视图位置索引新建框位置
 * @param elementRef 新建框的 DOM 元素
 * @param containerRef 容器的 DOM 元素
 */
export const scrollToElementInView = (elementRef: any, containerRef: any) => {
	nextTick(() => {
		const element = elementRef.value?.$el // 获取新建框的 DOM 元素
		const container = containerRef.value // 获取滚动容器的 DOM 元素

		if (element && container) {
			const elementRect = element.getBoundingClientRect()
			const containerRect = container.getBoundingClientRect()

			// 检查元素是否在容器的视图内
			const isElementOutOfView = elementRect.top < containerRect.top || elementRect.bottom > containerRect.bottom

			if (isElementOutOfView) {
				// 调整容器的 scrollTop 以确保元素可见
				container.scrollTop += elementRect.top - containerRect.top - (container.clientHeight / 2 - elementRect.height / 2)
			}
		}
	})
}

/**
 * @description 节点插入
 * @param data
 * @param dataPathFileName
 */
export const appendData = (data: any, dataPathFileName?: string, treeRef?: any) => {
	const parentNode = treeRef.value.getNode(dataPathFileName) // 获取父节点
	if (parentNode) {
		if (parentNode.childNodes && parentNode.childNodes.length > 0) {
			// 如果已有子节点，获取第一个子节点
			const firstChild = parentNode.childNodes[0]
			// 使用 insertBefore 将新节点添加到第一个子节点前
			treeRef.value.insertBefore(data, firstChild.data) // 注意这里传递的是 firstChild 的 data
		} else {
			// 如果没有子节点，直接使用 append 添加为第一个子节点
			treeRef.value.append(data, parentNode.data)
		}
	} else {
		// 如果没有父节点，视为根级操作，直接在根数据上添加
		treeRef.value.data.unshift(data)
		treeRef.value.updateKeyChildren(null, treeRef.value.data)
	}
	// const dataPath = data.path?.replace(/\/[^\/]*\/?$/, '')
	// if (dataPath && !expandedKeys.value.includes(dataPath)) {
	// 	expandedKeys.value.push(dataPath)
	// }

	nextTick(() => {
		setTimeout(() => {
			reNameInputRef.value?.$el?.focus()
			scrollToElementInView(reNameInputRef, treeContainerRef)
		}, 100)
	})
	// changeNode.value = data.path
	initStatus()
}

/**
 * @description 目录刷新
 *
 */
export const refresh = async () => {
	try {
		expandedKeys.value.length = 0
		initStatus()
		await updateData()
		Message.success('刷新成功')
	} catch (error) {
		useHandleError(error)
	}
}

// 获取当前节点的父路径
const getParentPath = ({ data: { path, isFile } }: any) => (isFile ? path.replace(/\/[^\/]*$/, '') : path)

// 获取当前节点的父名称
const getParentDisplayName = (node: any) => (node.data.isFile ? getParentPath(node) : node.data.path)

/**
 * @description 新建文件/文件夹
 * @param type 文件类型 dir 文件夹 / file 文件
 */
export const createFile = (type: 'dir' | 'file') => {
	const node = currentSelectedNode.value
	// const path = node
	// 	? getParentPath(node)
	// 	: contextRow.value
	// 	? contextRow.value.path
	// 	: currentPath.value
	const path = contextRow.value ? contextRow.value.path : node ? getParentPath(node) : currentPath.value
	const dataPathFileName = node ? getParentDisplayName(node) : null
	// handleExpandChange({ path })
	const newFile = {
		icon: `icon-${type}`, // 文件图标
		ext: '', // 文件后缀
		fileName: ``, // 文件名称
		time: '', // 时间
		ps: '', // 备注
		size: 0, // 文件大小
		type, // 文件类型
		user: 'root', // 所有者
		rootLevel: '0', // 用户权限
		isLink: '', // 软连接
		isShare: false, // 是否分享
		isTop: false, //是否置顶
		isFav: false, // 是否收藏
		isOsPs: false, // 是否系统备注信息
		isSearch: false, //判断是否搜索
		isReName: true, // 是否重命名
		isNew: true, // 是否新建
		isSync: '', // 是否同步
		isLock: false, // 是否加锁
		path: `${path}/`, // 文件路径
		tamperProofId: 0, // 防篡改ID
		isFile: type !== 'dir', // 是否是文件
	} as FileDataProps
	// 阻止多个新建文件夹同时触发
	isNewMenuShow.value = true
	return {
		newFile,
		dataPathFileName,
	}
}

/**
 * @description 根据输入路径搜索
 *
 */
export const changeCurrentPath = async () => {
	const { originalPath } = storeToRefs(FILES_ACE_STORE())
	try {
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
		if (currentPath.value === '') originalPath.value = data.path
		currentPath.value = data.path
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 清除展开的节点数据
 *
 **/
export const clearExpandedKeys = () => {
	expandedKeys.value.length = 0
}
