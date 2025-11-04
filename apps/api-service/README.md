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

**功能**: 基于 TOTP 的双因素认证

**主要接口**:
- `GET /api/v1/auth/google-auth-bind` - 生成 2FA 绑定信息
- `POST /api/v1/auth/google-auth-confirm` - 确认绑定并创建会话
- `POST /api/v1/auth/google-auth-verify` - 验证令牌

**流程**:
1. 生成二维码和密钥（不保存）
2. 用户使用 Authenticator 验证
3. 确认绑定，保存密钥到数据库
4. 创建签名 Cookie 会话

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

**功能**: 统一代理多个面板系统

**支持面板**:
- **BT 面板**: 自动处理签名认证（request_time + request_token）
- **1Panel 面板**: 通用 HTTP 代理

**主要接口**:
- `POST /api/v1/proxy/bind-panel-key` - 绑定面板配置
- `ALL /api/v1/proxy/request` - 代理请求

**代理流程**:
1. 配置面板类型、URL、密钥
2. 接收代理请求
3. 根据面板类型添加认证参数
4. 转发到目标面板
5. 透传响应状态码

### 4. 存储服务 (Storage)

**功能**: 封装 SQLite 数据库操作

**数据表**:
- `sessions`: 会话存储
- `auth`: 2FA 密钥存储
- `panels`: 面板配置存储

**核心方法**:
- `createSession()` - 创建会话
- `isValidSession()` - 验证会话
- `setTwoFASecret()` - 设置 2FA 密钥
- `getPanel()` - 获取面板配置
- `upsert()` - 插入或更新

## 🔌 中间件体系

按执行顺序排列：

1. **requestId** - 生成请求唯一 ID
2. **errorHandler** - 全局错误捕获
3. **common** - 通用处理
4. **staticAuth** - 静态页面会话验证
5. **staticFiles** - 静态资源服务
6. **auth** - 认证中间件（白名单机制）
7. **bt** - BT 面板特殊处理

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

创建 `.env.local` 文件：

```bash
EGG_SERVER_PORT=4000
NODE_ENV=local
```

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

### Swagger UI

- **文档地址**: http://localhost:4000/docs
- **OpenAPI JSON**: http://localhost:4000/api/v1/docs/openapi.json
- 可直接导入 Postman、Apifox 等工具

### 典型调用流程

```bash
# 1. 获取 2FA 绑定信息
curl http://localhost:4000/api/v1/auth/google-auth-bind

# 2. 确认绑定（用户输入 6 位 TOTP）
curl -X POST http://localhost:4000/api/v1/auth/google-auth-confirm \
  -H 'Content-Type: application/json' \
  -d '{"secret": "SECRET_FROM_STEP_1", "token": "123456"}'

# 3. 绑定面板
curl -X POST http://localhost:4000/api/v1/proxy/bind-panel-key \
  -H 'Content-Type: application/json' \
  -d '{"type": "bt", "url": "https://bt.example.com", "key": "YOUR_KEY"}'

# 4. 发起代理请求
curl -X POST http://localhost:4000/api/v1/proxy/request \
  -H 'Content-Type: application/json' \
  -d '{"panelType": "bt", "url": "/api/panel", "method": "GET"}'
```

## 🔒 安全机制

1. **2FA 认证**: TOTP 算法，30 秒时间窗口
2. **会话管理**: httpOnly + signed Cookie
3. **认证中间件**: 白名单机制
4. **CSRF 防护**: 已禁用（API 场景）
5. **CORS 配置**: 允许跨域（可配置域名白名单）

## 🧪 测试覆盖

- ✅ 2FA 认证与会话创建
- ✅ 面板绑定与代理请求
- ✅ 状态码透传
- ✅ 静态文件服务
- ✅ 认证中间件
- ✅ 错误处理

**测试状态**: 19/19 通过

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
- 修正了测试中的 2FA 认证流程，使用正确的 `google-auth-confirm` 端点
- 解决了静态文件中间件与 home 控制器的路由冲突问题
- 优化了静态资源匹配规则，提高了路由解析效率
- 修复了 TypeScript 编译错误，包括类型定义、方法签名等问题

详细的修复报告请参考 [OPTIMIZATION_REPORT.md](./OPTIMIZATION_REPORT.md)

CI 已配置于 `.github/workflows/api-tests.yml`，在推送或 PR 时自动运行。

## 📝 总结

LinglongOS API Service 是一个功能完善的企业级 Node.js 应用，具有以下特点：

- ✅ **模块化架构**: 基于 Tegg 的微内核设计
- ✅ **安全认证**: 2FA + 会话管理
- ✅ **高效代理**: 支持多种面板类型
- ✅ **完整文档**: Swagger UI + JSDoc
- ✅ **测试覆盖**: 19/19 测试用例通过
- ✅ **代码规范**: 统一使用 Biome 检查

项目严格遵循 Egg.js 企业级开发规范，具有良好的可维护性和扩展性，是 LinglongOS 桌面环境的可靠后端服务支撑。
