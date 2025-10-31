import { getDockerStore } from '@docker/useStore'
import { Message, useConfirm, useDialog } from '@/hooks/tools'
import { useSocketRequest } from '@hooks/tools/socket/use-socket-request'


const {
	refs: { orchestrationData },
} = getDockerStore()


export const socketInstance = ref<any>(null) // socket方法实例
export const restartCompose = ref(false) // 重启编排


// 状态
export const composeStatusObject = (status: string) => {
	switch (status) {
		case 'running':
			return { text: '运行中', type: 'success' }
		case 'exited':
			return { text: '已停止', type: 'danger' }
		default:
			return { text: '异常', type: 'warning' }
	}
}

// 列表是否为空
export const isEmpty = ref(true)

/**
 * @description: 创建容器编排弹窗
 * @param {Function} callback 回调函数
 */
export const createComposeDialog = async (callback: Function) => {
	useDialog({
		isAsync: true,
		component: () => import('./add-orchestration/index.vue'),
		compData: { wsConfirm: callback },
		title: '添加容器编排',
		area: 60,
		btn: '确定',
	})
}

/**
 * @description: 添加编排
 * @param { object } params 编排数据
 */
export const addCompose = async ({ params, close }: { params: any; close: any }) => {
	try {
		return new Promise(async (resolve, reject) => {
			const dialog = await useDialog({
				isAsync: true,
				title: '添加日志 - 请耐心等待不要关闭此窗口',
				area: 60,
				component: () => import('@/views/docker/views/orchestration/orchestration-terminal/index.vue'),
				compData: {
					init: (writeMsg: any) => {
						socketInstance.value.socketRequest({
							params,
							onMessage: (data: any) => {
								close()
								writeMsg(data.msg)
								// // 结束
								if (data?.data === -1) {
									// dialog.close()
									Message.request(data)
									orchestrationData.value.refreshList = 'force'
									resolve(data)
								}
							},
						})
					},
				},
			})
		})
	} catch (error) {}
}
/**
 * @description: 删除编排
 * @param { object } item
 */
export const delCompose = async (item: { path: string; name: string }) => {
	try {
		await useConfirm({
			icon: 'warning-filled',
			title: `删除容器编排【${item.name}】`,
			width: '35rem',
			content: `将删除指定容器编排【${item.name}】,是否继续？`,
		})
		const params = {
			mod_name: 'docker',
			sub_mod_name: 'com',
			def_name: 'delete',
			project_name: item.name,
			path: item.path,
			ws_callback: 'delete',
		}
		// 暂停列表刷新
		orchestrationData.value.noRefresh = true
		return new Promise((resolve, reject) => {
			let load = Message.load('正在删除中')
			socketInstance.value.socketRequest({
				params,
				onMessage: (data: any) => {
					// 结束
					if (data?.data === -1) {
						load.close()
						Message.request(data)
						orchestrationData.value.noRefresh = false
						orchestrationData.value.refreshList = true
						resolve(data)
					}
				},
			})
		})
	} catch (error) {}
}

/**
 * @description 获取具体容器编排数据
 * @param {object} params 参数
 */
export const createNewSocket = async () => {
	socketInstance.value?.socketDestroy()
	// 创建ws连接
	const { socketRequest, socketDestroy } = useSocketRequest('/ws_modsoc', false)
	socketInstance.value = { socketRequest, socketDestroy }
	return new Promise((resolve, reject) => {
		resolve(socketInstance.value)
	})
}

export const init = () => {
	createNewSocket()
	orchestrationData.value.currentCompose.path = ''
	orchestrationData.value.currentCompose.name = ''
	orchestrationData.value.loading = true
}

export const unmountHandle = () => {
	orchestrationData.value.currentCompose.path = ''
	socketInstance.value?.socketDestroy()
	restartCompose.value = false
	socketInstance.value = null
}

export const jumpToUrl = (con: string, type: string) => {
	if(!con.startsWith('0.0.0.0:')) return
	const host = window.vite_public_ip
	const port = con.split('->')[0].split(':')[1]
	const url = `${type}://${host}:${port}`
	window.open(url, '_blank')
}





















