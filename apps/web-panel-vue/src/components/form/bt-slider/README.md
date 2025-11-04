# 滑块组件

## 功能说明
基于 Element Plus Slider 的二次封装组件，提供数值范围选择功能

## 使用场景
- 数值范围选择
- 音量/亮度调节
- 需要显示输入值的场景
- 需要分段显示的数值选择

## 组件参数 (Props)
完整继承 Element Plus Slider 组件参数，参考：
https://element-plus.org/zh-CN/component/slider.html

| 常用参数     | 类型       | 默认值    | 说明                     |
|--------------|------------|-----------|--------------------------|
| v-model      | number/array | -      | 绑定值                   |
| min          | number     | 0         | 最小值                   |
| max          | number     | 100       | 最大值                   |
| step         | number     | 1         | 步长                     |
| showStops    | boolean    | false     | 是否显示间断点           |
| range        | boolean    | false     | 是否为范围选择           |

## 事件说明
| 事件名       | 说明                 | 回调参数       |
|--------------|----------------------|----------------|
| change       | 值改变时触发         | 当前值         |
| input        | 拖拽时实时触发       | 实时值         |

## 基本使用
```vue
<template>
  <bt-slider
    v-model="value"
    :min="0"
    :max="100"
    :step="10"
    show-stops
  />
</template>
```

## 样式覆盖
```scss
/* 修改滑块颜色 */
.el-slider__bar {
  background-color: #20a53a;
}

/* 调整滑块大小 */
.el-slider__button {
  width: 16px;
  height: 16px;
}
```

## 注意事项
1. 范围选择时v-model应为数组
2. 步长需能被(max-min)整除
3. 动态修改范围需重新渲染
4. 移动端建议增大滑块尺寸
5. 需要显示输入框时设置show-input 