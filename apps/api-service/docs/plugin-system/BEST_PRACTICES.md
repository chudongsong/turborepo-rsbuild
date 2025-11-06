# 插件开发最佳实践

## 🎯 开发原则

### 1. 性能优先

#### 核心插件优化

```typescript
// ❌ 错误示例：频繁调用 API
function MyPlugin() {
  useEffect(() => {
    setInterval(() => {
      // 每秒调用一次 - 不推荐
      fetchData()
    }, 1000)
  }, [])
}

// ✅ 正确示例：使用缓存和防抖
const cache = new Map()
const fetchWithCache = debounce(async (key: string) => {
  if (cache.has(key)) {
    return cache.get(key)
  }
  const data = await api.rpc.call('getData', { key })
  cache.set(key, data)
  return data
}, 500)
```

#### 第三方插件优化

```typescript
// ❌ 错误示例：在 render 中创建对象
function MyWidget() {
  return (
    <div style={{
      position: 'absolute',  // 每次渲染都创建新对象
      top: 10
    }}>
      内容
    </div>
  )
}

// ✅ 正确示例：提取常量
const widgetStyles = {
  position: 'absolute',
  top: 10,
  left: 10
}

function MyWidget() {
  return (
    <div style={widgetStyles}>
      内容
    </div>
  )
}
```

### 2. 安全性

#### 输入验证

```typescript
// ✅ 正确示例：验证所有输入
async function processFile(path: string) {
  // 1. 验证路径格式
  if (!path || typeof path !== 'string') {
    throw new Error('Invalid path')
  }

  // 2. 检查路径遍历
  if (path.includes('..') || path.startsWith('/')) {
    throw new Error('Path traversal detected')
  }

  // 3. 验证权限
  if (!this.hasPermission('fs:read')) {
    throw new Error('Permission denied')
  }

  // 4. 使用白名单
  const allowedPaths = ['/data', '/tmp']
  if (!allowedPaths.some(p => path.startsWith(p))) {
    throw new Error('Path not allowed')
  }

  return await this.api.fs.readFile(path)
}
```

#### 权限最小化

```json
// ✅ 正确示例：只申请必要的权限
{
  "name": "calculator",
  "permissions": [
    "window:create"  // 只申请窗口权限
  ]
}

// ❌ 错误示例：申请过多权限
{
  "name": "calculator",
  "permissions": [
    "fs:read",
    "fs:write",      // 计算器不需要文件系统写权限
    "network:http",  // 不需要网络权限
    "system:admin"   // 绝对不要申请管理员权限
  ]
}
```

#### XSS 防护

```typescript
// ✅ 正确示例：使用 textContent
function DisplayText({ text }: { text: string }) {
  return <div>{text}</div>  // React 自动转义

  // 或者显式设置
  return <div dangerouslySetInnerHTML={{ __html: escapeHtml(text) }} />
}

function escapeHtml(text: string) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// ❌ 错误示例：直接插入 HTML
function DisplayText({ text }: { text: string }) {
  return <div dangerouslySetInnerHTML={{ __html: text }} />  // 可能被 XSS 攻击
}
```

### 3. 错误处理

#### 分层错误处理

```typescript
// 1. 插件层错误处理
class MyPlugin extends BasePlugin {
  async activate() {
    try {
      await this.loadData()
    } catch (error) {
      this.logger.error('加载数据失败:', error)
      this.showErrorMessage('加载失败，请重试')
    }
  }

  private showErrorMessage(message: string) {
    this.api.notification.show({
      title: '错误',
      body: message
    })
  }

  private logger = {
    error: (msg: string, error?: any) => {
      console.error(`[${this.config.name}] ${msg}`, error)
      // 记录到远程日志服务
      this.logToRemote('error', msg, error)
    }
  }
}

// 2. API 层错误处理
async function callAPIWithRetry(method: string, data: any, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await api.rpc.call(method, data)
    } catch (error) {
      if (i === retries - 1) {
        throw error
      }
      await sleep(Math.pow(2, i) * 1000)  // 指数退避
    }
  }
}
```

#### 错误信息

