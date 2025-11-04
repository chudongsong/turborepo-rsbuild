# 系统加固组件

## 功能说明
提供系统加固状态下的临时放行时间设置功能

## 使用场景
- 系统处于加固状态时的操作授权
- 需要临时关闭安全防护的场景
- 执行系统维护操作前的安全设置
- 高危操作前的二次确认流程

## 组件参数 (Props)
本组件为功能型弹窗组件，无需传入参数

## 功能特性
- 预置常用放行时间选项（5/10/30/60分钟）
- 自动计算目标时间戳
- 集成表单验证与加载状态
- 与后台安全系统联动

## 使用示例
```vue
<template>
  <bt-dialog @confirm="systemFixedRef.onConfirm">
    <bt-system-fixed ref="systemFixedRef" />
  </bt-dialog>
</template>

<script setup>
const systemFixedRef = ref()

// 在父组件中触发确认操作
const handleConfirm = () => {
  systemFixedRef.value.onConfirm(closeDialog)
}
</script>
```

## 数据结构
```ts
interface SystemFixedForm {
  timeValue: '5分钟' | '10分钟' | '30分钟' | '60分钟' // 放行时间选项
}
```

## 样式定制
```scss
/* 调整表单布局 */
.el-form {
  margin-top: 1.5rem;
}

/* 修改单选按钮组间距 */
.el-radio-group {
  gap: 0.8rem;
}

/* 自定义提示文本样式 */
.system-alert {
  color: #ef9f00;
  font-size: 0.9rem;
}
```

## 注意事项
1. 需要配合 bt-dialog 组件使用
2. 时间转换使用当前时间戳计算
3. 提交时自动处理分钟到秒的转换
4. 表单禁用状态在提交期间自动启用
5. 需确保 setAtuoStartSyssafe 接口可用
6. 组件通过 defineExpose 暴露 onConfirm 方法 