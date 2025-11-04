# 软件安装组件

## 功能说明
提供软件/插件安装流程管理，支持版本选择、安装方式切换、更新日志查看等功能

## 使用场景
- 软件商店安装界面
- 插件市场安装流程
- 系统组件更新管理
- 需要多版本选择的安装场景

## 组件参数 (Props)
| 参数名       | 类型                | 默认值                     | 必填 | 说明                                                                 |
|--------------|---------------------|----------------------------|------|--------------------------------------------------------------------|
| compData     | [PluginInstallOptions](#plugininstalloptions-数据结构) | { type: 'i', name: '' }    | 是   | 安装配置对象，结构见下方 PluginInstallOptions                      |

### PluginInstallOptions 数据结构
```ts
interface PluginInstallOptions {
  type: 'i' | 'u'       // 安装类型：i=安装，u=更新
  name: string          // 软件/插件名称
  pluginInfo?: {
    pid: number         // 插件ID
    title: string       // 显示标题
    version: string     // 当前版本
  }
}

```

## 事件说明
| 事件名   | 说明                 | 回调参数       |
|----------|----------------------|----------------|
| close    | 关闭安装界面时触发   | 无             |
| refresh  | 安装成功后触发       | 无             |



## 基本使用
```vue
<template>
  <bt-soft-install :comp-data="installConfig" @refresh="handleRefresh" />
</template>

<script setup>
const installConfig = {
  type: 'i',
  name: 'nodejs',
  pluginInfo: {
    pid: 2023,
    title: 'Node.js 环境',
    version: '18.0.0'
  }
}

const handleRefresh = () => {
  console.log('安装完成，刷新数据')
}
</script>
```

## 功能特性
- 支持编译安装与极速安装模式
- 版本历史记录查看功能
- 自动检测更新状态
- 安装风险提示系统
- 响应式图片展示区域

## 样式定制
```scss
/* 调整头部布局 */
.header {
  padding: 1.5rem;
}

/* 修改警告提示颜色 */
.tips-list li.text-danger {
  color: #ef0808;
}

/* 自定义标签样式 */
.plugin-label {
  border-radius: 0.3rem;
  padding: 0.2rem 0.5rem;
}
```

## 注意事项
1. 需要配合全局安装状态管理使用
2. 图片资源路径为 '/static/images/soft_ico/'
3. 更新操作需要二次确认
4. 安装过程可能较长时间需做好加载提示
5. 使用 el-image 组件需确保 Element Plus 已注册
6. 多版本切换依赖 versionModel 状态管理 