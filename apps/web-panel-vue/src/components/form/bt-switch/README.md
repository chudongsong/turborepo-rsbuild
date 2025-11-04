# 开关组件

## 功能说明
基于 Element Plus Switch 的二次封装组件，提供状态切换功能

## 使用场景
- 状态切换控制
- 功能开关设置
- 需要显示自定义值的场景
- 需要加载状态的切换操作

## 组件参数 (Props)
完整继承 Element Plus Switch 组件参数，参考：
https://element-plus.org/zh-CN/component/switch.html

| 常用参数     | 类型       | 默认值    | 说明                     |
|--------------|------------|-----------|--------------------------|
| v-model      | boolean    | -         | 绑定值                   |
| activeText   | string     | -         | 打开时的文字描述         |
| inactiveText | string     | -         | 关闭时的文字描述         |
| loading      | boolean    | false     | 是否显示加载中状态       |
| beforeChange | function   | -         | 切换前回调函数           |

## 事件说明
| 事件名       | 说明                 | 回调参数       |
|--------------|----------------------|----------------|
| change       | 值改变时触发         | 当前状态值     |

## 基本使用
```vue
<template>
  <bt-switch
    v-model="status"
    active-text="启用"
    inactive-text="停用"
  />
</template>
```

## 样式覆盖
```scss
/* 修改激活状态颜色 */
.el-switch.is-checked .el-switch__core {
  border-color: #20a53a;
  background-color: #20a53a;
}

/* 调整文字间距 */
.el-switch__label {
  margin: 0 8px;
}
```

## 注意事项
1. 需要处理异步操作时使用beforeChange
2. 文字描述建议不超过4个汉字
3. 加载状态需手动控制
4. 移动端建议增大点击区域
5. 需要自定义样式可使用插槽 