/**
 * 插件主机进程
 *
 * 独立 Node.js 进程，用于运行核心插件（集成运行时）
 * 支持 Module Federation 和共享插件主机模式
 */

import http from 'node:http'
import url from 'node:url'

// 插件主机类
class PluginHost {
  private hostName: string
  private port: number
  private config: any
  private plugins: Map<string, any> = new Map()
  private server: http.Server | null = null

  constructor() {
    this.hostName = process.env.HOST_NAME || 'core-host'
    this.port = parseInt(process.env.HOST_PORT || '4001')
    this.config = JSON.parse(process.env.HOST_CONFIG || '{}')
  }

  /**
   * 启动插件主机
   */
  async start(): Promise<void> {
    console.log(`[${this.hostName}] 启动插件主机...`)
    console.log(`[${this.hostName}] 端口: ${this.port}`)
    console.log(`[${this.hostName}] 配置:`, this.config)

    // 创建 HTTP 服务器
    this.server = http.createServer(this.handleRequest.bind(this))

    // 启动服务器
    await new Promise<void>((resolve, reject) => {
      this.server!.listen(this.port, () => {
        console.log(`[${this.hostName}] ✅ 插件主机已启动，监听端口 ${this.port}`)
        resolve()
      })
      this.server!.on('error', reject)
    })

    // 启动心跳检测
    this.startHeartbeat()

    // 优雅关闭处理
    this.setupGracefulShutdown()
  }

  /**
   * 处理 HTTP 请求
   */
  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    const parsedUrl = url.parse(req.url!, true)
    const pathname = parsedUrl.pathname || '/'

    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Plugin-Name, X-API-Method')

    // 处理 OPTIONS 请求
    if (req.method === 'OPTIONS') {
      res.writeHead(200)
      res.end()
      return
    }

    try {
      if (pathname === '/health') {
        // 健康检查
        this.handleHealthCheck(req, res)
      } else if (pathname.startsWith('/rpc/')) {
        // RPC 调用
        this.handleRPCCall(req, res, parsedUrl)
      } else if (pathname === '/plugins') {
        // 插件管理
        this.handlePluginManagement(req, res)
      } else {
        // 404
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Not Found' }))
      }
    } catch (error) {
      console.error(`[${this.hostName}] 处理请求失败:`, error)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Internal Server Error' }))
    }
  }

  /**
   * 处理健康检查
   */
  private handleHealthCheck(req: http.IncomingMessage, res: http.ServerResponse): void {
    const status = {
      host_name: this.hostName,
      status: 'running',
      loaded_plugins: Array.from(this.plugins.keys()),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: Date.now(),
    }

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(status))
  }

  /**
   * 处理 RPC 调用
   */
  private handleRPCCall(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    parsedUrl: url.UrlWithParsedQuery
  ): void {
    const pathParts = parsedUrl.pathname!.split('/')
    // /rpc/{pluginName}/{method}
    const pluginName = pathParts[2]
    const method = pathParts[3]

    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })

    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {}
        this.callPluginMethod(pluginName, method, data)
          .then(result => {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ result }))
          })
          .catch(error => {
            console.error(`[${this.hostName}] RPC 调用失败:`, error)
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: error.message }))
          })
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Invalid JSON' }))
      }
    })
  }

  /**
   * 调用插件方法
   */
  private async callPluginMethod(pluginName: string, method: string, data: any): Promise<any> {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found`)
    }

    if (typeof plugin[method] !== 'function') {
      throw new Error(`Method ${method} not found in plugin ${pluginName}`)
    }

    return await plugin[method](data)
  }

  /**
   * 处理插件管理
   */
  private handlePluginManagement(req: http.IncomingMessage, res: http.ServerResponse): void {
    if (req.method === 'GET') {
      // 获取已加载插件列表
      const plugins = Array.from(this.plugins.entries()).map(([name, instance]) => ({
        name,
        methods: Object.getOwnPropertyNames(Object.getPrototypeOf(instance)).filter(
          m => m !== 'constructor' && typeof instance[m] === 'function'
        ),
      }))

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ plugins }))
    } else {
      res.writeHead(405, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Method Not Allowed' }))
    }
  }

  /**
   * 加载插件
   */
  async loadPlugin(pluginData: { plugin_id: number; plugin_name: string; remote_name: string; backend_entry?: string }): Promise<void> {
    const { plugin_name, backend_entry } = pluginData

    console.log(`[${this.hostName}] 加载插件: ${plugin_name}`)

    try {
      if (backend_entry) {
        // 动态加载插件模块
        const PluginModule = await import(backend_entry)
        const instance = new PluginModule.default()

        // 存储插件实例
        this.plugins.set(plugin_name, instance)

        console.log(`[${this.hostName}] ✅ 插件 ${plugin_name} 加载成功`)
      } else {
        console.log(`[${this.hostName}] ⚠️ 插件 ${plugin_name} 无后端入口`)
      }
    } catch (error) {
      console.error(`[${this.hostName}] ❌ 插件 ${plugin_name} 加载失败:`, error)
      throw error
    }
  }

  /**
   * 卸载插件
   */
  unloadPlugin(pluginName: string): void {
    console.log(`[${this.hostName}] 卸载插件: ${pluginName}`)
    this.plugins.delete(pluginName)
    console.log(`[${this.hostName}] ✅ 插件 ${pluginName} 已卸载`)
  }

  /**
   * 启动心跳检测
   */
  private startHeartbeat(): void {
    setInterval(() => {
      // 这里应该向主 API 服务发送心跳
      console.log(`[${this.hostName}] 💓 心跳检测`)
    }, 30000) // 每30秒发送一次心跳
  }

  /**
   * 设置优雅关闭
   */
  private setupGracefulShutdown(): void {
    const gracefulShutdown = (signal: string) => {
      console.log(`[${this.hostName}] 收到信号 ${signal}，开始优雅关闭...`)

      if (this.server) {
        this.server.close(() => {
          console.log(`[${this.hostName}] HTTP 服务器已关闭`)
          process.exit(0)
        })
      } else {
        process.exit(0)
      }
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))
  }

  /**
   * 停止插件主机
   */
  async stop(): Promise<void> {
    console.log(`[${this.hostName}] 停止插件主机...`)

    // 清空所有插件
    this.plugins.clear()

    // 关闭服务器
    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server!.close(() => {
          console.log(`[${this.hostName}] 插件主机已停止`)
          resolve()
        })
      })
    }
  }
}

// 主函数
async function main() {
  const host = new PluginHost()

  try {
    await host.start()

    // 保持进程运行
    console.log(`[${process.env.HOST_NAME || 'core-host'}] Plugin host is running...`)
  } catch (error) {
    console.error('插件主机启动失败:', error)
    process.exit(1)
  }
}

// 如果直接运行此文件，则执行主函数
if (require.main === module) {
  main()
}

export default PluginHost
