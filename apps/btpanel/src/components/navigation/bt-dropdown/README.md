# 下拉菜单组件

## 功能说明
基于 Element Plus Dropdown 的二次封装组件，支持菜单项配置和图标自定义

## 使用场景
- 操作菜单展示
- 表格行操作
- 需要自定义触发图标的场景
- 分割按钮式下拉菜单

## 组件参数 (Props)
完整继承 Element Plus Dropdown 组件参数，参考：
https://element-plus.org/zh-CN/component/dropdown.html

| 参数名       | 类型               | 默认值    | 说明                     |
|--------------|--------------------|-----------|--------------------------|
| options      | dropdownOptionProps[] | []    | 菜单项配置数组          |
| icon         | string             | 'svgtofont-el-more-filled' | 触发图标名称 |
| splitButton  | boolean            | false     | 是否显示为分割按钮       |
| ...其他DropdownProps | -         | -       | 继承Element Plus Dropdown属性 |

### dropdownOptionProps 结构
```ts
interface dropdownOptionProps {
  label: string       // 菜单项文本
  command?: string    // 菜单项命令
  disabled?: boolean  // 是否禁用
  divided?: boolean   // 是否显示分割线
  icon?: string       // 菜单项图标
}
```

## 事件说明
| 事件名       | 说明                 | 回调参数       |
|--------------|----------------------|----------------|
| command      | 点击菜单项时触发     | 菜单项command  |

## 基本使用
```vue
<template>
  <bt-dropdown
    :options="[
      { label: '编辑', command: 'edit' },
      { label: '删除', command: 'delete', divided: true }
    ]"
    @command="handleCommand"
  />
</template>
```

## 样式覆盖
```scss
/* 修改菜单项悬停背景色 */
.el-dropdown-menu__item:hover {
  background-color: #f5f7fa;
}

/* 调整触发图标大小 */
.bt-dropdown .bt-icon {
  font-size: 20px;
}
```

## 注意事项
1. 分割按钮模式需设置splitButton为true
2. 菜单项图标需预先注册
3. 动态更新options需重新渲染
4. 移动端建议使用弹窗菜单
5. 复杂菜单建议使用插槽自定义 