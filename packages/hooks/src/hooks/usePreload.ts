/**
 * usePreload - 预加载 Hook
 *
 * 提供文件预加载功能，支持：
 * - CSS/JS 文件预加载
 * - 预加载状态管理
 * - 取消预加载
 * - 动态加载
 */

import { useState, useCallback, useRef } from 'react'
import axios from 'axios'

interface RequestItem {
	url: string
	cancel: ReturnType<typeof axios.CancelToken.source>
}

interface PreloadOptions {
	basePath?: string // 基础路径
	onProgress?: (loaded: number, total: number) => void // 进度回调
	onComplete?: (items: string[]) => void // 完成回调
	onError?: (error: Error, url: string) => void // 错误回调
}

/**
 * usePreload Hook
 *
 * 提供文件和资源预加载功能
 */
export function usePreload(options: PreloadOptions = {}) {
	const { basePath = '/static', onProgress, onComplete, onError } = options

	const [state, setState] = useState({
		loading: false,
		loaded: 0,
		total: 0,
		errors: [] as Error[],
	})

	const requestListRef = useRef<RequestItem[]>([])

	/**
	 * 加载文件
	 */
	const loadFile = useCallback(
		async (urls: string[] | string): Promise<string[]> => {
			if (typeof urls === 'string') {
				// 如果是字符串，可以从缓存中读取
				urls = (window as any).pageLoadFile?.[urls] || []
			}

			const existingRecords: string[] = JSON.parse(
				sessionStorage.getItem('FileRecord') || '[]',
			)
			const fileRecords: string[] = []
			const newUrls = urls.filter(
				record => existingRecords.indexOf(record) === -1,
			)

			if (newUrls.length === 0) {
				return existingRecords
			}

			setState(prev => ({
				...prev,
				loading: true,
				total: newUrls.length,
				loaded: 0,
				errors: [],
			}))

			const loadPromises = newUrls.map(async (item) => {
				try {
					const source = axios.CancelToken.source()
					const loadType = item.indexOf('css') > -1 ? 'css' : 'js'

					requestListRef.current.push({
						url: item,
						cancel: source,
					})

					await axios.get(`${basePath}/${loadType}/${item}`, {
						cancelToken: source.token,
					})

					fileRecords.push(item)

					setState(prev => ({
						...prev,
						loaded: prev.loaded + 1,
					}))

					if (onProgress) {
						onProgress(fileRecords.length, newUrls.length)
					}

					return item
				} catch (error: any) {
					const err = error instanceof Error ? error : new Error(String(error))
					setState(prev => ({
						...prev,
						errors: [...prev.errors, err],
					}))

					if (onError) {
						onError(err, item)
					}

					throw err
				}
			})

			try {
				await Promise.allSettled(loadPromises)
			} finally {
				const uniqueRecords: string[] = [...existingRecords, ...fileRecords]
				sessionStorage.setItem('FileRecord', JSON.stringify(uniqueRecords))

				setState(prev => ({
					...prev,
					loading: false,
				}))

				if (onComplete) {
					onComplete(uniqueRecords)
				}
			}

			return [...existingRecords, ...fileRecords]
		},
		[basePath, onProgress, onComplete, onError],
	)

	/**
	 * 取消指定请求
	 */
	const cancelRequest = useCallback((url: string): void => {
		const request = requestListRef.current.find(item => item.url === url)
		if (request) {
			request.cancel.cancel('请求被取消')
			requestListRef.current = requestListRef.current.filter(
				item => item.url !== url,
			)
		}
	}, [])

	/**
	 * 取消所有请求
	 */
	const cancelAll = useCallback((): void => {
		requestListRef.current.forEach(request => {
			request.cancel.cancel('请求被取消')
		})
		requestListRef.current = []
		setState(prev => ({ ...prev, loading: false }))
	}, [])

	/**
	 * 动态加载
	 */
	const dynamicLoading = useCallback(
		(type: string, fileList?: string[]): Promise<string[]> => {
			// 可以根据类型定义不同的文件列表
			const typeMap: Record<string, string[]> = {
				// login: ['main.js', 'vue-bucket.js', 'public-lib.js', 'echarts.js'],
			}

			const urls = fileList || typeMap[type] || []
			return loadFile(urls)
		},
		[loadFile],
	)

	/**
	 * 版本变更检测
	 */
	const checkVersionChange = useCallback(
		async (
			remoteVersionUrl: string,
			localVersion: string,
		): Promise<boolean> => {
			try {
				const response = await axios.get(remoteVersionUrl)
				const remoteVersion = response.data

				if (remoteVersion && localVersion && remoteVersion !== localVersion) {
					sessionStorage.setItem('remoteVersion', remoteVersion)
					return true
				}

				return false
			} catch (error) {
				console.error('Version check failed:', error)
				return false
			}
		},
		[],
	)

	/**
	 * 触发版本更新
	 */
	const triggerVersionUpdate = useCallback((): void => {
		if (typeof window !== 'undefined') {
			window.location.reload()
		}
	}, [])

	/**
	 * 清理缓存
	 */
	const clearCache = useCallback((): void => {
		sessionStorage.removeItem('FileRecord')
		requestListRef.current = []
		setState({
			loading: false,
			loaded: 0,
			total: 0,
			errors: [],
		})
	}, [])

	return {
		// 状态
		...state,
		loadedFiles: state.loaded,
		progress: state.total > 0 ? state.loaded / state.total : 0,

		// 方法
		loadFile,
		cancelRequest,
		cancelAll,
		dynamicLoading,
		checkVersionChange,
		triggerVersionUpdate,
		clearCache,
	}
}

/**
 * useScript - 脚本预加载 Hook
 *
 * 专门用于预加载和执行脚本
 */
export function useScript(url: string) {
	const [state, setState] = useState({
		loading: false,
		loaded: false,
		error: null as Error | null,
	})

	const load = useCallback(async (): Promise<void> => {
		if (typeof document === 'undefined') return

		setState(prev => ({ ...prev, loading: true, error: null }))

		return new Promise((resolve, reject) => {
			const script = document.createElement('script')
			script.src = url
			script.async = true

			script.onload = () => {
				setState({ loading: false, loaded: true, error: null })
				resolve()
			}

			script.onerror = () => {
				const error = new Error(`Failed to load script: ${url}`)
				setState({ loading: false, loaded: false, error })
				reject(error)
			}

			document.head.appendChild(script)
		})
	}, [url])

	return {
		...state,
		load,
		reload: load,
	}
}

/**
 * useStyle - 样式预加载 Hook
 *
 * 专门用于预加载和注入样式
 */
export function useStyle(href: string) {
	const [state, setState] = useState({
		loading: false,
		loaded: false,
		error: null as Error | null,
	})

	const load = useCallback(async (): Promise<void> => {
		if (typeof document === 'undefined') return

		setState(prev => ({ ...prev, loading: true, error: null }))

		return new Promise((resolve, reject) => {
			const link = document.createElement('link')
			link.rel = 'stylesheet'
			link.href = href

			link.onload = () => {
				setState({ loading: false, loaded: true, error: null })
				resolve()
			}

			link.onerror = () => {
				const error = new Error(`Failed to load style: ${href}`)
				setState({ loading: false, loaded: false, error })
				reject(error)
			}

			document.head.appendChild(link)
		})
	}, [href])

	return {
		...state,
		load,
		reload: load,
	}
}
