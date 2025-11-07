import { Service } from 'egg'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'crypto'
import { DatabaseManager } from '../lib/database'
import { PathValidator } from '../utils/validation'
import { initEncryption, encryptObject, decryptObject } from '../utils/encryption'

/** 面板类型定义 */
type PanelType = 'bt' | '1panel'

/** 会话信息接口 */
interface SessionInfo {
	expiresAt: number
	createdAt: number
}

/** 面板配置接口 */
interface PanelConfig {
	url: string
	key: string
}

/** JSON存储数据结构接口（用于桌面设置等） */
interface JsonStorageData {
	desktop: {
		settings: Record<string, any>
		display: Record<string, any>
	}
}

/** SQLite会话记录接口 */
interface SessionRecord {
	id: string
	expires_at: number
	created_at: number
	updated_at?: number
}

/** SQLite认证记录接口 */
interface AuthRecord {
	key: string
	value: string
	created_at?: number
	updated_at?: number
}

/** SQLite面板记录接口 */
interface PanelRecord {
	type: string
	url: string
	key: string
	created_at?: number
	updated_at?: number
}

/**
 * 存储服务类
 *
 * 提供应用的数据持久化能力（SQLite + JSON混合存储）：
 * - SQLite存储：会话、2FA密钥、面板配置
 * - JSON存储：桌面设置、桌面显示配置
 */
export default class StorageService extends Service {
	/** 会话ID长度（字节） */
	private static readonly SESSION_ID_BYTES = 32

	/** 2FA密钥存储键名 */
	private static readonly TWOFA_SECRET_KEY = 'twofa_secret'

	/** 验证方式存储键名 */
	private static readonly AUTH_METHOD_KEY = 'auth_method'

	/** 用户名存储键名 */
	private static readonly USERNAME_KEY = 'username'

	/** SQLite数据库文件路径 */
	private static readonly DB_FILE_PATH = 'data/storage.db'

	/** JSON配置文件路径 */
	private static readonly JSON_FILE_PATH = 'data/config.json'

	/** JSON格式化缩进 */
	private static readonly JSON_INDENT = 2

	private readonly dbManager: DatabaseManager
	private readonly jsonPath: string

	constructor(ctx: any) {
		super(ctx)
		const dbPath = path.join(this.app.baseDir, StorageService.DB_FILE_PATH)
		this.jsonPath = path.join(this.app.baseDir, StorageService.JSON_FILE_PATH)
		
		this.dbManager = new DatabaseManager(dbPath)
		
		// 初始化加密，使用应用密钥或默认密钥
		const encryptionSecret = this.app.config.encryptionSecret || 'default-encryption-secret'
		initEncryption(encryptionSecret)
		
		this.ensureJsonFile()
		this.migrateFromOldStorage()
	}

