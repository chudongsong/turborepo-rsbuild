import { defineStore, storeToRefs } from 'pinia'
import FILES_STORE from '@files/store'
import { FileDataProps } from '@files/types.d'
import { ContextMenuOptionsProps } from '@/components/extension/bt-context-menu/types'
import { isMobile, isUndefined } from '@utils/index'
import { openFile, matchUnqualifiedString, getWholePath, setToping, delFavorites, ShareDetailView, temperDialog, pathJumpEvent } from '@files/useMethods'
import { getPluginInfo } from '@/api/global'
import { createNewFile, setFileName, setFilePs, CheckTaskStatus } from '@/api/files'
import { Message, useConfirm } from '@hooks/tools'
import { productPaymentDialog, pluginInstallDialog } from '@/public/index'

const FILES_LIST_VIEW_STORE = defineStore('FILES-LIST-VIEW-STORE', () => {
	const filesStore = FILES_STORE()
	const { mainHeight, authType, fileTabActiveData, navBtnHeight, imageList, imgPathItem, isNoCreteItem, createListType, globalTamperStatus, dataList, fileBatchNum, diskAnalysis } = storeToRefs(filesStore)
	const { refreshFilesList, watchCreateListType, watchDeleteFileData } = filesStore

	const imageUrl = window.location.protocol + '//' + window.location.host + '/download?filename='

	const Style = {
		'justify-content': 'flex-end',
		'padding-right': ' 2.8rem',
		display: 'flex',
		position: 'sticky',
		right: 0,
		background: 'var(--el-fill-color-light)',
		flex: 1,
		// minWidth: '10rem',
		// 'margin-right': 'calc(100% - 100vw)',
	}

	const headData = ref<any>([
		{
			label: '文件名称',
			id: 'fileName',
			width: '42',
			sort: '',
			sortable: true,
			class: 'cursor-pointer',
		},
		{
			label: '企业级防篡改',
			width: '12',
		},
		{
			label: '权限/所有者',
			width: '15',
		},
		{
			label: '大小',
			width: '10',
			id: 'size',
			sort: '',
			sortable: true,
			class: 'cursor-pointer',
		},
		{
			width: '16',
			label: '修改时间',
			id: 'time',
			sort: '',
			sortable: true,
			class: 'cursor-pointer',
		},
		{
			label: '备注',
			width: '20',
		},
		{
			label: '操作',
			type: 'operation',
			width: '30.4',
			class: 'custom-operate custom-operate-head',
			style: Style,
		},
	])

	// 右键菜单
	const context = ref<any>(null)
	const isBatch = ref<boolean>(false) // 是否批量操作
	const contextRow = ref<FileDataProps | FileDataProps[] | null>(null)
	const contextOptions = shallowRef<ContextMenuOptionsProps[]>([]) // 右键菜单列表

	// 选中的文件
	const selectList = ref<any[]>([])

	const showViewer = ref(false) // 是否显示图片预览
	const imgList = ref<any[]>([]) // 图片列表
	const imgIndex = ref(0) // 图片索引

	const isShowShadow = ref(true) // 是否显示阴影
	const scrollRef = ref<any>(null) // 滚动容器
	const scrollHeight = ref(0) // 滚动高度
	const scrollHeightBottom = ref(0) // 滚动高度底部

	/**
	 * @description 重命名
	 * @param item
	 */
	const handleReName = (row: any) => {
		row.oldName = row.fileName
		row.isReName = true
	}

	/* 文件重命名/新建文件
	 * @param {FileDataProps} item 文件数据
	 */
	const fileRename = async (row: any) => {
		if (matchUnqualifiedString(row.fileName)) {
			Message.error('文件名不能包含以下字符：\\ / : * ? " < > |')
			row.isReName = true
			isNoCreteItem.value = true
			return
		}
		isNoCreteItem.value = false // 允许创建
		if (row.isNew) {
			createListType.value = ''
			watchCreateListType('')
			if (row.fileName === '') {
				watchDeleteFileData(row)
				return
			}
			// 新建
			const res = await createNewFile({
				path: getWholePath(row.fileName),
				type: row.type,
			})
			if (res.status) {
				await refreshFilesList()
				row.isReName = false
				if (row.type === 'file') {
					setTimeout(() => {
						const items = dataList.value.find((item: any) => item.fileName === row.fileName)
						if (items) openFile(items)
					}, 100)
				}
			}
			watchDeleteFileData(row)
			Message.request(res)
		} else {
			// 重命名
			// 如果文件名没有改变，则不触发重命名
			if (row.fileName === row.oldName) {
				row.isReName = false
				return
			}
			let load = Message.load('正在重命名，请稍候...')
			const res = await setFileName({
				sfile: getWholePath(row.oldName),
				dfile: getWholePath(row.fileName),
				rename: true,
			})
			load.close()
			if (res.status) {
				row.isReName = false
				Message.success(res.msg)
			} else {
				Message.error(res.msg)
			}
			refreshFilesList()
		}
	}

	/**
	 * @description 离开重命名
	 * @param item
	 */
	const onReNameKeyup = (row: any) => {
		fileRename(row)
	}

	/**
	 * @description 离开备注时
	 * @param item
	 */
	const handleLvPsView = async (e: any, row: FileDataProps) => {
		if (row.isOsPs) return // 系统备注无法修改
		// 判定是否有焦点，没有则隐藏
		if (!e.target.children[1].contains(document.activeElement)) {
			row.isPsEdit = false
		}
	}

	/**
	 * @description 设置备注信息
	 * @param item
	 */
	const handleSetPs = async (row: any) => {
		if (row.ps !== row.oldPs) {
			let load = Message.load('正在设置备注，请稍候...')
			const res = await setFilePs({
				filename: row.path,
				ps_type: 0,
				ps_body: row.ps,
			})
			if (res.status) {
				row.isPsEdit = false
				Message.success(res.msg)
			} else {
				Message.error(res.msg)
			}
			load.close()
		} else {
			row.isPsEdit = false
		}
	}

	/**
	 * @description 进过备注时判断是否可编辑
	 * @param row
	 */
	const handleEnPsView = (row: any) => {
		if (row.isOsPs) return // 系统备注无法修改
		row.oldPs = row.ps
		row.isPsEdit = true
	}

	let dbClickTips: any = null
	/**
	 * @description 双击事件
	 */
	const handleDbClick = (e: any, row: any) => {
		dbClickTips && dbClickTips.close()
		// 排除元素
		if (!excludeElement(e)) return
		if (row.isPs || row.isReName) return
		openFile(row)
	}

	/**
	 * @description 触发时排除的元素
	 */
	const excludeElement = (e: any) => {
		const arr = Array.from(e.target.classList)
		if (arr.includes('checkbox--icon') || arr.includes('size-link') || arr.includes('svgtofont-el-loading') || arr.includes('el-input__inner')) {
			return false
		}
		return true
	}

	/**
	 * @description 点击行内置顶/收藏/分享图标事件
	 * @param row 行数据
	 * @param type 操作类型
	 */
	const opearationIconClick = async (row: any, type: string) => {
		const data: any = {
			top: '置顶',
			favorite: '收藏',
			share: '分享',
		}
		try {
			type != 'share' &&
				(await useConfirm({
					title: `提示`,
					isHtml: true,
					content: `取消【${row.fileName}】的${data[type]}，是否继续？`,
				}))
			switch (type) {
				case 'top':
					setToping(row, row.isTop ? 'unset' : 'set')
					break
				case 'favorite':
					delFavorites(row, () => (row.isFav = false))
					break
				case 'share':
					ShareDetailView(row)
					break
			}
		} catch (error) {}
	}

	/**
	 * @description 防篡改操作
	 * @param row
	 */
	const handleFileLock = async (row: any) => {
		if (authType.value === 'ltd') {
			if (globalTamperStatus.value.status) {
				temperDialog(row)
			} else {
				const { data } = await getPluginInfo({ sName: 'tamper_core' })
				if (!data.setup) {
					// 插件安装界面
					await pluginInstallDialog({
						name: data.name,
						type: 'i',
						pluginInfo: data,
					})
				} else {
					if (isUndefined(globalTamperStatus.value.tip)) {
						Message.error('企业级防篡改未安装或版本较低，请检查插件状态。')
					} else {
						Message.error(`“${globalTamperStatus.value.tip}”请前往【企业级防篡改】启动服务。`)
					}
				}
			}
		} else {
			productPaymentDialog({
				sourceId: 71,
			})
		}
	}

	/**
	 * @description 点击文件名
	 */
	const clickName = (item: any) => {
		if (item.type === 'dir') {
			pathJumpEvent(item.path)
		} else {
			//如若文件是图片，则提示双击查看图片
			// 若文件为视频，则提示双击播放视频
			// 若文件是压缩包，则提示双击解压
			// 若文件是音频，则提示双击播放音频
			// 其他都为双击查看文档
			const tips: any = {
				查看图片: ['jpg', 'png', 'gif', 'jpeg'],
				播放视频: ['mp4', 'avi', 'mov', 'rmvb', 'rm', 'flv', '3gp', 'wmv', 'mkv', 'mpeg', 'mpg', 'ts', 'webm', 'vob', 'swf'],
				解压文件: ['zip', 'rar', 'gz', 'war', 'tgz', '7z', 'tar.gz', 'tar'],
				播放音频: ['mp3', 'wav', 'wma', 'ogg', 'ape', 'flac', 'aac', 'm4a'],
			}

			const ext = item.ext
			let tip = '查看文档'
			for (const key in tips) {
				if (tips[key].includes(ext)) {
					tip = key
					break
				}
			}
			dbClickTips && dbClickTips.close()
			dbClickTips = Message.msg({
				customClass: 'no-icon !z-10',
				message: `双击${tip}`,
				type: 'info',
			})
		}
	}

	/**
	 * @description 设置排序
	 */
	const sortTable = (item: any) => {
		if (!item.sortable) return // 不可排序
		// 清除其他排序
		headData.value.forEach((head: any) => {
			if (head.id !== item.id) {
				head.sort = ''
			}
		})
		if (item.sort === 'asc') {
			item.sort = 'desc'
		} else if (item.sort === 'desc') {
			item.sort = ''
		} else {
			item.sort = 'asc'
		}
		fileTabActiveData.value.param.sort = item.sort != '' ? item.id : ''
		fileTabActiveData.value.param.reverse = item.sort == 'asc' ? 'False' : 'True'
		refreshFilesList()
	}

	/**
	 * @description 获取排序
	 */
	const getSortHistory = () => {
		const sortItem: any = headData.value.find((item: any) => item.id === fileTabActiveData.value.param.sort)
		if (sortItem) {
			sortItem.sort = fileTabActiveData.value.param.reverse == 'False' ? 'asc' : 'desc'
		}
	}

	/**
	 * @description 点击离开输入框
	 */
	const handleBlurCheck = () => {
		const nRow = dataList.value.find((item: any) => item.isReName)
		onReNameKeyup(nRow)
	}

	/**
	 * @description 判断是否选中
	 * @param fileName 文件名称
	 */
	const checkSelect = (path: string) => {
		return selectList.value.find(item => item === path)
	}

	/**
	 * @description 打开图片预览
	 * @param item
	 */
	const openImgView = (item: FileDataProps) => {
		imgIndex.value = imgList.value.findIndex((img: any) => img === `${imageUrl}${item.path}`)
		showViewer.value = true
	}

	/**
	 * @description 关闭图片预览
	 */
	const closeImgPreView = () => {
		showViewer.value = false
	}

	/**
	 * @description 查找当前图片索引
	 */
	const findCurrentImgIndex = (val: any) => {
		imgIndex.value = imgList.value.findIndex((img: any) => img === val)
		showViewer.value = true
	}

	// 右键菜单
	const handleRightClick = (e: any, row: any) => {
		e.preventDefault()
		e.stopPropagation()
		// 直接使用path作为唯一标识
		const rowKey = row ? row.path : null
		if ((row && !checkSelect(rowKey)) || e.button === 0) {
			// 判断当前行是否选中，没有选中则清空选中再选中当前行
			selectList.value = []
			selectList.value.push(rowKey)
			watchSelectListLength() // 监听选中列表长度
		}

		// 选中多个且点击行则显示批量操作
		if (selectList.value.length > 1 && row && e.button === 2) {
			isBatch.value = true
			// 循环查找选中行，并赋值给contextRow
			let rowData: any = []
			{
				/* listNewTable.value.visibleData */
			}
			dataList.value.forEach((item: any) => {
				if (selectList.value.includes(item.path)) {
					rowData.push(item)
				}
			})
			contextRow.value = rowData as FileDataProps[]
			// 显示右键菜单
			context.value?.show(e)
			return
		} else {
			isBatch.value = false
		}
		contextRow.value = row || null
		// 点击空白清除选中
		if (!row) {
			selectList.value = []
			watchSelectListLength() // 监听选中列表长度
		}
		// 显示右键菜单
		context.value?.show(e)
	}

	let con: HTMLElement | null = null // 空白区域容器
	let startPos = { top: 0, left: 0 } // 选择框初始位置
	let endPos = { top: 0, left: 0 } // 选择框结束位置
	let scroll_h = 0 // 滚动高度

	// 文件多选
	const mouseDownEvent = (e: any) => {
		if (e.button === 2 || e.target.closest('.el-input__inner')) {
			return
		}
		const drugBox: any = document.getElementById('drugBox')
		drugBox && drugBox.remove()
		//选中空白
		if (con) {
			// 获取容器距离屏幕位置
			const conT = con.getBoundingClientRect().top
			const conL = con.getBoundingClientRect().left

			//初始位置
			startPos = {
				top: e.clientY - conT,
				left: e.clientX - conL,
			}
		}

		// 添加鼠标移动事件
		document.addEventListener('mousemove', mousemove)
		document.addEventListener('mouseup', mouseup)
	}
	const mousemove = (e: any) => {
		// 清除之前的选择框
		const drugBox = document.getElementById('drugBox')
		drugBox && drugBox.remove()
		if (con) {
			const conT = con.getBoundingClientRect().top
			const conL = con.getBoundingClientRect().left
			//显示选择框
			// 结束位置
			endPos = {
				top: e.clientY - conT > 0 && e.clientY - conT < con.offsetHeight ? e.clientY - conT : e.clientY - (conT + con.offsetHeight) > 1 ? con.offsetHeight : 0,
				left: e.clientX - conL > 0 && e.clientX - conL < con.offsetWidth ? e.clientX - conL : e.clientX - (conL + con.offsetWidth) > 1 ? con.offsetWidth : 0,
			}

			// 获取表格滚动距离
			const tableScrollTop = con?.scrollTop || 0
			// 定点位置
			const fixedPoint = {
				top: endPos.top > startPos.top ? startPos.top + tableScrollTop : endPos.top + tableScrollTop,
				left: endPos.left > startPos.left ? startPos.left : endPos.left,
			}
			// 拖拽范围的宽高
			let w = Math.min(Math.abs(endPos.left - startPos.left), conL + con.offsetWidth - fixedPoint.left)
			let hei = Math.min(Math.abs(endPos.top - startPos.top), conT + con.offsetHeight - fixedPoint.top + tableScrollTop)
			// 超出容器上时，设置滚动条位置
			if (e.clientY - conT < 0) {
				const beyond_t = Math.abs(e.clientY - conT)
				// 设置滚动条位置
				con.scrollTop -= beyond_t
				// 设置拖拽框高度
				if (con.scrollTop != 0) {
					scroll_h += beyond_t
				}
				hei += scroll_h
			}
			// 超出容器下时，设置滚动条位置
			if (e.clientY - (conT + con.offsetHeight) > 1) {
				const beyond_b = e.clientY - (conT + con.offsetHeight)
				// 设置滚动条位置
				con.scrollTop += beyond_b
				// 设置拖拽框高度
				if (con.scrollHeight - con.scrollTop != con.clientHeight) {
					scroll_h += beyond_b
				}
				hei += scroll_h
				fixedPoint.top -= scroll_h
			}
			if (startPos.top == endPos.top || startPos.left == endPos.left) return true
			// 选择框
			const div = document.createElement('div')
			div.classList.add('absolute', 'border', 'top-0', 'border-[var(--el-base-supplement-dark)]', 'bg-[var(--el-base-supplement-light-7)]', 'opacity-[0.15]', 'overflow-hidden')
			div.id = 'drugBox'
			con.appendChild(div)
			// 设置拖拽盒子位置
			div.style.left = fixedPoint.left + 'px'
			div.style.top = fixedPoint.top + 'px'
			div.style.width = w + 'px'
			div.style.height = hei + 'px'
			const drugBox: HTMLElement | null = document.getElementById('drugBox')
			if (con && drugBox) {
				const box_offset_top = drugBox.offsetTop
				const box_offset_h = drugBox.offsetTop + drugBox.offsetHeight
				let rows: any = []
				calcFileListHeight.value.forEach((item: any, index: number) => {
					const offset_top = item.offsetTop
					const offset_h = item.offsetTop + item.offsetHeight
					const row: any = dataList.value[index]
					if (offset_h >= box_offset_top && offset_top <= box_offset_h) {
						rows.push(row.path) // 仅存储路径或标识符
					}
				})
				// 检查选中行是否真的改变
				const newSelectedSet = new Set(rows)
				const currentSelectedSet = new Set(selectList.value)
				if (newSelectedSet.size !== currentSelectedSet.size || ![...newSelectedSet].every(item => currentSelectedSet.has(item))) {
					// 仅当新旧选中行不同时更新
					selectList.value = [...newSelectedSet]
					watchSelectListLength() // 监听选中列表长度
				}
				if (selectList.value.length > 0 && selectList.value.length === dataList.value.length) {
					checkedAll.value = true
				} else {
					checkedAll.value = false
				}
			}
		}
	}

	// 鼠标抬起
	const mouseup = (e: any) => {
		e.preventDefault()
		e.stopPropagation()
		// 移除鼠标移动事件
		document.removeEventListener('mousemove', mousemove)
		// 移除鼠标抬起事件
		document.removeEventListener('mouseup', mouseup)
		// 移除选择框
		const drugBox: HTMLElement | null = document.getElementById('drugBox')
		drugBox && drugBox.remove()
	}

	/**
	 * @description 设置多选
	 * @param list 文件列表
	 */
	const setSelectList = (list: FileDataProps[]) => {
		// 提取path生成新的数组
		selectList.value = list.map((item: any) => item.path)
		watchSelectListLength() // 监听选中列表长度
	}

	const calcFileListHeight = ref<any>([]) // 计算文件列表高度
	const calcFileListHeightFn = () => {
		// 根据dataList的长度，模拟生成每行的offsetTop/offsetHeight
		calcFileListHeight.value = [] // 重置
		for (let i = 0; i < dataList.value.length; i++) {
			calcFileListHeight.value.push({ offsetTop: i * 36, offsetHeight: 36 })
		}

		if (calcFileListHeight.value.length) {
			scrollHeightBottom.value = calcFileListHeight.value[calcFileListHeight.value.length - 1].offsetTop
			if (scrollHeightBottom.value <= mainHeight.value - (navBtnHeight.value || 64) - 266) {
				isShowShadow.value = false
			} else {
				isShowShadow.value = true
			}
		}
	}
	// 设置缩略图
	const setSmallImage = () => {
		nextTick(() => {
			for (let i = 0; i < imageList.value.length; i++) {
				const imgItem = imageList.value[i]
				dataList.value.forEach((item: any) => {
					if (item.fileName === imgItem[0] && imgItem[1]) {
						item.isSmallImage = imgItem[1]
					}
				})
			}

			imgList.value = dataList.value
				.filter((item: any) => {
					return item.isSmallImage !== undefined
				})
				.map((item: any) => `${imageUrl}${item.path}`)
		})
	}

	const checkedAll = ref(false)
	// 全选
	const handleCheckAll = (val: any) => {
		if (val) {
			setSelectList(dataList.value)
		} else {
			setSelectList([])
		}
		checkedAll.value = val
	}
	// 复选框单击
	const handleCheckFile = (item: FileDataProps) => {
		const checkedList = new Set(selectList.value)
		if (!checkedList.has(item.path)) {
			selectList.value.push(item.path)
		} else {
			selectList.value = selectList.value.filter((path: string) => path !== item.path)
		}
		checkedAll.value = selectList.value.length === dataList.value.length
		watchSelectListLength() // 监听选中列表长度
	}
	// 单选
	const handlSingleCheckFile = (e: any, item: FileDataProps) => {
		const arr = Array.from(e.target.classList)
		if (!excludeElement(e)) return
		if (arr.includes('fileName')) return
		selectList.value = [item.path]
		watchSelectListLength() // 监听选中列表长度
	}

	const rightClick = (event: any) => {
		if (event.button === 2 && event.target.tagName === 'INPUT') {
			// 检测是否为右键点击和是否为输入框
			event.preventDefault() // 阻止默认行为
		}
		// 检测是否非文件列表或右键菜单
		if (!event.target.closest('.scrollTable') && !event.target.closest('.v-contextmenu')) {
			context.value?.hide()
		}
	}

	const lastTapTime = ref<number>(0) // 记录最后一次点击时间
	const timeout = ref<any>(null) // 记录定时器
	const tapTarget = ref<any>(null) // 记录最后一次点击的目标

	const handleEvent = (event: MouseEvent | TouchEvent, item: any): void => {
		context.value?.hide()
		if (isMobile() && event instanceof MouseEvent) {
			return
		}
		const currentTime = new Date().getTime()
		const tapLength = currentTime - lastTapTime.value

		if (tapLength < 300 && tapLength > 0 && tapTarget.value === item) {
			if (timeout.value !== null) {
				clearTimeout(timeout.value)
			}
			handleDbClick(event, item) // 调用双击处理函数
		} else {
			tapTarget.value = item
			timeout.value = window.setTimeout(() => {
				handlSingleCheckFile(event, item) // 调用单击处理函数
			}, 300)
		}

		lastTapTime.value = currentTime
	}

	// 购买插件
	const buyPlugin = () => {
		diskAnalysis.value.isBuy || authType.value === 'ltd'
			? pluginInstall()
			: productPaymentDialog({
					sourceId: 140,
					disablePro: true,
			  })
	}

	// 安装插件
	const pluginInstall = async () => {
		try {
			const res = await getPluginInfo({ sName: 'disk_analysis' })
			if (res.data.status || authType.value === 'ltd') {
				// 安装插件
				pluginInstallDialog({
					name: res.data.name,
					type: 'i',
					pluginInfo: res.data,
					softData: res.data,
				})
			}
		} catch (error) {}
	}

	// 监听选中列表长度
	const watchSelectListLength = () => {
		let result = dataList.value.filter((item: any) => selectList.value.includes(item.path))
		fileBatchNum.value = result
	}

	/**
	 * @description 监听数据列表
	 * @param data 表格数据
	 */
	const watchDataList = (data: any) => {
		selectList.value = [] // 重置选中列表
		checkedAll.value = false // 重置全选
		if (data.length) {
			calcFileListHeightFn()
			setSmallImage()
		}
		watchSelectListLength() // 监听选中列表长度
		nextTick(() => {
			scrollRef.value?.scrollToPosition(0)
		})
	}

	/**
	 * @description 绑定鼠标按下事件
	 */
	const bindMouseDown = () => {
		nextTick(() => {
			// 获取容器
			con = document.querySelector('.scrollTable')
			// 添加鼠标按下事件
			con?.addEventListener('mousedown', mouseDownEvent)
		})
	}

	const init = () => {
		calcFileListHeightFn()
		bindMouseDown() // 绑定鼠标按下事件
		// 获取滚动高度
		scrollRef.value.$el.addEventListener('scroll', () => {
			scrollHeight.value = scrollRef.value.$el.scrollTop + (mainHeight.value - (navBtnHeight.value || 64) - 266)
			if (scrollRef.value.$el.scrollTop === 0) scrollHeight.value = 0
		})
		// 获取历史排序
		getSortHistory()
		document.addEventListener('mousedown', rightClick)
	}

	const $reset = () => {
		con?.removeEventListener('mousemove', mousemove)
		document.removeEventListener('mousedown', rightClick)
	}

	// 轮询配置接口
	interface PollConfig {
		path: string
		onSuccess: (data: any) => void
		onError?: (error: any) => void
		onTimeout?: () => void
		interval?: number
		maxPolls?: number
	}

	return {
		mainHeight,
		authType,
		diskAnalysis,
		headData,
		dataList,
		selectList,
		fileBatchNum,
		checkedAll,
		imgPathItem,
		imgIndex,
		showViewer,
		imgList,
		scrollHeight,
		scrollHeightBottom,
		isShowShadow,
		context,
		contextRow,
		isBatch,
		scrollRef,
		imageList,
		navBtnHeight,
		fileTabActiveData,
		bindMouseDown,
		buyPlugin,
		clickName,
		handleBlurCheck,
		handleEvent,
		handleRightClick,
		handleCheckFile,
		handleCheckAll,
		handleFileLock,
		handleEnPsView,
		handleLvPsView,
		handleSetPs,
		handleReName,
		openImgView,
		opearationIconClick,
		onReNameKeyup,
		sortTable,
		calcFileListHeightFn,
		setSmallImage,
		closeImgPreView,
		findCurrentImgIndex,
		watchDataList,
		init,
		$reset,
		calcFileListHeight,
		watchSelectListLength,
	}
})

export default FILES_LIST_VIEW_STORE
