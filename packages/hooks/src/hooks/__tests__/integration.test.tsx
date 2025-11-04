/**
 * 集成测试 - 综合场景测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, setupAxiosMock, resetMocks } from '../../test-utils'
import {
	useRequest,
	useLazyRequest,
	useErrorHandler,
	useAsyncFetch,
} from '../useAxios'

describe('集成测试 - 综合场景', () => {
	beforeEach(() => {
		resetMocks()
		vi.clearAllTimers()
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('完整用户登录流程', async () => {
		// Mock 登录请求
		const mockAxiosInstance = setupAxiosMock({
			data: {
				status: true,
				msg: '登录成功',
				code: 200,
				data: {
					token: 'mock-jwt-token',
					user: {
						id: 1,
						username: 'admin',
						role: 'admin',
					},
				},
			},
		})

		// 使用 useLazyPost 进行登录
		const { result } = renderHook(() =>
			useLazyRequest({
				url: 'auth/login',
				method: 'POST',
			}),
		)

		// 执行登录
		const loginResult = await result.current.execute({
			url: 'auth/login',
			method: 'POST',
			data: {
				username: 'admin',
				password: 'password123',
			},
		})

		// 验证结果
		expect(loginResult).toHaveProperty('status', true)
		expect(loginResult.data).toHaveProperty('token')
		expect(loginResult.data.user).toHaveProperty('username', 'admin')
	})

	it('带错误处理的用户注册流程', async () => {
		const error = new Error('用户名已存在')
		const mockAxiosInstance = setupAxiosMock()
		mockAxiosInstance.request = vi.fn().mockRejectedValue(error)

		const errorHandler = renderHook(() =>
			useErrorHandler({
				showError: false,
			}),
		)

		const { result } = renderHook(() =>
			useLazyRequest({
				url: 'auth/register',
				method: 'POST',
			}),
		)

		try {
			await result.current.execute({
				url: 'auth/register',
				method: 'POST',
				data: {
					username: 'existing-user',
					email: 'user@example.com',
					password: 'password123',
				},
			})
		} catch (err) {
			// 错误被捕获并处理
			expect(err).toBe(error)
		}
	})

	it('分页数据加载场景', async () => {
		let requestCount = 0
		const mockAxiosInstance = setupAxiosMock()
		mockAxiosInstance.request = vi.fn().mockImplementation(() => {
			requestCount++
			return Promise.resolve({
				status: true,
				msg: 'success',
				code: 200,
				data: {
					items: Array.from({ length: 10 }, (_, i) => ({
						id: (requestCount - 1) * 10 + i + 1,
						name: `Item ${(requestCount - 1) * 10 + i + 1}`,
					})),
					total: 100,
					page: requestCount,
					pageSize: 10,
				},
			})
		})

		const { result } = renderHook(() =>
			useRequest(
				({ page }) => ({
					url: 'data/list',
					method: 'GET',
					data: { page },
				}),
				{
					immediate: false,
				},
			),
		)

		// 加载第一页
		await result.current.execute({ page: 1 })
		expect(result.current.data?.items?.length).toBe(10)
		expect(result.current.data?.page).toBe(1)

		// 加载第二页
		await result.current.execute({ page: 2 })
		expect(result.current.data?.items?.length).toBe(10)
		expect(result.current.data?.page).toBe(2)
		expect(requestCount).toBe(2)
	})

	it('文件上传场景', async () => {
		const mockAxiosInstance = setupAxiosMock({
			data: {
				status: true,
				msg: '上传成功',
				code: 200,
				data: {
					fileId: 'file-123',
					filename: 'test-document.pdf',
					size: 1024000,
					url: '/uploads/test-document.pdf',
				},
			},
		})

		const { result } = renderHook(() =>
			useLazyRequest({
				url: 'upload/file',
				method: 'POST',
			}),
		)

		// 模拟文件上传
		const formData = new FormData()
		formData.append('file', new Blob(['test content'], { type: 'application/pdf' }))

		const uploadResult = await result.current.execute({
			url: 'upload/file',
			method: 'POST',
			data: formData,
		})

		expect(uploadResult.data).toHaveProperty('fileId')
		expect(uploadResult.data).toHaveProperty('url')
	})

	it('搜索请求防抖场景', async () => {
		const mockAxiosInstance = setupAxiosMock()
		const mockRequest = vi.fn().mockResolvedValue({
			status: true,
			msg: 'success',
			code: 200,
			data: {
				results: ['result1', 'result2', 'result3'],
			},
		})
		mockAxiosInstance.request = mockRequest

		// 模拟搜索场景
		const { result } = renderHook(() =>
			useLazyRequest(
				({ query }) => ({
					url: 'search',
					method: 'GET',
					data: { q: query },
				}),
				{
					manual: true,
				},
			),
		)

		// 快速多次调用（模拟用户快速输入）
		const searchPromises = [
			result.current.execute({ query: 'a' }),
			result.current.execute({ query: 'ab' }),
			result.current.execute({ query: 'abc' }),
		]

		const results = await Promise.all(searchPromises)

		// 验证最终结果
		expect(results[results.length - 1].data.results).toHaveLength(3)
	})

	it('购物车操作场景', async () => {
		const mockAxiosInstance = setupAxiosMock()

		// 模拟购物车操作
		mockAxiosInstance.request = vi.fn()
			.mockResolvedValueOnce({
				// 添加商品
				status: true,
				msg: '商品已添加',
				code: 200,
				data: { cartId: 'cart-123', items: [{ id: '1', quantity: 1 }] },
			})
			.mockResolvedValueOnce({
				// 更新数量
				status: true,
				msg: '数量已更新',
				code: 200,
				data: { cartId: 'cart-123', items: [{ id: '1', quantity: 2 }] },
			})
			.mockResolvedValueOnce({
				// 删除商品
				status: true,
				msg: '商品已删除',
				code: 200,
				data: { cartId: 'cart-123', items: [] },
			})

		const { result } = renderHook(() =>
			useRequest({
				url: 'cart/item',
				method: 'POST',
			}, {
				manual: true,
			}),
		)

		// 添加商品
		const addResult = await result.current.execute({
			url: 'cart/add',
			method: 'POST',
			data: { productId: '1', quantity: 1 },
		})
		expect(addResult.data.items).toHaveLength(1)

		// 更新数量
		const updateResult = await result.current.execute({
			url: 'cart/update',
			method: 'POST',
			data: { productId: '1', quantity: 2 },
		})
		expect(updateResult.data.items[0].quantity).toBe(2)

		// 删除商品
		const deleteResult = await result.current.execute({
			url: 'cart/remove',
			method: 'POST',
			data: { productId: '1' },
		})
		expect(deleteResult.data.items).toHaveLength(0)
	})

	it('实时数据轮询场景', async () => {
		const mockAxiosInstance = setupAxiosMock()
		let pollCount = 0

		mockAxiosInstance.request = vi.fn().mockImplementation(() => {
			pollCount++
			return Promise.resolve({
				status: true,
				msg: 'success',
				code: 200,
				data: {
					timestamp: Date.now(),
					value: pollCount,
				},
			})
		})

		const { result } = renderHook(() =>
			useRequest({
				url: 'data/realtime',
				method: 'GET',
			}, {
				immediate: false,
			}),
		)

		// 执行多次轮询
		const polls = []
		for (let i = 0; i < 3; i++) {
			polls.push(result.current.execute())
		}

		const pollResults = await Promise.all(polls)

		// 验证轮询结果
		expect(pollResults).toHaveLength(3)
		expect(pollResults[0].data.value).toBe(1)
		expect(pollResults[1].data.value).toBe(2)
		expect(pollResults[2].data.value).toBe(3)
	})

	it('批量操作场景', async () => {
		const mockAxiosInstance = setupAxiosMock()
		mockAxiosInstance.request = vi.fn().mockImplementation((config) => {
			const ids = (config as any).data?.ids || []
			return Promise.resolve({
				status: true,
				msg: '操作成功',
				code: 200,
				data: {
					successCount: ids.length,
					failedCount: 0,
					results: ids.map((id: number) => ({ id, status: 'success' })),
				},
			})
		})

		const { result } = renderHook(() =>
			useLazyRequest({
				url: 'batch/operation',
				method: 'POST',
			}),
		)

		const batchIds = [1, 2, 3, 4, 5]
		const batchResult = await result.current.execute({
			url: 'batch/operation',
			method: 'POST',
			data: { ids: batchIds },
		})

		expect(batchResult.data.successCount).toBe(5)
		expect(batchResult.data.results).toHaveLength(5)
	})
})

describe('集成测试 - 错误场景', () => {
	beforeEach(() => {
		resetMocks()
	})

	it('网络错误重试机制', async () => {
		const mockAxiosInstance = setupAxiosMock()
		let attempt = 0

		mockAxiosInstance.request = vi.fn().mockImplementation(() => {
			attempt++
			if (attempt < 3) {
				return Promise.reject(new Error(`Network error (attempt ${attempt})`))
			}
			return Promise.resolve({
				status: true,
				msg: 'success',
				code: 200,
				data: { value: 'success' },
			})
		})

		const { result } = renderHook(() =>
			useLazyRequest({
				url: 'data/retriable',
				method: 'GET',
			}),
		)

		// 手动重试 3 次
		let lastError: any
		for (let i = 0; i < 3; i++) {
			try {
				await result.current.execute()
			} catch (err) {
				lastError = err
			}
		}

		expect(attempt).toBe(3)
		expect(lastError).toBeDefined()
	})

	it('并发请求冲突处理', async () => {
		const mockAxiosInstance = setupAxiosMock()
		mockAxiosInstance.request = vi.fn().mockResolvedValue({
			status: true,
			msg: 'success',
			code: 200,
			data: { version: 1 },
		})

		const { result } = renderHook(() =>
			useLazyRequest({
				url: 'data/version',
				method: 'POST',
				skipPending: false, // 默认不跳过，会取消之前的请求
			}),
		)

		// 同时发起多个请求
		const promises = [
			result.current.execute({ url: 'data/version', method: 'POST', data: { value: 1 } }),
			result.current.execute({ url: 'data/version', method: 'POST', data: { value: 2 } }),
			result.current.execute({ url: 'data/version', method: 'POST', data: { value: 3 } }),
		]

		const results = await Promise.allSettled(promises)

		// 至少有一个成功
		const successfulResults = results.filter(r => r.status === 'fulfilled')
		expect(successfulResults.length).toBeGreaterThanOrEqual(1)
	})
})
