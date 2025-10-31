# 上下文菜单组件

## 功能说明
基于v-contextmenu封装的右键菜单组件，支持自定义菜单项和样式

## 使用场景
- 表格行右键操作
- 树节点右键菜单
- 自定义区域右键功能
- 需要多级菜单的场景

## 组件参数 (Props)
| 参数名   | 类型                  | 默认值 | 必填 | 说明                                                                 |
|----------|-----------------------|--------|------|--------------------------------------------------------------------|
| options  | [ContextMenuOptionsProps](#contextmenuoptionsprops-数据结构) | []     | 是   | 菜单项配置数组                                                     |

### ContextMenuOptionsProps 数据结构
```ts
interface ContextMenuOptionsProps {
  label: string       // 菜单项显示文本
  onClick: (e: MouseEvent) => void  // 点击事件处理函数
  disabled?: boolean  // 是否禁用
  divided?: boolean   // 是否显示分割线
  children?: ContextMenuOptionsProps[] // 子菜单项
}
```

## 事件说明
| 事件名          | 说明                 | 回调参数              |
|-----------------|----------------------|-----------------------|
| item-click      | 菜单项点击时触发     | (item, MouseEvent)    |

## 功能特性
- 支持多级子菜单
- 自定义菜单项样式
- 动态禁用/启用菜单项
- 自动定位显示
- 交互动画效果

## 使用示例
```vue
<template>
  <bt-context-menu :options="menuOptions">
    <div class="right-click-area">右键点击此处</div>
  </bt-context-menu>
</template>

<script setup>
const menuOptions = [
  {
    label: '编辑',
    onClick: (e) => handleEdit(e)
  },
  {
    label: '更多操作',
    children: [
      { label: '导出', onClick: handleExport },
      { label: '删除', onClick: handleDelete, disabled: true }
    ]
  }
]
</script>
```

## 样式覆盖
```scss
/* 修改菜单背景色 */
.v-contextmenu {
  background-color: #f5f7fa;
}

/* 调整菜单项悬停效果 */
.v-contextmenu-item--hover {
  background-color: #20a53a;
  transition: background-color 0.2s;
}

/* 自定义分割线样式 */
.v-contextmenu-divider {
  border-color: #e4e7ed;
}
```

## 注意事项
1. 需要先安装v-contextmenu库
2. 菜单项需至少包含label和onClick属性
3. 多级菜单建议不超过3层
4. 注意处理菜单的z-index层级
5. 移动端需额外处理触控事件
6. 动态更新options需使用响应式数据 