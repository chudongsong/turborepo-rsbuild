import { Controller } from 'egg'
import type { Context } from 'egg'

/**
 * 插件生命周期管理控制器
 *
 * @controller PluginLifecycle
 */
export default class PluginLifecycleController extends Controller {
  /**
   * 安装插件
   *
   * @router POST /api/v1/plugins/:id/install
   * @summary 安装插件
   */
  async install(ctx: Context) {
    try {
      const pluginId = parseInt(ctx.params.id)
      const { versionId, config } = ctx.request.body

      if (!versionId) {
        ctx.badRequest('Version ID is required')
        return
      }

      const result = await ctx.service.pluginLifecycle.installPlugin(
        pluginId,
        versionId,
        config
      )

      ctx.success(result, 'Plugin installed successfully')
    } catch (error) {
      ctx.logger.error('Install plugin failed:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('Install plugin failed', errorMessage)
    }
  }

  /**
   * 启用插件
   *
   * @router POST /api/v1/plugins/:id/enable
   * @summary 启用插件
   */
  async enable(ctx: Context) {
    try {
      const pluginId = parseInt(ctx.params.id)
      await ctx.service.pluginLifecycle.enablePlugin(pluginId)
      ctx.success(null, 'Plugin enabled successfully')
    } catch (error) {
      ctx.logger.error('Enable plugin failed:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('Enable plugin failed', errorMessage)
    }
  }

  /**
   * 禁用插件
   *
   * @router POST /api/v1/plugins/:id/disable
   * @summary 禁用插件
   */
  async disable(ctx: Context) {
    try {
      const pluginId = parseInt(ctx.params.id)
      await ctx.service.pluginLifecycle.disablePlugin(pluginId)
      ctx.success(null, 'Plugin disabled successfully')
    } catch (error) {
      ctx.logger.error('Disable plugin failed:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('Disable plugin failed', errorMessage)
    }
  }

  /**
   * 卸载插件
   *
   * @router POST /api/v1/plugins/:id/uninstall
   * @summary 卸载插件
   */
  async uninstall(ctx: Context) {
    try {
      const pluginId = parseInt(ctx.params.id)
      await ctx.service.pluginLifecycle.uninstallPlugin(pluginId)
      ctx.success(null, 'Plugin uninstalled successfully')
    } catch (error) {
      ctx.logger.error('Uninstall plugin failed:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('Uninstall plugin failed', errorMessage)
    }
  }

  /**
   * 启动插件实例
   *
   * @router POST /api/v1/instances/:id/start
   * @summary 启动插件实例
   */
  async startInstance(ctx: Context) {
    try {
      const instanceId = parseInt(ctx.params.id)
      await ctx.service.pluginLifecycle.startPluginInstance(instanceId)
      ctx.success(null, 'Plugin instance started successfully')
    } catch (error) {
      ctx.logger.error('Start plugin instance failed:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('Start plugin instance failed', errorMessage)
    }
  }

  /**
   * 停止插件实例
   *
   * @router POST /api/v1/instances/:id/stop
   * @summary 停止插件实例
   */
  async stopInstance(ctx: Context) {
    try {
      const instanceId = parseInt(ctx.params.id)
      await ctx.service.pluginLifecycle.stopPluginInstance(instanceId)
      ctx.success(null, 'Plugin instance stopped successfully')
    } catch (error) {
      ctx.logger.error('Stop plugin instance failed:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('Stop plugin instance failed', errorMessage)
    }
  }

  /**
   * 重启插件实例
   *
   * @router POST /api/v1/instances/:id/restart
   * @summary 重启插件实例
   */
  async restartInstance(ctx: Context) {
    try {
      const instanceId = parseInt(ctx.params.id)
      await ctx.service.pluginLifecycle.restartPluginInstance(instanceId)
      ctx.success(null, 'Plugin instance restarted successfully')
    } catch (error) {
      ctx.logger.error('Restart plugin instance failed:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('Restart plugin instance failed', errorMessage)
    }
  }
}
