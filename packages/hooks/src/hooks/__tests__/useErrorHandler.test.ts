/**
 * useErrorHandler Hook 测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, resetMocks } from '../../test-utils'
import {
	useErrorHandler,
	useAsyncErrorHandler,
	useErrorBoundary,
} from '../useErrorHandler'

describe('useErrorHandler', () => {
	beforeEach(() => {
		resetMocks()
		vi.clearAllMocks()
	})

	it('应该初始化状态', () => {
		const { result } = renderHook(() => useErrorHandler())

		expect(result.current).toHaveProperty('errors')
		expect(result.current).toHaveProperty('handleError')
		expect(result.current).toHaveProperty('clearErrors')
		expect(result.current).toHaveProperty('removeError')
		expect(result.current).toHaveProperty('retryError')
		expect(result.current).toHaveProperty('reportError')
		expect(result.current).toHaveProperty('reportAllErrors')
		expect(Array.isArray(result.current.errors)).toBe(true)
	})

	it('应该能够处理错误', () => {
		const { result } = renderHook(() => useErrorHandler())

		const error = new Error('Test error')
		result.current.handleError(error, 'test operation')

		expect(result.current.errors.length).toBe(1)
		expect(result.current.errors[0]).toHaveProperty('message', 'Test error')
		expect(result.current.errors[0]).toHaveProperty('severity', 'medium')
	})

	it('应该能够处理字符串错误', () => {
		const { result } = renderHook(() => useErrorHandler())

		result.current.handleError('String error', 'test')

		expect(result.current.errors.length).toBe(1)
		expect(result.current.errors[0]).toHaveProperty('message', 'String error')
	})

	it('应该能够设置错误严重性', () => {
		const { result } = renderHook(() => useErrorHandler())

		result.current.handleError(new Error('Critical error'), 'test', 'critical')

		expect(result.current.errors[0]).toHaveProperty('severity', 'critical')
	})

	it('应该支持自定义错误选项', () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

		const { result } = renderHook(() =>
			useErrorHandler({
				showError: true,
				redirectOn401: true,
				redirectOn500: false,
			}),
		)

		result.current.handleError(new Error('Test error'), 'test')

		expect(consoleSpy).toHaveBeenCalled()

		consoleSpy.mockRestore()
	})

	it('应该能够清理所有错误', () => {
		const { result } = renderHook(() => useErrorHandler())

		result.current.handleError(new Error('Error 1'), 'test')
		result.current.handleError(new Error('Error 2'), 'test')

		expect(result.current.errors.length).toBe(2)

		result.current.clearErrors()

		expect(result.current.errors.length).toBe(0)
	})

	it('应该能够移除特定错误', () => {
		const { result } = renderHook(() => useErrorHandler())

		result.current.handleError(new Error('Error 1'), 'test')
		const errorId = result.current.errors[0].id

		result.current.handleError(new Error('Error 2'), 'test')

		expect(result.current.errors.length).toBe(2)

		result.current.removeError(errorId)

		expect(result.current.errors.length).toBe(1)
	})

	it('应该能够重试错误', async () => {
		const { result } = renderHook(() => useErrorHandler())

		result.current.handleError(new Error('Error'), 'test', 'retryable')
		const errorId = result.current.errors[0].id

		const retryFn = vi.fn().mockResolvedValue('success')

		await result.current.retryError(errorId, retryFn)

		expect(retryFn).toHaveBeenCalledTimes(1)
		expect(result.current.errors.length).toBe(0)
	})

	it('应该防止重试不可重试的错误', async () => {
		const { result } = renderHook(() => useErrorHandler())

		result.current.handleError(new Error('Error'), 'test', 'low')
		const errorId = result.current.errors[0].id

		const retryFn = vi.fn()

		await expect(
			result.current.retryError(errorId, retryFn),
		).rejects.toThrow('This error is not retryable')

		expect(retryFn).not.toHaveBeenCalled()
	})

	it('应该处理不存在的错误 ID', async () => {
		const { result } = renderHook(() => useErrorHandler())

		result.current.handleError(new Error('Error'), 'test', 'retryable')

		await expect(
			result.current.retryError('non-existent-id', vi.fn()),
		).rejects.toThrow('Error not found')
	})

	it('应该支持错误上报', async () => {
		const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({}),
		} as any)

		const { result } = renderHook(() => useErrorHandler())

		result.current.handleError(new Error('Test error'), 'test')
		const errorInfo = result.current.errors[0]

		await result.current.reportError(errorInfo)

		expect(fetchSpy).toHaveBeenCalledWith(
			'/api/error-report',
			expect.objectContaining({
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			}),
		)

		fetchSpy.mockRestore()
	})
})

describe('useAsyncErrorHandler', () => {
	beforeEach(() => {
		resetMocks()
	})

	it('应该提供 wrapAsync 方法', () => {
		const { result } = renderHook(() =>
			useAsyncErrorHandler({
				showError: false,
			}),
		)

		expect(result.current).toHaveProperty('wrapAsync')
		expect(typeof result.current.wrapAsync).toBe('function')
	})

	it('应该包装异步函数并处理错误', async () => {
		const { result } = renderHook(() => useAsyncErrorHandler())

		const asyncFn = vi.fn().mockRejectedValue(new Error('Async error'))
		const wrappedFn = result.current.wrapAsync(asyncFn)

		const output = await wrappedFn()

		expect(output).toBeUndefined()
		expect(asyncFn).toHaveBeenCalledTimes(1)
	})

	it('应该成功执行异步函数', async () => {
		const { result } = renderHook(() => useAsyncErrorHandler())

		const asyncFn = vi.fn().mockResolvedValue('success')
		const wrappedFn = result.current.wrapAsync(asyncFn)

		const output = await wrappedFn()

		expect(output).toBe('success')
		expect(asyncFn).toHaveBeenCalledTimes(1)
	})

	it('应该传递参数给包装函数', async () => {
		const { result } = renderHook(() => useAsyncErrorHandler())

		const asyncFn = vi.fn().mockResolvedValue('success')
		const wrappedFn = result.current.wrapAsync(asyncFn)

		await wrappedFn('arg1', 'arg2', { arg: 3 })

		expect(asyncFn).toHaveBeenCalledWith('arg1', 'arg2', { arg: 3 })
	})
})

describe('useErrorBoundary', () => {
	beforeEach(() => {
		resetMocks()
	})

	it('应该初始化状态', () => {
		const { result } = renderHook(() => useErrorBoundary())

		expect(result.current).toHaveProperty('hasError', false)
		expect(result.current).toHaveProperty('error', null)
		expect(result.current).toHaveProperty('reset')
		expect(result.current).toHaveProperty('captureError')
	})

	it('应该能够捕获错误', () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
		const errorCallback = vi.fn()

		const { result } = renderHook(() => useErrorBoundary(errorCallback))

		const error = new Error('Test error')
		const errorInfo = { componentStack: 'test stack' }

		result.current.captureError(error, errorInfo)

		expect(result.current.hasError).toBe(true)
		expect(result.current.error).toBe(error)
		expect(errorCallback).toHaveBeenCalledWith(error, errorInfo)
		expect(consoleSpy).toHaveBeenCalled()

		consoleSpy.mockRestore()
	})

	it('应该能够重置错误状态', () => {
		const { result } = renderHook(() => useErrorBoundary())

		// 捕获一个错误
		result.current.captureError(new Error('Test error'))

		expect(result.current.hasError).toBe(true)
		expect(result.current.error).not.toBeNull()

		// 重置
		result.current.reset()

		expect(result.current.hasError).toBe(false)
		expect(result.current.error).toBeNull()
	})

	it('应该不调用回调函数如果未提供', () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

		const { result } = renderHook(() => useErrorBoundary())

		const error = new Error('Test error')

		result.current.captureError(error)

		expect(result.current.hasError).toBe(true)

		consoleSpy.mockRestore()
	})

	it('应该正确处理不同的错误类型', () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

		const { result } = renderHook(() => useErrorBoundary())

		// Error 对象
		result.current.captureError(new Error('Error object'))

		expect(result.current.hasError).toBe(true)
		expect(result.current.error).toBeInstanceOf(Error)

		// 重置
		result.current.reset()

		// 字符串错误
		result.current.captureError('String error' as any)

		expect(result.current.hasError).toBe(true)
		expect(typeof result.current.error?.message).toBe('string')

		consoleSpy.mockRestore()
	})
})
