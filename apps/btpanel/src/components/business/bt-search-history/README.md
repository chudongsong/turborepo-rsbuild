# 搜索历史组件

## 功能说明
提供搜索历史记录展示与管理功能，集成热门推荐功能

## 使用场景
- 搜索框历史记录展示
- 需要保存用户搜索习惯的场景
- 需要展示热门搜索推荐的页面
- 需要管理用户搜索历史的系统

## 组件参数 (Props)
| 参数名          | 类型      | 默认值  | 必填 | 说明                                                                 |
|-----------------|-----------|---------|------|--------------------------------------------------------------------|
| name           | String    | ''      | 是   | 搜索模块标识名称                                                   |
| keys           | String    | ''      | 否   | 搜索关键字标识，默认使用 name 值                                   |
| list           | Object    | { historyList: [], recommendList: [] } | 否 | 历史记录和推荐列表数据 |
| showHistory    | Boolean   | true    | 否   | 是否显示历史记录板块                                               |
| showRecommend  | Boolean   | true    | 否   | 是否显示推荐板块                                                   |

## 事件说明
| 事件名   | 说明                 | 回调参数       |
|----------|----------------------|----------------|
| search   | 点击历史记录时触发   | 搜索关键词     |
| trigger  | 操作后触发           | 是否显示历史记录 |
| update   | 历史记录更新时触发   | 新历史记录数组 |

## 数据结构
```ts
interface HistoryProps {
  val: string // 搜索内容
}

interface RecommendProps {
  name: string     // 推荐项显示名称
  callback?: () => void // 点击回调函数
}
```

## 基本使用
```vue
<template>
  <bt-search-history 
    name="userSearch"
    :list="searchData"
    @search="handleSearch"
  />
</template>

<script setup>
const searchData = {
  historyList: [
    { val: 'Vue3教程' },
    { val: 'React实战' }
  ],
  recommendList: [
    { name: '热门课程', callback: () => fetchCourses() }
  ]
}

const handleSearch = (keyword) => {
  console.log('搜索关键词:', keyword)
}
</script>
```

## 样式定制
```scss
/* 调整历史记录项最大宽度 */
.body-item span {
  max-width: 20rem;
}

/* 修改推荐项悬停效果 */
.recommend-item:hover {
  background: #f5f5f5;
}

/* 自定义清空按钮颜色 */
.history-title .el-button {
  color: #ef9f00;
}
```

## 注意事项
1. 需要配合全局搜索功能使用
2. 历史记录数据需通过 update 事件同步更新
3. 推荐项的 callback 需自行实现业务逻辑
4. 组件宽度固定为 400px，需在外层容器控制布局
5. 清空操作需要二次确认防止误触
6. 删除单条记录会实时更新历史列表 