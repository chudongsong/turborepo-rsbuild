# BtFooter 页脚组件

基于 Element Plus ElFooter 封装的页面底部布局组件，适用于版权信息和辅助导航。

## 基本用法

```vue
<template>
  <bt-footer height="80px" class="main-footer">
    <div class="copyright">© 2024 Your Company</div>
    <div class="links">
      <a>隐私政策</a>
      <a>使用条款</a>
    </div>
  </bt-footer>
</template>
```

## 组件 API 说明

### 属性
| 属性名   | 说明         | 类型     | 默认值  |
|---------|------------|----------|--------|
| height  | 页脚高度      | string  | 60px   |

### 插槽
| 插槽名    | 说明               |
|---------|------------------|
| default | 页脚内容区域         |

## 继承特性

完整继承 [ElFooter](https://element-plus.org/zh-CN/component/layout.html) 的所有特性：

| 特性类型       | 说明                      |
|--------------|-------------------------|
| Props        | height 等全部属性          |
| 样式类        | 继承 element-plus 布局体系 |

## 使用示例

### 固定底部
```vue
<template>
  <bt-footer class="fixed-footer">
    <div class="content">
      <p>联系我们：service@example.com</p>
    </div>
  </bt-footer>
</template>

<style scoped>
.fixed-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
```

## 最佳实践
1. **内容精简**：保持页脚内容简洁明了
2. **响应式设计**：适配移动端显示
3. **版权信息**：包含必要法律声明
4. **视觉平衡**：与页头样式保持协调

## 样式定制
```scss
// 高级页脚样式
.bt-footer {
  --footer-bg: #fafafa;
  --text-color: var(--el-color-text-secondary);

  background: var(--footer-bg);
  color: var(--text-color);
  padding: 24px 10%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .links {
    a {
      margin-left: 24px;
      color: inherit;
      
      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
}
```

> 完整 API 请参考 [Element Plus Footer 文档](https://element-plus.org/zh-CN/component/layout.html) 