# 分割线组件

## 功能说明
基于 Element Plus Divider 的二次封装组件，提供内容分隔功能

## 使用场景
- 内容区块分隔
- 文字段落分隔
- 布局元素分隔
- 需要自定义方向的分隔线

## 组件参数 (Props)
完整继承 Element Plus Divider 组件参数，参考：
https://element-plus.org/zh-CN/component/divider.html

| 参数名       | 类型               | 默认值       | 说明                     |
|--------------|--------------------|--------------|--------------------------|
| direction    | 'horizontal'\|'vertical' | 'vertical' | 分隔线方向             |
| borderStyle  | string             | 'solid'      | 分隔线样式             |
| contentPosition | 'left'\|'center'\|'right' | 'center' | 内容位置       |

## 基本使用
```vue
<template>
  <!-- 垂直分隔线 -->
  <bt-divider direction="vertical" />
  
  <!-- 带文字的水平分隔线 -->
  <bt-divider>
    分割文字
  </bt-divider>
</template>
```

## 样式覆盖
```scss
/* 修改分隔线颜色 */
.el-divider {
  border-color: #dcdfe6;
}

/* 调整垂直分隔线高度 */
.el-divider--vertical {
  height: 1em;
}
```

## 注意事项
1. 垂直分隔线需要容器有高度
2. 文字内容建议不超过6个汉字
3. 复杂样式建议使用插槽自定义
4. 移动端建议使用更粗的分隔线
5. 需要虚线样式可设置border-style为dashed 