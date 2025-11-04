# BtImage 图片组件

基于 Element Plus ElImage 封装的智能图片组件，支持静态资源自动路径处理和错误状态管理。

## 基本用法

```vue
<template>
  <!-- 自动添加静态资源前缀 -->
  <bt-image src="banner.jpg" />
  
  <!-- 完整路径模式 -->
  <bt-image 
    src="https://example.com/logo.png" 
    :all="true"
  />
</template>
```

## 组件 API 说明

### 属性 (Attributes)
| 属性名  | 说明                | 类型      | 默认值   | 可选值          |
|--------|-------------------|-----------|---------|----------------|
| src    | 图片地址            | string    | ''      | 相对路径/完整URL |
| type   | 静态资源分类目录      | string    | images  | images/icons等 |
| all    | 是否使用完整路径模式   | boolean   | false   | true/false     |


## 路径解析规则
| 模式      | 输入 src          | 输出路径                     |
|----------|------------------|----------------------------|
| 默认模式   | `banner.jpg`     | `/static/images/banner.jpg` |
| 指定类型   | `icon.svg` + type="icons" | `/static/icons/icon.svg` |
| 完整路径   | `https://...` + all=true | 原路径不变            |



### 插槽 (Slots)
| 插槽名    | 说明               | 作用域参数          |
|---------|------------------|-------------------|
| error   | 加载失败时显示内容    | —                 |

## 继承特性

完整继承 [ElImage](https://element-plus.org/zh-CN/component/image.html) 的所有特性：

| 特性类型       | 说明                      |
|--------------|-------------------------|
| Props        | fit/lazy 等全部属性       |
| Events       | load/error 等事件         |
| 样式类        | 继承 element-plus 图片样式 |




## 使用示例

### 不同资源类型
```vue
<template>
  <!-- 图片资源 -->
  <bt-image src="header.jpg" type="banners" />
  
  <!-- 图标资源 -->
  <bt-image src="arrow-right.svg" type="icons" />
</template>
```

### 错误处理
```vue
<template>
  <bt-image src="missing.jpg">
    <template #error>
      <div class="error-tip">
        <bt-icon icon="picture-error" />
        <p>图片加载失败</p>
      </div>
    </template>
  </bt-image>
</template>
```

## 最佳实践
1. **路径规范**：非完整路径时按 type 分类管理资源
2. **性能优化**：大图使用 lazy 属性实现懒加载
3. **错误处理**：统一配置默认错误提示
4. **响应式适配**：结合 CSS 实现自适应布局

## 样式覆盖
```scss
// 高级图片样式
.bt-image {
  --image-radius: 4px;
  --transition-duration: 0.3s;

  border-radius: var(--image-radius);
  transition: all var(--transition-duration) ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .error-tip {
    @apply flex flex-col items-center justify-center h-full;
    color: var(--el-color-danger);
  }
}
```


> 完整 API 请参考 [Element Plus Image 文档](https://element-plus.org/zh-CN/component/image.html) 