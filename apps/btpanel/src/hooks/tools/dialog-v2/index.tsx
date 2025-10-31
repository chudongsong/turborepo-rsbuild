/* eslint-disable no-undef */
import type { App } from 'vue'
import { isArray, isNumber, isPromise, isString } from '@/utils'
import { mountDirective } from '@/directive'
import { ElLoading } from 'element-plus'
import DialogApp from '@/components/extension/bt-dialog-v2/index.vue' // 弹窗组件

import type { DialogArea, DialogButton, DialogOptions } from './types'
import { mountErrorHandler } from '../axios/model/error'

/**
 * @description 处理弹窗宽度
 * @param {DialogArea} 弹窗大小
 */
const handleDialogWidth = (area: DialogArea): string[] => {
	if (isArray(area)) {
		return (area as string[] | number[]).map(item => {
			if (isNumber(item)) item = `${item}rem`
			if (isString(item) && item.match(/[A-z\%]+/)) return item
			return `${item}rem`
		})
	}
	if (isNumber(area)) return [`${area}rem`]
	if (isString(area) && (area.includes('rem') || area.includes('px') || area.includes('vw'))) return [area]
	return [`${area}rem`]
}

/**
 * @description 处理按钮类型
 * @param {DialogOptions} options 弹窗配置
 */
const handleButtonText = (options: DialogOptions<AnyObject>): DialogButton => {
	let { confirmText, cancelText } = options
	if (options?.footer || options?.confirm) {
		confirmText = (confirmText || '确认') as string
		cancelText = (cancelText || '取消') as string
	}
	return { footer: options?.footer || false, confirmText, cancelText }
}

/**
 * @description 处理视图关闭
 * @param {App} instance vue实例
 * @param {HTMLDivElement} mountNode 挂载节点
 */
const handleClose = (instance: App, mountNode: HTMLDivElement): void => {
	instance.unmount() // 卸载实例
	if (mountNode) document.body.removeChild(mountNode) // 移除节点
}

/**
 * @description 处理视图挂载
 * @param {App} instance vue实例
 * @param {HTMLDivElement} mountNode 挂载节点
 */
const handleMount = (instance: App, mountNode: HTMLDivElement): void => {
	mountDirective(instance) // 挂载指令
	mountErrorHandler(instance) // 挂载错误处理
	document.body.appendChild(mountNode) // 挂载节点
	instance.mount(mountNode) // 挂载实例
	instance.directive('loading', ElLoading.directive) // 挂载loading指令
}

/**
 * @description 渲染遮罩层
 * @param {DialogOptions} options 弹窗配置
 */
export const useMask = (options: DialogOptions<AnyObject>): void => {
	const { modal } = options
	if (modal) {
		const mask = document.createElement('div')
		mask.classList.add('dialog-mask')
		mask.style.zIndex = '999'
		document.body.appendChild(mask)
	}
}

/**
 * @description 弹窗实例
 * @param {DialogInstance} options 弹窗配置
 * @returns {App} vue实例
 */
export const useDialog = async (options: DialogOptions<AnyObject>): Promise<App> => {
	// 创建视图挂载节点
	const mountNode = document.createElement('div')
	// 获取当前的大小
	const area = handleDialogWidth(options.area)
	// 获取按钮信息
	const { footer, cancelText, confirmText } = handleButtonText(options)
	// 获取组件信息
	if (typeof options.component === 'function') {
		const component = options?.component()
		if (isPromise(component)) {
			options.component = (await options.component()).default // 异步组件
		} else if (component.default) {
			options.component = component.default
		} else {
			options.component = component
		}
	}

	// 创建实例
	const instance = createApp(DialogApp, {
		...options,
		area,
		footer,
		cancelText,
		confirmText,
		modelValue: true, // 直接显示
		onConfirm: async (): Promise<boolean | void> => {
			if (options?.onConfirm) {
				const status = (await options?.onConfirm(instance)) as boolean // 确认事件, 返回值为true时关闭弹窗
				if (status) handleClose(instance, mountNode)
				return status
			}
			handleClose(instance, mountNode)
			return true
		},
		onCancel: () => {
			if (options.onCancel) options.onCancel(instance)
			if (options.onClose) options.onClose(instance)
			if (!options.onCancel && !options.onClose) handleClose(instance, mountNode)
		},
		onClose: () => {
			if (options.onCancel) options.onCancel(instance)
			if (options.onClose) options.onClose(instance)
			if (!options.onCancel && !options.onClose) handleClose(instance, mountNode)
		},
	})

	useMask(options) // 设置遮罩
	handleMount(instance, mountNode) // 挂载节点
	return instance
}
