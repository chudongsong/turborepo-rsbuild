# BtMain 主内容区组件

基于 Element Plus ElMain 封装的布局组件，用于承载页面主要内容区域。

## 基本用法

```vue
<template>
  <bt-container>
    <bt-aside width="200px">侧边导航</bt-aside>
    <bt-main>
      <h2>页面标题</h2>
      <router-view />
    </bt-main>
  </bt-container>
</template>
```

## 组件 API 说明

### 继承属性
| 属性名   | 说明         | 类型     | 默认值  |
|---------|------------|----------|--------|
| —       | 无独立属性     | —        | —      |

### 插槽
| 插槽名    | 说明               |
|---------|------------------|
| default | 主内容区域          |

## 继承特性

完整继承 [ElMain](https://element-plus.org/zh-CN/component/layout.html) 的所有特性：

| 特性类型       | 说明                      |
|--------------|-------------------------|
| Props        | 全部布局属性               |
| 样式类        | 继承 element-plus 布局体系 |

## 使用示例

### 带内边距的内容区
```vue
<template>
  <bt-main class="content-main">
    <div class="content-wrapper">
      <!-- 页面内容 -->
    </div>
  </bt-main>
</template>

<style scoped>
.content-main {
  padding: 20px;
}
</style>
```

### 滚动区域
```vue
<template>
  <bt-main class="scroll-container">
    <div class="long-content">
      <!-- 长内容 -->
    </div>
  </bt-main>
</template>

<style scoped>
.scroll-container {
  height: calc(100vh - 120px);
  overflow-y: auto;
}
</style>
```

## 最佳实践
1. **内容组织**：使用语义化标签划分内容结构
2. **响应式设计**：结合媒体查询适配不同设备
3. **滚动优化**：长内容使用局部滚动容器
4. **间距管理**：通过 CSS 变量统一内边距

## 样式定制
```scss
// 高级主内容区样式
.bt-main {
  --main-bg: #ffffff;
  --content-padding: 24px;

  background: var(--main-bg);
  padding: var(--content-padding);
  position: relative;
  
  &.has-scroll {
    overflow: auto;
    &::-webkit-scrollbar {
      width: 6px;
    }
  }
}
```

> 完整 API 请参考 [Element Plus Layout 文档](https://element-plus.org/zh-CN/component/layout.html) 