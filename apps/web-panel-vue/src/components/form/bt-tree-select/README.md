# 树选择组件

## 功能说明
基于 Element Plus TreeSelect 的二次封装组件，支持树形结构数据选择

## 使用场景
- 层级数据选择
- 部门/组织架构选择
- 需要搜索的树形选择
- 多选树形结构场景

## 组件参数 (Props)
完整继承 Element Plus TreeSelect 组件参数，参考：
https://element-plus.org/zh-CN/component/tree-select.html

| 常用参数     | 类型       | 默认值    | 说明                     |
|--------------|------------|-----------|--------------------------|
| data         | array      | []        | 树形数据                 |
| props        | object     | -         | 配置选项                 |
| multiple     | boolean    | false     | 是否多选                 |
| checkStrictly | boolean  | false     | 是否严格遵循父子不互相关联 |
| filterable   | boolean    | false     | 是否可搜索               |

## 事件说明
| 事件名       | 说明                 | 回调参数       |
|--------------|----------------------|----------------|
| change       | 选中值变化时触发     | 当前选中值     |
| visible-change | 下拉框显示/隐藏时触发 | 显示状态       |

## 基本使用
```vue
<template>
  <bt-tree-select
    v-model="selected"
    :data="treeData"
    :props="{ label: 'name', children: 'children' }"
  />
</template>
```

## 样式覆盖
```scss
/* 修改选中项颜色 */
.el-tree-node.is-current > .el-tree-node__content {
  color: #20a53a;
}

/* 调整下拉面板宽度 */
.el-tree-select__popper {
  width: 300px;
}
```

## 注意事项
1. 数据需符合树形结构
2. 大数据量建议使用虚拟滚动
3. 多选时建议设置checkStrictly为true
4. 动态更新数据需重新渲染组件
5. 移动端建议使用弹窗选择模式 