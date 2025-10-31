/* eslint-disable @typescript-eslint/naming-convention */
import { ref } from 'vue'
import axios from 'axios'
import { isDev, isNumber } from '@/utils'
import { getToken } from '@/utils/data'

// 上传进度状态
export const uploadProgress = ref(false)
export const uploadNum = ref(0)

/**
 * 上传参数接口
 */
export interface UploadParams {
	file: File
	data: {
		f_size: number
		f_path: string
		f_name: string
		f_start: number
	}
}

/**
 * 上传配置接口
 */
export interface UploadConfig {
	path?: string // 上传路径
	name?: string // 上传文件名
	onProgress?: (percent: number) => void // 进度回调
	onSuccess?: (result: any) => void // 成功回调
	onError?: (error: any) => void // 错误回调
	useChunked?: boolean // 是否使用分片上传
}

/**
 * 构建上传FormData
 * @param file 文件对象
 * @param config 上传配置
 * @param startPos 开始位置（用于分片上传）
 */
const buildFormData = (file: File, config: UploadConfig, startPos: number = 0): FormData => {
	const fd = new FormData()
	const token = getToken()

	fd.append('blob', file)
	fd.append('f_size', String(file.size))
	fd.append('f_path', config.path || '')
	fd.append('f_name', config.name || file.name)
	fd.append('f_start', String(startPos))
	fd.append('request_time', String(token.request_time))
	fd.append('request_token', String(token.request_token))

	return fd
}

/**
 * 统一上传函数 - 根据文件大小和配置自动选择分片或非分片模式
 * @param file 文件对象
 * @param config 上传配置
 * @param currentStart 当前开始位置（用于分片上传递归）
 */
export const unifiedUpload = async (file: File, config: UploadConfig = {}, currentStart: number = 0): Promise<any> => {
	const CHUNK_THRESHOLD = 10 * 1024 * 1024 // 10MB 阈值
	const isChunkedUpload = config.useChunked || file.size > CHUNK_THRESHOLD
	const maxRetries = isChunkedUpload ? 3 : 2
	let retryCount = 0

	const attemptUpload = async (): Promise<any> => {
		try {
			const fd = buildFormData(file, config, currentStart)

			const requestConfig = {
				headers: {
					'Content-Type': isChunkedUpload ? 'multipart/form-data' : undefined,
					'x-http-token': window.vite_public_request_token || '',
				},
				timeout: 60000, // 分片上传30秒，普通上传60秒
				...((!isChunkedUpload || currentStart === 0) && {
					onUploadProgress: (progressEvent: any) => {
						if (progressEvent.total) {
							const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
							config.onProgress?.(percent)
						}
					},
				}),
			}

			const res: any = await axios.post(`${isDev ? '/api' : ''}/files?action=upload`, fd, requestConfig)

			// 处理分片上传的递归逻辑
			if (isNumber(res.data) && isChunkedUpload) {
				// 打开进度显示
				if (!uploadProgress.value) uploadProgress.value = true

				// 计算百分比
				const percent = Math.floor((res.data / file.size) * 100)
				uploadNum.value = Math.min(percent, 100)

				// 调用进度回调
				config.onProgress?.(uploadNum.value)

				// 继续下一次上传
				return await unifiedUpload(file, config, res.data)
			}

			// 上传完成
			if (isChunkedUpload) {
				uploadProgress.value = false
				uploadNum.value = 100
			}

			// 处理响应
			if (res.data?.status) {
				config.onSuccess?.(res.data)
				return res.data
			}

			const errorMsg = res.data?.msg || '上传失败'
			const error = new Error(errorMsg)
			config.onError?.(error)
			throw error
		} catch (error: any) {
			console.error(`上传失败 (尝试 ${retryCount + 1}/${maxRetries}):`, error)

			// 如果是网络错误且还有重试次数，则重试
			if (retryCount < maxRetries && (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED')) {
				retryCount++
				await new Promise(resolve => {
					setTimeout(resolve, 1000 * retryCount)
				}) // 递增延迟
				return attemptUpload()
			}

			if (isChunkedUpload) {
				uploadProgress.value = false
				uploadNum.value = 0
			}

			config.onError?.(error)
			throw error
		}
	}

	return attemptUpload()
}

/**
 * 分片上传事件 - 兼容性保留，内部使用统一上传函数
 * @param params 上传参数
 * @param config 上传配置
 * @deprecated 建议使用 unifiedUpload 或 smartUpload
 */
export const uploadEvent = async (params: UploadParams, config: UploadConfig = {}): Promise<any> => {
	const uploadConfig = {
		...config,
		path: params.data.f_path,
		name: params.data.f_name,
		useChunked: true,
	}

	return unifiedUpload(params.file, uploadConfig, params.data.f_start)
}

/**
 * 简单文件上传 - 兼容性保留，内部使用统一上传函数
 * @param file 文件对象
 * @param config 上传配置
 * @deprecated 建议使用 unifiedUpload 或 smartUpload
 */
export const simpleUpload = async (file: File, config: UploadConfig = {}): Promise<any> => {
	const uploadConfig = {
		...config,
		useChunked: false,
	}

	return unifiedUpload(file, uploadConfig)
}

/**
 * 智能上传 - 根据文件大小自动选择上传方式，优化性能和用户体验
 * @param file 文件对象
 * @param config 上传配置
 */
export const smartUpload = async (file: File, config: UploadConfig = {}): Promise<any> => {
	// 验证文件
	if (!file || file.size === 0) {
		const error = new Error('无效的文件')
		config.onError?.(error)
		throw error
	}

	// 文件大小检查 (最大500MB)
	const MAX_FILE_SIZE = 500 * 1024 * 1024
	if (file.size > MAX_FILE_SIZE) {
		const error = new Error(`文件大小不能超过 ${formatFileSize(MAX_FILE_SIZE)}`)
		config.onError?.(error)
		throw error
	}

	try {
		const CHUNK_SIZE = 10 * 1024 * 1024 // 10MB 阈值
		const useChunked = file.size > CHUNK_SIZE

		console.log(`使用${useChunked ? '分片' : '简单'}上传: ${file.name} (${formatFileSize(file.size)})`)

		return await unifiedUpload(file, { ...config, useChunked })
	} catch (error: any) {
		console.error('智能上传失败:', error)
		config.onError?.(error)
		throw error
	}
}

/**
 * 验证文件类型
 * @param file 文件对象
 * @param allowedTypes 允许的文件类型
 */
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
	return allowedTypes.some(type => {
		if (type.startsWith('.')) {
			// 扩展名检查
			return file.name.toLowerCase().endsWith(type.toLowerCase())
		}
		// MIME类型检查
		return file.type.includes(type)
	})
}

/**
 * 验证文件大小
 * @param file 文件对象
 * @param maxSize 最大文件大小（字节）
 */
export const validateFileSize = (file: File, maxSize: number): boolean => {
	return file.size <= maxSize
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 */
export const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return '0 Bytes'

	const k = 1024
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
	const i = Math.floor(Math.log(bytes) / Math.log(k))

	return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}
