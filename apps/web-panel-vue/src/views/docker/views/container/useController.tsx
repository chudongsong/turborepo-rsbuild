import type { TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types.d'
import { useDialog, Message, useConfirm, useDataHandle } from '@/hooks/tools'
import { openAddContainerView, CreateRealMonitorDialog, openContainerDetailView, terminalEvent, reNameDialog, useContainerBatchEventHandle, chunkArray, useContainerTableColumn } from '@docker/useMethods'
import { setCookie, getByteUnit } from '@utils/index' // 工具函数
import { useSocketRequest } from '@/hooks/tools/socket/use-socket-request'
import { delContainer, setContainerStatus, clearCon, setContainerTop, getContainerPath, getContainerList, getContainerInfo } from '@/api/docker'
import { getDockerStore } from '@docker/useStore'
import { useGlobalStore } from '@store/global'

const {
	refs: { customLimit, cpuAndMemData, maxCPU, maxMem, maxGpus },
} = getDockerStore()

const { mainHeight, enterpriseRec } = useGlobalStore()

export const containerTableData = reactive({
	loading: false,
	total: 0,
	p: 1,
	limit: Number(localStorage.getItem('dockercontainerlimit')) || 20,
	usedList: [], // 运行容器的占用率列表
	search: '',
})
const containerList = ref<any[]>([]) // 容器列表
export const showList = shallowRef<any[]>([]) // 展示列表
const groupList = ref<any[]>([]) // 分组列表

const statusFilterKey = ref('all')

// 批量操作列表
export const tableBatchData: TableBatchOptionsProps[] = [
	{ label: '启动', value: 'start', event: useContainerBatchEventHandle },
	{ label: '重启', value: 'restart', event: useContainerBatchEventHandle },
	{ label: '停止', value: 'stop', event: useContainerBatchEventHandle },
	{ label: '强制停止', value: 'kill', event: useContainerBatchEventHandle },
	{ label: '暂停', value: 'pause', event: useContainerBatchEventHandle },
	{ label: '恢复', value: 'unpause', event: useContainerBatchEventHandle },
	{ label: '删除', value: 'delete', event: useContainerBatchEventHandle },
]

// 表格左上方按钮组
export const tableBtnGroup = [
	{ active: true, content: '创建容器', event: () => openAddContainerView() },
	{ content: '日志管理', event: () => openContainerLogView() },
	{ content: '清理容器', event: () => clearConfirmDialog() },
	...(enterpriseRec.value
		? [
				{
					content: '安全检测',
					event: async () => {
						useDialog({
							title: '安全检测',
							area: 70,
							component: () => import('@docker/views/container/images-safe-scan-dialog/index.vue'),
						})
					},
				},
		  ]
		: []),
	// {
	// 	content: '容器分组 ',
	// 	event: () => {
	// 		useDialog({
	// 			title: '容器分组',
	// 			area: 60,
	// 			component: () => import('@docker/views/container/compose-group-dialog/index.vue'),
	// 		})
	// 	},
	// },
]
/**
 * @description 分页器事件
 * @param {number} val 页码
 * @returns {void} void
 */
export const changePage = (): void => {
	customLimit.value.container = true // 自定义每页显示数量
	localStorage.setItem('dockercontainerlimit', String(containerTableData.limit))
	getCList(false)
}

/**
 * @description 设置状态事件
 * @param {FtpTableDataProps} row 行数据
 * @returns {void} void
 */
const setStatusEvent = async (row: any, status: string): Promise<void> => {
	useDataHandle({
		loading: '正在设置容器状态，请稍候...',
		request: setContainerStatus({
			data: JSON.stringify({ id: row.id, status }),
		}),
		message: true,
		success: getCList,
	})
}

/**
 * @description 目录
 * @param {FtpTableDataProps} row 行数据
 * @returns {void} void
 */
const dirEvent = async (row: any): Promise<void> => {
	useDataHandle({
		loading: '正在获取容器目录，请稍候...',
		request: getContainerPath({ data: JSON.stringify({ id: row.id }) }),
		success: (res: any) => {
			// 跳转文件指定目录
			setCookie('Path', res.data.path)
			window.location.href = window.location.origin + '/files'
		},
		error: (res: any) => {
			Message.error(res?.msg || '获取容器目录失败')
		},
	})
}

/**
 * @description 删除事件
 * @param {FtpTableDataProps} row 行数据
 * @returns {void} void
 */
const deleteDataEvent = async (row: any): Promise<void> => {
	try {
		await useConfirm({
			title: `删除容器【${row.name}】`,
			content: `删除容器【${row.name}】,是否继续操作？`,
		})
		useDataHandle({
			loading: '正在删除容器，请稍候...',
			request: delContainer({ data: JSON.stringify({ id: row.id }) }),
			message: true,
			success: getCList,
		})
	} catch (error) {
		console.log(error)
	}
}

// 更多事件
const moreEvent = (key: string, row: any): void => {
	switch (key) {
		case 'terminal':
			terminalEvent(row)
			break
		case 'reName':
			reNameDialog(row)
			break
		case 'realMonitor':
			CreateRealMonitorDialog(row)
			break
		case 'proxyDetails':
			openContainerDetailView(row, 'proxy')
			break
		case 'dir':
			dirEvent(row)
			break
		case 'log':
			openContainerLogView(row)
			break
	}
}

/**
 * @description 置顶
 * @param row 行数据
 * @param type 置顶类型 top：置顶 untop：取消置顶
 */
const changeTaskTopEvent = async (row: any, type: string) => {
	useDataHandle({
		loading: '正在设置容器置顶，请稍候...',
		request: setContainerTop({
			type: type == 'top' ? 'add' : 'del',
			container_name: row.name,
		}),
		message: true,
		success: () => {
			row.is_top = type == 'top' ? 1 : 0
			setTopContainerList()
		},
	})
}

/**
 * @description 过滤搜索
 */
export const filterSearch = async () => {
	containerTableData.p = 1
	if (containerTableData.search === '') {
		containerTableData.total = containerList.value.length
		getCList(false) // 切换第一页
		return
	}
	// 切换大小写
	const query: string = (containerTableData.search as string).toLowerCase()
	const keyArr = ['name', 'id', 'image']
	const arr = containerList.value.filter(item =>
		// 返回符合条件的数据
		keyArr.some(key => item[key]?.toLowerCase().includes(query))
	)
	// 更新数据,手动分页
	containerTableData.total = arr.length
	showList.value =
		chunkArray({
			limit: containerTableData.limit,
			list: arr,
			p: containerTableData.p,
		}) || []
}

export const tableColumn = ref(
	useContainerTableColumn({
		reNameEvent: (row: any) => reNameDialog(row),
		realMonitorEvent: (row: any) => CreateRealMonitorDialog(row),
		terminalEvent,
		dirEvent,
		logDataEvent: (row: any) => openContainerLogView(row),
		deleteDataEvent,
		conDetailEvent: openContainerDetailView,
		setStatusEvent,
		openContainerBackups: (row: any) => ContainerBackupsDialog(row),
		openProxyDetails: (row: any) => openContainerDetailView(row, 'proxy'),
		changeTaskTopEvent,
		moreEvent,
		setStatusTitle: async (key: string) => {
			if (key === 'all') {
				statusFilterKey.value = key
				return await getCList()
			}
			showList.value =
				groupList.value[key]?.map((item: any) => {
					const obj = containerList.value.find((tr: any) => tr.id === item.id)
					return {
						...item,
						backup_count: obj?.backup_count || 0,
						remark: obj?.remark || '',
					}
				}) || []
		},
		statusFilterKey,
	})
)

let useSocket: any = null

/**
 * @description 创建websocket
 * @param {boolean} isInit 是否初始化
 */
const createWebSocket = () => {
	useSocket?.socketDestroy()
	useSocket = useSocketRequest('/ws_model')
}

const onWSReceive = async (data: any) => {
	try {
		const msg = data
		if (msg.data.container_stats_data) {
			// 处理容器信息
			setCon(msg.data)
		}
		if (msg.end) {
			useSocket?.socketRequest({
				params: {
					model_index: 'btdocker',
					mod_name: 'container',
					def_name: 'get_all_stats',
					ws_callback: 'get_all_stats',
				},
				onMessage: onWSReceive,
			})
		}
	} catch (error) {}
}

/**
 * @description 获取信息
 */
export const rsyncData = async () => {
	// getContainerStatus(onWSReceive)
	createWebSocket()
	const params: any = {
		model_index: 'btdocker',
		mod_name: 'container',
		def_name: 'get_all_stats',
		ws_callback: 'get_all_stats',
	}
	useSocket?.socketRequest({ params, onMessage: onWSReceive })
}
export const getKeys = (row: any) => row.id

/**
 * @description 设置容器信息
 * @param {any} data.mem_info 数据
 */
const setCon = (data: any) => {
	if (!data.container_stats_data) return
	const list = data.container_stats_data
	showList.value.forEach((item: any) => {
		if (item.status === 'running') {
			const findItem = list.find((i: any) => i.id == item.id)
			if (findItem) {
				cpuAndMemData.value[item.id] = {
					cpu_usage: findItem.cpu_usage || 0,
					mem_percent: findItem.mem_percent || 0,
				}
				// item.cpu_usage = findItem.cpu_usage || 0
				// item.mem_percent = findItem.mem_percent || 0
			}
		}
	})
}

/**
 * @description 销毁模块
 */
export const destroy = () => {
	useSocket?.socketDestroy()
	useSocket = null
	containerTableData.loading = false
	containerTableData.total = 0
	containerTableData.p = 1
	containerTableData.search = ''
	containerTableData.usedList = []
	containerTableData.limit = Number(localStorage.getItem('dockercontainerlimit')) || 20
	containerList.value = []
	showList.value = []
	groupList.value = []
}
/**
 * @description 容器列表置顶
 */
const setTopContainerList = (): any => {
	containerList.value = containerList.value.sort((a: any, b: any) => {
		// 将拥有 top 字段的元素排在前面
		if (a.is_top == 1 && b.is_top != 1) {
			return -1 // a 排在前面
		} else if (a.is_top != 1 && b.is_top == 1) {
			return 1 // b 排在前面
		} else {
			// return 0 // 保持原有顺序
			return a.created_time > b.created_time ? -1 : 1 // 按创建时间排序
		}
	})
	showList.value =
		chunkArray({
			limit: containerTableData.limit,
			list: containerList.value,
			p: containerTableData.p,
		}) || []
}

/**
 * @description 检查高度
 */
export const checkHeight = () => {
	setTimeout(() => {
		if (mainHeight.value > 900) {
			containerTableData.limit = 20
		} else {
			containerTableData.limit = 10
		}
	}, 0)
}

let firstLoad = true // 首次加载

/**
 * @description 获取容器列表
 * @param {boolean} request 是否请求接口
 * @returns {Promise<void>} void
 */
export const getCList = async (request?: boolean): Promise<void> => {
	if (request === false) {
		// 分页操作
		showList.value = chunkArray({ ...containerTableData, list: containerList.value }) || []
		return
	}
	if (firstLoad) containerTableData.loading = true
	await useDataHandle({
		request: getContainerList(),
		data: {
			container_list: Array, // 容器列表
			grouped_by_status: Object, // 筛选分组对象
			mem_total: Number, // 总内存
			online_cpus: Number, // 总CPU
			gpu: Number, // 总GPU
		},
		success: (res: any) => {
			firstLoad = false
			const list = res.container_list
			res.container_list.forEach((item: any) => {
				cpuAndMemData.value[item.id] = {
					cpu_usage: 0,
					mem_percent: 0,
				}
			})
			containerList.value = list
			containerTableData.total = list.length
			showList.value = chunkArray({ ...containerTableData, list }) || []
			containerTableData.loading = false
			groupList.value = res // 状态分组
			maxCPU.value = res.online_cpus
			maxMem.value = Number(getByteUnit(Number(res.mem_total), false, 0, 'MB'))
			maxGpus.value = res.gpu || 0
		},
	})
	await useDataHandle({
		request: getContainerInfo(),
		data: Array,
		success: (data: any) => {
			containerList.value.forEach((item: any, index: number) => {
				const obj = data.find((tr: any) => tr.id === item.id)
				if (obj) {
					item.backup_count = obj.backup_count
					item.remark = obj.remark
				}
			})
			rsyncData()
		},
	})
}
/**
 * @description 容器日志
 * @returns {Promise<VueConstructor>}
 */
const openContainerLogView = (row: any = {}) => {
	if (!containerList.value.length) return Message.error('容器列表为空')
	useDialog({
		component: () => import('./container-logs-dialog/index.vue'),
		title: `容器日志`,
		area: 92,
		compData: { row, list: containerList.value },
	})
}

/**
 * @description 容器备份
 * @returns {Promise<VueConstructor>}
 */
const ContainerBackupsDialog = (row: any): Promise<Component> =>
	useDialog({
		component: () => import('@docker/views/container/container-backups-dialog/index.vue'),
		title: '备份容器 - [' + row.name + ']',
		area: 79,
		compData: { row },
	})

/**
 * @description 清理容器
 * @returns {Promise<VueConstructor>}
 */
const clearConfirmDialog = async () => {
	await useConfirm({
		content: '将删除所有已停止、未使用的容器,是否继续？',
		title: '清理容器',
		width: '42rem',
		type: 'check',
		check: {
			content: '删除<span class="text-danger">所有</span>容器，包含正在运行的容器',
			onConfirm: async (status: boolean) => {
				containerTableData.loading = true
				let type = status ? 1 : 0
				useDataHandle({
					request: clearCon({ type }),
					message: true,
					success: getCList,
					error: () => {
						containerTableData.loading = false
					},
				})
			},
		},
	})
}
