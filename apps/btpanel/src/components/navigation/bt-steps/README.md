# 步骤条组件

## 功能说明
基于 Element Plus Steps 的二次封装组件，支持流程步骤展示

## 使用场景
- 多步骤表单流程
- 订单状态跟踪
- 任务进度展示
- 需要自定义图标的步骤条

## 组件参数 (Props)
完整继承 Element Plus Steps 组件参数，参考：
https://element-plus.org/zh-CN/component/steps.html

| 常用参数     | 类型       | 默认值    | 说明                     |
|--------------|------------|-----------|--------------------------|
| space        | number     | -         | 步骤间隔                 |
| direction    | 'vertical'\|'horizontal' | 'horizontal' | 方向 |
| active       | number     | 0         | 当前激活步骤             |
| processStatus | 'wait'\|'process'\|'finish'\|'error'\|'success' | 'process' | 当前状态 |

## 基本使用
```vue
<template>
  <bt-steps :active="1" finish-status="success">
    <bt-step title="步骤1" />
    <bt-step title="步骤2" />
    <bt-step title="步骤3" />
  </bt-steps>
</template>
```

## 样式覆盖
```scss
/* 修改完成步骤颜色 */
.el-step__head.is-success {
  border-color: #20a53a;
}

/* 调整步骤描述字体大小 */
.el-step__title {
  font-size: var(--el-font-size-base);
}
```

## 注意事项
1. 步骤数量建议不超过5个
2. 垂直布局需设置direction为vertical
3. 自定义图标需使用icon插槽
4. 错误状态需设置processStatus为error
5. 移动端建议使用水平布局 