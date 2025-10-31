# 延迟加载组件

## 功能说明
提供任务队列管理的延迟加载容器，支持加载状态展示和任务执行
组件内容需要使用异步组件，否则组件将会默认自动加载，不回等待任务执行后加载

## 使用场景
- 需要延迟加载的组件
- 异步任务执行状态展示
- 需要队列管理的加载任务
- 优化首屏加载性能

## 组件参数 (Props)
| 参数名       | 类型                | 默认值           | 必填 | 说明                          |
|--------------|---------------------|------------------|------|-----------------------------|
| taskName     | string              | ''               | 是   | 任务唯一标识                 |
| task         | () => Promise<any>  | () => Promise.resolve() | 是 | 需要执行的异步任务           |
| loadingText  | string              | '正在加载任务...' | 否   | 加载状态提示文本             |

## 插槽说明
| 插槽名   | 说明                 | 作用域参数       |
|----------|----------------------|----------------|
| default  | 任务完成后显示的内容   | -              |

## 功能特性
- 自动任务队列管理
- 响应式加载状态
- 可自定义加载提示
- 支持异步任务处理
- 优雅降级展示

## 使用示例
```vue
<template>
  <bt-lazy-loading 
    task-name="init-data"
    :task="fetchData"
    loading-text="正在加载数据..."
  >
    <template #default>
      <data-display :data="data" />
    </template>
  </bt-lazy-loading>
</template>

<script setup>
const fetchData = async () => {
  const res = await api.getData()
  data.value = res
}
</script>
```

## 样式覆盖
```scss
/* 修改加载容器样式 */
.task-queue-wrapper {
  min-height: 200px;
  background: #f5f7fa;
}

/* 调整加载提示文本 */
.loading {
  color: #20a53a;
  font-size: var(--el-font-size-base);
}

## 最佳实践
1. 为每个任务设置唯一的taskName
2. 合理设置加载提示文本
3. 任务执行时间较长时添加进度反馈
4. 处理任务执行异常情况
5. 避免同时执行过多任务

## 注意事项
1. 需要配合taskQueue工具使用
2. 任务执行失败需要自行处理
3. 组件卸载时会自动清理任务
4. 避免重复注册相同taskName
5. 建议添加任务超时处理
6. 移动端需优化加载体验 