```typescript
// ✅ 正确示例：友好的错误信息
try {
  await riskyOperation()
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    throw new Error('网络连接失败，请检查网络设置')
  } else if (error.code === 'PERMISSION_DENIED') {
    throw new Error('权限不足，请联系管理员')
  } else {
    throw new Error(`操作失败: ${error.message}`)
  }
}

// ❌ 错误示例：暴露内部错误
try {
  await riskyOperation()
} catch (error) {
  throw error  // 不要直接抛出原始错误，可能包含敏感信息
}
```

### 4. 代码质量

#### TypeScript 严格模式

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,              // 启用严格模式
    "noImplicitAny": true,       // 禁止隐式 any
    "noImplicitReturns": true,   // 检查返回值
    "noFallthroughCasesInSwitch": true,  // switch 必须完整
    "exactOptionalPropertyTypes": true,  // 精确属性类型
    "noUncheckedIndexedAccess": true      // 检查索引访问
  }
}
```

#### 类型定义

```typescript
// ✅ 正确示例：完整的类型定义
interface PluginConfig {
  apiVersion: string
  permissions: Permission[]
  windowConfig: WindowConfig
}

interface WindowConfig {
  defaultWidth: number
  defaultHeight: number
  resizable: boolean
  minimizable: boolean
}

type Permission = 'fs:read' | 'fs:write' | 'window:create'

class MyPlugin extends BasePlugin {
  private config: PluginConfig

  constructor(api: LingLongAPI, config: PluginConfig) {
    super(api, config)
    this.config = config
    this.validateConfig()
  }

  private validateConfig() {
    if (!this.config.apiVersion) {
      throw new Error('API version is required')
    }
    if (!Array.isArray(this.config.permissions)) {
      throw new Error('Permissions must be an array')
    }
  }
}

// ❌ 错误示例：缺少类型定义
class MyPlugin extends BasePlugin {
  async activate() {
    const data = await this.api.rpc.call('getData')  // 不知道返回类型
    console.log(data.value)  // 可能 undefined
  }
}
```

#### 代码组织

```
my-plugin/
├── src/
│   ├── components/        # React 组件
│   │   ├── MainWindow.tsx
│   │   └── Sidebar.tsx
│   ├── services/          # 业务逻辑
│   │   ├── FileService.ts
│   │   └── NetworkService.ts
│   ├── hooks/             # 自定义 Hooks
│   │   useFileSystem.ts
│   │   └── useNetwork.ts
│   ├── types/             # 类型定义
│   │   └── index.ts
│   ├── utils/             # 工具函数
│   │   ├── constants.ts
│   │   └── helpers.ts
│   ├── index.ts           # 入口文件
│   └── App.tsx            # 主组件
├── tests/                 # 测试文件
│   ├── components/
│   ├── services/
│   └── integration/
├── docs/                  # 文档
│   ├── README.md
│   └── API.md
├── manifest.json          # 插件清单
├── package.json
└── tsconfig.json
```

## 📐 架构模式

### 1. 插件架构

#### 插件基类

```typescript
// ✅ 正确示例：规范的插件基类
abstract class BasePlugin {
  protected api: LingLongAPI
  protected config: PluginConfig
  protected isActive: boolean = false

  constructor(api: LingLongAPI, config: PluginConfig) {
    this.api = api
    this.config = config
  }

  async activate(): Promise<void> {
    if (this.isActive) {
      throw new Error('Plugin is already active')
    }

    try {
      await this.onActivate()
      this.isActive = true
      this.log('Plugin activated')
    } catch (error) {
      this.log('Activation failed', error)
      throw error
    }
  }

  async deactivate(): Promise<void> {
    if (!this.isActive) {
      return
    }

    try {
      await this.onDeactivate()
      this.isActive = false
      this.log('Plugin deactivated')
    } catch (error) {
      this.log('Deactivation failed', error)
      throw error
    }
  }

  protected abstract onActivate(): Promise<void> | void
  protected abstract onDeactivate(): Promise<void> | void

  protected log(message: string, error?: any) {
    console.log(`[${this.config.name}] ${message}`, error)
  }

