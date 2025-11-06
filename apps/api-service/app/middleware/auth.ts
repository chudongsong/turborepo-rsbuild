import type { Context } from "egg";

/**
 * 认证中间件：校验签名会话 Cookie `ll_session` 是否有效。
 *
 * 用途：拦截受保护的接口请求，确保来自已认证用户；
 * 逻辑：
 *   1. 检查路径是否在白名单中（文档、API 规范、初始化接口等）
 *   2. 检查系统是否已初始化（账号验证 + 面板绑定）
 *   3. 未初始化：允许访问（用于初始设置流程）
 *   4. 已初始化：要求所有 API 路径认证
 *
 * 注意：根路径 `/` 由 HomeController 处理，会自动重定向到 setup.html 或 index.html
 *
 * @returns {(ctx: Context, next: () => Promise<any>) => Promise<void>} - 返回 Egg 中间件函数；会话无效时写入 401 响应
 */
export default function authMiddleware() {
  // 不需要认证的路径白名单
  const whitelist = [
    "/api/v1/init/status", // 初始化状态检查
    "/api/v1/init/check_status", // 初始化状态检查（新路由）
    "/api/v1/auth/google-auth-bind", // 2FA 绑定（生成二维码）
    "/api/v1/auth/google-auth-confirm", // 2FA 确认绑定
    "/api/v1/auth/google-auth-verify", // 2FA 验证（首次绑定或登录）
    "/api/v1/auth/password-verify", // 密码验证
    "/api/v1/auth/auto-verify", // 自动验证
    "/api/v1/auth/set-auth-method", // 设置验证方式
    "/api/v1/sessions/create_session", // 创建会话
    "/api/v1/sessions/verify_session", // 验证会话
    "/docs", // Swagger UI 文档页面（带尾斜杠）
    "/docs/", // Swagger UI 文档页面（带尾斜杠）
    "/api/v1/docs/openapi.json", // OpenAPI JSON 文档
    "/api/v1/docs/openapi_json", // OpenAPI JSON 文档（新路由）
    "/swagger-doc", // Swagger JSON 文档（旧路径）
    "/swagger-ui.html", // Swagger UI 页面
    "/swagger-ui-bundle.js", // Swagger UI 资源文件
    "/swagger-ui-standalone-preset.js", // Swagger UI 资源文件
    "/swagger-ui.css", // Swagger UI 样式文件
    "/public/docs.html", // 自定义文档页面
    "/public/setup.html", // 初始化设置页面
    "/public/test-static.html", // 测试页面
  ];

  return async (ctx: Context, next: () => Promise<any>) => {
    // 检查是否在白名单中（包括静态页面和 API 文档）
    if (whitelist.includes(ctx.path)) {
      await next();
      return;
    }

    // 首先检查系统是否已初始化
    const authMethod = ctx.service.storage.getAuthMethod();
    const hasPanel = !!(
      ctx.service.storage.getPanel('bt')?.url &&
      ctx.service.storage.getPanel('bt')?.key
    );
    const isInitialized = authMethod && hasPanel;

    // 如果系统未初始化，允许访问除白名单外的所有路径（用于初始化流程）
    if (!isInitialized) {
      await next();
      return;
    }

    // 系统已初始化：检查认证状态
    // 只对 API 路径进行认证检查
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
