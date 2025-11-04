/**
 * 测试 useAxios Hook
 */

import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAxios } from '../../hooks/useAxios'

// Mock HttpRequest
vi.mock('../../utils/axios-instance', () => {
	return {
		HttpRequest: vi.fn().mockImplementation(() => ({
			get: vi.fn(),
			post: vi.fn(),
			request: vi.fn(),
		})),
	}
})

describe('useAxios', () => {
	it('应该返回一个包含 get、post 和 request 方法的对象', () => {
		const { result } = renderHook(() => useAxios())

		expect(result.current).toHaveProperty('get')
		expect(result.current).toHaveProperty('post')
		expect(result.current).toHaveProperty('request')
		expect(typeof result.current.get).toBe('function')
		expect(typeof result.current.post).toBe('function')
		expect(typeof result.current.request).toBe('function')
	})

	it('get 方法应该返回 Promise', async () => {
		const { result } = renderHook(() => useAxios())

		const mockPromise = Promise.resolve({
			status: true,
			msg: 'success',
			code: 200,
			data: { id: 1 },
		})

		// @ts-ignore
		result.current.get.mockReturnValue(mockPromise)

		const promise = result.current.get('/test')

		expect(promise).toBeInstanceOf(Promise)
	})

	it('post 方法应该返回 Promise', async () => {
		const { result } = renderHook(() => useAxios())

		const mockPromise = Promise.resolve({
			status: true,
			msg: 'success',
			code: 200,
			data: { id: 1 },
		})

		// @ts-ignore
		result.current.post.mockReturnValue(mockPromise)

		const promise = result.current.post('/test')

		expect(promise).toBeInstanceOf(Promise)
	})

	it('request 方法应该返回 Promise', async () => {
		const { result } = renderHook(() => useAxios())

		const mockPromise = Promise.resolve({
			status: true,
			msg: 'success',
			code: 200,
			data: { id: 1 },
		})

		// @ts-ignore
		result.current.request.mockReturnValue(mockPromise)

		const promise = result.current.request({
			url: '/test',
			method: 'GET',
		})

		expect(promise).toBeInstanceOf(Promise)
	})

	it('应该在每次调用时返回同一个实例', () => {
		const { result, rerender } = renderHook(() => useAxios())

		const firstInstance = result.current

		rerender()

		const secondInstance = result.current

		// 验证是同一个对象引用（因为使用了 useMemo）
		expect(firstInstance).toBe(secondInstance)
	})
})
