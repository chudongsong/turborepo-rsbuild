import { useSocket as createSocket, Socket } from "@/hooks/tools";
import { Message,useDialog } from '@/hooks/tools';


let useSocket: Socket | null = null;
let cmdContent = ''
export const logContent = ref('') // 内容
export const init = (close:AnyFunction) => {
	let logArr:string[] = [];
						// 创建ws连接
						useSocket = createSocket({
							route: "/sock_shell",
							onMessage: (socket: any,data:any) => {
							logArr.push(data.data);
							// 如果队列长度超过最大长度，删除多余的消息
							if (logArr.length > 50) {
								logContent.value = logArr?.slice(logArr.length - 50).join(" ");
							} else {
								logContent.value = logArr?.join(" ");
							}
							if (data.data.includes("bt_successful") || data.data.includes("bt_failed")) {
								useSocket?.close();
								logArr = []
							}
								// // 结束
								if (data.data.includes("bt_successful")) {
									close()
									Message.success("创建成功")
								}
								// // 结束
								if (data.data.includes("bt_failed")) {
									Message.error("创建失败")
								}
							},
						});
						useSocket?.send(cmdContent);// 发送消息
						// useSocket?.send(`tail -f /www/dk_project/runtime/build/php/python/create.log`);// 发送消息
}
export const unmount = () => {
	useSocket?.close()
	useSocket = null
	cmdContent = ''
	logContent.value = ''
}

export const openBuildLog = (cmd:string,callback?:AnyFunction) =>{
	cmdContent = cmd
	useDialog({
		title: '创建日志',
		area: 60,
		component: () => import('@docker/views/docker-site/site-env/build-log/index.vue'),
		onCancel: () => {
			// useSocket?.close()
			// useSocket = null
			callback && callback()
		},
	})
}
