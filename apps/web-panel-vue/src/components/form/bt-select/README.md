# 选择器组件

## 功能说明
增强型选择器组件，支持自定义选项渲染和状态显示

## 使用场景
- 下拉选择场景
- 需要自定义选项样式的选择
- 状态标识选项
- 多选分组场景

## 组件参数 (Props)
| 参数名     | 类型               | 默认值    | 必填 | 说明                          |
|------------|--------------------|-----------|------|-----------------------------|
| options    | Array<SelectOptionProps \| SelectCustomProps> | [] | 否 | 选项配置数组                 |
| disabled   | boolean            | false     | 否   | 是否禁用                     |
| multiple   | boolean            | false     | 否   | 是否多选                     |

### SelectOptionProps 结构
```ts
interface SelectOptionProps {
  label: string    // 显示文本
  value: any       // 选项值
  disabled?: boolean // 是否禁用
}

interface SelectCustomProps {
  label: string
  value: any
  render: (item: any, index: number) => VNode // 自定义渲染函数
  isStatus?: 'success' | 'warning' | 'error' // 状态标识
}
```

## 事件说明
| 事件名       | 说明                 | 回调参数       |
|--------------|----------------------|----------------|
| change       | 值改变时触发         | 当前选中值     |

## 基本使用
```vue
<template>
  <bt-select
    v-model="selected"
    :options="[
      { label: '选项1', value: 1 },
      { label: '选项2', value: 2, isStatus: 'success' }
    ]"
  />
</template>
```

## 样式覆盖
```scss
/* 修改多选标签颜色 */
.el-select__tags .el-tag {
  background-color: #20a53a;
}

/* 调整选项间距 */
.el-select-dropdown__item {
  padding: 8px 20px;
}
```

## 注意事项
1. 自定义渲染需使用render函数
2. 状态标识颜色可全局配置
3. 大数据量建议使用虚拟滚动版本
4. 动态更新options需重新渲染
5. 多选时建议设置最大显示标签数 