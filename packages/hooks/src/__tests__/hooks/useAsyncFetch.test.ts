/**
 * 测试 useAsyncFetch Hook
 */

import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
	useAsyncFetch,
	useAsyncPost,
	useAsyncGet,
} from '../../hooks/useAsyncFetch'

// Mock HttpRequest
vi.mock('../../utils/axios-instance', () => {
	return {
		HttpRequest: vi.fn().mockImplementation(() => ({
			request: vi.fn(),
		})),
	}
})

describe('useAsyncFetch', () => {
	describe('基本功能', () => {
		it('应该返回初始状态', () => {
			const { result } = renderHook(() => useAsyncFetch())

			expect(result.current).toHaveProperty('data', null)
			expect(result.current).toHaveProperty('loading', false)
			expect(result.current).toHaveProperty('error', null)
			expect(result.current).toHaveProperty('execute')
			expect(result.current).toHaveProperty('cancel')
			expect(result.current).toHaveProperty('reset')
		})

		it('应该返回初始数据', () => {
			const { result } = renderHook(() =>
				useAsyncFetch({ initialData: { list: [] } }),
			)

			expect(result.current.data).toEqual({ list: [] })
		})

		it('应该支持 onSuccess 回调', () => {
			const onSuccess = vi.fn()
			const { result } = renderHook(() =>
				useAsyncFetch({ onSuccess }),
			)

			// onSuccess 回调在构造函数中被捕获
			expect(onSuccess).not.toHaveBeenCalled()
		})
	})

	describe('execute 方法', () => {
		it('执行成功应该设置数据', async () => {
			const { result } = renderHook(() => useAsyncFetch())

			const mockData = { id: 1, name: 'Test' }

			// 模拟成功响应
			// @ts-ignore
			const mockRequest = vi.fn().mockResolvedValue({
				status: true,
				data: mockData,
				code: 200,
			})
			vi.mocked(require('../../utils/axios-instance').HttpRequest).mockImplementation(
				() => ({
					request: mockRequest,
				}),
			)

			await act(async () => {
				await result.current.execute({
					url: '/test',
					method: 'GET',
				})
			})

			expect(result.current.data).toEqual(mockData)
			expect(result.current.loading).toBe(false)
			expect(result.current.error).toBeNull()
		})

		it('执行失败应该设置错误', async () => {
			const { result } = renderHook(() => useAsyncFetch())

			const error = new Error('Network Error')

			// 模拟失败响应
			// @ts-ignore
			const mockRequest = vi.fn().mockRejectedValue(error)
			vi.mocked(require('../../utils/axios-instance').HttpRequest).mockImplementation(
				() => ({
					request: mockRequest,
				}),
			)

			await act(async () => {
				try {
					await result.current.execute({
						url: '/test',
						method: 'GET',
					})
				} catch (err) {
					// 忽略错误
				}
			})

			expect(result.current.error).toBeInstanceOf(Error)
			expect(result.current.error?.message).toBe('Network Error')
			expect(result.current.loading).toBe(false)
		})

		it('应该调用 onSuccess 回调', async () => {
			const onSuccess = vi.fn()
			const { result } = renderHook(() =>
				useAsyncFetch({ onSuccess }),
			)

			const mockData = { id: 1 }

			// 模拟成功响应
			// @ts-ignore
			const mockRequest = vi.fn().mockResolvedValue({
				status: true,
				data: mockData,
				code: 200,
			})
			vi.mocked(require('../../utils/axios-instance').HttpRequest).mockImplementation(
				() => ({
					request: mockRequest,
				}),
			)

			await act(async () => {
				await result.current.execute({
					url: '/test',
					method: 'GET',
				})
			})

			expect(onSuccess).toHaveBeenCalledWith(mockData)
		})

		it('应该调用 onError 回调', async () => {
			const onError = vi.fn()
			const { result } = renderHook(() =>
				useAsyncFetch({ onError }),
			)

			const error = new Error('Network Error')

			// 模拟失败响应
			// @ts-ignore
			const mockRequest = vi.fn().mockRejectedValue(error)
			vi.mocked(require('../../utils/axios-instance').HttpRequest).mockImplementation(
				() => ({
					request: mockRequest,
				}),
			)

			await act(async () => {
				try {
					await result.current.execute({
						url: '/test',
						method: 'GET',
					})
				} catch (err) {
					// 忽略错误
				}
			})

			expect(onError).toHaveBeenCalled()
		})

		it('应该设置加载状态', async () => {
			let resolveFn: any
			const mockPromise = new Promise(resolve => {
				resolveFn = resolve
			})

			const { result } = renderHook(() => useAsyncFetch())

			// @ts-ignore
			const mockRequest = vi.fn().mockReturnValue(mockPromise)
			vi.mocked(require('../../utils/axios-instance').HttpRequest).mockImplementation(
				() => ({
					request: mockRequest,
				}),
			)

			// 启动请求
			const executePromise = act(async () => {
				result.current.execute({ url: '/test', method: 'GET' })
			})

			// 验证加载状态
			expect(result.current.loading).toBe(true)

			// 完成请求
			await act(async () => {
				resolveFn({ data: { id: 1 }, status: true, code: 200 })
				await executePromise
			})

			// 验证加载状态已结束
			expect(result.current.loading).toBe(false)
		})
	})

	describe('cancel 方法', () => {
		it('应该清除 loading 状态', () => {
			const { result } = renderHook(() => useAsyncFetch())

			act(() => {
				result.current.cancel()
			})

			expect(result.current.loading).toBe(false)
		})
	})

	describe('reset 方法', () => {
		it('应该重置状态', async () => {
			const { result } = renderHook(() =>
				useAsyncFetch({ initialData: { id: 0 } }),
			)

			// 模拟第一次请求成功
			// @ts-ignore
			const mockRequest = vi.fn().mockResolvedValue({
				data: { id: 1 },
				status: true,
				code: 200,
			})
			vi.mocked(require('../../utils/axios-instance').HttpRequest).mockImplementation(
				() => ({
					request: mockRequest,
				}),
			)

			await act(async () => {
				await result.current.execute({ url: '/test', method: 'GET' })
			})

			// 验证状态已更新
			expect(result.current.data).toEqual({ id: 1 })

			// 重置状态
			act(() => {
				result.current.reset()
			})

			// 验证状态已重置
			expect(result.current.data).toEqual({ id: 0 })
			expect(result.current.loading).toBe(false)
			expect(result.current.error).toBeNull()
		})
	})
})

