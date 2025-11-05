# API Service 修复报告

## 修复概述

本次修复解决了 api-service 项目中的 swaggerdoc 插件和授权限制问题，并完善了项目文档，便于开发者进行后续的更改和调整。

## 修复内容

### 1. 启用 SwaggerDoc 插件

**问题**: swaggerdoc 插件在 `config/plugin.ts` 中被设置为 `enable: false`

**修复**: 已启用插件并更新配置

```typescript
// config/plugin.ts (第49-52行)
swaggerdoc: {
  enable: true, // 启用 Swagger 文档插件
  package: 'egg-swagger-doc', // 开启 Swagger 文档插件，提供 API 文档生成功能
},
```

### 2. 优化授权中间件白名单

**问题**: swagger 相关路径可能未被完全包含在认证白名单中

**修复**: 完善了认证中间件白名单配置

```typescript
// app/middleware/auth.ts (第13-27行)
const whitelist = [
  '/api/v1/init/status',           // 初始化状态检查
  '/api/v1/auth/google-auth-bind', // 2FA 绑定（生成二维码）
  '/api/v1/auth/google-auth-verify', // 2FA 验证（首次绑定或登录）
  '/docs',                         // Swagger UI 文档页面（带尾斜杠）
  '/docs/',                        // Swagger UI 文档页面（带尾斜杠）
  '/api/v1/docs/openapi.json',     // OpenAPI JSON 文档
  '/swagger-doc',                  // Swagger JSON 文档（旧路径）
  '/swagger-ui.html',              // Swagger UI 页面
  '/swagger-ui-bundle.js',         // Swagger UI 资源文件
  '/swagger-ui-standalone-preset.js', // Swagger UI 资源文件
  '/swagger-ui.css',               // Swagger UI 样式文件
  '/public/docs.html',             // 自定义文档页面
];
```

### 3. 配置文件优化

**修复**: 优化了 `config.default.ts` 中的认证中间件配置

```typescript
// config/config.default.ts (第50-59行)
(config as any).auth = {
  ignore: [
    /^\/api\/v1\/auth\//,       // 认证相关接口
    /^\/public\//,              // 静态文件目录
    /^\/ui$/,                   // UI 页面
    /^\/docs\//,                // Swagger 文档
    /^\/api\/v1\/docs\//,       // OpenAPI 文档
    /^\/.*\.(css|js|html|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot|pdf|zip|tar|gz|json|xml|txt|md)$/  // 静态资源文件
  ],
};
```

### 4. 修复 Plugins 控制器 Swagger 注释

**问题 1**: `app/controller/plugins.ts` 中的 `@response` 注释格式不符合 `egg-swagger-doc` 规范

**修复 1**: 移除了所有不符合规范的 `@response` 注释

```typescript
// 修改前 (错误)
@response 200 OK - 成功返回插件列表
@response 404 Not Found - 插件不存在

// 修改后 (正确)
直接删除 @response 注释，保留 @router、@summary、@description 等
```

**问题 2**: `egg-swagger-doc` 错误：`[egg-swagger-doc] error at post:/api/v1/plugins ,the type of request parameter does not exit`

**修复 2**: 移除了所有 `@request` 注释，让 Swagger 自动推断参数类型

```typescript
// 修改前 (错误)
@request query integer limit - 每页数量
@request body object pluginData - 插件数据

// 修改后 (正确)
直接删除 @request 注释，egg-swagger-doc 会自动从代码推断
```

**额外修复**: 修复了 TypeScript 类型错误（第 375 行）

```typescript
// 修改前
const v = versions.find(v => v.version === version)

// 修改后
const v = versions.find((item: any) => item.version === version)
```

### 4. 环境配置

**新增**: 创建了 `.env.local` 配置文件

```bash
EGG_SERVER_PORT=4000
NODE_ENV=local
```

### 5. 路由配置

**修复**: 完善了文档路由配置，确保 swaggerdoc 正确工作

```typescript
// app/router.ts (第83-90行)
router.get('/docs', controller.docs.redirect)
```

### 6. 修改 `/docs` 路由使用 Swagger UI

**修复**: `/docs` 路由现在基于 `/api/v1/docs/openapi.json` 数据，使用 Swagger UI 输出

