# Web OS 桌面配置使用指南

## 概述

Web OS 桌面系统采用"万物即插件"的设计理念，整个桌面由插件组成，包括图标、小组件、快捷方式等。这种设计使得桌面具有极高的可扩展性和可定制性。

## 配置结构

桌面配置文件位于 `data/desktop.json`，包含以下核心部分：

### 1. 基础信息

```json
{
  "version": "1.0.0",
  "metadata": {
    "name": "Plugin-Based Web Desktop",
    "created": "2025-11-05",
    "pluginApiVersion": "1.0.0"
  }
}
```

- **version**: 配置文件版本号
- **metadata**: 元数据信息，包括桌面名称、创建时间和插件 API 版本

### 2. 桌面网格系统

```json
"desktop": {
  "grid": {
    "columns": 12,      // 桌面列数
    "rows": 8,          // 桌面行数
    "cellWidth": 80,    // 每个网格的宽度（像素）
    "cellHeight": 80,   // 每个网格的高度（像素）
    "padding": 16       // 边距
  }
}
```

桌面采用网格系统进行布局，所有插件的位置都通过网格坐标 (`x`, `y`) 来确定。

**网格坐标示例**：
- 左上角坐标为 `(1, 1)`
- 右下角坐标为 `(12, 8)`
- 可以指定插件占用的网格大小（`width`, `height`）

### 3. 插件系统

#### 3.1 已注册插件（基础设施插件）

```json
"registeredPlugins": [
  {
    "id": "core.desktop-icon",
    "name": "桌面图标系统",
    "type": "infrastructure",
    "version": "1.0.0",
    "enabled": true,
    "zIndex": 1
  },
  {
    "id": "core.taskbar",
    "name": "任务栏",
    "type": "infrastructure",
    "version": "1.0.0",
    "enabled": true,
    "zIndex": 100
  },
  {
    "id": "core.context-menu",
    "name": "右键菜单",
    "type": "infrastructure",
    "version": "1.0.0",
    "enabled": true,
    "zIndex": 99
  }
]
```

**基础设施插件类型**：
- `core.desktop-icon`: 负责桌面图标的显示和交互
- `core.taskbar`: 任务栏系统（位置、高度、托盘等）
- `core.context-menu`: 右键菜单系统

#### 3.2 桌面插件

桌面上的所有元素都是插件，包括：

**图标插件 (type: "icon")**：
```json
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
```

**小组件插件 (type: "widget")**：
```json
{
  "id": "widget.clock",
  "type": "widget",
  "name": "时钟",
  "position": {
    "x": 9,
    "y": 1,
    "width": 2,
    "height": 1
  },
  "config": {
    "format": "HH:mm:ss",
    "theme": "digital"
  }
}
```

**快捷方式插件 (type: "shortcut")**：
```json
{
  "id": "shortcut.chrome",
  "type": "shortcut",
  "name": "Chrome",
  "icon": "🌐",
  "position": {
    "x": 3,
    "y": 1,
    "width": 1,
    "height": 1
  },
  "config": {
    "url": "chrome://newtab/",
    "windowMode": "browser"
  }
}
```

### 4. 任务栏配置

```json
"taskbar": {
  "position": "bottom",    // 位置：bottom/top/left/right
  "height": 60,            // 高度（像素）
  "autoHide": false,       // 自动隐藏
  "plugins": [             // 任务栏上的插件
    {
      "id": "taskbar.launcher",
      "type": "launcher",
      "name": "应用启动器",
      "config": { "position": "left" }
    },
    {
      "id": "taskbar.window-list",
      "type": "window-list",
      "name": "窗口列表",
      "config": { "showThumbnails": true }
    },
    {
      "id": "taskbar.system-tray",
      "type": "system-tray",
      "name": "系统托盘",
      "config": { "position": "right" }
    }
  ],
  "quickLaunch": [         // 快速启动栏
    {
      "name": "文件",
      "icon": "📁",
      "url": "/files"
    },
    {
      "name": "浏览器",
      "icon": "🌐",
      "url": "/browser"
    }
  ]
}
```

### 5. 右键菜单配置

```json
"contextMenus": [
  {
    "pluginId": "desktop",
    "items": [
      {
        "id": "refresh",
        "type": "action",
        "name": "刷新桌面",
        "icon": "🔄"
      },
      {
        "id": "separator-1",
        "type": "separator"
      },
      {
        "id": "new-folder",
        "type": "action",
        "name": "新建文件夹",
        "icon": "📁"
      },
      {
        "id": "plugins",
        "type": "submenu",
        "name": "插件",
        "icon": "🔌",
        "items": [
          {
            "id": "plugin-manager",
            "type": "action",
            "name": "插件管理",
            "icon": "⚙️"
          }
        ]
      }
    ]
  }
]
```

