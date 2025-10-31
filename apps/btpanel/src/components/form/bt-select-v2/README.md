# 虚拟选择器组件

## 功能说明
基于 Element Plus SelectV2 的二次封装组件，支持大数据量的虚拟滚动

## 使用场景
- 大数据量选项(1万+)
- 需要高性能滚动的场景
- 远程搜索加载数据
- 需要自定义选项模板

## 组件参数 (Props)
完整继承 Element Plus SelectV2 组件参数，参考：
https://element-plus.org/zh-CN/component/select-v2.html

| 常用参数     | 类型       | 默认值    | 说明                     |
|--------------|------------|-----------|--------------------------|
| options      | array      | []        | 选项数据                 |
| modelValue   | any        | -         | 绑定值                   |
| filterable   | boolean    | false     | 是否可搜索               |
| remote       | boolean    | false     | 是否远程搜索             |
| loading      | boolean    | false     | 是否加载中               |

## 事件说明
| 事件名       | 说明                 | 回调参数       |
|--------------|----------------------|----------------|
| change       | 值改变时触发         | 当前选中值     |
| visible-change | 下拉框显示/隐藏时触发 | 显示状态       |

## 基本使用
```vue
<template>
  <bt-select-v2
    v-model="selected"
    :options="options"
    filterable
  />
</template>
```

## 样式覆盖
```scss
/* 修改选中项颜色 */
.el-select-v2__option.is-selected {
  color: #20a53a;
}

/* 调整下拉面板最大高度 */
.el-select-v2__dropdown {
  max-height: 400px;
}
```

## 注意事项
1. 大数据量需使用虚拟滚动
2. 远程搜索需设置remote为true
3. 动态更新options需重新渲染
4. 需要自定义模板时使用插槽
5. 移动端建议使用原生选择器 