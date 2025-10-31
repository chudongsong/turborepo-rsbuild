# 终端组件

## 功能说明
基于Xterm.js的Web终端组件，支持SSH连接和本地服务器认证管理

## 使用场景
- Web端SSH连接管理
- 本地服务器终端操作
- 需要实时交互的命令行界面
- 服务器集群管理控制台

## 组件参数 (Props)
| 参数名          | 类型       | 默认值          | 必填 | 说明                                                                 |
|-----------------|------------|-----------------|------|--------------------------------------------------------------------|
| url            | string     | '/webssh'       | 否   | WebSocket连接路径                                                  |
| id             | string     | ''              | 是   | 终端唯一标识                                                       |
| active         | boolean    | true            | 否   | 是否处于激活状态                                                   |
| fitColsRows    | boolean    | true            | 否   | 是否自动调整终端行列                                               |
| requestToken   | boolean    | false           | 否   | 是否通过接口获取认证token                                          |
| hostInfo       | object     | [HostInfo](#hostinfo-结构) | 是   | 主机连接信息                                                       |

### HostInfo 结构
```ts
interface HostInfo {
  host: string // 主机地址
  port: number // 端口号
  username: string // 用户
  password: string // 密码
}
```

## 事件说明
| 事件名 | 说明                 | 回调参数 |
|--------|----------------------|----------|
| close  | 终端关闭时触发       | 无       |

## 暴露方法
| 方法名           | 说明                 | 参数     |
|------------------|----------------------|----------|
| disposeTerminal  | 销毁终端实例         | 无       |
| reconnectTerminal| 重新连接终端         | 无       |

## 功能特性
- WebSocket实时通信
- 终端窗口自适应
- 本地服务器认证管理
- 支持Ctrl+V粘贴
- 断线自动重连
- 滚动条美化
- 多标签页支持

## 使用示例
```vue
<template>
  <bt-terminal 
    id="term-1" 
    :host-info="{
      host: '192.168.1.100',
      port: 22,
      username: 'admin'
    }"
    @close="handleTerminalClose"
  />
</template>
```

## 样式覆盖
```scss
/* 调整终端容器 */
.terminal-view {
  background: #1a1a1a;
  border-radius: 8px;
  
  /* 滚动条样式 */
  .xterm-viewport::-webkit-scrollbar {
    width: 10px;
    background: #2a2a2a;
  }
  
  /* 字体样式 */
  .xterm-rows {
    font-family: 'Fira Code', monospace;
    font-size: var(--el-font-size-base);
  }
}

/* 认证弹窗样式 */
.terminal-add-host {
  background: rgba(0, 0, 0, 0.8);
  
  .el-alert {
    margin: 20px 0;
  }
}
```

## 注意事项
1. 需要后端WebSocket服务支持
2. 依赖Xterm.js 5.x及以上版本
3. 本地认证需开启浏览器剪贴板权限
4. 建议使用固定高度容器（至少400px）
5. 生产环境需启用SSL加密
6. 注意敏感信息（如密码）的传输安全
7. 大数据量输出需做节流处理
8. 推荐使用等宽字体保证对齐
9. 需要处理跨域问题
10. 移动端体验有限，建议响应式布局 