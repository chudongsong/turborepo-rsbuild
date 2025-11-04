import { useSocket, Socket } from '@/hooks/tools'
import { getDockerSystemInfo } from '@/api/docker'
import { checkVariable } from '@utils/index'

export const overflowList = ref({
	containers: {
		usage: '0',
		total: '0',
		size: '-',
	},
	images: {
		usage: '0',
		total: '0',
		size: '-',
	},
	volumes: {
		usage: '0',
		total: '0',
		size: '-',
	},
	networks: {
		usage: 0,
		total: 0,
	},
	composes: {
		usage: 0,
		total: 0,
	},
	mirrors: 0,
}) //概览信息

export const filterParams = ref({
	search: '',
	rule: 'ALL',
})
export const typeOptions = [
	{ label: '全部', value: 'ALL' },
	{ label: '运行中', value: 'running' },
	{ label: '已停止', value: 'exited' },
]

// 使用中的容器列表 - 确保定义为响应式引用
export const usedList = ref<Record<string, any>[]>([])

// 管理cpu、内存的隐藏开关
export const hideOverview = ref<boolean>(localStorage.getItem('hideDockerOverview') !== null ? !!Number(localStorage.getItem('hideDockerOverview')) : true)

// 使用率
export const use = reactive({
	cpu: { percentage: 0, load: true },
	memory: { percentage: 0, userd: 0, all: 0, load: true },
	total: 0,
	p: 1,
	row: 50,
	loading: false, // 列表加载状态
	errmsg: '', // 错误信息
})
let socketInfo: Socket | null = null

/**
 * @description 创建websocket
 * @param {boolean} isInit 是否初始化
 */
const createWebSocket = () => {
	socketInfo?.close()
	socketInfo = useSocket({
		route: '/ws_model',
		onMessage: onWSReceive,
	})
}

/**
 * @description
 */
const onWSReceive = async (ws: WebSocket, e: any) => {
	try {
		const msg = JSON.parse(e.data)
		// 处理cpu信息
		// if (msg.data.cpu_info) setCpu(msg.data)
		// 处理内存信息
		// if (msg.data.mem_info) setMem(msg.data)
		// 处理容器信息
		if (Object.keys(msg.data?.container_list || {}).length != 0) {
			setCon(msg.data)
		} else if (msg.end && !msg.data.container_list) {
			// 如果结束且没有容器列表，则显示错误信息
			use.errmsg = msg.msg
			use.loading = false
		}

		// use.total = msg.data.container_count || 0
		// if (msg.end) {
		// 	checkVariable(
		// 		msg.data,
		// 		'object',
		// 		{},
		// 		() => {
		// 			setCon({ container_list: [] })
		// 			use.errmsg = msg.msg
		// 		},
		// 		true
		// 	)
		// 	use.loading = false
		// 	// socketInfo?.send({
		// 	// 	model_index: 'btdocker',
		// 	// 	mod_name: 'container',
		// 	// 	def_name: 'get_all_stats',
		// 	// 	ws_callback: 1002,
		// 	// })
		// }
	} catch (error) {
		console.log(error)
	}
}
/**
 * @description 获取概览数据
 */
export const getOverviewData = async () => {
	const { data } = await getDockerSystemInfo()
	if (data.status) {
		overflowList.value = data.data
	}
}

/**
 * @description 获取信息
 */
export const rsyncData = async () => {
	use.loading = true
	createWebSocket()
	const params: any = {
		model_index: 'btdocker',
		mod_name: 'container',
		def_name: 'get_all_stats',
		ws_callback: 111,
	}
	socketInfo?.send(params)
	socketInfo?.send(params)
}

/**
 * @description 隐藏CPU/内存总览
 */
export const hideSystemOverview = (status: boolean, useMenuRef: Ref<HTMLElement | null>) => {
	if (useMenuRef.value) {
		// 获取useMenuRef.value真实高度（隐藏状态下）
		const menuHeight = useMenuRef.value.scrollHeight
		hideOverview.value = status
		localStorage.setItem('hideDockerOverview', status ? '1' : '0')
		// 确保useMenuRef.value不是null
		// ;(useMenuRef.value as HTMLElement).style.height = hideOverview.value ? '0' : menuHeight.toString() + 'px'
	} else {
		console.log('元素未找到或尚未挂载')
	}
}

/**
 * @description 设置cpu信息
 * @param {any} data.cpu_info 数据
 */
const setCpu = (data: any) => {
	if (!data.cpu_info.length) return
	const cpu = data.cpu_info
	use.cpu.percentage = parseFloat(cpu[0])
	use.cpu.load = false
}

/**
 * @description 设置内存信息
 * @param {any} data.mem_info 数据
 */
const setMem = (data: any) => {
	if (!data.mem_info) return
	const mem = data.mem_info
	const used = Number(mem.memRealUsed)
	const total = Number(mem.memTotal)
	use.memory.userd = used
	use.memory.all = total
	use.memory.percentage = Math.round((used / total) * 1000) / 10
	use.memory.load = false
}

/**
 * @description 设置容器信息
 * @param {any} data.mem_info 数据
 */
const setCon = (data: any) => {
	if (Object.keys(data.container_list).length === 0) return
	// 使用新数组替换整个引用，确保触发响应式更新
	usedList.value = Object.entries(data.container_list).map(([key, value]) => (typeof value === 'object' && value !== null ? { ...value, cpu_usage: Number(value.cpu_usage || 0), mem_percent: Number(value.mem_percent || 0) } : {}))
	use.loading && (use.loading = false)
}

/**
 * @description 模块初始化
 */
export const init = async () => {
	try {
		getOverviewData()
		rsyncData()
	} catch (error) {
		console.log(error)
	}
}
/**
 * @description 销毁模块
 */
export const destroy = () => {
	socketInfo?.close()
	socketInfo = null
	usedList.value = []
	use.loading = false
	use.errmsg = ''
	use.cpu.percentage = 0
	use.cpu.load = true
	use.memory.percentage = 0
	use.memory.userd = 0
	use.memory.all = 0
	use.memory.load = true
	use.total = 0
	use.p = 1
	use.row = 50
}

/**
 * @description 检查系统总览
 */
export const checkSystemOverview = (useMenuRef: Ref<HTMLElement | null>) => {
	const status = localStorage.getItem('hideDockerOverview') !== null ? hideOverview.value : window.innerHeight <= 700
	hideSystemOverview(status, useMenuRef)
}

// 使用率进度条颜色
export const progressColors = [
	{ color: 'var(--el-color-primary)', percentage: 70 },
	{ color: '#f7b851', percentage: 90 },
	{ color: '#ef0808', percentage: 100 },
]

// 判断是否加载失败
export const isLoadErr = computed(() => {
	if (usedList.value.length === 0 && !use.loading) {
		return true
	}
	return false
})

// 过滤容器列表
export const showList = computed(() => {
	// 强制创建一个新的数组，确保响应式追踪
	let filtered: any[] = [...usedList.value]

	// 过滤状态[非全部]
	if (filterParams.value.rule !== 'ALL') {
		// filterParams.value.rule为exited时，直接取反，过滤掉所有为running的容器
		const isRunning = filterParams.value.rule === 'running'
		filtered = filtered.filter(container => {
			return isRunning ? container.status === 'running' : container.status !== 'running'
		})
	}

	// 过滤搜索
	if (filterParams.value.search) {
		const searchTerm = filterParams.value.search.toLowerCase()
		filtered = filtered.filter(container => {
			return container.name.includes(searchTerm) || container.image.toLowerCase().includes(searchTerm)
		})
	}

	return filtered
})
