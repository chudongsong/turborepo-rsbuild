import { useGlobalStore } from '@/store/global'
import FILES_LIST_VIEW_STORE from '../store'

const store = FILES_LIST_VIEW_STORE()

const { mainWidth, mainHeight } = useGlobalStore()
const { dataList: data, selectList, navBtnHeight } = storeToRefs(store)
const { handleEvent, watchSelectListLength } = store

// 文件列表
export const fileList = ref<any[]>([])

// 添加文件拖拽状态
export const isDraggingFile = ref(false)
export const draggedFile = ref<any>(null)
// 添加拖拽相关的响应式变量
export const isDragging = ref(false)
const startPos = ref({ x: 0, y: 0 })
export const selectionBoxRef = ref<HTMLElement | null>(null)
export const containerRef = ref<HTMLElement | null>(null)

// 修改滚动相关变量和常量
const SCROLL_SPEED = 20 // 增加滚动速度
const SCROLL_THRESHOLD = 80 // 增加滚动触发区域

const index = ref(0) // 当前加载的索引
const scrollLoading = ref(false) // 滚动加载状态
const lastClickedItem = ref<any>(null) // 添加最后点击的项目记录，用于Shift多选
const isSelecting = ref(false) // 添加一个变量来追踪是否在拖拽选择中

// 修改或添加以下变量
const initialScrollTop = ref(0)
const currentScrollTop = ref(0)

// 添加滚动容器引用
export const scrollContainerRef = ref<HTMLElement | null>(null)

/**
 * @description 间隔
 */
export const gap = computed(() => {
	const width = mainWidth.value - 32
	// 每行显示的个数
	const rowNum = Math.floor((mainWidth.value - 32) / 100)
	const gapTotalWidth = width - rowNum * 100
	return gapTotalWidth / (rowNum / 2) + 2
})

// 视图中显示的个数
export const viewNum = computed(() => {
	const viewHeight = mainHeight.value - (navBtnHeight.value || 64) - 193
	// 每行显示的个数
	const rowNum = Math.floor((mainWidth.value - 32) / 100)
	return Math.floor(viewHeight / 100) * (rowNum - 1)
})

/**
 * @description 滚动加载
 * @returns
 */
export const scrollLoad = () => {
	if (scrollLoading.value || fileList.value.length === data.value.length) return
	scrollLoading.value = true
	if (fileList.value.length < data.value.length) {
		for (let i = 0; i < viewNum.value; i++) {
			if (index.value < data.value.length) {
				fileList.value.push(data.value[index.value])
				index.value++
			}
		}
	}
	scrollLoading.value = false
}

/**
 * @description 鼠标按下事件
 * @param event
 * @param item
 */
export const handleActiveCheck = (event: MouseEvent | TouchEvent, item: any) => {
	// 如果正在拖拽，不处理点击事件
	if (isDragging.value) return

	event.stopPropagation()
	event.preventDefault()

	const mouseEvent = event as MouseEvent
	const isCtrlPressed = mouseEvent.ctrlKey || mouseEvent.metaKey
	const isShiftPressed = mouseEvent.shiftKey

	if (isCtrlPressed) {
		// Ctrl点击：切换选中状态
		const index = selectList.value.indexOf(item.path)
		if (index === -1) {
			selectList.value = [...selectList.value, item.path]
		} else {
			selectList.value = selectList.value.filter(path => path !== item.path)
		}
		lastClickedItem.value = item
	} else if (isShiftPressed && lastClickedItem.value) {
		// Shift点击：选择范围
		const currentIndex = data.value.findIndex((f: any) => f.path === item.path)
		const lastIndex = data.value.findIndex((f: any) => f.path === lastClickedItem.value.path)

		const start = Math.min(currentIndex, lastIndex)
		const end = Math.max(currentIndex, lastIndex)

		selectList.value = data.value.slice(start, end + 1).map((f: any) => f.path)
	} else {
		// 普通点击：单选
		selectList.value = [item.path]
		lastClickedItem.value = item
	}

	handleEvent(event, item)
	watchSelectListLength()
}

/**
 * @description 开始拖拽
 * @param e
 * @returns
 */
export const startDrag = (e: MouseEvent) => {
	if (e.button !== 0) return

	const container = scrollContainerRef.value
	if (!container) return

	const rect = container.getBoundingClientRect()
	if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
		return
	}

	isDragging.value = true
	initialScrollTop.value = container.scrollTop
	currentScrollTop.value = container.scrollTop

	// 保存起始位置（相对于滚动容器）
	startPos.value = {
		x: e.clientX - rect.left,
		y: e.clientY - rect.top + container.scrollTop,
	}

	if (selectionBoxRef.value) {
		const boxStyle = selectionBoxRef.value.style
		boxStyle.display = 'block'
		boxStyle.left = `${e.clientX - rect.left}px`
		boxStyle.top = `${e.clientY - rect.top}px`
		boxStyle.width = '0'
		boxStyle.height = '0'
	}

	// 清除现有选择（除非按住Ctrl）
	if (!e.ctrlKey && !e.metaKey) {
		const fileItem = (e.target as HTMLElement).closest('.icon-file-item')
		if (!fileItem) {
			selectList.value = []
			lastClickedItem.value = null
		}
	}

	document.addEventListener('mousemove', onDragGlobal)
	document.addEventListener('mouseup', endDragGlobal)
}

