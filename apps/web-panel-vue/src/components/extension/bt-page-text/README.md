# 简约分页组件

## 功能说明
轻量级分页导航组件，提供基础分页功能与页面状态显示

## 使用场景
- 简单列表分页
- 需要极简风格的分页场景
- 基础数据表格分页
- 替代复杂分页组件的轻量方案

## 组件参数 (Props)
| 参数名 | 类型   | 默认值 | 必填 | 说明                     |
|--------|--------|--------|------|--------------------------|
| limit  | number | 10     | 否   | 每页显示条数             |
| p      | number | 1      | 否   | 当前页码                 |
| num    | number | 10     | 否   | 当前页实际数据条数       |

## 事件说明
| 事件名 | 说明                 | 回调参数                     |
|--------|----------------------|------------------------------|
| click  | 点击分页按钮时触发   | (页码: number, 事件: Event)  |

## 功能特性
- 智能按钮显隐控制
- 极简UI设计
- 轻量级实现
- 响应式交互
- 无外部依赖

## 使用示例
```vue
<template>
  <bt-page-text 
    :p="currentPage" 
    :num="items.length"
    @click="handlePageChange"
  />
</template>

<script setup>
const currentPage = ref(1)
const handlePageChange = (page) => {
  currentPage.value = page
  fetchData(page)
}
</script>
```

## 样式覆盖
```scss
/* 修改按钮颜色 */
.page-btn {
  color: #20a53a;
  border-color: #20a53a;
}

/* 调整当前页文本样式 */
.page-text {
  font-weight: 500;
  color: #333;
}
```

## 注意事项
1. 需要父组件自行处理分页逻辑
2. 总页数由(num >= limit)自动计算
3. 不显示总页数，仅显示当前页码
4. 按钮显隐逻辑基于当前页码
5. 需要自行处理数据加载状态
6. 复杂分页需求建议使用完整分页组件
7. 移动端需调整按钮间距 