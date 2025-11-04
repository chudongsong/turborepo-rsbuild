# 表格组布局组件

## 功能说明
表格容器组件，提供标准化的布局结构用于组织表格及相关操作元素

## 使用场景
- 需要统一布局的表格页面
- 包含复杂操作区域的表格
- 需要分区域管理的表格界面

## 插槽说明
| 插槽名         | 说明                     | 位置                 |
|----------------|--------------------------|----------------------|
| header-left    | 表格头部左侧区域         | 顶部左侧             |
| header-right   | 表格头部右侧区域         | 顶部右侧             |
| content        | 表格主体内容区域         | 头部与底部之间       |
| footer-left    | 表格底部左侧区域         | 底部左侧             |
| footer-right   | 表格底部右侧区域         | 底部右侧             |
| popup          | 浮动弹层内容             | 覆盖在整体布局之上   |

## 布局结构
```text
┌───────────────────────────────────┐
│ header-left       │ header-right  │
├───────────────────────────────────┤
│            content                │
├───────────────────────────────────┤
│ footer-left       │ footer-right  │
└───────────────────────────────────┘
```

## 功能特性
- 响应式Flex布局
- 预置合理间距
- 多区域插槽支持
- 弹层内容集成
- 移动端适配

## 使用示例
```vue
<template>
  <bt-table-group>
    <template #header-left>
      <el-input placeholder="搜索..." />
    </template>
    
    <template #header-right>
      <el-button type="primary">新增</el-button>
    </template>

    <template #content>
      <bt-table :data="tableData" />
    </template>

    <template #footer-right>
      <bt-pagination />
    </template>
  </bt-table-group>
</template>
```

## 样式覆盖
```scss
/* 调整内容区域间距 */
.content {
  padding: 16px 0;
}

/* 修改头部背景色 */
.header-left, .header-right {
  background: #f5f7fa;
  padding: 8px 0;
}

/* 调整底部对齐方式 */
.footer-right {
  margin-left: auto;
}
```

## 注意事项
1. 使用Flex布局需注意浏览器兼容性
2. 各区域建议使用固定高度组件
3. 弹层内容需自行管理显隐逻辑
4. 移动端建议使用单列布局
5. 复杂布局建议结合Grid系统
6. 避免在插槽中使用过多嵌套 