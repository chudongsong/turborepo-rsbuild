# 操作结果展示组件

## 功能说明
批量操作结果汇总展示组件

## 使用场景
- 批量操作结果汇总
- 成功/失败数据统计
- 操作结果明细展示

## 组件参数 (Props)
| 参数名    | 类型             | 默认值 | 必填 | 说明                     |
|-----------|------------------|--------|------|--------------------------|
| compData  | [ResultDataProps](#resultdataprops-数据结构) | -      | 是   | 结果数据及配置           |

### ResultDataProps 数据结构
```ts
interface ResultDataProps {
  resultData: AnyObject[] // 结果数据
  resultColumn?: TableColumnProps[] // 结果列
  resultTitle?: string // 结果标题
  autoTitle?: string // 自定义标题
}
```

## 功能特性
- 自动结果统计
- 可定制结果列
- 多状态颜色区分
- 响应式布局

## 使用示例
```vue
<template>
  <bt-result 
    :comp-data="resultData"
  />
</template>
```

## 注意事项
1. 数据格式需符合规范
2. 建议最多展示500条明细
3. 重要操作需保留结果日志 