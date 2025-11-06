# 访问控制流程文档

## 概述

本文档详细描述了 API 服务的访问控制逻辑，确保系统在初始化前后的访问行为符合安全要求。

## 初始化状态判断

系统初始化的判定条件：
- ✅ **已设置验证方式**：通过 `storage.getAuthMethod()` 获取到 `password` 或 `totp`
- ✅ **已绑定面板**：通过 `storage.getPanel('bt')` 获取到有效的面板 URL 和 API 密钥

只有当**两个条件都满足**时，系统才被视为已初始化。

## 访问流程图

```
┌─────────────────────────┐
│   访问任意路径           │
│  (如 /, /ui, /api/*)    │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│   是否在白名单？         │
│  - /api/v1/init/status  │
│  - /public/setup.html   │
│  - /docs/*              │
│  - Swagger 文档         │
└──────────┬──────────────┘
           │ 是
           ▼
        直接通过
           │
           ▼
    [处理请求]
           │
           ▼
      响应结果

           │
           │ 否
           ▼
┌─────────────────────────┐
│   系统是否已初始化？     │
│   authMethod &&         │
│   hasPanel              │
└──────────┬──────────────┘
           │
    ┌──────┴──────┐
    │             │
   否             │ 是
    │             │
    ▼             ▼
┌─────────┐   ┌──────────────────┐
│ 允许访问 │   │ 检查认证状态     │
│         │   │                  │
└─────────┘   └────────┬─────────┘
                      │
                      ▼
              ┌─────────────────┐
              │   是否为         │
              │   /api/* 路径？  │
              └───────┬─────────┘
                      │
                ┌─────┴─────┐
                │           │
               是           │ 否
                │           │
                ▼           ▼
        ┌─────────────┐  直接通过
        │ 验证会话    │
        │ ll_session  │
        │ Cookie      │
        └──────┬──────┘
               │
          ┌────┴────┐
          │         │
        有效        │ 无效
          │         │
          ▼         ▼
      直接通过   ┌──────────┐
                │ 401      │
                │ 未认证   │
                └──────────┘
```

## 根路径 `/` 特殊处理

### 流程说明

访问根路径 `/` 时，**不会经过认证中间件**，而是由 `HomeController` 直接处理：

```typescript
// app/module/bar/controller/home.ts
export default class HomeController extends Controller {
  async index(ctx: Context) {
    this.logger.info('访问根路径 /，检查初始化状态');

    try {
      // 检查系统初始化状态
      const storage = ctx.service.storage;
      const authMethod = storage.getAuthMethod();
      const panelConfig = storage.getPanel('bt');
      const hasPanel = !!(panelConfig?.url && panelConfig?.key);
      const isInitialized = authMethod && hasPanel;

      if (isInitialized) {
        // 已初始化 → 重定向到 index.html
        ctx.redirect('/public/index.html');
      } else {
        // 未初始化 → 重定向到 setup.html
        ctx.redirect('/public/setup.html');
      }
    } catch (error) {
      this.logger.error('检查初始化状态失败:', error);
      ctx.redirect('/public/setup.html');
    }
  }
}
```

**注意**：`HomeController` 使用 **Classic Controller 模式**（继承 `Controller` 基类），与项目中其他控制器保持一致。在 `router.ts` 中注册路由：`router.get("/", controller.home.index)`。

### 重定向规则

| 系统状态 | 访问 `/` 行为 | 重定向目标 |
|----------|---------------|------------|
| **未初始化** | 自动重定向 | `/public/setup.html` |
| **已初始化** | 自动重定向 | `/public/index.html` |

## 白名单路径

以下路径**始终无需认证**，即使系统已初始化：

### API 路径
- `/api/v1/init/status` - 初始化状态检查
- `/api/v1/auth/google-auth-bind` - 2FA 绑定（生成二维码）
- `/api/v1/auth/google-auth-confirm` - 2FA 确认绑定
- `/api/v1/auth/google-auth-verify` - 2FA 验证
- `/api/v1/auth/set-auth-method` - 设置验证方式
- `/api/v1/docs/openapi.json` - OpenAPI JSON 文档

### 静态页面
- `/public/setup.html` - 初始化设置页面
- `/public/test-static.html` - 测试页面
- `/public/docs.html` - 自定义文档页面

### Swagger 文档
- `/docs`, `/docs/` - Swagger UI 页面
- `/swagger-doc` - Swagger JSON 文档（旧路径）
- `/swagger-ui.html` - Swagger UI 页面
- `/swagger-ui-*.js` - Swagger UI 资源文件
- `/swagger-ui.css` - Swagger UI 样式文件

## 认证流程

### 1. 初始化阶段（`!isInitialized`）

- **允许访问**：所有非白名单路径都可访问
- **用途**：允许用户完成系统初始化设置
- **限制**：白名单路径仍然有效（避免混淆）

### 2. 运行阶段（`isInitialized`）

