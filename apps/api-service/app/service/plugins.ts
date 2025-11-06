import { Service } from 'egg'

/**
 * 插件注册中心服务
 *
 * 提供插件的增删改查、版本管理、分类查询等核心功能
 */
export default class PluginsService extends Service {
  /**
   * 创建新插件
   *
   * @param {object} pluginData 插件数据
   * @returns {Promise<{id: number}>} 插件 ID
   */
  async createPlugin(pluginData: {
    name: string
    description?: string
    author?: string
    repository_url?: string
    homepage_url?: string
    keywords?: string
    license?: string
    category?: string
    is_official?: boolean
  }): Promise<{ id: number }> {
    // 检查插件名是否已存在
    const existing = this.ctx.service.storage.getPluginByName(pluginData.name)
    if (existing) {
      throw new Error('Plugin name already exists')
    }

    const id = this.ctx.service.storage.createPlugin({
      ...pluginData,
      published_at: Date.now(),
    })

    return { id }
  }

  /**
   * 获取插件列表
   *
   * @param {object} options 查询选项
   * @returns {Promise<array>} 插件列表
   */
  async getPlugins(options?: {
    limit?: number
    offset?: number
    category?: string
    author?: string
    search?: string
  }): Promise<any[]> {
    return this.ctx.service.storage.getPlugins(options)
  }

  /**
   * 根据 ID 获取插件详情
   *
   * @param {number} id 插件 ID
   * @returns {Promise<object|null>} 插件详情
   */
  async getPluginById(id: number): Promise<any> {
    return this.ctx.service.storage.getPluginById(id)
  }

  /**
   * 根据名称获取插件
   *
   * @param {string} name 插件名称
   * @returns {Promise<object|null>} 插件信息
   */
  async getPluginByName(name: string): Promise<any> {
    return this.ctx.service.storage.getPluginByName(name)
  }

  /**
   * 更新插件信息
   *
   * @param {number} id 插件 ID
   * @param {object} updates 更新数据
   * @returns {Promise<void>}
   */
  async updatePlugin(
    id: number,
    updates: {
      description?: string
      author?: string
      repository_url?: string
      homepage_url?: string
      keywords?: string
      license?: string
      category?: string
      download_count?: number
      rating?: number
    }
  ): Promise<void> {
    this.ctx.service.storage.updatePlugin(id, updates)
  }

  /**
   * 删除插件
   *
   * @param {number} id 插件 ID
   * @returns {Promise<void>}
   */
  async deletePlugin(id: number): Promise<void> {
    this.ctx.service.storage.deletePlugin(id)
  }

  /**
   * 创建新版本
   *
   * @param {object} versionData 版本数据
   * @returns {Promise<{id: number}>} 版本 ID
   */
  async createPluginVersion(versionData: {
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
    is_latest?: boolean
  }): Promise<{ id: number }> {
    // 验证插件是否存在
    const plugin = this.ctx.service.storage.getPluginById(versionData.plugin_id)
    if (!plugin) {
      throw new Error('Plugin not found')
    }

    // 检查版本是否已存在
    const versions = this.ctx.service.storage.getPluginVersions(versionData.plugin_id)
    if (versions.some(v => v.version === versionData.version)) {
      throw new Error('Version already exists')
    }

    const id = this.ctx.service.storage.createPluginVersion(versionData)
    return { id }
  }

  /**
   * 获取版本详情
   *
   * @param {number} id 版本 ID
   * @returns {Promise<object|null>} 版本信息
   */
  async getPluginVersionById(id: number): Promise<any> {
    return this.ctx.service.storage.getPluginVersionById(id)
  }

  /**
   * 获取插件的所有版本
   *
   * @param {number} pluginId 插件 ID
   * @returns {Promise<array>} 版本列表
   */
  async getPluginVersions(pluginId: number): Promise<any[]> {
    return this.ctx.service.storage.getPluginVersions(pluginId)
  }

  /**
   * 标记版本为最新
   *
   * @param {number} versionId 版本 ID
   * @param {number} pluginId 插件 ID
   * @returns {Promise<void>}
   */
  async markAsLatest(versionId: number, pluginId: number): Promise<void> {
    this.ctx.service.storage.markAsLatest(versionId, pluginId)
  }

