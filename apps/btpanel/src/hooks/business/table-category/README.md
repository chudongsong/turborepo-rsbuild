# useTableCategory 钩子

## 功能说明
用于管理表格数据分类功能，支持动态分类管理和CRUD操作

## 使用场景
- 表格数据分类展示
- 需要动态分类管理的场景
- 支持分类增删改查操作
- 多维度数据分类需求

## 核心特性
- 动态分类加载
- 分类CRUD操作
- 分类状态同步
- 自动刷新表格数据
- 分类过滤控制

## 参数配置
| 参数名       | 类型                  | 必填 | 说明                     |
|--------------|-----------------------|------|--------------------------|
| key          | string                | 否   | 分类标识符               |
| name         | string                | 是   | 分类显示名称             |
| options      | [CategoryOptionsProps](#categoryoptionsprops-类型)[] | 是  | 分类选项数组或获取函数    |
| event        | [CategoryEventProps](#categoryeventprops-类型)    | 是   | 分类操作事件对象         |
| ignore       | string[]              | 否   | 忽略的分类值             |
| field        | string                | 否   | 分类字段名（默认'ps'）   |
| showEdit     | boolean               | 否   | 是否显示编辑按钮         |

### CategoryOptionsProps 类型
```typescript
interface CategoryOptionsProps {
  label: string  // 分类显示名称
  value: string  // 分类值
}
``` 

### CategoryEventProps 类型
```typescript
interface CategoryEventProps {
  get: () => Promise<SelectOptionProps[]>  // 获取分类列表
  add: (params: { ps: string }) => Promise<ResponseResult>  // 新增分类
  update: (params: { id: number; ps: string }) => Promise<ResponseResult>  // 更新分类
  delete: (params: { id: number }) => Promise<ResponseResult>  // 删除分类
}
```

## 返回值
| 属性名        | 类型               | 说明                     |
|---------------|--------------------|--------------------------|
| BtTableCategory | RenderFunction     | 分类组件渲染函数         |
| classList     | Ref<CategoryOptionsProps[]> | 当前分类列表       |
| categoryRef   | Ref                | 分类组件实例引用         |

## 使用示例
```typescript
// 在表格页面组件中
const { BtTableCategory, classList } = useTableCategory({
  name: '项目分类',
  options: [],
  event: {
    get: fetchCategories,
    add: createCategory,
    update: updateCategory,
    delete: deleteCategory
  },
  showEdit: true
})

// 模板中使用
return () => (
  <div>
    <BtTableCategory />
    <ElTable ref={tableRef} />
  </div>
)
```

## 工作原理
1. 初始化分类选项
2. 绑定表格实例和参数
3. 监听分类变化自动刷新表格
4. 处理分类CRUD操作
5. 同步分类状态到表格

## 样式定制
```scss
/* 分类选择器 */
.table-category-select {
  margin-bottom: 16px;
  
  .el-select {
    width: 240px;
  }
}

/* 分类操作按钮 */
.category-actions {
  margin-left: 8px;
}
```

## 最佳实践
1. 分类名称保持简洁明确
2. 复杂分类使用异步加载
3. 删除操作需二次确认
4. 分类变更记录操作日志
5. 移动端适配分类选择器

## 注意事项
1. 需要绑定有效的表格实例
2. 分类值需保持唯一
3. 分页参数需与分类联动
4. 分类操作需处理错误情况
5. 大量分类需做虚拟滚动优化
6. 需要合理控制分类层级深度 