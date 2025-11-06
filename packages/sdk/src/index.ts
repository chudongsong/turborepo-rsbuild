/**
 * LinglongOS 前端 SDK
 *
 * 提供插件开发所需的所有 API 和工具
 */

// ==================== 类型定义 ====================

export interface LingLongAPI {
  // 窗口管理
  window: {
    create(options: WindowOptions): Promise<string>
    close(windowId: string): void
    setTitle(windowId: string, title: string): void
    minimize(windowId: string): void
    maximize(windowId: string): void
  }

  // 文件系统
  fs: {
    readFile(path: string): Promise<string>
    writeFile(path: string, data: string): Promise<void>
    deleteFile(path: string): Promise<void>
    exists(path: string): Promise<boolean>
  }

  // RPC 调用
  rpc: {
    call(method: string, data: any): Promise<any>
    on(event: string, callback: Function): void
    off(event: string, callback: Function): void
  }

  // 通知
  notification: {
    show(options: NotificationOptions): Promise<void>
  }

  // 系统信息
  system: {
    getInfo(): SystemInfo
    getVersion(): string
  }

  // 插件间通信
  interPlugin: {
    call(pluginName: string, method: string, data?: any): Promise<any>
  }
}

export interface WindowOptions {
  title: string
  width?: number
  height?: number
  x?: number
  y?: number
  resizable?: boolean
  maximizable?: boolean
  minimizable?: boolean
  closable?: boolean
}

export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  timeout?: number
}

export interface SystemInfo {
  platform: string
  version: string
  arch: string
  linglongos_version: string
}

export interface PluginConfig {
  name: string
  version: string
  runtime: 'integrated' | 'sandboxed'
  permissions: string[]
}

// ==================== 插件加载器 ====================

export class PluginLoader {
  private api: LingLongAPI
  private loadedPlugins: Map<string, any> = new Map()

  constructor(api: LingLongAPI) {
    this.api = api
  }

  /**
   * 加载核心插件（集成运行时）
   */
  async loadIntegratedPlugin(pluginName: string): Promise<React.ComponentType> {
    try {
      console.log(`[SDK] 加载集成插件: ${pluginName}`)

      // 通过 Module Federation 动态加载
      const RemoteModule = await import(/* webpackIgnore: true */ `${this.getRemoteBaseURL()}/${pluginName}/App`)

      if (!RemoteModule.default) {
        throw new Error(`插件 ${pluginName} 未导出默认组件`)
      }

      this.loadedPlugins.set(pluginName, RemoteModule.default)
      console.log(`[SDK] ✅ 集成插件 ${pluginName} 加载成功`)

      return RemoteModule.default
    } catch (error) {
      console.error(`[SDK] ❌ 集成插件 ${pluginName} 加载失败:`, error)
      throw error
    }
  }

  /**
   * 加载第三方插件（沙箱）
   */
  async loadSandboxedPlugin(pluginURL: string): Promise<HTMLIFrameElement> {
    try {
      console.log(`[SDK] 加载沙箱插件: ${pluginURL}`)

      // 创建 iFrame
      const iframe = document.createElement('iframe')
      iframe.src = pluginURL
      iframe.sandbox.add('allow-scripts')
      iframe.sandbox.add('allow-same-origin')
      iframe.style.border = 'none'
      iframe.style.width = '100%'
      iframe.style.height = '100%'

      // 等待 iFrame 加载
      await new Promise<void>((resolve, reject) => {
        iframe.onload = () => {
          console.log(`[SDK] ✅ 沙箱插件加载成功: ${pluginURL}`)
          resolve()
        }
        iframe.onerror = (error) => {
          console.error(`[SDK] ❌ 沙箱插件加载失败:`, error)
          reject(error)
        }
      })

      // 注入 API
      this.injectAPI(iframe)

      this.loadedPlugins.set(pluginURL, iframe)
      return iframe
    } catch (error) {
      console.error(`[SDK] ❌ 沙箱插件 ${pluginURL} 加载失败:`, error)
      throw error
    }
  }

  /**
   * 卸载插件
   */
  unloadPlugin(pluginNameOrUrl: string): void {
    if (this.loadedPlugins.has(pluginNameOrUrl)) {
      this.loadedPlugins.delete(pluginNameOrUrl)
      console.log(`[SDK] 插件已卸载: ${pluginNameOrUrl}`)
    }
  }