**菜单项类型**：
- `action`: 普通操作项
- `separator`: 分隔线
- `submenu`: 子菜单

### 6. 插件类型定义

```json
"pluginTypes": {
  "icon": {
    "description": "桌面图标插件",
    "configSchema": {
      "draggable": "boolean",
      "doubleClickAction": "string"
    }
  },
  "widget": {
    "description": "桌面小组件插件",
    "configSchema": {
      "resizable": "boolean",
      "updateInterval": "number"
    }
  },
  "shortcut": {
    "description": "应用快捷方式插件",
    "configSchema": {
      "url": "string",
      "windowMode": "string"
    }
  }
}
```

### 7. 插件商店

```json
"registeredPluginStores": [
  {
    "id": "builtin",
    "name": "内置插件",
    "url": "/plugins/builtin"
  },
  {
    "id": "community",
    "name": "社区插件",
    "url": "/plugins/community"
  }
]
```

## API 使用说明

### 获取桌面配置

```bash
GET /api/v1/desktop/get_config
Authorization: Bearer <token>
```

返回完整的桌面配置信息。

### 获取桌面插件列表

```bash
GET /api/v1/desktop/get_desktop_plugins
Authorization: Bearer <token>
```

返回桌面上所有插件的列表。

### 拖拽更新插件位置

当用户在桌面拖拽插件时，调用此 API 更新位置：

```bash
POST /api/v1/desktop/update_plugin_position
Authorization: Bearer <token>
Content-Type: application/json

{
  "id": "icon.trash",
  "x": 2,
  "y": 3
}
```

### 添加新插件

```bash
POST /api/v1/desktop/add_plugin
Authorization: Bearer <token>
Content-Type: application/json

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

### 移除插件

```bash
POST /api/v1/desktop/remove_plugin
Authorization: Bearer <token>
Content-Type: application/json

{
  "id": "icon.trash"
}
```

### 更新插件配置

```bash
POST /api/v1/desktop/update_plugin_config
Authorization: Bearer <token>
Content-Type: application/json

{
  "id": "widget.clock",
  "configUpdates": {
    "format": "YYYY-MM-DD HH:mm:ss",
    "theme": "analog"
  }
}
```

## 实际应用场景

### 场景 1：用户自定义桌面布局

用户可以通过拖拽桌面图标来调整位置，然后调用 `update_plugin_position` API 保存位置。

### 场景 2：从应用商店安装插件

1. 用户在应用商店浏览插件
2. 选择插件后调用 `add_plugin` API 添加到桌面
3. 桌面自动加载并显示新插件

### 场景 3：动态加载小组件

小组件可以通过 `updateInterval` 配置自动刷新时间，实现实时数据显示（如时钟、天气等）。

### 场景 4：多主题支持

桌面配置支持主题切换，只需修改 `appearance` 相关配置即可实现不同的视觉效果。

## 插件开发指南

### 创建新插件

1. **定义插件 ID**：唯一标识符，格式为 `type.name`（如 `shortcut.chrome`）

2. **确定插件类型**：根据功能选择 `icon`、`widget`、`shortcut` 等

3. **设置位置**：通过 `position` 指定插件在桌面上的网格坐标

4. **配置参数**：在 `config` 中设置插件的特定参数

### 插件示例：天气小组件

```json
{
  "id": "widget.weather-beijing",
  "type": "widget",
  "name": "北京天气",
  "position": {
    "x": 9,
    "y": 2,
    "width": 2,
    "height": 2
  },
  "config": {
    "city": "Beijing",
    "showForecast": true,
    "updateInterval": 1800000,
    "theme": "modern"
  }
}
```

## 配置管理最佳实践

1. **定期备份**：`desktop.json` 包含所有桌面配置，建议定期备份

2. **版本控制**：修改配置前记录当前版本，便于回滚

3. **批量操作**：需要同时修改多个插件时，可以使用批量 API

4. **权限管理**：桌面配置 API 需要认证，确保只有授权用户可以修改

5. **配置验证**：添加插件前验证插件 ID 唯一性，避免冲突

## 扩展功能建议

- **插件市场**：在线插件商店，支持插件评分、评论
- **主题系统**：完整的桌面主题切换方案
- **动画效果**：插件进入/退出时的动画效果
- **手势支持**：触摸设备的滑动手势操作
- **云同步**：跨设备的桌面配置云同步
- **预设布局**：提供多种桌面布局模板
- **插件依赖**：支持插件之间的依赖关系管理

---

这套桌面配置系统为 Web OS 提供了强大的可定制性，通过插件化的架构，用户可以自由定制自己的桌面环境。
