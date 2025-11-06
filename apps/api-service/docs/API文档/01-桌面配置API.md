# 桌面 API 文档

## 概述

桌面 API 提供了对 Web OS 桌面配置的完整管理能力，包括插件管理、布局配置、任务栏设置等。所有 API 都需要用户认证后才能访问。

## 基础信息

- **基础路径**: `/api/v1/desktop`
- **认证方式**: Bearer Token（通过 Authorization header 传递）
- **请求格式**: JSON
- **响应格式**: JSON

## API 列表

### 1. 获取完整桌面配置

获取系统的完整桌面配置信息。

**接口地址**: `GET /api/v1/desktop/get_config`

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "version": "1.0.0",
    "metadata": {
      "name": "Plugin-Based Web Desktop",
      "created": "2025-11-05",
      "pluginApiVersion": "1.0.0"
    },
    "desktop": {
      "grid": {
        "columns": 12,
        "rows": 8,
        "cellWidth": 80,
        "cellHeight": 80,
        "padding": 16
      },
      "plugins": [
        {
          "id": "icon.trash",
          "type": "icon",
          "name": "回收站",
          "icon": "🗑️",
          "position": {
            "x": 1,
            "y": 1,
            "width": 1,
            "height": 1
          },
          "config": {
            "draggable": true,
            "doubleClickAction": "open"
          }
        }
      ]
    },
    "taskbar": {
      "position": "bottom",
      "height": 60,
      "autoHide": false,
      "quickLaunch": [...]
    }
  }
}
```

### 2. 获取已注册插件列表

获取系统中所有已注册的插件（基础设施插件）。

**接口地址**: `GET /api/v1/desktop/get_registered_plugins`

### 3. 获取桌面插件列表

获取桌面上当前显示的所有插件（图标、组件、快捷方式等）。

**接口地址**: `GET /api/v1/desktop/get_desktop_plugins`

### 4. 获取插件详情

根据插件 ID 获取单个插件的详细信息。

**接口地址**: `GET /api/v1/desktop/get_plugin`

**查询参数**:
- `id` (string, required): 插件 ID

**请求示例**:
```
GET /api/v1/desktop/get_plugin?id=icon.trash
```

### 5. 获取任务栏配置

获取任务栏的配置信息。

**接口地址**: `GET /api/v1/desktop/get_taskbar_config`

### 6. 获取右键菜单配置

获取右键菜单的配置信息。

**接口地址**: `GET /api/v1/desktop/get_context_menus`

### 7. 获取插件类型定义

获取系统中定义的插件类型及其配置模式。

**接口地址**: `GET /api/v1/desktop/get_plugin_types`

### 8. 获取插件商店列表

获取系统中已注册的插件商店列表。

**接口地址**: `GET /api/v1/desktop/get_plugin_stores`

### 9. 更新插件位置

更新桌面上插件的位置坐标（拖拽操作后调用）。

**接口地址**: `POST /api/v1/desktop/update_plugin_position`

**请求参数**:
```json
{
  "id": "icon.trash",
  "x": 2,
  "y": 3
}
```

### 10. 添加插件到桌面

在桌面上添加一个新的插件。

**接口地址**: `POST /api/v1/desktop/add_plugin`

**请求参数**:
```json
{
  "plugin": {
    "id": "shortcut.custom-app",
    "type": "shortcut",
    "name": "自定义应用",
    "icon": "🚀",
    "position": {
      "x": 5,
      "y": 5,
      "width": 1,
      "height": 1
    },
    "config": {
      "url": "/my-app",
      "windowMode": "app"
    }
  }
}
```

### 11. 从桌面移除插件

从桌面上移除指定的插件。

**接口地址**: `POST /api/v1/desktop/remove_plugin`

**请求参数**:
```json
{
  "id": "icon.trash"
}
```

### 12. 更新插件配置

更新指定插件的配置信息。

**接口地址**: `POST /api/v1/desktop/update_plugin_config`

**请求参数**:
```json
{
  "id": "widget.clock",
  "configUpdates": {
    "format": "YYYY-MM-DD HH:mm",
    "theme": "analog"
  }
}
```

## 插件类型说明

系统支持以下类型的插件：

### icon（桌面图标）
- 用于显示在桌面上的图标
- 支持双击打开、拖拽移动
- 配置字段：`draggable`, `doubleClickAction`

### widget（小组件）
- 桌面上的功能性组件（时钟、天气、便签等）
- 可调整大小和位置
- 配置字段：`resizable`, `updateInterval`

### shortcut（应用快捷方式）
- 快速启动应用的快捷方式
- 配置字段：`url`, `windowMode`

### infrastructure（基础设施插件）
- 系统核心插件（任务栏、菜单系统等）
- 通常不需要修改

### launcher（启动器）
- 应用启动器相关插件

### system-tray（系统托盘）
- 系统托盘图标插件

## 数据存储

桌面配置数据存储在以下文件中：
- **文件路径**: `data/desktop.json`
- **格式**: JSON
- **特点**: 纯文件存储，无需数据库

## 认证要求

所有桌面配置 API 都需要用户认证。需要在请求头中携带有效的 Bearer Token：

```
Authorization: Bearer <your_token>
```

如果未认证或 Token 过期，API 将返回 401 错误。

## 错误响应格式

所有错误响应都遵循统一格式：

```json
{
  "code": 400,
  "message": "错误描述",
  "error": "详细错误信息（可选）"
}
```

常见错误码：
- `400`: 请求参数错误
- `401`: 未认证或 Token 过期
- `404`: 资源不存在
- `500`: 服务器内部错误

## 使用示例

### 获取所有桌面插件
```bash
curl -X GET "http://localhost:4000/api/v1/desktop/get_desktop_plugins" \
  -H "Authorization: Bearer <your_token>"
```

### 拖拽更新插件位置
```bash
curl -X POST "http://localhost:4000/api/v1/desktop/update_plugin_position" \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "icon.trash",
    "x": 2,
    "y": 3
  }'
```

### 添加新快捷方式
```bash
curl -X POST "http://localhost:4000/api/v1/desktop/add_plugin" \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "plugin": {
      "id": "shortcut.browser",
      "type": "shortcut",
      "name": "浏览器",
      "icon": "🌐",
      "position": {
        "x": 3,
        "y": 1,
        "width": 1,
        "height": 1
      },
      "config": {
        "url": "https://example.com",
        "windowMode": "browser"
      }
    }
  }'
```

## 注意事项

1. **认证要求**: 所有 API 都需要有效的认证 Token
2. **参数验证**: 必需参数缺失时会返回 400 错误
3. **插件 ID 唯一性**: 添加新插件时，ID 必须唯一
4. **位置坐标**: 插件位置基于网格系统，使用 `x, y` 坐标
5. **文件权限**: 确保 API 服务有读写 `data/desktop.json` 文件的权限

## 扩展建议

- 可以添加插件搜索、分类过滤等功能
- 支持插件的批量操作（批量移动、删除等）
- 添加插件配置验证机制
- 实现插件的热更新功能
