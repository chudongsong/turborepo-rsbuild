# 时间选择器组件

## 功能说明
基于 Element Plus TimePicker 的二次封装组件，支持时间范围选择

## 使用场景
- 时间段选择
- 任意时间点选择
- 需要显示秒数的场景
- 国际化时间格式需求

## 组件参数 (Props)
完整继承 Element Plus TimePicker 组件参数，参考：
https://element-plus.org/zh-CN/component/time-picker.html

| 常用参数     | 类型       | 默认值       | 说明                     |
|--------------|------------|--------------|--------------------------|
| v-model      | Date/Array | -            | 绑定值                   |
| format       | string     | 'HH:mm:ss'   | 显示格式                 |
| value-format | string     | 'HH:mm:ss'   | 绑定值格式               |
| rangeSeparator | string  | '-'         | 范围分隔符               |

## 事件说明
| 事件名       | 说明                 | 回调参数       |
|--------------|----------------------|----------------|
| change       | 值改变时触发         | 当前选中时间   |
| blur         | 失去焦点时触发       | -              |

## 基本使用
```vue
<template>
  <bt-time-picker
    v-model="timeRange"
    is-range
    range-separator="至"
  />
</template>
```

## 样式覆盖
```scss
/* 修改选中时间背景色 */
.el-time-panel__btn.confirm {
  color: #20a53a;
}

/* 调整输入框宽度 */
.el-time-picker {
  width: 200px;
}
```

## 注意事项
1. 范围选择时v-model应为数组
2. 格式需与value-format匹配
3. 需要禁用时间段可使用disabled-hours
4. 移动端建议使用原生时间控件
5. 国际化需配置全局语言 