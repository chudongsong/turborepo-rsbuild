# 表格组件

## 功能说明
增强型表格组件，支持多选、分页全选、自定义空状态等功能

## 使用场景
- 数据列表展示
- 多选数据操作
- 分页批量选择
- 复杂表格交互

## 组件参数 (Props)
| 参数名       | 类型                | 默认值 | 必填 | 说明                                                                 |
|--------------|---------------------|--------|------|--------------------------------------------------------------------|
| data        | Array<AnyObject>    | []     | 是   | 表格数据                                                           |
| column      | Array<TableColumnProps> | []  | 是   | 表格列配置，结构见下方 TableColumnProps                            |
| total       | number              | 0      | 否   | 总数据量（分页时使用）                                             |
| refreshTime | number              | 0      | 否   | 刷新时间戳（用于重置选择状态）                                     |
| description | string              | '暂无数据' | 否 | 空状态描述文字                                                   |

## 事件说明
| 事件名         | 说明                 | 回调参数                          |
|----------------|----------------------|-----------------------------------|
| selectionChange | 选中数据变化时触发   | 当前选中数据数组                  |
| sortChange     | 排序条件变化时触发   | { column, prop, order }          |

## 数据结构
```ts
interface TableColumnProps {
  prop: string          // 列字段名
  label: string         // 列标题
  isHide?: boolean      // 是否隐藏列
  isCustom?: boolean   // 是否自定义列
  isLtd?: boolean       // 是否显示LTD标识
  render?: (row: any, index: number, context: any) => VNode // 自定义单元格渲染
  headerRender?: (scope: any, context: any) => VNode // 自定义表头渲染
}
```

## 功能特性
- 支持全选/分页全选模式
- 自动维护选中状态
- 自定义空状态插槽
- 动态列显示控制
- 排序状态管理

## 使用示例
```vue
<template>
  <bt-table 
    :data="tableData" 
    :column="columns"
    @selectionChange="handleSelection"
  />
</template>

<script setup>
const columns = [
  { prop: 'name', label: '名称' },
  { 
    prop: 'status', 
    label: '状态',
    render: (row) => <span>{row.status ? '正常' : '禁用'}</span>
  }
]

const handleSelection = (selected) => {
  console.log('当前选中:', selected)
}
</script>
```

## 样式定制
```scss
/* 修改选中行背景色 */
.el-table__body tr.current-row > td {
  background-color: #f0f9eb;
}

/* 调整表头高度 */
.el-table__header th {
  height: 50px;
}
```

## 注意事项
1. 数据必须包含唯一标识字段（默认'id'）
2. 分页全选需自行处理数据获取
3. 动态列需使用v-if控制渲染
4. 大数据量建议启用虚拟滚动
5. 选中状态依赖keys_scopes_status字段 