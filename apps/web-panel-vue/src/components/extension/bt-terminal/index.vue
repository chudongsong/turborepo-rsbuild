<template>
	<div class="flex relative xterm-view">
		<div ref="terminalDom" class="w-full h-full"></div>
		<div v-if="isLocalVerify" class="terminal-add-host">
			<div class="w-[50rem] bg-white rounded-base flex flex-col items-center">
				<div class="text-large flex items-center w-full px-2rem mt-2rem">
					<el-alert type="warning" :closable="false" show-icon>
						<template #title>
							<span>无法自动认证，请填写本地服务器的登录信息!</span>
						</template>
					</el-alert>
				</div>
				<XtermAddHost ref="xtermAddHost" :comp-data="loacalDefault" />
				<div class="flex w-full mb-[4rem] pl-[12rem]">
					<el-button type="primary" @click="saveConfig">保存配置</el-button>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { useDebounceFn, useResizeObserver } from '@vueuse/core'
import { AttachAddon } from '@xterm/addon-attach' // 附加到websocket
import { CanvasAddon } from '@xterm/addon-canvas' // canvas
import { FitAddon } from '@xterm/addon-fit' // 自适应
import { WebLinksAddon } from '@xterm/addon-web-links' // 链接
import { Terminal } from '@xterm/xterm' // 终端
import { Socket, useSocket } from '@hooks/tools/socket'
import XtermAddHost from '@term/views/host-list/add-host.vue'
import { useTermHostStore } from '@/views/term/views/host-list/useStore'
import { initHostInfo } from '@/views/term/views/host-list/useController'
// @ts-ignore
import AutoCompleteAddon from './auto'

import '@xterm/xterm/css/xterm.css' // 终端样式

interface Props {
	url?: string
	id: string
	active: boolean
	fitColsRows?: boolean // 是否自动附加自动调整
	requestToken?: boolean // 请求token
	checkMsgFn?: AnyFunction
	hostInfo: AnyObject
	autoComplete: boolean
}

const { rowData } = useTermHostStore()

const props = withDefaults(defineProps<Props>(), {
	url: '/webssh',
	id: '',
	active: true, // 是否激活
	fitColsRows: true, // 是否自动附加自动调整
	requestToken: false, // 请求token，仅通过接口获取
	hostInfo: () => ({}),
	autoComplete: false,
})

const emit = defineEmits(['close']) // 定义emit
const linksNumber = ref(0) // 链接数量
const terminalDom = ref()
const isStatus = ref<'success' | 'warning' | 'danger'>('success') // 当前状态
const termObserver = ref() // 监听终端宽度变化
const isEnter = ref(false) // 是否按下回车
const isLocalVerify = ref(false) // 是否本地验证，本地验证需要用户手动输入账号密码
const xtermAddHost = ref()
const loacalDefault = reactive({
	isEdit: true,
	isLocal: true,
	rows: {
		host: '127.0.0.1',
		port: 22,
		username: 'root',
		password: '',
		pkey: '',
		pkey_passwd: '',
		ps: '127.0.0.1',
	},
})
const copy = ref('')
const isFitTrigger = ref(false) // 是否自适应触发

let socketInfo: Socket | null = null
let terminal: Terminal
let fitAddon: FitAddon
let autoCompleteAddon: AutoCompleteAddon

// 监听激活状态
watch(
	() => props.active,
	val => {
		if (val) {
			nextTick(() => {
				fitTerminal()
				terminal?.focus()
			})
		}
	}
)

