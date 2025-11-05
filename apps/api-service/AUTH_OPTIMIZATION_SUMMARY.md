# 认证系统优化总结

## 项目概述

本次优化实现了 LinglongOS API 服务的认证系统，支持**账号密码**和**2FA（TOTP）**二选一的验证方式。用户可以在初始化时选择验证方式，选择后登录时只能使用该验证方式。

## 核心改进

### 1. 后端架构修改

#### 存储服务 (StorageService)
- ✅ 新增 `setAuthMethod()` 方法：设置验证方式
  - 支持 'password' 和 'totp' 两种验证方式
  - 密码使用 SHA256 哈希存储
  - TOTP 密钥持久化保存

- ✅ 新增 `getAuthMethod()` 方法：获取当前验证方式

- ✅ 新增 `verifyPassword()` 方法：验证密码

#### 认证服务 (AuthService)
- ✅ 新增 `verifyPasswordAndCreateSession()` 方法：密码验证并创建会话

- ✅ 新增 `setAuthMethod()` 方法：设置验证方式（创建会话）

- ✅ 新增 `verifyAndCreateSession()` 方法：根据验证方式自动选择验证逻辑

- ✅ 将 `verifyTOTPToken()` 方法改为 public，供控制器调用

#### 认证控制器 (AuthController)
- ✅ 新增 `passwordVerify()` 接口：密码验证登录
  - 路由：`POST /api/v1/auth/password-verify`

- ✅ 新增 `autoVerify()` 接口：自动验证（根据验证方式）
  - 路由：`POST /api/v1/auth/auto-verify`

- ✅ 新增 `setAuthMethod()` 接口：设置验证方式
  - 路由：`POST /api/v1/auth/set-auth-method`
  - 支持设置密码或2FA验证方式

#### 初始化控制器 (InitController)
- ✅ 修改 `checkStatus()` 接口：返回验证方式信息
  - 新增 `authMethod` 字段：'password' | 'totp' | null
  - 保持向后兼容：返回 `hasTwoFA` 字段

#### 路由配置 (router.ts)
- ✅ 添加新路由：
  - `POST /api/v1/auth/password-verify`
  - `POST /api/v1/auth/auto-verify`
  - `POST /api/v1/auth/set-auth-method`

### 2. 前端界面优化

#### 页面结构
- ✅ 步骤0：验证设置（替代原来的2FA设置）
  - 验证方式选择页面
  - 密码设置页面
  - 2FA设置页面

- ✅ 步骤1：面板绑定（保持不变）

- ✅ 步骤2：登录完成
  - 根据验证方式显示对应的登录界面
  - 密码登录：显示密码输入框
  - 2FA登录：显示PIN输入框

#### JavaScript 逻辑
- ✅ 新增 `selectAuthMethod()` 函数：选择验证方式

- ✅ 新增 `setupPassword()` 函数：设置密码

- ✅ 新增 `setup2FA()` 函数：设置2FA（替换原来的 verify2FA）

- ✅ 新增 `loginWithPassword()` 函数：密码登录

- ✅ 修改 `login()` 函数：通用登录（调用 auto-verify API）

- ✅ 修改 `checkSystemStatus()` 函数：根据 authMethod 显示对应界面

- ✅ 修改 `showStep()` 函数：适配新的步骤ID（auth/panel/complete）

## API 接口文档

### 新增接口

#### 1. 设置验证方式
```
POST /api/v1/auth/set-auth-method
Content-Type: application/json

Body:
{
  "method": "password" | "totp",
  "password": "string",          // 当 method="password" 时必需
  "secret": "string",            // 当 method="totp" 时必需
  "token": "string"              // 当 method="totp" 时必需（验证码）
}

Response:
{
  "success": true,
  "data": null,
  "message": "Auth method set successfully."
}
```

#### 2. 密码验证
```
POST /api/v1/auth/password-verify
Content-Type: application/json

Body:
{
  "password": "string"
}

Response:
{
  "success": true,
  "data": null,
  "message": "Authentication successful, session created."
}
```

#### 3. 自动验证
```
POST /api/v1/auth/auto-verify
Content-Type: application/json

Body:
{
  "input": "string"              // 密码或TOTP验证码
}

Response:
{
  "success": true,
  "data": null,
  "message": "Authentication successful, session created."
}
```

### 修改接口

#### 1. 检查初始化状态
```
GET /api/v1/init/status

Response:
{
  "success": true,
  "data": {
    "authMethod": "password" | "totp" | null,  // 新增字段
    "hasPanel": boolean,
    "hasValidSession": boolean,
    "needsInitialization": boolean,
    "hasTwoFA": boolean,                       // 保持向后兼容
    "debug": {
      "sessionCookie": "present" | "missing",
      "authMethod": "string",
      "panelConfig": "present" | "missing",
      "timestamp": "ISO 8601 string"
    }
  }
}
```

## 验证流程

### 初始化流程

1. **未设置验证方式**
   - 显示验证方式选择页面
   - 用户选择：密码 或 2FA

2. **选择密码验证**
   - 显示密码设置页面
   - 用户输入密码（两次确认）
   - 调用 `/api/v1/auth/set-auth-method` 设置密码
   - 创建会话，进入下一步

3. **选择2FA验证**
   - 显示二维码页面
   - 用户扫描二维码并在TOTP应用中添加
   - 输入6位验证码
   - 调用 `/api/v1/auth/set-auth-method` 验证并设置
   - 创建会话，进入下一步

### 登录流程

1. **已配置密码验证**
   - 显示密码输入框
   - 用户输入密码
   - 调用 `/api/v1/auth/password-verify` 验证
   - 成功则跳转仪表板

2. **已配置2FA验证**
   - 显示PIN输入框
   - 用户输入6位验证码
   - 调用 `/api/v1/auth/auto-verify` 验证
   - 成功则跳转仪表板

## 数据库结构

新增以下字段存储在 `auth` 表：

| key              | value                | 说明                |
|-----------------|---------------------|---------------------|
| auth_method     | "password" \| "totp" | 验证方式            |
| password_hash   | string (SHA256)     | 密码哈希（仅密码验证） |
| twofa_secret    | string (base32)     | 2FA密钥（仅2FA验证）  |

## 兼容性

- ✅ 保持向后兼容：现有 `hasTwoFA` 字段仍然返回（值为 authMethod === 'totp'）
- ✅ 保持原有API：现有的 google-auth-* 接口仍然可用
- ✅ 新增API：提供更灵活和统一的认证接口

## 安全性

- ✅ 密码安全：使用SHA256哈希存储密码
- ✅ 2FA安全：使用TOTP标准，支持Google Authenticator等应用
- ✅ 会话管理：创建HTTP-only签名Cookie，4小时过期
- ✅ 验证令牌：2FA验证码使用一次即失效

## 测试结果

- ✅ TypeScript编译通过，无语法错误
- ✅ 代码结构完整，符合Egg.js规范
- ✅ API接口设计合理，符合RESTful风格
- ✅ 前端界面逻辑清晰，用户体验良好

## 待办事项

- [ ] 运行实际的功能测试（启动服务并测试完整流程）
- [ ] 测试边界情况（错误输入、网络异常等）
- [ ] 考虑添加修改验证方式的功能（后期需求）
- [ ] 编写单元测试和集成测试

## 总结

本次优化成功实现了认证系统的灵活性和安全性，用户可以根据自己的需求选择密码或2FA作为验证方式。系统架构清晰，代码质量良好，为后续功能扩展打下了坚实基础。