  /**
   * 获取已加载插件列表
   */
  getLoadedPlugins(): string[] {
    return Array.from(this.loadedPlugins.keys())
  }

  /**
   * 注入 API 到 iFrame
   */
  private injectAPI(iframe: HTMLIFrameElement): void {
    const apiMessage = {
      type: 'PLUGIN_API_INJECT',
      api: this.api,
    }

    iframe.contentWindow?.postMessage(apiMessage, '*')
  }

  /**
   * 获取远程基础 URL
   */
  private getRemoteBaseURL(): string {
    // 这里应该从配置中获取
    return 'http://localhost:4001/remotes'
  }
}

// ==================== 插件基类 ====================

export abstract class BasePlugin {
  protected api: LingLongAPI
  protected config: PluginConfig

  constructor(api: LingLongAPI, config: PluginConfig) {
    this.api = api
    this.config = config
  }

  /**
   * 插件激活时调用
   */
  abstract activate(): Promise<void> | void

  /**
   * 插件停用时调用
   */
  abstract deactivate(): Promise<void> | void

  /**
   * 获取插件信息
   */
  getInfo(): PluginConfig {
    return this.config
  }

  /**
   * 检查权限
   */
  hasPermission(permission: string): boolean {
    return this.config.permissions.includes(permission)
  }

  /**
   * 请求权限
   */
  async requestPermission(permission: string): Promise<boolean> {
    try {
      await this.api.rpc.call('requestPermission', {
        plugin: this.config.name,
        permission,
      })
      return true
    } catch (error) {
      console.error(`[Plugin ${this.config.name}] 请求权限失败:`, error)
      return false
    }
  }
}

// ==================== 工具函数 ====================

/**
 * 创建 LingLongAPI 实例
 */
export function createLingLongAPI(): LingLongAPI {
  return {
    window: {
      create: (options) => window.linglong.rpc.call('window:create', options),
      close: (windowId) => window.linglong.rpc.call('window:close', { windowId }),
      setTitle: (windowId, title) => window.linglong.rpc.call('window:setTitle', { windowId, title }),
      minimize: (windowId) => window.linglong.rpc.call('window:minimize', { windowId }),
      maximize: (windowId) => window.linglong.rpc.call('window:maximize', { windowId }),
    },
    fs: {
      readFile: (path) => window.linglong.rpc.call('fs:read', { path }),
      writeFile: (path, data) => window.linglong.rpc.call('fs:write', { path, data }),
      deleteFile: (path) => window.linglong.rpc.call('fs:delete', { path }),
      exists: (path) => window.linglong.rpc.call('fs:exists', { path }),
    },
    rpc: {
      call: (method, data) => window.linglong.rpc.call(method, data),
      on: (event, callback) => window.linglong.rpc.on(event, callback),
      off: (event, callback) => window.linglong.rpc.off(event, callback),
    },
    notification: {
      show: (options) => window.linglong.rpc.call('notification:show', options),
    },
    system: {
      getInfo: () => window.linglong.system.getInfo(),
      getVersion: () => window.linglong.system.getVersion(),
    },
    interPlugin: {
      call: (pluginName, method, data) => window.linglong.rpc.call('interPlugin:call', { pluginName, method, data }),
    },
  }
}

/**
 * 检测运行环境
 */
export function detectRuntime(): 'integrated' | 'sandboxed' {
  if (typeof window !== 'undefined') {
    // 检查是否在 iFrame 中
    if (window.self !== window.top) {
      return 'sandboxed'
    }
    // 检查是否有 LingLongAPI
    if (window.linglong) {
      return 'integrated'
    }
  }
  return 'sandboxed'
}

/**
 * 初始化插件
 */
export async function initializePlugin(pluginClass: new (api: LingLongAPI, config: PluginConfig) => BasePlugin): Promise<BasePlugin> {
  // 检测运行时
  const runtime = detectRuntime()

  // 创建 API
  const api = createLingLongAPI()

  // 获取插件配置（从 manifest 或配置文件中读取）
  const config: PluginConfig = {
    name: 'my-plugin',
    version: '1.0.0',
    runtime,
    permissions: ['api:call'],
  }

  // 创建插件实例
  const plugin = new pluginClass(api, config)

  // 激活插件
  await plugin.activate()

  return plugin
}

// ==================== 导出默认 ====================

export default {
  LingLongAPI,
  PluginLoader,
  BasePlugin,
  createLingLongAPI,
  detectRuntime,
  initializePlugin,
}
