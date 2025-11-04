# 表格批量操作组件

## 功能说明
表格批量操作控制组件，支持多选操作和进度跟踪

## 使用场景
- 表格数据批量处理
- 需要进度反馈的批量操作
- 复杂数据批处理任务

## 组件参数 (Props)
| 参数名    | 类型                | 默认值 | 必填 | 说明                     |
|-----------|---------------------|--------|------|--------------------------|
| tableRef  | [TableRefProps](#tablerefprops-数据结构) | -      | 是   | 表格实例引用             |
| options   | [BatchOptionsProps](#batchoptionsprops-数据结构) | []     | 否   | 批量操作选项配置         |

### TableRefProps 数据结构
```ts
interface TableRefProps {
  getTable: () => void // 获取表格实例
  toggleAllSelection: () => void // 全选
  tablePageSelect: Ref<boolean> // 表格选中数量
  tablePageExclude: Ref<any> // 表格选中数量
  tableTotal: Ref<number> // 表格选中数量
  // 获取表格选中数据
  getTableSelect: () => {
    tableSelectNumber: Ref<number>
    tableSelectList: Ref<AnyObject[]>
    tablePageSelect: Ref<boolean> // 表格选中数量
    tablePageExclude: Ref<any> // 表格选中数量
    tableLimit: number
    tableTotal: Ref<number> // 表格选中数量
  }
  handleAllChange: (isCheckbox: boolean) => void // 全选
  clearAllSelect: () => void // 清空选择
}
```

### BatchOptionsProps 数据结构
```ts
interface BatchOptionsProps {
  label: string // 选项标签
  value: string // 选项值
}

## 功能特性
- 多选控制
- 操作进度跟踪
- 自动禁用状态
- 操作确认机制
- 错误重试支持

## 使用示例
```vue
<template>
  <bt-table-batch 
    :table-ref="tableInstance"
    :options="batchOptions"
  />
</template>
```

## 注意事项
1. 需配合支持多选的表格使用
2. 大数据量需做分页处理
3. 复杂操作建议使用Web Worker
4. 需要合理的错误处理机制 