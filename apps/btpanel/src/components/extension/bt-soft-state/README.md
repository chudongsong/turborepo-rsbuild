# 软件状态管理组件

## 功能说明
软件服务状态管理组件，支持启动/停止/重启等操作

## 使用场景
- 服务状态管理面板
- 插件/服务操作控制台
- 需要快速状态切换的场景

## 组件参数 (Props)
| 参数名     | 类型               | 默认值  | 必填 | 说明                     |
|------------|--------------------|---------|------|--------------------------|
| pluginInfo | [PluginInfoProps](#plugininfoprops-结构) | {}      | 否   | 插件信息对象             |
| isRequest  | boolean            | true    | 否   | 是否自动请求插件信息     |

### PluginInfoProps 结构
```ts
interface PluginInfoProps {
  title: string    // 插件标题
  name: string     // 插件名称
  status: boolean  // 运行状态
  version: string  // 版本号
  admin: boolean   // 管理权限
  s_version: string // 服务版本
  s_status: boolean // 服务状态
  setup: boolean   // 安装状态
}
```

## 功能特性
- 状态可视化展示
- 支持多种服务操作
- 自动状态同步
- 加载状态提示
- 响应式布局适配

## 使用示例
```vue
<template>
  <bt-soft-state 
    :plugin-info="pluginData"
    @status-change="handleStatusChange"
  />
</template>
```

## 注意事项
1. 需要配套的后端API支持
2. 操作需要管理员权限
3. 频繁操作需做防抖处理
4. 状态同步有1-2秒延迟 