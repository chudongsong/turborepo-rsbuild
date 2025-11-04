# BtButton 按钮组件

基于 Element Plus ElButton 封装的二次封装按钮组件，完整继承原生特性。

## 基本用法

```vue
<template>
  <bt-button type="primary">主要按钮</bt-button>
  <bt-button icon="el-icon-search">图标按钮</bt-button>
</template>
```

## 组件 API 说明

### 属性 (Attributes)

| 属性名              | 说明                                                                | 类型                                                                                      | 默认值   |
|--------------------|--------------------------------------------------------------------|-----------------------------------------------------------------------------------------|--------|
| size               | 按钮尺寸                                                             | 'large' \| 'default' \| 'small'`                                               | —      |
| type               | 按钮类型（设置 color 时该属性将失效）                                    | 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info' \| 'text' (已弃用)`     | —      |
| plain              | 是否为朴素按钮                                                        | ^[boolean]                                                                             | false  |
| text ^(2.2.0)      | 是否为文字按钮                                                        | ^[boolean]                                                                             | false  |
| bg ^(2.2.0)        | 文字按钮是否始终显示背景色                                               | ^[boolean]                                                                             | false  |
| link ^(2.2.1)      | 是否为链接按钮                                                        | ^[boolean]                                                                             | false  |
| round              | 是否为圆角按钮                                                        | ^[boolean]                                                                             | false  |
| circle             | 是否为圆形按钮                                                        | ^[boolean]                                                                             | false  |
| loading            | 是否显示加载状态                                                       | ^[boolean]                                                                             | false  |
| loading-icon       | 自定义加载图标组件                                                     | ^[string] / ^[Component]                                                               | Loading |
| disabled           | 是否禁用按钮                                                         | ^[boolean]                                                                             | false  |
| icon               | 图标组件                                                            | ^[string] / ^[Component]                                                               | —      |
| autofocus          | 原生按钮的 autofocus 属性                                             | ^[boolean]                                                                             | false  |
| native-type        | 原生按钮的 type 属性                                                 | 'button' \| 'submit' \| 'reset'`                                               | button |
| auto-insert-space  | 自动在两个中文字符之间插入空格                                             | ^[boolean]                                                                             | —      |
| color              | 自定义按钮颜色（自动计算 hover 和 active 状态颜色）                      | ^[string]                                                                              | —      |
| dark               | 暗黑模式（自动转换 color 为暗色系）                                        | ^[boolean]                                                                             | false  |
| tag ^(2.3.4)       | 自定义元素标签                                                        | ^[string] / ^[Component]                                                               | button |

### 插槽 (Slots)

| 插槽名    | 说明               |
|---------|------------------|
| default | 自定义默认内容         |
| loading | 自定义加载状态组件      |
| icon    | 自定义图标组件        |

### 暴露项 (Exposes)

| 名称            | 说明               | 类型                                                                                                           |
|---------------|------------------|--------------------------------------------------------------------------------------------------------------|
| ref           | 按钮 DOM 元素引用     | Ref<HTMLButtonElement>`                                                                           |
| size          | 当前按钮尺寸          | ComputedRef<'' \| 'small' \| 'default' \| 'large'>`                                               |
| type          | 当前按钮类型          | ComputedRef<'' \| 'default' \| 'primary' \| 'success' \| 'warning' \| 'info' \| 'danger' \| 'text'>` |
| disabled      | 是否禁用状态          | ComputedRef<boolean>`                                                                             |
| shouldAddSpace | 是否自动添加中文字符间距  | ComputedRef<boolean>`                                                                             |

## 继承特性

完整继承 [ElButton](https://element-plus.org/zh-CN/component/button.html) 的所有特性：

| 特性类型       | 说明                      |
|--------------|-------------------------|
| 属性          | type/size/disabled 等全部属性 |
| 事件          | click 等原生 DOM 事件       |
| 插槽          | default 插槽支持文本内容       |
| 样式类        | 继承 element-plus 按钮样式体系 |

## 使用示例

### 按钮类型
```vue
<template>
  <bt-button type="primary">主要</bt-button>
  <bt-button type="success">成功</bt-button>
  <bt-button type="warning">警告</bt-button>
</template>
```

### 图标按钮
```vue
<template>
  <bt-button icon="el-icon-edit">编辑</bt-button>
  <bt-button icon="el-icon-share" circle />
</template>
```

## 最佳实践
- 统一使用 `size` 控制按钮尺寸（medium/small/mini）
- 禁用状态使用 `disabled` 属性而非自定义样式
- 复杂场景建议组合使用 icon 插槽和文本内容
- 点击事件使用 `@click` 监听

## 样式覆盖
```scss
// 自定义主题按钮
.bt-button--custom {
  background: var(--primary-color);
  &:hover {
    opacity: 0.8;
  }
}
```

> 完整 API 请参考 [Element Plus 按钮文档](https://element-plus.org/zh-CN/component/button.html)