watch(
	() => props.autoComplete,
	val => {
		if (autoCompleteAddon) {
			// eslint-disable-next-line no-unused-expressions
			val ? autoCompleteAddon.enable() : autoCompleteAddon.disable()
		} else if (val) {
			autoCompleteAddon = new AutoCompleteAddon({
				maxSuggestions: 100,
				caseSensitive: false,
				showDescriptions: true,
			})
			terminal.loadAddon(autoCompleteAddon) // 挂载自动补全插件
		}
	}
)
// 监听本地验证弹窗
watch(
	() => isLocalVerify.value,
	val => {
		if (autoCompleteAddon) {
			if (val) {
				autoCompleteAddon.disable()
			} else {
				autoCompleteAddon.enable()
			}
		}
		if (val)
			nextTick(() => {
				rowData.value = loacalDefault
				initHostInfo()
			})
	}
)

watch(isStatus, status => {
	if (!autoCompleteAddon) return
	if (status === 'success') {
		autoCompleteAddon.enable()
	} else {
		autoCompleteAddon.disable()
	}
})

/**
 * @description 创建socket
 */
const createWebSocket = (onConnected: AnyFunction) => {
	socketInfo = useSocket({
		route: props.url,
		noInit: !props.requestToken, // 不初始化
		onMessage: onWSReceive,
		onConnected,
	})
}

const first = ref(true)
let lastsTime = 0 // 上次发送时间

/**
 * @description 消息接收检测和输出
 * @param {MessageEvent} e 对象
 */
const onWSReceive = (ws: WebSocket, e: MessageEvent) => {
	// 首次接收消息，发送给后端，进行同步适配
	if (first.value === true) first.value = false
	const msg = e.data
	if (msg.indexOf('Authentication timeout.') > -1) isEnter.value = true // 认证超时，需要用户键入回车，等待重新认证
	if ((msg.indexOf('@127.0.0.1:') !== -1 || msg.indexOf('@localhost:') !== -1) && msg.indexOf('Authentication failed') !== -1) {
		// 本地自动登录失败，提示用户填写信息手动登录
		socketInfo?.close() // 关闭socket
		socketInfo = null
		unLock()
		isStatus.value = 'danger'
		isLocalVerify.value = true
		return false
	}
	if (msg === '\r\n登出\r\n' || msg === '登出\r\n' || msg === '\r\nlogout\r\n' || msg === 'logout\r\n' || msg.search(/logout[\r\n]+$/) > -1) {
		socketInfo?.close() // 关闭socket
		socketInfo = null
		unLock()
		setTimeout(() => {
			terminal.write('\r连接已断开,按回车将尝试重新连接!\r')
		}, 500)
		isStatus.value = 'danger'
		return false
	}

	if (props?.checkMsgFn) props.checkMsgFn(msg) // 检查消息方法

	// 设置成功连接状态
	if (isStatus.value === 'warning') {
		setTimeout(() => {
			isStatus.value = 'success'
		}, 500)
	} else {
		isStatus.value = 'success'
	}
	if (!props.active && lastsTime > 3) {
		isStatus.value = 'warning'
	}
	if (msg.indexOf('连接目标服务器失败') !== -1 || msg.includes('Authentication failed')) {
		isStatus.value = 'danger'
	}
	if (props.active) {
		lastsTime = 0
		return false
	}

	setTimeout(() => {
		lastsTime += 1
	}, 500)
}

const onAlternateScreenBufferChange = (isAlt: boolean) => {
	if (!autoCompleteAddon) return
	if (isAlt) {
		console.log('进入备用缓冲区')
		// 你的业务逻辑（比如暂停自动补全、调整UI等）
		autoCompleteAddon.disable()
	} else {
		console.log('退出备用缓冲区')
		// 你的业务逻辑
		autoCompleteAddon.enable()
	}
}

/**
 * @description 创建终端视图
 */