	/**
	 * 确保JSON配置文件存在
	 *
	 * @private
	 */
	private ensureJsonFile(): void {
		const dir = path.dirname(this.jsonPath)
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true })
		}

		if (!fs.existsSync(this.jsonPath)) {
			const initialData: JsonStorageData = this.createInitialJsonData()
			this.writeJsonDataSync(initialData)
		}
	}

	/**
	 * 创建初始JSON数据结构
	 *
	 * @private
	 * @returns {JsonStorageData} 初始JSON数据结构
	 */
	private createInitialJsonData(): JsonStorageData {
		return {
			desktop: {
				settings: {},
				display: {},
			},
		}
	}

	/**
	 * 读取JSON配置数据
	 *
	 * @private
	 * @returns {JsonStorageData} JSON配置数据，读取失败时返回初始数据
	 */
	private readJsonData(): JsonStorageData {
		try {
			const content = fs.readFileSync(this.jsonPath, 'utf8')
			return JSON.parse(content)
		} catch (error) {
			// 读取失败时返回初始数据结构
			return this.createInitialJsonData()
		}
	}

	/**
	 * 写入JSON配置数据
	 *
	 * @private
	 * @param {JsonStorageData} data 要写入的数据
	 */
	private writeJsonData(data: JsonStorageData): void {
		this.writeJsonDataSync(data)
	}

	/**
	 * 同步写入JSON配置数据
	 *
	 * @private
	 * @param {JsonStorageData} data 要写入的数据
	 */
	private writeJsonDataSync(data: JsonStorageData): void {
		fs.writeFileSync(this.jsonPath, JSON.stringify(data, null, StorageService.JSON_INDENT))
	}

	/**
	 * 从旧的JSON存储迁移数据到SQLite
	 *
	 * @private
	 */
	private migrateFromOldStorage(): void {
		const oldDataPath = path.join(this.app.baseDir, 'data/storage.json')
		if (!fs.existsSync(oldDataPath)) {
			return
		}

		try {
			const content = fs.readFileSync(oldDataPath, 'utf8')
			const oldData = JSON.parse(content)

			// 迁移认证数据
			if (oldData.auth) {
				for (const [key, value] of Object.entries(oldData.auth)) {
					this.dbManager.upsert('auth', { key, value }, ['key'])
				}
			}

			// 迁移会话数据
			if (oldData.sessions) {
				for (const [sessionId, sessionInfo] of Object.entries(oldData.sessions)) {
					const session = sessionInfo as SessionInfo
					this.dbManager.upsert(
						'sessions',
						{
							id: sessionId,
							expires_at: session.expiresAt,
							created_at: session.createdAt,
						},
						['id']
					)
				}
			}

			// 迁移面板数据
			if (oldData.panels) {
				for (const [type, config] of Object.entries(oldData.panels)) {
					const panel = config as PanelConfig
					this.dbManager.upsert(
						'panels',
						{
							type,
							url: panel.url,
							key: panel.key,
						},
						['type']
					)
				}
			}

			// 备份旧文件并删除
			const backupPath = `${oldDataPath}.backup.${Date.now()}`
			fs.renameSync(oldDataPath, backupPath)
			this.app.logger.info(`Migrated storage data from ${oldDataPath} to SQLite, backup saved to ${backupPath}`)
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			this.app.logger.error(`Failed to migrate old storage data: ${message}`)
		}
	}

	/**
	 * 设置 2FA 密钥
	 *
	 * @param {string} secret 2FA密钥
	 */
	setTwoFASecret(secret: string): void {
		// 加密2FA密钥
		const encryptedSecret = encryptText(secret)
		
		this.dbManager.upsert(
			'auth',
			{
				key: StorageService.TWOFA_SECRET_KEY,
				value: encryptedSecret,
			},
			['key']
		)
	}

	/**
	 * 获取 2FA 密钥
	 *
	 * @returns {string | null} 2FA密钥，不存在时返回null
	 */
	getTwoFASecret(): string | null {
		const record = this.dbManager.get<AuthRecord>(
			'SELECT value FROM auth WHERE key = ?',
			StorageService.TWOFA_SECRET_KEY
		)
		
		if (!record) {
			return null
		}
		
		// 解密2FA密钥
		try {
			return decryptText(record.value)
		} catch (error) {
			// 如果解密失败，可能是旧版本存储的未加密密钥
			this.app.logger.warn('Failed to decrypt 2FA secret, using as plaintext')
			return record.value
		}
	}

	/**
	 * 设置验证方式
	 *
	 * @param {'password' | 'totp'} method 验证方式
	 * @param {string} [password] 密码（当method为'password'时必需）
	 * @param {string} [secret] 2FA密钥（当method为'totp'时必需）
	 */
	setAuthMethod(
		method: 'password' | 'totp',
		password?: string,
		secret?: string
	): void {
		if (method === 'password') {
			if (!password) {
				throw new Error('Password is required when auth method is password')
			}
			// 生成密码哈希
			const passwordHash = crypto.createHash('sha256').update(password).digest('hex')
			this.dbManager.upsert(
				'auth',
				{
					key: StorageService.AUTH_METHOD_KEY,
					value: method,
				},
				['key']
			)
			this.dbManager.upsert(
				'auth',
				{
					key: 'password_hash',
					value: passwordHash,
				},
				['key']
			)
		} else if (method === 'totp') {
			if (!secret) {
				throw new Error('2FA secret is required when auth method is totp')
			}
			this.dbManager.upsert(
				'auth',
				{
					key: StorageService.AUTH_METHOD_KEY,
					value: method,
				},
				['key']
			)
		}
	}

	/**
	 * 获取验证方式
	 *
	 * @returns {'password' | 'totp' | null} 验证方式，不存在时返回null
	 */
	getAuthMethod(): 'password' | 'totp' | null {
		const record = this.dbManager.get<AuthRecord>(
			'SELECT value FROM auth WHERE key = ?',
			StorageService.AUTH_METHOD_KEY
		)
		return (record?.value as 'password' | 'totp') || null
	}

	/**
	 * 验证密码
	 *
	 * @param {string} password 明文密码
	 * @returns {boolean} 验证是否成功
	 */
	verifyPassword(password: string): boolean {
		const hashRecord = this.dbManager.get<AuthRecord>(
			'SELECT value FROM auth WHERE key = ?',
			'password_hash'
		)
		if (!hashRecord) {
			return false
		}
		const inputHash = crypto.createHash('sha256').update(password).digest('hex')
		return inputHash === hashRecord.value
	}

	/**
	 * 设置用户名
	 *
	 * @param {string} username 用户名
	 */
	setUsername(username: string): void {
		this.dbManager.upsert(
			'auth',
			{
				key: StorageService.USERNAME_KEY,
				value: username,
			},
			['key']
		)
	}

	/**
	 * 获取用户名
	 *
	 * @returns {string} 用户名，默认返回 'admin'
	 */
	getUsername(): string {
		const record = this.dbManager.get<AuthRecord>(
			'SELECT value FROM auth WHERE key = ?',
			StorageService.USERNAME_KEY
		)
		return record?.value || 'admin'
	}

	/**
	 * 创建用户会话
	 *
	 * @param {number} ttlMs 会话生存时间（毫秒）
	 * @returns {string} 会话ID
	 */
	createSession(ttlMs: number): string {
		const sessionId = this.generateSessionId()
		const now = Date.now()

		this.dbManager.insert('sessions', {
			id: sessionId,
			expires_at: now + ttlMs,
			created_at: now,
		})

		return sessionId
	}

	/**
	 * 生成会话ID
	 *
	 * @private
	 * @returns {string} 随机生成的会话ID
	 */
	private generateSessionId(): string {
		return crypto.randomBytes(StorageService.SESSION_ID_BYTES).toString('hex')
	}

	/**
	 * 验证会话是否有效
	 *
	 * @param {string} sessionId 会话ID
	 * @returns {boolean} 会话是否有效
	 */
	isValidSession(sessionId: string): boolean {
		if (!sessionId) {
			return false
		}

		const session = this.dbManager.get<SessionRecord>(
			'SELECT * FROM sessions WHERE id = ?',
			sessionId
		)

		if (!session) {
			return false
		}

		if (this.isSessionExpired(session)) {
			// 清理过期会话
			this.removeExpiredSession(sessionId)
			return false
		}

		return true
	}

	/**
	 * 检查会话是否过期
	 *
	 * @private
	 * @param {SessionRecord} session 会话记录
	 * @returns {boolean} 是否过期
	 */
	private isSessionExpired(session: SessionRecord): boolean {
		return session.expires_at <= Date.now()
	}

	/**
	 * 移除过期会话
	 *
	 * @private
	 * @param {string} sessionId 会话ID
	 */
	private removeExpiredSession(sessionId: string): void {
		this.dbManager.delete('sessions', 'id = ?', sessionId)
	}

	/**
	 * 删除会话
	 *
	 * @param {string} sessionId 会话ID
	 */
	deleteSession(sessionId: string): void {
		this.dbManager.delete('sessions', 'id = ?', sessionId)
	}

	/**
	 * 绑定面板密钥
	 *
	 * @param {PanelType} type 面板类型
	 * @param {string} url 面板地址
	 * @param {string} key 面板密钥
	 */
	bindPanelKey(type: PanelType, url: string, key: string): void {
		// 加密面板密钥
		const encryptedKey = encryptText(key)
		
		this.dbManager.upsert(
			'panels',
			{
				type,
				url,
				key: encryptedKey,
			},
			['type']
		)
	}

	/**
	 * 获取面板配置
	 *
	 * @param {PanelType} type 面板类型
	 * @returns {PanelConfig | null} 面板配置，不存在时返回null
	 */
	getPanel(type: PanelType): PanelConfig | null {
		const record = this.dbManager.get<PanelRecord>(
			'SELECT url, key FROM panels WHERE type = ?',
			type
		)
		if (!record) {
			return null
		}
		
		// 解密面板密钥
		let decryptedKey: string
		try {
			decryptedKey = decryptText(record.key)
		} catch (error) {
			// 如果解密失败，可能是旧版本存储的未加密密钥
			this.app.logger.warn(`Failed to decrypt panel key for ${type}, using as plaintext`)
			decryptedKey = record.key
		}
		
		return { url: record.url, key: decryptedKey }
	}

	/**
	 * 清理所有过期会话
	 *
	 * @returns {number} 清理的会话数量
	 */
	cleanupExpiredSessions(): number {
		const now = Date.now()
		const result = this.dbManager.run(
			'DELETE FROM sessions WHERE expires_at <= ?',
			now
		)
		return result.changes
	}

	/**
	 * 获取桌面设置
	 *
	 * @param {string} key 设置键名
	 * @returns {any} 设置值，不存在时返回null
	 */
	getDesktopSetting(key: string): any {
		const data = this.readJsonData()
		return data.desktop.settings[key] || null
	}

	/**
	 * 设置桌面设置
	 *
	 * @param {string} key 设置键名
	 * @param {any} value 设置值
	 */
	setDesktopSetting(key: string, value: any): void {
		const data = this.readJsonData()
		data.desktop.settings[key] = value
		this.writeJsonData(data)
	}

	/**
	 * 获取桌面显示配置
	 *
	 * @param {string} key 配置键名
	 * @returns {any} 配置值，不存在时返回null
	 */
	getDesktopDisplay(key: string): any {
		const data = this.readJsonData()
		return data.desktop.display[key] || null
	}

	/**
	 * 设置桌面显示配置
	 *
	 * @param {string} key 配置键名
	 * @param {any} value 配置值
	 */
	setDesktopDisplay(key: string, value: any): void {
		const data = this.readJsonData()
		data.desktop.display[key] = value
		this.writeJsonData(data)
	}

	/**
	 * 获取存储统计信息
	 *
	 * @returns {object} 统计信息
	 */
	getStorageStats(): {
		sqlite: {
			sessions: number
			auth: number
			panels: number
		}
		json: {
			desktopSettings: number
			desktopDisplay: number
		}
	} {
		const jsonData = this.readJsonData()
		return {
			sqlite: this.dbManager.getStats(),
			json: {
				desktopSettings: Object.keys(jsonData.desktop.settings).length,
				desktopDisplay: Object.keys(jsonData.desktop.display).length,
			},
		}
	}

	/**
	 * 关闭存储服务
	 */
	close(): void {
		this.dbManager.close()
	}

	// ==================== 插件管理相关方法 ====================

	/**
	 * 创建新插件
	 *
	 * @param {object} pluginData 插件数据
	 * @returns {number} 新插件的 ID
	 */
	createPlugin(pluginData: {
		name: string
		description?: string
		author?: string
		repository_url?: string
		homepage_url?: string
		keywords?: string
		license?: string
		category?: string
		is_official?: boolean
		published_at?: number
	}): number {
		return this.dbManager.createPlugin(pluginData)
	}

	/**
	 * 获取插件列表
	 *
	 * @param {object} options 查询选项
	 * @returns {array} 插件列表
	 */
	getPlugins(options?: {
		limit?: number
		offset?: number
		category?: string
		author?: string
		search?: string
	}): any[] {
		return this.dbManager.getPlugins(options)
	}

	/**
	 * 根据 ID 获取插件详情
	 *
	 * @param {number} id 插件 ID
	 * @returns {object|null} 插件详情
	 */
	getPluginById(id: number): any {
		return this.dbManager.getPluginById(id)
	}

	/**
	 * 根据名称获取插件
	 *
	 * @param {string} name 插件名称
	 * @returns {object|null} 插件信息
	 */
	getPluginByName(name: string): any {
		return this.dbManager.getPluginByName(name)
	}

	/**
	 * 更新插件信息
	 *
	 * @param {number} id 插件 ID
	 * @param {object} updates 更新数据
	 * @returns {Database.RunResult} 执行结果
	 */
	updatePlugin(id: number, updates: {
		description?: string
		author?: string
		repository_url?: string
		homepage_url?: string
		keywords?: string
		license?: string
		category?: string
		download_count?: number
		rating?: number
	}): any {
		return this.dbManager.updatePlugin(id, updates)
	}

	/**
	 * 删除插件
	 *
	 * @param {number} id 插件 ID
	 * @returns {Database.RunResult} 执行结果
	 */
	deletePlugin(id: number): any {
		return this.dbManager.deletePlugin(id)
	}

	/**
	 * 创建新版本
	 *
	 * @param {object} versionData 版本数据
	 * @returns {number} 新版本的 ID
	 */
	createPluginVersion(versionData: {
		plugin_id: number
		version: string
		manifest: string
		package_url: string
		package_size?: number
		checksum?: string
		min_linglongos_version?: string
		engines?: string
		dependencies?: string
		peer_dependencies?: string
		readme?: string
		changelog?: string
		download_url?: string
		published_at?: number
		is_latest?: boolean
	}): number {
		return this.dbManager.createPluginVersion(versionData)
	}

	/**
	 * 获取版本详情
	 *
	 * @param {number} id 版本 ID
	 * @returns {object|null} 版本信息
	 */
	getPluginVersionById(id: number): any {
		return this.dbManager.getPluginVersionById(id)
	}

	/**
	 * 获取插件的所有版本
	 *
	 * @param {number} pluginId 插件 ID
	 * @returns {array} 版本列表
	 */
	getPluginVersions(pluginId: number): any[] {
		return this.dbManager.getPluginVersions(pluginId)
	}

	/**
	 * 标记版本为最新
	 *
	 * @param {number} versionId 版本 ID
	 * @param {number} pluginId 插件 ID
	 * @returns {Database.RunResult} 执行结果
	 */
	markAsLatest(versionId: number, pluginId: number): any {
		return this.dbManager.markAsLatest(versionId, pluginId)
	}

	/**
	 * 递增下载计数
	 *
	 * @param {number} pluginId 插件 ID
	 * @param {number} versionId 版本 ID（可选）
	 * @returns {void}
	 */
	incrementDownloadCount(pluginId: number, versionId?: number): void {
		this.dbManager.incrementDownloadCount(pluginId, versionId)
	}

	/**
	 * 获取插件分类列表
	 *
	 * @returns {array} 分类列表
	 */
	getPluginCategories(): any[] {
		return this.dbManager.getPluginCategories()
	}

	// ==================== 文件管理相关方法 ====================

	/**
	 * 创建文件记录
	 *
	 * @param {object} fileData 文件数据
	 * @returns {number} 文件ID
	 */
	createFile(fileData: {
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
	}): number {
		return this.dbManager.createFile(fileData)
	}

	/**
	 * 获取文件列表
	 *
	 * @param {object} options 查询选项
	 * @returns {array} 文件列表
	 */
	getFiles(options?: {
		limit?: number
		offset?: number
		directory?: string
		owner_id?: string
		mime_type?: string
		search?: string
	}): any[] {
		return this.dbManager.getFiles(options)
	}

	/**
	 * 根据ID获取文件详情
	 *
	 * @param {number} id 文件ID
	 * @returns {object|null} 文件信息
	 */
	getFileById(id: number): any {
		return this.dbManager.getFileById(id)
	}

	/**
	 * 根据hash获取文件
	 *
	 * @param {string} hash 文件哈希
	 * @returns {object|null} 文件信息
	 */
	getFileByHash(hash: string): any {
		return this.dbManager.getFileByHash(hash)
	}

	/**
	 * 更新文件信息
	 *
	 * @param {number} id 文件ID
	 * @param {object} updates 更新数据
	 * @returns {any} 执行结果
	 */
	updateFile(id: number, updates: {
		filename?: string
		directory?: string
		permissions?: string
		is_public?: boolean
		metadata?: any
	}): any {
		return this.dbManager.updateFile(id, updates)
	}

	/**
	 * 删除文件（软删除）
	 *
	 * @param {number} id 文件ID
	 * @returns {any} 执行结果
	 */
	deleteFile(id: number): any {
		return this.dbManager.deleteFile(id)
	}

	/**
	 * 永久删除文件
	 *
	 * @param {number} id 文件ID
	 * @returns {any} 执行结果
	 */
	permanentlyDeleteFile(id: number): any {
		return this.dbManager.permanentlyDeleteFile(id)
	}

	/**
	 * 获取目录列表
	 *
	 * @param {string} parentDir 父目录
	 * @returns {array} 目录列表
	 */
	getDirectories(parentDir?: string): any[] {
		return this.dbManager.getDirectories(parentDir)
	}

	/**
	 * 获取文件统计信息
	 *
	 * @returns {object} 统计信息
	 */
	getFileStats(): {
		total_files: number
		total_size: number
		file_types: any[]
	} {
		return this.dbManager.getFileStats()
	}

	/**
	 * 执行事务
	 *
	 * @param {() => T} fn 事务函数
	 * @returns {T} 事务函数的返回值
	 */
	transaction<T>(fn: () => T): T {
		return this.dbManager.transaction(fn)
	}

	/**
	 * 获取数据库管理器实例
	 *
	 * @returns {DatabaseManager} 数据库管理器实例
	 */
	getDatabase(): DatabaseManager {
		return this.dbManager
	}

	// ==================== 插件实例管理相关方法 ====================

	/**
	 * 创建插件实例
	 *
	 * @param {object} instanceData 实例数据
	 * @returns {number} 实例ID
	 */
	createPluginInstance(instanceData: {
		plugin_id: number
		version_id: number
		instance_name: string
		config?: any
		status?: string
		host_process_id?: string
		sandbox_url?: string
		mf_remote_name?: string
		port?: number
		metadata?: any
	}): number {
		const stmt = (this.dbManager as any).prepare(`
			INSERT INTO plugin_instances (
				plugin_id, version_id, instance_name, config, status,
				host_process_id, sandbox_url, mf_remote_name, port, metadata
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`)
		const result = stmt.run(
			instanceData.plugin_id,
			instanceData.version_id,
			instanceData.instance_name,
			instanceData.config ? JSON.stringify(instanceData.config) : null,
			instanceData.status || 'stopped',
			instanceData.host_process_id || null,
			instanceData.sandbox_url || null,
			instanceData.mf_remote_name || null,
			instanceData.port || null,
			instanceData.metadata ? JSON.stringify(instanceData.metadata) : null,
		)
		return result.lastInsertRowid as number
	}

	/**
	 * 获取插件实例列表
	 *
	 * @param {number} pluginId 插件ID
	 * @returns {array} 实例列表
	 */
	getPluginInstances(pluginId: number): any[] {
		return this.dbManager.all(`
			SELECT
				pi.*,
				p.name as plugin_name,
				pv.version as plugin_version
			FROM plugin_instances pi
			LEFT JOIN plugins p ON pi.plugin_id = p.id
			LEFT JOIN plugin_versions pv ON pi.version_id = pv.id
			WHERE pi.plugin_id = ?
			ORDER BY pi.created_at DESC
		`, pluginId)
	}

	/**
	 * 根据ID获取插件实例
	 *
	 * @param {number} id 实例ID
	 * @returns {object|null} 实例信息
	 */
	getPluginInstanceById(id: number): any {
		return this.dbManager.get(`
			SELECT
				pi.*,
				p.name as plugin_name,
				pv.version as plugin_version
			FROM plugin_instances pi
			LEFT JOIN plugins p ON pi.plugin_id = p.id
			LEFT JOIN plugin_versions pv ON pi.version_id = pv.id
			WHERE pi.id = ?
		`, id)
	}

	/**
	 * 更新插件实例
	 *
	 * @param {number} id 实例ID
	 * @param {object} updates 更新数据
	 * @returns {any} 执行结果
	 */
	updatePluginInstance(id: number, updates: {
		config?: any
		status?: string
		host_process_id?: string
		sandbox_url?: string
		mf_remote_name?: string
		port?: number
		metadata?: any
	}): any {
		const fields: string[] = []
		const values: any[] = []

		if (updates.config !== undefined) {
			fields.push('config = ?')
			values.push(JSON.stringify(updates.config))
		}
		if (updates.status !== undefined) {
			fields.push('status = ?')
			values.push(updates.status)
		}
		if (updates.host_process_id !== undefined) {
			fields.push('host_process_id = ?')
			values.push(updates.host_process_id)
		}
		if (updates.sandbox_url !== undefined) {
			fields.push('sandbox_url = ?')
			values.push(updates.sandbox_url)
		}
		if (updates.mf_remote_name !== undefined) {
			fields.push('mf_remote_name = ?')
			values.push(updates.mf_remote_name)
		}
		if (updates.port !== undefined) {
			fields.push('port = ?')
			values.push(updates.port)
		}
		if (updates.metadata !== undefined) {
			fields.push('metadata = ?')
			values.push(JSON.stringify(updates.metadata))
		}

		if (fields.length === 0) {
			throw new Error('No fields to update')
		}

		values.push(id)
		const sql = `UPDATE plugin_instances SET ${fields.join(', ')} WHERE id = ?`
		return this.dbManager.run(sql, ...values)
	}

	/**
	 * 删除插件实例
	 *
	 * @param {number} id 实例ID
	 * @returns {any} 执行结果
	 */
	deletePluginInstance(id: number): any {
		return this.dbManager.run('DELETE FROM plugin_instances WHERE id = ?', id)
	}

	// ==================== 插件事件管理相关方法 ====================

	/**
	 * 记录插件事件
	 *
	 * @param {object} eventData 事件数据
	 * @returns {number} 事件ID
	 */
	logPluginEvent(eventData: {
		plugin_id: number
		instance_id?: number
		event_type: string
		event_data?: any
		user_id?: string
		source_ip?: string
		error_message?: string
		stack_trace?: string
	}): number {
		const stmt = (this.dbManager as any).prepare(`
			INSERT INTO plugin_events (
				plugin_id, instance_id, event_type, event_data,
				user_id, source_ip, error_message, stack_trace
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		`)
		const result = stmt.run(
			eventData.plugin_id,
			eventData.instance_id || null,
			eventData.event_type,
			eventData.event_data ? JSON.stringify(eventData.event_data) : null,
			eventData.user_id || null,
			eventData.source_ip || null,
			eventData.error_message || null,
			eventData.stack_trace || null,
		)
		return result.lastInsertRowid as number
	}

	/**
	 * 获取插件事件列表
	 *
	 * @param {number} pluginId 插件ID
	 * @param {object} options 查询选项
	 * @returns {array} 事件列表
	 */
	getPluginEvents(pluginId: number, options?: {
		limit?: number
		offset?: number
		event_type?: string
		instance_id?: number
	}): any[] {
		let sql = `
			SELECT
				pe.*,
				p.name as plugin_name,
				pi.instance_name
			FROM plugin_events pe
			LEFT JOIN plugins p ON pe.plugin_id = p.id
			LEFT JOIN plugin_instances pi ON pe.instance_id = pi.id
			WHERE pe.plugin_id = ?
		`
		const params: any[] = [pluginId]

		if (options?.event_type) {
			sql += ' AND pe.event_type = ?'
			params.push(options.event_type)
		}
		if (options?.instance_id) {
			sql += ' AND pe.instance_id = ?'
			params.push(options.instance_id)
		}

		sql += ' ORDER BY pe.created_at DESC'

		if (options?.limit) {
			sql += ' LIMIT ?'
			params.push(options.limit)
		}
		if (options?.offset) {
			sql += ' OFFSET ?'
			params.push(options.offset)
		}

		return this.dbManager.all(sql, ...params)
	}

	/**
	 * 获取插件事件统计
	 *
	 * @param {number} pluginId 插件ID
	 * @returns {object} 统计信息
	 */
	getPluginEventStats(pluginId: number): any {
		return this.dbManager.get(`
			SELECT
				event_type,
				COUNT(*) as count,
				MIN(created_at) as first_event,
				MAX(created_at) as last_event
			FROM plugin_events
			WHERE plugin_id = ?
			GROUP BY event_type
		`, pluginId)
	}

	// ==================== 插件权限管理相关方法 ====================

	/**
	 * 设置插件权限
	 *
	 * @param {number} pluginId 插件ID
	 * @param {object} permission 权限数据
	 * @returns {number} 权限ID
	 */
	setPluginPermission(pluginId: number, permission: {
		permission_name: string
		permission_type?: 'allow' | 'deny'
		resource_pattern?: string
		conditions?: any
	}): number {
		const stmt = (this.dbManager as any).prepare(`
			INSERT INTO plugin_permissions (
				plugin_id, permission_name, permission_type,
				resource_pattern, conditions
			) VALUES (?, ?, ?, ?, ?)
			ON CONFLICT(plugin_id, permission_name)
			DO UPDATE SET
				permission_type = excluded.permission_type,
				resource_pattern = excluded.resource_pattern,
				conditions = excluded.conditions,
				updated_at = strftime('%s', 'now') * 1000
		`)
		const result = stmt.run(
			pluginId,
			permission.permission_name,
			permission.permission_type || 'allow',
			permission.resource_pattern || null,
			permission.conditions ? JSON.stringify(permission.conditions) : null,
		)
		return result.lastInsertRowid as number
	}

	/**
	 * 获取插件权限列表
	 *
	 * @param {number} pluginId 插件ID
	 * @returns {array} 权限列表
	 */
	getPluginPermissions(pluginId: number): any[] {
		return this.dbManager.all(`
			SELECT * FROM plugin_permissions
			WHERE plugin_id = ?
			ORDER BY permission_name
		`, pluginId)
	}

	/**
	 * 检查插件权限
	 *
	 * @param {number} pluginId 插件ID
	 * @param {string} permission 权限名称
	 * @param {string} resource 资源
	 * @returns {boolean} 是否有权限
	 */
	checkPluginPermission(pluginId: number, permission: string, _resource?: string): boolean {
		const perm = this.dbManager.get(`
			SELECT * FROM plugin_permissions
			WHERE plugin_id = ? AND permission_name = ?
		`, pluginId, permission)

		if (!perm) {
			return false
		}

		if (perm.permission_type === 'allow') {
			return true
		}

		return false
	}

	/**
	 * 删除插件权限
	 *
	 * @param {number} pluginId 插件ID
	 * @param {string} permissionName 权限名称
	 * @returns {any} 执行结果
	 */
	removePluginPermission(pluginId: number, permissionName: string): any {
		return this.dbManager.run(
			'DELETE FROM plugin_permissions WHERE plugin_id = ? AND permission_name = ?',
			pluginId,
			permissionName
		)
	}

	// ==================== 插件主机管理相关方法 ====================

	/**
	 * 创建或更新插件主机
	 *
	 * @param {object} hostData 主机数据
	 * @returns {number} 主机ID
	 */
	upsertPluginHost(hostData: {
		host_name: string
		process_id?: string
		status?: string
		config?: any
		loaded_plugins?: any[]
	}): number {
		const stmt = (this.dbManager as any).prepare(`
			INSERT INTO plugin_hosts (
				host_name, process_id, status, config, loaded_plugins
			) VALUES (?, ?, ?, ?, ?)
			ON CONFLICT(host_name) DO UPDATE SET
				process_id = excluded.process_id,
				status = excluded.status,
				config = excluded.config,
				loaded_plugins = excluded.loaded_plugins,
				updated_at = strftime('%s', 'now') * 1000
		`)
		const result = stmt.run(
			hostData.host_name,
			hostData.process_id || null,
			hostData.status || 'stopped',
			hostData.config ? JSON.stringify(hostData.config) : null,
			hostData.loaded_plugins ? JSON.stringify(hostData.loaded_plugins) : null,
		)
		return result.lastInsertRowid as number
	}

	/**
	 * 获取插件主机列表
	 *
	 * @returns {array} 主机列表
	 */
	getPluginHosts(): any[] {
		return this.dbManager.all(`
			SELECT * FROM plugin_hosts
			ORDER BY host_name
		`)
	}

	/**
	 * 根据名称获取插件主机
	 *
	 * @param {string} hostName 主机名称
	 * @returns {object|null} 主机信息
	 */
	getPluginHostByName(hostName: string): any {
		return this.dbManager.get(`
			SELECT * FROM plugin_hosts
			WHERE host_name = ?
		`, hostName)
	}

	/**
	 * 更新插件主机状态
	 *
	 * @param {string} hostName 主机名称
	 * @param {object} updates 更新数据
	 * @returns {any} 执行结果
	 */
	updatePluginHost(hostName: string, updates: {
		process_id?: string
		status?: string
		config?: any
		loaded_plugins?: any[]
		last_heartbeat?: number
	}): any {
		const fields: string[] = []
		const values: any[] = []

		if (updates.process_id !== undefined) {
			fields.push('process_id = ?')
			values.push(updates.process_id)
		}
		if (updates.status !== undefined) {
			fields.push('status = ?')
			values.push(updates.status)
			if (updates.status === 'running') {
				fields.push('start_time = ?')
				values.push(Date.now())
			} else if (updates.status === 'stopped') {
				fields.push('stop_time = ?')
				values.push(Date.now())
			}
		}
		if (updates.config !== undefined) {
			fields.push('config = ?')
			values.push(JSON.stringify(updates.config))
		}
		if (updates.loaded_plugins !== undefined) {
			fields.push('loaded_plugins = ?')
			values.push(JSON.stringify(updates.loaded_plugins))
		}
		if (updates.last_heartbeat !== undefined) {
			fields.push('last_heartbeat = ?')
			values.push(updates.last_heartbeat)
		}

		if (fields.length === 0) {
			throw new Error('No fields to update')
		}

		values.push(hostName)
		const sql = `UPDATE plugin_hosts SET ${fields.join(', ')} WHERE host_name = ?`
		return this.dbManager.run(sql, ...values)
	}

	/**
	 * 删除插件主机
	 *
	 * @param {string} hostName 主机名称
	 * @returns {any} 执行结果
	 */
	deletePluginHost(hostName: string): any {
		return this.dbManager.run('DELETE FROM plugin_hosts WHERE host_name = ?', hostName)
	}

	/**
	 * 获取插件主机状态
	 *
	 * @returns {object} 状态信息
	 */
	getPluginHostStatus(): any {
		const hosts = this.dbManager.all(`
			SELECT
				host_name,
				status,
				last_heartbeat,
				CASE
					WHEN last_heartbeat IS NULL THEN 'no-heartbeat'
					WHEN (strftime('%s', 'now') * 1000) - last_heartbeat > 30000 THEN 'timeout'
					ELSE 'healthy'
				END as health_status
			FROM plugin_hosts
			ORDER BY host_name
		`)

		return {
			hosts,
			total: hosts.length,
			healthy: hosts.filter(h => h.health_status === 'healthy').length,
			timeout: hosts.filter(h => h.health_status === 'timeout').length,
			no_heartbeat: hosts.filter(h => h.health_status === 'no-heartbeat').length,
		}
	}
}