// 修改 onDragGlobal 方法
const onDragGlobal = (e: MouseEvent) => {
	if (!isDragging.value || !selectionBoxRef.value || !scrollContainerRef.value) return

	const container = scrollContainerRef.value
	const rect = container.getBoundingClientRect()

	// 自动滚动逻辑
	if (e.clientY - rect.top < SCROLL_THRESHOLD) {
		const speed = Math.ceil((SCROLL_THRESHOLD - (e.clientY - rect.top)) / 4)
		container.scrollTop -= Math.min(speed, SCROLL_SPEED)
	} else if (rect.bottom - e.clientY < SCROLL_THRESHOLD) {
		const speed = Math.ceil((SCROLL_THRESHOLD - (rect.bottom - e.clientY)) / 4)
		container.scrollTop += Math.min(speed, SCROLL_SPEED)
	}

	currentScrollTop.value = container.scrollTop

	// 计算选择框位置和大小，考虑滚动偏移
	const currentX = e.clientX - rect.left
	const currentY = e.clientY - rect.top + currentScrollTop.value

	const left = Math.min(startPos.value.x, currentX)
	const top = Math.min(startPos.value.y, currentY)
	const width = Math.abs(currentX - startPos.value.x)
	const height = Math.abs(currentY - startPos.value.y)

	// 更新选择框位置，考虑滚动偏移
	const boxStyle = selectionBoxRef.value.style
	boxStyle.left = `${left}px`
	boxStyle.top = `${top - currentScrollTop.value}px`
	boxStyle.width = `${width}px`
	boxStyle.height = `${height}px`

	// 更新选择
	if (!isSelecting.value) {
		isSelecting.value = true
		requestAnimationFrame(() => {
			updateSelection(left, top, width, height, e)
			isSelecting.value = false
		})
	}
}

// 修改 handleScroll 方法
export const handleScroll = () => {
	const container = scrollContainerRef.value
	if (!container || !isDragging.value || !selectionBoxRef.value) return

	currentScrollTop.value = container.scrollTop
}

// 修改全局结束拖拽
const endDragGlobal = (e: MouseEvent) => {
	isDragging.value = false
	if (selectionBoxRef.value) {
		selectionBoxRef.value.style.display = 'none'
		selectionBoxRef.value.style.width = '0'
		selectionBoxRef.value.style.height = '0'
	}

	// 保存最后一个选中的项
	if (selectList.value.length > 0) {
		const lastPath = selectList.value[selectList.value.length - 1]
		lastClickedItem.value = data.value.find((f: any) => f.path === lastPath)
	}

	document.removeEventListener('mousemove', onDragGlobal)
	document.removeEventListener('mouseup', endDragGlobal)
	watchSelectListLength()
}

/**
 * @description 更新选择
 * @param left
 * @param top
 * @param width
 * @param height
 * @param e
 * @returns
 */
const updateSelection = (left: number, top: number, width: number, height: number, e: MouseEvent) => {
	if (!scrollContainerRef.value) return

	const container = scrollContainerRef.value
	const containerRect = container.getBoundingClientRect()

	const selectionRect = {
		left,
		top,
		right: left + width,
		bottom: top + height,
	}

	const newSelection = new Set<string>()
	const fileItems = container.getElementsByClassName('icon-file-item')

	for (let i = 0; i < fileItems.length; i++) {
		const item = fileItems[i] as HTMLElement
		const itemRect = item.getBoundingClientRect()

		const relativeRect = {
			left: itemRect.left - containerRect.left,
			top: itemRect.top - containerRect.top + container.scrollTop,
			right: itemRect.right - containerRect.left,
			bottom: itemRect.bottom - containerRect.top + container.scrollTop,
		}

		if (!(selectionRect.right < relativeRect.left || selectionRect.left > relativeRect.right || selectionRect.bottom < relativeRect.top || selectionRect.top > relativeRect.bottom)) {
			const filename = item.getAttribute('data-filename')
			const fileData = data.value.find((f: any) => f.fileName === filename)
			if (fileData) {
				newSelection.add(fileData.path)
			}
		}
	}

	if (e.ctrlKey || e.metaKey) {
		const currentSelection = new Set(selectList.value)
		newSelection.forEach(path => currentSelection.add(path))
		selectList.value = Array.from(currentSelection)
	} else {
		selectList.value = Array.from(newSelection)
	}
	watchSelectListLength()
}

// 键盘事件处理
const handleKeyDown = (e: KeyboardEvent) => {
	// Ctrl+A 全选
	if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
		e.preventDefault()
		selectList.value = data.value.map((item: any) => item.path)
	}
	// Escape 取消选择
	else if (e.key === 'Escape') {
		selectList.value = []
		lastClickedItem.value = null
	}
	watchSelectListLength()
}

/**
 * @description 监听文件列表
 */
export const watchFileList = () => {
	fileList.value = []
	index.value = 0
	scrollLoad()
}

export const init = () => {
	window.addEventListener('keydown', handleKeyDown)
}

export const $reset = () => {
	// 确保清理全局事件监听
	document.removeEventListener('mousemove', onDragGlobal)
	document.removeEventListener('mouseup', endDragGlobal)
	window.removeEventListener('keydown', handleKeyDown)
}
