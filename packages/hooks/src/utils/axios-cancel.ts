/**
 * Axios 请求取消管理工具
 */

import axios, { type AxiosRequestConfig, type Canceler } from 'axios'
import { isFunction } from './helpers'

// 声明一个 Map 用于存储每个请求的标识和取消函数
let pendingMap = new Map<string, Canceler>()

const getPendingUrl = (config: AxiosRequestConfig) =>
	[config.method, config.url].join('&')

// // * 序列化参数
// export const getPendingUrl = (config: AxiosRequestConfig) =>
// 	[config.method, config.url, qs.stringify(config.data), qs.stringify(config.params)].join('&')

export class AxiosCanceler {
	/**
	 * @description: 添加请求
	 * @param {Object} config
	 * @return void
	 */
	addPending(config: AxiosRequestConfig) {
		// 在请求开始前，对之前的请求做检查取消操作
		// this.removePending(config)
		const url = getPendingUrl(config)
		config.cancelToken =
			config.cancelToken ||
			new axios.CancelToken(cancel => {
				if (!pendingMap.has(url)) {
					// 如果 pending 中不存在当前请求，则添加进去
					pendingMap.set(url, cancel)
				}
			})
	}

	/**
	 * @description: 移除请求
	 * @param {Object} config
	 */
	removePending(config: AxiosRequestConfig) {
		const url = getPendingUrl(config)
		if (pendingMap.has(url)) {
			// 如果在 pending 中存在当前请求标识，需要取消当前请求，并且移除
			const cancel = pendingMap.get(url)
			// eslint-disable-next-line no-unused-expressions
			isFunction(cancel) && cancel()
			pendingMap.delete(url)
		}
	}

	/**
	 * @description: 清空所有pending
	 */
	removeAllPending() {
		pendingMap.forEach(cancel => {
			// eslint-disable-next-line no-unused-expressions
			isFunction(cancel) && cancel()
		})
		pendingMap.clear()
	}

	/**
	 * @description: 重置
	 */
	reset(): void {
		pendingMap = new Map<string, Canceler>()
	}
}

/**
 * @description: 取消请求hook
 * @param {AxiosRequestConfig[]} cancelRequestArr 需要取消的请求列表
 */
export const useRequestCanceler = (cancelRequestArr: (AxiosRequestConfig | string)[]) => {
	const { removePending } = new AxiosCanceler()
	cancelRequestArr.forEach((request: AxiosRequestConfig | string) => {
		let config: AxiosRequestConfig

		if (typeof request === 'string') {
			// 如果是字符串，转换为 AxiosRequestConfig 对象，method 默认为 'post'
			config = {
				url: request,
				method: 'post',
			}
		} else {
			// 如果是 AxiosRequestConfig 对象，直接使用
			config = request
		}
		removePending(config)
	})
}

// 创建单例实例
export const axiosCanceler = new AxiosCanceler()
