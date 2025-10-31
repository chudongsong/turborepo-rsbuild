# 级联选择器组件

## 功能说明
基于 Element Plus Cascader 的二次封装组件，支持多级数据选择

## 使用场景
- 多层级数据选择
- 商品分类选择
- 需要搜索功能的级联选择
- 可配置的动态选项

## 组件参数 (Props)
完整继承 Element Plus Cascader 组件参数，参考：
https://element-plus.org/zh-CN/component/cascader.html#cascader-属性

| 常用参数     | 类型       | 默认值    | 说明                     |
|--------------|------------|-----------|--------------------------|
| options      | array      | []        | 级联数据                 |
| props        | object     | -         | 配置选项                 |
| showAllLevels| boolean    | true      | 是否显示完整路径         |
| filterable   | boolean    | false     | 是否可搜索               |
| separator    | string     | '/'       | 选项分隔符               |

## 事件说明
| 事件名       | 说明                 | 回调参数       |
|--------------|----------------------|----------------|
| change       | 值改变时触发         | 当前选中值数组 |
| expand-change| 展开节点变化时触发   | 各父级节点值数组 |

## 基本使用
```vue
<template>
  <bt-cascader
    v-model="selected"
    :options="options"
    :props="{ expandTrigger: 'hover' }"
  />
</template>
```

## 样式覆盖
```scss
/* 修改输入框圆角 */
.el-cascader {
  --el-border-radius-base: 4px;
}

/* 调整下拉面板最大高度 */
.el-cascader__dropdown {
  max-height: 400px;
}
```

## 注意事项
1. 数据需符合级联结构
2. 搜索功能需设置filterable为true
3. 动态加载数据需使用lazy方法
4. 建议级联层级不超过5层
5. 移动端建议使用弹窗选择模式 