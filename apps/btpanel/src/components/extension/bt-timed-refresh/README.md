# 定时刷新组件

## 功能说明
集成定时刷新功能的控制组件，支持手动刷新和自动轮询两种模式

## 使用场景
- 需要定期刷新数据的表格/图表
- 日志实时监控场景
- 需要保持数据新鲜度的看板

## 组件参数 (Props)
| 参数名         | 类型                  | 默认值 | 必填 | 说明                                                                 |
|----------------|-----------------------|--------|------|--------------------------------------------------------------------|
| refreshFn      | Function              | -      | 是   | 刷新数据回调函数                                                   |
| sessionConfig  | {time: number, status: boolean} | {}   | 否   | 初始配置（单位：秒）                                               |

## 事件说明
| 事件名 | 说明                 | 回调参数                               |
|--------|----------------------|----------------------------------------|
| save   | 保存配置时触发       | {status: boolean, time: number}       |

## 功能特性
- 进度圆环实时倒计时
- 本地配置持久化存储
- 最小1秒间隔限制
- 异常输入校验
- 双模式无缝切换
- 视觉反馈提示

## 使用示例
```vue
<template>
  <bt-timed-refresh 
    :refresh-fn="fetchLogs" 
    :session-config="savedConfig"
    @save="handleSaveConfig"
  />
</template>

<script setup>
// 保存配置示例
const handleSaveConfig = (config) => {
  localStorage.setItem('refreshConfig', JSON.stringify(config))
}
</script>
```

## 样式覆盖
```scss
/* 调整进度环样式 */
:deep(.el-progress) {
  circle:first-child {
    stroke: #e6e6e6; // 背景环颜色
  }
  
  .text-primary {
    font-size: 10px;
    color: #20a53a;
  }
}

/* 统一按钮高度 */
.refresh-btn, .down-button {
  height: 32px !important;
}

/* 输入框宽度调整 */
.bt-input {
  width: 120px !important;
}
```

## 注意事项
1. 时间间隔需≥1秒且为整数
2. 组件卸载时会自动清除定时器
3. sessionConfig需包含time和status字段
4. 建议在服务端做轮询频率限制
5. 高频刷新（<30秒）建议增加loading状态
6. 生产环境建议关闭控制台日志
7. 移动端需测试触摸交互 