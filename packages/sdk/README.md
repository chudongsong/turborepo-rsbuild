# LinglongOS SDK

LinglongOS 前端插件开发 SDK，提供完整的插件开发工具和 API。

## 安装

```bash
npm install @linglongos/sdk
# 或
yarn add @linglongos/sdk
# 或
pnpm add @linglongos/sdk
```

## 使用方法

### 1. 基础用法

```typescript
import { initializePlugin } from '@linglongos/sdk'

// 初始化插件
const plugin = await initializePlugin(MyPlugin)

// 插件将自动激活
```

### 2. 创建插件

```typescript
import { BasePlugin, LingLongAPI } from '@linglongos/sdk'

class MyPlugin extends BasePlugin {
  async activate() {
    console.log('插件已激活')

    // 使用 API
    await this.api.window.create({
      title: '我的插件',
      width: 800,
      height: 600
    })
  }

  async deactivate() {
    console.log('插件已停用')
  }
}
```

### 3. 集成运行时插件

```typescript
import React from 'react'
import { BasePlugin } from '@linglongos/sdk'

class FileManagerPlugin extends BasePlugin {
  async activate() {
    console.log('文件管理器插件已激活')
  }
}

// 导出 React 组件
export default FileManagerPlugin

// Module Federation 配置
export const exposedMethods = ['default']
```

### 4. 沙箱插件

```typescript
import { BasePlugin } from '@linglongos/sdk'

class WeatherWidget extends BasePlugin {
  async activate() {
    console.log('天气插件已激活')

    // 创建窗口
    const windowId = await this.api.window.create({
      title: '天气',
      width: 300,
      height: 200
    })

    // 读取数据
    const weather = await this.api.rpc.call('getWeather', {
      city: '北京'
    })

    console.log('天气数据:', weather)
  }
}
```

## API 文档

### LingLongAPI

#### 窗口管理

```typescript
// 创建窗口
const windowId = await api.window.create({
  title: '窗口标题',
  width: 800,
  height: 600,
  resizable: true
})

// 设置窗口标题
api.window.setTitle(windowId, '新标题')

// 关闭窗口
api.window.close(windowId)
```

#### 文件系统

```typescript
// 读取文件
const content = await api.fs.readFile('/path/to/file.txt')

// 写入文件
await api.fs.writeFile('/path/to/file.txt', '文件内容')

// 检查文件是否存在
const exists = await api.fs.exists('/path/to/file.txt')
```

#### RPC 调用

```typescript
// 调用 API
const result = await api.rpc.call('myMethod', {
  data: 'some data'
})

// 监听事件
api.rpc.on('myEvent', (data) => {
  console.log('收到事件:', data)
})
```

#### 通知

```typescript
await api.notification.show({
  title: '通知标题',
  body: '通知内容',
  icon: '/path/to/icon.png'
})
```

### 权限系统

```typescript
// 检查权限
if (plugin.hasPermission('fs:read')) {
  const content = await api.fs.readFile('/path/to/file')
}

// 请求权限
const granted = await plugin.requestPermission('fs:write')
if (granted) {
  await api.fs.writeFile('/path/to/file', '内容')
}
```

### 插件间通信

```typescript
// 调用其他插件
const result = await api.interPlugin.call('other-plugin', 'methodName', {
  data: '数据'
})
```

## 插件类型

### 核心插件 (集成运行时)

- 运行环境：与主系统共享
- 性能：最高
- 隔离：低
- 适用：系统核心功能（文件管理器、设置等）

### 第三方插件 (沙箱隔离)

- 运行环境：iFrame 隔离
- 性能：中等
- 隔离：高
- 适用：第三方应用（计算器、天气、记事本等）

## 部署

### 1. 核心插件部署

```bash
# 构建插件
npm run build

# 上传到插件仓库
npm publish
```

### 2. 第三方插件部署

```bash
# 构建插件（仅前端）
npm run build

# 部署到 CDN
# 例如：https://plugins.linglong.com/my-plugin/
```

## 开发指南

### 开发环境搭建

```bash
# 克隆项目
git clone https://github.com/linglongos/sdk.git

# 安装依赖
npm install

# 启动开发模式
npm run dev
```

### 测试插件

```typescript
// 使用内置测试工具
import { testPlugin } from '@linglongos/sdk'

testPlugin(MyPlugin, {
  name: 'my-plugin',
  version: '1.0.0'
})
```

## 常见问题

### Q: 如何调试插件？

A: 使用浏览器开发者工具，在 Sources 面板中找到你的插件代码。

### Q: 插件无法访问文件系统？

A: 检查插件是否具有 `fs:read` 或 `fs:write` 权限。

### Q: 如何实现插件间通信？

A: 使用 `api.interPlugin.call()` 方法。

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！
