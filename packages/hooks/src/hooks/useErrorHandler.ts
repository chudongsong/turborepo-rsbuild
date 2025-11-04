/**
 * useErrorHandler - 全局错误处理 Hook
 *
 * 提供统一的错误处理机制，支持：
 * - 错误捕获
 * - 错误上报
 * - 错误恢复
 * - 错误重试
 */

import { useState, useCallback } from 'react'
import type { AxiosError } from 'axios'
import type { ErrorHandlerOptions } from '../types/axios'

/**
 * 错误信息类型
 */
export interface ErrorInfo {
	id: string
	timestamp: number
	message: string
	stack?: string
	url?: string
	lineNumber?: number
	columnNumber?: number
	severity: 'low' | 'medium' | 'high' | 'critical'
	retryable: boolean
}

/**
 * useErrorHandler Hook
 *
 * 提供错误处理和上报功能
 */
export function useErrorHandler(options: ErrorHandlerOptions = {}) {
	const {
		showError = true,
		redirectOn401 = true,
		redirectOn500 = false,
	} = options

	const [errors, setErrors] = useState<ErrorInfo[]>([])

	/**
	 * 创建错误信息
	 */
	const createErrorInfo = useCallback(
		(
			error: Error | string,
			severity: ErrorInfo['severity'] = 'medium',
			retryable: boolean = false,
		): ErrorInfo => {
			const err = typeof error === 'string' ? new Error(error) : error

			return {
				id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				timestamp: Date.now(),
				message: err.message || String(error),
				stack: err.stack,
				severity,
				retryable,
			}
		},
		[],
	)

	/**
	 * 处理错误
	 */
	const handleError = useCallback(
		(error: Error | AxiosError | string, context?: string) => {
			const errorInfo = createErrorInfo(error as any)

			// 显示错误（生产环境中可能使用 toast、notification 等）
			if (showError) {
				if (typeof window !== 'undefined' && window.console) {
					console.error('[Error Handler]', errorInfo.message, context || '')
				}
			}

			// HTTP 状态码特殊处理
			if (typeof error === 'object' && error !== null && 'response' in error) {
				const axiosError = error as AxiosError
				const status = axiosError.response?.status

				switch (status) {
					case 401:
						if (redirectOn401 && typeof window !== 'undefined') {
							// window.location.href = '/login'
						}
						break
					case 500:
						if (redirectOn500 && typeof window !== 'undefined') {
							// window.location.href = '/error'
						}
						break
					case 404:
						// 处理 404 错误
						break
					default:
						break
				}
			}

			// 记录错误到状态
			setErrors(prev => [...prev, errorInfo])

			return errorInfo
		},
		[showError, redirectOn401, redirectOn500, createErrorInfo],
	)

	/**
	 * 清理错误
	 */
	const clearErrors = useCallback(() => {
		setErrors([])
	}, [])

	/**
	 * 移除特定错误
	 */
	const removeError = useCallback((id: string) => {
		setErrors(prev => prev.filter(err => err.id !== id))
	}, [])

	/**
	 * 重试错误
	 */
	const retryError = useCallback(
		async (
			errorId: string,
			retryFn: () => Promise<any>,
		): Promise<any> => {
			const errorInfo = errors.find(err => err.id === errorId)

			if (!errorInfo) {
				throw new Error('Error not found')
			}

			if (!errorInfo.retryable) {
				throw new Error('This error is not retryable')
			}

			// 移除错误
			removeError(errorId)

			// 执行重试逻辑
			try {
				return await retryFn()
			} catch (err) {
				// 重新记录错误
				return handleError(err, 'Retry failed')
			}
		},
		[errors, removeError, handleError],
	)

	/**
	 * 错误上报（可扩展到错误监控系统）
	 */
	const reportError = useCallback(
		async (errorInfo: ErrorInfo): Promise<void> => {
			// TODO: 集成到 Sentry、LogRocket 或其他错误监控系统
			if (typeof window !== 'undefined') {
				// 示例：发送到错误监控服务
				// await fetch('/api/error-report', {
				// 	method: 'POST',
				// 	headers: { 'Content-Type': 'application/json' },
				// 	body: JSON.stringify(errorInfo),
				// })
			}
		},
		[],
	)

	/**
	 * 批量上报错误
	 */
	const reportAllErrors = useCallback(async () => {
		for (const errorInfo of errors) {
			await reportError(errorInfo)
		}
	}, [errors, reportError])

	return {
		// 状态
		errors,

		// 方法
		handleError,
		clearErrors,
		removeError,
		retryError,
		reportError,
		reportAllErrors,
	}
}

/**
 * useAsyncErrorHandler - 异步错误处理 Hook
 *
 * 提供 Promise 风格的错误处理
 */
export function useAsyncErrorHandler(options: ErrorHandlerOptions = {}) {
	const errorHandler = useErrorHandler(options)

	const wrapAsync = useCallback(
		<T,>(
			asyncFn: (...args: any[]) => Promise<T>,
		) =>
		async (...args: any[]): Promise<T | undefined> => {
			try {
				return await asyncFn(...args)
			} catch (error) {
				errorHandler.handleError(error)
				return undefined
			}
		},
		[errorHandler],
	)

	return {
		...errorHandler,
		wrapAsync,
	}
}

/**
 * useErrorBoundary - 错误边界 Hook
 *
 * 提供错误边界功能，捕获组件树中的错误
 */
export function useErrorBoundary(
	errorCallback?: (error: Error, errorInfo: any) => void,
) {
	const [hasError, setHasError] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const reset = useCallback(() => {
		setHasError(false)
		setError(null)
	}, [])

	const captureError = useCallback(
		(error: Error, errorInfo?: any) => {
			setHasError(true)
			setError(error)

			if (errorCallback) {
				errorCallback(error, errorInfo)
			}

			// 记录到控制台
			console.error('[Error Boundary] Caught an error:', error, errorInfo)
		},
		[errorCallback],
	)

	return {
		hasError,
		error,
		reset,
		captureError,
	}
}
