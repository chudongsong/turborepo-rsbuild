### 插件系统的核心：`manifest.json`

每个插件（无论多简单或多复杂）都必须有一个`manifest.json`文件，这是它的“身份证”和“说明书”。它定义了一个插件的一切。

一个插件包（比如 `my-app.zip`）的结构可能是：

```
my-app/
├── manifest.json       <-- 核心：定义插件
├── frontend/           <-- 前端资源
│   ├── index.html      <-- 插件UI的入口
│   └── ... (js, css, a_icons)
└── backend/            <-- [可选] 后端逻辑
    ├── index.js        <-- 后端服务的入口
    └── package.json    <-- [可选] 后端依赖
```

-----

### 1\. 前端插件构思 (FE Plugin)

前端插件就是用户能“看到”和“交互”的部分，比如一个“计算器”应用或一个“天气”挂件。

**核心机制：iFrame 沙箱 + SDK 通信**

1. **加载 (Host)：**
   - 当用户启动一个插件时，“玲珑OS”的核心Shell会创建一个窗口。
   - 在这个窗口里，它会创建一个`<iframe>`，并将`src`指向该插件的`frontend/index.html`。
2. **隔离 (Sandbox)：**
   - `<iframe>` 提供了完美的样式隔离（插件的 CSS 不会污染主界面）和 JS 隔离（插件的 `window` 和主界面的 `window` 是分开的）。
   - 我们会使用 `sandbox` 属性来限制它的能力，比如禁止它弹窗或访问 `top.location`。
3. **通信 (SDK)：**
   - 插件（在 iFrame 里）如何与“玲珑OS”（在 iFrame 外）通信？通过一个我们提供的 **JavaScript-SDK**。
   - 主 Shell 会通过 `postMessage` 向 iFrame 注入一个全局 API，比如 `window.linglong`。

**前端 `manifest.json` 示例：**

```json
{
  "id": "com.example.calculator",
  "name": "计算器",
  "version": "1.0.0",
  "icon": "frontend/icon.png",
  "type": "app", // 'app' (应用), 'widget' (挂件), 'theme' (主题)
  "frontend": {
    "entry": "frontend/index.html", // iFrame 的加载入口
    "permissions": [ // 申请权限
      "window:create",     // 允许创建新窗口
      "notification:show", // 允许发通知
      "rpc:call_backend"   // [关键] 允许调用它自己的后端
    ]
  },
  "backend": { ... } // 稍后说
}
```

**前端插件能做什么 (SDK 示例)：**

```javascript
// 在插件的 JS (iFrame 内部) 中运行

// 1. 创建一个“关于”窗口
await window.linglong.window.create({
  title: "关于计算器",
  url: "frontend/about.html", // 相对路径
  width: 300,
  height: 200
});

// 2. 发送一个桌面通知
await window.linglong.notification.show({
  title: "计算结果",
  body: "答案是 42"
});

// 3. [关键] 调用自己的后端逻辑
const result = await window.linglong.rpc.call("add", { a: 20, b: 22 });
// result === 42
```

-----

### 2\. 后端插件构思 (BE Plugin)

这是最有趣的部分！如果你的“计算器”只是前端加法，那不需要后端。但如果它是一个“汇率转换器”，需要实时拉取汇率呢？如果它是一个“便签”应用，需要保存数据呢？

**核心机制：服务发现 + FaaS (Function as a Service) 模式**

我们不让插件直接“安装”代码到我们的主后端（太危险了！）。相反，我们把插件的后端当作\*\*“服务端函数”\*\*来运行。

1. **定义 (Manifest)：**
   - 插件在 `manifest.json` 中声明它拥有后端。
2. **部署 (Registry)：**
   - 当管理员“上架”这个插件时，我们的“插件注册中心”会读取它的 `backend/` 目录。
   - 它会把这个后端打包（比如用 `docker build` 或 `zip`）成一个独立的“函数”或“微服务”。
   - 它可能被部署为：
     - **A. Serverless 函数** (如 AWS Lambda, 阿里云函数计算)
     - **B. Kubernetes (K8s) 里的一个 Pod**
3. **路由 (Gateway)：**
   - API 网关现在知道：“凡是发给 `com.example.calculator` 插件后端的请求，都转发到那个 Serverless 函数/Pod 地址去。”

**后端 `manifest.json` 示例 (续)：**

```json
{
  "id": "com.example.calculator",
  ...
  "frontend": { ... },
  "backend": {
    "runtime": "nodejs18", // 声明运行环境
    "entry": "backend/index.js", // 入口文件
    "endpoints": [ // 声明它暴露了哪些“函数”
      "add",
      "subtract"
    ]
  }
}
```

**后端插件能做什么 (代码示例)：**

```javascript
// 在插件的 backend/index.js (运行在云端的函数)

// 暴露一个 'add' 函数
exports.add = async (event) => {
  // event.data 是从前端传来的 { a: 20, b: 22 }
  // event.user 是网关注入的当前用户信息
  const { a, b } = event.data;
  
  // 这里可以做复杂计算，甚至可以 require('axios') 来访问外部 API
  // 比如查数据库、查汇率...
  
  const result = a + b;
  
  // 返回 JSON
  return { status: 200, body: result };
};

// 暴露一个 'subtract' 函数
exports.subtract = async (event) => {
  // ...
  return { status: 200, body: event.data.a - event.data.b };
};
```

-----

### 总结一下这个架构

- **前端：** `iFrame` (安全隔离) + `SDK` (能力赋予)
- **后端：** `FaaS/Serverless` (安全隔离) + `API Gateway` (路由)
- **连接：** 插件的前端通过 `linglong.rpc.call()` 调用 API 网关，网关再把请求转发给插件对应的后端函数。

这个模型既保证了主系统的安全稳定，又给了插件几乎无限的（前后端）扩展能力。

你觉得这个\*\*“iFrame + FaaS”\*\*的插件模式怎么样？是听起来太复杂了，还是正好能满足你的需求？