  protected checkPermission(permission: string): boolean {
    if (!this.config.permissions.includes(permission)) {
      throw new Error(`Missing permission: ${permission}`)
    }
    return true
  }
}
```

#### 服务层模式

```typescript
// ✅ 正确示例：服务层抽象
interface FileService {
  readFile(path: string): Promise<string>
  writeFile(path: string, data: string): Promise<void>
  deleteFile(path: string): Promise<void>
}

class PluginFileService implements FileService {
  constructor(private api: LingLongAPI) {}

  async readFile(path: string): Promise<string> {
    this.checkPermission('fs:read')
    const result = await this.api.rpc.call('fs:read', { path })
    return result.data
  }

  async writeFile(path: string, data: string): Promise<void> {
    this.checkPermission('fs:write')
    await this.api.rpc.call('fs:write', { path, data })
  }

  private checkPermission(permission: string) {
    // 权限检查逻辑
  }
}

class MyPlugin extends BasePlugin {
  private fileService: FileService

  constructor(api: LingLongAPI, config: PluginConfig) {
    super(api, config)
    this.fileService = new PluginFileService(api)
  }

  async onActivate() {
    const content = await this.fileService.readFile('/data/config.json')
    console.log('配置文件:', content)
  }
}
```

### 2. 状态管理

#### 使用 React Hooks

```typescript
// ✅ 正确示例：状态管理
import { useState, useEffect, useCallback } from 'react'

function MyPluginComponent() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 使用 useCallback 优化性能
  const loadFiles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await window.linglong.rpc.call('listFiles', { path: '/' })
      setFiles(result.files)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  if (loading) return <div>加载中...</div>
  if (error) return <div>错误: {error}</div>

  return (
    <div>
      {files.map(file => (
        <div key={file.name}>{file.name}</div>
      ))}
    </div>
  )
}
```

#### 状态机模式

```typescript
// ✅ 正确示例：插件状态机
type PluginState = 'idle' | 'loading' | 'ready' | 'error'

interface StateContext {
  current: PluginState
  setState: (state: PluginState) => void
}

function usePluginState(): StateContext {
  const [current, setCurrent] = useState<PluginState>('idle')

  const setState = useCallback((state: PluginState) => {
    console.log(`状态变化: ${current} -> ${state}`)
    setCurrent(state)
  }, [current])

  return { current, setState }
}

class MyPlugin extends BasePlugin {
  private state: StateContext

  constructor(api: LingLongAPI, config: PluginConfig) {
    super(api, config)
    this.state = {
      current: 'idle',
      setState: (state) => {
        this.state.current = state
        console.log(`[${this.config.name}] 状态: ${state}`)
      }
    }
  }

  async onActivate() {
    this.state.setState('loading')
    try {
      await this.initialize()
      this.state.setState('ready')
    } catch (error) {
      this.state.setState('error')
      throw error
    }
  }
}
```

### 3. 事件系统

```typescript
// ✅ 正确示例：事件驱动
interface EventMap {
  'file:selected': { fileName: string }
  'file:deleted': { fileName: string }
  'error': { message: string }
}

class EventEmitter {
  private listeners = new Map<keyof EventMap, Set<Function>>()

  on<K extends keyof EventMap>(event: K, listener: (data: EventMap[K]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)
  }

  off<K extends keyof EventMap>(event: K, listener: Function) {
    this.listeners.get(event)?.delete(listener)
  }

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]) {
    this.listeners.get(event)?.forEach(listener => listener(data))
  }
}

class FileManagerPlugin extends BasePlugin {
  private emitter = new EventEmitter()

  async onActivate() {
    this.emitter.on('file:selected', ({ fileName }) => {
      console.log('文件被选中:', fileName)
    })

    this.emitter.on('file:deleted', ({ fileName }) => {
      this.api.notification.show({
        title: '文件已删除',
        body: fileName
      })
    })
  }

