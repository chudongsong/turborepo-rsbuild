# 表格刷新组件

## 功能说明
表格刷新操作按钮组件，提供标准化的刷新交互和视觉反馈

## 使用场景
- 需要手动刷新表格数据的场景
- 用户执行操作后需要刷新表格
- 需要明确视觉反馈的刷新操作

## 事件说明
| 事件名   | 说明                 | 回调参数 |
|----------|----------------------|----------|
| refresh  | 点击刷新按钮时触发   | 无       |

## 功能特性
- 一键刷新表格数据
- 操作成功反馈提示
- 内置刷新图标
- 标准按钮样式
- 无障碍支持

## 使用示例
```vue
<template>
  <bt-table-refresh @refresh="handleRefresh" />
</template>

<script setup>
const handleRefresh = () => {
  // 执行表格刷新逻辑
  fetchTableData()
}
</script>
```

## 样式覆盖
```scss
/* 调整按钮尺寸 */
.bt-table-refresh {
  :deep(.el-button) {
    padding: 8px;
    min-width: 32px;
  }
  
  /* 修改图标颜色 */
  .bt-icon {
    color: #20a53a;
    font-size: 16px;
  }
  
  /* 悬停效果 */
  &:hover {
    opacity: 0.8;
  }
}
```

## 注意事项
1. 需自行实现具体的刷新逻辑
2. 成功提示消息可通过Message组件配置
3. 默认使用element-plus的按钮样式
4. 刷新图标可通过替换BtIcon修改
5. 高频操作建议增加防抖处理
6. 需要国际化时可封装翻译功能 