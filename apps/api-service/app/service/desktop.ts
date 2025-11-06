import { Service } from 'egg'
import fs from 'node:fs'
import path from 'node:path'

/**
 * 桌面配置接口定义
 */
export interface DesktopConfig {
  version: string
  metadata: {
    name: string
    created: string
    pluginApiVersion: string
  }
  desktop: {
    grid: {
      columns: number
      rows: number
      cellWidth: number
      cellHeight: number
      padding: number
    }
    registeredPlugins: Array<{
      id: string
      name: string
      type: string
      version: string
      enabled: boolean
      zIndex: number
    }>
    plugins: Array<{
      id: string
      type: string
      name: string
      icon?: string
      position: {
        x: number
        y: number
        width: number
        height: number
      }
      config: Record<string, any>
    }>
  }
  taskbar: {
    position: string
    height: number
    autoHide: boolean
    plugins: Array<{
      id: string
      type: string
      name: string
      config: Record<string, any>
    }>
    quickLaunch: Array<{
      name: string
      icon: string
      url: string
    }>
  }
  contextMenus: Array<{
    pluginId: string
    items: Array<{
      id: string
      type: string
      name: string
      icon?: string
      items?: any[]
    }>
  }>
  pluginTypes: Record<string, {
    description: string
    configSchema: Record<string, string>
  }>
  registeredPluginStores: Array<{
    id: string
    name: string
    url: string
  }>
  system: {
    animations: boolean
    snapToGrid: boolean
    showDesktopLabels: boolean
    doubleClickToOpen: boolean
  }
}

/**
 * 桌面服务
 *
 * 提供桌面配置的读取、写入、更新等能力
 * 使用 JSON 文件存储桌面配置数据
 */
export default class DesktopService extends Service {
  private readonly configPath: string

  constructor(ctx: any) {
    super(ctx)
    const baseDir = this.app.baseDir
    this.configPath = path.join(baseDir, 'data/desktop.json')
    this.ensureConfigFile()
  }

  /**
   * 确保配置文件存在
   *
   * @private
   */
  private ensureConfigFile(): void {
    const dir = path.dirname(this.configPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    if (!fs.existsSync(this.configPath)) {
      this.app.logger.warn('桌面配置文件不存在，请确保 data/desktop-config.json 已创建')
    }
  }

  /**
   * 读取桌面配置
   *
   * @returns {Promise<DesktopConfig>} 桌面配置数据
   */
  async getConfig(): Promise<DesktopConfig> {
    try {
      const content = fs.readFileSync(this.configPath, 'utf8')
      return JSON.parse(content)
    } catch (error) {
      this.ctx.logger.error('读取桌面配置失败:', error)
      throw new Error('无法读取桌面配置')
    }
  }

  /**
   * 获取已注册的插件列表
   *
   * @returns {Promise<Array>} 插件列表
   */
  async getRegisteredPlugins(): Promise<Array<{
    id: string
    name: string
    type: string
    version: string
    enabled: boolean
    zIndex: number
  }>> {
    const config = await this.getConfig()
    return config.desktop.registeredPlugins
  }

  /**
   * 获取桌面插件（桌面上的图标、组件等）
   *
   * @returns {Promise<Array>} 桌面插件列表
   */
  async getDesktopPlugins(): Promise<Array<{
    id: string
    type: string
    name: string
    icon?: string
    position: {
      x: number
      y: number
      width: number
      height: number
    }
    config: Record<string, any>
  }>> {
    const config = await this.getConfig()
    return config.desktop.plugins
  }

  /**
   * 根据 ID 获取插件
   *
   * @param {string} pluginId 插件 ID
   * @returns {Promise<any>} 插件配置
   */
  async getPluginById(pluginId: string): Promise<any> {
    const plugins = await this.getDesktopPlugins()
    return plugins.find(p => p.id === pluginId)
  }

  /**
   * 获取任务栏配置
   *
   * @returns {Promise<any>} 任务栏配置
   */
  async getTaskbarConfig(): Promise<any> {
    const config = await this.getConfig()
    return config.taskbar
  }

  /**
   * 获取右键菜单配置
   *
   * @returns {Promise<Array>} 右键菜单配置
   */
  async getContextMenus(): Promise<Array<any>> {
    const config = await this.getConfig()
    return config.contextMenus
  }

  /**
   * 获取插件类型定义
   *
   * @returns {Promise<Record<string, any>>} 插件类型定义
   */
  async getPluginTypes(): Promise<Record<string, any>> {
    const config = await this.getConfig()
    return config.pluginTypes
  }

  /**
   * 获取插件商店列表
   *
   * @returns {Promise<Array>} 插件商店列表
   */
  async getRegisteredPluginStores(): Promise<Array<{
    id: string
    name: string
    url: string
  }>> {
    const config = await this.getConfig()
    return config.registeredPluginStores
  }

  /**
   * 更新桌面插件位置
   *
   * @param {string} pluginId 插件 ID
   * @param {number} x X 坐标
   * @param {number} y Y 坐标
   * @returns {Promise<void>}
   */
  async updatePluginPosition(pluginId: string, x: number, y: number): Promise<void> {
    const config = await this.getConfig()
    const plugin = config.desktop.plugins.find(p => p.id === pluginId)

    if (!plugin) {
      throw new Error(`插件 ${pluginId} 不存在`)
    }

    plugin.position.x = x
    plugin.position.y = y

    this.writeConfig(config)
  }

  /**
   * 添加新插件到桌面
   *
   * @param {any} plugin 插件配置
   * @returns {Promise<void>}
   */
  async addPlugin(plugin: any): Promise<void> {
    const config = await this.getConfig()

    // 检查插件是否已存在
    const exists = config.desktop.plugins.find(p => p.id === plugin.id)
    if (exists) {
      throw new Error(`插件 ${plugin.id} 已存在`)
    }

    config.desktop.plugins.push(plugin)
    this.writeConfig(config)
  }

  /**
   * 从桌面移除插件
   *
   * @param {string} pluginId 插件 ID
   * @returns {Promise<void>}
   */
  async removePlugin(pluginId: string): Promise<void> {
    const config = await this.getConfig()
    const index = config.desktop.plugins.findIndex(p => p.id === pluginId)

    if (index === -1) {
      throw new Error(`插件 ${pluginId} 不存在`)
    }

    config.desktop.plugins.splice(index, 1)
    this.writeConfig(config)
  }

  /**
   * 更新插件配置
   *
   * @param {string} pluginId 插件 ID
   * @param {any} configUpdates 配置更新
   * @returns {Promise<void>}
   */
  async updatePluginConfig(pluginId: string, configUpdates: any): Promise<void> {
    const config = await this.getConfig()
    const plugin = config.desktop.plugins.find(p => p.id === pluginId)

    if (!plugin) {
      throw new Error(`插件 ${pluginId} 不存在`)
    }

    plugin.config = { ...plugin.config, ...configUpdates }
    this.writeConfig(config)
  }

  /**
   * 写入配置文件
   *
   * @private
   * @param {DesktopConfig} config 配置数据
   */
  private writeConfig(config: DesktopConfig): void {
    fs.writeFileSync(
      this.configPath,
      JSON.stringify(config, null, 2)
    )
    this.ctx.logger.info(`桌面配置已更新: ${this.configPath}`)
  }
}
