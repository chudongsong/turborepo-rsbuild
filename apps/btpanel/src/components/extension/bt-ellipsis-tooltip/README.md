# 文本省略提示组件

## 功能说明
自动检测文本溢出的Tooltip组件，在文本截断时显示完整内容提示

## 使用场景
- 表格单元格文本截断
- 长文本内容预览
- 需要自适应宽度的文本容器
- 列表项内容截断展示

## 组件参数 (Props)
| 参数名        | 类型                                                                 | 默认值  | 必填 | 说明                                                                 |
|---------------|----------------------------------------------------------------------|---------|------|--------------------------------------------------------------------|
| text          | string                                                               | ''      | 是   | 需要显示的文本内容                                                 |
| placement     | 'top'\|'top-start'\|'top-end'\|'bottom'\|'bottom-start'\|'bottom-end'\|'left'\|'left-start'\|'left-end'\|'right'\|'right-start'\|'right-end' | 'top'   | 否   | Tooltip显示位置                                                    |
| popperClass   | string                                                               | ''      | 否   | 自定义Tooltip样式类                                                |

## 插槽说明
| 插槽名   | 说明                 | 作用域参数       |
|----------|----------------------|------------------|
| content  | 自定义内容区域       | -                |

## 功能特性
- 自动检测文本溢出
- 智能位置计算
- 支持自定义内容模板
- 无缝集成Element Plus Tooltip
- 轻量级实现

## 使用示例
```vue
<template>
  <!-- 基础用法 -->
  <bt-ellipsis-tooltip 
    text="这是一段非常长的需要截断显示的文本内容"
    class="truncate w-full"
  />

  <!-- 自定义内容 -->
  <bt-ellipsis-tooltip>
    <template #content>
      <div class="truncate w-full">自定义内容{{ dynamicText }}</div>
    </template>
  </bt-ellipsis-tooltip>
</template>
```

## 样式覆盖
```scss
/* 修改Tooltip背景色 */
.el-tooltip__popper {
  background: #20a53a;
  color: white;
}

/* 调整Tooltip箭头颜色 */
.popper__arrow {
  border-top-color: #20a53a !important;
}
```

## 注意事项
1. 父容器需要设置截断样式（如`truncate`和`w-full`）
2. 使用插槽时需要自行处理文本截断样式
3. 动态更新text内容后需要重新计算布局
4. 避免在大量数据场景中使用（性能考虑）
5. 浏览器兼容性需测试
6. 变量命名需符合camelCase规范（如ev_width → evWidth） 