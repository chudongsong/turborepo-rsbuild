# API 路由命名规范

## 概述

本文档描述了 LinglongOS API 服务中采用的路由命名规范和设计原则，确保 API 接口的一致性和可读性。

## 命名规范

### 1. 基础命名规则

**规则**: 所有 API 接口路径使用 **下划线** (`_`) 分隔单词，避免使用连字符 (`-`)

**原因**: 提高 URL 的可读性和可维护性，避免特殊字符转义问题

**示例**:
- ✅ 正确: `/api/v1/proxy/file/get_file_list`
- ❌ 错误: `/api/v1/proxy/file/get-file-list`

### 2. 路径结构规范

#### 2.1 顶级路径结构

```
/api/v1/{controller}/{sub_controller}/{action}
```

- **api**: 标识 API 路由
- **v1**: API 版本号（支持多版本共存）
- **{controller}**: 控制器名称
- **{sub_controller}**: 子控制器（可选，按功能分组）
- **{action}**: 具体的动作名称

#### 2.2 控制器命名

控制器名称使用**英文复数形式**，例如：

- `proxy` - 代理相关操作
- `auth` - 认证相关操作
- `file` - 文件操作
- `panel` - 面板配置操作
- `init` - 初始化操作

#### 2.3 子控制器命名

子控制器用于按功能进一步分组，使路由更加语义化：

```
/api/v1/proxy/file/xxx     → 文件管理相关
/api/v1/proxy/panel/xxx    → 面板配置相关
/api/v1/proxy/xxx          → 通用代理相关
```

### 3. 动作命名规范

#### 3.1 动作动词选择

| HTTP 方法 | 动作动词 | 说明 | 示例 |
|-----------|----------|------|------|
| `GET` | `get_xxx` | 获取数据 | `get_file_list`、`get_user_info` |
| `POST` | `create_xxx` / `set_xxx` | 创建数据 / 设置配置 | `create_file`、`set_panel_config` |
| `PUT` | `update_xxx` | 更新数据 | `update_user_profile` |
| `DELETE` | `delete_xxx` | 删除数据 | `delete_file`、`remove_user` |
| `PATCH` | `patch_xxx` | 部分更新 | `patch_file_content` |

#### 3.2 常用动作命名

| 动作名称 | 用途 | 示例路径 |
|----------|------|----------|
| `get_file_list` | 获取文件列表 | `/api/v1/proxy/file/get_file_list` |
| `set_panel_config` | 设置面板配置 | `/api/v1/proxy/panel/set_panel_config` |
| `get_file_detail` | 获取文件详情 | `/api/v1/proxy/file/get_file_detail` |
| `upload_file` | 上传文件 | `/api/v1/proxy/file/upload_file` |
| `delete_file` | 删除文件 | `/api/v1/proxy/file/delete_file` |
| `create_directory` | 创建目录 | `/api/v1/proxy/file/create_directory` |

### 4. 完整示例

#### 4.1 代理相关路由

```typescript
// 面板配置
POST /api/v1/proxy/panel/set_panel_config    // 设置面板配置

// 文件管理
GET  /api/v1/proxy/file/get_file_list        // 获取文件列表
GET  /api/v1/proxy/file/get_file_detail      // 获取文件详情
POST /api/v1/proxy/file/upload_file          // 上传文件
POST /api/v1/proxy/file/delete_file          // 删除文件
POST /api/v1/proxy/file/create_directory     // 创建目录

// 通用代理
POST /api/v1/proxy/request                   // 通用代理请求
```

#### 4.2 认证相关路由

```typescript
// 2FA 认证
GET  /api/v1/auth/google_auth_bind           // 获取 2FA 绑定信息
POST /api/v1/auth/google_auth_confirm        // 确认 2FA 绑定
POST /api/v1/auth/google_auth_verify         // 验证 2FA

// 密码认证
POST /api/v1/auth/password_verify            // 密码验证
POST /api/v1/auth/auto_verify                // 自动验证（根据配置选择密码或 2FA）
POST /api/v1/auth/set_auth_method            // 设置认证方式
```

#### 4.3 初始化相关路由

```typescript
// 状态检查
GET  /api/v1/init/status                     // 检查初始化状态
POST /api/v1/init/initialize                 // 执行初始化（如果需要）
```

### 5. 向后兼容性

为了保证向后兼容性，老版本的路由可以保留，但建议使用新的命名规范：

#### 5.1 兼容路由示例

