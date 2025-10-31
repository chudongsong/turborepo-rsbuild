import { defineStore, storeToRefs } from 'pinia'
import { useConfirm } from '@/hooks/tools'
import FILES_STORE from '@files/store'

const FILES_TERMINAL_STORE = defineStore('FILES-TERMINAL-STORE', () => {
	const { fileTabActiveData } = storeToRefs(FILES_STORE())

	const instance = ref<any>() // 终端实例

	const filesTerminalRef = ref<any>() // 终端实例

	/**
	 * @description 项目初始化
	 */
	const init = () => {
		nextTick(() => {
			const activeTerm = getRefTerminal()
			const socket = activeTerm?.socketInfo()
			const terminal = activeTerm?.terminal
			socket.send(`\r\nclear\r`)
			socket.send(`cd ${fileTabActiveData.value.param.path}\r`)
			terminal?.focus()
		})
	}

	/**
	 * @description 获取终端实例
	 * @param {number} index 终端id 默认当前激活的终端id
	 * @returns {AnyObject} 终端实例
	 */
	const getRefTerminal = (): AnyObject => {
		return filesTerminalRef.value
	}

	/**
	 * @description 组件卸载
	 */
	const onCancel = () => {
		// 退出警告
		onBeforeClose()
		// 阻止默认关闭
		return false
	}

	/**
	 * @description 退出警告
	 */
	const onBeforeClose = async () => {
		const activeTerm = getRefTerminal()
		const socket = activeTerm?.socketInfo()
		try {
			await useConfirm({
				title: `确定要关闭SSH会话吗？`,
				content: `关闭SSH会话后，当前命令行会话正在执行的命令可能被中止，确定关闭吗？`,
			})
			// 退出弹窗
			close()
			socket.close()
		} catch (error) {}
	}

	const close = async () => {
		const popup = await instance.value
		popup?.unmount()
	}

	return {
		instance,
		filesTerminalRef,
		init,
		onCancel,
	}
})

export default FILES_TERMINAL_STORE
