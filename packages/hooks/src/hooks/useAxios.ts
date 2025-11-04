/**
 * useAxios - 基础 axios Hook
 *
 * 提供一个封装好的 axios 实例，支持：
 * - GET/POST 请求
 * - 请求拦截和响应拦截
 * - 请求取消管理
 * - 错误处理
 */

import { useMemo } from 'react'
import { HttpRequest } from '../utils/axios-instance'

// 创建全局 axios 实例
const httpRequest = new HttpRequest()

export const useAxios = () => {
	const axiosInstance = useMemo(() => httpRequest, [])

	return {
		/**
		 * 发起 GET 请求
		 */
		get: async (
			url: string,
			config?: string | AnyFunction | Partial<import('../types/axios').RequestConfig>,
		) => {
			return axiosInstance.get(url, config as any)
		},

		/**
		 * 发起 POST 请求
		 */
		post: async (
			url: string,
			config?: string | AnyFunction | Partial<import('../types/axios').RequestConfig>,
		) => {
			return axiosInstance.post(url, config as any)
		},

		/**
		 * 直接调用 request 方法
		 */
		request: async (config: import('../types/axios').RequestConfig) => {
			return axiosInstance.request(config)
		},
	}
}

// 导出默认实例
export default useAxios
