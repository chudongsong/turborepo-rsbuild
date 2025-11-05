import { Service } from 'egg'
import path from 'node:path'
import fs from 'node:fs'
import crypto from 'crypto'

/**
 * 文件信息接口
 */
interface FileInfo {
	id: number
	filename: string
	original_name: string
	mime_type: string
	size: number
	storage_path: string
	hash?: string
	directory?: string
	owner_id?: string
	permissions?: string
	is_public?: boolean
	metadata?: any
	created_at: number
	updated_at: number
	deleted_at?: number
}

/**
 * 文件上传选项接口
 */
interface UploadOptions {
	directory?: string
	owner_id?: string
	permissions?: string
	is_public?: boolean
	metadata?: any
}

/**
 * 文件服务类
 *
 * 提供文件上传、下载、管理等功能：
 * - 文件上传存储
 * - 文件信息管理
 * - 文件下载访问
 * - 目录管理
 * - 文件搜索
 */
export default class FilesService extends Service {
	/** 文件存储目录 */
	private static readonly STORAGE_DIR = 'data/files'

	/** 上传文件大小限制（100MB） */
	private static readonly MAX_FILE_SIZE = 100 * 1024 * 1024

	/** 允许的文件类型 */
	private static readonly ALLOWED_MIME_TYPES = [
		'image/jpeg',
		'image/png',
		'image/gif',
		'image/webp',
		'text/plain',
		'text/css',
		'text/javascript',
		'text/json',
		'application/json',
		'application/pdf',
		'application/zip',
		'application/x-zip-compressed',
	]

	/**
	 * 上传文件
	 *
	 * @param {any} file 上传的文件对象
	 * @param {UploadOptions} options 上传选项
	 * @returns {Promise<object>} 上传结果
	 */
	async uploadFile(file: any, options: UploadOptions = {}): Promise<object> {
		// 验证文件
		this.validateFile(file)

		// 生成文件信息
		const fileInfo = await this.processFile(file, options)

		// 保存文件信息到数据库
		const fileId = this.ctx.service.storage.createFile(fileInfo)

		return {
			id: fileId,
			...fileInfo,
			message: 'File uploaded successfully',
		}
	}

	/**
	 * 获取文件列表
	 *
	 * @param {object} query 查询参数
	 * @returns {Promise<object>} 文件列表
	 */
	async getFiles(query: any = {}): Promise<object> {
		const { limit, offset, directory, owner_id, mime_type, search } = query

		const options: any = {}
		if (limit) options.limit = parseInt(limit)
		if (offset) options.offset = parseInt(offset)
		if (directory) options.directory = directory
		if (owner_id) options.owner_id = owner_id
		if (mime_type) options.mime_type = mime_type
		if (search) options.search = search

		const files = this.ctx.service.storage.getFiles(options)

		return {
			files,
			pagination: {
				limit: options.limit || 20,
				offset: options.offset || 0,
				total: files.length,
			},
		}
	}

	/**
	 * 获取文件详情
	 *
	 * @param {number} id 文件ID
	 * @returns {Promise<object>} 文件详情
	 */
	async getFile(id: number): Promise<object> {
		const file = this.ctx.service.storage.getFileById(id)

		if (!file) {
			this.ctx.throw(404, 'File not found')
		}

		// 解析metadata JSON字符串
		if (file.metadata) {
			try {
				file.metadata = JSON.parse(file.metadata)
			} catch (e) {
				// 解析失败，保持原样
			}
		}

		return file
	}

	/**
	 * 更新文件信息
	 *
	 * @param {number} id 文件ID
	 * @param {object} updates 更新数据
	 * @returns {Promise<object>} 更新结果
	 */
	async updateFile(id: number, updates: any): Promise<object> {
		// 检查文件是否存在
		const existingFile = this.ctx.service.storage.getFileById(id)
		if (!existingFile) {
			this.ctx.throw(404, 'File not found')
		}

		// 解析metadata
		if (updates.metadata && typeof updates.metadata === 'string') {
			try {
				updates.metadata = JSON.parse(updates.metadata)
			} catch (e) {
				this.ctx.throw(400, 'Invalid metadata format')
			}
		}

		// 更新文件
		this.ctx.service.storage.updateFile(id, updates)

		return {
			id,
			message: 'File updated successfully',
		}
	}