```typescript
// 新路由（推荐使用）
GET /api/v1/proxy/file/get_file_list

// 兼容路由（保留）
GET /api/v1/proxy/files
```

#### 5.2 路由迁移策略

1. **保留期**: 旧路由保持可用至少 2 个版本
2. **标记**: 在文档中标记为 "已弃用" 状态
3. **迁移**: 提供迁移指南和示例代码
4. **移除**: 在主要版本升级时移除旧路由

### 6. 路由分组和中间件

#### 6.1 路由分组

根据功能模块对路由进行分组：

```typescript
// 认证路由组
router.group('/api/v1/auth', router => {
  router.get('google_auth_bind', controller.auth.googleAuthBind);
  router.post('google_auth_verify', controller.auth.googleAuthVerify);
  // ...
});

// 代理路由组
router.group('/api/v1/proxy', router => {
  router.group('file', fileRouter => {
    fileRouter.get('get_file_list', controller.proxy.getFileList);
    // ...
  });
  router.group('panel', panelRouter => {
    panelRouter.post('set_panel_config', controller.panels.create);
    // ...
  });
});
```

#### 6.2 中间件应用

根据路由类型应用不同的中间件：

```typescript
// 认证中间件（保护敏感操作）
router.post('/api/v1/proxy/file/upload_file', authMiddleware, controller.proxy.uploadFile);

// 限流中间件（防止滥用）
router.get('/api/v1/proxy/file/get_file_list', rateLimitMiddleware, controller.proxy.getFileList);

// 静态文件中间件（静态资源）
router.use('/api/v1/static', staticMiddleware);
```

### 7. 参数传递规范

#### 7.1 Query 参数

用于 GET 请求的过滤、分页等操作：

```typescript
// 符合RESTful规范
GET /api/v1/proxy/file/get_file_list?panelType=bt&path=/www&sort=size&reverse=true&p=1&show_row=20
```

**命名规则**: 使用下划线分隔，例如 `show_row`、`page_size`

#### 7.2 Body 参数

用于 POST、PUT、PATCH 请求的数据传递：

```typescript
// 使用 JSON 格式
POST /api/v1/proxy/panel/set_panel_config
Content-Type: application/json

{
  "type": "bt",
  "url": "https://192.168.168.120:8888",
  "api_key": "your_api_key_here"
}
```

**命名规则**: 使用下划线分隔，例如 `api_key`、`panel_type`

#### 7.3 Path 参数

用于资源标识：

```typescript
// 符合RESTful规范
GET /api/v1/files/show_file/:id
DELETE /api/v1/files/delete_file/:id
```

**命名规则**: 使用驼峰式，例如 `:fileId`、`:userId`

### 8. 响应格式规范

#### 8.1 成功响应

```typescript
// GET 请求成功
{
  code: 200,
  message: "success",
  data: {
    // 响应数据
  }
}

// POST 请求成功（创建资源）
{
  success: true,
  message: "Resource created successfully",
  data: {
    // 创建的资源
  }
}
```

#### 8.2 错误响应

```typescript
// 参数错误
{
  code: 400,
  message: "参数错误：缺少必填参数 'path'",
  data: null
}

// 认证错误
{
  code: 401,
  message: "AUTH_REQUIRED",
  data: null
}

// 资源不存在
{
  code: 404,
  message: "File not found",
  data: null
}

// 服务器内部错误
{
  code: 500,
  message: "Internal server error",
  data: null
}
```

### 9. 最佳实践

#### 9.1 路由设计原则

1. **一致性**: 遵循统一的命名规范
2. **可读性**: 路径应该能够直观表达其功能
3. **可维护性**: 按功能模块组织路由
4. **扩展性**: 考虑未来可能的功能扩展

#### 9.2 避免的操作

1. ❌ 避免使用动词和名词混用
2. ❌ 避免在路径中包含特殊字符
3. ❌ 避免过深的路径嵌套（超过 4 层）
4. ❌ 避免使用缩写（非标准情况）

#### 9.3 推荐的组合

1. ✅ 使用名词复数表示资源集合
2. ✅ 使用动词表示操作
3. ✅ 使用下划线分隔单词
4. ✅ 按功能模块分组路由

### 10. 参考资料

- [RESTful API 设计规范](https://restfulapi.net/)
- [HTTP 方法规范](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)
- [URL 命名最佳实践](https://www.w3.org/Provider/Style/URI.html)

---

**文档版本**: v1.0.0
**最后更新**: 2025-11-05
**维护者**: LinglongOS 开发团队
