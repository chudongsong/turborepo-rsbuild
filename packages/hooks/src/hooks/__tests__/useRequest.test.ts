/**
 * useRequest Hook 测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, setupAxiosMock, resetMocks } from '../../test-utils'
import {
	useRequest,
	usePost,
	useGet,
	useLazyRequest,
	useLazyPost,
	useLazyGet,
} from '../useRequest'

describe('useRequest', () => {
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

		const { result } = renderHook(() =>
			useRequest(
				{ url: '/api/test', method: 'GET' },
				{ manual: true },
			),
		)

		expect(result.current).toHaveProperty('data', null)
		expect(result.current).toHaveProperty('loading', false)
		expect(result.current).toHaveProperty('error', null)
		expect(result.current).toHaveProperty('execute')
		expect(result.current).toHaveProperty('cancel')
		expect(result.current).toHaveProperty('reset')
	})

	it('应该自动执行请求（immediate: true）', async () => {
		const mockAxiosInstance = setupAxiosMock({
			data: {
				status: true,
				msg: 'success',
				code: 200,
				data: { id: 1 },
			},
		})

		const { result } = renderHook(() =>
			useRequest({ url: '/api/users', method: 'GET' }, { immediate: true }),
		)

		// 等待一个微任务队列
		await vi.waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		expect(result.current.data).toEqual({ id: 1 })
		expect(result.current.loading).toBe(false)
		expect(result.current.error).toBeNull()
	})

	it('应该支持手动执行（manual: true）', async () => {
		const mockAxiosInstance = setupAxiosMock()
		const mockRequest = vi.fn().mockResolvedValue({
			status: true,
			msg: 'success',
			code: 200,
			data: { id: 1 },
		})
		mockAxiosInstance.request = mockRequest

		const { result } = renderHook(() =>
			useRequest({ url: '/api/test', method: 'GET' }, { manual: true }),
		)

		// 初始状态应该是未加载
		expect(result.current.loading).toBe(false)

		// 手动执行
		await result.current.execute()

		expect(mockRequest).toHaveBeenCalledTimes(1)
		expect(result.current.data).toEqual({ id: 1 })
	})

	it('应该支持成功回调', async () => {
		setupAxiosMock()

		const onSuccess = vi.fn()
		const onError = vi.fn()

		const { result } = renderHook(() =>
			useRequest(
				{ url: '/api/users', method: 'GET' },
				{
					immediate: true,
					onSuccess,
					onError,
				},
			),
		)

		await vi.waitFor(() => {
			return result.current.loading === false
		})

		expect(onSuccess).toHaveBeenCalledTimes(1)
		expect(onSuccess).toHaveBeenCalledWith(
			expect.objectContaining({ id: expect.any(Number) }),
		)
		expect(onError).not.toHaveBeenCalled()
	})

	it('应该支持错误回调', async () => {
		const error = new Error('Network Error')
		const mockAxiosInstance = setupAxiosMock()
		mockAxiosInstance.request = vi.fn().mockRejectedValue(error)

		const onSuccess = vi.fn()
		const onError = vi.fn()

		const { result } = renderHook(() =>
			useRequest(
				{ url: '/api/error', method: 'GET' },
				{
					manual: true,
					onSuccess,
					onError,
				},
			),
		)

		await result.current.execute()

		expect(onError).toHaveBeenCalledWith(error)
		expect(onSuccess).not.toHaveBeenCalled()
	})

	it('应该支持初始数据', () => {
		setupAxiosMock()

		const { result } = renderHook(() =>
			useRequest(
				{ url: '/api/test', method: 'GET' },
				{
					manual: true,
					initialData: { id: 0 },
				},
			),
		)

		expect(result.current.data).toEqual({ id: 0 })
	})

	it('应该能够取消请求', async () => {
		setupAxiosMock()

		const mockCancel = vi.fn()
		vi.mocked(await import('../../utils/axios-cancel')).axiosCanceler = {
			removeAllPending: mockCancel,
		} as any

		const { result } = renderHook(() =>
			useRequest({ url: '/api/test', method: 'GET' }, { manual: true }),
		)

		result.current.cancel()

		expect(mockCancel).toHaveBeenCalledTimes(1)
		expect(result.current.loading).toBe(false)
	})

	it('应该能够重置状态', () => {
		setupAxiosMock()

		const { result } = renderHook(() =>
			useRequest(
				{ url: '/api/test', method: 'GET' },
				{
					manual: true,
					initialData: { id: 0 },
				},
			),
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

	it('应该支持 run 别名', async () => {
		const mockAxiosInstance = setupAxiosMock()
		const mockRequest = vi.fn().mockResolvedValue({
			status: true,
			msg: 'success',
			code: 200,
			data: {},
		})
		mockAxiosInstance.request = mockRequest

		const { result } = renderHook(() =>
			useRequest({ url: '/api/test', method: 'GET' }, { manual: true }),
		)

		await result.current.run()

		expect(mockRequest).toHaveBeenCalledTimes(1)
	})

	it('应该支持 refresh 别名', async () => {
		const mockAxiosInstance = setupAxiosMock()
		const mockRequest = vi.fn().mockResolvedValue({
			status: true,
			msg: 'success',
			code: 200,
			data: {},
		})
		mockAxiosInstance.request = mockRequest

		const { result } = renderHook(() =>
			useRequest({ url: '/api/test', method: 'GET' }, { manual: true }),
		)

		await result.current.refresh()

		expect(mockRequest).toHaveBeenCalledTimes(1)
	})
})

describe('usePost', () => {
	beforeEach(() => {
		resetMocks()
	})

	it('应该自动执行 POST 请求', async () => {
		setupAxiosMock()

		const { result } = renderHook(() =>
			usePost('/api/users', {
				data: { name: 'test' },
				immediate: true,
			}),
		)

		await vi.waitFor(() => {
			return result.current.loading === false
		})

		expect(result.current.loading).toBe(false)
	})
})

describe('useGet', () => {
	beforeEach(() => {
		resetMocks()
	})

	it('应该自动执行 GET 请求', async () => {
		setupAxiosMock()

		const { result } = renderHook(() =>
			useGet('/api/users', { immediate: true }),
		)

		await vi.waitFor(() => {
			return result.current.loading === false
		})

		expect(result.current.loading).toBe(false)
	})
})

describe('useLazyRequest', () => {
	beforeEach(() => {
		resetMocks()
	})

	it('应该返回手动控制的 hook', async () => {
		const mockAxiosInstance = setupAxiosMock()
		const mockRequest = vi.fn().mockResolvedValue({
			status: true,
			msg: 'success',
			code: 200,
			data: {},
		})
		mockAxiosInstance.request = mockRequest

		const { result } = renderHook(() =>
			useLazyRequest({ url: '/api/test', method: 'GET' }),
		)

		// 初始状态应该是未加载
		expect(result.current.loading).toBe(false)

		// 手动执行
		await result.current.execute()

		expect(mockRequest).toHaveBeenCalledTimes(1)
	})
})

describe('useLazyPost', () => {
	beforeEach(() => {
		resetMocks()
	})

	it('应该支持手动控制 POST 请求', async () => {
		const mockAxiosInstance = setupAxiosMock()
		const mockRequest = vi.fn().mockResolvedValue({
			status: true,
			msg: 'success',
			code: 200,
			data: {},
		})
		mockAxiosInstance.request = mockRequest

		const { result } = renderHook(() =>
			useLazyPost('/api/users', {
				data: { name: 'test' },
			}),
		)

		await result.current.execute({ data: { name: 'updated' } })

		expect(mockRequest).toHaveBeenCalledTimes(1)
	})
})

describe('useLazyGet', () => {
	beforeEach(() => {
		resetMocks()
	})

	it('应该支持手动控制 GET 请求', async () => {
		const mockAxiosInstance = setupAxiosMock()
		const mockRequest = vi.fn().mockResolvedValue({
			status: true,
			msg: 'success',
			code: 200,
			data: {},
		})
		mockAxiosInstance.request = mockRequest

		const { result } = renderHook(() =>
			useLazyGet('/api/users'),
		)

		await result.current.execute()

		expect(mockRequest).toHaveBeenCalledTimes(1)
	})
})
