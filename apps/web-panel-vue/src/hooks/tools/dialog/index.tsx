import type { DialogInstance } from '@dialog/types'
import { type App } from 'vue'

import { mountDirective } from '@/directive' // 指令
import { isArray, isBoolean, isFunction, isPromise, isString, isUndefined } from '@/utils' // 工具函数
import { mountErrorHandler } from '@axios/model/error' // 错误处理
import { forEachObjIndexed, is } from 'ramda'

import dialogApp from '@/components/extension/bt-dialog/index.vue' // 弹窗组件
import { ElLoading } from 'element-plus'

// 弹窗实例列表
const dialogInstanceList: Record<string, App> = {}

/**
 * @description 弹窗实例
 * @param {DialogInstance} options 弹窗配置
 * @returns {App} vue实例
 */
export const useDialog = async (options: DialogInstance): Promise<App> => {
	const mountNode = document.createElement('div')
	// const { router } = await import('@/router'); // 异步组件

	if (isFunction(options.component)) {
		const component = options.component()
		if (isPromise(component)) {
			options.component = (await options.component()).default // 异步组件
		} else if (component.default) {
			options.component = component.default
		} else {
			options.component = component
		}
	}
	const isBtnType = Object.prototype.toString.call(options.btn).slice(8, -1).toLowerCase()
	if (!isUndefined(isBtnType) && isBtnType !== 'undefined') {
		let confirmText = '确认'
		let cancelText = '取消'
		if (isString(isBtnType) && !isBoolean(options.btn)) confirmText = options.btn as string
		if (isArray(options.btn)) {
			const { 0: btn1, 1: btn2 } = options.btn as string[]
			confirmText = btn1 as string
			cancelText = btn2 as string
		}
		options.showFooter = options.showFooter ?? true
		options.confirmText = confirmText as string
		options.cancelText = cancelText as string
		delete options.btn // 删除btn
	}
	// 创建实例
	const instance = createApp(dialogApp, {
		...options,
		modelValue: true,
		// 关闭事件
		onCancel: () => {
			if (options.onCancel) options.onCancel(instance)
			if (options.close) options.close()
			instance.unmount()
			document.body.removeChild(mountNode)
		},
		// 确认事件
		// eslint-disable-next-line consistent-return
		onConfirm: async (): Promise<boolean | void> => {
			// // 检查传入的组件内容是否存在 onConfirm 方法
			// console.log(instance, '+++')
			// if (options.component && options.component.onConfirm) {
			// 	const rdata = (await options.component.onConfirm(instance)) as boolean // 确认事件, 返回值为true时关闭弹窗
			// 	if (rdata) {
			// 		instance.unmount()
			// 		document.body.removeChild(mountNode)
			// 	}
			// 	return rdata
			// }

			if (options.onConfirm) {
				const rdata = (await options.onConfirm(instance)) as boolean // 确认事件, 返回值为true时关闭弹窗
				if (rdata) {
					instance.unmount()
					if (mountNode) document.body.removeChild(mountNode)
				}
				return rdata
			}
		},
	})
	// 是否自动关闭
	if (options.autoClose === false) {
		instance.config.globalProperties.autoClose = false
	}
	// 绑定事件 - 关闭
	instance.config.globalProperties.close = () => {
		if (options.onCancel) options.onCancel(instance)
		if (options.close) options.close()
		instance.unmount()
		// console.log(document.body, mountNode)
		// if (mountNode) document.body.removeChild(mountNode)
	}

	// instance.use(router); // 挂载路由
	mountDirective(instance) // 挂载指令
	mountErrorHandler(instance) // 挂载错误处理
	instance.directive('loading', ElLoading.directive) // 挂载loading指令
	document.body.appendChild(mountNode) // 挂载节到节点
	instance.mount(mountNode) // 挂载实例
	if (options.onOpen) options.onOpen(instance) // 打开事件，挂载后执行
	const generateUniqueId = () => `dialog_${Math.random().toString(36).substr(2, 9)}` // 创建唯一标识符
	dialogInstanceList[generateUniqueId()] = instance // 添加实例
	return instance
}

/**
 * @description 关闭所有弹窗
 */
export const closeAllDialog = () => {
	forEachObjIndexed((dialogInstance: AnyObject) => {
		// autoClose不为false时关闭弹窗(当前特指编辑器弹窗)
		if (is(Function, dialogInstance?.config.globalProperties.close) && dialogInstance?.config.globalProperties.autoClose !== false) {
			dialogInstance?.config.globalProperties.close()
		}
	}, dialogInstanceList)
}
