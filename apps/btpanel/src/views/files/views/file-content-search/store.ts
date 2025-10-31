import { defineStore, storeToRefs } from 'pinia'
import FILES_STORE from '@files/store'
import { fileSelectionDialog } from '@/public/index'
import { openAceEditor } from '@files/useMethods'
import { useSocket as createSocket, Socket } from '@hooks/tools'
import { Message } from '@hooks/tools'

const FILES_CONTENT_SEARCH_STORE = defineStore('FILES-CONTENT-SEARCH-STORE', () => {
	const filesStore = FILES_STORE()
	const { fileTabActiveData, authType } = storeToRefs(filesStore)

	// 搜索数据
	const searchData = reactive<any>({
		load: false, // 搜索中
		searchType: 'expert', // 搜索模式 routine:常规搜索 expert:高级搜索
		searchContentType: 'file', // 搜索内容模式 name:文件名 file:文件名/文件内容
		regular: false, // 是否正则
		case: false, // 是否区分大小写
		word: false, // 是否全词匹配
		searchContent: '', // 搜索内容
		path: fileTabActiveData.value?.param.path || '', // 搜索目录
		isDir: true, // 是否包含子目录
		suffix: '', // 文件后缀
		time: '', // 修改时间类型
		customTime: [], // 修改自定义时间
		size: '10', // 文件大小类型
		minSize: 0, // 最小文件大小
		maxSize: 10 * 1024 * 1024, // 最大文件大小
	})
	const isfirst = ref<boolean>(true) // 是否第一次进入
	const searchCon = ref<string>('') // 搜索失败内容
	const helpList = [
		{
			content: '文件较多时,搜索时间较长,请耐心等待',
		},
	] // 帮助列表

	// 搜索返回内容
	const searchResult = reactive<any>({
		fileList: [], // 搜索结果列表
		activeIndex: 0, // 当前选中的索引
		type: 'file', // 搜索类型
	})

	/**
	 * @description: 选择搜索选项
	 * @param type 选项类型
	 */
	const selectOptions = (type: string) => {
		if (searchData.load) {
			return
		}
		switch (type) {
			case 'case':
				searchData.case = !searchData.case
				break
			case 'word':
				searchData.word = !searchData.word
				break
			case 'regular':
				searchData.regular = !searchData.regular
				break
		}
	}

	/**
	 * @description: 切换搜索内容模式
	 */
	const toggleSelectMode = (type: string) => {
		// if (type === 'type' && searchData.searchContentType === 'name') {
		// searchData.searchType = 'expert'
		isfirst.value = true // 重置第一次进入
		searchResult.fileList = []
		searchResult.activeIndex = 0
		searchData.load = false
		useSocket?.close()
		// }
		if (type === 'type' && searchData.searchContentType === 'name') {
			searchData.searchType = 'expert'
		}
		// if (type === 'mode' && searchData.searchType === 'routine') {
		// 	searchData.searchContentType = 'file'
		// }
	}

	const pickerOptions = reactive<any>({
		disabledDate: (time: any) => {
			// 获取当前日期
			const today = new Date()

			// 将时间设置为23:59:59
			today.setHours(23, 59, 59, 999)

			// 获取时间戳
			const timestamp = today.getTime()
			return time.getTime() > timestamp
		},
		defaultTime: [new Date(new Date().setHours(0, 0, 0, 0)), new Date(new Date().setHours(23, 59, 59, 0))],
	})
	/**
	 * @description: 设置时间模式
	 * @param time 时间模式
	 */
	const setTimeMode = (time: any) => {
		searchData.time = time
		switch (time) {
			case 'custom':
				searchData.customTime = []
				break
			case '3':
				searchData.customTime = [new Date().getTime() - 3 * 60 * 60 * 1000, new Date().getTime()]
				break
			case '1':
				searchData.customTime = [new Date().getTime() - 24 * 60 * 60 * 1000, new Date().getTime()]
				break
			case '7':
				searchData.customTime = [new Date().getTime() - 7 * 24 * 60 * 60 * 1000, new Date().getTime()]
				break
			case '30':
				searchData.customTime = [new Date().getTime() - 30 * 24 * 60 * 60 * 1000, new Date().getTime()]
				break
			default:
				searchData.customTime = []
				break
		}
	}

	/**
	 * @description: 设置大小模式
	 * @param size 大小模式
	 */
	const setSizeMode = (size: any) => {
		searchData.size = size
		switch (size) {
			case 'custom':
				searchData.minSize = ''
				searchData.maxSize = ''
				break
			case '100':
				searchData.minSize = 0
				searchData.maxSize = 100 * 1024
				break
			case '1':
				searchData.minSize = 0
				searchData.maxSize = 1024 * 1024
				break
			case '10':
				searchData.minSize = 0
				searchData.maxSize = 10 * 1024 * 1024
				break
			default:
				searchData.minSize = ''
				searchData.maxSize = ''
				break
		}
	}

	// 文件后缀选择
	const suffix = reactive<any>({
		show: false, // 是否显示后缀选择
		extList: [
			// 文件后缀列表
			{ title: '全部', value: '*' },
			{ title: '无后缀文件', value: 'no_ext' },
			{ title: 'PHP文件', value: 'php' },
			{ title: 'Python文件', value: 'py' },
			{ title: 'HTML文件', value: 'html' },
			{ title: 'JS文件', value: 'js' },
			{ title: 'JSON文件', value: 'json' },
			{ title: 'Conf配置文件', value: 'conf' },
			{ title: 'LOG日志', value: 'log' },
		],
		selectList: [] as number[], // 已选中的文件后缀索引
	})

	// 修改时间列表
	const timeList = [
		{ label: '不限时间', value: '' },
		{ label: '最近3小时', value: '3' },
		{ label: '最近1天', value: '1' },
		{ label: '最近7天', value: '7' },
		{ label: '最近30天', value: '30' },
		{ label: '自定义', value: 'custom' },
	]

	// 文件大小列表
	const sizeList = [
		{ label: '不限大小', value: '' },
		{ label: '0 ~ 100KB', value: '100' },
		{ label: '0 ~ 1MB', value: '1' },
		{ label: '0 ~ 10MB', value: '10' },
		{ label: '自定义', value: 'custom' },
	]

	/**
	 * @description 选择后缀处理
	 * @param {number} index 索引
	 */
	const selectExt = (index: number) => {
		//选择全部
		if (index === 0) {
			if (suffix.selectList.includes(0)) {
				// 取消选择全部
				suffix.selectList = []
				searchData.suffix = ''
			} else {
				// 选择全部
				suffix.selectList = [0]
				searchData.suffix = '*'
			}
		} else {
			// 选择其他后缀
			// 取消选择全部
			suffix.selectList = suffix.selectList.filter((index: number) => index !== 0)

			if (suffix.selectList.includes(index)) {
				// 取消选择
				suffix.selectList.splice(suffix.selectList.indexOf(index), 1)
			} else {
				// 选择
				suffix.selectList.push(index)
			}

			// 根据索引拼接后缀
			searchData.suffix = suffix.selectList.map((index: number) => suffix.extList[index].value).join(',')
		}
	}

	/**
	 * @description: 触发目录选择
	 */
	const openFile = () => {
		if (searchData.load) {
			return
		}
		fileSelectionDialog({
			type: 'dir',
			path: searchData.path,
			change: (path: string) => {
				searchData.path = path
			},
		})
	}

	// 搜索
	const search = () => {
		if (searchData.load) {
			searchData.load = false
			useSocket?.close()
			return false
		}
		if (searchData.searchContent === '') {
			Message.error('请输入搜索内容')
			return
		}
		if (searchData.path === '') {
			Message.error('请选择目录')
			return
		}
		const params: any = {
			search_content: searchData.searchContent,
			exts: searchData.suffix === '' ? '*' : searchData.suffix,
			path: searchData.path,
			is_subdir: searchData.isDir,
			is_regular: searchData.regular,
			is_case: searchData.case,
			is_word: searchData.word,
			ws_callback: '111',
			model_index: 'files',
			mod_name: searchData.searchType === 'routine' ? 'panelSearch' : 'search',
			def_name: 'get_search',
		}
		// 搜索类型 file:文件 name:文件名
		if (searchData.searchContentType === 'file') {
			params.search_content = searchData.searchContent
		} else {
			params.search_name = searchData.searchContent
		}
		if (searchData.size !== '' && searchData.searchType === 'expert') {
			if (searchData.size === 'custom') {
				if (searchData.minSize === '' || searchData.maxSize === '' || searchData.minSize > searchData.maxSize || searchData.minSize < 0 || searchData.maxSize < 0) {
					Message.error('请输入正确文件大小')
					return
				}
				params.min_size = (searchData.minSize * 1024 * 1024).toString()
				params.max_size = (searchData.maxSize * 1024 * 1024).toString()
			} else {
				params.min_size = searchData.minSize.toString()
				params.max_size = searchData.maxSize.toString()
			}
		}
		if (searchData.time !== '' && searchData.searchType === 'expert') {
			if (searchData.time === 'custom') {
				if (searchData.customTime.length === 0) {
					Message.error('请选择时间')
					return
				}
			}
			params.start_time = searchData.customTime[0] / 1000
			params.end_time = searchData.customTime[1] / 1000
		}
		searchData.load = true // 搜索中
		searchResult.fileList = [] // 清空搜索结果
		searchResult.type = searchData.searchContentType // 搜索类型
		searchResult.activeIndex = 0 // 重置选中索引
		isfirst.value = false // 不是第一次进入
		searchCon.value = searchData.searchContent // 搜索内容
		createWebSocket()

		useSocket?.send(params)
	}

	let useSocket: Socket | null = null
	/**
	 * @description 创建websocket
	 */
	const createWebSocket = () => {
		useSocket = createSocket({
			route: searchData.searchType === 'routine' ? '/ws_panel' : '/ws_model',
			onMessage: onWSReceive,
		})
	}

	/**
	 * @description 消息接收检测和输出
	 * @param {MessageEvent} e 对象
	 */
	const onWSReceive = async (ws: WebSocket, e: MessageEvent) => {
		if (e.data === 'token error') {
			Message.error('token error')
			searchData.load = false
			useSocket?.close()
			return
		}
		// 首次接收消息，发送给后端，进行同步适配
		const msg = JSON.parse(e.data)
		if (msg.name) {
			searchResult.fileList.push(msg)
		}
		if (msg.result === true) {
			useSocket?.close()
			searchData.load = false
			Message.success('搜索完成')
		}
	}

	/**
	 * @description: 编辑查找
	 * @param path 文件路径
	 */
	const editFind = (fileItem: any) => {
		openAceEditor(fileItem, (ace: any) => {
			ace && ace.execCommand('find')
			ace.find(searchData.searchContent)
		})
	}

	/**
	 * @description 获取文件内容搜索路径
	 */
	const getSearchPath = () => {
		searchData.path = fileTabActiveData.value?.param.path
	}

	const $reset = () => {
		useSocket?.close()
		isfirst.value = true
		searchCon.value = ''
		Object.assign(searchResult, {
			fileList: [],
			activeIndex: 0,
			type: 'file',
		})
		Object.assign(searchData, {
			load: false, // 搜索中
			searchType: 'expert', // 搜索模式 routine:常规搜索 expert:高级搜索
			searchContentType: 'file', // 搜索内容模式 name:文件名 file:文件名/文件内容
			regular: false, // 是否正则
			case: false, // 是否区分大小写
			word: false, // 是否全词匹配
			searchContent: '', // 搜索内容
			path: fileTabActiveData.value?.param.path || '', // 搜索目录
			isDir: true, // 是否包含子目录
			suffix: '', // 文件后缀
			time: '', // 修改时间类型
			customTime: [], // 修改自定义时间
			size: '10', // 文件大小类型
			minSize: 0, // 最小文件大小
			maxSize: 10 * 1024 * 1024, // 最大文件大小
		})
	}

	return {
		authType,
		searchData,
		searchResult,
		suffix,
		timeList,
		pickerOptions,
		sizeList,
		isfirst,
		searchCon,
		helpList,
		selectOptions,
		setSizeMode,
		editFind,
		search,
		openFile,
		selectExt,
		setTimeMode,
		toggleSelectMode,
		getSearchPath,
		$reset,
	}
})

export default FILES_CONTENT_SEARCH_STORE
