/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/naming-convention */
import type { UseWebSocketReturn, WebSocketStatus } from '@vueuse/core'
import { useWebSocket } from '@vueuse/core'
import md5 from 'md5'
import { setObjToUrlParams, getRandomChart, isDev, isObject, isUndefined } from '@/utils'

interface Config {
	route: string // 路由
	onConnected?: (ws: WebSocket, config: Config) => void // 连接成功
	onDisconnected?: (ws: WebSocket, event: CloseEvent) => void // 连接断开
	onError?: (ws: WebSocket, event: Event) => void // 连接错误
	onMessage?: (ws: WebSocket, event: MessageEvent) => void // 接收消息
	noInit?: boolean // 是否初始化，通道验证，是否可以链接
	autoReconnect?: boolean // 是否自动重连
}

export class Socket {
	public static protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'

	public route: string = '' // 路由

	public static host: string = (() => {
		return isDev ? `${window.vite_public_proxy_ip}:${window.vite_public_proxy_port}` : window.location.host
	})()

	// Socket实例
	public socket: UseWebSocketReturn<AnyObject> | AnyObject = {}

	// 发送数据列表
	static sendDataList: AnyObject = {}

	// 是否自动重连
	public autoReconnect: boolean = true

	constructor(config: Config) {
		this.route = config.route
		this.autoReconnect = config.autoReconnect === undefined ? true : config.autoReconnect
		this.create(config)
	}

	// 通道验证
	public channelVerify() {
		if (window.vite_public_request_token) {
			this.send({
				'x-http-token': window.vite_public_request_token,
			})
		}
	}

	// 创建socket
	public create(config: Config) {
		let url = `${Socket.protocol}//${Socket.host}${config.route}`
		// 是否为开发环境
		if (isDev) {
			const requestTime = Date.now()
			const agentKey: string = window.vite_public_proxy_key // 秘钥
			const requestToken = md5(String(requestTime).concat(md5(agentKey)))
			// eslint-disable-next-line @typescript-eslint/naming-convention
			url = setObjToUrlParams(url, { request_time: requestTime, request_token: requestToken })
		}
		this.socket = useWebSocket(url, {
			// heartbeat: true, // 开启心跳检测, 默认每 30s 发送一次心跳
			autoReconnect: {
				retries: 3, // 重连次数
				delay: 1000, // 重连间隔时间
			}, // 自动重连

			// 事件,
			onConnected: (ws: WebSocket) => {
				this.onConnected(ws, config)
				if (config.onConnected) config.onConnected(ws, config)
			},
			onDisconnected: (ws: WebSocket, event: CloseEvent) => {
				if (config.onDisconnected) config.onDisconnected(ws, event)
				this.onDisconnected(ws)
			},
			onError: (ws: WebSocket, event: Event) => {
				if (config.onError) config.onError(ws, event)
				this.onError(ws, event)
			},
			onMessage: (ws: WebSocket, event: MessageEvent) => {
				if (config.onMessage) config.onMessage(ws, event)
				this.onMessage(ws, event)
			},
		})
		this.socket.callback = {}
	}

	// 连接成功
	public onConnected(ws: WebSocket, config: Config) {
		if (!config.noInit) this.channelVerify() // 通道验证，所有连接成功后发送验证消息，必须验证通过才能进行后续操作
		this.handleSendData() // 处理堆积的请求消息
	}

	// 连接断开
	public onDisconnected(ws: WebSocket) {
		console.log('断开连接', ws)
	}

	// 连接错误
	public onError(ws: WebSocket, event: Event) {
		console.log('连接错误', event)
	}

	// 接收消息
	public onMessage(ws: WebSocket, event: MessageEvent) {
		const routeArr = ['/ws_home', '/ws_model', '/ws_panel']
		if (routeArr.includes(this.route)) {
			try {
				const data = JSON.parse(event.data)
				const callback = data.callback || data.ws_callback
				if (callback && Socket.sendDataList[callback]) {
					Socket.sendDataList[callback].callback(ws, event) // 发送消息
				}
			} catch (error) {
				console.log(error)
			}
		}
	}

