# BtScrollbar 滚动条组件

基于 Element Plus ElScrollbar 封装的滚动容器组件，提供美观的滚动条样式和增强的交互功能。

## 基本用法

```vue
<template>
  <bt-scrollbar height="400px">
    <div class="long-content">
      <!-- 长内容区域 -->
    </div>
  </bt-scrollbar>
</template>
```

## 组件 API 说明

### 属性
| 属性名       | 说明                | 类型      | 默认值   |
|-------------|-------------------|-----------|---------|
| height      | 容器高度            | string    | —       |
| max-height  | 容器最大高度         | string    | —       |
| native      | 是否使用原生滚动条    | boolean   | false   |
| wrap-style  | 滚动区域样式         | CSSProperties | —    |
| view-style  | 内容区域样式         | CSSProperties | —    |

### 插槽
| 插槽名    | 说明               |
|---------|------------------|
| default | 滚动内容区域         |

## 继承特性

完整继承 [ElScrollbar](https://element-plus.org/zh-CN/component/scrollbar.html) 的所有特性：

| 特性类型       | 说明                      |
|--------------|-------------------------|
| Props        | 全部滚动条属性             |
| 样式类        | 继承 element-plus 滚动条样式 |

## 使用示例

### 自适应高度
```vue
<template>
  <bt-scrollbar :max-height="windowHeight - 120">
    <div class="auto-height-content">
      <!-- 动态高度内容 -->
    </div>
  </bt-scrollbar>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const windowHeight = ref(window.innerHeight)
onMounted(() => {
  window.addEventListener('resize', () => {
    windowHeight.value = window.innerHeight
  })
})
</script>
```

### 自定义滚动条样式
```vue
<template>
  <bt-scrollbar 
    class="custom-scroll"
    wrap-class="scroll-wrap"
  >
    <!-- 内容 -->
  </bt-scrollbar>
</template>

<style scoped>
.custom-scroll {
  ::-webkit-scrollbar {
    width: 8px;
    background: #f5f5f5;
  }
  
  ::-webkit-scrollbar-thumb {
    background: var(--el-color-primary);
    border-radius: 4px;
  }
}
</style>
```

## 最佳实践
1. **性能优化**：大数据量使用虚拟滚动
2. **响应式设计**：结合窗口尺寸动态调整高度
3. **样式统一**：全局配置滚动条样式
4. **无障碍访问**：确保键盘可操作滚动区域

## 样式定制
```scss
// 高级滚动条样式
.bt-scrollbar {
  --scrollbar-width: 6px;
  --scrollbar-thumb-color: #{mix(#409EFF, #fff, 60%)};

  &__wrap {
    &::-webkit-scrollbar {
      width: var(--scrollbar-width);
    }
    
    &::-webkit-scrollbar-thumb {
      background: var(--scrollbar-thumb-color);
      border-radius: calc(var(--scrollbar-width) / 2);
    }
  }
}
```

## 交互模式
| 模式          | 属性设置            | 适用场景       |
|--------------|-------------------|--------------|
| 自动高度      | 不设置 height/max-height | 根据父容器自适应 |
| 固定高度      | 设置 height        | 精确控制高度    |
| 最大高度      | 设置 max-height    | 响应式高度限制  |

> 完整 API 请参考 [Element Plus Scrollbar 文档](https://element-plus.org/zh-CN/component/scrollbar.html) 