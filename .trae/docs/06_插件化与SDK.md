# 玲珑OS插件化与SDK

## 1. 插件化架构

### 1.1 插件清单 (Manifest)
每个插件都必须包含一个`manifest.json`文件，用于描述插件的元数据和配置。
```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "title": "My Awesome Plugin",
  "description": "A brief description of what this plugin does.",
  "author": "Your Name",
  "icon": "/icon.png",
  "runtime": "sandboxed", // "integrated" or "sandboxed"
  "entry": {
    "main": "/dist/main.js"
  },
  "permissions": [
    "window.create",
    "notifications.send"
  ]
}
```

### 1.2 插件运行时
玲珑OS支持两种插件运行时，以满足不同场景的需求：
- **集成运行时 (Integrated Runtime)**: 插件作为React组件直接在前端宿主中运行。性能好，体验流畅，但安全性较低。适用于核心插件和受信任的第三方插件。
- **沙箱运行时 (Sandboxed Runtime)**: 插件在`iframe`中运行，与主应用完全隔离。安全性高，但性能和体验略有损失。适用于所有不受信任的第三方插件。

## 2. SDK开发

### 2.1 目标
- **简化插件开发**: 提供一组简单易用的API，封装底层的复杂性。
- **统一开发体验**: 无论插件运行在何种环境下，都使用同一套API。
- **保障系统安全**: SDK作为插件与系统交互的唯一入口，可以进行统一的权限检查和安全过滤。

### 2.2 API设计
SDK将通过`@linglongos/sdk`包提供。API将按模块划分，例如：
- **`linglong.window`**: 用于窗口管理，如`create()`, `close()`, `focus()`等。
- **`linglong.desktop`**: 用于与桌面交互，如`addShortcut()`, `getShortcuts()`等。
- **`linglong.notifications`**: 用于发送系统通知。
- **`linglong.events`**: 用于订阅和发布全局事件。

### 2.3 环境感知
SDK内部会自动检测当前的运行环境。如果是在集成运行时，API调用将直接转换为对Zustand store的操作；如果是在沙箱运行时，API调用将被序列化并通过`postMessage`发送给前端宿主，由宿主代为执行。

## 3. 集成运行时

### 3.1 加载方式
对于集成运行时插件，前端宿主将使用动态`import()`或`SystemJS`来加载插件的入口JS文件，该文件应导出一个React组件。

### 3.2 优点
- **高性能**: 无需`postMessage`通信开销，直接在主线程运行。
- **无缝体验**: 可以与主应用共享状态和UI组件库。

### 3.3 缺点
- **低安全性**: 插件代码可以直接访问主应用的`window`对象和所有资源。

## 4. 沙箱运行时

### 4.1 加载方式
对于沙箱运行时插件，前端宿主将创建一个`iframe`，并将其`src`指向插件的入口HTML文件。

### 4.2 通信机制
- **插件到宿主**: 插件通过`parent.postMessage()`向宿主发送消息。
- **宿主到插件**: 宿主通过`iframe.contentWindow.postMessage()`向插件发送消息。
- SDK会封装好这套通信机制，插件开发者无需关心底层实现。

### 4.3 优点
- **高安全性**: `iframe`提供了强大的安全隔离。

### 4.4 缺点
- **性能开销**: `postMessage`是异步的，且有序列化/反序列化的开销。
- **体验限制**: `iframe`内外存在UI和交互上的隔阂。

---

## 5. 文档元数据

- **文档类型**: 插件化与SDK设计文档
- **关键词**: 插件化, SDK, Manifest, 运行时, 沙箱, 集成, API设计, postMessage
- **目标读者**: 插件开发者, 核心开发者
- **核心内容**: 本文档定义了玲珑OS的插件化标准和SDK设计。它解释了插件如何通过`manifest.json`来定义，以及如何在不同的运行时（集成与沙箱）中被加载和执行，同时还概述了SDK提供的核心API。
- **AI解析优化**:
  - 提供了完整的`manifest.json`示例，便于AI理解插件的结构。
  - 清晰地区分和对比了两种插件运行时（集成与沙箱）的优缺点和实现方式。
  - 对SDK的API设计和核心功能进行了分类说明。