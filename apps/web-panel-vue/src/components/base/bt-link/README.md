# BtLink 链接组件

基于 Element Plus ElLink 封装的增强型链接组件，支持内联样式和多种交互模式。

## 基本用法

```vue
<template>
  <!-- 外部链接 -->
  <bt-link href="https://example.com">外部链接</bt-link>
  
  <!-- 内部交互 -->
  <bt-link @click="handleClick">点击操作</bt-link>
</template>
```

## 组件 API 说明

### 属性 (Attributes)
| 属性名      | 说明                | 类型      | 默认值       | 可选值                          |
|------------|-------------------|-----------|-------------|--------------------------------|
| type       | 链接类型            | string    | primary     | primary/success/warning/danger/info |
| title      | 链接标题            | string    | ''          | —                             |
| target     | 链接打开方式         | string    | _blank      | _blank/_self/_parent/_top     |
| underline  | 是否显示下划线       | boolean   | false       | true/false                    |
| href       | 链接地址            | string    | ''          | URL 或 javascript:;          |
| size       | 字体大小            | string    | 12px        | 合法 CSS 尺寸值                |

### 插槽 (Slots)
| 插槽名    | 说明               |
|---------|------------------|
| default | 链接显示内容         |

## 继承特性

完整继承 [ElLink](https://element-plus.org/zh-CN/component/link.html) 的所有特性：

| 特性类型       | 说明                      |
|--------------|-------------------------|
| Props        | disabled/icon 等属性      |
| Events       | click 等事件             |
| 样式类        | 继承 element-plus 链接样式 |

## 使用示例

### 不同状态链接
```vue
<template>
  <bt-link type="success">成功状态</bt-link>
  <bt-link type="danger" underline>危险链接</bt-link>
  <bt-link disabled>禁用状态</bt-link>
</template>
```

### 自定义样式
```vue
<template>
  <bt-link 
    size="16px"
    style="font-weight: 500;"
  >
    <template #icon>
      <bt-icon icon="external-link" />
    </template>
    带图标的链接
  </bt-link>
</template>
```

## 最佳实践
1. **安全防护**：外部链接自动添加 `rel="noreferrer noopener"`
2. **尺寸控制**：使用 size 统一管理链接字号
3. **交互区分**：区分导航链接与操作链接（href vs @click）
4. **无障碍访问**：始终提供有意义的 title 属性

## 样式覆盖
```scss
// 高级链接样式
.bt-link {
  --link-transition: all 0.2s ease;
  
  transition: var(--link-transition);
  
  &:not(.is-disabled):hover {
    transform: translateY(-1px);
    opacity: 0.8;
  }

  &__icon {
    margin-right: 4px;
  }
}
```

## 交互模式对比
| 模式        | 属性设置               | 适用场景       |
|------------|----------------------|--------------|
| 导航链接     | href 有效值          | 页面跳转       |
| 操作链接     | href="javascript:;"  | 执行本地操作    |
| 禁用状态     | disabled             | 不可交互状态    |

> 完整 API 请参考 [Element Plus Link 文档](https://element-plus.org/zh-CN/component/link.html) 