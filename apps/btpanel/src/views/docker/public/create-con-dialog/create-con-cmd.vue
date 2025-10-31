<template>
	<div class="container-dialog !p-0">
		<el-form size="large" :model="cmdForm" class="relative w-full" :label-position="`top`" @submit.native.prevent>
			<el-form-item prop="name">
				<el-input autofocus v-model="cmdForm.order" :disabled="disabled" @keyup.enter.native="execute" placeholder="请输入需要执行的命令，例如 docker run -d nginx:latest，按回车执行">
					<template #append>
						<el-button type="default" @click="execute">执行命令</el-button>
					</template>
				</el-input>
			</el-form-item>
			<div class="text-right"></div>
			<div class="resultTitle px-[.2rem] py-[.4rem]">命令执行结果：</div>
			<div class="result">
				<div class="p-[.6rem] rounded-default bg-[#222] h-[46.2rem]">
					<!-- <bt-docker-terminal
						v-if="showTerminal"
						ref="terminal"
						url="/ws_model"
						:host-info="param"
						@complete="close" /> -->
					<bt-log class="h-[45rem] !rounded-none" :content="logContent" />
				</div>
			</div>
		</el-form>
	</div>
</template>
<script setup lang="ts">
import { CmdAddContainer } from '@/api/docker'
import { getDockerStore } from '@docker/useStore'
import { useSocket, Socket } from '@hooks/tools/socket'
import { useMessage } from '@hooks/tools/message'
import { useDataHandle } from '@hooks/tools/data'

const Message = useMessage() // 消息提示

const {
	refs: { isRefreshTableList },
} = getDockerStore()

let socketInfo: Socket | null = null
// 表单
const cmdForm = reactive({
	order: '',
	result: '',
})
const disabled = ref(false)
const logContent = ref('') // 日志信息

// 展示终端
const showTerminal = ref(false)

// 发送数据
const param: AnyObject = reactive({
	model_index: 'btdocker',
	mod_name: 'container',
	def_name: 'get_cmd_log',
	ws_callback: 111,
})

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
				msg: msg.includes('bt_successful') ? '创建成功' : '创建失败',
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

/**
 * @description 执行命令
 */
const execute = async () => {
	if (cmdForm.order === '') return
	showTerminal.value = true
	disabled.value = true
	useDataHandle({
		request: CmdAddContainer({ cmd: cmdForm.order }),
		success: (res: any) => {
			if (res.status) {
				createWebSocket()
			} else {
				Message.error(res.msg)
				disabled.value = false
			}
		},
	})
}
</script>
<style lang="css" scoped>
.container-dialog {
	@apply flex flex-col lib-box;
}
.portTable :deep(.el-form-item__label) {
	@apply w-[5rem] h-[4rem] text-default mr-[0rem] bg-[#f2f4f7] border-medium border-[1px] border-[#e4e7ed] rounded-l-[0.4rem] px-[1rem] box-border;
}
.el-form-item {
	@apply mb-[1.5rem];
}
:deep(.el-input-group__append) {
	@apply bg-primary text-white;
}
:deep(.is-disabled .el-input-group__append) {
	@apply bg-[#f5f5f5] text-[#c1c1c1];
}
</style>
