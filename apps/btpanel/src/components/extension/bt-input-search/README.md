# 增强搜索输入框组件

## 功能说明
集成Element Plus Input和Popover的增强搜索组件，支持搜索提示和快捷操作

## 使用场景
- 带建议的搜索输入
- 需要快捷清除的搜索场景
- 结合弹出层展示搜索历史/建议
- 需要回车触发的搜索功能

## 组件参数 (Props)
| 参数名           | 类型      | 默认值  | 必填 | 说明                                                                 |
|-------------------|-----------|---------|------|--------------------------------------------------------------------|
| modelValue        | string    | ''      | 是   | 输入框绑定值                                                       |
| disabledPopover   | boolean   | true    | 否   | 是否禁用弹出层功能                                                 |
| clearable         | boolean   | true    | 否   | 是否显示清除按钮                                                   |
| ...其他InputProps | -         | -       | -    | 支持所有Element Plus Input属性                                     |

## 事件说明
| 事件名   | 说明                 | 回调参数       |
|----------|----------------------|----------------|
| search   | 触发搜索时触发       | 当前搜索值     |
| focus    | 输入框聚焦时触发     | FocusEvent     |
| blur     | 输入框失焦时触发     | FocusEvent     |

## 插槽说明
| 插槽名   | 说明                 | 作用域参数       |
|----------|----------------------|------------------|
| default  | 弹出层内容区域       | -                |
| append   | 输入框后置内容       | -                |

## 功能特性
- 回车键自动搜索
- 一键清除搜索内容
- 智能焦点管理
- 可定制的弹出层内容
- 集成Element Plus Input所有功能

## 使用示例
```vue
<template>
  <!-- 基础用法 -->
  <bt-input-search 
    v-model="keyword" 
    :disabled-popover="false"
    @search="handleSearch"
  >
    <div class="p-4">搜索建议内容...</div>
  </bt-input-search>

  <!-- 自定义搜索按钮 -->
  <bt-input-search v-model="keyword">
    <template #append>
      <i class="custom-search-icon"></i>
    </template>
  </bt-input-search>
</template>
```

## 样式覆盖
```scss
/* 修改搜索按钮颜色 */
.bt-button {
  background-color: #20a53a;
  color: white;
}

/* 调整弹出层样式 */
.el-popover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
```

## 注意事项
1. 需要Element Plus作为基础组件库
2. 弹出层内容需自行管理显隐逻辑
3. 大量搜索建议需做虚拟滚动优化
4. 移动端需额外处理触控事件
5. 复杂场景建议使用组合式API封装
6. 避免在表单中嵌套使用 