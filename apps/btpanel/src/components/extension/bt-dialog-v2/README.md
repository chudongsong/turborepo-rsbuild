# 增强对话框组件 V2

## 功能说明
第二代增强型对话框组件，支持全屏、最小化、拖拽、动态组件加载等功能

## 使用场景
- 需要复杂交互的弹窗
- 可拖拽/可调整大小的弹窗
- 全屏/最小化视图切换
- 需要动态加载内容的弹窗

## 组件参数 (Props)
| 参数名          | 类型                  | 默认值       | 必填 | 说明                                                                 |
|-----------------|-----------------------|--------------|------|--------------------------------------------------------------------|
| title           | string \| boolean     | ''           | 否   | 标题内容，传false时隐藏标题                                        |
| area            | [string, string]      | ['40%','40%']| 否   | 初始尺寸 [宽度, 高度]，支持百分比/rem/px                           |
| modal           | boolean               | false        | 否   | 是否显示遮罩层                                                     |
| modelValue      | boolean               | false        | 是   | 控制弹窗显示/隐藏                                                  |
| component       | string\|Component     | ''           | 是   | 动态加载的组件                                                     |
| compData        | object                | {}           | 否   | 传递给动态组件的参数                                               |
| fullscreen      | boolean               | false        | 否   | 是否初始全屏显示                                                   |
| draggable       | boolean               | false        | 否   | 是否可拖拽                                                         |
| footer          | boolean               | false        | 否   | 是否显示底部操作按钮                                               |
| zIndex          | number                | 999          | 否   | 弹窗层级                                                           |
| customClass     | string                | ''           | 否   | 自定义类名                                                         |
| closeBtn        | 'one' \| 'two'        | 'one'        | 否   | 关闭按钮类型：one=圆形按钮，two=方形按钮                          |
| onClose         | Function              | () => {}     | 否   | 关闭回调函数                                                       |
| onCancel        | Function              | () => {}     | 否   | 取消按钮回调                                                       |
| onConfirm       | Function              | () => {}     | 否   | 确认按钮回调                                                       |
| cancelText      | string                | '取消'       | 否   | 取消按钮文本                                                       |
| confirmText     | string                | '确定'       | 否   | 确认按钮文本                                                       |

## 事件说明
| 事件名   | 说明                 | 回调参数       |
|----------|----------------------|----------------|
| close    | 弹窗关闭时触发       | 无             |
| cancel   | 点击取消按钮时触发   | 无             |
| confirm  | 点击确认按钮时触发   | 无             |

## 功能特性
- 全屏/最小化/恢复视图切换
- 可拖拽标题栏
- 自适应窗口大小
- 动态组件加载
- 多类型关闭按钮
- 响应式布局

## 使用示例
```vue
<template>
  <bt-dialog-v2 
    title="系统设置"
    :component="SettingsPanel"
    :area="['50%', '60vh']"
    :draggable="true"
    v-model="dialogVisible"
  />
</template>
```

## 样式覆盖
```scss
/* 修改标题栏样式 */
.bt-dialog-header {
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

/* 调整全屏按钮颜色 */
.svgtofont-icon-max-black {
  color: #20a53a;
}

/* 自定义最小化窗口 */
.dialog-minimize {
  background: #ffffff;
  border: 1px solid #e4e7ed;
}
```

## 注意事项
1. 动态组件需全局注册或使用defineAsyncComponent
2. 拖拽功能需设置draggable为true
3. 全屏状态不可拖拽
4. 最小化窗口位置需自行管理
5. 复杂内容建议使用component参数传入
6. 需注意多弹窗层级管理
7. 移动端需额外处理触控事件 