  private async deleteFile(fileName: string) {
    try {
      await this.api.fs.deleteFile(`/data/${fileName}`)
      this.emitter.emit('file:deleted', { fileName })
    } catch (error) {
      this.emitter.emit('error', { message: error.message })
    }
  }
}
```

## 🧪 测试策略

### 1. 单元测试

```typescript
// ✅ 正确示例：使用 Jest + Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, jest } from '@jest/globals'

// 模拟 API
jest.mock('@linglongos/sdk', () => ({
  createLingLongAPI: jest.fn(() => ({
    rpc: {
      call: jest.fn()
    },
    window: {
      create: jest.fn()
    }
  }))
}))

describe('MyPlugin', () => {
  test('应该正确加载文件列表', async () => {
    const mockRpcCall = jest.fn().mockResolvedValue({
      files: [
        { name: 'file1.txt', type: 'file' },
        { name: 'folder', type: 'directory' }
      ]
    })

    const { createLingLongAPI } = require('@linglongos/sdk')
    createLingLongAPI.mockReturnValue({
      rpc: { call: mockRpcCall }
    })

    render(<MyPluginComponent />)

    await waitFor(() => {
      expect(screen.getByText('file1.txt')).toBeInTheDocument()
      expect(screen.getByText('folder')).toBeInTheDocument()
    })

    expect(mockRpcCall).toHaveBeenCalledWith('listFiles', { path: '/' })
  })

  test('应该正确处理错误', async () => {
    const mockRpcCall = jest.fn().mockRejectedValue(new Error('Network error'))
    const { createLingLongAPI } = require('@linglongos/sdk')
    createLingLongAPI.mockReturnValue({
      rpc: { call: mockRpcCall }
    })

    render(<MyPluginComponent />)

    await waitFor(() => {
      expect(screen.getByText('错误: Network error')).toBeInTheDocument()
    })
  })
})
```

### 2. 集成测试

```typescript
// ✅ 正确示例：集成测试
describe('插件集成测试', () => {
  test('应该能创建和删除文件', async () => {
    // 1. 创建插件实例
    const plugin = new FileManagerPlugin(api, config)
    await plugin.activate()

    // 2. 创建文件
    await api.rpc.call('createFile', {
      path: '/data/test.txt',
      content: 'Hello World'
    })

    // 3. 验证文件存在
    const files = await api.rpc.call('listFiles', { path: '/data' })
    expect(files.files).toContainEqual(
      expect.objectContaining({ name: 'test.txt' })
    )

    // 4. 删除文件
    await api.rpc.call('deleteFile', { path: '/data/test.txt' })

    // 5. 验证文件不存在
    const filesAfterDelete = await api.rpc.call('listFiles', { path: '/data' })
    expect(filesAfterDelete.files).not.toContainEqual(
      expect.objectContaining({ name: 'test.txt' })
    )

    await plugin.deactivate()
  })
})
```

### 3. 性能测试

```typescript
// ✅ 正确示例：性能基准测试
describe('性能测试', () => {
  test('文件加载应该在 100ms 内完成', async () => {
    const start = performance.now()
    await api.rpc.call('listFiles', { path: '/' })
    const duration = performance.now() - start

    expect(duration).toBeLessThan(100)
  })

  test('内存使用应该在 50MB 以内', async () => {
    const initialMemory = process.memoryUsage().heapUsed

    // 加载 100 个文件
    for (let i = 0; i < 100; i++) {
      await api.rpc.call('listFiles', { path: `/data/batch-${i}` })
    }

    const finalMemory = process.memoryUsage().heapUsed
    const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024

    expect(memoryIncrease).toBeLessThan(50)  // MB
  })
})
```

## 🚀 部署优化

### 1. 代码分割

```typescript
// ✅ 正确示例：动态导入
async function loadLargeFeature() {
  const { LargeComponent } = await import('./LargeComponent')
  return <LargeComponent />
}

// ✅ 正确示例：懒加载路由
const LazyComponent = React.lazy(() => import('./Component'))

function App() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <LazyComponent />
    </Suspense>
  )
}
```

### 2. 资源优化

```typescript
// ✅ 正确示例：缓存策略
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000  // 5 分钟

