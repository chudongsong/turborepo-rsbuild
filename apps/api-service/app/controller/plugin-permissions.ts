import { Controller } from 'egg'
import type { Context } from 'egg'

/**
 * 插件权限管理控制器
 *
 * @controller PluginPermissions
 */
export default class PluginPermissionsController extends Controller {
  /**
   * 获取插件权限列表
   *
   * @router GET /api/v1/plugins/:id/permissions
   * @summary 获取插件权限列表
   */
  async get(ctx: Context) {
    try {
      const pluginId = parseInt(ctx.params.id)
      const permissions = await ctx.service.storage.getPluginPermissions(pluginId)
      ctx.success(permissions)
    } catch (error) {
      ctx.logger.error('Get plugin permissions failed:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('Get plugin permissions failed', errorMessage)
    }
  }

  /**
   * 设置插件权限
   *
   * @router POST /api/v1/plugins/:id/permissions
   * @summary 设置插件权限
   */
  async set(ctx: Context) {
    try {
      const pluginId = parseInt(ctx.params.id)
      const { permissionName, permissionType, resourcePattern, conditions } = ctx.request.body

      if (!permissionName) {
        ctx.badRequest('Permission name is required')
        return
      }

      await ctx.service.storage.setPluginPermission(pluginId, {
        permission_name: permissionName,
        permission_type: permissionType || 'allow',
        resource_pattern: resourcePattern,
        conditions,
      })

      ctx.success(null, 'Permission set successfully')
    } catch (error) {
      ctx.logger.error('Set plugin permission failed:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('Set plugin permission failed', errorMessage)
    }
  }

  /**
   * 撤销插件权限
   *
   * @router DELETE /api/v1/plugins/:id/permissions/:permName
   * @summary 撤销插件权限
   */
  async revoke(ctx: Context) {
    try {
      const pluginId = parseInt(ctx.params.id)
      const { permName } = ctx.params

      await ctx.service.storage.removePluginPermission(pluginId, permName)
      ctx.success(null, 'Permission revoked successfully')
    } catch (error) {
      ctx.logger.error('Revoke plugin permission failed:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('Revoke plugin permission failed', errorMessage)
    }
  }
}
