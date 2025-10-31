# useTableBatch 钩子

## 功能说明
用于管理表格批量操作功能，提供批量操作组件的注册和集成

## 使用场景
- 表格多选操作场景
- 需要批量处理数据的页面
- 需要统一管理批量操作逻辑的场景

## 核心特性
- 自动绑定表格实例
- 动态操作项管理
- 操作状态同步
- 多选数据管理

## 参数配置
| 参数名       | 类型                   | 必填 | 说明                     |
|--------------|------------------------|------|--------------------------|
| options      | [TableBatchOptionsProps](#tablebatchoptionsprops-类型)[] | 是  | 批量操作配置项数组       |

### TableBatchOptionsProps 类型
```typescript
interface TableBatchOptionsProps {
  label: string       // 操作项显示文本
  value: string       // 操作项唯一标识
  icon?: string       // 操作项图标
  disabled?: boolean  // 是否禁用
  event: (selection: any[]) => void // 操作处理函数
}
```

## 返回值
| 属性名        | 类型               | 说明                     |
|---------------|--------------------|--------------------------|
| BtTableBatch  | RenderFunction     | 批量操作组件渲染函数     |

## 使用示例
```typescript
// 在表格页面组件中
import { useTableBatch } from '@/hooks/business/table-batch'

// 定义批量操作项
const batchOptions = [
  {
    label: '批量删除',
    value: 'delete',
    event: (batchOptions: TableBatchDialogProps, nextAll: TableBatchNextAllProps, selectList: Ref<T[]>, options: TableBatchOptionsProps, clearSelection?: AnyFunction, tablePageSelect?: TableBatchPageSelectProps) => handleBatchDelete(selection)
  },
  {
    label: '批量导出',
    value: 'export',
    event: (selection) => handleBatchExport(selection)
  }
]

// 注册批量操作
const { BtTableBatch } = useTableBatch({ options: batchOptions })


// 在模板中使用
return () => (
  <div>
    <ElTable ref={tableRef} />
    <BtTableBatch />
  </div>
)
```

## 工作原理
1. 实例化批量操作组件
2. 注册表格实例
3. 监听表格选择状态变化
4. 动态渲染操作按钮
5. 处理批量操作逻辑
6. 同步操作状态到表格

## 样式定制
```scss
/* 批量操作容器 */
.table-batch-container {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 16px;

  /* 操作按钮 */
  .batch-button {
    margin-right: 8px;
    padding: 8px 16px;
  }
}
```

## 最佳实践
1. 复杂操作建议使用异步处理
2. 禁用状态需明确提示原因
3. 大数据量操作添加加载状态
4. 危险操作需二次确认
5. 操作结果需明确反馈

## 注意事项
1. 需配合支持多选的表格使用
2. 表格需设置row-key属性
3. 操作项handler需处理异常
4. 分页切换需清空选择
5. 移动端需优化操作栏布局
6. 需要合理控制批量操作数据量 