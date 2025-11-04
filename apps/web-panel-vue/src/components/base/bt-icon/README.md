# BtIcon 图标组件

基于 SVG 字体图标的通用组件，支持自定义图标、颜色和尺寸。

## 基本用法

```vue
<template>
  <bt-icon icon="user" />
  <bt-icon icon="setting" color="#409EFF" size="20" />
</template>
```

## 组件 API 说明

### 属性 (Attributes)
| 属性名  | 说明         | 类型     | 默认值   | 可选值          |
|--------|------------|----------|---------|----------------|
| icon   | 图标名称     | string  | default | 项目图标库名称（svgtofont）    |
| color  | 图标颜色     | string  | #666    | 所有合法颜色值    |
| size   | 图标尺寸(px) | number  | 16      | 正整数          |

### 插槽 (Slots)
| 插槽名    | 说明               |
|---------|------------------|
| —       | 无插槽支持          |

## 使用示例

### 不同状态图标
```vue
<template>
  <bt-icon icon="success" color="#67C23A" />
  <bt-icon icon="warning" color="#E6A23C" />
  <bt-icon icon="error" color="#F56C6C" />
</template>
```

### 动态切换图标
```vue
<template>
  <bt-icon 
    :icon="isActive ? 'star-filled' : 'star'" 
    :color="isActive ? '#F56C6C' : '#909399'"
    @click="toggle"
  />
</template>

<script setup>
const isActive = ref(false)
const toggle = () => isActive.value = !isActive.value
</script>
```

## 最佳实践
1. **统一管理**：通过全局配置管理常用图标参数
2. **尺寸规范**：遵循 8px 倍数原则（16/24/32）
3. **颜色控制**：使用 CSS 变量实现主题化
4. **交互增强**：结合点击事件实现可交互图标

## 样式覆盖
```scss
// 高级图标样式
.bt-icon {
  --icon-transition: all 0.2s ease;

  cursor: pointer;
  transition: var(--icon-transition);

  &:hover {
    opacity: 0.8;
    transform: scale(1.1);
  }

  &[disabled] {
    cursor: not-allowed;
    opacity: 0.5;
  }
}
```

## 图标库参考
| 图标名称       | 示例代码                     | 使用场景       |
|--------------|----------------------------|--------------|
| user         | `<bt-icon icon="user" />`  | 用户相关操作   |
| setting      | `<bt-icon icon="setting" />` | 系统设置       |
| download     | `<bt-icon icon="download" />` | 下载操作       |
| search       | `<bt-icon icon="search" />` | 搜索功能       |

> 完整图标列表请参考项目图标库文档 