	// 发送消息
	public send(data: AnyObject | string) {
		const status = this.isStatus('OPEN')
		if (status) {
			this.socket.send(isObject(data) ? JSON.stringify(data) : data)
		} else {
			const random = getRandomChart(10)
			console.log('连接未打开，消息已加入发送队列', random)
			Socket.sendDataList[random] = data
		}
	}

	// 打开连接，如果已经打开则重新打开
	public open() {
		this.socket.open()
	}

	// 关闭连接
	public close() {
		this.socket.close()
	}

	/**
	 * @description 判断当前状态
	 * @param {WebSocketStatus} type 状态
	 * @returns {boolean} 返回状态
	 */
	public isStatus(type: WebSocketStatus) {
		const status = this.socket.status.value || this.socket.status
		return status === type
	}

	/**
	 * @description 处理数据
	 * @param {string} url 请求路径
	 * @param {AnyObject} params 请求参数
	 * @returns {AnyObject} 返回处理后的数据
	 */
	private processData(url: string, params: AnyObject = { customType: 'default', data: {} }) {
		if (isUndefined(params.customType)) params.customType = 'default'
		const { customType } = params
		const menu = window.location.pathname.split('/')[0] || 'home'
		const data = {
			mod_name: '',
			def_name: '',
			menu,
			model_index: '',
			args: '',
			ws_callback: '',
			ws_id: '',
			...params.data,
		}
		const urlArr = url ? url.split('/') : []
		if (urlArr.length !== 2 && customType !== 'model') throw new Error('传统请求/插件请求路径格式错误，正确格式为：模块名/方法名')
		switch (customType) {
			case 'default':
				return { ...data, mod_name: urlArr[0], def_name: urlArr[1], ws_callback: urlArr[1] }
			case 'model':
				return {
					...data,
					model_index: urlArr[0],
					mod_name: urlArr[1],
					def_name: urlArr[2],
					ws_callback: urlArr[2],
					onMessage: params.onMessage || null,
				}
		}
		return {}
	}

	/**
	 * @description 添加发送数据
	 * @param {AnyObject} data 发送数据
	 * @param {AnyFunction} callback 回调函数
	 */
	private addSendData(data: AnyObject, callback: AnyFunction): any {
		const status = this.isStatus('OPEN')
		Socket.sendDataList[data.def_name] = {
			data,
			status,
			callback,
			request: true, // 是否为请求方式
		}
		if (status) this.send(data) // 如果处于连接状态直接，发送消息
	}

	/**
	 * @description 请求
	 * @param {string} url 请求路径
	 * @param {AnyObject} params 请求参数
	 * @returns {Promise} 返回请求结果
	 */
	public request(url: string, params: AnyObject = {}): Promise<any> {
		const data = this.processData(url, params)
		if (data.onMessage)
			return this.addSendData(data, (ws: WebSocket, event: any) => {
				const rdata = JSON.parse(event.data)
				data.onMessage(rdata.result, rdata)
			})

		return new Promise(resolve => {
			this.addSendData(data, (ws: WebSocket, event: any) => {
				const data = JSON.parse(event.data)
				const rdata = { data: data.result }
				delete Socket.sendDataList[data.ws_callback] // 删除已处理完成队列任务
				if (data.ws_callback) resolve(rdata)
			})
		})
	}

	/**
	 * @description 处理发送数据
	 */
	public handleSendData() {
		Object.entries(Socket.sendDataList).forEach(([key, value]) => {
			const { request, status, data } = value
			if (this.route !== '/ws_home' && !request) {
				this.send(value) // 发送消息
				delete Socket.sendDataList[key] // 删除已处理完成队列任务
			} else if (!status) {
				this.send(data) // 发送消息
				Socket.sendDataList[key].status = true // 修改状态
			}
		})
	}
}

/**
 * @description 创建socket
 * @param {Config} config 配置
 * @returns {Socket} 返回socket实例
 */
export const useSocket = (config: Config) => {
	return new Socket(config)
}

// /**
//  * @description 创建socket初始化
//  * @param {Config} config 配置
//  * @returns  {Socket} 返回socket实例
//  */
// export const useSocket = (config: Config) => {
// 	const socket = new Socket(config)
// 	const param: AnyObject = {}
// 	if (!isDev && config.) {
// 		param['x-http-token'] = window.vite_public_request_token
// 	}
// 	socket.send(param)
// 	return socket
// }

// export default useSocket