async function getCachedData(key: string) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  const data = await fetchData(key)
  cache.set(key, {
    data,
    timestamp: Date.now()
  })

  return data
}

// ✅ 正确示例：预加载关键资源
function preloadResources() {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = '/api/config'
  link.as = 'fetch'
  document.head.appendChild(link)
}
```

### 3. 监控和日志

```typescript
// ✅ 正确示例：性能监控
class PerformanceMonitor {
  static measure(name: string, fn: () => Promise<any>) {
    return async () => {
      const start = performance.now()
      try {
        const result = await fn()
        const duration = performance.now() - start
        console.log(`[${name}] 执行时间: ${duration.toFixed(2)}ms`)
        return result
      } catch (error) {
        const duration = performance.now() - start
        console.error(`[${name}] 失败 (${duration.toFixed(2)}ms):`, error)
        throw error
      }
    }
  }
}

// 使用
const loadData = PerformanceMonitor.measure('loadData', async () => {
  return await api.rpc.call('getData')
})
```

## 📚 文档规范

### 1. 代码注释

```typescript
/**
 * 文件管理器插件
 *
 * 提供文件浏览、创建、删除等功能
 *
 * @example
 * ```typescript
 * const fileManager = new FileManagerPlugin(api, config)
 * await fileManager.activate()
 * ```
 */
class FileManagerPlugin extends BasePlugin {
  /**
   * 创建新文件
   *
   * @param path - 文件路径
   * @param content - 文件内容
   * @returns Promise<void>
   *
   * @throws {Error} 当权限不足时抛出
   *
   * @example
   * ```typescript
   * await fileManager.createFile('/data/readme.txt', 'Hello World')
   * ```
   */
  async createFile(path: string, content: string): Promise<void> {
    this.checkPermission('fs:write')
    // 实现逻辑
  }
}
```

### 2. README 结构

```markdown
# 插件名称

## 简介

插件功能描述...

## 功能特性

- [x] 特性 1
- [x] 特性 2
- [ ] 计划中的特性

## 安装

```bash
npm install my-plugin
```

## 使用方法

```typescript
import MyPlugin from 'my-plugin'

const plugin = new MyPlugin(api, config)
await plugin.activate()
```

## 配置

```json
{
  "permissions": ["fs:read", "fs:write"],
  "windowConfig": {
    "width": 800,
    "height": 600
  }
}
```

## API

### createFile(path, content)

创建新文件

**参数**:
- `path: string` - 文件路径
- `content: string` - 文件内容

**返回**: `Promise<void>`

## 开发

```bash
npm install
npm run dev
npm test
```

## 贡献

欢迎提交 Pull Request！

## 许可证

MIT
```

## 📋 检查清单

### 开发完成检查

- [ ] TypeScript 编译无错误
- [ ] 所有测试通过
- [ ] 代码覆盖率达到 80% 以上
- [ ] 无内存泄漏
- [ ] API 性能达标
- [ ] 错误处理完善
- [ ] 安全审查通过
- [ ] 文档完整

### 部署前检查

- [ ] 生产环境构建成功
- [ ] 资源大小优化
- [ ] 缓存策略配置
- [ ] 监控指标设置
- [ ] 告警规则配置
- [ ] 回滚方案准备
- [ ] 部署脚本测试

### 运营中检查

- [ ] 性能监控正常
- [ ] 错误率在阈值内
- [ ] 用户反馈及时处理
- [ ] 安全补丁及时更新
- [ ] 版本更新计划
- [ ] 文档持续维护

---

## 💡 总结

插件开发的最佳实践：

1. **性能优先** - 使用缓存、防抖、代码分割
2. **安全第一** - 验证输入、最小权限、XSS 防护
3. **错误处理** - 分层处理、友好提示、完整日志
4. **代码质量** - TypeScript 严格模式、类型定义、代码组织
5. **架构模式** - 服务层、状态机、事件驱动
6. **测试策略** - 单元测试、集成测试、性能测试
7. **部署优化** - 代码分割、缓存策略、性能监控
8. **文档规范** - 详细注释、完整 README

遵循这些最佳实践，可以开发出高质量、高性能、高安全的插件！
