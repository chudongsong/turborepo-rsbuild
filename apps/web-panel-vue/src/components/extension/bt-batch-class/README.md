# 批量分类组件

## 功能说明
批量设置分类表单组件，支持动态配置分类选项和提交操作

## 使用场景
- 批量数据分类设置
- 资源归类操作
- 多选数据分类调整
- 需要表单验证的分类场景

## 组件参数 (Props)
| 参数名     | 类型                | 默认值            | 必填 | 说明                          |
|------------|---------------------|-------------------|------|-----------------------------|
| compData   |[BatchSetClassOptions](#batchsetclassoptions-数据结构)  | 见下方数据结构    | 是   | 组件配置数据                 |

### BatchSetClassOptions 数据结构
```ts
interface BatchSetClassOptions {
  name: string         // 分类名称标签
  options: Array<{     // 分类选项
    label: string
    value: string | number
  }>
  selectList: any[]   // 待分类数据列表
  request: (params: { id: number }, close: Function) => Promise<void> // 提交请求方法
}
```

## 方法说明
| 方法名     | 说明                 | 参数              |
|------------|----------------------|-------------------|
| onConfirm  | 表单提交验证方法     | close: 关闭弹窗回调函数 |

## 功能特性
- 动态分类选项配置
- 自动表单验证
- 分类请求封装
- 支持"全部"分类选项

## 使用示例
```vue
<template>
  <bt-batch-class 
    :comp-data="{
      name: '产品分类',
      options: [
        { label: '全部', value: 'all' },
        { label: '电子产品', value: 1 }
      ],
      selectList: selectedItems,
      request: submitClassification
    }"
  />
</template>
```

## 样式覆盖
```scss
/* 调整表单宽度 */
.el-form {
  min-width: 400px;
}

/* 修改选择器下拉样式 */
.el-select-dropdown__item {
  padding: 8px 20px;
}
```

## 注意事项
1. 需要传入有效的请求方法
2. 选项value为'all'时会转换为0提交
3. 需自行处理selectList数据源
4. 分类选项建议过滤掉无效值
5. 需配合弹窗组件使用 