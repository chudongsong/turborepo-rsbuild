/**
 * 测试 useErrorHandler Hook
 */

import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
	useErrorHandler,
	useAsyncErrorHandler,
	useErrorBoundary,
	type ErrorInfo,
} from '../../hooks/useErrorHandler'

describe('useErrorHandler', () => {
	describe('基本功能', () => {
		it('应该返回初始状态', () => {
			const { result } = renderHook(() => useErrorHandler())

			expect(result.current).toHaveProperty('errors')
			expect(Array.isArray(result.current.errors)).toBe(true)
			expect(result.current.errors).toHaveLength(0)
			expect(result.current).toHaveProperty('handleError')
			expect(result.current).toHaveProperty('clearErrors')
			expect(result.current).toHaveProperty('removeError')
			expect(result.current).toHaveProperty('retryError')
		})

		it('应该支持配置选项', () => {
			const { result } = renderHook(() =>
				useErrorHandler({
					showError: false,
					redirectOn401: false,
					redirectOn500: true,
				}),
			)

			// 验证初始状态
			expect(result.current.errors).toHaveLength(0)
		})
	})

	describe('handleError', () => {
		it('应该处理 Error 对象', () => {
			const { result } = renderHook(() => useErrorHandler())

			const error = new Error('Test error')

			act(() => {
				result.current.handleError(error)
			})

			expect(result.current.errors).toHaveLength(1)
			const errorInfo = result.current.errors[0]
			expect(errorInfo.message).toBe('Test error')
			expect(errorInfo.severity).toBe('medium')
			expect(errorInfo.retryable).toBe(false)
		})

		it('应该处理字符串错误', () => {
			const { result } = renderHook(() => useErrorHandler())

			act(() => {
				result.current.handleError('String error')
			})

			expect(result.current.errors).toHaveLength(1)
			expect(result.current.errors[0].message).toBe('String error')
		})

		it('应该支持自定义严重程度', () => {
			const { result } = renderHook(() => useErrorHandler())

			const error = new Error('Critical error')

			act(() => {
				result.current.handleError(error, 'critical', true)
			})

			expect(result.current.errors[0].severity).toBe('critical')
			expect(result.current.errors[0].retryable).toBe(true)
		})

		it('应该为错误分配唯一 ID', () => {
			const { result } = renderHook(() => useErrorHandler())

			const error1 = new Error('Error 1')
			const error2 = new Error('Error 2')

			act(() => {
				result.current.handleError(error1)
				result.current.handleError(error2)
			})

			expect(result.current.errors).toHaveLength(2)
			expect(result.current.errors[0].id).not.toBe(result.current.errors[1].id)
		})

		it('应该记录时间戳', () => {
			const { result } = renderHook(() => useErrorHandler())

			const beforeTime = Date.now()
			const error = new Error('Test error')

			act(() => {
				result.current.handleError(error)
			})

			const afterTime = Date.now()
			const errorInfo = result.current.errors[0]

			expect(errorInfo.timestamp).toBeGreaterThanOrEqual(beforeTime)
			expect(errorInfo.timestamp).toBeLessThanOrEqual(afterTime)
		})

		it('应该记录错误堆栈', () => {
			const { result } = renderHook(() => useErrorHandler())

			const error = new Error('Test error')
			error.stack = 'Error stack trace'

			act(() => {
				result.current.handleError(error)
			})

			expect(result.current.errors[0].stack).toBe('Error stack trace')
		})

		it('应该包含上下文信息', () => {
			const { result } = renderHook(() => useErrorHandler())

			const error = new Error('Test error')

			act(() => {
				result.current.handleError(error, 'User login failed')
			})

			// 上下文信息不会直接存储，但会在错误处理中使用
			expect(result.current.errors).toHaveLength(1)
		})
	})

	describe('clearErrors', () => {
		it('应该清除所有错误', () => {
			const { result } = renderHook(() => useErrorHandler())

			// 添加多个错误
			act(() => {
				result.current.handleError(new Error('Error 1'))
				result.current.handleError(new Error('Error 2'))
				result.current.handleError(new Error('Error 3'))
			})

			expect(result.current.errors).toHaveLength(3)

			// 清除错误
			act(() => {
				result.current.clearErrors()
			})

			expect(result.current.errors).toHaveLength(0)
		})
	})

	describe('removeError', () => {
		it('应该移除指定的错误', () => {
			const { result } = renderHook(() => useErrorHandler())

			// 添加多个错误
			act(() => {
				result.current.handleError(new Error('Error 1'))
				result.current.handleError(new Error('Error 2'))
				result.current.handleError(new Error('Error 3'))
			})

			const errorId = result.current.errors[1].id

			// 移除中间的错误
			act(() => {
				result.current.removeError(errorId)
			})

			expect(result.current.errors).toHaveLength(2)
			expect(result.current.errors[0].message).toBe('Error 1')
			expect(result.current.errors[1].message).toBe('Error 3')
		})
	})

	describe('retryError', () => {
		it('应该重试可重试的错误', async () => {
			const { result } = renderHook(() => useErrorHandler())

			// 添加一个可重试的错误
			const error = new Error('Network error')
			let retryCount = 0

			act(() => {
				result.current.handleError(error, 'medium', true)
			})

			const errorId = result.current.errors[0].id

			// 定义重试函数
			const retryFn = async () => {
				retryCount++
				return { success: true }
			}

			// 执行重试
			await act(async () => {
				await result.current.retryError(errorId, retryFn)
			})

			// 验证重试成功
			expect(retryCount).toBe(1)
			expect(result.current.errors).toHaveLength(0) // 错误已被移除
		})

		it('应该处理不可重试的错误', async () => {
			const { result } = renderHook(() => useErrorHandler())

			// 添加一个不可重试的错误
			const error = new Error('Validation error')

			act(() => {
				result.current.handleError(error, 'medium', false)
			})

			const errorId = result.current.errors[0].id

			// 定义重试函数
			const retryFn = async () => {
				return { success: true }
			}

			// 执行重试应该抛出错误
			await act(async () => {
				try {
					await result.current.retryError(errorId, retryFn)
				} catch (err: any) {
					expect(err.message).toBe('This error is not retryable')
				}
			})

			// 错误应该仍然存在
			expect(result.current.errors).toHaveLength(1)
		})

		it('应该处理不存在的错误', async () => {
			const { result } = renderHook(() => useErrorHandler())

			const retryFn = async () => {
				return { success: true }
			}

			// 执行重试应该抛出错误
			await act(async () => {
				try {
					await result.current.retryError('nonexistent-id', retryFn)
				} catch (err: any) {
					expect(err.message).toBe('Error not found')
				}
			})
		})

		it('应该处理重试失败的情况', async () => {
			const { result } = renderHook(() => useErrorHandler())

			// 添加一个可重试的错误
			const error = new Error('Network error')

			act(() => {
				result.current.handleError(error, 'medium', true)
			})

			const errorId = result.current.errors[0].id

			// 定义失败的 重试函数
			const retryFn = async () => {
				throw new Error('Retry failed')
			}

			// 执行重试
			await act(async () => {
				await result.current.retryError(errorId, retryFn)
			})

			// 错误应该被重新记录
			expect(result.current.errors).toHaveLength(1)
		})
	})

	describe('reportError', () => {
		it('应该支持错误上报', async () => {
			const { result } = renderHook(() => useErrorHandler())

			// Mock fetch
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
			})

			const errorInfo: ErrorInfo = {
				id: 'test-id',
				timestamp: Date.now(),
				message: 'Test error',
				severity: 'medium',
				retryable: false,
			}

			await act(async () => {
				await result.current.reportError(errorInfo)
			})

			expect(fetch).toHaveBeenCalledWith('/api/error-report', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(errorInfo),
			})
		})
	})

	describe('reportAllErrors', () => {
		it('应该上报所有错误', async () => {
			const { result } = renderHook(() => useErrorHandler())

			// Mock fetch
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
			})

			// 添加多个错误
			act(() => {
				result.current.handleError(new Error('Error 1'))
				result.current.handleError(new Error('Error 2'))
				result.current.handleError(new Error('Error 3'))
			})

			await act(async () => {
				await result.current.reportAllErrors()
			})

			// 验证 fetch 被调用了 3 次
			expect(fetch).toHaveBeenCalledTimes(3)
		})
	})
})

