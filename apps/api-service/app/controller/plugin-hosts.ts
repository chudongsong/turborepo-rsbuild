import { Controller } from 'egg'
import type { Context } from 'egg'

/**
 * 插件主机管理控制器
 *
 * @controller PluginHosts
 */
export default class PluginHostsController extends Controller {
  /**
   * 获取插件主机状态
   *
   * @router GET /api/v1/plugin-hosts/status
   * @summary 获取插件主机状态
   */
  async status(ctx: Context) {
    try {
      const status = await ctx.service.pluginRuntime.getHostsStatus()
      ctx.success(status)
    } catch (error) {
      ctx.logger.error('Get plugin hosts status failed:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('Get plugin hosts status failed', errorMessage)
    }
  }

  /**
   * 启动插件主机
   *
   * @router POST /api/v1/plugin-hosts/:hostName/start
   * @summary 启动插件主机
   */
  async start(ctx: Context) {
    try {
      const { hostName } = ctx.params
      await ctx.service.pluginRuntime.startPluginHost(hostName)
      ctx.success(null, 'Plugin host started successfully')
    } catch (error) {
      ctx.logger.error('Start plugin host failed:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('Start plugin host failed', errorMessage)
    }
  }

  /**
   * 停止插件主机
   *
   * @router POST /api/v1/plugin-hosts/:hostName/stop
   * @summary 停止插件主机
   */
  async stop(ctx: Context) {
    try {
      const { hostName } = ctx.params
      await ctx.service.pluginRuntime.stopPluginHost(hostName)
      ctx.success(null, 'Plugin host stopped successfully')
    } catch (error) {
      ctx.logger.error('Stop plugin host failed:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('Stop plugin host failed', errorMessage)
    }
  }

  /**
   * 重启插件主机
   *
   * @router POST /api/v1/plugin-hosts/:hostName/restart
   * @summary 重启插件主机
   */
  async restart(ctx: Context) {
    try {
      const { hostName } = ctx.params
      await ctx.service.pluginRuntime.restartPluginHost(hostName)
      ctx.success(null, 'Plugin host restarted successfully')
    } catch (error) {
      ctx.logger.error('Restart plugin host failed:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('Restart plugin host failed', errorMessage)
    }
  }

  /**
   * 获取插件主机列表
   *
   * @router GET /api/v1/plugin-hosts
   * @summary 获取插件主机列表
   */
  async index(ctx: Context) {
    try {
      const hosts = await ctx.service.storage.getPluginHosts()
      ctx.success(hosts)
    } catch (error) {
      ctx.logger.error('Get plugin hosts failed:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('Get plugin hosts failed', errorMessage)
    }
  }
}
