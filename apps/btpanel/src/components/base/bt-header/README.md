# BtHeader 页头组件

基于 Element Plus ElHeader 封装的页面顶部布局组件，适用于导航栏和标题区域。

## 基本用法

```vue
<template>
  <bt-header height="60px" class="main-header">
    <div class="logo">LOGO</div>
    <nav-menu mode="horizontal" />
  </bt-header>
</template>

<style>
.main-header {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>
```

## 组件 API 说明

### 属性
| 属性名   | 说明         | 类型     | 默认值  |
|---------|------------|----------|--------|
| height  | 头部高度      | string  | 60px   |

### 插槽
| 插槽名    | 说明               |
|---------|------------------|
| default | 头部内容区域         |

## 继承特性

完整继承 [ElHeader](https://element-plus.org/zh-CN/component/layout.html) 的所有特性：

| 特性类型       | 说明                      |
|--------------|-------------------------|
| Props        | height 等全部属性          |
| 样式类        | 继承 element-plus 布局体系 |

## 使用示例

### 固定顶部导航
```vue
<template>
  <bt-header class="fixed-header">
    <page-header />
    <user-dropdown />
  </bt-header>
</template>

<style scoped>
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}
</style>
```

## 最佳实践
1. **固定定位**：实现吸顶效果
2. **层级管理**：控制 z-index 避免内容覆盖
3. **响应式高度**：根据设备类型调整高度
4. **阴影效果**：添加底部阴影增强层次感

## 样式定制
```scss
// 高级头部样式
.bt-header {
  --header-bg: #ffffff;
  --nav-height: 60px;

  background: var(--header-bg);
  height: var(--nav-height) !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  
  .logo {
    width: 200px;
    img {
      height: 32px;
    }
  }
}
```

> 完整 API 请参考 [Element Plus Header 文档](https://element-plus.org/zh-CN/component/layout.html) 