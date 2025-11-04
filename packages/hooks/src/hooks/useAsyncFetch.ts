/**
 * useAsyncFetch - 异步请求 Hook
 *
 * 提供类似原生 fetch 的 API 体验，支持：
 * - Promise 风格调用
 * - 状态管理（loading、error、data）
 * - 取消请求
 * - 手动触发
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
 * useAsyncFetch Hook
 *
 * 提供 Promise 风格的请求 Hook，类似于原生 fetch API
 *
 * @param requestFn 请求函数，接收 RequestConfig 并返回 Promise
 * @param options Hook 选项
 * @returns `{ data, loading, error, execute, cancel }`
 */
export function useAsyncFetch<T = any>(
	requestFn?: (config: RequestConfig) => Promise<any>,
	options: UseAxiosOptions = {},
) {
	const {
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

	// 缓存请求函数
	const requestFnRef = useRef(requestFn)
	if (requestFn) {
		requestFnRef.current = requestFn
	}

	// 执行请求
	const execute = useCallback(
		async (config: RequestConfig): Promise<any> => {
			setState(prev => ({ ...prev, loading: true, error: null }))

			try {
				const axiosInstance = new HttpRequest()
				const result = await axiosInstance.request<T>(config)

				const responseData = (result as ResponseResult<T>).data || result

				setState({
					data: responseData,
					loading: false,
					error: null,
				})

				if (onSuccess) {
					onSuccess(responseData)
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
		[onSuccess, onError],
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

	return {
		// 状态
		...state,

		// 方法
		execute,
		cancel,
		reset,
	}
}

/**
 * useAsyncFetch 变体：POST 请求
 */
export function useAsyncPost<T = any>(options: UseAxiosOptions = {}) {
	const { onSuccess, onError, initialData } = options
	const [state, setState] = useState<AxiosHookState<T>>({
		data: initialData || null,
		loading: false,
		error: null,
	})

	const execute = useCallback(
		async (
			url: string,
			data?: AnyObject,
			config?: Partial<RequestConfig>,
		): Promise<any> => {
			setState(prev => ({ ...prev, loading: true, error: null }))

			try {
				const axiosInstance = new HttpRequest()
				const result = await axiosInstance.request<T>({
					url,
					method: 'POST',
					data,
					...config,
				})

				const responseData = result.data || result

				setState({
					data: responseData,
					loading: false,
					error: null,
				})

				if (onSuccess) {
					onSuccess(responseData)
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
		[onSuccess, onError],
	)

	const cancel = useCallback(() => {
		axiosCanceler.removeAllPending()
		setState(prev => ({ ...prev, loading: false }))
	}, [])

	const reset = useCallback(() => {
		setState({
			data: initialData || null,
			loading: false,
			error: null,
		})
	}, [initialData])

	return {
		...state,
		execute,
		cancel,
		reset,
	}
}

/**
 * useAsyncFetch 变体：GET 请求
 */
export function useAsyncGet<T = any>(options: UseAxiosOptions = {}) {
	const { onSuccess, onError, initialData } = options
	const [state, setState] = useState<AxiosHookState<T>>({
		data: initialData || null,
		loading: false,
		error: null,
	})

	const execute = useCallback(
		async (
			url: string,
			config?: Partial<RequestConfig>,
		): Promise<any> => {
			setState(prev => ({ ...prev, loading: true, error: null }))

			try {
				const axiosInstance = new HttpRequest()
				const result = await axiosInstance.request<T>({
					url,
					method: 'GET',
					...config,
				})

				const responseData = result.data || result

				setState({
					data: responseData,
					loading: false,
					error: null,
				})

				if (onSuccess) {
					onSuccess(responseData)
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
		[onSuccess, onError],
	)

	const cancel = useCallback(() => {
		axiosCanceler.removeAllPending()
		setState(prev => ({ ...prev, loading: false }))
	}, [])

	const reset = useCallback(() => {
		setState({
			data: initialData || null,
			loading: false,
			error: null,
		})
	}, [initialData])

	return {
		...state,
		execute,
		cancel,
		reset,
	}
}
