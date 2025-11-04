# 增强对话框组件

## 功能说明
基于Element Plus Dialog的增强型对话框组件，支持全屏、最小化、动态内容加载等功能

## 使用场景
- 需要复杂交互的弹窗
- 全屏/可最小化弹窗需求
- 动态加载异步组件
- 需要自适应高度的弹窗

## 组件参数 (Props)
| 参数名          | 类型                  | 默认值       | 必填 | 说明                                                                 |
|-----------------|-----------------------|--------------|------|--------------------------------------------------------------------|
| title           | string \| boolean     | ''           | 否   | 标题内容，传false时隐藏标题                                        |
| customClass     | string                | ''           | 否   | 自定义对话框类名                                                   |
| area            | Array\|number\|string | ['auto','auto'] | 否 | 弹窗尺寸 [宽度, 高度]，支持数字(px)、字符串(百分比/rem)和'auto'    |
| confirmText     | string                | '确定'       | 否   | 确认按钮文本                                                       |
| cancelText      | string                | '取消'       | 否   | 取消按钮文本                                                       |
| component       | Component             | -            | 否   | 动态加载的组件                                                     |
| compData        | object                | {}           | 否   | 传递给动态组件的参数                                               |
| showFooter      | boolean               | false        | 否   | 是否显示底部操作栏                                                 |
| contentText     | string                | ''           | 否   | 简单文本内容                                                       |
| confirmBtnType  | string                | ''           | 否   | 确认按钮类型(primary/success/warning/danger等)                     |
| showClose       | boolean               | true         | 否   | 是否显示关闭按钮                                                   |
| modal           | boolean               | true         | 否   | 是否显示遮罩层                                                     |
| isFullScreen    | boolean               | false        | 否   | 是否显示全屏控制按钮                                               |
| closeBtn        | number                | 1            | 否   | 关闭按钮位置：1=内部右上角，2=外部右上角                          |

## 事件说明
| 事件名   | 说明                 | 回调参数       |
|----------|----------------------|----------------|
| open     | 弹窗打开时触发       | 无             |
| close    | 弹窗关闭时触发       | 无             |
| cancel   | 点击取消按钮时触发   | close函数      |
| confirm  | 点击确认按钮时触发   | close函数      |
| resize   | 弹窗尺寸变化时触发   | 无             |
| refresh  | 需要刷新内容时触发   | 无             |

## 功能特性
- 支持全屏/最小化切换
- 动态组件加载
- 自适应内容高度
- 多类型按钮支持
- 响应式布局
- 拖拽功能

## 使用示例
```vue
<template>
  <bt-dialog 
    title="用户详情"
    :area="[800, '60vh']"
    :component="UserDetail"
    :comp-data="{ userId: 123 }"
    @confirm="handleConfirm"
  />
</template>
```

## 样式覆盖
```scss
/* 修改标题样式 */
.el-dialog__header {
  padding: 1rem 1.5rem;
  background: #f5f7fa;
}

/* 调整全屏按钮颜色 */
.svgtofont-el-fullscreen-expand {
  color: #20a53a;
}

/* 自定义最小化窗口样式 */
.dialog-minimize {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
```

## 注意事项
1. 动态组件需使用defineAsyncComponent加载
2. 全屏模式需设置isFullScreen为true
3. 高度自适应需设置area为'auto'
4. 移动端需额外处理拖拽功能
5. 复杂内容建议使用component参数传入组件
6. 需注意弹窗层级(z-index)管理 