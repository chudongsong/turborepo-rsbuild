import Database from 'better-sqlite3'
import path from 'node:path'
import fs from 'node:fs'

/**
 * SQLite数据库操作封装类
 *
 * 提供常用的数据库操作方法，简化SQLite的使用：
 * - 数据库连接管理
 * - 表结构初始化
 * - 通用CRUD操作
 * - 事务支持
 * - 错误处理
 */
export class DatabaseManager {
	/** 数据库实例 */
	private db: Database.Database

	/** 数据库文件路径 */
	private readonly dbPath: string

	/**
	 * 构造函数
	 *
	 * @param {string} dbPath 数据库文件路径
	 * @param {boolean} readonly 是否只读模式（默认：false）
	 */
	constructor(dbPath: string, readonly: boolean = false) {
		this.dbPath = dbPath
		this.ensureDbDirectory()
		this.db = new Database(dbPath, { readonly })
		this.initializeDatabase()
	}

	/**
	 * 确保数据库目录存在
	 *
	 * @private
	 */
	private ensureDbDirectory(): void {
		const dir = path.dirname(this.dbPath)
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true })
		}
	}

	/**
	 * 初始化数据库
	 *
	 * @private
	 */
	private initializeDatabase(): void {
		// 启用外键约束
		this.db.pragma('foreign_keys = ON')
		// 设置WAL模式以提高并发性能
		this.db.pragma('journal_mode = WAL')
		// 创建表结构
		this.createTables()
	}

	/**
	 * 创建数据库表结构
	 *
	 * @private
	 */
	private createTables(): void {
		// 会话表
		this.db.exec(`
			CREATE TABLE IF NOT EXISTS sessions (
				id TEXT PRIMARY KEY,
				expires_at INTEGER NOT NULL,
				created_at INTEGER NOT NULL,
				updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
			)
		`)

		// 认证表
		this.db.exec(`
			CREATE TABLE IF NOT EXISTS auth (
				key TEXT PRIMARY KEY,
				value TEXT NOT NULL,
				created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
				updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
			)
		`)

		// 面板配置表
		this.db.exec(`
			CREATE TABLE IF NOT EXISTS panels (
				type TEXT PRIMARY KEY,
				url TEXT NOT NULL,
				key TEXT NOT NULL,
				created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
				updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
			)
		`)

		// 插件基本信息表
		this.db.exec(`
			CREATE TABLE IF NOT EXISTS plugins (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name VARCHAR(255) NOT NULL UNIQUE,
				description TEXT,
				author VARCHAR(255),
				repository_url VARCHAR(255),
				homepage_url VARCHAR(255),
				keywords TEXT,
				license VARCHAR(100),
				category VARCHAR(100),
				is_official BOOLEAN DEFAULT 0,
				download_count INTEGER DEFAULT 0,
				rating DECIMAL(3,2) DEFAULT 0.0,
				published_at INTEGER,
				updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
				created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
			)
		`)

		// 插件版本信息表
		this.db.exec(`
			CREATE TABLE IF NOT EXISTS plugin_versions (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				plugin_id INTEGER NOT NULL,
				version VARCHAR(255) NOT NULL,
				manifest TEXT NOT NULL,
				package_url VARCHAR(255) NOT NULL,
				package_size INTEGER,
				checksum VARCHAR(64),
				min_linglongos_version VARCHAR(50),
				engines TEXT,
				dependencies TEXT,
				peer_dependencies TEXT,
				readme TEXT,
				changelog TEXT,
				download_url VARCHAR(255),
				download_count INTEGER DEFAULT 0,
				published_at INTEGER,
				is_latest BOOLEAN DEFAULT 0,
				status VARCHAR(50) DEFAULT 'published',
				created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
				updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
				FOREIGN KEY (plugin_id) REFERENCES plugins(id) ON DELETE CASCADE,
				UNIQUE(plugin_id, version)
			)
		`)

		// 创建索引以提高查询性能
		this.db.exec(`
			CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
			CREATE INDEX IF NOT EXISTS idx_auth_key ON auth(key);
			CREATE INDEX IF NOT EXISTS idx_panels_type ON panels(type);
			CREATE INDEX IF NOT EXISTS idx_plugins_name ON plugins(name);
			CREATE INDEX IF NOT EXISTS idx_plugins_author ON plugins(author);
			CREATE INDEX IF NOT EXISTS idx_plugins_category ON plugins(category);
			CREATE INDEX IF NOT EXISTS idx_plugin_versions_plugin_id ON plugin_versions(plugin_id);
			CREATE INDEX IF NOT EXISTS idx_plugin_versions_version ON plugin_versions(version);
			CREATE INDEX IF NOT EXISTS idx_plugin_versions_published_at ON plugin_versions(published_at);
		`)

		// 文件管理表
		this.db.exec(`
			CREATE TABLE IF NOT EXISTS files (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				filename VARCHAR(255) NOT NULL,
				original_name VARCHAR(255) NOT NULL,
				mime_type VARCHAR(100) NOT NULL,
				size INTEGER NOT NULL,
				storage_path TEXT NOT NULL,
				hash VARCHAR(64),
				directory VARCHAR(500),
				owner_id VARCHAR(100),
				permissions VARCHAR(50) DEFAULT 'private',
				is_public BOOLEAN DEFAULT 0,
				metadata TEXT,
				created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
				updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
				deleted_at INTEGER
			)
		`)

		// 创建文件索引
		this.db.exec(`
			CREATE INDEX IF NOT EXISTS idx_files_hash ON files(hash);
			CREATE INDEX IF NOT EXISTS idx_files_directory ON files(directory);
			CREATE INDEX IF NOT EXISTS idx_files_owner ON files(owner_id);
			CREATE INDEX IF NOT EXISTS idx_files_mime_type ON files(mime_type);
			CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at);
			CREATE INDEX IF NOT EXISTS idx_files_deleted_at ON files(deleted_at);
		`)
	}

	/**
	 * 执行查询并返回单行结果
	 *
	 * @param {string} sql SQL查询语句
	 * @param {any[]} params 查询参数
	 * @returns {T | undefined} 查询结果，不存在时返回undefined
	 */
	get<T = any>(sql: string, ...params: any[]): T | undefined {
		try {
			const stmt = this.db.prepare(sql)
			return stmt.get(...params) as T | undefined
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			throw new Error(`Database query failed: ${message}`)
		}
	}

	/**
	 * 执行查询并返回多行结果
	 *
	 * @param {string} sql SQL查询语句
	 * @param {any[]} params 查询参数
	 * @returns {T[]} 查询结果数组
	 */
	all<T = any>(sql: string, ...params: any[]): T[] {
		try {
			const stmt = this.db.prepare(sql)
			return stmt.all(...params) as T[]
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			throw new Error(`Database query failed: ${message}`)
		}
	}

	/**
	 * 执行插入、更新或删除操作
	 *
	 * @param {string} sql SQL语句
	 * @param {any[]} params 参数
	 * @returns {Database.RunResult} 执行结果
	 */
	run(sql: string, ...params: any[]): Database.RunResult {
		try {
			const stmt = this.db.prepare(sql)
			return stmt.run(...params)
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			throw new Error(`Database operation failed: ${message}`)
		}
	}

	/**
	 * 插入数据
	 *
	 * @param {string} table 表名
	 * @param {Record<string, any>} data 要插入的数据
	 * @returns {Database.RunResult} 执行结果
	 */
	insert(table: string, data: Record<string, any>): Database.RunResult {
		const keys = Object.keys(data)
		const values = Object.values(data)
		const placeholders = keys.map(() => '?').join(', ')
		const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`
		return this.run(sql, ...values)
	}

	/**
	 * 更新数据
	 *
	 * @param {string} table 表名
	 * @param {Record<string, any>} data 要更新的数据
	 * @param {string} whereClause WHERE条件
	 * @param {any[]} whereParams WHERE参数
	 * @returns {Database.RunResult} 执行结果
	 */
	update(
		table: string,
		data: Record<string, any>,
		whereClause: string,
		...whereParams: any[]
	): Database.RunResult {
		const keys = Object.keys(data)
		const values = Object.values(data)
		const setClause = keys.map(key => `${key} = ?`).join(', ')
		const sql = `UPDATE ${table} SET ${setClause}, updated_at = strftime('%s', 'now') * 1000 WHERE ${whereClause}`
		return this.run(sql, ...values, ...whereParams)
	}

	/**
	 * 删除数据
	 *
	 * @param {string} table 表名
	 * @param {string} whereClause WHERE条件
	 * @param {any[]} whereParams WHERE参数
	 * @returns {Database.RunResult} 执行结果
	 */
	delete(table: string, whereClause: string, ...whereParams: any[]): Database.RunResult {
		const sql = `DELETE FROM ${table} WHERE ${whereClause}`
		return this.run(sql, ...whereParams)
	}

	/**
	 * 插入或更新数据（UPSERT）
	 *
	 * @param {string} table 表名
	 * @param {Record<string, any>} data 数据
	 * @param {string[]} conflictColumns 冲突列
	 * @returns {Database.RunResult} 执行结果
	 */
	upsert(
		table: string,
		data: Record<string, any>,
		conflictColumns: string[]
	): Database.RunResult {
		const keys = Object.keys(data)
		const values = Object.values(data)
		const placeholders = keys.map(() => '?').join(', ')
		const updateClause = keys
			.filter(key => !conflictColumns.includes(key))
			.map(key => `${key} = excluded.${key}`)
			.join(', ')

		const sql = `
			INSERT INTO ${table} (${keys.join(', ')}) 
			VALUES (${placeholders})
			ON CONFLICT(${conflictColumns.join(', ')}) 
			DO UPDATE SET ${updateClause}, updated_at = strftime('%s', 'now') * 1000
		`
		return this.run(sql, ...values)
	}

	/**
	 * 执行事务
	 *
	 * @param {() => T} fn 事务函数
	 * @returns {T} 事务函数的返回值
	 */
	transaction<T>(fn: () => T): T {
		const transaction = this.db.transaction(fn)
		return transaction()
	}

	/**
	 * 检查表是否存在
	 *
	 * @param {string} tableName 表名
	 * @returns {boolean} 表是否存在
	 */
	tableExists(tableName: string): boolean {
		const result = this.get<{ count: number }>(
			"SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name=?",
			tableName
		)
		return (result?.count ?? 0) > 0
	}

	/**
	 * 获取表的行数
	 *
	 * @param {string} tableName 表名
	 * @returns {number} 行数
	 */
	getRowCount(tableName: string): number {
		const result = this.get<{ count: number }>(`SELECT COUNT(*) as count FROM ${tableName}`)
		return result?.count ?? 0
	}

	/**
	 * 清空表数据
	 *
	 * @param {string} tableName 表名
	 * @returns {Database.RunResult} 执行结果
	 */
	truncateTable(tableName: string): Database.RunResult {
		return this.run(`DELETE FROM ${tableName}`)
	}

	/**
	 * 执行原始SQL
	 *
	 * @param {string} sql SQL语句
	 */
	exec(sql: string): void {
		try {
			this.db.exec(sql)
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			throw new Error(`Database exec failed: ${message}`)
		}
	}

	/**
	 * 关闭数据库连接
	 */
	close(): void {
		if (this.db) {
			this.db.close()
		}
	}

	/**
	 * 获取数据库信息
	 *
	 * @returns {object} 数据库信息
	 */
	getInfo(): {
		path: string
		readonly: boolean
		open: boolean
		inTransaction: boolean
	} {
		return {
			path: this.dbPath,
			readonly: this.db.readonly,
			open: this.db.open,
			inTransaction: this.db.inTransaction,
		}
	}

	/**
	 * 备份数据库
	 *
	 * @param {string} backupPath 备份文件路径
	 */
	backup(backupPath: string): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				const backupDb = new Database(backupPath)
				this.db.backup(backupPath)
				backupDb.close()
				resolve()
			} catch (error) {
				reject(error instanceof Error ? error : new Error(String(error)))
			}
		})
	}

	/**
	 * 优化数据库（VACUUM）
	 */
	optimize(): void {
		this.db.exec('VACUUM')
	}

	/**
	 * 获取数据库统计信息
	 *
	 * @returns {object} 统计信息
	 */
	getStats(): {
		sessions: number
		auth: number
		panels: number
		plugins: number
		pluginVersions: number
		files: number
	} {
		return {
			sessions: this.getRowCount('sessions'),
			auth: this.getRowCount('auth'),
			panels: this.getRowCount('panels'),
			plugins: this.getRowCount('plugins'),
			pluginVersions: this.getRowCount('plugin_versions'),
			files: this.getRowCount('files'),
		}
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
		const stmt = this.db.prepare(`
			INSERT INTO plugins (
				name, description, author, repository_url, homepage_url,
				keywords, license, category, is_official, published_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`)
		const result = stmt.run(
			pluginData.name,
			pluginData.description || null,
			pluginData.author || null,
			pluginData.repository_url || null,
			pluginData.homepage_url || null,
			pluginData.keywords || null,
			pluginData.license || null,
			pluginData.category || null,
			pluginData.is_official ? 1 : 0,
			pluginData.published_at || null,
		)
		return result.lastInsertRowid as number
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
		let sql = `
			SELECT
				p.*,
				pv.version as latest_version,
				pv.download_count as latest_download_count
			FROM plugins p
			LEFT JOIN plugin_versions pv ON p.id = pv.plugin_id AND pv.is_latest = 1
			WHERE 1=1
		`
		const params: any[] = []

		if (options?.category) {
			sql += ' AND p.category = ?'
			params.push(options.category)
		}

		if (options?.author) {
			sql += ' AND p.author = ?'
			params.push(options.author)
		}

		if (options?.search) {
			sql += ' AND (p.name LIKE ? OR p.description LIKE ?)'
			params.push(`%${options.search}%`, `%${options.search}%`)
		}

		sql += ' ORDER BY p.download_count DESC, p.updated_at DESC'

		if (options?.limit) {
			sql += ' LIMIT ?'
			params.push(options.limit)
		}

		if (options?.offset) {
			sql += ' OFFSET ?'
			params.push(options.offset)
		}

		return this.all(sql, ...params)
	}

	/**
	 * 根据 ID 获取插件详情
	 *
	 * @param {number} id 插件 ID
	 * @returns {object|null} 插件详情
	 */
	getPluginById(id: number): any {
		const plugin = this.get(`
			SELECT
				p.*,
				pv.version as latest_version,
				pv.download_count as latest_download_count
			FROM plugins p
			LEFT JOIN plugin_versions pv ON p.id = pv.plugin_id AND pv.is_latest = 1
			WHERE p.id = ?
		`, id)

		if (!plugin) return null

		// 获取所有版本
		const versions = this.all(`
			SELECT
				id, version, package_url, package_size,
				min_linglongos_version, published_at,
				is_latest, status, download_count
			FROM plugin_versions
			WHERE plugin_id = ?
			ORDER BY published_at DESC
		`, id)

		return { ...plugin, versions }
	}

	/**
	 * 根据名称获取插件
	 *
	 * @param {string} name 插件名称
	 * @returns {object|null} 插件信息
	 */
	getPluginByName(name: string): any {
		return this.get(`
			SELECT
				p.*,
				pv.version as latest_version,
				pv.download_count as latest_download_count
			FROM plugins p
			LEFT JOIN plugin_versions pv ON p.id = pv.plugin_id AND pv.is_latest = 1
			WHERE p.name = ?
		`, name)
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
	}): Database.RunResult {
		const fields: string[] = []
		const values: any[] = []

		if (updates.description !== undefined) {
			fields.push('description = ?')
			values.push(updates.description)
		}
		if (updates.author !== undefined) {
			fields.push('author = ?')
			values.push(updates.author)
		}
		if (updates.repository_url !== undefined) {
			fields.push('repository_url = ?')
			values.push(updates.repository_url)
		}
		if (updates.homepage_url !== undefined) {
			fields.push('homepage_url = ?')
			values.push(updates.homepage_url)
		}
		if (updates.keywords !== undefined) {
			fields.push('keywords = ?')
			values.push(updates.keywords)
		}
		if (updates.license !== undefined) {
			fields.push('license = ?')
			values.push(updates.license)
		}
		if (updates.category !== undefined) {
			fields.push('category = ?')
			values.push(updates.category)
		}
		if (updates.download_count !== undefined) {
			fields.push('download_count = ?')
			values.push(updates.download_count)
		}
		if (updates.rating !== undefined) {
			fields.push('rating = ?')
			values.push(updates.rating)
		}

		if (fields.length === 0) {
			throw new Error('No fields to update')
		}

		fields.push('updated_at = ?')
		values.push(Date.now())
		values.push(id)

		const sql = `UPDATE plugins SET ${fields.join(', ')} WHERE id = ?`
		return this.run(sql, ...values)
	}

	/**
	 * 删除插件
	 *
	 * @param {number} id 插件 ID
	 * @returns {Database.RunResult} 执行结果
	 */
	deletePlugin(id: number): Database.RunResult {
		return this.run('DELETE FROM plugins WHERE id = ?', id)
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
		// 如果设置为最新版本，先取消其他版本的最新标记
		if (versionData.is_latest) {
			this.run(`
				UPDATE plugin_versions
				SET is_latest = 0, updated_at = ?
				WHERE plugin_id = ?
			`, Date.now(), versionData.plugin_id)
		}

		const stmt = this.db.prepare(`
			INSERT INTO plugin_versions (
				plugin_id, version, manifest, package_url, package_size,
				checksum, min_linglongos_version, engines, dependencies,
				peer_dependencies, readme, changelog, download_url,
				published_at, is_latest
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`)
		const result = stmt.run(
			versionData.plugin_id,
			versionData.version,
			versionData.manifest,
			versionData.package_url,
			versionData.package_size || null,
			versionData.checksum || null,
			versionData.min_linglongos_version || null,
			versionData.engines || null,
			versionData.dependencies || null,
			versionData.peer_dependencies || null,
			versionData.readme || null,
			versionData.changelog || null,
			versionData.download_url || null,
			versionData.published_at || Date.now(),
			versionData.is_latest ? 1 : 0,
		)
		return result.lastInsertRowid as number
	}

	/**
	 * 获取版本详情
	 *
	 * @param {number} id 版本 ID
	 * @returns {object|null} 版本信息
	 */
	getPluginVersionById(id: number): any {
		return this.get(`
			SELECT * FROM plugin_versions WHERE id = ?
		`, id)
	}

	/**
	 * 获取插件的所有版本
	 *
	 * @param {number} pluginId 插件 ID
	 * @returns {array} 版本列表
	 */
	getPluginVersions(pluginId: number): any[] {
		return this.all(`
			SELECT
				id, version, package_url, package_size,
				min_linglongos_version, published_at,
				is_latest, status, download_count
			FROM plugin_versions
			WHERE plugin_id = ?
			ORDER BY published_at DESC
		`, pluginId)
	}

	/**
	 * 标记版本为最新
	 *
	 * @param {number} versionId 版本 ID
	 * @param {number} pluginId 插件 ID
	 * @returns {Database.RunResult} 执行结果
	 */
	markAsLatest(versionId: number, pluginId: number): Database.RunResult {
		const now = Date.now()
		return this.transaction(() => {
			// 取消其他版本的最新标记
			this.run(`
				UPDATE plugin_versions
				SET is_latest = 0, updated_at = ?
				WHERE plugin_id = ? AND id != ?
			`, now, pluginId, versionId)

			// 标记当前版本为最新
			return this.run(`
				UPDATE plugin_versions
				SET is_latest = 1, updated_at = ?
				WHERE id = ?
			`, now, versionId)
		})
	}

	/**
	 * 递增下载计数
	 *
	 * @param {number} pluginId 插件 ID
	 * @param {number} versionId 版本 ID（可选）
	 * @returns {void}
	 */
	incrementDownloadCount(pluginId: number, versionId?: number): void {
		this.transaction(() => {
			// 递增插件下载计数
			this.run(`
				UPDATE plugins
				SET download_count = download_count + 1
				WHERE id = ?
			`, pluginId)

			// 如果指定了版本，递增该版本的下载计数
			if (versionId) {
				this.run(`
					UPDATE plugin_versions
					SET download_count = download_count + 1
					WHERE id = ?
				`, versionId)
			}
		})
	}

	/**
	 * 获取插件分类列表
	 *
	 * @returns {array} 分类列表
	 */
	getPluginCategories(): any[] {
		return this.all(`
			SELECT category, COUNT(*) as count
			FROM plugins
			WHERE category IS NOT NULL
			GROUP BY category
			ORDER BY count DESC
		`)
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
		const stmt = this.db.prepare(`
			INSERT INTO files (
				filename, original_name, mime_type, size, storage_path,
				hash, directory, owner_id, permissions, is_public, metadata
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`)
		const result = stmt.run(
			fileData.filename,
			fileData.original_name,
			fileData.mime_type,
			fileData.size,
			fileData.storage_path,
			fileData.hash || null,
			fileData.directory || null,
			fileData.owner_id || null,
			fileData.permissions || 'private',
			fileData.is_public ? 1 : 0,
			fileData.metadata ? JSON.stringify(fileData.metadata) : null,
		)
		return result.lastInsertRowid as number
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
		let sql = `
			SELECT * FROM files
			WHERE deleted_at IS NULL
		`
		const params: any[] = []

		if (options?.directory) {
			sql += ' AND directory = ?'
			params.push(options.directory)
		}

		if (options?.owner_id) {
			sql += ' AND owner_id = ?'
			params.push(options.owner_id)
		}

		if (options?.mime_type) {
			sql += ' AND mime_type LIKE ?'
			params.push(`${options.mime_type}%`)
		}

		if (options?.search) {
			sql += ' AND (original_name LIKE ? OR filename LIKE ?)'
			params.push(`%${options.search}%`, `%${options.search}%`)
		}

		sql += ' ORDER BY created_at DESC'

		if (options?.limit) {
			sql += ' LIMIT ?'
			params.push(options.limit)
		}

		if (options?.offset) {
			sql += ' OFFSET ?'
			params.push(options.offset)
		}

		return this.all(sql, ...params)
	}

	/**
	 * 根据ID获取文件详情
	 *
	 * @param {number} id 文件ID
	 * @returns {object|null} 文件信息
	 */
	getFileById(id: number): any {
		return this.get('SELECT * FROM files WHERE id = ? AND deleted_at IS NULL', id)
	}

	/**
	 * 根据hash获取文件
	 *
	 * @param {string} hash 文件哈希
	 * @returns {object|null} 文件信息
	 */
	getFileByHash(hash: string): any {
		return this.get('SELECT * FROM files WHERE hash = ? AND deleted_at IS NULL', hash)
	}

	/**
	 * 更新文件信息
	 *
	 * @param {number} id 文件ID
	 * @param {object} updates 更新数据
	 * @returns {Database.RunResult} 执行结果
	 */
	updateFile(id: number, updates: {
		filename?: string
		directory?: string
		permissions?: string
		is_public?: boolean
		metadata?: any
	}): Database.RunResult {
		const fields: string[] = []
		const values: any[] = []

		if (updates.filename !== undefined) {
			fields.push('filename = ?')
			values.push(updates.filename)
		}
		if (updates.directory !== undefined) {
			fields.push('directory = ?')
			values.push(updates.directory)
		}
		if (updates.permissions !== undefined) {
			fields.push('permissions = ?')
			values.push(updates.permissions)
		}
		if (updates.is_public !== undefined) {
			fields.push('is_public = ?')
			values.push(updates.is_public ? 1 : 0)
		}
		if (updates.metadata !== undefined) {
			fields.push('metadata = ?')
			values.push(JSON.stringify(updates.metadata))
		}

		if (fields.length === 0) {
			throw new Error('No fields to update')
		}

		fields.push('updated_at = ?')
		values.push(Date.now())
		values.push(id)

		const sql = `UPDATE files SET ${fields.join(', ')} WHERE id = ?`
		return this.run(sql, ...values)
	}

	/**
	 * 删除文件（软删除）
	 *
	 * @param {number} id 文件ID
	 * @returns {Database.RunResult} 执行结果
	 */
	deleteFile(id: number): Database.RunResult {
		return this.run(
			'UPDATE files SET deleted_at = ?, updated_at = ? WHERE id = ?',
			Date.now(),
			Date.now(),
			id
		)
	}

	/**
	 * 永久删除文件
	 *
	 * @param {number} id 文件ID
	 * @returns {Database.RunResult} 执行结果
	 */
	permanentlyDeleteFile(id: number): Database.RunResult {
		return this.run('DELETE FROM files WHERE id = ?', id)
	}

	/**
	 * 获取目录列表
	 *
	 * @param {string} parentDir 父目录
	 * @returns {array} 目录列表
	 */
	getDirectories(parentDir?: string): any[] {
		let sql = `
			SELECT directory, COUNT(*) as file_count, SUM(size) as total_size
			FROM files
			WHERE deleted_at IS NULL
		`
		const params: any[] = []

		if (parentDir) {
			sql += ' AND directory LIKE ?'
			params.push(`${parentDir}%`)
		} else {
			sql += ' AND directory IS NOT NULL'
		}

		sql += ' GROUP BY directory ORDER BY directory'

		return this.all(sql, ...params)
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
		const total = this.get<{ count: number; size: number }>(`
			SELECT COUNT(*) as count, SUM(size) as size
			FROM files
			WHERE deleted_at IS NULL
		`)

		const fileTypes = this.all(`
			SELECT mime_type, COUNT(*) as count, SUM(size) as total_size
			FROM files
			WHERE deleted_at IS NULL
			GROUP BY mime_type
			ORDER BY count DESC
			LIMIT 10
		`)

		return {
			total_files: total?.count || 0,
			total_size: total?.size || 0,
			file_types: fileTypes,
		}
	}
}

/**
 * 数据库管理器单例
 */
export class DatabaseSingleton {
	private static instance: DatabaseManager | null = null
	private static dbPath: string

	/**
	 * 初始化数据库路径
	 *
	 * @param {string} path 数据库文件路径
	 */
	static initialize(path: string): void {
		DatabaseSingleton.dbPath = path
	}

	/**
	 * 获取数据库实例
	 *
	 * @returns {DatabaseManager} 数据库管理器实例
	 */
	static getInstance(): DatabaseManager {
		if (!DatabaseSingleton.instance) {
			if (!DatabaseSingleton.dbPath) {
				throw new Error('Database path not initialized. Call DatabaseSingleton.initialize() first.')
			}
			DatabaseSingleton.instance = new DatabaseManager(DatabaseSingleton.dbPath)
		}
		return DatabaseSingleton.instance
	}

	/**
	 * 关闭数据库连接
	 */
	static close(): void {
		if (DatabaseSingleton.instance) {
			DatabaseSingleton.instance.close()
			DatabaseSingleton.instance = null
		}
	}
}