# BtSvgIcon SVG 图标组件

基于 Element Plus ElImage 封装的 SVG 图标组件，支持动态加载和尺寸控制。

## 基本用法

```vue
<template>
  <bt-svg-icon name="user" />
  <bt-svg-icon name="arrow-right" size="20" />
</template>
```

## 组件 API 说明

### 属性 (Attributes)
| 属性名  | 说明         | 类型     | 默认值   | 可选值          |
|--------|------------|----------|---------|----------------|
| name   | 图标名称     | string  | ''      | 图标名称    |
| size   | 图标尺寸(px) | string  | 14      | 正整数        r  |

### 插槽 (Slots)
| 插槽名    | 说明               |
|---------|------------------|
| —       | 无插槽支持          |

## 使用示例

### 动态切换图标
```vue
<template>
  <bt-svg-icon :name="currentIcon" />
</template>

<script setup>
const currentIcon = ref('home')
</script>
```

### 带悬停效果
```vue
<template>
  <bt-svg-icon 
    name="search" 
    class="hover-icon"
    size="16"
  />
</template>

<style scoped>
.hover-icon:hover {
  filter: brightness(1.2);
}
</style>
```

## 最佳实践
1. **图标管理**：统一存放于 `/static/icons/` 目录
2. **尺寸规范**：使用 4 的倍数尺寸（12/16/20）
3. **颜色控制**：通过 CSS filter 调整图标颜色
4. **性能优化**：预加载常用图标资源

## 样式定制
```scss
// 高级图标样式
.bt-svg-icon {
  --icon-transition: all 0.2s ease;
  
  transition: var(--icon-transition);
  vertical-align: middle;

  &:hover {
    transform: scale(1.1);
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
```

## 图标命名规范
| 类型       | 命名格式          | 示例            |
|------------|-----------------|-----------------|
| 系统图标     | sys-{name}      | sys-setting     |
| 操作图标     | action-{name}   | action-delete   |
| 状态图标     | status-{name}   | status-success  |

> 图标资源需存放于 `/static/icons/` 目录，使用 SVG 格式 