  /**
   * 递增下载计数
   *
   * @param {number} pluginId 插件 ID
   * @param {number} versionId 版本 ID（可选）
   * @returns {Promise<void>}
   */
  async incrementDownloadCount(pluginId: number, versionId?: number): Promise<void> {
    this.ctx.service.storage.incrementDownloadCount(pluginId, versionId)
  }

  /**
   * 获取插件分类列表
   *
   * @returns {Promise<array>} 分类列表
   */
  async getPluginCategories(): Promise<any[]> {
    return this.ctx.service.storage.getPluginCategories()
  }

  /**
   * 发布插件（创建插件和初始版本）
   *
   * @param {object} pluginData 插件数据
   * @param {object} versionData 版本数据
   * @returns {Promise<{pluginId: number, versionId: number}>} 插件和版本 ID
   */
  async publishPlugin(
    pluginData: {
      name: string
      description?: string
      author?: string
      repository_url?: string
      homepage_url?: string
      keywords?: string
      license?: string
      category?: string
      is_official?: boolean
    },
    versionData: {
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
    }
  ): Promise<{ pluginId: number; versionId: number }> {
    // 使用事务确保数据一致性
    return this.ctx.service.storage.transaction(() => {
      // 创建插件
      const pluginId = this.ctx.service.storage.createPlugin({
        ...pluginData,
        published_at: Date.now(),
      })

      // 创建初始版本
      const versionId = this.ctx.service.storage.createPluginVersion({
        ...versionData,
        plugin_id: pluginId,
        is_latest: true,
      })

      return { pluginId, versionId }
    }) as any
  }

  // ==================== 混合架构支持扩展 ====================

  /**
   * 创建插件（支持混合架构）
   *
   * @param {object} pluginData 插件数据
   * @returns {Promise<{id: number}>} 插件 ID
   */
  async createPluginWithRuntime(pluginData: {
    name: string
    description?: string
    author?: string
    repository_url?: string
    homepage_url?: string
    keywords?: string
    license?: string
    category?: string
    is_official?: boolean
    runtime?: 'integrated' | 'sandboxed'
    api_version?: string
    permissions?: string[]
    entry_point?: string
    backend_type?: 'shared-host' | 'faas' | 'none'
    backend_entry?: string
  }): Promise<{ id: number }> {
    // 检查插件名是否已存在
    const existing = this.ctx.service.storage.getPluginByName(pluginData.name)
    if (existing) {
      throw new Error('Plugin name already exists')
    }

    const id = this.ctx.service.storage.createPlugin({
      ...pluginData,
      runtime: pluginData.runtime || 'sandboxed',
      api_version: pluginData.api_version || '1.0',
      permissions: pluginData.permissions ? JSON.stringify(pluginData.permissions) : null,
      backend_type: pluginData.backend_type || 'none',
      published_at: Date.now(),
    } as any)

    // 设置默认权限
    await this.setupDefaultPermissions(id, pluginData.runtime || 'sandboxed')

    return { id }
  }

  /**
   * 获取插件详细信息（包含运行时信息）
   *
   * @param {number} id 插件 ID
   * @returns {Promise<object|null>} 插件详情
   */
  async getPluginByIdWithRuntime(id: number): Promise<any> {
    const plugin = this.ctx.service.storage.getPluginById(id)
    if (!plugin) return null

    // 获取权限列表
    const permissions = this.ctx.service.storage.getPluginPermissions(id)

    // 获取实例列表
    const instances = this.ctx.service.storage.getPluginInstances(id)

    // 获取事件统计
    const eventStats = this.ctx.service.storage.getPluginEventStats(id)

    return {
      ...plugin,
      permissions,
      instances,
      event_stats: eventStats,
    }
  }