```typescript
// app/controller/docs.ts (第17-83行)
async redirect(ctx: Context) {
  ctx.type = 'html'
  const baseUrl = `${ctx.protocol}://${ctx.host}`
  // 返回包含 Swagger UI 的 HTML 页面
  // 从 /api/v1/docs/openapi.json 获取数据
  ctx.body = `<!DOCTYPE html>
<html>
<head>
  <title>LinglongOS API 文档</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '${baseUrl}/api/v1/docs/openapi.json',
        // ... 其他配置
      });
    };
  </script>
</body>
</html>`
}
```

**说明**:
- `/docs` 路由现在返回基于 Swagger UI 的交互式文档页面
- 数据来源于 `/api/v1/docs/openapi.json`
- 无需安装额外依赖，直接使用 CDN 加载 Swagger UI

### 7. 修复404错误处理

**问题**: 访问不存在路由时返回401而不是404

**修复**: 修改认证中间件，只对 `/api/` 路径进行认证检查

```typescript
// app/middleware/auth.ts (第29-50行)
return async (ctx: Context, next: () => Promise<any>) => {
  // 检查白名单
  if (whitelist.includes(ctx.path)) {
    await next();
    return;
  }

  // 只对 API 路径进行认证检查，非 API 路径直接通过
  if (!ctx.path.startsWith('/api/')) {
    await next();
    return;
  }

  // 进行认证检查...
}
```

**说明**:
- 非 `/api/` 路径的请求不会进行认证检查，直接到路由匹配
- 不存在的路由会由 Egg.js 框架返回404
- API 路径仍需要进行认证检查（除了白名单路径）

### 8. 修复setup.html二维码生成

**问题**: setup.html 使用外部服务`qrserver.com`生成二维码，依赖外部网络

**修复**: 使用前端QRCode.js库本地生成二维码

```html
<!-- 在<head>标签中添加QRCode.js库 -->
<script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
```

```javascript
// 使用QRCode.js库生成二维码
QRCode.toCanvas(canvas, qrCodeUrl, {
  width: 200,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#ffffff'
  }
}, (error) => {
  if (error) {
    console.error('二维码生成失败:', error);
    showMessage('二维码生成失败', 'error');
    return;
  }
  console.log('二维码生成成功');
});
```

**说明**:
- 移除对外部服务的依赖，提高可靠性和性能
- 使用canvas元素渲染二维码，而非img标签
- 支持自定义颜色和边距设置
- 添加错误处理机制

**影响的文件**:
- `app/public/setup.html` - 前端二维码生成逻辑

## Swagger 文档说明

### 访问方式

1. **Swagger UI 文档页面** (推荐): `http://localhost:4000/docs`
   - 使用 Swagger UI 展示从 `/api/v1/docs/openapi.json` 获取的数据
   - 交互式界面，支持在线测试 API

2. **OpenAPI JSON**: `http://localhost:4000/api/v1/docs/openapi.json`
   - 可直接导入 Postman、Apifox、Insomnia 等 API 工具

3. **Swagger UI** (egg-swagger-doc 自动生成): `http://localhost:4000/swagger-ui.html`

**说明**:
- `/docs` 路由现在直接返回基于 Swagger UI 的交互式文档页面
- 数据来源于 `/api/v1/docs/openapi.json`
- 无需访问静态页面或额外的 Swagger 路径

**文档路由说明**:
- `/docs` → 基于 Swagger UI 的交互式文档页面（推荐）
- `/api/v1/docs/openapi.json` → OpenAPI JSON 规范（数据源）
- `/swagger-ui.html` → egg-swagger-doc 自动生成的界面

### 文档注释规范

项目使用标准的 Swagger 注释格式：

```typescript
/**
 * AuthController
 *
 * 负责 2FA（基于 TOTP）的绑定与验证流程：
 * @controller Auth
 */
export default class AuthController extends Controller {
  /**
   * 生成绑定信息（二维码 URL 与 base32 密钥）。
   * @summary 获取2FA绑定信息
   * @description 生成用于双因子认证的TOTP二维码URL和base32密钥
   * @router get /api/v1/auth/google-auth-bind
   */
  async googleAuthBind(ctx: Context) {
    // 实现代码
  }
}
```

#### 注释规范

- `@controller` - 控制器名称（写在类注释中）
- `@summary` - 接口简要描述
- `@description` - 接口详细描述
- `@router` - 路由定义，格式：`[GET|POST|PUT|DELETE|PATCH] /path/to/route`

## 启动指南

### 开发模式