const createTerminal = () => {
	terminal = new Terminal({
		cursorBlink: true,
		fontSize: 14,
		fontFamily: "Monaco, Menlo, Consolas, 'Courier New', monospace",
		theme: {
			background: '#000',
			foreground: '#e1e1e1',
		},
	})
	fitAddon = new FitAddon()
	loadTerminal() // 加载终端模块
	openTerminal() // 打开终端
	// 监听备用缓冲区事件(例如:vim,less)
	// terminal.onData(data => {
	// 	if (!autoCompleteAddon) return
	// 	if (data.includes('\x1b[?1049h')) {
	// 		console.log('进入备用缓冲区');
	// 		// 这里可以触发自定义事件或回调
	// 		autoCompleteAddon.disable()
	// 	}
	// 	if (data.includes('\x1b[?1049l')) {
	// 		console.log('退出备用缓冲区');
	// 		// 这里可以触发自定义事件或回调
	// 		autoCompleteAddon.enable()
	// 	}
	// });
	const parser = terminal.parser
	parser.registerCsiHandler({ final: 'h' }, (params, collect) => {
		if (collect === '?' && [1047, 1049].includes(params[0])) {
			onAlternateScreenBufferChange(true)
		}
		return false // 不阻断 xterm 默认行为
	})
	parser.registerCsiHandler({ final: 'l' }, (params, collect) => {
		if (collect === '?' && [1047, 1049].includes(params[0])) {
			onAlternateScreenBufferChange(false)
		}
		return false
	})
	socketSend() // 发送数据
	// 转为异步代替nextTick,修复终端自适应问题
	setTimeout(() => {
		fitTerminal() // 自适应终端
	},0)
}

/**
 * @description 加载终端模块
 */
const loadTerminal = () => {
	if (!socketInfo) return
	if (!socketInfo.socket.ws.value) return

	terminal.loadAddon(fitAddon) // 挂载自适应插件
	terminal.loadAddon(new CanvasAddon()) // canvas
	terminal.loadAddon(new WebLinksAddon()) // 挂载链接插件
	if (props.autoComplete) {
		autoCompleteAddon = new AutoCompleteAddon({
			maxSuggestions: 100,
			caseSensitive: false,
			showDescriptions: true,
		})
		terminal.loadAddon(autoCompleteAddon) // 挂载自动补全插件
	}
	// socketInfo.socket.ws.value.onopen = () => {
	// setTimeout(() => {
	terminal.loadAddon(new AttachAddon(socketInfo?.socket.ws.value)) // 挂载socket插件
	terminal.focus() // 终端获取焦点
	// }, 500)
	// }/
}

let lock = false

const locked = () => {
	lock = true
}
const unLock = () => {
	lock = false
}

// 发送数据
const socketSend = () => {
	let param: AnyObject = {
		id: props.id,
		...props.hostInfo,
	}
	if (props.url === '/pyenv_webssh') param = { ...props.hostInfo } // 解构代码，避免修改原始数据
	// eslint-disable-next-line @typescript-eslint/naming-convention
	if (!props.requestToken) param = { ...param, ...{ 'x-http-token': window.vite_public_request_token } } // 添加token
	socketInfo?.send(param) // 发送ID和主机信息
	terminal.focus() // 终端获取焦点
	terminal.onData(async data => {
		// ctrl+V
		if (data == '\x16') {
			// 从终端复制
			if (copy.value) {
				terminal.write(copy.value)
				copy.value = ''
			} else {
				const clipboardText = await navigator.clipboard.readText()
				if (clipboardText) terminal.write(clipboardText)
			}
		}
		if (data === '\r' && isEnter.value) {
			isEnter.value = false
			terminal.write('\r\n')
			reconnectTerminal()
		}
		if (socketInfo === null && data === '\r' && !lock) {
			isStatus.value = 'danger'
			locked()
			terminal.write('\r\n正在尝试重新连接!\r\n')
			reconnectTerminal() // 断线重连，重新创建socket
		}
	})
	terminal.onSelectionChange(() => {
		if (terminal.hasSelection()) {
			copy.value = terminal.getSelection()
		}
	})
}

/**
 * @description 设置终端手动重新连接
 */
