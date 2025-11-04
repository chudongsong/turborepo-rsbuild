import { getComposeConLog, setContainerStatus } from '@/api/docker'
import { getDockerStore } from '@docker/useStore'
import { Message, useConfirm, useDialog, useDataHandle } from '@/hooks/tools'
import { checkVariable } from '@utils/index'
import { delCompose, socketInstance } from '@docker/views/orchestration/useController'

const {
	refs: { orchestrationData },
} = getDockerStore()

export const logContent = ref('') // 日志内容

export const conList = ref<any[]>([]) // 容器列表

// loading状态
export const loading = reactive({
	con: false, // 容器
	log: false, // 编排日志
})

export const containerLogTitle = ref('容器日志') // 容器日志标题
export const containerLogView = ref(false) // 容器日志弹窗
export const containerLog = ref('暂无日志信息') // 容器日志内容

// 获取容器状态选项
export const statusAction = (status: string) => {
	const obj = {
		running: [
			{
				text: '重启',
				command: 'restart',
			},
			{
				text: '停止',
				command: 'stop',
			},
			{
				text: '强制停止',
				command: 'kill',
			},
		],
		exited: [
			{
				text: '启动',
				command: 'start',
			},
		],
		default: [
			// {
			// 	text: '恢复',
			// 	command: 'unpause',
			// },
			{
				text: '重启',
				command: 'restart',
			},
			{
				text: '强制停止',
				command: 'kill',
			},
		],
	}
	switch (status) {
		case 'running':
			return obj.running
		case 'exited':
			return obj.exited
		default:
			return obj.default
	}
}
// 状态
export const composeStatusObject = (status: string) => {
	switch (status) {
		case 'running':
			return {
				text: '运行中',
				type: 'success',
			}
		case 'exited':
			return {
				text: '已停止',
				type: 'danger',
			}
		default:
			return {
				text: '异常',
				type: 'warning',
			}
	}
}

// 点击管理
export const commandEvent = async (command: string, confirm = true) => {
	try {
		let text = ''
		switch (command) {
			case 'stop':
				//停止
				command === 'stop' && (text = '停止')
			case 'start':
				// 启动
				command === 'start' && (text = '启动')
			case 'restart':
				// 重启
				command === 'restart' && (text = '重启')
			case 'update':
				// 更新
				command === 'update' && (text = '更新')
			case 'rebuild':
				// 重建
				command === 'rebuild' && (text = '重建')
			case 'down':
				// 停止并删除所有容器
				command === 'down' && (text = '停止并删除所有容器')
				confirm &&
					(await useConfirm({
						icon: 'warning-filled',
						title: `【${orchestrationData.value.currentCompose.name}】${text}`,
						width: '35rem',
						content: `容器编排即将${text},是否继续？`,
					}))
				const params = {
					mod_name: 'docker',
					sub_mod_name: 'com',
					def_name: command,
					path: orchestrationData.value.currentCompose.path,
					project_name: orchestrationData.value.currentCompose.name,
					ws_callback: command,
				}
				useDialog({
					isAsync: true,
					title: `编排【${orchestrationData.value.currentCompose.name}】日志`,
					area: 60,
					component: () => import('@docker/views/orchestration/orchestration-terminal/index.vue'),
					compData: {
						init: (writeMsg: any) => {
							socketInstance.value.socketRequest({
								params,
								onMessage: (res: any) => {
									if (res.data === -1) {
										Message.request(res)
									}
									writeMsg(res.msg)
								},
							})
						},
					},
				})
				break
			case 'delete':
				// 删除
				delCompose(orchestrationData.value.currentCompose)
				break
		}
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description: 获取容器日志
 * @param { object } con 容器信息
 */
export const getConLog = async (con: any) => {
	try {
		const res = await getComposeConLog({ container_id: con.ID })
		if (res.status) {
			containerLogTitle.value = `容器【${con.Name}】日志`
			containerLog.value = res.data.msg
			containerLogView.value = true
		} else {
			Message.error(res.msg)
		}
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 设置状态事件
 * @param {FtpTableDataProps} row 行数据
 * @returns {void} void
 */
export const setStatusEvent = async (command: string, row: any): Promise<void> => {
	const params = {
		id: row.ID,
		status: command,
	}
	useDataHandle({
		request: setContainerStatus({ data: JSON.stringify(params) }),
		loading: '正在设置容器状态，请稍后...',
		message: true,
	})
}

/**
 * @description: 获取容器信息
 */
export const getConInfo = async () => {
	try {
		if (!orchestrationData.value.currentCompose.path) {
			loading.con = false
			return
		}
		const params = {
			mod_name: 'docker',
			sub_mod_name: 'com',
			def_name: 'get_project_ps',
			path: orchestrationData.value.currentCompose.path,
			ws_callback: 'get_project_ps',
		}
		loading.con = true
		socketInstance.value.socketRequest({
			params,
			onMessage: (res: any) => {
				conList.value = checkVariable(res.data, 'array', [])
				loading.con = false
				conList.value.map((con: any) => {
					con.port = con.Ports.split(',').filter((item: string) => item !== '')
				})
			},
		})
	} catch (error) {}
}
/**
 * @description: 获取���志信息
 */
export const getLogInfo = async () => {
	try {
		if (!orchestrationData.value.currentCompose.path) {
			loading.log = false
			return
		}
		const params = {
			mod_name: 'docker',
			sub_mod_name: 'com',
			def_name: 'get_logs',
			path: orchestrationData.value.currentCompose.path,
			ws_callback: 'get_logs',
		}
		loading.log = true
		let logNum = 0
		const logArr: string[] = []
		socketInstance.value.socketRequest({
			params,
			onMessage: (res: any) => {
				loading.log = false
				let str = checkVariable(res.msg, 'string', '', null, true)

				if (str === '暂无日志信息') {
					logContent.value = str
					logNum = 0
					return
				}

				// 日志超过200条清除
				if (logNum >= 200) {
					logArr.shift()
				}
				logArr.push(str)
				logNum++
				logContent.value = logArr.join('\n')
			},
		})
	} catch (error) {}
}
// 卸载操作
export const unmountHandle = () => {
	logContent.value = ''
	conList.value = []
	loading.con = false
	loading.log = false
	containerLogTitle.value = '容器日志'
	containerLogView.value = false
	containerLog.value = '暂无日志信息'
}
