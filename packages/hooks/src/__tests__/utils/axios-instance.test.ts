/**
 * 测试 HttpRequest 类
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios, { type AxiosResponse } from 'axios'
import { HttpRequest } from '../../utils/axios-instance'
import type { RequestConfig } from '../../types/axios'

// Mock axios
vi.mock('axios', () => {
	return {
		default: {
			create: vi.fn(() => ({
				interceptors: {
					request: {
						use: vi.fn((onFulfilled, onRejected) => {
							return { eject: vi.fn() }
						}),
					},
					response: {
						use: vi.fn((onFulfilled, onRejected) => {
							return { eject: vi.fn() }
						}),
					},
				},
				request: vi.fn(),
				get: vi.fn(),
				post: vi.fn(),
			})),
			isCancel: vi.fn(),
		},
	}
})

describe('HttpRequest', () => {
	let httpRequest: HttpRequest
	let mockAxiosInstance: any

	beforeEach(() => {
		vi.clearAllMocks()
		mockAxiosInstance = {
			interceptors: {
				request: {
					use: vi.fn((onFulfilled, onRejected) => {
						return { eject: vi.fn() }
					}),
				},
				response: {
					use: vi.fn((onFulfilled, onRejected) => {
						return { eject: vi.fn() }
					}),
				},
			},
			request: vi.fn(),
			get: vi.fn(),
			post: vi.fn(),
		}

		// @ts-ignore
		axios.create.mockReturnValue(mockAxiosInstance)
		httpRequest = new HttpRequest()
	})

	describe('constructor', () => {
		it('应该创建 axios 实例', () => {
			expect(axios.create).toHaveBeenCalled()
		})

		it('应该设置拦截器', () => {
			expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled()
			expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled()
		})

		it('应该使用自定义配置', () => {
			const customConfig = {
				baseURL: 'https://api.example.com',
				timeout: 10000,
			}
			new HttpRequest(customConfig)
			expect(axios.create).toHaveBeenCalledWith(
				expect.objectContaining(customConfig),
			)
		})
	})

	describe('createUrl', () => {
		it('应该为默认类型创建 URL', () => {
			const url = httpRequest['createUrl']({
				url: 'user/login',
				customType: 'default',
			})
			expect(url).toBe('/user?action=login')
		})

		it('应该为模型类型创建 URL', () => {
			const url = httpRequest['createUrl']({
				url: 'user/profile',
				customType: 'model',
			})
			expect(url).toBe('/user/profile')
		})

		it('应该为插件类型创建 URL', () => {
			const url = httpRequest['createUrl']({
				url: 'plugin_name/action',
				customType: 'plugin',
			})
			expect(url).toBe('/plugin?action=a&name=plugin_name&s=action')
		})

		it('应该为空 URL 抛出错误', () => {
			expect(() =>
				httpRequest['createUrl']({ url: '', customType: 'default' }),
			).toThrow('请求路径为空')
		})

		it('应该为错误格式抛出错误', () => {
			expect(() =>
				httpRequest['createUrl']({
					url: 'invalid',
					customType: 'default',
				}),
			).toThrow('传统请求/插件请求路径格式错误')
		})
	})

	describe('handleTransformRequest', () => {
		it('应该将对象转换为查询字符串', () => {
			const data = { a: 1, b: 2, c: 'test' }
			const result = httpRequest['handleTransformRequest'](data)
			expect(result).toContain('a=1')
			expect(result).toContain('b=2')
			expect(result).toContain('c=test')
			expect(result).toContain('&')
		})

		it('应该编码特殊字符', () => {
			const data = { email: 'test@example.com' }
			const result = httpRequest['handleTransformRequest'](data)
			expect(result).toContain('test%40example.com')
		})
	})

	describe('requestMiddleware', () => {
		it('应该处理默认类型验证', () => {
			const response = {
				data: {
					status: true,
					msg: 'success',
					code: 200,
					data: { id: 1 },
				},
				status: 200,
			} as unknown as AxiosResponse

			const result = httpRequest['requestMiddleware'](response, 'default')
			expect(result).toHaveProperty('status', true)
			expect(result).toHaveProperty('msg', 'success')
			expect(result).toHaveProperty('data')
		})

		it('应该处理 ignore 验证', () => {
			const response = {
				data: { some: 'data' },
				status: 200,
			} as AxiosResponse

			const result = httpRequest['requestMiddleware'](response, 'ignore')
			expect(result).toBe(response)
		})

		it('应该处理 msg 类型验证', () => {
			const response = {
				data: {
					status: true,
					msg: '操作成功',
					code: 200,
				},
				status: 200,
			} as AxiosResponse

			const result = httpRequest['requestMiddleware'](response, 'msg')
			expect(result).toHaveProperty('msg', '操作成功')
		})

		it('应该处理函数验证', () => {
			const response = {
				data: { custom: 'data' },
				status: 200,
			} as AxiosResponse

			const customHandler = vi.fn((data) => ({ transformed: data }))
			const result = httpRequest['requestMiddleware'](response, customHandler)
			expect(customHandler).toHaveBeenCalledWith(response.data)
			expect(result).toHaveProperty('transformed')
		})

		it('应该处理 AApanel 数据格式', () => {
			const response = {
				data: {
					status: 1,
					message: { result: '成功' },
					timestamp: Date.now(),
				},
				status: 200,
			} as AxiosResponse

			const result = httpRequest['requestMiddleware'](response, 'default')
			expect(result).toHaveProperty('status', true)
		})

		it('应该处理多机管理数据格式', () => {
			const response = {
				data: {
					status: 1,
					msg: 'success',
					error_msg: undefined,
					code: 200,
					message: { id: 1 },
					timestamp: Date.now(),
				},
				status: 200,
			} as AxiosResponse

			const result = httpRequest['requestMiddleware'](response, 'default')
			expect(result).toHaveProperty('status', true)
			expect(result).toHaveProperty('code', 200)
		})
	})

	describe('request', () => {
		it('应该发送 POST 请求', async () => {
			const mockResponse = {
				data: {
					status: true,
					msg: 'success',
					code: 200,
					data: { id: 1 },
				},
				status: 200,
			}
			mockAxiosInstance.request.mockResolvedValue(mockResponse)

			const config: RequestConfig = {
				url: 'user/login',
				method: 'POST',
				data: { username: 'test' },
			}

			const result = await httpRequest.request(config)
			expect(mockAxiosInstance.request).toHaveBeenCalled()
			expect(result).toHaveProperty('status', true)
		})

		it('应该处理请求错误', async () => {
			const error = new Error('Network Error')
			mockAxiosInstance.request.mockRejectedValue(error)

			const config: RequestConfig = {
				url: 'user/login',
				method: 'POST',
			}

			const result = await httpRequest.request(config)
			expect(result).toBeInstanceOf(Error)
		})

		it('应该在 check 为 ignore 时返回错误', async () => {
			const error = new Error('Network Error')
			mockAxiosInstance.request.mockRejectedValue(error)

			const config: RequestConfig = {
				url: 'user/login',
				method: 'POST',
				check: 'ignore',
			}

			const result = await httpRequest.request(config)
			expect(result).toBe(error)
		})

		it('应该处理密码过期的情况', async () => {
			const mockResponse = {
				data: '密码已过期，请修改',
				status: 200,
			}
			mockAxiosInstance.request.mockResolvedValue(mockResponse)

			// 模拟 window.location.reload
			const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {})

			const config: RequestConfig = {
				url: 'user/login',
				method: 'POST',
			}

			await httpRequest.request(config)
			expect(reloadSpy).toHaveBeenCalled()

			reloadSpy.mockRestore()
		})
	})

	describe('get', () => {
		it('应该发送 GET 请求', async () => {
			const mockResponse = {
				data: {
					status: true,
					msg: 'success',
					code: 200,
					data: { id: 1 },
				},
				status: 200,
			}
			mockAxiosInstance.request.mockResolvedValue(mockResponse)

			await httpRequest.get('user/profile')

			expect(mockAxiosInstance.request).toHaveBeenCalledWith(
				expect.objectContaining({ method: 'GET' }),
			)
		})

		it('应该处理字符串类型的 check 参数', async () => {
			const mockResponse = {
				data: { status: true, msg: 'success', code: 200 },
				status: 200,
			}
			mockAxiosInstance.request.mockResolvedValue(mockResponse)

			await httpRequest.get('user/profile', 'default')

			expect(mockAxiosInstance.request).toHaveBeenCalled()
		})

		it('应该处理函数类型的 check 参数', async () => {
			const mockResponse = {
				data: { data: 'test' },
				status: 200,
			}
			mockAxiosInstance.request.mockResolvedValue(mockResponse)

			const customCheck = vi.fn()
			await httpRequest.get('user/profile', customCheck)

			expect(customCheck).toHaveBeenCalled()
		})
	})

	describe('post', () => {
		it('应该发送 POST 请求', async () => {
			const mockResponse = {
				data: {
					status: true,
					msg: 'success',
					code: 200,
					data: { id: 1 },
				},
				status: 200,
			}
			mockAxiosInstance.request.mockResolvedValue(mockResponse)

			await httpRequest.post('user/login')

			expect(mockAxiosInstance.request).toHaveBeenCalledWith(
				expect.objectContaining({ method: 'POST' }),
			)
		})

		it('应该处理配置对象', async () => {
			const mockResponse = {
				data: { status: true, msg: 'success', code: 200 },
				status: 200,
			}
			mockAxiosInstance.request.mockResolvedValue(mockResponse)

			await httpRequest.post('user/login', {
				data: { username: 'test' },
				check: 'default',
			})

			expect(mockAxiosInstance.request).toHaveBeenCalled()
		})
	})

	describe('handleToken', () => {
		it('应该生成有效的 token', () => {
			const token = httpRequest.handleToken('test-key')
			expect(token).toHaveProperty('request_time')
			expect(token).toHaveProperty('request_token')
			expect(typeof token.request_time).toBe('number')
			expect(typeof token.request_token).toBe('string')
		})

		it('对相同输入应该返回相同格式', () => {
			const token1 = httpRequest.handleToken('key')
			const token2 = httpRequest.handleToken('key')
			expect(token1.request_time).not.toBe(token2.request_time) // 时间不同
			expect(typeof token1.request_token).toBe('string')
			expect(typeof token2.request_token).toBe('string')
		})
	})
})
