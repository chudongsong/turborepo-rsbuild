# 实时任务组件

## 功能说明
实时展示后台任务执行状态，支持下载/压缩/解压等操作监控，提供任务取消功能

## 使用场景
- 文件上传/下载进度监控
- 批量压缩解压任务管理
- 需要实时反馈的后台任务展示
- 长时间运行任务的中断控制

## 组件特性
- 自动轮询任务状态（每秒1次）
- 智能进度条展示（下载类任务）
- 原始日志展示（压缩/解压类任务）
- 任务取消确认机制
- 自适应内容高度（最大52rem）

## 事件说明
| 事件名   | 说明                 | 回调参数 |
|----------|----------------------|----------|
| resize   | 内容高度变化时触发   | 无       |
| close    | 所有任务完成时触发   | 无       |

## 基本使用
```vue
<template>
  <bt-real-time-task @close="handleClose" />
</template>

<script setup>
const handleClose = () => {
  console.log('所有任务已完成')
}
</script>
```

## 任务数据结构
```ts
interface TaskItem {
  id: string
  status: number // -1=执行中, 其他=等待
  type: number   // 1=下载, 2=压缩/解压
  name: string
  shell: string
  log: {
    pre: string    // 进度百分比
    used: string    // 已下载量
    total: string   // 总大小
    time: string    // 剩余时间
    speed: string   // 下载速度
  } | string       // 压缩/解压任务的原始日志
}
```

## 样式覆盖指南
```css
/* 任务容器 */
.max-h-[52rem] {
  max-height: 52rem; /* 根据实际需求调整最大高度 */
}

/* 进行中任务标题 */
.title {
  background-color: #f5f5f5; /* 背景色可自定义 */
  padding: 0 10px;
}

/* 等待任务样式 */
.title.wait {
  color: #787878;
  background: none;
}

/* 取消按钮图标 */
.svgtofont-el-close {
  color: #ef0808; /* 危险操作红色警示 */
}
```

## 注意事项
1. 依赖全局状态管理中的任务列表（通过 useGlobalStore）
2. 自动轮询机制在组件挂载时启动，卸载时自动清除
3. 下载任务进度计算依赖后台返回的 pre/used/total 字段
4. 取消操作需要二次确认防止误触
5. 压缩/解压任务日志最大高度限制为27rem
6. 组件关闭后需手动处理弹窗容器 