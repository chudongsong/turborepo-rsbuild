# BtMsgConfig 消息配置组件

## 功能特性
- 🚀 多平台集成（钉钉/飞书/企业微信/邮件/微信账号）
- 📚 配置文档直达链接
- 🔄 统一回调接口
- 🎨 平台专属样式
- 📤 自动关闭机制

## 平台支持
| 平台类型       | 组件              | 文档链接                                      |
|---------------|-------------------|---------------------------------------------|
| 钉钉          | RobotBase         | https://www.bt.cn/bbs/thread-108081-1-1.html |
| 飞书          | RobotBase         | https://www.bt.cn/bbs/thread-108274-1-1.html |
| 企业微信      | RobotBase         | https://www.bt.cn/bbs/thread-108116-1-1.html |
| 邮件          | Mail              | -                                           |
| 微信账号      | WeChatAccount     | -                                           |

## 参数说明
### Props
| 参数名       | 类型               | 默认值   | 说明                          |
|-------------|-------------------|---------|-----------------------------|
| compData    | Object            | {}      | 包含以下配置项：               |
|             | - type: string    |         | 平台类型（dingding/feishu等） |
|             | - callback: func  |         | 配置完成回调函数              |

## 事件说明
| 事件名       | 说明                 | 回调参数       |
|-------------|----------------------|---------------|
| close       | 关闭配置窗口时触发    | 无            |

## 组件结构
```vue
<template>
  <!-- 根据类型动态渲染子组件 -->
  <RobotBase v-if="type === 'dingding'" ... />
  <RobotBase v-if="type === 'feishu'" ... />
  <RobotBase v-if="type === 'weixin'" ... />
  <Mail v-if="type === 'mail'" ... />
  <WeChatAccount v-if="type === 'wx_account'" ... />
</template>
```

## 最佳实践
```vue
<template>
  <bt-msg-config 
    :comp-data="{
      type: 'dingding',
      callback: handleConfigSave
    }"
    @close="handleClose"
  />
</template>

<script setup>
const handleConfigSave = (configData) => {
  console.log('保存的配置:', configData)
  // 提交到后端API
}
</script>
```

## 关联组件
- [RobotBase](#) 机器人基础配置组件
- [Mail](#) 邮件服务配置组件
- [WeChatAccount](#) 微信账号配置组件

## 注意事项
1. 不同平台需要对应不同的文档链接
2. 微信账号配置需要单独处理
3. 回调函数需处理各平台返回的数据结构
4. 组件关闭后需手动更新配置状态
5. 生产环境需替换文档链接为企业版地址 