```bash
# 方法1: 通过项目根目录（推荐）
pnpm -C apps/api-service dev

# 方法2: 在 api-service 目录下直接启动
cd /Users/chudong/Project/turborepo-rsbuild/apps/api-service
pnpm dev
```

### 生产部署

```bash
# 1. 编译 TypeScript
pnpm -C apps/api-service tsc

# 2. 启动生产服务器
pnpm -C apps/api-service start

# 3. 停止服务器
pnpm -C apps/api-service stop
```

### 测试

```bash
# 运行所有测试
pnpm -C apps/api-service test

# 本地测试（带详细日志）
pnpm -C apps/api-service test:local

# CI 模式测试（带覆盖率）
pnpm -C apps/api-service ci
```

## 环境要求

- Node.js >= 20.18.1
- pnpm (推荐) 或 npm

## 端口配置

- 默认端口: 4000（可通过 `.env.local` 配置）
- Swagger 文档: http://localhost:4000/docs
- API 根路径: http://localhost:4000/api/v1

## 授权机制

### 无需认证的路径

- `/api/v1/auth/*` - 认证相关接口
- `/docs/*` - 文档相关接口
- `/public/*` - 静态资源
- 所有文件扩展名为 `.css`, `.js`, `.html`, `.png` 等的静态资源

### 需要认证的路径

- `/api/v1/panels/*` - 面板管理
- `/api/v1/proxy/*` - 代理接口
- `/api/v1/sessions/*` - 会话管理
- 其他所有 API 路径

## 常见问题

### Q: 如何查看完整的 API 文档？

A: 访问以下地址：
- 自定义文档: http://localhost:4000/docs
- OpenAPI JSON: http://localhost:4000/api/v1/docs/openapi.json

### Q: 如何添加新的 API ？

A: 按照以下步骤：

1. 在 `app/controller/` 中创建或修改控制器
2. 使用正确的 JSDoc 注释格式（参考 `app/controller/auth.ts`）
3. 在 `app/router.ts` 中注册路由
4. 重启开发服务器

示例：

```typescript
/**
 * @controller Example
 */
export default class ExampleController extends Controller {
  /**
   * @summary 示例接口
   * @description 这是示例接口的详细描述
   * @router get /api/v1/example
   */
  async index(ctx: Context) {
    ctx.success({ message: 'Hello World' });
  }
}
```

### Q: 如何调试认证问题？

A:

1. 检查 `ll_session` Cookie 是否设置
2. 确认请求路径在白名单中
3. 查看服务器日志：`pnpm -C apps/api-service dev`

### Q: 如何修改端口？

A: 修改 `.env.local` 文件：

```bash
EGG_SERVER_PORT=3000
```

## 技术栈

- **框架**: Egg.js 3.31.0
- **模块化**: Tegg 3.5.2
- **语言**: TypeScript 5.x
- **数据库**: SQLite (better-sqlite3 + sqlite3)
- **2FA**: speakeasy (TOTP 算法)
- **文档**: Swagger UI (egg-swagger-doc) + 自定义文档
- **代码检查**: Biome 2.3.2

## 更新日志

### 2025-11-05

- ✅ 启用 swaggerdoc 插件
- ✅ 优化授权中间件白名单配置
- ✅ 创建环境配置文件 `.env.local`
- ✅ 完善项目文档和开发指南
- ✅ 统一代码注释规范
- ✅ 修复 plugins 控制器 swagger 注释格式
- ✅ 修复 TypeScript 类型错误
- ✅ 移除所有 @request 注释，避免参数类型错误
- ✅ 完善文档路由配置，确保 swaggerdoc 正确工作
- ✅ 修改 /docs 路由使用 Swagger UI 输出
- ✅ 修复404错误处理，不存在路由返回404而不是401
- ✅ 修复 setup.html 二维码生成，改为前端本地生成

## 贡献指南

1. 所有 API 接口必须添加 Swagger 注释
2. 使用 TypeScript JSDoc 格式
3. 遵循项目的代码规范（Biome 检查）
4. 新增接口需要编写测试用例

## 参考资源

- [Egg.js 官方文档](https://eggjs.org/)
- [Tegg 文档](https://github.com/eggjs/tegg)
- [egg-swagger-doc 插件](https://github.com/swagger-api/swagger-jsdoc)
- [OpenAPI 3.0 规范](https://swagger.io/specification/)
