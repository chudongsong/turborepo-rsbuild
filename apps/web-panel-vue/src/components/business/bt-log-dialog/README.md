# BtLogDialog 日志对话框组件

## 功能特性
- 📜 实时日志流式加载
- ⏳ 智能轮询机制（1500ms）
- 🎯 扫描/修复双模式支持
- 🔄 自动完成状态处理
- 🚨 错误边界处理
- ⏱️ 自动页面刷新机制（修复模式）

## 参数说明
### Props
| 参数名       | 类型               | 默认值                  | 说明                          |
|-------------|-------------------|------------------------|-----------------------------|
| compData    | CompDataProps     | 见下方结构              | 日志对话框配置参数            |

### 配置结构
```typescript
interface CompDataProps {
  type: 'scan' | 'repair'    // 操作类型：扫描/修复
  endMsg: string             // 成功结束标识（如："扫描结束"）
  logPath: string            // 日志文件路径
  successMsg: string         // 成功提示信息
  isClear: boolean           // 是否清除定时器
  failMsg: string            // 失败标识文本
  completeEvent?: (         // 完成回调函数
    status: boolean,        // 操作状态：true=成功/false=失败 
    close: () => void       // 关闭弹窗的方法
  ) => void
}
```

## 事件说明
| 事件名       | 说明                 | 回调参数       |
|-------------|----------------------|---------------|
| close       | 关闭对话框时触发      | 无            |
| onCancel    | 取消操作时触发        | 清理函数       |

## 方法说明
| 方法名        | 说明                 | 参数       |
|-------------|----------------------|-----------|
| getLog      | 获取日志内容         | 无        |
| clearTimer  | 清理轮询定时器       | 无        |

## 最佳实践
```vue
<template>
  <bt-log-dialog 
    :comp-data="{
      type: 'repair',
      endMsg: '修复完成',
      logPath: '/var/log/repair.log',
      successMsg: '系统修复成功',
      isClear: true,
      failMsg: '修复失败'
    }"
    @close="handleClose"
  />
</template>
```

## 交互流程
1. **初始化加载**：自动开始获取日志内容
2. **轮询机制**：每1500ms获取最新日志
3. **状态判断**：
   - 检测到`failMsg`时触发错误流程
   - 检测到`endMsg`时触发完成流程
4. **修复模式**：
   - 完成后2秒自动刷新页面
   - 清除本地存储数据
5. **异常处理**：
   - 请求失败自动重试
   - 错误信息通过Message组件提示

## 关联组件
- [bt-install-mask](#) 安装状态遮罩组件
- [bt-message](#) 全局消息提示组件
- [bt-log](#) 基础日志显示组件

## 注意事项
1. 日志路径需要确保可访问权限
2. 失败标识文本需要与日志内容完全匹配
3. 修复模式会自动清空本地存储
4. 轮询间隔建议保持1500ms不变
5. 需要配合后端日志接口使用 