# 定时刷新组件

## 功能说明
提供日志定时刷新功能，支持自定义刷新间隔和可视化倒计时

## 使用场景
- 实时日志监控界面
- 需要自动刷新数据的仪表盘
- 定时获取最新数据的场景
- 需要保存用户刷新配置的页面

## 组件参数 (Props)
| 参数名         | 类型                | 默认值       | 必填 | 说明                                                                 |
|----------------|---------------------|--------------|------|--------------------------------------------------------------------|
| refreshFn     | Function            | () => {}     | 是   | 刷新回调函数                                                       |
| sessionConfig | { time: number, status: boolean } | {} | 否   | 会话存储配置（自动恢复用户设置）                                   |

## 事件说明
| 事件名   | 说明                 | 回调参数                          |
|----------|----------------------|-----------------------------------|
| save     | 保存配置时触发       | { status: boolean, time: number } |

## 功能特性
- 圆形进度条倒计时显示
- 支持1-99秒间隔设置
- 自动保存配置到session
- 手动刷新与自动刷新模式
- 智能时间间隔验证

## 基本使用
```vue
<template>
  <bt-time-refresh 
    :refresh-fn="fetchLogs" 
    @save="handleSaveConfig"
  />
</template>

<script setup>
const fetchLogs = async () => {
  // 获取日志数据
}

const handleSaveConfig = (config) => {
  console.log('保存配置:', config)
}
</script>
```

## 高级配置
```vue
<!-- 初始化配置 -->
<bt-time-refresh 
  :session-config="{ time: 10, status: true }"
/>

<!-- 外部控制刷新 -->
<bt-time-refresh ref="refreshComp" />
<script setup>
const refreshComp = ref()
// 手动停止定时器
refreshComp.value.clearIntervalFn()
</script>
```

## 样式定制
```scss
/* 修改进度条颜色 */
:deep(.el-progress__text) {
  color: #20a53a;
}

/* 调整按钮组间距 */
.refresh-btn {
  padding: 0 1rem;
}

/* 自定义输入框宽度 */
.bt-input {
  width: 12rem;
}
```

## 注意事项
1. refreshFn 需返回 Promise
2. 时间间隔必须为1-99的整数
3. 组件卸载时会自动清除定时器
4. 百分比计算基于实时倒计时
5. 使用 sessionStorage 存储配置需自行实现
6. 弹窗关闭时恢复存档值防止误操作 