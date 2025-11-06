import { Controller } from 'egg'
import type { Context } from 'egg'

/**
 * 桌面控制器
 *
 * 提供桌面配置的获取、更新、管理等 RESTful API
 * 需要用户认证后才能访问
 *
 * @controller Desktop
 */
export default class DesktopController extends Controller {
  /**
   * 获取完整的桌面配置
   *
   * @router GET /api/v1/desktop/get_config
   * @summary 获取桌面配置
   * @description 返回完整的桌面配置信息，包括插件、任务栏、菜单等
   * @response 200 返回桌面配置
   */
  async getConfig(ctx: Context) {
    try {
      ctx.logger.info('获取桌面配置')

      const config = await ctx.service.desktop.getConfig()

      ctx.success(config)
    } catch (error) {
      ctx.logger.error('获取桌面配置失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('获取桌面配置失败', errorMessage)
    }
  }

  /**
   * 获取已注册的插件列表
   *
   * @router GET /api/v1/desktop/get_registered_plugins
   * @summary 获取已注册插件列表
   * @description 返回系统中所有已注册的插件列表
   * @response 200 返回插件列表
   */
  async getRegisteredPlugins(ctx: Context) {
    try {
      ctx.logger.info('获取已注册插件列表')

      const plugins = await ctx.service.desktop.getRegisteredPlugins()

      ctx.success(plugins)
    } catch (error) {
      ctx.logger.error('获取已注册插件列表失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('获取已注册插件列表失败', errorMessage)
    }
  }

  /**
   * 获取桌面插件列表
   *
   * @router GET /api/v1/desktop/get_desktop_plugins
   * @summary 获取桌面插件列表
   * @description 返回桌面上当前显示的所有插件（图标、组件等）
   * @response 200 返回桌面插件列表
   */
  async getDesktopPlugins(ctx: Context) {
    try {
      ctx.logger.info('获取桌面插件列表')

      const plugins = await ctx.service.desktop.getDesktopPlugins()

      ctx.success(plugins)
    } catch (error) {
      ctx.logger.error('获取桌面插件列表失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('获取桌面插件列表失败', errorMessage)
    }
  }

  /**
   * 根据 ID 获取插件详情
   *
   * @router GET /api/v1/desktop/get_plugin
   * @summary 获取插件详情
   * @description 根据插件 ID 获取插件的详细信息
   * @Request query id - 插件 ID
   * @response 200 返回插件详情
   */
  async getPlugin(ctx: Context) {
    try {
      const { id } = ctx.query as { id: string }

      if (!id) {
        ctx.badRequest('缺少插件 ID 参数')
        return
      }

      ctx.logger.info(`获取插件详情: ${id}`)

      const plugin = await ctx.service.desktop.getPluginById(id)

      if (!plugin) {
        ctx.notFound(`插件 ${id} 不存在`)
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
   * 获取任务栏配置
   *
   * @router GET /api/v1/desktop/get_taskbar_config
   * @summary 获取任务栏配置
   * @description 返回任务栏的配置信息
   * @response 200 返回任务栏配置
   */
  async getTaskbarConfig(ctx: Context) {
    try {
      ctx.logger.info('获取任务栏配置')

      const config = await ctx.service.desktop.getTaskbarConfig()

      ctx.success(config)
    } catch (error) {
      ctx.logger.error('获取任务栏配置失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('获取任务栏配置失败', errorMessage)
    }
  }

  /**
   * 获取右键菜单配置
   *
   * @router GET /api/v1/desktop/get_context_menus
   * @summary 获取右键菜单配置
   * @description 返回右键菜单的配置信息
   * @response 200 返回右键菜单配置
   */
  async getContextMenus(ctx: Context) {
    try {
      ctx.logger.info('获取右键菜单配置')

      const menus = await ctx.service.desktop.getContextMenus()

      ctx.success(menus)
    } catch (error) {
      ctx.logger.error('获取右键菜单配置失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('获取右键菜单配置失败', errorMessage)
    }
  }

  /**
   * 获取插件类型定义
   *
   * @router GET /api/v1/desktop/get_plugin_types
   * @summary 获取插件类型定义
   * @description 返回系统中定义的插件类型及其配置模式
   * @response 200 返回插件类型定义
   */
  async getPluginTypes(ctx: Context) {
    try {
      ctx.logger.info('获取插件类型定义')

      const types = await ctx.service.desktop.getPluginTypes()

      ctx.success(types)
    } catch (error) {
      ctx.logger.error('获取插件类型定义失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('获取插件类型定义失败', errorMessage)
    }
  }

  /**
   * 获取插件商店列表
   *
   * @router GET /api/v1/desktop/get_plugin_stores
   * @summary 获取插件商店列表
   * @description 返回系统中已注册的插件商店列表
   * @response 200 返回插件商店列表
   */
  async getPluginStores(ctx: Context) {
    try {
      ctx.logger.info('获取插件商店列表')

      const stores = await ctx.service.desktop.getRegisteredPluginStores()

      ctx.success(stores)
    } catch (error) {
      ctx.logger.error('获取插件商店列表失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('获取插件商店列表失败', errorMessage)
    }
  }

  /**
   * 更新插件位置
   *
   * @router POST /api/v1/desktop/update_plugin_position
   * @summary 更新插件位置
   * @description 更新桌面上插件的位置坐标
   * @Request body id - 插件 ID
   * @Request body x - X 坐标
   * @Request body y - Y 坐标
   * @response 200 更新成功
   */
  async updatePluginPosition(ctx: Context) {
    try {
      const { id, x, y } = ctx.request.body as {
        id: string
        x: number
        y: number
      }

      if (!id || x === undefined || y === undefined) {
        ctx.badRequest('缺少必要参数: id, x, y')
        return
      }

      ctx.logger.info(`更新插件位置: ${id} -> (${x}, ${y})`)

      await ctx.service.desktop.updatePluginPosition(id, x, y)

      ctx.success({ message: '插件位置更新成功' })
    } catch (error) {
      ctx.logger.error('更新插件位置失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('更新插件位置失败', errorMessage)
    }
  }

  /**
   * 添加插件到桌面
   *
   * @router POST /api/v1/desktop/add_plugin
   * @summary 添加插件到桌面
   * @description 在桌面上添加一个新的插件
   * @Request body plugin - 插件配置
   * @response 201 添加成功
   */
  async addPlugin(ctx: Context) {
    try {
      const { plugin } = ctx.request.body as { plugin: any }

      if (!plugin) {
        ctx.badRequest('缺少插件配置')
        return
      }

      ctx.logger.info(`添加插件到桌面: ${plugin.id}`)

      await ctx.service.desktop.addPlugin(plugin)

      ctx.success({ message: '插件添加成功' }, 201)
    } catch (error) {
      ctx.logger.error('添加插件失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('添加插件失败', errorMessage)
    }
  }

  /**
   * 从桌面移除插件
   *
   * @router POST /api/v1/desktop/remove_plugin
   * @summary 从桌面移除插件
   * @description 从桌面上移除指定的插件
   * @Request body id - 插件 ID
   * @response 200 移除成功
   */
  async removePlugin(ctx: Context) {
    try {
      const { id } = ctx.request.body as { id: string }

      if (!id) {
        ctx.badRequest('缺少插件 ID')
        return
      }

      ctx.logger.info(`从桌面移除插件: ${id}`)

      await ctx.service.desktop.removePlugin(id)

      ctx.success({ message: '插件移除成功' })
    } catch (error) {
      ctx.logger.error('移除插件失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('移除插件失败', errorMessage)
    }
  }

  /**
   * 更新插件配置
   *
   * @router POST /api/v1/desktop/update_plugin_config
   * @summary 更新插件配置
   * @description 更新指定插件的配置信息
   * @Request body id - 插件 ID
   * @Request body configUpdates - 配置更新
   * @response 200 更新成功
   */
  async updatePluginConfig(ctx: Context) {
    try {
      const { id, configUpdates } = ctx.request.body as {
        id: string
        configUpdates: any
      }

      if (!id || !configUpdates) {
        ctx.badRequest('缺少必要参数: id, configUpdates')
        return
      }

      ctx.logger.info(`更新插件配置: ${id}`)

      await ctx.service.desktop.updatePluginConfig(id, configUpdates)

      ctx.success({ message: '插件配置更新成功' })
    } catch (error) {
      ctx.logger.error('更新插件配置失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      ctx.internalError('更新插件配置失败', errorMessage)
    }
  }
}
