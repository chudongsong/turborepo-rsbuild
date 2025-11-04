/**
 * useAsyncFetch Hook 测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, setupAxiosMock, resetMocks } from '../../test-utils'
import {
	useAsyncFetch,
	useAsyncPost,
	useAsyncGet,
} from '../useAsyncFetch'

describe('useAsyncFetch', () => {
	beforeEach(() => {
		resetMocks()
		vi.clearAllTimers()
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('应该初始化状态', () => {
		setupAxiosMock()

		const { result } = renderHook(() => useAsyncFetch())

		expect(result.current).toHaveProperty('data', null)
		expect(result.current).toHaveProperty('loading', false)
		expect(result.current).toHaveProperty('error', null)
		expect(result.current).toHaveProperty('execute')
		expect(result.current).toHaveProperty('cancel')
		expect(result.current).toHaveProperty('reset')
	})

	it('应该执行请求并返回结果', async () => {
		const mockAxiosInstance = setupAxiosMock()
		const mockRequest = vi.fn().mockResolvedValue({
			status: true,
			msg: 'success',
			code: 200,
			data: { id: 1, name: 'test' },
		})
		mockAxiosInstance.request = mockRequest

		const { result } = renderHook(() => useAsyncFetch())

		const response = await result.current.execute({
			url: '/api/users',
			method: 'GET',
		})

		expect(mockRequest).toHaveBeenCalledTimes(1)
		expect(response).toHaveProperty('status', true)
		expect(response).toHaveProperty('data')
	})

	it('应该更新 loading 状态', async () => {
		const mockAxiosInstance = setupAxiosMock()
		const mockRequest = vi.fn().mockImplementation(() => {
			return new Promise(resolve => {
				setTimeout(() => {
					resolve({
						status: true,
						msg: 'success',
						code: 200,
						data: {},
					})
				}, 100)
			})
		})
		mockAxiosInstance.request = mockRequest

		const { result } = renderHook(() => useAsyncFetch())

		// 执行异步请求
		const promise = result.current.execute({
			url: '/api/users',
			method: 'GET',
		})

		// 立即检查 loading 状态
		expect(result.current.loading).toBe(true)

		await promise

		// 请求完成后 loading 应该是 false
		expect(result.current.loading).toBe(false)
	})

	it('应该处理成功回调', async () => {
		setupAxiosMock()

		const onSuccess = vi.fn()
		const onError = vi.fn()

		const { result } = renderHook(() =>
			useAsyncFetch({
				onSuccess,
				onError,
			}),
		)

		await result.current.execute({
			url: '/api/users',
			method: 'GET',
		})

		expect(onSuccess).toHaveBeenCalledTimes(1)
		expect(onSuccess).toHaveBeenCalledWith(
			expect.objectContaining({ id: expect.any(Number) }),
		)
		expect(onError).not.toHaveBeenCalled()
	})

	it('应该处理错误', async () => {
		const error = new Error('Network Error')
		const mockAxiosInstance = setupAxiosMock()
		mockAxiosInstance.request = vi.fn().mockRejectedValue(error)

		const onSuccess = vi.fn()
		const onError = vi.fn()

		const { result } = renderHook(() =>
			useAsyncFetch({
				onSuccess,
				onError,
			}),
		)

		await expect(
			result.current.execute({
				url: '/api/error',
				method: 'GET',
			}),
		).rejects.toThrow('Network Error')

		expect(onError).toHaveBeenCalledWith(error)
		expect(onSuccess).not.toHaveBeenCalled()
	})

	it('应该支持初始数据', () => {
		setupAxiosMock()

		const { result } = renderHook(() =>
			useAsyncFetch({
				initialData: { id: 0 },
			}),
		)

		expect(result.current.data).toEqual({ id: 0 })
	})

	it('应该能够取消请求', async () => {
		setupAxiosMock()

		const mockCancel = vi.fn()
		vi.mocked(await import('../../utils/axios-cancel')).axiosCanceler = {
			removeAllPending: mockCancel,
		} as any

		const { result } = renderHook(() => useAsyncFetch())

		result.current.cancel()

		expect(mockCancel).toHaveBeenCalledTimes(1)
		expect(result.current.loading).toBe(false)
	})

	it('应该能够重置状态', () => {
		setupAxiosMock()

		const { result } = renderHook(() =>
			useAsyncFetch({
				initialData: { id: 0 },
			}),
		)

		// 修改状态
		result.current.data = { id: 1 }
		result.current.error = new Error('test')

		// 重置
		result.current.reset()

		expect(result.current.data).toEqual({ id: 0 })
		expect(result.current.error).toBeNull()
		expect(result.current.loading).toBe(false)
	})
})

describe('useAsyncPost', () => {
	beforeEach(() => {
		resetMocks()
	})

	it('应该初始化状态', () => {
		setupAxiosMock()

		const { result } = renderHook(() => useAsyncPost())

		expect(result.current).toHaveProperty('execute')
		expect(result.current).toHaveProperty('loading', false)
		expect(result.current).toHaveProperty('error', null)
	})

	it('应该执行 POST 请求', async () => {
		const mockAxiosInstance = setupAxiosMock()
		const mockRequest = vi.fn().mockResolvedValue({
			status: true,
			msg: 'success',
			code: 200,
			data: { id: 1 },
		})
		mockAxiosInstance.request = mockRequest

		const { result } = renderHook(() => useAsyncPost())

		const response = await result.current.execute('/api/users', {
			name: 'test',
			email: 'test@example.com',
		})

		expect(mockRequest).toHaveBeenCalledTimes(1)
		expect(response).toHaveProperty('status', true)
	})

	it('应该支持回调选项', async () => {
		setupAxiosMock()

		const onSuccess = vi.fn()
		const onError = vi.fn()

		const { result } = renderHook(() =>
			useAsyncPost({
				onSuccess,
				onError,
			}),
		)

		await result.current.execute('/api/users', { name: 'test' })

		expect(onSuccess).toHaveBeenCalledTimes(1)
	})

	it('应该支持自定义配置', async () => {
		const mockAxiosInstance = setupAxiosMock()
		const mockRequest = vi.fn().mockResolvedValue({
			status: true,
			msg: 'success',
			code: 200,
			data: {},
		})
		mockAxiosInstance.request = mockRequest

		const { result } = renderHook(() => useAsyncPost())

		await result.current.execute('/api/users', { name: 'test' }, {
			headers: {
				'Content-Type': 'application/json',
			},
		})

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				url: '/api/users',
				method: 'POST',
				data: { name: 'test' },
				headers: {
					'Content-Type': 'application/json',
				},
			}),
		)
	})
})

describe('useAsyncGet', () => {
	beforeEach(() => {
		resetMocks()
	})

	it('应该初始化状态', () => {
		setupAxiosMock()

		const { result } = renderHook(() => useAsyncGet())

		expect(result.current).toHaveProperty('execute')
		expect(result.current).toHaveProperty('loading', false)
		expect(result.current).toHaveProperty('error', null)
	})

	it('应该执行 GET 请求', async () => {
		const mockAxiosInstance = setupAxiosMock()
		const mockRequest = vi.fn().mockResolvedValue({
			status: true,
			msg: 'success',
			code: 200,
			data: { id: 1 },
		})
		mockAxiosInstance.request = mockRequest

		const { result } = renderHook(() => useAsyncGet())

		const response = await result.current.execute('/api/users/1')

		expect(mockRequest).toHaveBeenCalledTimes(1)
		expect(response).toHaveProperty('status', true)
	})

	it('应该支持回调选项', async () => {
		setupAxiosMock()

		const onSuccess = vi.fn()
		const onError = vi.fn()

		const { result } = renderHook(() =>
			useAsyncGet({
				onSuccess,
				onError,
			}),
		)

		await result.current.execute('/api/users')

		expect(onSuccess).toHaveBeenCalledTimes(1)
	})

	it('应该支持自定义配置', async () => {
		const mockAxiosInstance = setupAxiosMock()
		const mockRequest = vi.fn().mockResolvedValue({
			status: true,
			msg: 'success',
			code: 200,
			data: {},
		})
		mockAxiosInstance.request = mockRequest

		const { result } = renderHook(() => useAsyncGet())

		await result.current.execute('/api/users', {
			headers: {
				'X-Custom-Header': 'value',
			},
		})

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				url: '/api/users',
				method: 'GET',
				headers: {
					'X-Custom-Header': 'value',
				},
			}),
		)
	})
})
