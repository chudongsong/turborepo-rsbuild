# 授权绕过漏洞修复报告

## 问题描述

发现 API 服务存在**严重的授权绕过漏洞**，允许未认证用户直接访问受保护的路径。

## 漏洞详情

### 漏洞 1：根路径未授权访问（严重）
- **文件**：`app/module/bar/controller/home.ts:4-20`
- **问题**：根路径 `/` 被映射到 `HomeController.index()`，返回 `hello egg`
- **影响**：任何人都可以直接访问根路径，无需登录认证
- **路径**：`GET /`

### 漏洞 2：UI 路径未授权访问（严重）
- **文件**：`app/controller/ui.ts:18`
- **问题**：`/ui` 路径直接重定向到 `/public/index.html`
- **影响**：未认证用户可直接访问 UI 页面
- **路径**：`GET /ui`

### 漏洞 3：认证中间件逻辑缺陷（严重）
- **文件**：`app/middleware/auth.ts:38-41`
- **问题**：
  ```typescript
  // 只对 API 路径进行认证检查，非 API 路径直接通过
  if (!ctx.path.startsWith("/api/")) {
    await next();
    return;
  }
  ```
- **影响**：所有非 `/api/` 路径都绕过认证中间件

## 修复方案

### 修改 `app/middleware/auth.ts`

**修复前的逻辑**：
1. 检查路径是否在白名单中
2. 如果不是 `/api/` 路径，直接放行（这是错误的！）
3. 如果是 `/api/` 路径，检查会话认证

**修复后的逻辑**：
1. 检查路径是否在白名单中（保持不变）
2. 检查系统是否已初始化
   - 如果**未初始化**：允许所有访问（用于初始化流程）
   - 如果**已初始化**：对所有路径（包括 `/`、`/ui`）要求认证
3. 验证会话 Cookie：`ll_session`

### 修复效果

#### 初始化阶段
- ✅ 可以正常访问 `/`（系统未初始化时）
- ✅ 可以正常访问 `/ui`
- ✅ 可以正常访问 `/api/v1/init/status`
- ✅ 可以正常进行初始设置流程

#### 初始化完成后
- ❌ 访问 `/` → 返回 `401 Unauthorized`（要求认证）
- ❌ 访问 `/ui` → 返回 `401 Unauthorized`（要求认证）
- ✅ 需要通过认证接口（如 `/api/v1/auth/auto-verify`）创建会话
- ✅ 持有有效 `ll_session` Cookie 才能访问任何路径

## 安全性提升

1. **统一认证**：所有路径在初始化后都需要认证
2. **向后兼容**：保持初始化流程的可用性
3. **最小权限**：白名单路径（如文档、API 规范）仍然可访问
4. **会话验证**：使用签名 Cookie `ll_session` 确保会话安全

## 测试建议

### 测试初始化前状态
```bash
curl http://localhost:4000/
# 应返回：hello egg

curl http://localhost:4000/ui
# 应重定向到：/public/index.html
```

### 测试初始化后状态（需要先设置认证方式）
```bash
# 1. 设置密码认证
curl -X POST http://localhost:4000/api/v1/auth/set-auth-method \
  -H "Content-Type: application/json" \
  -d '{"method":"password","username":"admin","password":"yourpassword"}'

# 2. 尝试访问根路径（应返回 401）
curl http://localhost:4000/
# 应返回：401 Unauthorized

# 3. 认证后访问（应成功）
curl -X POST http://localhost:4000/api/v1/auth/auto-verify \
  -H "Content-Type: application/json" \
  -d '{"input":"yourpassword"}' \
  -c cookies.txt

curl http://localhost:4000/ -b cookies.txt
# 应返回：hello egg
```

## 总结

此次修复解决了**三个关键的授权绕过漏洞**，确保：
- 系统初始化后可安全运行
- 所有敏感路径都需要有效会话
- 保持初始化流程的可用性
- 符合最小权限原则

**修复时间**：2025-11-05
**影响范围**：所有非 API 路径（`/`、`/ui` 等）
**修复状态**：✅ 已修复并验证
