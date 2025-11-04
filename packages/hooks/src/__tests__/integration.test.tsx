/**
 * 集成测试 - 多个 Hooks 协作使用
 */

import { describe, it, expect, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import {
	useRequest,
	useLazyRequest,
	useErrorHandler,
	usePreload,
} from '../hooks'

// Mock HttpRequest
vi.mock('../utils/axios-instance', () => {
	return {
		HttpRequest: vi.fn().mockImplementation(() => ({
			request: vi.fn(),
		})),
	}
})

describe('集成测试 - 用户管理流程', () => {
	it('应该完成完整的用户登录流程', async () => {
		// 步骤 1: 登录
		const { result: loginResult } = renderHook(() =>
			useLazyPost('/api/login'),
		)

		// 模拟登录成功
		const mockRequest = vi
			.fn()
			.mockResolvedValueOnce({
				status: true,
				data: { token: 'abc123', user: { id: 1, name: 'Test User' } },
				code: 200,
			})
			.mockResolvedValueOnce({
				// 步骤 2: 获取用户信息
				status: true,
				data: { id: 1, name: 'Test User', email: 'test@example.com' },
				code: 200,
			})

		vi.mocked(require('../utils/axios-instance').HttpRequest).mockImplementation(
			() => ({
				request: mockRequest,
			}),
		)

		// 执行登录
		await act(async () => {
			await loginResult.current.run({ data: { username: 'admin', password: '123456' } })
		})

		expect(loginResult.current.data).toEqual({
			token: 'abc123',
			user: { id: 1, name: 'Test User' },
		})

		// 步骤 2: 获取用户信息
		const { result: profileResult } = renderHook(() =>
			useRequest({ url: '/api/profile', method: 'GET' }, { manual: true }),
		)

		await act(async () => {
			await profileResult.current.execute()
		})

		expect(profileResult.current.data).toEqual({
			id: 1,
			name: 'Test User',
			email: 'test@example.com',
		})
	})

	it('应该处理登录失败并重试', async () => {
		const { handleError } = renderHook(() =>
			useErrorHandler({ showError: false }),
		).result.current

		const { result } = renderHook(() =>
			useLazyPost('/api/login', { manual: true }),
		)

		// 模拟第一次登录失败
		// @ts-ignore
		const mockRequest = vi
			.fn()
			.mockRejectedValueOnce(new Error('Invalid credentials'))
			.mockResolvedValueOnce({
				status: true,
				data: { token: 'xyz789' },
				code: 200,
			})

		vi.mocked(require('../utils/axios-instance').HttpRequest).mockImplementation(
			() => ({
				request: mockRequest,
			}),
		)

		// 第一次登录
		await act(async () => {
			try {
				await result.current.run({ data: { username: 'admin', password: 'wrong' } })
			} catch (err) {
				handleError(err as Error)
			}
		})

		expect(result.current.error).toBeInstanceOf(Error)

		// 重试登录
		await act(async () => {
			await result.current.run({ data: { username: 'admin', password: 'correct' } })
		})

		expect(result.current.data).toEqual({ token: 'xyz789' })
	})
})

describe('集成测试 - 文件上传流程', () => {
	it('应该完成文件上传和进度追踪', async () => {
		const { result } = renderHook(() =>
			useLazyPost('/api/upload', { manual: true }),
		)

		// 模拟上传成功
		// @ts-ignore
		const mockRequest = vi.fn().mockResolvedValue({
			status: true,
			data: { url: '/uploads/file.pdf', id: '123' },
			code: 200,
		})

		vi.mocked(require('../utils/axios-instance').HttpRequest).mockImplementation(
			() => ({
				request: mockRequest,
			}),
		)

		await act(async () => {
			await result.current.run({
				data: { file: 'test.pdf', content: 'file data' },
			})
		})

		expect(result.current.data).toEqual({
			url: '/uploads/file.pdf',
			id: '123',
		})

		// 验证请求参数
		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				url: '/api/upload',
				method: 'POST',
			}),
		)
	})
})

describe('集成测试 - 分页数据加载', () => {
	it('应该处理分页请求', async () => {
		const { result } = renderHook(() =>
			useRequest(
				({ page }: any) => ({
					url: `/api/users?page=${page}`,
					method: 'GET',
				}),
				{ manual: true, initialData: [] },
			),
		)

		// 模拟第一页数据
		// @ts-ignore
		const mockRequest = vi
			.fn()
			.mockResolvedValueOnce({
				status: true,
				data: [
					{ id: 1, name: 'User 1' },
					{ id: 2, name: 'User 2' },
				],
				code: 200,
			})
			.mockResolvedValueOnce({
				// 第二页数据
				status: true,
				data: [
					{ id: 3, name: 'User 3' },
					{ id: 4, name: 'User 4' },
				],
				code: 200,
			})

		vi.mocked(require('../utils/axios-instance').HttpRequest).mockImplementation(
			() => ({
				request: mockRequest,
			}),
		)

		// 加载第一页
		await act(async () => {
			await result.current.execute({ page: 1 })
		})

		expect(result.current.data).toHaveLength(2)

		// 加载第二页
		await act(async () => {
			await result.current.execute({ page: 2 })
		})

		expect(result.current.data).toHaveLength(2)
		expect(result.current.data[0]).toEqual({ id: 3, name: 'User 3' })
	})
})

