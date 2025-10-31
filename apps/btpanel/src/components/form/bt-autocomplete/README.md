# 自动完成组件

## 功能说明
基于 Element Plus Autocomplete 的二次封装组件，提供输入建议功能

## 使用场景
- 搜索框联想建议
- 表单输入提示
- 需要异步加载选项的场景
- 大数据量输入建议

## 组件参数 (Props)
完整继承 Element Plus Autocomplete 组件参数，参考：
https://element-plus.org/zh-CN/component/autocomplete.html

| 常用参数     | 类型       | 默认值    | 说明                     |
|--------------|------------|-----------|--------------------------|
| v-model      | string     | -         | 绑定值                   |
| fetchSuggestions | function | -      | 获取建议的方法           |
| placeholder  | string     | '请输入'  | 占位文本                 |
| valueKey     | string     | 'value'   | 建议项显示字段           |
| debounce     | number     | 300       | 输入延迟(ms)            |

## 事件说明
| 事件名       | 说明                 | 回调参数       |
|--------------|----------------------|----------------|
| select       | 选中建议项时触发     | 选中项         |
| change       | 输入值变化时触发     | 当前输入值     |

## 基本使用
```vue
<template>
  <bt-autocomplete
    v-model="query"
    :fetch-suggestions="fetchSuggestions"
    @select="handleSelect"
  />
</template>
```

## 样式覆盖
```scss
/* 修改建议项悬停背景色 */
.el-autocomplete-suggestion__list li:hover {
  background-color: #f5f7fa;
}

/* 调整输入框宽度 */
.el-autocomplete {
  width: 300px;
}
```

## 注意事项
1. fetchSuggestions需返回Promise
2. 大数据量建议做分页处理
3. 防抖时间根据接口性能调整
4. 需要处理空值状态
5. 建议项高度不宜超过屏幕高度 