# 玲珑OS API文档

## 1. 概述

本文档是玲珑OS后端服务的官方API参考。所有API都遵循RESTful设计原则，并使用统一的JSON格式进行数据交换。

- **基础URL**: `/api/v1`
- **认证**: 需要认证的API请求必须在HTTP头中包含`Authorization: Bearer <accessToken>`。
- **统一响应格式**:
  ```json
  {
    "code": 0, // 0为成功，非0为失败
    "message": "Success",
    "data": { ... } // 或 [ ... ] 或 null
  }
  ```

## 2. 鉴权模块 (`/auth`)

### 2.1 `POST /auth/login`

用户登录。

- **请求体**:
  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```
- **成功响应**:
  ```json
  {
    "code": 0,
    "message": "Login successful.",
    "data": {
      "token": "ey...",
      "expires_in": 7200
    }
  }
  ```

### 2.2 `POST /auth/refresh`

使用`refreshToken`刷新`accessToken`。

- **请求体**:
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **成功响应**:
  ```json
  {
    "code": 0,
    "message": "Token refreshed successfully.",
    "data": {
      "accessToken": "string"
    }
  }
  ```

## 3. 插件注册中心 (`/plugins`)

### 3.1 `GET /plugins`

获取所有已发布的插件列表。

- **成功响应**:
  ```json
  {
    "code": 0,
    "message": "Success",
    "data": [
      {
        "name": "file-explorer",
        "description": "A file explorer plugin.",
        "author": "LinglongOS Team",
        "latest_version": "1.0.0"
      }
    ]
  }
  ```

### 3.2 `GET /plugins/:name`

获取单个插件的详细信息。

- **成功响应**:
  ```json
  {
    "code": 0,
    "message": "Success",
    "data": {
      "name": "file-explorer",
      "versions": [
        {
          "version": "1.0.0",
          "manifest_url": "/api/v1/plugins/file-explorer/1.0.0/manifest.json"
        }
      ]
    }
  }
  ```

### 3.3 `POST /plugins`

(管理员权限) 发布一个新插件或新版本。

- **请求体**: `multipart/form-data`
  - `manifest` (file, required): `manifest.json`文件。
  - `package` (file, required): 插件代码包。
- **成功响应**:
  ```json
  {
    "code": 0,
    "message": "Plugin published successfully.",
    "data": null
  }
  ```

## 4. 文件服务 (`/files`)

### 4.1 `POST /files/upload`

上传文件。

- **请求体**: `multipart/form-data`
  - `file` (file, required): 要上传的文件。
  - `path` (string, optional): 上传路径。
- **成功响应**:
  ```json
  {
    "code": 0,
    "message": "File uploaded successfully.",
    "data": {
      "url": "/uploads/mydir/myfile.txt"
    }
  }
  ```

### 4.2 `GET /files/list`

列出指定路径下的文件和目录。

- **查询参数**:
  - `path` (string, required): 要列出的目录路径。
- **成功响应**:
  ```json
  {
    "code": 0,
    "message": "Success",
    "data": [
      { "name": "file1.txt", "type": "file", "size": 1024 },
      { "name": "subdir", "type": "directory", "size": null }
    ]
  }
  ```

---

## 5. 文档元数据

- **文档类型**: API参考文档
- **关键词**: API, RESTful, JSON, 鉴权, 插件, 文件服务, Endpoint
- **目标读者**: 前端开发者, 后端开发者, 插件开发者
- **核心内容**: 本文档是玲珑OS后端服务的权威API参考，详细列出了所有公开的API Endpoint、请求格式、响应格式和数据示例。
- **AI解析优化**:
  - 提供了统一的基础URL和认证说明。
  - 对每个API都使用了清晰的HTTP方法和路径（如`POST /auth/login`）。
  - 为每个请求和响应都提供了完整的JSON代码示例，便于AI解析和生成请求代码。
  - 结构化地组织了不同模块（鉴权、插件、文件）的API。