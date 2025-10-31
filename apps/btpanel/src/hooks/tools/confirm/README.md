# useConfirm 钩子

## 功能说明
提供统一的确认对话框管理，支持多种交互类型的确认操作

## 核心特性
- 多种确认类型支持（基础/输入/复选框）
- 自定义图标和颜色
- 异步操作支持
- 输入验证
- 响应式布局

## 参数配置 (ConfirmOptionProps)
| 参数名         | 类型                | 默认值      | 说明                          |
|----------------|---------------------|-------------|-----------------------------|
| title          | string              | '提示'      | 对话框标题                   |
| type           | 'default'｜'input'｜'check' | 'default' | 对话框类型                  |
| width          | string｜number      | '38rem'     | 对话框宽度                   |
| content        | string              | -           | 提示内容（支持HTML）          |
| isHtml         | boolean             | false       | 是否解析HTML内容             |
| cancelText     | string              | '取消'      | 取消按钮文字                 |
| confirmText    | string              | '确定'      | 确认按钮文字                 |
| icon           | boolean             | true        | 是否显示图标                 |
| iconColor      | string              | 'warning'   | 图标颜色                     |
| input          | [InputConfig](#inputconfig-类型)         | -           | 输入框配置（type=input时必填）|
| check          | [CheckConfig](#checkconfig-类型)         | -           | 复选框配置（type=check时必填）|
| showClose      | boolean             | true        | 是否显示关闭按钮             |

### InputConfig 类型
```typescript
interface InputConfig {
  content: string       // 输入框提示文字
  value?: string        // 初始值
  placeholder?: string  // 占位符
}
```

### CheckConfig 类型
```typescript
interface CheckConfig {
  content: string       // 复选框文字
  value: boolean        // 初始状态
  onConfirm: Function  // 确认回调
}
```

## 使用示例
### 基础确认
```typescript
const handleDelete = async () => {
  try {
    await useConfirm({
      content: '确认要删除这条记录吗？',
      onConfirm: () => {
        // 执行删除操作
      }
    })
  } catch {
    // 取消操作
  }
}
```

### 输入确认
```typescript
const rename = async () => {
  const result = await useConfirm({
    type: 'input',
    content: '请输入新名称',
    input: {
      content: '名称',
      placeholder: '2-20个字符'
    }
  })
  console.log('新名称:', result)
}
```

### 带复选框确认
```typescript
const formatDisk = async () => {
  await useConfirm({
    type: 'check',
    content: '此操作将格式化磁盘，请谨慎操作！',
    check: {
      content: '我已备份重要数据',
      onConfirm: (checked) => {
        if (!checked) throw new Error('请先确认备份')
      }
    }
  })
}
```

## 错误处理
| 错误类型              | 触发条件                          | 处理建议                 |
|-----------------------|----------------------------------|--------------------------|
| 内容为空              | content 参数为空                 | 必须提供提示内容         |
| 输入验证失败          | type=input 时 input.content 为空 | 完善输入框配置           |
| 复选框配置不完整      | type=check 时缺少必要参数         | 提供完整的 check 配置    |
| 用户取消操作          | 点击取消/关闭对话框               | 使用 try/catch 捕获      |

## 样式定制
```scss
/* 修改警告图标颜色 */
.confirm-icon-warning {
  color: #e6a23c;
}

/* 调整输入框样式 */
.confirm-input {
  .el-input__inner {
    border-color: #20a53a;
  }
}

/* 自定义底部按钮布局 */
.confirm-footer {
  justify-content: space-around;
}
```

## 最佳实践
1. 危险操作使用醒目的 iconColor（如#f56c6c）
2. 复杂内容使用 isHtml 属性展示富文本
3. 异步操作添加加载状态
4. 移动端适配宽度使用百分比
5. 频繁操作添加防抖处理

## 注意事项
1. 需要配合 BtConfirm 组件使用
2. 输入型对话框需要自行处理验证逻辑
3. 复选框类型需要提供 onConfirm 回调
4. 需要正确处理 Promise 拒绝状态
5. 避免在循环中直接调用 