- **API 路径**：需要有效的 `ll_session` Cookie
- **静态页面**：按文件类型区分对待
  - 白名单页面（如 `/public/setup.html`）仍然可访问
  - 其他静态资源（CSS/JS/图片等）正常访问
  - HTML 页面由 `staticAuthMiddleware` 处理（重定向到登录页）

## 认证中间件逻辑

```typescript
// app/middleware/auth.ts
export default function authMiddleware() {
  const whitelist = [/* 白名单路径 */];

  return async (ctx: Context, next: () => Promise<any>) => {
    // 1. 白名单检查
    if (whitelist.includes(ctx.path)) {
      await next();
      return;
    }

    // 2. 检查初始化状态
    const isInitialized = authMethod && hasPanel;

    // 3. 未初始化：允许访问
    if (!isInitialized) {
      await next();
      return;
    }

    // 4. 已初始化：检查 API 路径认证
    if (ctx.path.startsWith("/api/")) {
      const sid = ctx.cookies.get("ll_session", { signed: true });
      const ok = sid ? ctx.service.storage.isValidSession(sid) : false;
      if (!ok) {
        ctx.unauthorized("AUTH_REQUIRED");
        return;
      }
    }

    await next();
  };
}
```

## 测试用例

### 1. 未初始化状态

```bash
# 访问根路径 → 重定向到 setup.html
curl -i http://localhost:4000/
# HTTP/1.1 302 Found
# Location: /public/setup.html

# 访问初始化状态 API → 正常返回
curl http://localhost:4000/api/v1/init/status
# 返回系统状态（未初始化）

# 访问其他 API → 允许（未初始化）
curl http://localhost:4000/api/v1/proxy/request
# 返回实际响应（未认证）
```

### 2. 已初始化状态

```bash
# 1. 设置验证方式（假设设置密码）
curl -X POST http://localhost:4000/api/v1/auth/set-auth-method \
  -H "Content-Type: application/json" \
  -d '{"method":"password","username":"admin","password":"test123"}'

# 2. 绑定面板（假设已绑定）

# 3. 访问根路径 → 重定向到 index.html
curl -i http://localhost:4000/
# HTTP/1.1 302 Found
# Location: /public/index.html

# 4. 访问 API → 需要认证
curl http://localhost:4000/api/v1/proxy/request
# {"code":"AUTH_REQUIRED","message":"AUTH_REQUIRED"}

# 5. 认证后访问
curl -X POST http://localhost:4000/api/v1/auth/auto-verify \
  -H "Content-Type: application/json" \
  -d '{"input":"test123"}' \
  -c cookies.txt

curl http://localhost:4000/api/v1/proxy/request -b cookies.txt
# 返回实际响应（已认证）
```

## 维护注意事项

### 修改认证逻辑时需注意

1. **不要在认证中间件中硬编码根路径 `/` 的处理**
   - 根路径由 `HomeController` 专门处理
   - 认证中间件只需关注 API 路径的认证

2. **白名单路径的增删需谨慎**
   - 确保初始化相关接口在白名单中
   - 文档页面应始终可访问（便于用户查阅）

3. **初始化判定逻辑的修改需同步更新**
   - `HomeController` 中的判定逻辑
   - `authMiddleware` 中的判定逻辑
   - `staticAuthMiddleware` 中的判定逻辑（如有）

### 常见问题

**Q: 为什么根路径不直接返回 401，而是重定向？**

A: 根路径是系统入口，需要根据状态引导用户到正确页面：
- 未初始化时，提示用户进行设置
- 已初始化时，引导用户到主页

这样提供更好的用户体验，而不是冷冰冰的 401 错误。

**Q: 为什么不直接在认证中间件中处理重定向？**

A: 职责分离原则：
- `HomeController`：处理根路径的特殊业务逻辑（重定向）
- `authMiddleware`：处理通用认证逻辑（拦截未授权 API）

这样代码更清晰，易于维护。

**Q: 如何修改初始化的判定条件？**

A: 需要同时修改三个地方：
1. `HomeController.index()` - 根路径重定向逻辑
2. `authMiddleware()` - 认证拦截逻辑
3. `staticAuthMiddleware()` - 静态页面认证逻辑（如有）

确保所有地方使用相同的判定逻辑。

## 文件索引

| 文件 | 路径 | 作用 |
|------|------|------|
| HomeController | `app/module/bar/controller/home.ts` | 根路径重定向逻辑 |
| AuthMiddleware | `app/middleware/auth.ts` | 通用认证中间件 |
| StaticAuthMiddleware | `app/middleware/staticAuth.ts` | 静态页面认证 |
| Router | `app/router.ts` | 路由定义 |
| Config | `config/config.default.ts` | 中间件配置 |
| 控制器修复 | `TEGG_PARAM_FIX.md` | 控制器实现模式修复文档 |

## 更新日志

| 日期 | 修改内容 | 修改人 |
|------|----------|--------|
| 2025-11-05 | 创建访问控制流程文档，梳理根路径重定向逻辑 | System |
| 2025-11-05 | 更新为 Classic Controller 模式实现 | System |
