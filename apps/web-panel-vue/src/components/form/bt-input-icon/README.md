# 图标输入框组件

## 功能说明
增强型输入框组件，支持图标按钮交互

## 使用场景
- 带操作按钮的输入框
- 搜索框场景
- 需要图标反馈的输入
- 密码可见切换场景

## 组件参数 (Props)
完整继承 Element Plus InputNumber 组件参数，参考：
https://element-plus.org/zh-CN/component/input-number.html
| 参数名     | 类型               | 默认值    | 说明                     |
|------------|--------------------|-----------|--------------------------|
| width      | string\|number    | '100%'    | 输入框宽度               |
| icon       | string            | ''        | 右侧图标名称             |
| isActive   | boolean           | false     | 初始是否激活图标按钮     |
| ...其他InputProps | -         | -       | 继承Element Plus Input属性 |



## 事件说明
| 事件名       | 说明                 | 回调参数       |
|--------------|----------------------|----------------|
| iconClick    | 点击图标时触发       | -              |
| focus        | 获取焦点时触发       | FocusEvent     |
| blur         | 失去焦点时触发       | FocusEvent     |

## 基本使用
```vue
<template>
  <bt-input-icon
    v-model="keyword"
    icon="search"
    @iconClick="handleSearch"
  />
</template>
```

## 样式覆盖
```scss
/* 修改图标按钮颜色 */
.bt-input-icon .el-input-group__append {
  background-color: #20a53a;
}

/* 调整图标大小 */
.bt-input-icon .bt-icon {
  font-size: 18px;
}
```

## 注意事项
1. 图标需预先注册
2. 激活状态会自动触发iconClick
3. 建议搭配防抖使用
4. 需要禁用图标按钮时可设置disabled
5. 复杂交互建议使用插槽 