# LinglongOS API Service

统一面板代理与认证服务，基于 [Egg.js](https://eggjs.org) 与 [Tegg](https://github.com/eggjs/tegg) 构建的企业级 Node.js 应用。

## 📖 项目概述

LinglongOS API Service 是基于 **Egg.js** 与 **Tegg** 架构构建的统一面板代理与认证服务，为 LinglongOS 桌面环境提供安全的后端 API 支持。项目采用现代化的 Node.js 企业级开发模式，集成了 2FA 认证、会话管理、面板代理等核心功能。

## 🏗️ 项目架构

### 技术栈

- **框架**: Egg.js 3.31.0 (企业级 Node.js 框架)
- **模块化**: Tegg 3.5.2 (微内核架构)
- **语言**: TypeScript 5.x
- **数据库**: SQLite (better-sqlite3 + sqlite3)
- **2FA**: speakeasy (TOTP 算法)
- **HTTP 客户端**: Axios
- **API 文档**: Swagger UI (egg-swagger-doc)
- **代码检查**: Biome 2.3.2
- **Node 版本**: >= 20.18.1

### 架构设计

```
┌─────────────────────────────────────────┐
│              Controller Layer            │  ← HTTP 路由处理
├─────────────────────────────────────────┤
│               Service Layer              │  ← 业务逻辑层
├─────────────────────────────────────────┤
│             Middleware Layer             │  ← 中间件层
├─────────────────────────────────────────┤
│            Database Layer                │  ← 数据访问层
└─────────────────────────────────────────┘
```

**核心设计特点**:
- **多层架构**: Controller → Service → Storage → Database
- **模块化设计**: 使用 Tegg 进行模块化管理
- **中间件体系**: 认证、错误处理、静态文件、代理等
- **SQLite 存储**: 轻量级数据库，支持 WAL 模式
- **安全认证**: TOTP 2FA + 签名 Cookie 会话

## 📁 项目目录结构

```
/apps/api-service/
├── app/                          # 应用核心代码
│   ├── controller/               # 控制器层
│   │   ├── auth.ts               # 2FA 认证控制器
│   │   ├── proxy.ts              # 代理请求控制器
│   │   ├── sessions.ts           # 会话管理控制器
│   │   ├── panels.ts             # 面板配置控制器
│   │   ├── ui.ts                 # UI 页面控制器
│   │   ├── docs.ts               # 文档控制器
│   │   └── init.ts               # 初始化控制器
│   ├── service/                  # 服务层
│   │   ├── auth.ts               # 认证服务
│   │   ├── proxy.ts              # 代理服务
│   │   └── storage.ts            # 存储服务
│   ├── middleware/               # 中间件
│   │   ├── auth.ts               # 认证中间件
│   │   ├── errorHandler.ts       # 错误处理
│   │   ├── staticFiles.ts        # 静态文件
│   │   ├── staticAuth.ts         # 静态认证
│   │   ├── bt.ts                 # BT 面板处理
│   │   ├── common.ts             # 通用中间件
│   │   └── requestId.ts          # 请求 ID
│   ├── module/                   # Tegg 模块
│   │   ├── foo/                  # 示例模块
│   │   └── bar/                  # 示例模块
│   ├── lib/                      # 核心库
│   │   └── database.ts           # 数据库管理
│   ├── extend/                   # 扩展
│   │   └── context.ts            # Context 扩展
│   ├── constants/                # 常量
│   │   └── errorCodes.ts         # 错误码
│   ├── contract/                 # 合约
│   │   └── response.ts           # 响应接口
│   ├── public/                   # 静态资源
│   ├── router.ts                 # 路由定义
│   └── view/                     # 视图模板
├── config/                       # 配置文件
│   ├── config.default.ts         # 默认配置
│   ├── config.local.ts           # 本地环境
│   ├── config.unittest.ts        # 测试环境
│   ├── config.prod.ts            # 生产环境
│   └── plugin.ts                 # 插件配置
├── data/                         # 数据目录
│   └── api.db                    # SQLite 数据库
├── docs/                         # 文档目录
├── test/                         # 测试文件
├── scripts/                      # 脚本工具
│   ├── export-openapi.js         # 导出 OpenAPI 文档
│   ├── run-migration.js          # 数据库迁移
│   └── test-storage.js           # 存储测试
├── typings/                      # 类型定义
├── package.json                  # 依赖配置
├── tsconfig.json                 # TypeScript 配置
└── README.md                     # 项目说明
```

## 🔄 核心功能模块

### 1. 认证模块 (Auth)

**功能**: 支持多种认证方式（2FA + 密码认证）

**主要接口**:

#### 2FA 认证（TOTP）
- `GET /api/v1/auth/google-auth-bind` - 生成 2FA 绑定信息
- `POST /api/v1/auth/google-auth-confirm` - 确认绑定并创建会话
- `POST /api/v1/auth/google-auth-verify` - 验证令牌

#### 密码认证
- `POST /api/v1/auth/password-verify` - 验证密码并创建会话
- `POST /api/v1/auth/auto-verify` - 自动验证（密码或2FA）

#### 统一认证管理
- `POST /api/v1/auth/set-auth-method` - 设置验证方式和用户名
- `GET /api/v1/init/check_status` - 获取用户名（包含在状态信息中）

**特性**:
- ✅ **双重认证方式**: 支持密码或2FA，灵活选择
- ✅ **用户名支持**: 可自定义用户名（默认: admin）
- ✅ **安全存储**: 用户名和认证信息分别存储在SQLite中
- ✅ **TOTP算法**: 基于时间的一次性密码（30秒窗口）
- ✅ **会话管理**: 4小时有效期，httpOnly + 签名 Cookie

### 2. 会话管理 (Sessions)

**功能**: 基于 Cookie 的会话管理

**主要接口**:
- `POST /api/v1/sessions/create_session` - 创建会话
- `POST /api/v1/sessions/verify_session` - 验证会话
- `POST /api/v1/sessions/delete_session` - 删除会话（登出）
- `GET /api/v1/sessions/show_session/:id` - 查看会话

**特性**:
- 4 小时有效期
- httpOnly + signed Cookie
- 自动过期检查
- 持久化存储

### 3. 面板代理 (Proxy)

**功能**: 统一代理多个面板系统，支持文件管理和配置管理

**支持面板**:
- **BT 面板**: 自动处理签名认证（request_time + request_token）
- **1Panel 面板**: 通用 HTTP 代理

**主要接口**:
- `POST /api/v1/proxy/request` - 通用代理请求
- `GET /api/v1/proxy/file/get_file_list` - 获取文件列表
- `POST /api/v1/proxy/panel/set_panel_config` - 设置面板配置（新路由）
- `POST /api/v1/panels/set_proxy_panel` - 设置面板配置（兼容路由）

**路由结构**:
```
/api/v1/proxy/
├── request                    # 通用代理请求
├── file/
│   └── get_file_list         # 文件管理 - 获取文件列表
└── panel/
    └── set_panel_config      # 面板配置 - 设置面板配置
```

**代理流程**:
1. 配置面板类型、URL、密钥
2. 接收代理请求
3. 根据面板类型添加认证参数（BT面板自动添加request_time和request_token）
4. 转发到目标面板
5. 透传响应状态码

### 4. 存储服务 (Storage)

**功能**: 封装 SQLite 数据库操作

**数据表**:
- `sessions`: 会话存储
- `auth`: 用户认证信息存储（用户名、认证方式、密码/2FA密钥）
- `panels`: 面板配置存储

**核心方法**:
- `createSession()` - 创建会话
- `isValidSession()` - 验证会话
- `setTwoFASecret()` - 设置 2FA 密钥
- `setAuthMethod()` - 设置认证方式和用户名
- `getUsername()` - 获取用户名
- `getPanel()` - 获取面板配置
- `upsert()` - 插入或更新

### 5. 插件注册中心 (Plugins)

**功能**: 完整的插件管理系统，支持插件的创建、版本管理、分类和下载统计

**主要接口**:
- `GET /api/v1/get_plugins` - 获取插件列表
- `GET /api/v1/get_plugin_detail` - 获取插件详情
- `GET /api/v1/get_plugin_by_name` - 根据名称获取插件
- `POST /api/v1/create_plugin` - 创建插件
- `POST /api/v1/update_plugin` - 更新插件
- `POST /api/v1/delete_plugin` - 删除插件
- `GET /api/v1/get_plugin_versions` - 获取插件版本列表
- `POST /api/v1/create_plugin_version` - 创建插件版本
- `POST /api/v1/mark_plugin_latest` - 标记版本为最新
- `GET /api/v1/get_plugin_categories` - 获取插件分类列表
- `POST /api/v1/increment_download_count` - 递增下载计数

**特性**:
- ✅ 插件的完整生命周期管理
- ✅ 版本控制和最新版本标记
- ✅ 分类管理和下载统计
- ✅ RESTful API 设计

## 🔌 中间件体系

按执行顺序排列：

1. **requestId** - 生成请求唯一 ID
2. **errorHandler** - 全局错误捕获
3. **common** - 通用处理
4. **staticAuth** - 静态页面会话验证
5. **staticFiles** - 静态资源服务
6. **auth** - 认证中间件（白名单机制）
7. **bt** - BT 面板特殊处理

## 🛤️ 路由规范

### 命名约定

项目采用**下划线命名规范**（snake_case）和**子路由结构**，遵循"动词+宾语"（Verb+Object）的API设计模式：

**基础结构**：
```
/api/v1/{controller}/{sub_controller}/{action}
```

**命名规则**：
- ✅ 使用下划线分隔单词：`get_file_list`、`set_panel_config`
- ✅ 控制器使用复数形式：`proxy`, `auth`, `plugins`
- ✅ 子控制器按功能分组：`file`、`panel`
- ✅ 动作命名统一：`get_xxx`、`create_xxx`、`set_xxx`、`update_xxx`、`delete_xxx`

**路由分组示例**：
```
/api/v1/proxy/
├── request                    # 通用代理请求
├── file/
│   └── get_file_list         # 获取文件列表
└── panel/
    └── set_panel_config      # 设置面板配置

/api/v1/auth/
├── google_auth_bind          # 2FA绑定
├── google_auth_confirm       # 2FA确认
└── google_auth_verify        # 2FA验证

/api/v1/get_plugins           # 获取插件列表（GET请求）
/api/v1/create_plugin         # 创建插件（POST请求）
```

### 向后兼容性

项目保留旧路由以确保向后兼容，同时推荐使用新的命名规范：

| 功能 | 旧路由 | 新路由（推荐） | 状态 |
|------|--------|----------------|------|
| 设置面板配置 | `POST /api/v1/panels/set_proxy_panel` | `POST /api/v1/proxy/panel/set_panel_config` | 双路由可用 |
| 获取文件列表 | - | `GET /api/v1/proxy/file/get_file_list` | 新增 |

详细的路由规范请参考 [API_ROUTING_CONVENTIONS.md](./API_ROUTING_CONVENTIONS.md)

## 🚀 快速开始

### 环境要求

- Node.js >= 20.18.1
- pnpm (推荐) 或 npm

### 安装依赖

```bash
# 在项目根目录
pnpm install
```

### 开发模式

```bash
# 启动开发服务器
pnpm --filter @linglongos/api run dev

# 服务地址：http://localhost:4000
# API 文档：http://localhost:4000/docs
```

### 生产部署

```bash
# 编译 TypeScript
pnpm --filter @linglongos/api run tsc

# 启动生产服务器
pnpm --filter @linglongos/api run start

# 停止服务
pnpm --filter @linglongos/api run stop
```

### 环境配置

创建 `.env.local` 文件（已创建）：

```bash
EGG_SERVER_PORT=4000
NODE_ENV=local
```

> **注意**: 端口 4000 是默认配置，可根据需要修改。如果修改端口，请同时更新文档中的 URL。

### 测试

```bash
# 运行所有测试
pnpm --filter @linglongos/api run test

# 本地测试（带详细日志）
pnpm --filter @linglongos/api run test:local

# CI 模式测试（带覆盖率）
pnpm --filter @linglongos/api run ci
```

### 代码质量

```bash
# 检查代码风格
pnpm --filter @linglongos/api run lint

# 自动修复代码风格
pnpm --filter @linglongos/api run lint:fix

# 清理编译产物
pnpm --filter @linglongos/api run clean
```

## 🧪 开发指南

### 项目结构规范

1. **Controller** - 处理 HTTP 请求，调用 Service
2. **Service** - 实现业务逻辑
3. **Middleware** - 处理横切关注点
4. **Storage** - 封装数据访问

### 代码规范

- 使用 **TS JSDoc** 注释风格
- 类名使用 PascalCase
- 方法名使用 camelCase
- 路由使用 snake_case
- 统一错误处理

### 添加新 API

1. **在 `app/controller/` 中创建控制器**
2. **在 `app/service/` 中实现业务逻辑**
3. **在 `app/router.ts` 中注册路由**
4. **添加 Swagger 注释**
5. **编写测试用例**

### 示例：添加新控制器

```typescript
// app/controller/example.ts
import { Controller } from 'egg';

export default class ExampleController extends Controller {
  async index(ctx: Context) {
    const data = await ctx.service.example.getData();
    ctx.success(data);
  }
}
```

### 数据库操作

```typescript
// 使用 Storage Service
const result = await ctx.service.storage.getPanel('bt');

// 或直接使用 DatabaseManager
const db = this.ctx.service.storage.getDatabase();
const user = db.get('SELECT * FROM users WHERE id = ?', 1);
```

## 📚 API 文档

### 文档访问方式

**Swagger UI 文档页面** (推荐)
- **文档地址**: http://localhost:4000/docs
- **说明**: 基于 Swagger UI 的交互式文档页面，数据来源于 `/api/v1/docs/openapi.json`
- **特性**: 支持在线测试 API、自动加载 OpenAPI 规范、美观的界面

**OpenAPI 规范**
- **OpenAPI JSON**: http://localhost:4000/api/v1/docs/openapi.json
- 可直接导入 Postman、Apifox、Insomnia 等 API 工具

**Swagger UI** (egg-swagger-doc 自动生成)
- **Swagger UI 地址**: http://localhost:4000/swagger-ui.html

**说明**:
- `/docs` 路由现在直接返回基于 Swagger UI 的交互式文档页面
- 数据来源于 `/api/v1/docs/openapi.json`
- 无需访问静态页面或额外的 Swagger 路径
- egg-swagger-doc 会自动解析所有控制器的 `@controller`、`@summary`、`@router` 等注释

**文档路由说明**:
- `/docs` → 基于 Swagger UI 的交互式文档页面（推荐）
- `/api/v1/docs/openapi.json` → OpenAPI JSON 规范（数据源）
- `/swagger-ui.html` → egg-swagger-doc 自动生成的界面

### 文档注释规范

所有 API 接口使用标准的 Swagger 注释格式：

```typescript
/**
 * @controller 控制器名称
 */
export default class ExampleController extends Controller {
  /**
   * @summary 接口简要描述
   * @description 接口详细描述，包括功能说明
   * @router GET /api/v1/example/path
   */
  async exampleMethod(ctx: Context) {
    ctx.success(data);
  }
}
```

**注释说明**:
- `@controller` - 定义控制器名称（必填）
- `@summary` - 接口简要描述（必填）
- `@description` - 接口详细说明（可选）
- `@router` - 路由定义，格式：`[方法] 路径`（必填）
- 支持的方法：`GET`、`POST`、`PUT`、`DELETE`、`PATCH`

详细的文档编写指南请参考 [API_FIXES.md](./API_FIXES.md)

### 授权与访问控制

项目采用基于 Cookie 的会话认证机制，支持 2FA 双因素认证。

#### 🔓 无需认证的路径

以下路径无需认证即可访问：

- **认证接口**: `/api/v1/auth/*`
  - `GET /api/v1/auth/google-auth-bind` - 获取 2FA 绑定信息
  - `POST /api/v1/auth/google-auth-verify` - 验证 2FA 令牌

- **文档相关**: `/docs/*`, `/api/v1/docs/*`, `/public/*`
  - 文档页面和静态资源

- **初始化接口**: `/api/v1/init/status` - 初始化状态检查

- **静态资源**: 所有带以下扩展名的文件
  - `.css`, `.js`, `.html`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.ico`
  - `.webp`, `.woff`, `.woff2`, `.ttf`, `.eot`
  - `.pdf`, `.zip`, `.tar`, `.gz`, `.json`, `.xml`, `.txt`, `.md`

#### 🔒 需要认证的路径

除上述路径外，所有 API 接口均需要有效的会话认证：

- **面板管理**: `/api/v1/panels/*`
- **代理接口**: `/api/v1/proxy/*`
- **会话管理**: `/api/v1/sessions/*`
- **其他业务接口**

#### 会话 Cookie

- **Cookie 名称**: `ll_session`
- **属性**: `httpOnly`, `signed`, `maxAge: 4h`
- **获取方式**: 通过 2FA 认证成功后自动设置

#### 典型调用流程

**密码认证方式**：

```bash
# 1. 设置认证方式和用户名（初始化时）
curl -X POST http://localhost:4000/api/v1/auth/set-auth-method \
  -H 'Content-Type: application/json' \
  -d '{"method": "password", "username": "admin", "password": "your_password"}'

# 2. 验证密码并创建会话
curl -X POST http://localhost:4000/api/v1/auth/password-verify \
  -H 'Content-Type: application/json' \
  -d '{"password": "your_password"}' \
  -c cookies.txt

# 3. 使用会话访问受保护接口
curl http://localhost:4000/api/v1/proxy/file/get_file_list?panelType=bt&path=/www -b cookies.txt
```

**2FA认证方式**：

```bash
# 1. 获取 2FA 绑定信息
curl http://localhost:4000/api/v1/auth/google-auth-bind

# 2. 确认绑定（用户输入 6 位 TOTP）
curl -X POST http://localhost:4000/api/v1/auth/google-auth-confirm \
  -H 'Content-Type: application/json' \
  -d '{"secret": "SECRET_FROM_STEP_1", "token": "123456"}' \
  -c cookies.txt

# 3. 设置面板配置（使用新路由）
curl -X POST http://localhost:4000/api/v1/proxy/panel/set_panel_config \
  -H 'Content-Type: application/json' \
  -d '{"type": "bt", "url": "https://bt.example.com", "key": "YOUR_KEY"}' \
  -b cookies.txt

# 4. 发起代理请求
curl -X POST http://localhost:4000/api/v1/proxy/request \
  -H 'Content-Type: application/json' \
  -d '{"panelType": "bt", "url": "/api/panel", "method": "GET"}' \
  -b cookies.txt
```

## 🔒 安全机制

1. **双重认证方式**
   - **2FA 认证**: TOTP 算法，30 秒时间窗口
   - **密码认证**: SHA256 哈希存储
   - **用户名支持**: 可自定义用户名（默认: admin）

2. **会话管理**
   - httpOnly + signed Cookie
   - 4 小时有效期
   - 自动过期检查

3. **认证中间件**: 白名单机制
   - 文档相关路径无需认证
   - 初始化接口允许访问
   - 已初始化后所有 API 需要认证

4. **数据库安全**
   - SQLite with WAL mode
   - 参数化查询防注入
   - 敏感信息加密存储

5. **CSRF 防护**: 已禁用（API 场景）
6. **CORS 配置**: 允许跨域（可配置域名白名单）

## 🧪 测试覆盖

- ✅ 2FA 认证与会话创建
- ✅ 密码认证与会话管理
- ✅ 面板绑定与代理请求
- ✅ 文件列表获取
- ✅ 状态码透传
- ✅ 静态文件服务
- ✅ 认证中间件与权限控制
- ✅ 错误处理
- ✅ 插件注册中心 API

**测试状态**: 19/19 通过

详细的测试报告请参考：
- `test/auth.test.ts` - 认证测试
- `test/proxy.test.ts` - 代理测试
- `test/middleware.test.ts` - 中间件测试
- `test/storage.test.ts` - 存储测试

## 📊 性能优化

1. **数据库优化**
   - 启用 WAL 模式
   - 添加索引
   - 连接池管理

2. **静态资源**
   - Gzip 压缩
   - ETag 缓存
   - 1 天缓存策略

3. **代理转发**
   - axios 连接复用
   - 错误透传
   - 状态码保留

## 🐛 调试指南

### 查看日志

```bash
# 开发模式查看实时日志
pnpm --filter @linglongos/api run dev

# 或使用 PM2
pm2 logs api-service
```

### 数据库检查

```bash
# 启动 SQLite 命令行
sqlite3 ./data/api.db

# 查看表结构
.schema

# 查看数据
SELECT * FROM sessions;
```

### 常见问题

1. **端口被占用**
   - 检查 `EGG_SERVER_PORT` 配置
   - 确认 4000 端口可用

2. **数据库权限**
   - 确保 `data/` 目录可写
   - 检查 SQLite 版本兼容性

3. **2FA 验证失败**
   - 确保设备时间同步
   - 检查密钥是否正确保存

## 📦 部署建议

### 生产环境配置

```bash
# 1. 设置环境变量
export NODE_ENV=production
export EGG_SERVER_PORT=4000

# 2. 使用 PM2 管理进程
pm2 start dist/boot/master.js --name api-service
pm2 save
pm2 startup

# 3. 配置 Nginx 反向代理
location /api/ {
  proxy_pass http://localhost:4000/api/;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
}
```

### 监控建议

- 监控 `data/api.db` 文件大小
- 定期清理过期会话
- 监控代理请求延迟
- 设置日志轮转

## 📝 注释规范（TS JSDoc）

为提升可维护性，代码注释统一采用 TS JSDoc 风格，要求如下：

- 范围：模块、类、函数/方法、关键逻辑与配置返回对象。
- 必备信息：功能描述、参数说明（含类型与含义）、返回值类型与含义、可能的异常或边界情况。
- 统一格式：

```ts
/**
 * 功能简述（1-2 行）。
 * 可选：关键逻辑或流程要点。
 *
 * @param {Type} paramName - 参数含义与取值要求
 * @param {Type} [optionalParam] - 可选参数说明
 * @returns {ReturnType} - 返回值含义与结构说明
 * @throws {ErrorType} - 可能抛出的异常（如有）
 */
```

注意：在 TypeScript 中，JSDoc 的类型不会影响编译类型，但用于文档与 IDE 智能提示；同时保持函数签名上的显式 TS 类型。

## 📖 业务流程详解

### 2FA 绑定与会话创建

- **生成绑定信息**：`GET /api/v1/auth/google-auth-bind`
  - 返回：`secret`（base32）与 `qrCodeUrl`（`otpauth://...`）
  - 行为：生成临时 `secret`，不持久化

- **确认绑定并创建会话**：`POST /api/v1/auth/google-auth-confirm`
  - 请求体：`{ secret, token }`（secret 来自 bind 接口，token 为 6 位一次性口令）
  - 成功：持久化 `secret` 到 `auth` 表，设置 `ll_session` Cookie（有效期 4h，`httpOnly`，签名）
  - 失败：`401 { code: 401, message: 'Invalid token or session expired.' }`

- **验证已绑定的 2FA**：`POST /api/v1/auth/google-auth-verify`
  - 请求体：`{ token }`（6 位一次性口令）
  - 前提：已通过 confirm 接口绑定过 2FA
  - 成功：设置 `ll_session` Cookie
  - 失败：`401 { code: 401, message: 'Invalid token or session expired.' }`

### 面板绑定与代理

- **绑定面板**：`POST /api/v1/proxy/bind-panel-key`
  - 请求体：`{ type, url, key }`
  - 成功：`{ code: 200, message: 'Panel key bound successfully.' }`

- **代理调用**：`ALL /api/v1/proxy/request`
  - 参数：`panelType`、`url`、`method`、`params`
  - bt 特殊：自动追加 `request_time` 与 `request_token=md5(key+request_time)`
  - 未配置面板：`400 { code: 400, message: 'Panel not configured.' }`

### 典型调用序列

1. 获取 2FA 绑定信息 → `GET /api/v1/auth/google-auth-bind`（获得 `secret`/二维码）
2. 生成 TOTP → 输入 6 位口令（本地或 App）
3. 确认绑定并创建会话 → `POST /api/v1/auth/google-auth-confirm`（传递 `secret` 和 `token`，获得 `ll_session`）
4. 绑定面板 → `POST /api/v1/proxy/bind-panel-key`
5. 发起代理请求 → `GET/POST /api/v1/proxy/request`
6. 访问受保护接口 → `GET /bar/user?userId=Alice`

**注意：** 后续登录可直接使用 `POST /api/v1/auth/google-auth-verify`（仅需 `token`），无需重复绑定流程。

## 📊 测试详情

### 测试覆盖

- 2FA 验证与会话 Cookie 设置
- bt 面板绑定与 GET/POST 代理、状态码透传、鉴权参数校验
- 1panel 基本 GET 代理
- 静态文件服务与路由中间件
- 认证中间件与权限控制

### 测试状态

✅ **所有测试已通过** (19/19)

最近修复的问题：
- ✅ 启用 swaggerdoc 插件，修复文档生成问题
- ✅ 优化授权中间件白名单配置，确保文档相关路径可访问
- ✅ 完善 API 文档注释规范，提供完整的开发指南
- ✅ 创建 `.env.local` 环境配置文件
- ✅ 更新项目文档，增加开发指南和常见问题解答
- ✅ 完善文档路由配置，明确 Swagger UI 访问路径
- ✅ 修改 /docs 路由使用 Swagger UI 输出，基于 OpenAPI 数据
- ✅ 修复404错误处理，不存在路由返回404而不是401

详细的修复报告和开发指南请参考：
- [API_FIXES.md](./API_FIXES.md) - 修复说明和开发指南
- [OPTIMIZATION_REPORT.md](./OPTIMIZATION_REPORT.md) - 之前的问题修复报告

CI 已配置于 `.github/workflows/api-tests.yml`，在推送或 PR 时自动运行。

## 📝 总结

LinglongOS API Service 是一个功能完善的企业级 Node.js 应用，具有以下特点：

### 核心特性

- ✅ **模块化架构**: 基于 Tegg 的微内核设计
- ✅ **双重认证**: 支持密码和2FA两种认证方式
- ✅ **用户名系统**: 支持自定义用户名（默认: admin）
- ✅ **高效代理**: 支持 BT 面板和 1Panel，自动处理认证
- ✅ **文件管理**: 统一的文件列表获取功能
- ✅ **插件中心**: 完整的插件注册和管理系统
- ✅ **统一路由**: 遵循下划线命名规范的 RESTful API
- ✅ **向后兼容**: 保留兼容路由，支持平滑迁移

### 技术亮点

- ✅ **完整文档**: Swagger UI + JSDoc，自动生成 API 文档
- ✅ **测试覆盖**: 19/19 测试用例通过，全面覆盖核心功能
- ✅ **代码规范**: 统一使用 Biome 检查，保证代码质量
- ✅ **安全机制**: httpOnly Cookie、SHA256 密码哈希、TOTP 算法
- ✅ **性能优化**: SQLite WAL 模式、连接池管理、缓存策略

### 文档支持

- ✅ **README.md** - 项目概述和快速开始
- ✅ **API_FIXES.md** - 详细的修复说明和开发指南
- ✅ **FINAL_FIX_REPORT.md** - 最终修复报告
- ✅ **USER_AUTH_OPTIMIZATION_SUMMARY.md** - 用户认证系统优化报告
- ✅ **ROUTING_RESTRUCTURING_SUMMARY.md** - 路由重构报告
- ✅ **API_ROUTING_CONVENTIONS.md** - 路由规范文档

项目严格遵循 Egg.js 企业级开发规范，具有良好的可维护性和扩展性，是 LinglongOS 桌面环境的可靠后端服务支撑。
