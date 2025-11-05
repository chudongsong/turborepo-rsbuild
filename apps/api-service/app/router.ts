import type { Application } from "egg";

/**
 * API 路由定义 - 动词+宾语格式 + 子路由结构
 *
 * 说明：
 * - 采用"动词+宾语"（Verb+Object）的结构，使用 snake_case 命名，清晰表达接口意图
 * - 所有路由路径使用下划线分隔单词，提高可读性和可维护性
 * - 按功能模块组织路由，使用子路由结构（如 /proxy/file/xxx）
 * - 中间件绑定在 `config.default.ts` 中通过 `config.middleware` 管理
 *
 * API 路由规范：
 * - 认证会话管理
 *   - `GET /api/v1/get_bind_info` → 获取绑定信息（原 google-auth-bind）
 *   - `POST /api/v1/create_session` → 创建会话（原 google-auth-confirm/verify）
 *   - `POST /api/v1/verify_session` → 验证会话
 *   - `POST /api/v1/delete_session` → 删除会话（登出）
 * - 代理面板设置
 *   - `POST /api/v1/set_proxy_panel` → 设置代理面板配置（兼容性路由）
 *   - `POST /api/v1/proxy/panel/set_panel_config` → 设置代理面板配置（新路由）
 * - 代理请求处理
 *   - `POST /api/v1/proxy_request` → 处理代理请求（兼容性路由）
 *   - `GET /api/v1/proxy/file/get_file_list` → 获取文件列表
 *
 * 路由命名规范：
 * - 基础结构：/api/v1/{controller}/{sub_controller}/{action}
 * - 控制器命名：使用复数形式，如 proxy, auth, file
 * - 子控制器命名：按功能分组，如 file, panel
 * - 动作命名：get_xxx, create_xxx, set_xxx, update_xxx, delete_xxx
 *
 * 兼容性路由（保持向后兼容）：
 * - `GET /ui` → `controller.ui.index`
 * - `GET /api/v1/docs/openapi.json` → 文档导出
 *
 * @param {Application} app - Egg 应用实例
 * @returns {void}
 */
export default (app: Application) => {
  const { controller, router } = app;

  // 动词+宾语格式路由 - 符合API开发规范，添加控制器名称前缀

  // 认证会话管理 (Sessions Controller)
  router.get("/api/v1/sessions/get_bind_info", controller.sessions.new); // 获取绑定信息
  router.post("/api/v1/sessions/create_session", controller.sessions.create); // 创建会话(确认绑定)
  router.post("/api/v1/sessions/verify_session", controller.sessions.create); // 验证会话
  router.post("/api/v1/sessions/delete_session", controller.sessions.destroy); // 删除会话(登出)
  router.all("/api/v1/sessions/get_sessions", controller.sessions.index); // 获取会话列表
  router.get("/api/v1/sessions/show_session/:id", controller.sessions.show); // 获取单个会话
  router.post("/api/v1/sessions/update_session", controller.sessions.update); // 更新会话 (改为POST)

  // 代理面板设置 (Panels Controller - 重新定位为代理面板设置)
  router.post("/api/v1/panels/set_proxy_panel", controller.panels.create); // 设置代理面板配置（保持兼容性）

  // 代理请求处理 (Proxy Controller) - 使用下划线和子路由规范
  // 通用代理请求
  router.all("/api/v1/proxy/request", controller.proxy.request); // 处理代理请求(通用)

  // 代理面板配置 - 子路由：panel
  router.post("/api/v1/proxy/panel/set_panel_config", controller.panels.create); // 设置代理面板配置

  // 代理文件管理 - 子路由：file
  router.get("/api/v1/proxy/file/get_file_list", controller.proxy.getFileList); // 获取文件列表

  // 向后兼容的 v1 API 路由 (保持原有路径以确保兼容性)
  router.all("/api/v1/init/status", controller.init.checkStatus);
  router.all("/api/v1/auth/google-auth-bind", controller.auth.googleAuthBind);
  router.post(
    "/api/v1/auth/google-auth-confirm",
    controller.auth.googleAuthConfirm
  );
  router.post(
    "/api/v1/auth/google-auth-verify",
    controller.auth.googleAuthVerify
  );

  // 新增验证接口
  router.post("/api/v1/auth/password-verify", controller.auth.passwordVerify);
  router.post("/api/v1/auth/auto-verify", controller.auth.autoVerify);
  router.post("/api/v1/auth/set-auth-method", controller.auth.setAuthMethod);

  // 新增带控制器前缀的路由 (推荐使用)
  // 初始化控制器 (Init Controller)
  router.all("/api/v1/init/check_status", controller.init.checkStatus);

  // 认证控制器 (Auth Controller)
  router.all("/api/v1/auth/google_auth_bind", controller.auth.googleAuthBind); // 获取绑定信息
  router.post(
    "/api/v1/auth/google_auth_confirm",
    controller.auth.googleAuthConfirm
  ); // 创建会话(确认绑定)
  router.post(
    "/api/v1/auth/google_auth_verify",
    controller.auth.googleAuthVerify
  ); // 验证会话

  // 文档控制器 (Docs Controller)
  router.get("/api/v1/docs/openapi_json", controller.docs.openapi);

  // 插件注册中心 (Plugins Controller) - 遵循动词+宾语规范，仅使用GET和POST
  router.get("/api/v1/get_plugins", controller.plugins.index); // 获取插件列表
  router.get("/api/v1/get_plugin_detail", controller.plugins.show); // 获取插件详情（通过query参数传递id）
  router.get("/api/v1/get_plugin_by_name", controller.plugins.showByName); // 根据名称获取插件（通过query参数传递name）
  router.post("/api/v1/create_plugin", controller.plugins.create); // 创建插件
  router.post("/api/v1/update_plugin", controller.plugins.update); // 更新插件（通过body传递id和更新数据）
  router.post("/api/v1/delete_plugin", controller.plugins.destroy); // 删除插件（通过body传递id）
  router.get("/api/v1/get_plugin_versions", controller.plugins.listVersions); // 获取插件版本列表（通过query传递pluginId）
  router.post(
    "/api/v1/create_plugin_version",
    controller.plugins.createVersion
  ); // 创建插件版本
  router.post("/api/v1/mark_plugin_latest", controller.plugins.markLatest); // 标记版本为最新
  router.get(
    "/api/v1/get_plugin_categories",
    controller.plugins.listCategories
  ); // 获取插件分类列表
  router.post("/api/v1/increment_download_count", controller.plugins.download); // 递增下载计数

  // 其他路由
  router.get("/", controller.home.index); // 根路径首页，根据初始化状态重定向
  router.get("/ui", controller.ui.index);

  // 文档路由映射 - 将 /docs 重定向到 swagger-ui
  // egg-swagger-doc 默认在 /swagger-doc 路径下提供 swagger-ui
  // 这里我们将 /docs 重定向到 /swagger-ui.html 或自定义文档页面
  router.get("/docs", controller.docs.redirect);

  // 直接暴露 swagger-ui 路由 (egg-swagger-doc 自动生成)
  // 访问 /swagger-ui.html 查看 Swagger UI 界面
};
