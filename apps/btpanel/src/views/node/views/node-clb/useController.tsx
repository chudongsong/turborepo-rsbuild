import { useDialog } from '@/hooks/tools'
import { useSocketRequest } from '@/hooks/tools/socket/use-socket-request'
import { useNodeClbStore } from './useStore'
import { useSocket, Socket } from '@/hooks/tools/socket'
import { Message } from '@/hooks/tools'

const { activeTabs } = useNodeClbStore()

export const openLogEvent = (row?: any) => {
	useDialog({
		title: `${activeTabs.value === 'http' ? 'HTTP' : 'TCP/UDP'}负载均衡访问日志`,
		area: 130,
		component: () => import('./clb-log/index.vue'),
		compData: { row },
	})
}

// 简易版本比较函数
export const compareVersions = (version1: string, version2: string) => {
	if (version1 === '') return 0
	const v1 = version1.split('.').map(Number)
	const v2 = version2.split('.').map(Number)
	const maxLength = Math.max(v1.length, v2.length)

	for (let i = 0; i < maxLength; i++) {
		const num1 = v1[i] || 0
		const num2 = v2[i] || 0

		if (num1 < num2) return -1
		if (num1 > num2) return 1
	}

	return 0
}

/**
 * 通用的 ws_modsoc WebSocket 请求 composable
 * @param params 传递给后端的参数对象（包含 mod_name, sub_mod_name, data 等）
 * @param onMessage 回调，收到消息时触发
 * @returns { wsData, loading, send, destroy }
 */

export function useModsocSocket(params: any, onMessage?: (data: any) => void) {
	const wsData = ref<any>(null)
	const loading = ref(true)
	const { socketRequest, socketDestroy } = useSocketRequest('/ws_modsoc')
	// 发送请求
	const send = () => {
		socketRequest({
			params: {
				...params,
				def_name: 'create_http_load',
				ws_callback: 'create_http_load',
			},
			onMessage: (res: any) => {
				wsData.value = res
				loading.value = false
				onMessage && onMessage(res)
			},
		})
	}
	// 自动发送一次
	send()
	// 组件卸载时关闭连接
	onUnmounted(() => {
		socketDestroy()
	})
	return {
		wsData,
		loading,
		send,
		destroy: socketDestroy,
	}
}

/**
 * 根据 value 找 label
 * @param options 选项列表
 * @param value 值
 * @returns 对应的 label
 */

export function getLabelByValue(options: any[], value: any) {
	return options.find(opt => opt.value === value)?.label || value
}

/**
 * 创建 WebSocket 并发送数据，返回 Promise
 * @param params 发送的数据
 * @returns Promise
 */
let socketInfo: Socket | null = null
export function createWebSocketWithResult(params: any, options?: { loading?: boolean; loadingText?: string }): Promise<any> {
	const showLoading = options?.loading !== false
	const loadingText = options?.loadingText || '正在处理中...'
	return new Promise((resolve, reject) => {
		let loading: any = null
		let finished = false
		if (showLoading) {
			loading = Message.load(loadingText)
		}
		socketInfo?.close()
		socketInfo = useSocket({
			route: '/ws_modsoc',
			onMessage: (ws: WebSocket, e: MessageEvent) => {
				const msg = JSON.parse(e.data)
				// 优先处理终止类消息
				if ((msg.type === 'end' || msg.type === 'success' || msg.type === 'error') && !finished) {
					finished = true
					loading?.close()
					if (msg.type === 'error') {
						Message.error(msg.data)
						reject(msg.data)
					} else {
						Message.success(msg.data)
						resolve(msg.data)
					}
					return
				}
				if (msg.type === 'log' && !finished && loading && typeof loading.setText === 'function') {
					loading.setText(msg.data)
				}
			},
		})
		if (process.env.NODE_ENV === 'development') {
			socketInfo?.send({})
		}
		socketInfo?.send(params)
	})
}
