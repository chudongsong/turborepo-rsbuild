/**
 * usePreload Hook 测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, resetMocks } from '../../test-utils'
import {
	usePreload,
	useScript,
	useStyle,
} from '../usePreload'

// Mock axios
const mockAxios = {
	get: vi.fn(),
}

vi.mock('axios', () => ({
	default: mockAxios,
}))

// Mock document
const mockHead = {
	appendChild: vi.fn(),
}

Object.defineProperty(document, 'head', {
	value: mockHead,
})

// Mock Element creation
const mockScriptElement = {
	async: true,
	src: '',
	onload: null as any,
	onerror: null as any,
}

const mockLinkElement = {
	rel: '',
	href: '',
	onload: null as any,
	onerror: null as any,
}

const createElementSpy = vi.spyOn(document, 'createElement')

describe('usePreload', () => {
	beforeEach(() => {
		resetMocks()
		vi.clearAllMocks()
		mockAxios.get.mockReset()
		mockHead.appendChild.mockReset()
	})

	it('应该初始化状态', () => {
		const { result } = renderHook(() => usePreload())

		expect(result.current).toHaveProperty('loading', false)
		expect(result.current).toHaveProperty('loaded', 0)
		expect(result.current).toHaveProperty('total', 0)
		expect(result.current).toHaveProperty('errors')
		expect(result.current).toHaveProperty('progress', 0)
		expect(result.current).toHaveProperty('loadFile')
		expect(result.current).toHaveProperty('cancelRequest')
		expect(result.current).toHaveProperty('cancelAll')
		expect(result.current).toHaveProperty('clearCache')
	})

	it('应该加载文件列表', async () => {
		mockAxios.get.mockResolvedValue({
			data: 'loaded',
			config: { url: '/static/js/vendor.js' },
		})

		const { result } = renderHook(() => usePreload())

		const promise = result.current.loadFile(['vendor.js', 'app.js'])

		expect(result.current.loading).toBe(true)
		expect(result.current.total).toBe(2)

		await promise

		expect(result.current.loaded).toBe(2)
		expect(result.current.loading).toBe(false)
		expect(mockAxios.get).toHaveBeenCalledTimes(2)
	})

	it('应该跟踪加载进度', async () => {
		const onProgress = vi.fn()
		const onComplete = vi.fn()

		mockAxios.get.mockResolvedValue({
			data: 'loaded',
			config: { url: '/static/js/vendor.js' },
		})

		const { result } = renderHook(() =>
			usePreload({
				onProgress,
				onComplete,
			}),
		)

		await result.current.loadFile(['file1.js', 'file2.js', 'file3.js'])

		expect(onProgress).toHaveBeenCalledTimes(3)
		expect(onProgress).toHaveBeenNthCalledWith(1, 1, 3)
		expect(onProgress).toHaveBeenNthCalledWith(2, 2, 3)
		expect(onProgress).toHaveBeenNthCalledWith(3, 3, 3)

		expect(onComplete).toHaveBeenCalledWith(
			expect.arrayContaining(['file1.js', 'file2.js', 'file3.js']),
		)
	})

	it('应该处理加载错误', async () => {
		const onError = vi.fn()

		mockAxios.get
			.mockResolvedValueOnce({
				data: 'loaded',
				config: { url: '/static/js/file1.js' },
			})
			.mockRejectedValueOnce(new Error('Load failed'))
			.mockResolvedValueOnce({
				data: 'loaded',
				config: { url: '/static/js/file3.js' },
			})

		const { result } = renderHook(() =>
			usePreload({
				onError,
			}),
		)

		await result.current.loadFile(['file1.js', 'file2.js', 'file3.js'])

		expect(onError).toHaveBeenCalledTimes(1)
		expect(onError).toHaveBeenCalledWith(
			expect.any(Error),
			'file2.js',
		)
		expect(result.current.errors.length).toBe(1)
	})

	it('应该使用 sessionStorage 缓存', async () => {
		const mockGetItem = vi
			.spyOn(sessionStorage, 'getItem')
			.mockReturnValue('["cached.js"]')

		const mockSetItem = vi.spyOn(sessionStorage, 'setItem').mockImplementation(() => {})

		mockAxios.get.mockResolvedValue({
			data: 'loaded',
			config: { url: '/static/js/new.js' },
		})

		const { result } = renderHook(() => usePreload())

		await result.current.loadFile(['cached.js', 'new.js'])

		// 只应该加载新文件
		expect(mockAxios.get).toHaveBeenCalledTimes(1)
		expect(mockSetItem).toHaveBeenCalledWith(
			'FileRecord',
			expect.stringContaining('new.js'),
		)

		mockGetItem.mockRestore()
		mockSetItem.mockRestore()
	})

	it('应该支持取消特定请求', async () => {
		const mockCancel = vi.fn()
		mockAxios.get.mockImplementation(
			() =>
				new Promise(resolve => {
					setTimeout(() => {
						resolve({
							data: 'loaded',
							config: { url: '/static/js/vendor.js' },
						})
					}, 100)
				}),
		)

		const { result } = renderHook(() => usePreload())

		result.current.loadFile(['slow-file.js'])

		// 立即取消
		result.current.cancelRequest('slow-file.js')

		expect(result.current.loading).toBe(false)
	})

	it('应该支持取消所有请求', async () => {
		mockAxios.get.mockImplementation(
			() =>
				new Promise(resolve => {
					setTimeout(() => {
						resolve({
							data: 'loaded',
							config: { url: '/static/js/file1.js' },
						})
					}, 100)
				}),
		)

		const { result } = renderHook(() => usePreload())

		result.current.loadFile(['file1.js', 'file2.js'])

		result.current.cancelAll()

		expect(result.current.loading).toBe(false)
	})

	it('应该支持动态加载', async () => {
		mockAxios.get.mockResolvedValue({
			data: 'loaded',
			config: { url: '/static/js/vendor.js' },
		})

		const { result } = renderHook(() => usePreload())

		await result.current.dynamicLoading('login', ['vendor.js'])

		expect(mockAxios.get).toHaveBeenCalled()
	})

	it('应该检查版本变更', async () => {
		mockAxios.get.mockResolvedValue({
			data: '2.0.0',
		})

		const { result } = renderHook(() => usePreload())

		const hasUpdate = await result.current.checkVersionChange(
			'/version.txt',
			'1.0.0',
		)

		expect(hasUpdate).toBe(true)
	})

	it('应该清理缓存', () => {
		const mockClear = vi.spyOn(sessionStorage, 'clear').mockImplementation(() => {})
		const mockSetItem = vi.spyOn(sessionStorage, 'setItem').mockImplementation(() => {})

		const { result } = renderHook(() => usePreload())

		// 先添加一些状态
		result.current.data = { id: 1 }

		// 清理
		result.current.clearCache()

		expect(result.current.loaded).toBe(0)
		expect(result.current.total).toBe(0)
		expect(result.current.errors).toEqual([])

		mockClear.mockRestore()
		mockSetItem.mockRestore()
	})
})

describe('useScript', () => {
	beforeEach(() => {
		resetMocks()
		vi.clearAllMocks()
		createElementSpy.mockImplementation((tag: string) => {
			if (tag === 'script') {
				return mockScriptElement
			}
			return document.createElement(tag)
		})
	})

	afterEach(() => {
		createElementSpy.mockRestore()
	})

	it('应该初始化状态', () => {
		const { result } = renderHook(() => useScript('/sdk.js'))

		expect(result.current).toHaveProperty('loading', false)
		expect(result.current).toHaveProperty('loaded', false)
		expect(result.current).toHaveProperty('error', null)
		expect(result.current).toHaveProperty('load')
		expect(result.current).toHaveProperty('reload')
	})

	it('应该加载脚本', async () => {
		const { result } = renderHook(() => useScript('/sdk.js'))

		const promise = result.current.load()

		expect(result.current.loading).toBe(true)

		// 触发 onload
		mockScriptElement.onload?.({} as any)

		await promise

		expect(result.current.loading).toBe(false)
		expect(result.current.loaded).toBe(true)
		expect(mockScriptElement.src).toBe('/sdk.js')
	})

	it('应该处理脚本加载错误', async () => {
		const { result } = renderHook(() => useScript('/invalid-sdk.js'))

		const promise = result.current.load()

		// 触发 onerror
		mockScriptElement.onerror?.({} as any)

		await promise

		expect(result.current.loading).toBe(false)
		expect(result.current.loaded).toBe(false)
		expect(result.current.error).toBeInstanceOf(Error)
	})
})

describe('useStyle', () => {
	beforeEach(() => {
		resetMocks()
		vi.clearAllMocks()
		createElementSpy.mockImplementation((tag: string) => {
			if (tag === 'link') {
				return mockLinkElement
			}
			return document.createElement(tag)
		})
	})

	afterEach(() => {
		createElementSpy.mockRestore()
	})

	it('应该初始化状态', () => {
		const { result } = renderHook(() => useStyle('/theme.css'))

		expect(result.current).toHaveProperty('loading', false)
		expect(result.current).toHaveProperty('loaded', false)
		expect(result.current).toHaveProperty('error', null)
		expect(result.current).toHaveProperty('load')
		expect(result.current).toHaveProperty('reload')
	})

	it('应该加载样式', async () => {
		const { result } = renderHook(() => useStyle('/theme.css'))

		const promise = result.current.load()

		expect(result.current.loading).toBe(true)

		// 触发 onload
		mockLinkElement.onload?.({} as any)

		await promise

		expect(result.current.loading).toBe(false)
		expect(result.current.loaded).toBe(true)
		expect(mockLinkElement.href).toBe('/theme.css')
		expect(mockLinkElement.rel).toBe('stylesheet')
	})

	it('应该处理样式加载错误', async () => {
		const { result } = renderHook(() => useStyle('/invalid-theme.css'))

		const promise = result.current.load()

		// 触发 onerror
		mockLinkElement.onerror?.({} as any)

		await promise

		expect(result.current.loading).toBe(false)
		expect(result.current.loaded).toBe(false)
		expect(result.current.error).toBeInstanceOf(Error)
	})
})
