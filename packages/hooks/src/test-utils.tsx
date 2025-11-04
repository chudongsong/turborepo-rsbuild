/**
 * 测试工具函数
 */

import { ReactElement, useState } from 'react'
import { render, type RenderResult } from '@testing-library/react'
import type { RequestConfig, ResponseResult } from './types/axios'

// Mock axios
vi.mock('axios', () => ({
	default: {
		create: vi.fn(() => ({
			interceptors: {
				request: {
					use: vi.fn(),
				},
				response: {
					use: vi.fn(),
				},
			},
			request: vi.fn(),
			get: vi.fn(),
			post: vi.fn(),
		})),
		isCancel: vi.fn(),
		CancelToken: {
			source: vi.fn(() => ({
				token: {},
				cancel: vi.fn(),
			})),
		},
		get: vi.fn(),
		post: vi.fn(),
	},
}))

// Mock window.location
Object.defineProperty(window, 'location', {
	value: {
		href: 'http://localhost:3000',
		protocol: 'http:',
		hostname: 'localhost',
	},
	writable: true,
})

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
	value: '',
	writable: true,
})

// Mock sessionStorage
const mockSessionStorage = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
	value: mockSessionStorage,
})

// Mock localStorage
const mockLocalStorage = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
	value: mockLocalStorage,
})

// 模拟响应数据
export const mockResponse = {
	data: {
		status: true,
		msg: 'success',
		code: 200,
		data: { id: 1, name: 'test' },
	},
	status: 200,
}

// 模拟错误响应
export const mockErrorResponse = {
	data: {
		status: false,
		msg: 'error',
		code: 500,
		data: null,
	},
	status: 500,
}

// 创建模拟请求配置
export const createMockRequestConfig = (
	overrides: Partial<RequestConfig> = {},
): RequestConfig => ({
	url: '/api/test',
	method: 'POST',
	data: {},
	...overrides,
})

// 创建模拟响应结果
export const createMockResponseResult = <T = any>(
	overrides: Partial<ResponseResult<T>> = {},
): ResponseResult<T> => ({
	status: true,
	msg: 'success',
	code: 200,
	data: null as unknown as T,
	default: true,
	timestamp: Date.now(),
	...overrides,
})

// 渲染 Hook 的测试工具
export function renderHook<T>(
	hookFn: () => T,
): {
	result: { current: T }
	rerender: (hookFn: () => T) => void
	cleanup: () => void
} {
	let currentHook: T
	let cleanup: (() => void) | undefined

	const TestComponent = ({
		children,
	}: {
		children?: ReactElement
	}) => {
		currentHook = hookFn()
		return children || null
	}

	let container: HTMLElement

	const renderHelper = () => {
		const { container: c, rerender } = render(
			<TestComponent>
				{/* 用于触发组件重新渲染 */}
			</TestComponent>,
		)
		container = c
		return { rerender }
	}

	const helper = renderHelper()

	const result = {
		get current() {
			return currentHook
		},
	}

	return {
		result,
		rerender: (newHookFn: () => T) => {
			helper.rerender(<TestComponent>{/* 重新渲染触发器 */}</TestComponent>)
			currentHook = newHookFn()
		},
		cleanup: () => {
			if (cleanup) {
				cleanup()
			}
		},
	}
}

// 等待异步操作
export const waitFor = (callback: () => void | Promise<void>, timeout = 1000) => {
	return new Promise<void>((resolve, reject) => {
		const start = Date.now()
		const check = () => {
			try {
				callback()
				resolve()
			} catch (error) {
				if (Date.now() - start > timeout) {
					reject(error)
				} else {
					setTimeout(check, 10)
				}
			}
		}
		check()
	})
}

// 模拟成功的 axios 请求
export const setupAxiosMock = (
	{
		data = mockResponse,
		status = 200,
	} = {},
) => {
	const axios = vi.mocked(await import('axios')).default

	const mockAxiosInstance = {
		interceptors: {
			request: {
				use: vi.fn().mockImplementation((fn) => {
					// 模拟请求拦截器
					fn(
						{
							method: 'post',
							url: '/api/test',
							data: {},
							headers: {},
						},
						{} as any,
					)
				}),
			},
			response: {
				use: vi.fn().mockImplementation((fn) => {
					// 模拟响应拦截器
					fn({
						data,
						status,
					})
				}),
			},
		},
		request: vi.fn().mockResolvedValue({
			data,
			status,
		}),
		get: vi.fn().mockResolvedValue({ data, status }),
		post: vi.fn().mockResolvedValue({ data, status }),
	}

	axios.create.mockReturnValue(mockAxiosInstance as any)
	axios.isCancel.mockReturnValue(false)

	return mockAxiosInstance
}

// 模拟失败的 axios 请求
export const setupAxiosErrorMock = (error: Error) => {
	const axios = vi.mocked(await import('axios')).default

	const mockAxiosInstance = {
		interceptors: {
			request: { use: vi.fn() },
			response: { use: vi.fn() },
		},
		request: vi.fn().mockRejectedValue(error),
		get: vi.fn().mockRejectedValue(error),
		post: vi.fn().mockRejectedValue(error),
	}

	axios.create.mockReturnValue(mockAxiosInstance as any)
	axios.isCancel.mockReturnValue(false)

	return mockAxiosInstance
}

// 重置所有 mocks
export const resetMocks = () => {
	vi.clearAllMocks()
	mockSessionStorage.getItem.mockReturnValue('[]')
	mockSessionStorage.setItem.mockImplementation(() => undefined)
}
