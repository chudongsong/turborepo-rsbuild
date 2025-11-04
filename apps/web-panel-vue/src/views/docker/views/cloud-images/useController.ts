import { openAddContainerView } from '@docker/useMethods'
import { useSocket, Socket } from '@/hooks/tools'
import { deleteMirror, searchOfficialTemplate, getURL } from '@/api/docker'
import { Message, useDialog, useConfirm, useDataHandle } from '@/hooks/tools'

// 表单
export const officiaForm = reactive({
	name: '',
	description: '暂无数据',
	isRefresh: true,
})

// 表格
export const tableData = reactive({
	loading: false,
	list: [] as any[],
	total: 0,
	tableHeight: '410px',
})
export const isPopup = ref(true) // 是否是弹窗调用

export const registryList = ref<{ name: string; value: string }[]>([]) // 加速列表
export const registryActive = ref('') // 加速列表激活项

let detailsPopup: any = null // 详情弹窗
let logPopup: any = null // 日志弹窗

// 拉取镜像消息监听
const onMessage = (e: any, content: any, closeWs: AnyFunction, closePopup: AnyFunction) => {
	const msg = e.data
	content.value += `${msg}`
	if (msg.includes('bt_successful')) {
		Message.success('拉取成功')
		closeWs() // 关闭socket
		logPopup = null
		// search()
	}
	if (msg.includes('bt_failed')) {
		Message.error('拉取失败')
		closeWs() // 关闭socket
	}
}
// 拉取镜像详情
export const pullDetails = async (row: any, refresh: AnyFunction): Promise<void> => {
	detailsPopup = await useDialog({
		title: `${row.is_pull ? '更新' : '拉取'}镜像`,
		area: 50,
		component: () => import('./pull-image-details-dialog.vue'),
		compData: { name: row.name, refresh },
	})
}

// 拉取镜像
export const pullImages = async (row: any, refresh: AnyFunction): Promise<void> => {
	let params = {
		model_index: 'btdocker',
		mod_name: 'image',
		def_name: 'pull_from_some_registry',
		ws_callback: 111,
		name: 'docker官方库',
		image: `${row.name}:${row.tag}`,
		registry_mirrors: registryActive.value == 'noSpeed' ? '' : registryActive.value,
	}
	logPopup = await useDialog({
		title: `拉取镜像`,
		area: 65,
		component: () => import('./pull-image-log-dialog.vue'),
		compData: { url: '/ws_model', params, onWSReceive: onMessage, onRefresh: () => refresh() },
	})
}

/**
 * @description 创建容器
 */
export const createEvent = async (row: any): Promise<void> => {
	openAddContainerView({ image: row.name })
}

/**
 * @description 删除镜像
 */
export const delEvent = async (row: any, refresh: AnyFunction): Promise<void> => {
	const params = { id: row.id, name: row.name, force: '0' }
	try {
		await useConfirm({
			type: 'calc',
			title: `删除镜像【${row.name}】`,
			content: `您真的要删除镜像【${row.name}】吗？`,
		})

		useDataHandle({
			request: deleteMirror({ data: JSON.stringify(params) }),
			message: true,
			success: refresh,
		})
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 手动分页
 */
export const cutList = (tableParams: any): { data: any[]; total: number } => {
	const arr = tableData.list.slice((tableParams.p - 1) * tableParams.limit, tableParams.p * tableParams.limit)
	return { data: arr, total: tableData.total }
}

/**
 * @description: 搜索
 */
export const search = async (data: any): Promise<{ data: any[]; total: number }> => {
	// 分页
	if (tableData.list.length !== 0 && !officiaForm.isRefresh) {
		return cutList(data)
	} else {
		// 请求接口
		officiaForm.isRefresh = false
		const resArr = await useDataHandle({
			request: searchOfficialTemplate({
				data: JSON.stringify({ name: officiaForm.name }),
			}),
			data: Array,
			loading: toRef(tableData, 'loading'),
		})
		if (resArr.length === 0) officiaForm.description = `没有搜索到${officiaForm.name}相关的镜像`
		tableData.list = resArr
		tableData.total = resArr.length
		return cutList(data)
	}
}

/**
 * @description: 官方镜像搜索
 */
export const jumpDKhub = (sourceID: number): void => {
	if (officiaForm.name === '') return Message.error('请输入需要搜索的镜像名')
	const _href = sourceID === 0 ? 'https://1ms.run/search?query=' : 'https://hub.docker.com/search?type=image&q='
	// 新页面打开
	window.open(_href + officiaForm.name, '_blank', 'noopener,noreferrer')
}

/**
 * @description: 清除空格
 */
export const clearSpace = (name: string) => {
	officiaForm.description = '暂无数据'
	officiaForm.name = officiaForm.name.replace(/\s+/g, '')
}
/**
 * @description 获取加速列表
 */
const getRegistryList = async () => {
	const { data } = await getURL()
	registryList.value = data.registry_mirrors
		.map((item: [string, string]) => {
			return { name: item, value: item }
		})
		.concat([{ name: '不使用加速', value: 'noSpeed' }])
	registryActive.value = registryList.value[0].value
}

// 初始化
export const init = (mainHeight: Ref<number>, popupSetFooter: boolean, tableParams: Ref<{ p: number; limit: number; search: string }>): void => {
	// search()
	setTimeout(() => {
		// 判断是否是弹窗，设置表格高度
		if (popupSetFooter) {
			// 弹窗的高度
			tableData.tableHeight = `410px`
		} else {
			isPopup.value = false
			const tableHeight = mainHeight.value - 270
			// 主页面的高度
			tableData.tableHeight = `${tableHeight}px`
			tableHeight > 800 && (tableParams.value.limit = 20)
		}
		// getRegistryList()
	}, 0)
}

// 销毁
export const unmountHandler = (): void => {
	officiaForm.name = ''
	officiaForm.description = '暂无数据'
	tableData.list = []
	tableData.total = 0
	tableData.loading = false
	tableData.tableHeight = '410px'
	officiaForm.isRefresh = true
}

// 拉取镜像
export let socketInfo: Socket | null = null

export const logContent = ref<string>('开始拉取镜像...\n')

/**
 * @description 创建socket
 */
const createWebSocket = (props: any, popupClose: AnyFunction) => {
	socketInfo = useSocket({
		route: props.compData.url,
		onMessage: (ws: WebSocket, e: MessageEvent) => {
			props.compData.onWSReceive(e, logContent, closeWebSocket, popupClose)
		},
	})
}

/**
 * @description 初始化发送数据
 */
// 发送数据
const socketSend = (props: any) => {
	let param: AnyObject = {
		...props.compData.params,
	}
	socketInfo?.send(param) // 发送ID和主机信息，
}

/**
 * @description 关闭ws
 */
export const closeWebSocket = (callback: AnyFunction | false) => {
	if (socketInfo) {
		socketInfo.socket.close()
		socketInfo = null
	}
	if (callback) callback()
}

/**
 * @description 拉取镜像
 */
export const initPullImage = async (props: any, popupClose: AnyFunction) => {
	await createWebSocket(props, popupClose)
	socketSend(props)
}

/**
 * @description 关闭弹窗
 */
export const unmountLogHandler = (callback?: AnyFunction) => {
	closeWebSocket(callback || false)
	logContent.value = '开始拉取镜像...\n'
}
