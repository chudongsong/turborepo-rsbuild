/**
 * useAxios Hook 测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, setupAxiosMock, setupAxiosErrorMock, resetMocks } from '../../test-utils'
import { useAxios } from '../useAxios'

describe('useAxios', () => {
	beforeEach(() => {
		resetMocks()
		vi.clearAllTimers()
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('应该返回 axios 实例', () => {
		setupAxiosMock()
		const { result } = renderHook(() => useAxios())

		expect(result.current).toHaveProperty('get')
		expect(result.current).toHaveProperty('post')
		expect(result.current).toHaveProperty('request')
		expect(typeof result.current.get).toBe('function')
		expect(typeof result.current.post).toBe('function')
		expect(typeof result.current.request).toBe('function')
	})

	it('应该能够发起 GET 请求', async () => {
		const mockGet = vi.fn().mockResolvedValue({
			status: true,
			msg: 'success',
			code: 200,
			data: { id: 1, name: 'test' },
		})

		const mockAxiosInstance = setupAxiosMock()
		mockAxiosInstance.get = mockGet

		const { result } = renderHook(() => useAxios())

		const response = await result.current.get('/api/users')

		expect(mockGet).toHaveBeenCalledTimes(1)
		expect(response).toHaveProperty('status', true)
	})

	it('应该能够发起 POST 请求', async () => {
		const mockPost = vi.fn().mockResolvedValue({
			status: true,
			msg: 'success',
			code: 200,
			data: { id: 1 },
		})

		const mockAxiosInstance = setupAxiosMock()
		mockAxiosInstance.post = mockPost

		const { result } = renderHook(() => useAxios())

		const response = await result.current.post('/api/login', {
			data: { username: 'admin', password: '123456' },
		})

		expect(mockPost).toHaveBeenCalledTimes(1)
		expect(response).toHaveProperty('status', true)
	})

	it('应该处理请求错误', async () => {
		const error = new Error('Network Error')
		const mockAxiosInstance = setupAxiosErrorMock(error)

		const { result } = renderHook(() => useAxios())

		await expect(result.current.post('/api/test')).rejects.toThrow('Network Error')
	})

	it('应该支持自定义配置', async () => {
		const mockRequest = vi.fn().mockResolvedValue({
			status: true,
			msg: 'success',
			code: 200,
			data: {},
		})

		const mockAxiosInstance = setupAxiosMock()
		mockAxiosInstance.request = mockRequest

		const { result } = renderHook(() => useAxios())

		await result.current.request({
			url: '/api/custom',
			method: 'GET',
			loading: '加载中...',
		})

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				url: '/api/custom',
				method: 'GET',
			}),
		)
	})

	it('应该处理成功响应', async () => {
		const mockResponseData = {
			status: true,
			msg: 'success',
			code: 200,
			data: { id: 1, name: 'test' },
		}

		const mockAxiosInstance = setupAxiosMock({
			data: mockResponseData,
		})

		const { result } = renderHook(() => useAxios())

		const response = await result.current.get('/api/data')

		expect(response).toHaveProperty('status', true)
		expect(response).toHaveProperty('msg', 'success')
		expect(response).toHaveProperty('code', 200)
	})

	it('应该处理带字符串配置的请求', async () => {
		const mockGet = vi.fn().mockResolvedValue({
			status: true,
			msg: 'success',
			code: 200,
			data: {},
		})

		const mockAxiosInstance = setupAxiosMock()
		mockAxiosInstance.get = mockGet

		const { result } = renderHook(() => useAxios())

		await result.current.get('/api/test', 'default')

		expect(mockGet).toHaveBeenCalled()
	})

	it('应该处理带函数配置的请求', async () => {
		const mockGet = vi.fn().mockResolvedValue({
			status: true,
			msg: 'success',
			code: 200,
			data: {},
		})

		const mockAxiosInstance = setupAxiosMock()
		mockAxiosInstance.get = mockGet

		const { result } = renderHook(() => useAxios())

		await result.current.get('/api/test', (data) => data)

		expect(mockGet).toHaveBeenCalled()
	})
})