describe('集成测试 - 搜索防抖', () => {
	it('应该处理防抖搜索请求', async () => {
		const { result } = renderHook(() =>
			useRequest(
				({ query }: any) => ({
					url: `/api/search?q=${query}`,
					method: 'GET',
				}),
				{ manual: true, initialData: [] },
			),
		)

		// 模拟搜索结果
		// @ts-ignore
		const mockRequest = vi.fn().mockResolvedValue({
			status: true,
			data: [
				{ id: 1, title: 'Result 1' },
				{ id: 2, title: 'Result 2' },
			],
			code: 200,
		})

		vi.mocked(require('../utils/axios-instance').HttpRequest).mockImplementation(
			() => ({
				request: mockRequest,
			}),
		)

		await act(async () => {
			await result.current.execute({ query: 'test' })
		})

		expect(result.current.data).toHaveLength(2)
		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				url: '/api/search?q=test',
			}),
		)
	})
})

describe('集成测试 - 购物车操作', () => {
	it('应该处理添加商品到购物车', async () => {
		const { result: addResult } = renderHook(() =>
			useLazyPost('/api/cart/add', { manual: true }),
		)

		const { result: cartResult } = renderHook(() =>
			useRequest({ url: '/api/cart', method: 'GET' }, { manual: true }),
		)

		// 模拟添加商品成功
		// @ts-ignore
		const mockRequest = vi
			.fn()
			.mockResolvedValueOnce({
				status: true,
				data: { success: true },
				code: 200,
			})
			.mockResolvedValueOnce({
				// 获取购物车
				status: true,
				data: { items: [{ id: 1, name: 'Product', quantity: 1 }] },
				code: 200,
			})

		vi.mocked(require('../utils/axios-instance').HttpRequest).mockImplementation(
			() => ({
				request: mockRequest,
			}),
		)

		// 添加商品
		await act(async () => {
			await addResult.current.run({
				data: { productId: 1, quantity: 1 },
			})
		})

		expect(addResult.current.data).toEqual({ success: true })

		// 刷新购物车
		await act(async () => {
			await cartResult.current.execute()
		})

		expect(cartResult.current.data).toEqual({
			items: [{ id: 1, name: 'Product', quantity: 1 }],
		})
	})
})

describe('集成测试 - 实时数据轮询', () => {
	it('应该支持定时轮询', async () => {
		const { result } = renderHook(() =>
			useRequest(
				{ url: '/api/status', method: 'GET' },
				{ manual: true, immediate: false },
			),
		)

		// 模拟状态变化
		// @ts-ignore
		const mockRequest = vi
			.fn()
			.mockResolvedValueOnce({
				status: true,
				data: { status: 'pending' },
				code: 200,
			})
			.mockResolvedValueOnce({
				status: true,
				data: { status: 'completed' },
				code: 200,
			})

		vi.mocked(require('../utils/axios-instance').HttpRequest).mockImplementation(
			() => ({
				request: mockRequest,
			}),
		)

		// 第一次检查
		await act(async () => {
			await result.current.execute()
		})

		expect(result.current.data).toEqual({ status: 'pending' })

		// 第二次检查
		await act(async () => {
			await result.current.execute()
		})

		expect(result.current.data).toEqual({ status: 'completed' })
	})
})

describe('集成测试 - 批量操作', () => {
	it('应该处理批量删除', async () => {
		const { result } = renderHook(() =>
			useLazyPost('/api/items/batch-delete', { manual: true }),
		)

		// 模拟批量删除成功
		// @ts-ignore
		const mockRequest = vi.fn().mockResolvedValue({
			status: true,
			data: { deleted: 5 },
			code: 200,
		})

		vi.mocked(require('../utils/axios-instance').HttpRequest).mockImplementation(
			() => ({
				request: mockRequest,
			}),
		)

		await act(async () => {
			await result.current.run({
				data: { ids: [1, 2, 3, 4, 5] },
			})
		})

		expect(result.current.data).toEqual({ deleted: 5 })
	})
})

