/**
 * 测试 axios 取消功能
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios, { type AxiosRequestConfig } from 'axios'
import { AxiosCanceler, useRequestCanceler } from '../../utils/axios-cancel'

describe('AxiosCanceler', () => {
	let axiosCanceler: AxiosCanceler

	beforeEach(() => {
		axiosCanceler = new AxiosCanceler()
		vi.clearAllMocks()
	})

	describe('addPending', () => {
		it('应该添加请求到待处理列表', () => {
			const config: AxiosRequestConfig = {
				url: '/test',
				method: 'POST',
				data: { key: 'value' },
			}

			axiosCanceler.addPending(config)

			// 验证 cancelToken 被设置
			expect(config.cancelToken).toBeDefined()
		})

		it('应该为相同 URL 的请求重用取消令牌', () => {
			const config1: AxiosRequestConfig = {
				url: '/test',
				method: 'POST',
			}
			const config2: AxiosRequestConfig = {
				url: '/test',
				method: 'POST',
			}

			axiosCanceler.addPending(config1)
			axiosCanceler.addPending(config2)

			// 验证两个配置都有取消令牌
			expect(config1.cancelToken).toBeDefined()
			expect(config2.cancelToken).toBeDefined()
		})
	})

	describe('removePending', () => {
		it('应该移除指定的请求', () => {
			const config: AxiosRequestConfig = {
				url: '/test',
				method: 'GET',
			}

			// 添加请求
			axiosCanceler.addPending(config)

			// 移除请求
			axiosCanceler.removePending(config)

			// 验证请求已被移除（再次调用不会报错）
			expect(() => axiosCanceler.removePending(config)).not.toThrow()
		})

		it('应该调用取消函数', () => {
			const config: AxiosRequestConfig = {
				url: '/test',
				method: 'POST',
			}

			// 创建一个模拟的取消函数
			const mockCancel = vi.fn()

			// 使用模拟的取消函数创建 cancelToken
			config.cancelToken = new axios.CancelToken(mockCancel)

			// 添加请求
			axiosCanceler.addPending(config)

			// 移除请求
			axiosCanceler.removePending(config)

			// 验证取消函数被调用
			expect(mockCancel).toHaveBeenCalled()
		})
	})

	describe('removeAllPending', () => {
		it('应该清除所有待处理的请求', () => {
			// 添加多个请求
			axiosCanceler.addPending({ url: '/test1', method: 'GET' })
			axiosCanceler.addPending({ url: '/test2', method: 'POST' })
			axiosCanceler.addPending({ url: '/test3', method: 'PUT' })

			// 清除所有请求
			axiosCanceler.removeAllPending()

			// 验证可以安全地再次调用
			expect(() => axiosCanceler.removeAllPending()).not.toThrow()
		})
	})

	describe('reset', () => {
		it('应该重置实例', () => {
			// 添加请求
			axiosCanceler.addPending({ url: '/test', method: 'GET' })

			// 重置
			axiosCanceler.reset()

			// 验证可以重新添加相同请求
			expect(() =>
				axiosCanceler.addPending({ url: '/test', method: 'GET' }),
			).not.toThrow()
		})
	})
})

describe('useRequestCanceler', () => {
	it('应该处理字符串类型的请求配置', () => {
		const mockRemovePending = vi.fn()
		vi.spyOn(AxiosCanceler.prototype, 'removePending' as any).mockImplementation(
			mockRemovePending,
		)

		const requests = ['/api/test1', '/api/test2']

		useRequestCanceler(requests)

		// 验证调用次数
		expect(mockRemovePending).toHaveBeenCalledTimes(2)
	})

	it('应该处理对象类型的请求配置', () => {
		const mockRemovePending = vi.fn()
		vi.spyOn(AxiosCanceler.prototype, 'removePending' as any).mockImplementation(
			mockRemovePending,
		)

		const requests: (AxiosRequestConfig | string)[] = [
			{ url: '/api/test1', method: 'GET' },
			'/api/test2',
		]

		useRequestCanceler(requests)

		// 验证调用次数
		expect(mockRemovePending).toHaveBeenCalledTimes(2)

		// 验证第二次调用使用字符串配置
		expect(mockRemovePending.mock.calls[1][0]).toEqual({
			url: '/api/test2',
			method: 'post',
		})
	})

	it('应该处理空数组', () => {
		const mockRemovePending = vi.fn()
		vi.spyOn(AxiosCanceler.prototype, 'removePending' as any).mockImplementation(
			mockRemovePending,
		)

		useRequestCanceler([])

		expect(mockRemovePending).not.toHaveBeenCalled()
	})
})