  /**
   * 获取插件列表（支持运行时过滤）
   *
   * @param {object} options 查询选项
   * @returns {Promise<array>} 插件列表
   */
  async getPluginsWithRuntime(options?: {
    limit?: number
    offset?: number
    category?: string
    author?: string
    search?: string
    runtime?: 'integrated' | 'sandboxed'
    status?: 'installed' | 'enabled' | 'disabled' | 'uninstalled'
  }): Promise<any[]> {
    let sql = `
      SELECT
        p.*,
        pv.version as latest_version,
        pv.download_count as latest_download_count,
        COUNT(pi.id) as instance_count
      FROM plugins p
      LEFT JOIN plugin_versions pv ON p.id = pv.plugin_id AND pv.is_latest = 1
      LEFT JOIN plugin_instances pi ON p.id = pi.plugin_id
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

    if (options?.runtime) {
      sql += ' AND p.runtime = ?'
      params.push(options.runtime)
    }

    if (options?.status) {
      sql += ' AND p.status = ?'
      params.push(options.status)
    }

    sql += ' GROUP BY p.id ORDER BY p.download_count DESC, p.updated_at DESC'

    if (options?.limit) {
      sql += ' LIMIT ?'
      params.push(options.limit)
    }

    if (options?.offset) {
      sql += ' OFFSET ?'
      params.push(options.offset)
    }

    return this.ctx.service.storage.getDatabase().all(sql, ...params)
  }

  /**
   * 更新插件运行时配置
   *
   * @param {number} id 插件 ID
   * @param {object} runtimeConfig 运行时配置
   * @returns {Promise<void>}
   */
  async updatePluginRuntime(
    id: number,
    runtimeConfig: {
      runtime?: 'integrated' | 'sandboxed'
      api_version?: string
      permissions?: string[]
      entry_point?: string
      backend_type?: 'shared-host' | 'faas' | 'none'
      backend_entry?: string
    }
  ): Promise<void> {
    const updates: any = {}

    if (runtimeConfig.runtime !== undefined) {
      updates.runtime = runtimeConfig.runtime
    }
    if (runtimeConfig.api_version !== undefined) {
      updates.api_version = runtimeConfig.api_version
    }
    if (runtimeConfig.permissions !== undefined) {
      updates.permissions = JSON.stringify(runtimeConfig.permissions)
    }
    if (runtimeConfig.entry_point !== undefined) {
      updates.entry_point = runtimeConfig.entry_point
    }
    if (runtimeConfig.backend_type !== undefined) {
      updates.backend_type = runtimeConfig.backend_type
    }
    if (runtimeConfig.backend_entry !== undefined) {
      updates.backend_entry = runtimeConfig.backend_entry
    }

    this.ctx.service.storage.updatePlugin(id, updates)

    // 如果权限发生变化，重新设置权限
    if (runtimeConfig.permissions) {
      // 删除旧权限
      const oldPermissions = this.ctx.service.storage.getPluginPermissions(id)
      for (const perm of oldPermissions) {
        this.ctx.service.storage.removePluginPermission(id, perm.permission_name)
      }

      // 设置新权限
      await this.setupDefaultPermissions(id, runtimeConfig.runtime || 'sandboxed', runtimeConfig.permissions)
    }
  }

  /**
   * 验证插件兼容性
   *
   * @param {number} pluginId 插件ID
   * @param {string} linglongosVersion 系统版本
   * @returns {Promise<{compatible: boolean, issues: string[]}>} 兼容性检查结果
   */
  async checkCompatibility(
    pluginId: number,
    linglongosVersion: string
  ): Promise<{ compatible: boolean; issues: string[] }> {
    const issues: string[] = []

    // 1. 检查插件是否存在
    const plugin = this.ctx.service.storage.getPluginById(pluginId)
    if (!plugin) {
      issues.push('Plugin not found')
      return { compatible: false, issues }
    }

    // 2. 获取最新版本
    const versions = this.ctx.service.storage.getPluginVersions(pluginId)
    if (!versions || versions.length === 0) {
      issues.push('No versions available')
      return { compatible: false, issues }
    }

    const latestVersion = versions.find(v => v.is_latest) || versions[0]

    // 3. 检查系统版本兼容性
    if (latestVersion.min_linglongos_version) {
      const minVersion = latestVersion.min_linglongos_version
      if (this.compareVersion(linglongosVersion, minVersion) < 0) {
        issues.push(`Requires LinglongOS ${minVersion} or higher`)
      }
    }

    // 4. 检查依赖
    if (latestVersion.dependencies) {
      try {
        const dependencies = JSON.parse(latestVersion.dependencies)
        for (const dep of dependencies) {
          // 这里应该检查依赖插件是否已安装且版本兼容
          // 简化实现
          const depPlugin = this.ctx.service.storage.getPluginByName(dep.name)
          if (!depPlugin) {
            issues.push(`Missing dependency: ${dep.name}`)
          }
        }
      } catch (error) {
        issues.push('Invalid dependencies format')
      }
    }

    return {
      compatible: issues.length === 0,
      issues,
    }
  }

  /**
   * 复制插件
   *
   * @param {number} pluginId 源插件ID
   * @param {string} newName 新插件名称
   * @returns {Promise<{id: number}>} 新插件ID
   */
  async duplicatePlugin(pluginId: number, newName: string): Promise<{ id: number }> {
    // 1. 获取源插件信息
    const sourcePlugin = this.ctx.service.storage.getPluginById(pluginId)
    if (!sourcePlugin) {
      throw new Error('Source plugin not found')
    }

    // 2. 创建新插件
    const { id } = await this.createPluginWithRuntime({
      name: newName,
      description: sourcePlugin.description,
      author: sourcePlugin.author,
      repository_url: sourcePlugin.repository_url,
      homepage_url: sourcePlugin.homepage_url,
      keywords: sourcePlugin.keywords,
      license: sourcePlugin.license,
      category: sourcePlugin.category,
      is_official: false, // 复制的插件不是官方插件
      runtime: sourcePlugin.runtime,
      api_version: sourcePlugin.api_version,
      permissions: sourcePlugin.permissions ? JSON.parse(sourcePlugin.permissions) : undefined,
      entry_point: sourcePlugin.entry_point,
      backend_type: sourcePlugin.backend_type,
      backend_entry: sourcePlugin.backend_entry,
    })

    // 3. 复制所有版本
    const versions = this.ctx.service.storage.getPluginVersions(pluginId)
    for (const version of versions) {
      this.ctx.service.storage.createPluginVersion({
        plugin_id: id,
        version: version.version,
        manifest: version.manifest,
        package_url: version.package_url,
        package_size: version.package_size,
        checksum: version.checksum,
        min_linglongos_version: version.min_linglongos_version,
        engines: version.engines,
        dependencies: version.dependencies,
        peer_dependencies: version.peer_dependencies,
        readme: version.readme,
        changelog: version.changelog,
        download_url: version.download_url,
        is_latest: version.is_latest,
      })
    }

    // 4. 复制权限
    const permissions = this.ctx.service.storage.getPluginPermissions(pluginId)
    for (const perm of permissions) {
      this.ctx.service.storage.setPluginPermission(id, {
        permission_name: perm.permission_name,
        permission_type: perm.permission_type,
        resource_pattern: perm.resource_pattern,
        conditions: perm.conditions ? JSON.parse(perm.conditions) : undefined,
      })
    }

    return { id }
  }

  /**
   * 设置默认权限
   *
   * @private
   * @param {number} pluginId 插件ID
   * @param {string} runtime 运行时类型
   * @param {string[]} customPermissions 自定义权限
   * @returns {Promise<void>}
   */
  private async setupDefaultPermissions(
    pluginId: number,
    runtime: 'integrated' | 'sandboxed',
    customPermissions?: string[]
  ): Promise<void> {
    let permissions: string[] = []

    // 根据运行时类型设置默认权限
    if (runtime === 'integrated') {
      // 核心插件：更宽松的权限
      permissions = [
        'api:call',
        'fs:read',
        'fs:write',
        'window:create',
        'window:close',
        'network:http',
      ]
    } else {
      // 第三方插件：更严格的权限
      permissions = [
        'api:call',
        'window:create',
      ]
    }

    // 合并自定义权限
    if (customPermissions && customPermissions.length > 0) {
      permissions = [...new Set([...permissions, ...customPermissions])]
    }

    // 设置权限
    for (const perm of permissions) {
      this.ctx.service.storage.setPluginPermission(pluginId, {
        permission_name: perm,
        permission_type: 'allow',
      })
    }
  }

  /**
   * 比较版本号
   *
   * @private
   * @param {string} v1 版本1
   * @param {string} v2 版本2
   * @returns {number} 比较结果：-1(小于) 0(等于) 1(大于)
   */
  private compareVersion(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number)
    const parts2 = v2.split('.').map(Number)

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0
      const part2 = parts2[i] || 0

      if (part1 < part2) return -1
      if (part1 > part2) return 1
    }

    return 0
  }
}
