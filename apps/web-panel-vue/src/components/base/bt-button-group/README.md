# BtButtonGroup 按钮组组件

基于 Element Plus ElButtonGroup 封装的容器组件，用于组合多个按钮并保持样式统一。

## 基本用法

```vue
<template>
  <bt-button-group>
    <bt-button type="primary">上一页</bt-button>
    <bt-button type="primary">下一页</bt-button>
  </bt-button-group>
</template>
```

## 组件 API 说明

### 属性 (Attributes)
| 属性名   | 说明         | 类型     | 可选值                | 默认值  |
|---------|------------|----------|----------------------|--------|
| size    | 组内按钮尺寸   | string  | 'large' | 'default' | 'small' | —      |
| type    | 组内按钮类型   | string  | 'primary' | 'success' | 'warning' | 'danger' | 'info' | —      |

### 插槽 (Slots)
| 插槽名    | 说明               |
|---------|------------------|
| default | 包裹需要组合的按钮组件 |

### 暴露项 (Exposes)
| 名称     | 说明          | 类型                     |
|--------|-------------|-------------------------|
| —      | 无独立暴露项     | 继承 ElButtonGroup 所有特性 |

## 继承特性

完整继承 [ElButtonGroup](https://element-plus.org/zh-CN/component/button.html#button-group-attributes) 的所有特性：

| 特性类型 | 说明                      |
|--------|-------------------------|
| 属性    | size/type/border 等全部属性 |
| 样式    | 继承 element-plus 按钮组样式体系 |

## 使用示例

### 基础工具栏
```vue
<template>
  <bt-button-group>
    <bt-button icon="el-icon-edit" />
    <bt-button icon="el-icon-delete" />
    <bt-button icon="el-icon-share" />
  </bt-button-group>
</template>
```

### 带边框操作组
```vue
<template>
  <bt-button-group border size="small">
    <bt-button type="primary">保存草稿</bt-button>
    <bt-button type="success">发布文章</bt-button>
  </bt-button-group>
</template>
```

## 最佳实践
- 组合 2-4 个相同功能的按钮
- 复杂界面使用多个按钮组进行视觉分区
- 通过 `size` 统一控制组内按钮尺寸

## 样式覆盖
```scss
// 自定义按钮组样式
.bt-button-group {
  gap: 4px;
  padding: 8px;
  background: var(--bg-color-light);
  
  .el-button {
    transition: all 0.3s;
    &:hover {
      transform: translateY(-2px);
    }
  }
}
```

> 需配合 [BtButton](#) 使用，完整 API 参考 [Element Plus 按钮组文档](https://element-plus.org/zh-CN/component/button.html#button-group-attributes)
