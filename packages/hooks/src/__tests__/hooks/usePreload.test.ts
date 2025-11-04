/**
 * 测试 usePreload Hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePreload, useScript, useStyle } from '../../hooks/usePreload'

// Mock axios
vi.mock('axios', () => {
	return {
		default: {
			get: vi.fn(),
			CancelToken: {
				source: vi.fn().mockReturnValue({
					token: {},
					cancel: vi.fn(),
				}),
			},
		},
	}
})

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
	value: {
		getItem: vi.fn(),
		setItem: vi.fn(),
		removeItem: vi.fn(),
		clear: vi.fn(),
	},
	writable: true,
})

describe('usePreload', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('基本功能', () => {
		it('应该返回初始状态', () => {
			const { result } = renderHook(() => usePreload())

			expect(result.current).toHaveProperty('loading', false)
			expect(result.current).toHaveProperty('loaded', 0)
			expect(result.current).toHaveProperty('total', 0)
			expect(result.current).toHaveProperty('errors')
			expect(result.current).toHaveProperty('loadedFiles', 0)
			expect(result.current).toHaveProperty('progress', 0)
			expect(result.current).toHaveProperty('loadFile')
			expect(result.current).toHaveProperty('cancelRequest')
			expect(result.current).toHaveProperty('cancelAll')
			expect(result.current).toHaveProperty('dynamicLoading')
			expect(result.current).toHaveProperty('checkVersionChange')
			expect(result.current).toHaveProperty('triggerVersionUpdate')
			expect(result.current).toHaveProperty('clearCache')
		})

		it('应该支持自定义基础路径', () => {
			const { result } = renderHook(() =>
				usePreload({ basePath: '/custom-static' }),
			)

			// 基础路径应该在内部使用
			expect(result.current.loadFile).toBeDefined()
		})

		it('应该支持回调选项', () => {
			const onProgress = vi.fn()
			const onComplete = vi.fn()
			const onError = vi.fn()

			renderHook(() =>
				usePreload({
					onProgress,
					onComplete,
					onError,
				}),
			)

			expect(onProgress).not.toHaveBeenCalled()
			expect(onComplete).not.toHaveBeenCalled()
			expect(onError).not.toHaveBeenCalled()
		})
	})

	describe('loadFile', () => {
		it('应该加载文件数组', async () => {
			const { result } = renderHook(() => usePreload())

			const mockAxios = vi.mocked(require('axios').default)
			mockAxios.get.mockResolvedValue({ data: {} })

			// 模拟空缓存
			sessionStorage.getItem.mockReturnValue('[]')

			await act(async () => {
				await result.current.loadFile(['file1.js', 'file2.js'])
			})

			expect(mockAxios.get).toHaveBeenCalledTimes(2)
			expect(mockAxios.get).toHaveBeenCalledWith('/static/js/file1.js')
			expect(mockAxios.get).toHaveBeenCalledWith('/static/js/file2.js')
		})

		it('应该区分 CSS 和 JS 文件', async () => {
			const { result } = renderHook(() => usePreload())

			const mockAxios = vi.mocked(require('axios').default)
			mockAxios.get.mockResolvedValue({ data: {} })

			// 模拟空缓存
			sessionStorage.getItem.mockReturnValue('[]')

			await act(async () => {
				await result.current.loadFile(['style.css', 'script.js'])
			})

			expect(mockAxios.get).toHaveBeenCalledWith('/static/css/style.css')
			expect(mockAxios.get).toHaveBeenCalledWith('/static/js/script.js')
		})

		it('应该更新加载进度', async () => {
			const { result } = renderHook(() => usePreload())

			const mockAxios = vi.mocked(require('axios').default)
			mockAxios.get.mockResolvedValue({ data: {} })

			// 模拟空缓存
			sessionStorage.getItem.mockReturnValue('[]')

			await act(async () => {
				await result.current.loadFile(['file1.js', 'file2.js', 'file3.js'])
			})

			// 验证进度
			expect(result.current.total).toBe(3)
			expect(result.current.loaded).toBe(3)
			expect(result.current.progress).toBe(1)
			expect(result.current.loadedFiles).toBe(3)
		})

		it('应该处理已缓存的文件', async () => {
			const { result } = renderHook(() => usePreload())

			const mockAxios = vi.mocked(require('axios').default)
			mockAxios.get.mockResolvedValue({ data: {} })

			// 模拟已有缓存
			sessionStorage.getItem.mockReturnValue(JSON.stringify(['cached.js']))

			await act(async () => {
				const files = await result.current.loadFile(['cached.js', 'new.js'])
			})

			// 只应该加载新文件
			expect(mockAxios.get).toHaveBeenCalledTimes(1)
			expect(mockAxios.get).toHaveBeenCalledWith('/static/js/new.js')
		})

		it('应该调用进度回调', async () => {
			const onProgress = vi.fn()
			const { result } = renderHook(() =>
				usePreload({ onProgress }),
			)

			const mockAxios = vi.mocked(require('axios').default)
			mockAxios.get.mockResolvedValue({ data: {} })
			sessionStorage.getItem.mockReturnValue('[]')

			await act(async () => {
				await result.current.loadFile(['file1.js', 'file2.js'])
			})

			expect(onProgress).toHaveBeenCalled()
			// 验证调用参数（次数可能不确定，因为是每次加载完成后调用）
			expect(onProgress.mock.calls.length).toBeGreaterThan(0)
		})

		it('应该调用完成回调', async () => {
			const onComplete = vi.fn()
			const { result } = renderHook(() =>
				usePreload({ onComplete }),
			)

			const mockAxios = vi.mocked(require('axios').default)
			mockAxios.get.mockResolvedValue({ data: {} })
			sessionStorage.getItem.mockReturnValue('[]')

			await act(async () => {
				await result.current.loadFile(['file1.js'])
			})

			expect(onComplete).toHaveBeenCalledWith(
				expect.arrayContaining(['file1.js']),
			)
		})

		it('应该处理加载错误', async () => {
			const onError = vi.fn()
			const { result } = renderHook(() =>
				usePreload({ onError }),
			)

			const mockAxios = vi.mocked(require('axios').default)
			const error = new Error('Network Error')
			mockAxios.get.mockRejectedValue(error)

			sessionStorage.getItem.mockReturnValue('[]')

			await act(async () => {
				try {
					await result.current.loadFile(['file1.js'])
				} catch (err) {
					// 忽略错误
				}
			})

			// 验证错误被记录
			expect(result.current.errors).toHaveLength(1)
			expect(onError).toHaveBeenCalledWith(
				expect.any(Error),
				'file1.js',
			)
		})

		it('应该处理空文件列表', async () => {
			const { result } = renderHook(() => usePreload())

			const files = await act(async () => {
				return await result.current.loadFile([])
			})

			expect(result.current.loaded).toBe(0)
			expect(result.current.total).toBe(0)
		})

		it('应该更新 sessionStorage', async () => {
			const { result } = renderHook(() => usePreload())

			const mockAxios = vi.mocked(require('axios').default)
			mockAxios.get.mockResolvedValue({ data: {} })
			sessionStorage.getItem.mockReturnValue('[]')

			await act(async () => {
				await result.current.loadFile(['file1.js'])
			})

			expect(sessionStorage.setItem).toHaveBeenCalledWith(
				'FileRecord',
				expect.any(String),
			)
		})
	})

	describe('cancelRequest', () => {
		it('应该取消指定请求', () => {
			const { result } = renderHook(() => usePreload())

			// 先模拟一些请求
			const mockAxios = vi.mocked(require('axios').default)
			const source = {
				token: {},
				cancel: vi.fn(),
			}
			mockAxios.CancelToken.source.mockReturnValue(source)

			// 模拟请求列表
			;(result.current as any).requestListRef.current = [
				{ url: 'file1.js', cancel: source },
			]

			act(() => {
				result.current.cancelRequest('file1.js')
			})

			expect(source.cancel).toHaveBeenCalledWith('请求被取消')
		})
	})

	describe('cancelAll', () => {
		it('应该取消所有请求', () => {
			const { result } = renderHook(() => usePreload())

			const mockAxios = vi.mocked(require('axios').default)
			const source1 = { token: {}, cancel: vi.fn() }
			const source2 = { token: {}, cancel: vi.fn() }
			mockAxios.CancelToken.source
				.mockReturnValueOnce(source1)
				.mockReturnValueOnce(source2)

			// 模拟请求列表
			;(result.current as any).requestListRef.current = [
				{ url: 'file1.js', cancel: source1 },
				{ url: 'file2.js', cancel: source2 },
			]

			act(() => {
				result.current.cancelAll()
			})

			expect(source1.cancel).toHaveBeenCalledWith('请求被取消')
			expect(source2.cancel).toHaveBeenCalledWith('请求被取消')
			expect(result.current.loading).toBe(false)
		})
	})

	describe('dynamicLoading', () => {
		it('应该支持动态加载', async () => {
			const { result } = renderHook(() => usePreload())

			const mockAxios = vi.mocked(require('axios').default)
			mockAxios.get.mockResolvedValue({ data: {} })
			sessionStorage.getItem.mockReturnValue('[]')

			// 设置类型映射
			// @ts-ignore
			;(window as any).pageLoadFile = {
				login: ['main.js', 'vue-bucket.js'],
			}

			await act(async () => {
				await result.current.dynamicLoading('login')
			})

			expect(mockAxios.get).toHaveBeenCalled()
		})

		it('应该支持自定义文件列表', async () => {
			const { result } = renderHook(() => usePreload())

			const mockAxios = vi.mocked(require('axios').default)
			mockAxios.get.mockResolvedValue({ data: {} })
			sessionStorage.getItem.mockReturnValue('[]')

			await act(async () => {
				await result.current.dynamicLoading('custom', ['custom.js'])
			})

			expect(mockAxios.get).toHaveBeenCalledWith('/static/js/custom.js')
		})
	})

	describe('checkVersionChange', () => {
		it('应该检测版本变更', async () => {
			const { result } = renderHook(() => usePreload())

			const mockAxios = vi.mocked(require('axios').default)
			mockAxios.get.mockResolvedValue({ data: '2.0.0' })

			const hasChanged = await act(async () => {
				return await result.current.checkVersionChange(
					'/version.txt',
					'1.0.0',
				)
			})

			expect(hasChanged).toBe(true)
		})

		it('应该处理版本未变更', async () => {
			const { result } = renderHook(() => usePreload())

			const mockAxios = vi.mocked(require('axios').default)
			mockAxios.get.mockResolvedValue({ data: '1.0.0' })

			const hasChanged = await act(async () => {
				return await result.current.checkVersionChange(
					'/version.txt',
					'1.0.0',
				)
			})

			expect(hasChanged).toBe(false)
		})

		it('应该处理版本检查错误', async () => {
			const { result } = renderHook(() => usePreload())

			const mockAxios = vi.mocked(require('axios').default)
			mockAxios.get.mockRejectedValue(new Error('Network Error'))

			const hasChanged = await act(async () => {
				return await result.current.checkVersionChange(
					'/version.txt',
					'1.0.0',
				)
			})

			expect(hasChanged).toBe(false)
		})
	})

	describe('triggerVersionUpdate', () => {
		it('应该触发页面刷新', () => {
			const { result } = renderHook(() => usePreload())

			const reloadSpy = vi
				.spyOn(window.location, 'reload')
				.mockImplementation(() => {})

			act(() => {
				result.current.triggerVersionUpdate()
			})

			expect(reloadSpy).toHaveBeenCalled()

			reloadSpy.mockRestore()
		})
	})

	describe('clearCache', () => {
		it('应该清理缓存', () => {
			const { result } = renderHook(() => usePreload())

			// 设置一些状态
			;(result.current as any).requestListRef.current = [
				{ url: 'file.js', cancel: { cancel: vi.fn() } },
			]

			act(() => {
				result.current.clearCache()
			})

			expect(sessionStorage.removeItem).toHaveBeenCalledWith('FileRecord')
			expect(result.current.loading).toBe(false)
			expect(result.current.loaded).toBe(0)
			expect(result.current.total).toBe(0)
			expect(result.current.errors).toHaveLength(0)
		})
	})
})

describe('useScript', () => {
	beforeEach(() => {
		// Mock document
		global.document = {
			createElement: vi.fn().mockReturnValue({
				src: '',
				async: false,
				onload: null,
				onerror: null,
			}),
			head: {
				appendChild: vi.fn(),
			},
		} as any
	})

	it('应该返回初始状态', () => {
		const { result } = renderHook(() => useScript('/test.js'))

		expect(result.current).toHaveProperty('loading', false)
		expect(result.current).toHaveProperty('loaded', false)
		expect(result.current).toHaveProperty('error', null)
		expect(result.current).toHaveProperty('load')
		expect(result.current).toHaveProperty('reload')
	})

	it('应该加载脚本', async () => {
		const { result } = renderHook(() => useScript('/test.js'))

		// Mock script element
		const mockScript = {
			src: '',
			async: false,
			onload: null,
			onerror: null,
		}
		document.createElement = vi.fn().mockReturnValue(mockScript)

		await act(async () => {
			await result.current.load()
		})

		expect(document.createElement).toHaveBeenCalledWith('script')
		expect(mockScript.src).toBe('/test.js')
		expect(mockScript.async).toBe(true)
		expect(document.head.appendChild).toHaveBeenCalledWith(mockScript)
	})

	it('应该处理加载成功', async () => {
		const { result } = renderHook(() => useScript('/test.js'))

		const mockScript = {
			src: '',
			async: false,
			onload: null,
			onerror: null,
		}
		document.createElement = vi.fn().mockReturnValue(mockScript)

		await act(async () => {
			await result.current.load()
		})

		expect(result.current.loading).toBe(false)
		expect(result.current.loaded).toBe(true)
		expect(result.current.error).toBeNull()
	})

	it('应该处理加载失败', async () => {
		const { result } = renderHook(() => useScript('/test.js'))

		const mockScript = {
			src: '',
			async: false,
			onload: null,
			onerror: null,
		}
		document.createElement = vi.fn().mockReturnValue(mockScript)

		// 模拟错误
		await act(async () => {
			mockScript.onerror!(new Error('Failed to load') as any)
		})

		expect(result.current.loading).toBe(false)
		expect(result.current.loaded).toBe(false)
		expect(result.current.error).toBeInstanceOf(Error)
	})
})

describe('useStyle', () => {
	beforeEach(() => {
		// Mock document
		global.document = {
			createElement: vi.fn().mockReturnValue({
				rel: '',
				href: '',
				onload: null,
				onerror: null,
			}),
			head: {
				appendChild: vi.fn(),
			},
		} as any
	})

	it('应该返回初始状态', () => {
		const { result } = renderHook(() => useStyle('/test.css'))

		expect(result.current).toHaveProperty('loading', false)
		expect(result.current).toHaveProperty('loaded', false)
		expect(result.current).toHaveProperty('error', null)
		expect(result.current).toHaveProperty('load')
		expect(result.current).toHaveProperty('reload')
	})

	it('应该加载样式', async () => {
		const { result } = renderHook(() => useStyle('/test.css'))

		const mockLink = {
			rel: '',
			href: '',
			onload: null,
			onerror: null,
		}
		document.createElement = vi.fn().mockReturnValue(mockLink)

		await act(async () => {
			await result.current.load()
		})

		expect(document.createElement).toHaveBeenCalledWith('link')
		expect(mockLink.rel).toBe('stylesheet')
		expect(mockLink.href).toBe('/test.css')
		expect(document.head.appendChild).toHaveBeenCalledWith(mockLink)
	})

	it('应该处理加载成功', async () => {
		const { result } = renderHook(() => useStyle('/test.css'))

		const mockLink = {
			rel: '',
			href: '',
			onload: null,
			onerror: null,
		}
		document.createElement = vi.fn().mockReturnValue(mockLink)

		await act(async () => {
			await result.current.load()
		})

		expect(result.current.loading).toBe(false)
		expect(result.current.loaded).toBe(true)
		expect(result.current.error).toBeNull()
	})
})
