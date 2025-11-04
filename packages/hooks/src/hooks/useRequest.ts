/**
 * useRequest - 高级请求 Hook
 *
 * 提供完整的请求状态管理，包括：
 * - loading 状态
 * - 错误处理
 * - 数据缓存
 * - 手动/自动执行控制
 */

import { useState, useCallback, useRef } from 'react'
import { HttpRequest } from '../utils/axios-instance'
import { axiosCanceler } from '../utils/axios-cancel'
import type {
	RequestConfig,
	ResponseResult,
	AxiosHookState,
	UseAxiosOptions,
} from '../types/axios'

/**
 * useRequest Hook
 *
 * @param config 请求配置，可以是 RequestConfig 或返回 RequestConfig 的函数
 * @param options Hook 选项
 * @returns 请求状态和方法
 */
export function useRequest<T = any>(
	config: RequestConfig | ((...args: any[]) => RequestConfig),
	options: UseAxiosOptions = {},
) {
	const {
		immediate = false,
		manual = false,
		onSuccess,
		onError,
		initialData,
	} = options

	// 状态管理
	const [state, setState] = useState<AxiosHookState<T>>({
		data: initialData || null,
		loading: false,
		error: null,
	})

	// 缓存最新的请求配置
	const requestConfigRef = useRef(config)
	requestConfigRef.current = config

	// 获取实际配置
	const getConfig = useCallback(
		(...args: any[]) => {
			const cfg =
				typeof requestConfigRef.current === 'function'
					? (requestConfigRef.current as Function)(...args)
					: requestConfigRef.current
			return cfg
		},
		[requestConfigRef],
	)

	// 执行请求
	const execute = useCallback(
		async (...args: any[]) => {
			const cfg = getConfig(...args)

			setState(prev => ({ ...prev, loading: true, error: null }))

			try {
				const axiosInstance = new HttpRequest()
				const result = await axiosInstance.request<T>(cfg)

				setState({
					data: (result as ResponseResult<T>).data || result,
					loading: false,
					error: null,
				})

				if (onSuccess) {
					onSuccess((result as ResponseResult<T>).data || result)
				}

				return result
			} catch (error: any) {
				const err = error instanceof Error ? error : new Error(String(error))

				setState(prev => ({
					...prev,
					loading: false,
					error: err,
				}))

				if (onError) {
					onError(err)
				}

				throw err
			}
		},
		[getConfig, onSuccess, onError],
	)

	// 取消请求
	const cancel = useCallback(() => {
		axiosCanceler.removeAllPending()
		setState(prev => ({ ...prev, loading: false }))
	}, [])

	// 重置状态
	const reset = useCallback(() => {
		setState({
			data: initialData || null,
			loading: false,
			error: null,
		})
	}, [initialData])

	// 立即执行（如果未设置 manual）
	if (!manual && immediate) {
		execute()
	}

	return {
		// 状态
		...state,

		// 方法
		execute,
		cancel,
		reset,

		// 便捷方法
		run: execute, // 别名
		refresh: execute, // 别名
	}
}

/**
 * useRequest 变体：POST 请求专用
 */
export function usePost<T = any>(
	url: string,
	options: UseAxiosOptions & { data?: AnyObject } = {},
) {
	const { data, ...restOptions } = options

	return useRequest<T>(
		{
			url,
			method: 'POST',
			data,
		},
		restOptions,
	)
}

/**
 * useRequest 变体：GET 请求专用
 */
export function useGet<T = any>(
	url: string,
	options: UseAxiosOptions = {},
) {
	return useRequest<T>(
		{
			url,
			method: 'GET',
		},
		options,
	)
}

/**
 * 手动控制请求的 Hook
 */
export function useLazyRequest<T = any>(
	config: RequestConfig | ((...args: any[]) => RequestConfig),
	options: UseAxiosOptions = {},
) {
	return useRequest(config, {
		...options,
		manual: true,
		immediate: false,
	})
}

/**
 * useLazyRequest 变体：POST 请求专用
 */
export function useLazyPost<T = any>(
	url: string,
	options: UseAxiosOptions & { data?: AnyObject } = {},
) {
	const { data, ...restOptions } = options

	return useLazyRequest<T>(
		{
			url,
			method: 'POST',
			data,
		},
		restOptions,
	)
}

/**
 * useLazyRequest 变体：GET 请求专用
 */
export function useLazyGet<T = any>(
	url: string,
	options: UseAxiosOptions = {},
) {
	return useLazyRequest<T>(
		{
			url,
			method: 'GET',
		},
		options,
	)
}
