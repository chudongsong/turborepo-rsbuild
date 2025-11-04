# 数字输入框组件

## 功能说明
基于 Element Plus InputNumber 的二次封装组件，提供数字输入功能

## 使用场景
- 数值输入场景
- 需要步进控制的输入
- 限制数值范围的输入
- 需要精度控制的输入

## 组件参数 (Props)
完整继承 Element Plus InputNumber 组件参数，参考：
https://element-plus.org/zh-CN/component/input-number.html

| 常用参数     | 类型       | 默认值    | 说明                     |
|--------------|------------|-----------|--------------------------|
| v-model      | number     | -         | 绑定值                   |
| min          | number     | -Infinity | 最小值                   |
| max          | number     | Infinity  | 最大值                   |
| step         | number     | 1         | 步长                     |
| precision    | number     | 0         | 数值精度                 |

## 事件说明
| 事件名       | 说明                 | 回调参数       |
|--------------|----------------------|----------------|
| change       | 值改变时触发         | 当前值         |
| blur         | 失去焦点时触发       | -              |

## 基本使用
```vue
<template>
  <bt-input-number
    v-model="num"
    :min="0"
    :max="100"
    :step="5"
  />
</template>
```

## 样式覆盖
```scss
/* 修改按钮颜色 */
.el-input-number__increase,
.el-input-number__decrease {
  background-color: #f5f7fa;
}

/* 调整输入框宽度 */
.el-input-number {
  width: 120px;
}
```

## 注意事项
1. 精度设置需与step匹配
2. 动态修改范围需重新校验值
3. 禁用状态需设置disabled为true
4. 移动端建议增大操作按钮
5. 需要格式化显示可使用formatter 