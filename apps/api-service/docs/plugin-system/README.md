# 玲珑OS 插件系统完整文档

## 目录

1. [概述](#概述)
2. [架构设计](#架构设计)
3. [插件类型](#插件类型)
4. [开发指南](#开发指南)
5. [API 参考](#api-参考)
6. [部署指南](#部署指南)
7. [示例插件](#示例插件)

---

## 概述

玲珑OS 插件系统是一个支持**混合架构**的可扩展系统，同时支持两种插件运行模式：

- **⚡ 核心插件 (集成运行时)**：高性能，深度集成，适用于系统核心功能
- **🛡️ 第三方插件 (沙箱隔离)**：高安全，强隔离，适用于第三方应用

### 核心特性

- 🔄 **混合架构**：同时支持两种运行模式，灵活选择
- 🔐 **权限控制**：基于 manifest.json 的声明式权限管理
- 🚀 **高性能**：Module Federation 支持，零性能损失
- 🔒 **强隔离**：iFrame 沙箱机制，确保系统安全
- 📊 **完整生命周期**：安装、启用、禁用、卸载全流程管理
- 🔌 **插件间通信**：支持插件间无缝协作
- 📈 **监控与日志**：完整的事件日志和性能监控

---

## 架构设计

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        前端层 (FE)                          │
├─────────────────────────────────────────────────────────────┤
│  桌面应用 (React)                                           │
│  ├─ 插件宿主 (Module Federation Host)                        │
│  ├─ 核心插件 (集成运行时)                                    │
│  └─ 第三方插件 (iFrame 沙箱)                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                         RPC Call
                              │
┌─────────────────────────────────────────────────────────────┐
│                        API 网关层                           │
├─────────────────────────────────────────────────────────────┤
│  PluginGatewayService (智能路由)                            │
│  ├─ 核心插件 → 共享插件主机 (Port 4001)                     │
│  └─ 第三方插件 → FaaS/独立服务                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      插件主机层 (BE)                        │
├─────────────────────────────────────────────────────────────┤
│  核心主机 (core-host)                                       │
│  ├─ PluginHost 进程                                         │
│  ├─ PluginManager                                           │
│  └─ RPC Server                                              │
│                                                              │
│  用户主机 (user-host)                                       │
│  ├─ PluginHost 进程                                         │
│  └─ 隔离运行                                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      数据存储层                             │
├─────────────────────────────────────────────────────────────┤
│  SQLite 数据库                                              │
│  ├─ plugins (插件信息)                                      │
│  ├─ plugin_versions (版本管理)                              │
│  ├─ plugin_instances (实例管理)                            │
│  ├─ plugin_events (事件日志)                                │
│  ├─ plugin_permissions (权限管理)                          │
│  └─ plugin_hosts (主机管理)                                │
└─────────────────────────────────────────────────────────────┘
```

### 核心组件

1. **PluginLifecycleService** - 插件生命周期管理
2. **PluginRuntimeService** - 运行时环境管理
3. **PluginGatewayService** - API 智能路由
4. **PluginHost** - 独立进程管理
5. **前端 SDK** - 插件开发工具

---

## 插件类型

### 1. 核心插件 (集成运行时)

**特点**：
- 🚀 最高性能：零通信开销
- 🔌 深度集成：直接访问系统 API
- 🤝 共享运行时：模块复用
- ⚙️ 复杂交互：支持拖拽、快捷键等

**适用场景**：
- 文件管理器
- 设置中心
- 系统监控
- 桌面环境

**技术实现**：
- 前端：Module Federation
- 后端：共享插件主机进程
- 通信：本地 RPC 调用

### 2. 第三方插件 (沙箱隔离)

**特点**：
- 🔒 高安全性：iFrame 隔离
- 🌐 独立部署：可部署到 CDN
- 🛡️ 权限控制：严格的权限检查
- 🔄 简单通信：postMessage

**适用场景**：
- 计算器
- 天气插件
- 记事本
- 音乐播放器

**技术实现**：
- 前端：iFrame + postMessage
- 后端：FaaS/Serverless
- 通信：HTTP 请求

---

## 开发指南

### 1. 插件结构

#### 核心插件结构

```
my-core-plugin/
├── manifest.json          # 插件清单
├── frontend/              # 前端资源
│   ├── src/
│   │   ├── App.tsx        # 主组件
│   │   └── index.ts       # 入口文件
│   ├── dist/              # 构建输出
│   └── webpack.config.js  # MF 配置
├── backend/               # 后端逻辑
│   ├── index.js           # 后端入口
│   └── package.json
└── README.md
```

#### 第三方插件结构

```
my-sandbox-plugin/
├── manifest.json          # 插件清单
├── frontend/              # 前端资源
│   ├── src/
│   │   ├── App.tsx        # 主组件
│   │   └── index.ts       # 入口文件
│   ├── dist/              # 构建输出
│   └── webpack.config.js
├── backend/               # 后端服务 (可选)
│   └── index.js           # FaaS 函数
└── README.md
```

### 2. manifest.json

#### 核心插件 manifest

```json
{
  "id": "com.linglong.file-manager",
  "name": "文件管理器",
  "version": "1.0.0",
  "description": "核心文件管理插件",
  "author": "LinglongOS Team",
  "license": "MIT",
  "runtime": "integrated",
  "type": "app",
  "permissions": [
    "fs:read",
    "fs:write",
    "window:create",
    "network:http"
  ],
  "frontend": {
    "entry": "./frontend/dist/remoteEntry.js",
    "framework": "react",
    "moduleFederation": {
      "name": "fileManager",
      "filename": "remoteEntry.js",
      "exposes": {
        "./App": "./src/App.tsx"
      },
      "shared": {
        "react": { "singleton": true },
        "react-dom": { "singleton": true }
      }
    }
  },
  "backend": {
    "type": "shared-host",
    "entry": "./backend/index.js"
  },
  "api": {
    "version": "1.0",
    "methods": [
      "readFile",
      "writeFile",
      "deleteFile",
      "listFiles"
    ]
  }
}
```

#### 第三方插件 manifest

```json
{
  "id": "com.thirdparty.weather",
  "name": "天气插件",
  "version": "1.0.0",
  "runtime": "sandboxed",
  "type": "widget",
  "permissions": [
    "network:http"
  ],
  "frontend": {
    "entry": "https://plugins.linglong.com/weather/dist/index.html",
    "iframe": {
      "sandbox": ["allow-scripts"],
      "width": 300,
      "height": 200
    }
  },
  "backend": {
    "type": "faas",
    "endpoint": "https://faas.linglong.com/weather",
    "runtime": "nodejs18"
  }
}
```

### 3. 开发示例

#### 创建核心插件

```typescript
// frontend/src/App.tsx
import React from 'react'
import { BasePlugin } from '@linglongos/sdk'

class FileManagerPlugin extends BasePlugin {
  async activate() {
    console.log('文件管理器已激活')

    // 创建窗口
    const windowId = await this.api.window.create({
      title: '文件管理器',
      width: 800,
      height: 600
    })

    // 读取文件列表
    const files = await this.api.rpc.call('listFiles', {
      path: '/'
    })

    console.log('文件列表:', files)
  }

  async deactivate() {
    console.log('文件管理器已停用')
  }
}

// Module Federation 导出
export default FileManagerPlugin
export const exposedMethods = ['default']
```

#### 创建第三方插件

```typescript
// frontend/src/App.tsx
import React, { useEffect } from 'react'
import { BasePlugin } from '@linglongos/sdk'

class WeatherWidget extends BasePlugin {
  async activate() {
    console.log('天气插件已激活')

    // 创建小窗口
    const windowId = await this.api.window.create({
      title: '天气预报',
      width: 300,
      height: 200
    })

    // 获取天气数据
    const weather = await this.api.rpc.call('getWeather', {
      city: '北京'
    })

    console.log('天气:', weather)
  }
}

// iFrame 中运行，无需 Module Federation
export default WeatherWidget
```

---

## API 参考

### 服务 API

#### PluginLifecycleService

```typescript
// 安装插件
await ctx.service.pluginLifecycle.installPlugin(
  pluginId: number,
  versionId: number,
  config?: any
)

// 启用插件
await ctx.service.pluginLifecycle.enablePlugin(pluginId: number)

// 禁用插件
await ctx.service.pluginLifecycle.disablePlugin(pluginId: number)

// 启动实例
await ctx.service.pluginLifecycle.startPluginInstance(instanceId: number)
```

#### PluginRuntimeService

```typescript
// 加载核心插件
const { remoteName, port } = await ctx.service.pluginRuntime.loadIntegratedPlugin(
  pluginId: number
)

// 加载第三方插件
const { sandboxUrl, port } = await ctx.service.pluginRuntime.loadSandboxedPlugin(
  pluginId: number
)

// 启动插件主机
await ctx.service.pluginRuntime.startPluginHost(hostName: string)
```

#### PluginGatewayService

```typescript
// 路由插件调用
const result = await ctx.service.pluginGateway.routePluginCall(
  pluginId: number,
  method: string,
  data?: any
)

// 插件间通信
const result = await ctx.service.pluginGateway.interPluginCall(
  fromPluginId: number,
  toPluginId: number,
  method: string,
  data?: any
)
```

### 控制器 API

#### 生命周期管理

```bash
POST /api/v1/plugins/:id/install        # 安装插件
POST /api/v1/plugins/:id/enable         # 启用插件
POST /api/v1/plugins/:id/disable        # 禁用插件
POST /api/v1/plugins/:id/uninstall      # 卸载插件
```

#### 实例管理

```bash
POST /api/v1/plugins/:id/instances      # 创建实例
GET /api/v1/plugins/:id/instances       # 获取实例列表
POST /api/v1/instances/:id/start        # 启动实例
POST /api/v1/instances/:id/stop         # 停止实例
POST /api/v1/instances/:id/restart      # 重启实例
```

#### 权限管理

```bash
GET /api/v1/plugins/:id/permissions     # 获取权限列表
POST /api/v1/plugins/:id/permissions    # 设置权限
DELETE /api/v1/plugins/:id/permissions/:permName  # 撤销权限
```

#### 主机管理

```bash
GET /api/v1/plugin-hosts/status         # 获取主机状态
POST /api/v1/plugin-hosts/:hostName/start  # 启动主机
POST /api/v1/plugin-hosts/:hostName/stop   # 停止主机
```

---

## 部署指南

### 1. 数据库迁移

```bash
# 执行数据库迁移
node scripts/run-plugin-migration.js
```

### 2. 启动插件主机

```bash
# 启动核心主机
node apps/plugin-host/dist/index.js

# 或使用 PM2
pm2 start apps/plugin-host/dist/index.js --name "core-host"
```

### 3. 部署核心插件

```bash
# 构建插件
npm run build

# 上传到插件仓库
npm publish

# 或部署到本地
cp -r dist/* /path/to/plugins/core/
```

### 4. 部署第三方插件

```bash
# 构建插件
npm run build

# 部署到 CDN
# 例如：https://plugins.linglong.com/my-plugin/

# 配置 FaaS 服务
# 例如：https://faas.linglong.com/my-plugin/
```

---

## 示例插件

### 示例 1: 计算器插件 (第三方)

```json
{
  "id": "com.example.calculator",
  "name": "计算器",
  "version": "1.0.0",
  "runtime": "sandboxed",
  "type": "app",
  "permissions": [],
  "frontend": {
    "entry": "https://plugins.linglong.com/calculator/index.html"
  }
}
```

```typescript
// frontend/src/App.tsx
import React, { useState } from 'react'

const Calculator = () => {
  const [display, setDisplay] = useState('0')

  const calculate = (expression: string) => {
    try {
      // 注意：实际生产中应使用安全的计算库
      const result = eval(expression)
      setDisplay(String(result))
    } catch (error) {
      setDisplay('Error')
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <div style={{
        border: '1px solid #ccc',
        padding: '10px',
        marginBottom: '10px',
        textAlign: 'right',
        fontSize: '24px'
      }}>
        {display}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px' }}>
        {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'].map((key) => (
          <button
            key={key}
            onClick={() => {
              if (key === '=') {
                calculate(display)
              } else {
                setDisplay(display === '0' ? key : display + key)
              }
            }}
            style={{ padding: '10px', fontSize: '18px' }}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Calculator
```

### 示例 2: 文件管理器插件 (核心)

```typescript
// frontend/src/App.tsx
import React, { useState, useEffect } from 'react'

const FileManager = () => {
  const [files, setFiles] = useState([])
  const [currentPath, setCurrentPath] = useState('/')

  useEffect(() => {
    // 加载文件列表
    loadFiles(currentPath)
  }, [currentPath])

  const loadFiles = async (path: string) => {
    try {
      // 这里应该调用 RPC API
      const response = await fetch(`/api/v1/rpc/file-manager/listFiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      })
      const data = await response.json()
      setFiles(data.files || [])
    } catch (error) {
      console.error('加载文件失败:', error)
    }
  }

  return (
    <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '10px' }}>
        <strong>路径: </strong>{currentPath}
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {files.map((file: any) => (
          <div
            key={file.name}
            style={{
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            onClick={() => {
              if (file.isDirectory) {
                setCurrentPath(`${currentPath}${file.name}/`)
              }
            }}
          >
            <span style={{ marginRight: '10px' }}>
              {file.isDirectory ? '📁' : '📄'}
            </span>
            {file.name}
          </div>
        ))}
      </div>
    </div>
  )
}

export default FileManager
```

---

## 最佳实践

### 1. 权限管理

- ✅ 仅申请必要的权限
- ✅ 定期审查权限使用
- ✅ 使用最小权限原则
- ❌ 不要申请全部权限

### 2. 性能优化

- ✅ 核心插件使用 Module Federation
- ✅ 第三方插件使用代码分割
- ✅ 避免不必要的 RPC 调用
- ✅ 合理使用缓存

### 3. 安全考虑

- ✅ 验证所有输入
- ✅ 限制文件系统访问
- ✅ 使用 CSP 头部
- ❌ 不要信任用户输入

### 4. 错误处理

```typescript
try {
  const result = await this.api.rpc.call('myMethod', data)
} catch (error) {
  console.error('调用失败:', error)
  // 显示用户友好的错误信息
  this.api.notification.show({
    title: '错误',
    body: '操作失败，请稍后重试'
  })
}
```

---

## 故障排除

### 常见问题

1. **插件无法加载**
   - 检查 manifest.json 格式
   - 验证权限配置
   - 查看错误日志

2. **API 调用失败**
   - 确认插件已启用
   - 检查权限设置
   - 验证网络连接

3. **权限被拒绝**
   - 检查 manifest.json 中的权限列表
   - 使用 `requestPermission()` 请求权限

---

## 更新日志

### v1.0.0 (2025-11-06)

- ✨ 初始版本发布
- ✨ 支持混合架构 (集成运行时 + 沙箱隔离)
- ✨ 实现插件生命周期管理
- ✨ 实现权限系统
- ✨ 实现插件间通信
- ✨ 发布前端 SDK

---

## 许可证

MIT

---

## 联系信息

- 项目主页: https://github.com/linglongos/turborepo-rsbuild
- 问题反馈: https://github.com/linglongos/turborepo-rsbuild/issues
- 邮件: linglongos@example.com