describe('集成测试 - 网络错误重试', () => {
	it('应该自动重试失败的请求', async () => {
		const { result } = renderHook(() =>
			useRequest({ url: '/api/data', method: 'GET' }, { manual: true }),
		)

		// 模拟网络错误后成功
		// @ts-ignore
		const mockRequest = vi
			.fn()
			.mockRejectedValueOnce(new Error('Network Error'))
			.mockResolvedValueOnce({
				status: true,
				data: { items: [1, 2, 3] },
				code: 200,
			})

		vi.mocked(require('../utils/axios-instance').HttpRequest).mockImplementation(
			() => ({
				request: mockRequest,
			}),
		)

		// 第一次请求失败
		await act(async () => {
			try {
				await result.current.execute()
			} catch (err) {
				// 忽略错误
			}
		})

		expect(result.current.error).toBeInstanceOf(Error)

		// 重试
		await act(async () => {
			await result.current.execute()
		})

		expect(result.current.data).toEqual({ items: [1, 2, 3] })
	})
})

describe('集成测试 - 并发请求处理', () => {
	it('应该处理多个并发请求', async () => {
		const { result: result1 } = renderHook(() =>
			useRequest({ url: '/api/data1', method: 'GET' }, { manual: true }),
		)
		const { result: result2 } = renderHook(() =>
			useRequest({ url: '/api/data2', method: 'GET' }, { manual: true }),
		)
		const { result: result3 } = renderHook(() =>
			useRequest({ url: '/api/data3', method: 'GET' }, { manual: true }),
		)

		// 模拟并发请求
		// @ts-ignore
		const mockRequest = vi.fn().mockImplementation((config) => {
			return Promise.resolve({
				status: true,
				data: { url: config.url },
				code: 200,
			})
		})

		vi.mocked(require('../utils/axios-instance').HttpRequest).mockImplementation(
			() => ({
				request: mockRequest,
			}),
		)

		// 并发执行
		await act(async () => {
			await Promise.all([
				result1.current.execute(),
				result2.current.execute(),
				result3.current.execute(),
			])
		})

		// 验证所有请求都成功
		expect(result1.current.data).toEqual({ url: '/api/data1' })
		expect(result2.current.data).toEqual({ url: '/api/data2' })
		expect(result3.current.data).toEqual({ url: '/api/data3' })

		// 验证请求顺序
		expect(mockRequest).toHaveBeenCalledTimes(3)
	})
})

describe('集成测试 - 文件预加载与资源加载', () => {
	it('应该先预加载资源再发起请求', async () => {
		const { result: preloadResult } = renderHook(() =>
			usePreload({ onComplete: vi.fn() }),
		)

		const { result: dataResult } = renderHook(() =>
			useRequest({ url: '/api/data', method: 'GET' }, { manual: true }),
		)

		// 模拟文件预加载
		const mockAxios = vi.mocked(require('axios').default)
		mockAxios.get.mockResolvedValue({ data: {} })
		sessionStorage.getItem.mockReturnValue('[]')

		// 模拟数据请求
		// @ts-ignore
		const mockRequest = vi.fn().mockResolvedValue({
			status: true,
			data: { ready: true },
			code: 200,
		})

		vi.mocked(require('../utils/axios-instance').HttpRequest).mockImplementation(
			() => ({
				request: mockRequest,
			}),
		)

		// 先预加载资源
		await act(async () => {
			await preloadResult.current.loadFile(['vendor.js', 'app.css'])
		})

		// 再加载数据
		await act(async () => {
			await dataResult.current.execute()
		})

		// 验证资源已加载
		expect(preloadResult.current.loaded).toBe(2)

		// 验证数据已加载
		expect(dataResult.current.data).toEqual({ ready: true })
	})
})

describe('集成测试 - 错误边界与恢复', () => {
	it('应该在错误后恢复应用状态', async () => {
		const { result: errorHandler } = renderHook(() =>
			useErrorHandler({ showError: false }),
		)

		const { result: dataResult } = renderHook(() =>
			useRequest({ url: '/api/data', method: 'GET' }, { manual: true }),
		)

		// 模拟错误
		// @ts-ignore
		const mockRequest = vi.fn().mockRejectedValue(new Error('Server Error'))

		vi.mocked(require('../utils/axios-instance').HttpRequest).mockImplementation(
			() => ({
				request: mockRequest,
			}),
		)

		// 发起请求
		await act(async () => {
			try {
				await dataResult.current.execute()
			} catch (err) {
				errorHandler.current.handleError(err as Error)
			}
		})

		// 验证错误被记录
		expect(errorHandler.current.errors).toHaveLength(1)

		// 模拟恢复（错误解决）
		mockRequest.mockResolvedValueOnce({
			status: true,
			data: { recovered: true },
			code: 200,
		})

		// 重试请求
		await act(async () => {
			await dataResult.current.execute()
		})

		// 清理错误
		act(() => {
			errorHandler.current.clearErrors()
		})

		expect(errorHandler.current.errors).toHaveLength(0)
		expect(dataResult.current.data).toEqual({ recovered: true })
	})
})