	/**
	 * 删除文件
	 *
	 * @param {number} id 文件ID
	 * @returns {Promise<object>} 删除结果
	 */
	async deleteFile(id: number): Promise<object> {
		// 检查文件是否存在
		const file = this.ctx.service.storage.getFileById(id)
		if (!file) {
			this.ctx.throw(404, 'File not found')
		}

		// 软删除文件记录
		this.ctx.service.storage.deleteFile(id)

		// 可选：物理删除文件
		// if (fs.existsSync(file.storage_path)) {
		// 	fs.unlinkSync(file.storage_path)
		// }

		return {
			id,
			message: 'File deleted successfully',
		}
	}

	/**
	 * 永久删除文件
	 *
	 * @param {number} id 文件ID
	 * @returns {Promise<object>} 删除结果
	 */
	async permanentlyDeleteFile(id: number): Promise<object> {
		// 检查文件是否存在
		const file = this.ctx.service.storage.getFileById(id)
		if (!file) {
			this.ctx.throw(404, 'File not found')
		}

		// 永久删除文件记录
		this.ctx.service.storage.permanentlyDeleteFile(id)

		// 删除物理文件
		if (fs.existsSync(file.storage_path)) {
			fs.unlinkSync(file.storage_path)
		}

		return {
			id,
			message: 'File permanently deleted',
		}
	}

	/**
	 * 获取目录列表
	 *
	 * @param {string} parentDir 父目录
	 * @returns {Promise<object>} 目录列表
	 */
	async getDirectories(parentDir?: string): Promise<object> {
		const directories = this.ctx.service.storage.getDirectories(parentDir)
		return { directories }
	}

	/**
	 * 获取文件统计信息
	 *
	 * @returns {Promise<object>} 统计信息
	 */
	async getFileStats(): Promise<object> {
		return this.ctx.service.storage.getFileStats()
	}

	/**
	 * 验证上传的文件
	 *
	 * @private
	 * @param {any} file 文件对象
	 */
	private validateFile(file: any): void {
		if (!file) {
			this.ctx.throw(400, 'No file provided')
		}

		// 检查文件大小
		if (file.size > FilesService.MAX_FILE_SIZE) {
			this.ctx.throw(400, `File size exceeds ${FilesService.MAX_FILE_SIZE} bytes`)
		}

		// 检查MIME类型
		if (!FilesService.ALLOWED_MIME_TYPES.includes(file.mime_type)) {
			this.ctx.throw(400, `MIME type ${file.mime_type} is not allowed`)
		}
	}

	/**
	 * 处理上传的文件
	 *
	 * @private
	 * @param {any} file 文件对象
	 * @param {UploadOptions} options 上传选项
	 * @returns {Promise<object>} 处理后的文件信息
	 */
	private async processFile(file: any, options: UploadOptions): Promise<any> {
		// 生成唯一文件名
		const ext = path.extname(file.filename)
		const timestamp = Date.now()
		const random = crypto.randomBytes(8).toString('hex')
		const uniqueFilename = `${timestamp}_${random}${ext}`

		// 构建存储路径
		const storageDir = this.getStorageDirectory(options.directory)
		const storagePath = path.join(storageDir, uniqueFilename)

		// 确保目录存在
		if (!fs.existsSync(storageDir)) {
			fs.mkdirSync(storageDir, { recursive: true })
		}

		// 写入文件
		await new Promise<void>((resolve, reject) => {
			const stream = fs.createWriteStream(storagePath)
			file.stream.pipe(stream)
			stream.on('finish', () => resolve())
			stream.on('error', reject)
		})

		// 计算文件哈希
		const hash = await this.calculateFileHash(storagePath)

		return {
			filename: uniqueFilename,
			original_name: file.filename,
			mime_type: file.mime_type,
			size: file.size,
			storage_path: storagePath,
			hash,
			directory: options.directory || null,
			owner_id: options.owner_id || null,
			permissions: options.permissions || 'private',
			is_public: options.is_public || false,
			metadata: options.metadata || null,
		}
	}

	/**
	 * 获取存储目录路径
	 *
	 * @private
	 * @param {string} subDir 子目录
	 * @returns {string} 目录路径
	 */
	private getStorageDirectory(subDir?: string): string {
		const baseDir = path.join(this.app.baseDir, FilesService.STORAGE_DIR)
		return subDir ? path.join(baseDir, subDir) : baseDir
	}

	/**
	 * 计算文件哈希
	 *
	 * @private
	 * @param {string} filePath 文件路径
	 * @returns {Promise<string>} 文件哈希
	 */
	private calculateFileHash(filePath: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const hash = crypto.createHash('sha256')
			const stream = fs.createReadStream(filePath)

			stream.on('data', data => hash.update(data))
			stream.on('end', () => resolve(hash.digest('hex')))
			stream.on('error', reject)
		})
	}
}
