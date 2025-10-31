import type { MessageHandler, MessageOptions } from 'element-plus'

import { ElMessage, ElLoading } from 'element-plus'
import { isString, isVNode, isUndefined } from '@/utils'
import type { RequestProps, LoadingOptionsProps } from './types'

const messageList: MessageHandler[] = []

/**
 * @description 构建消息中间件，解决消息重复弹窗的问题
 * @param {MessageOptions} options - 消息提示的配置项
 * @returns {string} 消息提示的id
 */
const BtMessage = (options: MessageOptions) => {
	const id = ElMessage({
		duration: 2000,
		...options,
	})
	messageList.forEach(item => {
		item.close()
	})
	messageList.length = 0
	messageList.push(id)
	return id
}

export class Message {
	// 获取消息提示的配置项
	static getOptions(options: AnyObject = {}) {
		if (isString(options) || isVNode(options)) {
			options = {
				message: options,
			}
		}
		if (!isUndefined(options.msg)) {
			options.message = options.msg
			delete options.msg
		}
		if (!isUndefined(options.time)) {
			options.duration = options.time
			delete options.time
		}
		return { ...options, customClass: 'bt-message-html', showClose: true } as MessageOptions
	}

	// 消息提示
	static msg(options: MessageOptions) {
		return BtMessage({ ...options })
	}

	// 成功类型的消息提示
	static success(options: MessageOptions | RequestProps | string) {
		const newOptions = Message.getOptions(options)
		return BtMessage({
			type: 'success',
			...newOptions,
		})
	}

	// 普通类型的消息提示
	static warn(options: MessageOptions | RequestProps | string) {
		const newOptions = Message.getOptions(options)
		return BtMessage({
			type: 'warning',
			...newOptions,
		})
	}

	// 错误类型的消息提示
	static error(options: MessageOptions | RequestProps | string) {
		const newOptions = Message.getOptions(options)
		return BtMessage({
			type: 'error',
			dangerouslyUseHTMLString: true,
			customClass: 'bt-message-error-html', // 请求类型的消息提示，包含html格式
			...newOptions,
		})
	}

	// 请求类型的消息提示，包含html格式
	static request(data: any, options?: MessageOptions) {
		console.log(data)
		return BtMessage({
			customClass: 'bt-message-error-html', // 请求类型的消息提示，包含html格式
			type: data.status ? 'success' : 'error',
			dangerouslyUseHTMLString: true,
			message: data.msg,
			...(options || {}),
		})
	}

	// 加载类型的消息提示
	static load(options: LoadingOptionsProps | string) {
		if (isString(options) || isVNode(options)) {
			options = {
				msg: options as string,
				customClass: '',
				background: 'rgba(0,0,0, 0.3)',
			}
		}
		const { msg, background, customClass } = options
		const load = ElLoading.service({
			text: (msg as string) || '加载中...',
			spinner: '',
			customClass: `bt-loading ${customClass || ''}`, // 自定义类名
			background: background || 'rgba(0,0,0, 0.3)',
		})
		nextTick(() => {
			const circular = load.$el.querySelector('.circular') as HTMLElement
			// const newCircular = document.createElement('i')
			// circular.parentNode?.insertBefore(newCircular, circular)
			// circular.parentNode?.removeChild(circular)
			// newCircular.className = 'circular'
			if (circular) {
				const newCircular = document.createElement('div')
				newCircular.className = 'custom-loading__icon'
				newCircular.innerHTML = `
					<svg aria-hidden="true"><use href="#icon-tools-logo"></use></svg>
				`
				circular.parentNode?.insertBefore(newCircular, circular)
				circular.parentNode?.removeChild(circular)
			}
		})
		return load
	}
}

/**
 * @description message方法，包含成功、普通、错误、请求、加载类型
 * @returns {MessageTypeProps} message方法
 * @example useMessage().success('成功提示')
 */
const useMessage = () => Message

/**
 * @description 过度加载
 * @param {LoadingOptionsProps | string} options - 加载提示
 * @returns {AnyObject} 加载提示
 */
const useLoading = (options: LoadingOptionsProps | string) => Message.load(options)

export { useMessage, useLoading }
