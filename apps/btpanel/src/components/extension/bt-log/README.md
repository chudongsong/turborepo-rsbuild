# 日志展示组件

## 功能说明
实时日志显示组件，支持自动滚动、全屏展示和HTML内容渲染

## 使用场景
- 实时日志监控
- 命令行输出展示
- 需要自动滚动的长文本内容
- 全屏查看日志需求

## 组件参数 (Props)
| 参数名       | 类型                  | 默认值   | 必填 | 说明                                                                 |
|--------------|-----------------------|----------|------|--------------------------------------------------------------------|
| content      | string                | ''       | 是   | 日志内容                                                           |
| isHtml       | boolean               | false    | 否   | 是否以HTML格式渲染内容                                             |
| autoScroll   | boolean               | true     | 否   | 是否自动滚动到底部                                                 |
| fullScreen   | [FullScreenProps](#fullscreenprops-数据结构) \| false | false | 否 | 全屏配置，传false时隐藏全屏按钮                                    |

### FullScreenProps 数据结构
```ts
interface FullScreenProps {
  title: string         // 全屏弹窗标题
  onRefresh: () => void // 刷新内容回调
}
```

## 方法说明
| 方法名          | 说明                 | 参数       |
|-----------------|----------------------|------------|
| setScrollBottom | 手动滚动到底部       | 无         |

## 功能特性
- 自动滚动到底部
- 支持HTML内容渲染
- 全屏展示功能
- 自定义滚动条样式
- 鼠标交互控制按钮显隐
- 内容刷新支持

## 使用示例
```vue
<template>
  <!-- 基础用法 -->
  <bt-log 
    :content="logContent" 
    :auto-scroll="true"
  />

  <!-- 全屏配置 -->
  <bt-log
    :content="logContent"
    :full-screen="{
      title: '系统日志',
      onRefresh: fetchLogs
    }"
  />
</template>
```

## 样式覆盖
```scss
/* 修改日志背景色 */
.log-box {
  background-color: #1a1a1a;
}

/* 调整文本颜色 */
code {
  color: #20a53a;
}

/* 自定义全屏按钮样式 */
.el-button {
  padding: 8px 16px;
}
```

## 注意事项
1. 父容器需要设置明确的高度
2. HTML内容需做好XSS防护
3. 大量日志内容建议分页加载
4. 自动滚动功能在内容超过万行时可能卡顿
5. 全屏功能依赖全局对话框组件
6. 暗色主题需自行调整颜色变量
7. 动态更新内容时注意性能优化 