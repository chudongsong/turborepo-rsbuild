# 级联面板组件

## 功能说明
基于 Element Plus CascaderPanel 的二次封装组件，用于多级数据选择

## 使用场景
- 多级分类选择
- 地区选择
- 需要面板样式的级联选择
- 大数据量级联选择

## 组件参数 (Props)
完整继承 Element Plus CascaderPanel 组件参数，参考：
https://element-plus.org/zh-CN/component/cascader.html#cascaderpanel-属性

| 常用参数     | 类型       | 默认值    | 说明                     |
|--------------|------------|-----------|--------------------------|
| options      | array      | []        | 级联数据                 |
| props        | object     | -         | 配置选项                 |
| modelValue   | array      | []        | 选中值                   |
| showAllLevels| boolean    | true      | 是否显示完整路径         |

## 事件说明
| 事件名       | 说明                 | 回调参数       |
|--------------|----------------------|----------------|
| change       | 值改变时触发         | 当前选中值数组 |
| expand-change| 面板展开节点变化时触发 | 各父级节点值数组 |

## 基本使用
```vue
<template>
  <bt-cascader-panel 
    :options="regionData" 
    v-model="selectedRegion"
  />
</template>
```

## 样式覆盖
```scss
/* 修改选中项颜色 */
.el-cascader-node.in-active-path,
.el-cascader-node.is-active {
  color: #20a53a;
}

/* 调整面板宽度 */
.el-cascader-panel {
  width: 400px;
}
```

## 注意事项
1. 数据需符合级联结构
2. 大数据量建议使用虚拟滚动
3. 动态更新options需重新渲染
4. 可配置props控制字段映射
5. 需要完整路径时保持showAllLevels为true 