const reconnectTerminal = () => {
	if (!socketInfo) {
		createWebSocket(() => {
			socketSend()
			const ws = socketInfo?.socket.ws.value
			if (ws) terminal.loadAddon(new AttachAddon(ws))
		}) // 创建socket
	}
}

// 打开终端
const openTerminal = () => {
	if (!socketInfo) return
	terminal.open(terminalDom.value)
}

// 自适应终端
const fitTerminal = () => {
	isFitTrigger.value = true
	if (!props.fitColsRows) return
	if (!socketInfo) return
	fitAddon.fit()
	if (!socketInfo.isStatus('CLOSED')) {
		const { cols, rows } = terminal
		console.log(cols, rows)
		socketInfo.send({ cols, rows, resize: 1 }) // 发送行列，通知后端调整输入
		isFitTrigger.value = false
	}
}

/**
 * @description 保存配置
 * @param
 */
const saveConfig = async () => {
	const rdata = await xtermAddHost.value?.onConfirm()
	if (rdata) {
		isLocalVerify.value = false
		terminal.focus()
		terminal.write('\r\n')
		reconnectTerminal()
	}
}

/**
 * @description 销毁终端
 */
const disposeTerminal = () => {
	try {
		socketInfo?.close() // 关闭socket
		socketInfo = null // 清空socket
		terminal.dispose() // 销毁终端
		if (termObserver.value instanceof ResizeObserver) {
			termObserver.value?.disconnect() // 断开监听
		} else {
			console.log('termObserver.value is not a ResizeObserver:', termObserver.value)
		}
	} catch (e) {}
}

const debouncedFn = useDebounceFn((value: any) => {
	if (!first.value && !isFitTrigger.value) {
		if (props.active && !isFitTrigger.value) fitTerminal()
	}
}, 100)

onMounted(() => {
	termObserver.value = useResizeObserver(document.body, debouncedFn)
	nextTick(() => {
		createWebSocket(() => {
			if (linksNumber.value >= 1) reconnectTerminal()
			linksNumber.value += 1
		}) // 创建socket
		createTerminal() // 创建终端
		rowData.value = loacalDefault
	})
})

onBeforeUnmount(() => {
	disposeTerminal()
})

onUnmounted(() => {
	// 找到并移除用于计算字符宽度的元素
	const charMeasureElement = document.querySelector('div[style*="position: absolute; top: -50000px;"]')
	if (charMeasureElement) {
		charMeasureElement.parentNode?.removeChild(charMeasureElement)
	}
})

defineExpose({
	socketInfo: () => socketInfo,
	useTerminal: () => terminal,
	useStatus: () => isStatus,
	fitTerminal,
	disposeTerminal,
})
</script>

<style lang="css">
.terminal-view {
	@apply w-full h-full bg-darkPrimary relative;
}
.terminal-add-host {
	@apply absolute flex-col top-0 w-full h-full flex justify-center items-center z-999 bg-[rgba(var(--el-color-text-primary-rgb), 0.4)];
}

.terminal-add-host .el-form {
	@apply w-[50rem];
}

.drawer {
	@apply hidden;
}

.xterm .xterm-viewport {
	overflow: auto !important;
}

.xterm .xterm-viewport::-webkit-scrollbar {
	@apply w-[8px] h-[6px] rounded-base;
}

.xterm .xterm-viewport::-webkit-scrollbar-thumb {
	@apply bg-darkSecondary rounded-base;
	box-shadow: inset 0 0 5px rgba(48, 49, 51, 0.4);
	transition: all 1s;
}

.xterm .xterm-viewport:hover::-webkit-scrollbar-thumb {
	@apply bg-darkTertiary;
}

.xterm .xterm-viewport::-webkit-scrollbar-track {
	@apply bg-darkPrimary rounded-base;
	box-shadow: inset 0 0 5px rgba(48, 49, 51, 0.4);
	transition: all 1s;
}

.xterm .xterm-viewport:hover::-webkit-scrollbar-track {
	@apply bg-darkPrimary;
}
</style>
