/**
 * 测试 useRequest Hook
 */

import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
	useRequest,
	usePost,
	useGet,
	useLazyRequest,
	useLazyPost,
	useLazyGet,
} from '../../hooks/useRequest'

// Mock HttpRequest
vi.mock('../../utils/axios-instance', () => {
	return {
		HttpRequest: vi.fn().mockImplementation(() => ({
			request: vi.fn(),
		})),
	}
})

describe('useRequest', () => {
	describe('基本功能', () => {
		it('应该返回初始状态', () => {
			const { result } = renderHook(() =>
				useRequest(
					{ url: '/test', method: 'GET' },
					{ immediate: false, manual: true },
				),
			)

			expect(result.current).toHaveProperty('data', null)
			expect(result.current).toHaveProperty('loading', false)
			expect(result.current).toHaveProperty('error', null)
			expect(result.current).toHaveProperty('execute')
			expect(result.current).toHaveProperty('cancel')
			expect(result.current).toHaveProperty('reset')
		})

		it('应该返回初始数据', () => {
			const { result } = renderHook(() =>
				useRequest(
					{ url: '/test', method: 'GET' },
					{ initialData: [], immediate: false, manual: true },
				),
			)

			expect(result.current.data).toEqual([])
		})
	})

	describe('execute 方法', () => {
		it('执行成功应该设置 data', async () => {
			const mockData = { id: 1, name: 'Test' }
			const { result } = renderHook(() =>
				useRequest({ url: '/test', method: 'GET' }, { manual: true }),
			)

			// 模拟成功响应
			// @ts-ignore
			const mockRequest = vi
				.fn()
				.mockResolvedValue({ status: true, data: mockData, code: 200 })
			vi.mocked(require('../../utils/axios-instance').HttpRequest).mockImplementation(
				() => ({
					request: mockRequest,
				}),
			)

			await act(async () => {
				await result.current.execute()
			})

			expect(result.current.data).toEqual(mockData)
			expect(result.current.loading).toBe(false)
			expect(result.current.error).toBeNull()
		})

		it('执行失败应该设置 error', async () => {
			const { result } = renderHook(() =>
				useRequest({ url: '/test', method: 'GET' }, { manual: true }),
			)

			// 模拟失败响应
			const error = new Error('Network Error')
			// @ts-ignore
			const mockRequest = vi.fn().mockRejectedValue(error)
			vi.mocked(require('../../utils/axios-instance').HttpRequest).mockImplementation(
				() => ({
					request: mockRequest,
				}),
			)

			await act(async () => {
				try {
					await result.current.execute()
				} catch (err) {
					// 忽略错误
				}
			})

			expect(result.current.error).toBeInstanceOf(Error)
			expect(result.current.loading).toBe(false)
		})

		it('应该调用 onSuccess 回调', async () => {
			const onSuccess = vi.fn()
			const { result } = renderHook(() =>
				useRequest(
					{ url: '/test', method: 'GET' },
					{ manual: true, onSuccess },
				),
			)

			// 模拟成功响应
			const mockData = { id: 1 }
			// @ts-ignore
			const mockRequest = vi.fn().mockResolvedValue({ data: mockData })
			vi.mocked(require('../../utils/axios-instance').HttpRequest).mockImplementation(
				() => ({
					request: mockRequest,
				}),
			)

			await act(async () => {
				await result.current.execute()
			})

			expect(onSuccess).toHaveBeenCalledWith(mockData)
		})

		it('应该调用 onError 回调', async () => {
			const onError = vi.fn()
			const { result } = renderHook(() =>
				useRequest(
					{ url: '/test', method: 'GET' },
					{ manual: true, onError },
				),
			)

			// 模拟失败响应
			const error = new Error('Network Error')
			// @ts-ignore
			const mockRequest = vi.fn().mockRejectedValue(error)
			vi.mocked(require('../../utils/axios-instance').HttpRequest).mockImplementation(
				() => ({
					request: mockRequest,
				}),
			)

			await act(async () => {
				try {
					await result.current.execute()
				} catch (err) {
					// 忽略错误
				}
			})

			expect(onError).toHaveBeenCalled()
		})

		it('执行时应该设置 loading 状态', async () => {
			let resolveFn: any
			const mockPromise = new Promise(resolve => {
				resolveFn = resolve
			})

			const { result } = renderHook(() =>
				useRequest({ url: '/test', method: 'GET' }, { manual: true }),
			)

			// @ts-ignore
			const mockRequest = vi.fn().mockReturnValue(mockPromise)
			vi.mocked(require('../../utils/axios-instance').HttpRequest).mockImplementation(
				() => ({
					request: mockRequest,
				}),
			)

			// 启动请求
			const executePromise = act(async () => {
				result.current.execute()
			})

			// 检查加载状态
			expect(result.current.loading).toBe(true)

			// 完成请求
			await act(async () => {
				resolveFn({ data: { id: 1 }, status: true, code: 200 })
				await executePromise
			})

			// 检查加载状态已结束
			expect(result.current.loading).toBe(false)
		})
	})

	describe('cancel 方法', () => {
		it('cancel 应该清除 loading 状态', () => {
			const { result } = renderHook(() =>
				useRequest({ url: '/test', method: 'GET' }, { manual: true }),
			)

			act(() => {
				result.current.cancel()
			})

			expect(result.current.loading).toBe(false)
		})
	})

	describe('reset 方法', () => {
		it('应该重置状态', async () => {
			const { result } = renderHook(() =>
				useRequest(
					{ url: '/test', method: 'GET' },
					{ initialData: { id: 0 }, manual: true },
				),
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
				await result.current.execute()
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

	describe('immediate 选项', () => {
		it('immediate: true 时应该立即执行', async () => {
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

			renderHook(() => useRequest({ url: '/test', method: 'GET' }, { immediate: true }))

			await new Promise(resolve => setTimeout(resolve, 0))

			expect(mockRequest).toHaveBeenCalled()
		})

		it('immediate: false 时不应该立即执行', () => {
			// @ts-ignore
			const mockRequest = vi.fn()
			vi.mocked(require('../../utils/axios-instance').HttpRequest).mockImplementation(
				() => ({
					request: mockRequest,
				}),
			)

			renderHook(() =>
				useRequest({ url: '/test', method: 'GET' }, { immediate: false, manual: true }),
			)

			expect(mockRequest).not.toHaveBeenCalled()
		})
	})

	describe('usePost', () => {
		it('应该创建 POST 请求配置', () => {
			const { result } = renderHook(() =>
				usePost('/test', { data: { name: 'test' }, manual: true }),
			)

			expect(result.current).toHaveProperty('execute')
			expect(result.current).toHaveProperty('loading', false)
		})

		it('应该执行请求', async () => {
			const { result } = renderHook(() =>
				usePost('/test', { data: { name: 'test' }, manual: true }),
			)

			// 模拟成功响应
			// @ts-ignore
			const mockRequest = vi.fn().mockResolvedValue({
				status: true,
				data: { id: 1 },
				code: 200,
			})
			vi.mocked(require('../../utils/axios-instance').HttpRequest).mockImplementation(
				() => ({
					request: mockRequest,
				}),
			)

			await act(async () => {
				await result.current.execute({ data: { name: 'new' } })
			})

			expect(result.current.data).toEqual({ id: 1 })
		})
	})

	describe('useGet', () => {
		it('应该创建 GET 请求配置', () => {
			const { result } = renderHook(() =>
				useGet('/test', { manual: true }),
			)

			expect(result.current).toHaveProperty('execute')
			expect(result.current).toHaveProperty('loading', false)
		})
	})

	describe('useLazyRequest', () => {
		it('默认应该是手动执行', () => {
			const { result } = renderHook(() =>
				useLazyRequest({ url: '/test', method: 'GET' }),
			)

			// 验证初始状态
			expect(result.current.loading).toBe(false)
			expect(result.current.data).toBeNull()
		})

		it('run 方法应该调用 execute', async () => {
			const { result } = renderHook(() =>
				useLazyRequest({ url: '/test', method: 'GET' }),
			)

			// 模拟成功响应
			// @ts-ignore
			const mockRequest = vi.fn().mockResolvedValue({
				status: true,
				data: { id: 1 },
				code: 200,
			})
			vi.mocked(require('../../utils/axios-instance').HttpRequest).mockImplementation(
				() => ({
					request: mockRequest,
				}),
			)

			await act(async () => {
				await result.current.run()
			})

			expect(result.current.data).toEqual({ id: 1 })
		})

		it('refresh 方法应该调用 execute', async () => {
			const { result } = renderHook(() =>
				useLazyRequest({ url: '/test', method: 'GET' }),
			)

			// 模拟成功响应
			// @ts-ignore
			const mockRequest = vi.fn().mockResolvedValue({
				status: true,
				data: { id: 1 },
				code: 200,
			})
			vi.mocked(require('../../utils/axios-instance').HttpRequest).mockImplementation(
				() => ({
					request: mockRequest,
				}),
			)

			await act(async () => {
				await result.current.refresh()
			})

			expect(result.current.data).toEqual({ id: 1 })
		})
	})

	describe('useLazyPost 和 useLazyGet', () => {
		it('useLazyPost 应该创建 POST 请求', () => {
			const { result } = renderHook(() => useLazyPost('/test'))

			expect(result.current).toHaveProperty('execute')
		})

		it('useLazyGet 应该创建 GET 请求', () => {
			const { result } = renderHook(() => useLazyGet('/test'))

			expect(result.current).toHaveProperty('execute')
		})
	})

	describe('动态配置', () => {
		it('应该支持函数形式的配置', async () => {
			const { result } = renderHook(() =>
				useRequest(
					(params: any) => ({
						url: `/test/${params.id}`,
						method: 'GET',
					}),
					{ manual: true },
				),
			)

			// 模拟成功响应
			// @ts-ignore
			const mockRequest = vi.fn().mockResolvedValue({
				status: true,
				data: { id: 123 },
				code: 200,
			})
			vi.mocked(require('../../utils/axios-instance').HttpRequest).mockImplementation(
				() => ({
					request: mockRequest,
				}),
			)

			await act(async () => {
				await result.current.execute({ id: 123 })
			})

			// 验证传递的参数
			expect(mockRequest).toHaveBeenCalledWith(
				expect.objectContaining({
					url: '/test/123',
					method: 'GET',
				}),
			)
		})
	})
})
