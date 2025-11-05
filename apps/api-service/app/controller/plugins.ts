import { Controller } from 'egg'
import type { Context } from 'egg'

/**
 * 插件注册中心控制器
 *
 * 提供插件的增删改查、版本管理、分类查询等 RESTful API
 * @controller Plugins
 */
export default class PluginsController extends Controller {
  /**
   * 获取插件列表
   *
   * @router GET /api/v1/plugins
   * @summary 获取插件列表
   * @description 分页查询插件列表，支持分类、作者、搜索过滤
   */
  async index(ctx: Context) {
    try {
      const {
        limit = '20',
        offset = '0',
        category,
        author,
        search,
      } = ctx.query as Record<string, string>

      const plugins = await ctx.service.plugins.getPlugins({
        limit: parseInt(limit),
        offset: parseInt(offset),
        category,
        author,
        search,
      })

      ctx.success(plugins)
    } catch (error) {
      ctx.logger.error('获取插件列表失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('获取插件列表失败', errorMessage)
    }
  }

  /**
   * 获取插件详情
   *
   * @router GET /api/v1/plugins/:id
   * @summary 获取插件详情
   * @description 根据插件 ID 获取插件详细信息，包括所有版本
   */
  async show(ctx: Context) {
    try {
      const id = parseInt(ctx.params.id)
      const plugin = await ctx.service.plugins.getPluginById(id)

      if (!plugin) {
        ctx.notFound('Plugin not found')
        return
      }

      ctx.success(plugin)
    } catch (error) {
      ctx.logger.error('获取插件详情失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('获取插件详情失败', errorMessage)
    }
  }

  /**
   * 根据名称获取插件
   *
   * @router GET /api/v1/plugins/name/:name
   * @summary 根据名称获取插件
   * @description 根据插件名称获取插件信息
   */
  async showByName(ctx: Context) {
    try {
      const { name } = ctx.params
      const plugin = await ctx.service.plugins.getPluginByName(name)

      if (!plugin) {
        ctx.notFound('Plugin not found')
        return
      }

      ctx.success(plugin)
    } catch (error) {
      ctx.logger.error('获取插件失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('获取插件失败', errorMessage)
    }
  }

  /**
   * 创建新插件
   *
   * @router POST /api/v1/plugins
   * @summary 创建插件
   * @description 创建新的插件（需要管理员权限）
   */
  async create(ctx: Context) {
    try {
      const pluginData = ctx.request.body as {
        name: string
        description?: string
        author?: string
        repository_url?: string
        homepage_url?: string
        keywords?: string
        license?: string
        category?: string
        is_official?: boolean
      }

      // 参数验证
      if (!pluginData.name) {
        ctx.badRequest('Plugin name is required')
        return
      }

      const result = await ctx.service.plugins.createPlugin(pluginData)
      ctx.created(result, 'Plugin created successfully')
    } catch (error) {
      ctx.logger.error('创建插件失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('already exists')) {
        ctx.conflict('Plugin name already exists')
      } else {
        ctx.internalError('创建插件失败', errorMessage)
      }
    }
  }

  /**
   * 更新插件
   *
   * @router PUT /api/v1/plugins/:id
   * @summary 更新插件
   * @description 更新插件信息（需要管理员权限）
   */
  async update(ctx: Context) {
    try {
      const id = parseInt(ctx.params.id)
      const updates = ctx.request.body as {
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

      // 检查插件是否存在
      const existing = await ctx.service.plugins.getPluginById(id)
      if (!existing) {
        ctx.notFound('Plugin not found')
        return
      }

      await ctx.service.plugins.updatePlugin(id, updates)
      ctx.success(null, 'Plugin updated successfully')
    } catch (error) {
      ctx.logger.error('更新插件失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('更新插件失败', errorMessage)
    }
  }

  /**
   * 删除插件
   *
   * @router DELETE /api/v1/plugins/:id
   * @summary 删除插件
   * @description 删除插件及其所有版本（需要管理员权限）
   */
  async destroy(ctx: Context) {
    try {
      const id = parseInt(ctx.params.id)

      // 检查插件是否存在
      const existing = await ctx.service.plugins.getPluginById(id)
      if (!existing) {
        ctx.notFound('Plugin not found')
        return
      }

      await ctx.service.plugins.deletePlugin(id)
      ctx.success(null, 'Plugin deleted successfully')
    } catch (error) {
      ctx.logger.error('删除插件失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('删除插件失败', errorMessage)
    }
  }

  /**
   * 获取插件的所有版本
   *
   * @router GET /api/v1/plugins/:id/versions
   * @summary 获取插件版本列表
   * @description 获取指定插件的所有版本信息
   */
  async listVersions(ctx: Context) {
    try {
      const pluginId = parseInt(ctx.params.id)

      // 检查插件是否存在
      const plugin = await ctx.service.plugins.getPluginById(pluginId)
      if (!plugin) {
        ctx.notFound('Plugin not found')
        return
      }

      const versions = await ctx.service.plugins.getPluginVersions(pluginId)
      ctx.success(versions)
    } catch (error) {
      ctx.logger.error('获取版本列表失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('获取版本列表失败', errorMessage)
    }
  }

  /**
   * 创建新版本
   *
   * @router POST /api/v1/plugins/:id/versions
   * @summary 创建插件版本
   * @description 为插件创建新版本（需要管理员权限）
   */
  async createVersion(ctx: Context) {
    try {
      const pluginId = parseInt(ctx.params.id)
      const versionData = ctx.request.body as {
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
      }

      // 参数验证
      if (!versionData.version || !versionData.manifest || !versionData.package_url) {
        ctx.badRequest('Version, manifest, and package_url are required')
        return
      }

      // 检查插件是否存在
      const plugin = await ctx.service.plugins.getPluginById(pluginId)
      if (!plugin) {
        ctx.notFound('Plugin not found')
        return
      }

      const result = await ctx.service.plugins.createPluginVersion({
        ...versionData,
        plugin_id: pluginId,
      })

      ctx.created(result, 'Plugin version created successfully')
    } catch (error) {
      ctx.logger.error('创建版本失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('already exists')) {
        ctx.conflict('Version already exists')
      } else {
        ctx.internalError('创建版本失败', errorMessage)
      }
    }
  }

  /**
   * 标记版本为最新
   *
   * @router POST /api/v1/plugins/:id/versions/:versionId/mark-latest
   * @summary 标记版本为最新
   * @description 标记指定版本为插件的最新版本（需要管理员权限）
   */
  async markLatest(ctx: Context) {
    try {
      const pluginId = parseInt(ctx.params.id)
      const versionId = parseInt(ctx.params.versionId)

      // 检查插件是否存在
      const plugin = await ctx.service.plugins.getPluginById(pluginId)
      if (!plugin) {
        ctx.notFound('Plugin not found')
        return
      }

      // 检查版本是否存在
      const version = await ctx.service.plugins.getPluginVersionById(versionId)
      if (!version) {
        ctx.notFound('Version not found')
        return
      }

      await ctx.service.plugins.markAsLatest(versionId, pluginId)
      ctx.success(null, 'Version marked as latest successfully')
    } catch (error) {
      ctx.logger.error('标记最新版本失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('标记最新版本失败', errorMessage)
    }
  }

  /**
   * 获取插件分类列表
   *
   * @router GET /api/v1/plugins/categories
   * @summary 获取插件分类列表
   * @description 获取所有插件分类及其数量统计
   */
  async listCategories(ctx: Context) {
    try {
      const categories = await ctx.service.plugins.getPluginCategories()
      ctx.success(categories)
    } catch (error) {
      ctx.logger.error('获取分类列表失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('获取分类列表失败', errorMessage)
    }
  }

  /**
   * 递增下载计数
   *
   * @router POST /api/v1/plugins/:id/download
   * @summary 递增下载计数
   * @description 递增插件的下载计数，用于统计
   */
  async download(ctx: Context) {
    try {
      const pluginId = parseInt(ctx.params.id)
      const { version } = ctx.query as Record<string, string>

      // 检查插件是否存在
      const plugin = await ctx.service.plugins.getPluginById(pluginId)
      if (!plugin) {
        ctx.notFound('Plugin not found')
        return
      }

      let versionId: number | undefined
      if (version) {
        const versions = await ctx.service.plugins.getPluginVersions(pluginId)
        const v = versions.find((item: any) => item.version === version)
        if (v) {
          versionId = v.id
        }
      }

      await ctx.service.plugins.incrementDownloadCount(pluginId, versionId)
      ctx.success(null, 'Download count incremented')
    } catch (error) {
      ctx.logger.error('递增下载计数失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('递增下载计数失败', errorMessage)
    }
  }
}
