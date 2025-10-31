# useSoftInstallMask 钩子

## 功能说明
提供软件安装环境检测和状态管理功能，支持自动显示/隐藏安装蒙层

## 使用场景
- 新软件安装引导
- 软件升级提示
- 环境依赖检测
- 多模块安装校验

## 核心特性
- 自动检测安装状态
- 支持异步检测请求
- 扩展模块集成
- 会话状态持久化
- 响应式状态管理

## 参数配置
| 参数名       | 类型                  | 必填 | 默认值 | 说明                          |
|--------------|-----------------------|------|--------|-----------------------------|
| name         | string                | 是   | -      | 会话存储唯一标识              |
| request      | () => Promise<any>    | 否   | -      | 安装状态检测接口              |
| options      | [SoftInstallOptionProps](#softinstalloptionprops-类型) | 否   | -      | 直接配置安装状态              |
| extension    | [InstallExtension](#installexte)           | 否   | []     | 扩展检测模块数组              |

### SoftInstallOptionProps 类型
```typescript
interface SoftInstallOptionProps {
  name: string      // 软件名称
  title: string     // 显示标题
  status: boolean   // 安装状态
  setup: boolean    // 是否完成安装
  version: string   // 当前版本
  s_version?: string // 系统要求版本
}
```

### InstallExtension 类型
```typescript
interface InstallExtension {
  install: (softInfo: SoftInstallOptionProps) => boolean | Promise<boolean>
}
```
## 返回值
| 属性名            | 类型               | 说明                     |
|-------------------|--------------------|--------------------------|
| init              | () => Promise<void>| 初始化检测方法           |
| checkInstallRequest| () => Promise<void>| 手动触发安装检测         |
| BtSoftInstallMask | RenderFunction     | 安装蒙层渲染组件         |

## 使用示例
```typescript
// 在安装页面组件中
const { init, BtSoftInstallMask } = useSoftInstallMask({
  name: 'data-analysis',
  request: async () => {
    const res = await checkInstallStatus()
    return res.data
  },
  extension: [diskSpaceCheck]
})

// 初始化检测
onMounted(async () => {
  await init()
})

// 模板中使用
return () => (
  <div class="install-page">
    <MainContent />
    <BtSoftInstallMask />
  </div>
)
```

## 扩展模块开发
```typescript
interface InstallExtension {
  /**
   * 扩展检测方法
   * @param softInfo 当前软件信息
   * @returns 检测结果
   */
  install: (softInfo: SoftInstallOptionProps) => boolean | Promise<boolean>
}
```

## 样式覆盖指南
```scss
// 蒙层背景
.install-mask {
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(2px);
}

// 安装面板
.install-panel {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  // 标题样式
  &__title {
    font-size: 1.4rem;
    color: #20a53a;
  }
}
```

## 最佳实践
1. 建议在路由进入时调用init方法
2. 复杂检测逻辑拆分为独立扩展模块
3. 版本号使用语义化版本规范
4. 移动端适配蒙层点击事件
5. 错误处理需包含超时机制

## 注意事项
1. name参数需保证应用内唯一
2. 扩展模块需实现install方法
3. 会话存储依赖浏览器localStorage
4. 生产环境需处理接口错误情况
5. 多标签页需同步检测状态
6. 敏感操作需添加二次确认 