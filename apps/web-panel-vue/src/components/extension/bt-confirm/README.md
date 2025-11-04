# 确认弹窗组件

## 功能说明
多功能确认弹窗组件，支持多种验证模式及自定义内容展示

## 使用场景
- 危险操作二次确认
- 用户身份验证
- 协议确认场景
- 需要交互验证的弹窗

## 组件参数 (Props)
| 参数名     | 类型                | 默认值            | 必填 | 说明                          |
|------------|---------------------|-------------------|------|-----------------------------|
| compData   | [ConfirmBaseProps](#confirmbaseprops-数据结构) | 见下方数据结构    | 是   | 弹窗配置数据                 |

### ConfirmBaseProps 数据结构
```ts
interface ConfirmBaseProps {
  type: 'default' | 'calc' | 'input' | 'check' // 弹窗类型
  content: string | Component                 // 显示内容
  isHtml?: boolean                            // 是否使用HTML渲染
  icon?: boolean | string                     // 图标配置
  iconColor?: string                          // 图标颜色
  input?: {                                   // 输入验证配置
    content: string                            // 输入内容
  }
  check?: {                                   // 协议确认配置
    content: string                            // 确认内容
    value: boolean                            // 确认值
    onConfirm: (value: boolean) => void        // 确认回调
  }
}
```

## 事件说明
| 事件名   | 说明                 | 回调参数       |
|----------|----------------------|----------------|
| cancel   | 取消操作时触发       | 无             |
| confirm  | 确认操作时触发       | 无             |
| close    | 关闭弹窗时触发       | 无             |

## 功能特性
- 多种验证模式：计算验证、输入验证、协议确认
- 支持HTML内容渲染
- 自定义图标系统
- 自动生成数学验证题
- 输入防粘贴功能

## 使用示例
```vue
<template>
  <bt-confirm 
    :comp-data="{
      type: 'input',
      content: '确认删除该文件？',
      input: { content: 'DELETE' }
    }"
    @confirm="handleDelete"
  />
</template>
```

## 样式覆盖
```scss
/* 修改警告图标颜色 */
.svgtofont-el-warning {
  color: #e6a23c;
}

/* 调整输入框宽度 */
.confirm-calc .el-input-number--small {
  width: 12rem;
}

/* 修改协议确认框间距 */
.confirm-check {
  padding: 1.5rem;
}
```

## 注意事项
1. 不同类型需要对应配置参数
2. 计算验证会自动生成题目
3. 输入验证区分大小写
4. 协议确认需自行处理状态
5. 需要配合弹窗组件使用
6. 使用HTML内容时需注意XSS防护 