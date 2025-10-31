# 批量操作确认组件

## 功能说明
批量操作确认及进度展示组件

## 使用场景
- 批量操作最终确认
- 操作进度实时展示
- 操作结果汇总显示

## 组件参数 (Props)
| 参数名    | 类型               | 默认值 | 必填 | 说明                     |
|-----------|--------------------|--------|------|--------------------------|
| compData  | [BatchOperationData](#batchoperationdata-数据结构) | -      | 是   | 批量操作数据及配置       |

### BatchOperationData 数据结构
```ts
interface BatchOperationData {
  type: 'execute' | 'complete' // 操作类型
  title: string // 标题
  content: string // 内容
  tablePageSelect: boolean // 表格选中数量
  tablePageExclude: AnyObject[] // 表格选中数量
  tableTotal: number // 表格选中数量
  data: Ref<AnyObject[]> // 表格数据
  column: TableColumnProps[] // 表格列
  batch: () => void // 批量操作 
  complete: () => void // 完成操作
}
```

## 功能特性
- 操作进度可视化
- 多状态图标反馈
- 自动完成检测
- 结果统计展示

## 使用示例
```vue
<template>
  <bt-table-batch-confirm 
    :comp-data="batchData"
  />
</template>
```

## 注意事项
1. 需与批量操作组件配合使用
2. 建议设置合理的超时时间
3. 大数据量需做分页展示 