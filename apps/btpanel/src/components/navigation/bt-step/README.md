# 步骤组件

## 功能说明
基于 Element Plus Step 的二次封装组件，用于步骤条中的单个步骤

## 使用场景
- 步骤流程中的单个步骤
- 需要自定义图标或描述的步骤
- 带状态的步骤展示

## 组件参数 (Props)
完整继承 Element Plus Step 组件参数，参考：
https://element-plus.org/zh-CN/component/steps.html#step-属性

| 参数名       | 类型       | 默认值    | 说明                     |
|--------------|------------|-----------|--------------------------|
| title        | string     | ''        | 步骤标题                 |
| description  | string     | ''        | 步骤描述                 |
| icon         | string     | -         | 自定义图标               |
| status       | 'wait'\|'process'\|'finish'\|'error'\|'success' | 'wait' | 当前状态 |

## 基本使用
```vue
<template>
  <bt-steps :active="1">
    <bt-step title="第一步" description="验证身份" />
    <bt-step title="第二步" description="填写信息" />
    <bt-step title="第三步" description="完成" status="success" />
  </bt-steps>
</template>
```

## 样式覆盖
```scss
/* 修改步骤图标颜色 */
.el-step__head.is-process {
  border-color: #20a53a;
}

/* 调整描述文字大小 */
.el-step__description {
  font-size: var(--el-font-size-small);
}
```

## 注意事项
1. 必须包裹在bt-steps组件内使用
2. 自定义图标需预先注册
3. 状态优先级高于父组件设置
4. 描述内容建议不超过两行
5. 移动端建议简化描述内容 