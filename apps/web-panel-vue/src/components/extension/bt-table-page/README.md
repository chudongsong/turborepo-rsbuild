# 分页组件

## 功能说明
增强型分页组件，支持标准分页和简化分页两种模式，提供本地存储功能

## 使用场景
- 标准表格分页需求
- 简化分页展示场景
- 需要记住用户分页偏好的情况

## 组件参数 (Props)
| 参数名       | 类型                | 默认值             | 必填 | 说明                                                                 |
|--------------|---------------------|--------------------|------|--------------------------------------------------------------------|
| v-model:row          | number              | 10                 | 是   | 分页显示数量（默认模式）/当前页数量（简化模式）                     |
| v-model:page         | number              | 1                  | 是   | 当前页码                                                           |
| v-model:total         | number              | 0                  | 是   | 总数（默认模式）/每页最多显示数量（简化模式）                       |
| type         | 'default' \| 'unknown' | 'default'         | 否   | 分页类型：default-标准分页，unknown-简化分页                       |
| name         | string              | 'row'              | 否   | 本地存储标识名称                                                   |
| layout       | string              | 'prev, pager, next, sizes, total, jumper' | 否 | 分页布局配置 |
| rowList      | number[]            | [10, 20, 50, 100]  | 否   | 可选分页大小列表                                                   |
| useStorage   | boolean             | true               | 否   | 是否使用本地存储                                                   |

## 事件说明
| 事件名 | 说明                 | 回调参数               |
|--------|----------------------|------------------------|
| change | 分页参数改变时触发   | (page: number, row: number) |

## 功能特性
- 双模式分页支持
- 分页状态本地存储
- 响应式参数更新
- 自动计算最后一页
- 兼容Element Plus分页样式

## 使用示例
```vue
<template>
  <!-- 标准分页模式 -->
  <bt-table-page 
    v-model:row="pageSize" 
    v-model:page="currentPage"
    :total="totalItems"
  />

  <!-- 简化分页模式 -->
  <bt-table-page
    type="unknown"
    v-model:row="currentItems"
    v-model:page="currentPage"
    :total="maxPerPage"
  />
</template>
```

## 样式覆盖
```scss
/* 调整分页输入框内边距 */
:deep(.el-pagination .el-input__inner) {
  padding: 0 8px !important;
}

/* 简化模式按钮样式 */
.bt-link {
  min-width: 60px;
  margin: 0 4px;
  border-radius: 4px;
  transition: all 0.3s;
  
  &:hover {
    background: #f5f7fa;
  }
}
```

## 注意事项
1. 简化模式需自行处理分页逻辑
2. 本地存储使用sessionStorage
3. 分页名称(name)建议唯一
4. 大数据量时建议关闭本地存储
5. 简化模式需满足：当row >= total时显示"下一页"按钮
6. 需要IE兼容时需添加storage polyfill 