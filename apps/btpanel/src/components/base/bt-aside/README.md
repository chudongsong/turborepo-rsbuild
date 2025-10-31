# BtAside 侧边栏组件

基于 Element Plus ElAside 封装的布局组件，用于构建页面侧边栏区域。

## 基本用法

```vue
<template>
  <bt-container>
    <bt-aside width="200px">
      <nav-menu />
    </bt-aside>
    <bt-main>主内容区</bt-main>
  </bt-container>
</template>
```

## 组件 API 说明

### 属性
| 属性名   | 说明         | 类型     | 默认值  |
|---------|------------|----------|--------|
| width   | 侧边栏宽度    | string  | 300px  |

### 插槽
| 插槽名    | 说明               |
|---------|------------------|
| default | 侧边栏内容区域       |

## 继承特性

完整继承 [ElAside](https://element-plus.org/zh-CN/component/layout.html) 的所有特性：

| 特性类型       | 说明                      |
|--------------|-------------------------|
| Props        | width 等全部属性          |
| 样式类        | 继承 element-plus 布局体系 |

## 使用示例

### 可折叠侧边栏
```vue
<template>
  <bt-aside :width="isCollapse ? '64px' : '200px'">
    <div class="toggle-btn" @click="isCollapse = !isCollapse">
      <i :class="isCollapse ? 'el-icon-expand' : 'el-icon-fold'" />
    </div>
    <nav-menu :collapse="isCollapse" />
  </bt-aside>
</template>

<script setup>
import { ref } from 'vue'
const isCollapse = ref(false)
</script>
```

### 带背景色的侧边栏
```vue
<template>
  <bt-aside 
    width="240px" 
    class="custom-aside"
  >
    <div class="side-header">导航标题</div>
    <nav-menu />
  </bt-aside>
</template>

<style scoped>
.custom-aside {
  background: var(--el-color-primary-light-9);
}
</style>
```

## 最佳实践
1. **布局组合**：与 BtContainer、BtMain 配合实现经典布局
2. **响应式设计**：使用动态宽度适应不同屏幕尺寸
3. **内容组织**：通过具名插槽划分侧边栏区域
4. **状态持久化**：存储折叠状态到本地存储

## 样式定制
```scss
// 高级侧边栏样式
.bt-aside {
  --aside-bg: #ffffff;
  --aside-border: 1px solid #{mix(#000, #fff, 10%)};

  background: var(--aside-bg);
  border-right: var(--aside-border);
  transition: width 0.3s ease;

  &.is-collapsed {
    width: 64px !important;
    
    .nav-menu {
      .menu-text {
        display: none;
      }
    }
  }
}
```

> 完整 API 请参考 [Element Plus Layout 文档](https://element-plus.org/zh-CN/component/layout.html)