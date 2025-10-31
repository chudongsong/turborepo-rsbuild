import { Socket, useSocket } from '@socket/index';
import { ref } from 'vue';
import { isDev } from '@/utils'

/**
 * @description 基于createSocket的，用于处理 WebSocket 请求的 Vue 3 Hook。
 * 主要用于处理 WebSocket 请求，发送请求和接收消息。
 *
 * @param {string} url - WebSocket 服务器的 URL。
 * @param {boolean} [autoReconnect=true] - 是否自动重连 WebSocket，默认值为 true。
 *
 * @returns {object} - 返回一个包含 socketRequest 方法和 socketDestroy 方法的对象。
 * 使用方式：const { socketRequest, socketDestroy } = useSocketRequest('/ws_model')创建一个ws链接
 *
 * @property {Function} socketRequest - 发送 WebSocket 请求的方法。它接受一个包含请求参数和可选消息处理回调的对象。
 *    @param {object} options - 请求选项。
 *    @param {AnyObject} options.params - 要发送的请求参数。
 *    @param {AnyFunction | false} [options.onMessage=false] - 可选的消息处理回调。如果提供，将在接收到消息时调用。
 * @property {Function} socketDestroy - 销毁 WebSocket 连接的方法。
 * 使用方式：socketDestroy()
 * 注意：考虑到可能会在非setup中使用，所以不提供自动销毁。在组件销毁时，请手动调用此方法.
 */
export const useSocketRequest = (url: string, autoReconnect = true) => {
	const ws = ref<Socket | null>(null);
	let sendDataList: AnyObject = {};

	const initWebSocket = () => {
		ws.value = useSocket({
			route: url,
			onMessage: onWSReceive,
			autoReconnect,
		});
		if(isDev){
			ws.value?.send({})
		}
	};
	const onWSReceive = (ws: WebSocket, event: any) => {
		try {
			const data = JSON.parse(event.data);
			const callback = data.callback || data.ws_callback || data.def_name;
			if (callback && sendDataList[callback]) {
				sendDataList[callback].callback(ws, event); // 发送消息
			}
		} catch (error) {
			console.log(error);
		}
	};

	const socketRequest = ({ params, onMessage = false }: { params: AnyObject; onMessage?: AnyFunction | false }): Promise<any> => {
		if (onMessage)
			return addSendData(params, (ws: WebSocket, event: any) => {
				const rdata = JSON.parse(event.data);
				onMessage(rdata);
			});

		return new Promise(resolve => {
			addSendData(params, (ws: WebSocket, event: any) => {
				const data = JSON.parse(event.data);
				const name = data.callback || data.ws_callback || data.def_name;
				delete sendDataList[name]; // 删除已处理完成队列任务
				if (params.ws_callback === name) resolve(data);
			});
		});
	};

	// 添加消息至发送队列
	const addSendData = (params: AnyObject, callback: AnyFunction): any => {
		// 如果存在相同的请求，删除之前的请求
		if (sendDataList[params.ws_callback]) sendDataList[params.ws_callback] = undefined;
		sendDataList[params.ws_callback] = {
			data: params,
			callback,
			request: true, // 是否为请求方式
		};
		ws.value?.send(params); // 如果处于连接状态直接，发送消息
	};

	// 销毁
	const destroy = () => {
		if (ws.value) {
			ws.value.close();
		}
		sendDataList = {};
	};

	initWebSocket();

	// onUnmounted(() => { // 考虑到可能会在非setup中使用，所以不提供自动销毁
	// 	destroy()
	// })

	return {
		socketRequest,
		socketDestroy: destroy, // 手动销毁
	};
};
// * 使用方式：
// const request = useSocketRequest('/ws_model') // 创建链接
// const res = await request.socketRequest({
// params:{
// 	ws_callback: 'test',// * 请确保返回参数中的callback || ws_callback || def_name与发送参数params中的ws_callback相同。
// 	def_name:'test'}
// })// 适用一次性请求

// * 或者

// request.socketRequest({
// 	params:{
// 	  ws_callback: 'test',// * 请确保返回参数中的callback || ws_callback || def_name与发送参数params中的ws_callback相同。
// 		def_name:'test'
// 	},
// 	onMessage:(data)=>{console.log(data)}
// })// 适用长期监听

// * 注意：相同ws_callback请求只能有一个，如果有多个，只有最后一个请求会返回数据。
