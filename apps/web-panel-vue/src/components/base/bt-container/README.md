# BtContainer 布局容器

基于 Element Plus ElContainer 封装的根级布局容器，用于包裹其他布局组件。

## 基本用法

```vue
<template>
  <bt-container>
    <bt-header>页头</bt-header>
    <bt-container class="main-wrapper">
      <bt-aside width="200px">侧边栏</bt-aside>
      <bt-main>主内容区</bt-main>
    </bt-container>
    <bt-footer>页脚</bt-footer>
  </bt-container>
</template>

<style>
.main-wrapper {
  height: calc(100vh - 120px);
}
</style>
```

## 组件 API 说明

### 属性
| 属性名   | 说明         | 类型     | 默认值  |
|---------|------------|----------|--------|
| —       | 无独立属性     | —        | —      |

### 插槽
| 插槽名    | 说明               |
|---------|------------------|
| default | 容器内容区域         |

## 继承特性

完整继承 [ElContainer](https://element-plus.org/zh-CN/component/layout.html) 的所有特性：

| 特性类型       | 说明                      |
|--------------|-------------------------|
| Props        | direction 等全部属性      |
| 样式类        | 继承 element-plus 布局体系 |

## 使用示例

### 嵌套布局
```vue
<template>
  <bt-container direction="vertical">
    <bt-header height="60px">系统导航</bt-header>
    <bt-container>
      <bt-aside width="200px" class="nav-side">
        <side-menu />
      </bt-aside>
      <bt-main>
        <router-view />
      </bt-main>
    </bt-container>
  </bt-container>
</template>
```

## 最佳实践
1. **层级控制**：作为根容器包裹所有布局组件
2. **方向控制**：使用 `direction` 控制子元素排列方向
3. **高度管理**：配合 CSS 计算实现自适应高度
4. **响应式设计**：结合媒体查询调整布局结构

## 样式定制
```scss
// 高级容器样式
.bt-container {
  --container-bg: #f5f7fa;
  --main-padding: 20px;

  background: var(--container-bg);
  
  &.is-vertical {
    flex-direction: column;
    
    .bt-main {
      padding: var(--main-padding);
    }
  }
}
```

> 完整 API 请参考 [Element Plus Container 文档](https://element-plus.org/zh-CN/component/layout.html) 