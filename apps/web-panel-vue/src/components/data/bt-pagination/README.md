# 分页组件

## 功能说明
增强型分页组件，支持两种分页模式及自定义布局

## 使用场景
- 表格数据分页
- 列表内容分页
- 未知总页数的分页场景
- 需要自定义分页样式的场景

## 组件参数 (Props)
| 参数名   | 类型                  | 默认值                                   | 必填 | 说明                                                                 |
|----------|-----------------------|-----------------------------------------|------|--------------------------------------------------------------------|
| type     | 'default' \| 'unknown' | 'default'                              | 否   | 分页类型：default-标准分页，unknown-未知总页数分页                  |
| row      | number                | 10                                     | 否   | 每页显示数量                                                       |
| page     | number                | 1                                      | 否   | 当前页码                                                           |
| total    | number                | 0                                      | 否   | 总数据量（default模式）或每页最大数量（unknown模式）               |
| layout   | string                | 'prev, pager, next, sizes, total, jumper' | 否 | 分页布局元素                                                       |
| pageSizes| Array<number>         | [10, 20, 50, 100]                      | 否   | 每页显示数量可选值                                                 |

## 事件说明
| 事件名   | 说明                 | 回调参数                          |
|----------|----------------------|-----------------------------------|
| change   | 分页参数变化时触发   | 无                                |
| update:page | 当前页更新时触发 | 新的页码值                        |
| update:row | 每页数量更新时触发 | 新的每页数量值                    |

## 功能特性
- 双模式分页：标准分页/未知总页数分页
- 自动同步分页参数
- 支持自定义分页布局
- 集成页面跳转功能
- 智能分页按钮显示

## 使用示例
```vue
<template>
  <!-- 标准分页模式 -->
  <bt-pagination 
    :total="100" 
    v-model:page="currentPage" 
    v-model:row="pageSize"
  />

  <!-- 未知总页数模式 -->
  <bt-pagination
    type="unknown"
    :total="50"
    :row="currentRow"
    v-model:page="currentPage"
  />
</template>
```

## 样式定制
```scss
/* 修改分页按钮颜色 */
.el-pagination.is-background .el-pager li:not(.is-disabled).active {
  background-color: #20a53a;
}

/* 调整未知模式按钮间距 */
.bt-link {
  margin-right: 0.5rem;
}
```

## 注意事项
1. unknown模式需自行处理最后一页判断
2. 使用v-model需双向绑定page/row
3. 布局字符串需符合Element Plus规范
4. 分页切换会自动重置到第一页
5. 动态修改type需重置分页参数 