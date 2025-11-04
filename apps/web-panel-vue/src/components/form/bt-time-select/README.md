# 时间选择组件

## 功能说明
基于 Element Plus TimeSelect 的二次封装组件，提供时间选择功能

## 使用场景
- 固定时间点选择
- 预约时间段选择
- 需要步长时间间隔的场景
- 限制可选时间范围

## 组件参数 (Props)
完整继承 Element Plus TimeSelect 组件参数，参考：
https://element-plus.org/zh-CN/component/time-select.html

| 常用参数     | 类型       | 默认值    | 说明                     |
|--------------|------------|-----------|--------------------------|
| v-model      | string     | -         | 绑定值                   |
| start        | string     | '09:00'   | 开始时间                 |
| end          | string     | '18:00'   | 结束时间                 |
| step         | string     | '00:30'   | 时间间隔                 |
| minTime      | string     | -         | 最早时间点               |
| maxTime      | string     | -         | 最晚时间点               |

## 事件说明
| 事件名       | 说明                 | 回调参数       |
|--------------|----------------------|----------------|
| change       | 值改变时触发         | 当前选中时间   |
| blur         | 失去焦点时触发       | -              |

## 基本使用
```vue
<template>
  <bt-time-select
    v-model="time"
    :start="'08:30'"
    :step="'00:15'"
    :end="'20:00'"
  />
</template>
```

## 样式覆盖
```scss
/* 修改选中时间颜色 */
.el-time-select-item.selected {
  color: #20a53a;
}

/* 调整下拉面板宽度 */
.el-time-select {
  width: 120px;
}
```

## 注意事项
1. 时间格式需符合HH:mm
2. 步长需能被60整除
3. 动态修改时间范围需重新渲染
4. 移动端建议使用原生时间控件
5. 需要禁用时间点可使用disabled-hours 