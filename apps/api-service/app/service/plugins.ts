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
}