describe('useAsyncPost', () => {
	it('应该返回初始状态', () => {
		const { result } = renderHook(() => useAsyncPost())

		expect(result.current).toHaveProperty('data', null)
		expect(result.current).toHaveProperty('loading', false)
		expect(result.current).toHaveProperty('error', null)
		expect(result.current).toHaveProperty('execute')
		expect(result.current).toHaveProperty('cancel')
		expect(result.current).toHaveProperty('reset')
	})

	it('应该执行 POST 请求', async () => {
		const { result } = renderHook(() => useAsyncPost())

		const mockData = { id: 1, name: 'Created' }

		// 模拟成功响应
		// @ts-ignore
		const mockRequest = vi.fn().mockResolvedValue({
			status: true,
			data: mockData,
			code: 200,
		})
		vi.mocked(require('../../utils/axios-instance').HttpRequest).mockImplementation(
			() => ({
				request: mockRequest,
			}),
		)

		await act(async () => {
			await result.current.execute('/test', { name: 'Test' })
		})

		// 验证请求配置
		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				url: '/test',
				method: 'POST',
				data: { name: 'Test' },
			}),
		)

		expect(result.current.data).toEqual(mockData)
	})

	it('应该支持自定义配置', async () => {
		const { result } = renderHook(() => useAsyncPost())

		const mockData = { id: 1 }

		// 模拟成功响应
		// @ts-ignore
		const mockRequest = vi.fn().mockResolvedValue({
			status: true,
			data: mockData,
			code: 200,
		})
		vi.mocked(require('../../utils/axios-instance').HttpRequest).mockImplementation(
			() => ({
				request: mockRequest,
			}),
		)

		await act(async () => {
			await result.current.execute('/test', { name: 'Test' }, { skipPending: true })
		})

		// 验证请求配置
		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				url: '/test',
				method: 'POST',
				data: { name: 'Test' },
				skipPending: true,
			}),
		)
	})

	it('应该调用回调函数', async () => {
		const onSuccess = vi.fn()
		const { result } = renderHook(() =>
			useAsyncPost({ onSuccess }),
		)

		const mockData = { id: 1 }

		// 模拟成功响应
		// @ts-ignore
		const mockRequest = vi.fn().mockResolvedValue({
			status: true,
			data: mockData,
			code: 200,
		})
		vi.mocked(require('../../utils/axios-instance').HttpRequest).mockImplementation(
			() => ({
				request: mockRequest,
			}),
		)

		await act(async () => {
			await result.current.execute('/test', { name: 'Test' })
		})

		expect(onSuccess).toHaveBeenCalledWith(mockData)
	})
})

describe('useAsyncGet', () => {
	it('应该返回初始状态', () => {
		const { result } = renderHook(() => useAsyncGet())

		expect(result.current).toHaveProperty('data', null)
		expect(result.current).toHaveProperty('loading', false)
		expect(result.current).toHaveProperty('error', null)
		expect(result.current).toHaveProperty('execute')
		expect(result.current).toHaveProperty('cancel')
		expect(result.current).toHaveProperty('reset')
	})

	it('应该执行 GET 请求', async () => {
		const { result } = renderHook(() => useAsyncGet())

		const mockData = { id: 1, name: 'Retrieved' }

		// 模拟成功响应
		// @ts-ignore
		const mockRequest = vi.fn().mockResolvedValue({
			status: true,
			data: mockData,
			code: 200,
		})
		vi.mocked(require('../../utils/axios-instance').HttpRequest).mockImplementation(
			() => ({
				request: mockRequest,
			}),
		)

		await act(async () => {
			await result.current.execute('/test/123')
		})

		// 验证请求配置
		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				url: '/test/123',
				method: 'GET',
			}),
		)

		expect(result.current.data).toEqual(mockData)
	})

	it('应该支持自定义配置', async () => {
		const { result } = renderHook(() => useAsyncGet())

		const mockData = { id: 1 }

		// 模拟成功响应
		// @ts-ignore
		const mockRequest = vi.fn().mockResolvedValue({
			status: true,
			data: mockData,
			code: 200,
		})
		vi.mocked(require('../../utils/axios-instance').HttpRequest).mockImplementation(
			() => ({
				request: mockRequest,
			}),
		)

		await act(async () => {
			await result.current.execute('/test/123', { skipPending: true })
		})

		// 验证请求配置
		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				url: '/test/123',
				method: 'GET',
				skipPending: true,
			}),
		)
	})
})
