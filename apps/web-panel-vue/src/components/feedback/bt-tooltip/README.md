# 文字提示组件

## 功能说明
基于 Element Plus Tooltip 的二次封装组件，用于在鼠标悬停时显示提示信息

## 使用场景
- 按钮/图标的文字说明
- 表单字段的额外说明
- 需要显示补充信息的场景
- 禁用状态的说明提示

## 组件参数 (Props)
完整继承 Element Plus Tooltip 组件参数，参考：
https://element-plus.org/zh-CN/component/tooltip.html

| 常用参数     | 类型       | 默认值    | 说明                     |
|--------------|------------|-----------|--------------------------|
| content      | string     | -         | 显示的内容               |
| placement    | string     | 'bottom'  | 出现位置                 |
| effect       | string     | 'dark'    | 主题样式(dark/light)     |
| disabled     | boolean    | false     | 是否禁用                 |
| showAfter    | number     | 0         | 延迟显示时间(ms)         |
| hideAfter    | number     | 0         | 延迟隐藏时间(ms)         |

## 事件说明
| 事件名       | 说明                 | 回调参数       |
|--------------|----------------------|----------------|
| onShow       | 显示时触发           | -              |
| onHide       | 隐藏时触发           | -              |

## 基本使用
```vue
<template>
  <bt-tooltip content="这是提示内容" placement="top">
    <el-button>悬停查看提示</el-button>
  </bt-tooltip>
</template>
```

## 样式覆盖
```scss
/* 修改提示背景色 */
.el-tooltip__popper {
  background: #20a53a;
}

/* 调整箭头颜色 */
.popper__arrow {
  border-top-color: #20a53a !important;
}
```

## 注意事项
1. 需要配合触发元素使用（如按钮、图标等）
2. 内容为空时不会显示提示
3. 移动端需要特殊处理触控事件
4. 动态内容需使用v-if控制重新渲染
5. 复杂内容建议使用content插槽 