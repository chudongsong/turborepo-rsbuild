import { getDockerStore } from '@docker/useStore'
import { getStashList, CmdAddContainer } from '@/api/docker'
import { useDataHandle,Message,useSocket, Socket } from '@/hooks/tools'

import { ElForm } from 'element-plus'


const {
	refs: { isRefreshTableList },
} = getDockerStore() // 表格刷新

let socketInfo: Socket | null = null

export const disabled = ref(false)
export const logContent = ref('') // 日志信息


export const menu = ref('common')
// 表单
export const cmdForm = reactive({
	name: '',
	image: '',
	cmd: '',
})
// 发送数据
const param: AnyObject = {
	model_index: 'btdocker',
	mod_name: 'image',
	def_name: 'pull_from_some_registry',
	ws_callback: 111,
	name: '',
	image: '',
	// cmd: '',
}

/**
 * @description 清空日志
 */
export const clearLog = () => {
	logContent.value = ''
}

/**
 * @description 消息接收检测和输出
 * @param {MessageEvent} e 对象
 */
const onWSReceive = (ws: WebSocket, e: MessageEvent) => {
	try {
		const msg = e.data

		logContent.value += `${msg}`
		if (msg.includes('bt_successful') || msg.includes('bt_failed')) {
			const res = {
				status: msg.includes('bt_successful'),
				msg: msg.includes('bt_successful') ? '拉取成功' : '拉取失败',
			}
			Message.request(res)
			res.status && (isRefreshTableList.value = true)
			socketInfo?.close() // 关闭socket
			disabled.value = false
		}
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 创建socket
 */
const createWebSocket = () => {
	socketInfo?.close()
	logContent.value = ''
	socketInfo = useSocket({
		route: '/ws_model',
		onMessage: onWSReceive,
	})
	socketInfo?.send(param)
}
// 验证规则
export const cmdRules = {
	image: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (value === '') {
					callback(new Error('请输入镜像名'))
				} else {
					callback()
				}
			},
			trigger: ['blur'],
		},
	],
}

export const refreshTable = () => {
	isRefreshTableList.value = true
}

// 仓库名称选项
export const options = ref<any[]>([])


// 命令拉取提交
const onCmdConfirm = async () => {
	try {
		if (cmdForm.cmd === '') {
			Message.error('请输入命令')
			return
		}
		disabled.value = true
		param.name = ''
		param.url = ''
		param.image = ''
		param.def_name = 'get_cmd_log'
		const res = await CmdAddContainer({ cmd: cmdForm.cmd }, 'image')
		
		if(res.status){
			createWebSocket()
		}else{
			Message.error(res.msg)
			disabled.value = false
		}
	} catch (error) {
		console.log(error)
	} finally {
	}
}

// 提交
export const onConfirm = async (cmdFormRef:Ref<typeof ElForm>) => {
	try {
		if (menu.value === 'cmd') {
			onCmdConfirm()
			return
		}
		if (cmdForm.name === '') {
			Message.error('请选择仓库名')
			return
		}
		disabled.value = true
		await cmdFormRef.value.validate(async (valid: boolean) => {
			if (valid) {
				param.name = options.value.find((item: any) => item.url == cmdForm.name).name
				param.url = options.value.find((item: any) => item.url == cmdForm.name).url
				param.image = cmdForm.image
				param.def_name = 'pull_from_some_registry'
				createWebSocket()
			} else {
				disabled.value = false
			}
		})
	} catch (error) {
		console.log(error)
	} finally {
	}
}

export const init = async () => {
	// 获取仓库列表
	useDataHandle({
		request: getStashList(),
		data: Array,
		success: (data: any[]) => {
			data.forEach((item: any) => {
				options.value.push({
					value: item.url,
					label: `${item.name}${item.url === 'docker.io' ? '' : `(${item.url})`}`,
					url: item.url,
					name: item.name,
				})
			})
			cmdForm.name = options.value[0]?.value
		},
	})
}

export const unmountHandler = () => {
	socketInfo?.close()
	socketInfo = null
	options.value = []
	cmdForm.name = ''
	cmdForm.image = ''
	cmdForm.cmd = ''
	clearLog()
}












