# BtBtnGroup 按钮组组件

灵活组合多种按钮类型的容器组件，支持普通按钮、下拉按钮和分割线。

## 功能特性
- 多种按钮类型组合
- 动态显示/隐藏控制
- 下拉菜单支持
- 分割线显示
- 图标集成
- 响应式布局

## 基本用法

```vue
<template>
  <bt-btn-group :options="buttonOptions" />
</template>

<script setup>
const buttonOptions = [
  {
    content: '新建',
    icon: 'bt-ico-add',
    event: handleCreate
  },
  {
    division: true // 显示分割线
  },
  {
    content: '操作',
    dropdown: true,
    settingList: [
      { label: '导入', name: 'import' },
      { label: '导出', name: 'export' }
    ],
    event: handleAction
  }
]
</script>
```

## 组件 API 说明

### Props
| 属性名       | 说明                | 类型      | 默认值   | 可选值                          |
|-------------|-------------------|-----------|---------|--------------------------------|
| options     | 按钮配置数组         | BtnGroupProps[] | []     | 支持三种配置类型：<br>• 普通按钮（需包含 content/icon/event 等属性）<br>• 下拉按钮（需设置 dropdown:true 并配置 settingList）<br>• 分割线（设置 division:true） |

### BtnGroupProps 配置项
| 属性名         | 说明                | 类型                | 默认值       |
|---------------|-------------------|---------------------|-------------|
| content       | 按钮显示文本         | string              | —           |
| icon          | 图标类名            | string              | —           |
| event         | 点击事件处理函数      | Function            | —           |
| hide          | 是否隐藏            | boolean \| Function | false       |
| active        | 是否激活状态         | boolean             | false       |
| dropdown      | 是否下拉按钮         | boolean             | false       |
| splitButton   | 是否分裂式下拉按钮    | boolean             | false       |
| settingList   | 下拉菜单项列表        | Array<{label: string, name: string}> | [] |
| division      | 是否显示分割线        | boolean             | false       |

## 按钮类型示例
### 普通按钮
```javascript
{
  content: '刷新',
  icon: 'bt-ico-refresh',
  event: handleRefresh
}
```

### 带分割线
```javascript
{ division: true }
```

### 下拉按钮
```javascript
{
  content: '更多操作',
  dropdown: true,
  settingList: [
    { label: '批量删除', name: 'batchDelete' },
    { label: '批量导出', name: 'batchExport' }
  ],
  event: handleMoreAction
}
```

## 最佳实践
1. **动态控制**：使用 hide 属性控制按钮显示
2. **状态管理**：通过 active 属性标记激活状态
3. **复杂菜单**：使用 settingList 配置多级菜单
4. **样式统一**：通过 icon 属性保持图标风格一致

## 样式定制
```css
/* 自定义按钮间距 */
.bt-btn-group {
  gap: 8px;
}

/* 下拉菜单样式覆盖 */
:deep(.el-dropdown-menu) {
  min-width: 120px;
}
```

> 完整样式覆盖请参考 Element Plus 按钮组件文档 