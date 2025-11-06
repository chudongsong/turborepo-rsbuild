import { Controller } from 'egg'
import type { Context } from 'egg'

/**
 * 插件实例管理控制器
 *
 * @controller PluginInstances
 */
export default class PluginInstancesController extends Controller {
  /**
   * 创建插件实例
   *
   * @router POST /api/v1/plugins/:id/instances
   * @summary 创建插件实例
   */
  async create(ctx: Context) {
    try {
      const pluginId = parseInt(ctx.params.id)
      const { versionId, instanceName, config } = ctx.request.body

      if (!versionId || !instanceName) {
        ctx.badRequest('Version ID and instance name are required')
        return
      }

      const result = await ctx.service.pluginLifecycle.createPluginInstance(
        pluginId,
        versionId,
        instanceName,
        config
      )

      ctx.created(result, 'Plugin instance created successfully')
    } catch (error) {
      ctx.logger.error('Create plugin instance failed:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('Create plugin instance failed', errorMessage)
    }
  }

  /**
   * 获取插件实例列表
   *
   * @router GET /api/v1/plugins/:id/instances
   * @summary 获取插件实例列表
   */
  async index(ctx: Context) {
    try {
      const pluginId = parseInt(ctx.params.id)
      const instances = await ctx.service.storage.getPluginInstances(pluginId)
      ctx.success(instances)
    } catch (error) {
      ctx.logger.error('Get plugin instances failed:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('Get plugin instances failed', errorMessage)
    }
  }

  /**
   * 获取插件实例详情
   *
   * @router GET /api/v1/instances/:id
   * @summary 获取插件实例详情
   */
  async show(ctx: Context) {
    try {
      const instanceId = parseInt(ctx.params.id)
      const instance = await ctx.service.storage.getPluginInstanceById(instanceId)

      if (!instance) {
        ctx.notFound('Plugin instance not found')
        return
      }

      ctx.success(instance)
    } catch (error) {
      ctx.logger.error('Get plugin instance failed:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('Get plugin instance failed', errorMessage)
    }
  }

  /**
   * 更新插件实例
   *
   * @router PUT /api/v1/instances/:id
   * @summary 更新插件实例
   */
  async update(ctx: Context) {
    try {
      const instanceId = parseInt(ctx.params.id)
      const updates = ctx.request.body

      await ctx.service.storage.updatePluginInstance(instanceId, updates)
      ctx.success(null, 'Plugin instance updated successfully')
    } catch (error) {
      ctx.logger.error('Update plugin instance failed:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('Update plugin instance failed', errorMessage)
    }
  }

  /**
   * 删除插件实例
   *
   * @router DELETE /api/v1/instances/:id
   * @summary 删除插件实例
   */
  async destroy(ctx: Context) {
    try {
      const instanceId = parseInt(ctx.params.id)
      await ctx.service.pluginLifecycle.deletePluginInstance(instanceId)
      ctx.success(null, 'Plugin instance deleted successfully')
    } catch (error) {
      ctx.logger.error('Delete plugin instance failed:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('Delete plugin instance failed', errorMessage)
    }
  }
}
