# 日期选择器组件

## 功能说明
基于 Element Plus DatePicker 的二次封装组件，支持多种日期格式选择

## 使用场景
- 日期范围选择
- 日期时间选择
- 需要快捷选项的日期选择
- 国际化日期格式需求

## 组件参数 (Props)
完整继承 Element Plus DatePicker 组件参数，参考：
https://element-plus.org/zh-CN/component/date-picker.html

| 常用参数     | 类型       | 默认值       | 说明                     |
|--------------|------------|--------------|--------------------------|
| v-model      | Date/Array | -            | 绑定值                   |
| type         | string     | 'date'       | 类型(date/dates/datetime/datetimerange/daterange/month) |
| format       | string     | 'YYYY-MM-DD' | 显示格式                 |
| value-format | string     | 'timestamp'  | 绑定值格式               |
| placeholder  | string     | '请选择日期' | 占位文本                 |

## 事件说明
| 事件名       | 说明                 | 回调参数       |
|--------------|----------------------|----------------|
| change       | 值改变时触发         | 格式化后的值   |
| blur         | 失去焦点时触发       | -              |

## 基本使用
```vue
<template>
  <bt-date-picker 
    v-model="date" 
    type="daterange" 
    format="YYYY/MM/DD"
  />
</template>
```

## 样式覆盖
```scss
/* 修改选中日期背景色 */
.el-date-table td.current:not(.disabled) span {
  background: #20a53a;
}

/* 调整输入框宽度 */
.el-date-editor {
  width: 240px;
}
```

## 注意事项
1. 日期格式需与value-format匹配
2. 范围选择时v-model应为数组
3. 国际化需配置全局语言
4. 移动端建议使用原生日期控件
5. 禁用日期需使用disabledDate方法 