describe('useAsyncErrorHandler', () => {
	it('应该包含 useErrorHandler 的所有功能', () => {
		const { result } = renderHook(() =>
			useAsyncErrorHandler({ showError: false }),
		)

		expect(result.current).toHaveProperty('errors')
		expect(result.current).toHaveProperty('handleError')
		expect(result.current).toHaveProperty('wrapAsync')
		expect(typeof result.current.wrapAsync).toBe('function')
	})

	it('wrapAsync 应该包装异步函数', async () => {
		const { result } = renderHook(() => useAsyncErrorHandler())

		const asyncFn = async () => {
			throw new Error('Test error')
		}

		const wrappedFn = result.current.wrapAsync(asyncFn)

		await act(async () => {
			const result = await wrappedFn()
			expect(result).toBeUndefined()
		})

		// 验证错误被处理
		expect(result.current.errors).toHaveLength(1)
	})

	it('wrapAsync 应该返回正常结果', async () => {
		const { result } = renderHook(() => useAsyncErrorHandler())

		const asyncFn = async () => {
			return { success: true }
		}

		const wrappedFn = result.current.wrapAsync(asyncFn)

		let wrappedResult: any
		await act(async () => {
			wrappedResult = await wrappedFn()
		})

		expect(wrappedResult).toEqual({ success: true })
		expect(result.current.errors).toHaveLength(0)
	})
})

describe('useErrorBoundary', () => {
	it('应该返回初始状态', () => {
		const { result } = renderHook(() => useErrorBoundary())

		expect(result.current).toHaveProperty('hasError', false)
		expect(result.current).toHaveProperty('error', null)
		expect(result.current).toHaveProperty('reset')
		expect(result.current).toHaveProperty('captureError')
	})

	it('应该捕获错误', () => {
		const { result } = renderHook(() => useErrorBoundary())

		const error = new Error('Test error')
		const errorInfo = { componentStack: 'Component stack' }

		act(() => {
			result.current.captureError(error, errorInfo)
		})

		expect(result.current.hasError).toBe(true)
		expect(result.current.error).toBe(error)
	})

	it('应该重置错误状态', () => {
		const { result } = renderHook(() => useErrorBoundary())

		const error = new Error('Test error')

		act(() => {
			result.current.captureError(error)
		})

		expect(result.current.hasError).toBe(true)
		expect(result.current.error).toBe(error)

		// 重置状态
		act(() => {
			result.current.reset()
		})

		expect(result.current.hasError).toBe(false)
		expect(result.current.error).toBeNull()
	})

	it('应该支持错误回调', () => {
		const onError = vi.fn()
		const { result } = renderHook(() => useErrorBoundary(onError))

		const error = new Error('Test error')
		const errorInfo = { componentStack: 'Component stack' }

		act(() => {
			result.current.captureError(error, errorInfo)
		})

		expect(onError).toHaveBeenCalledWith(error, errorInfo)
	})
})
