# useErrorMask 钩子

## 功能说明
手动注册错误提示，可以在任何地方使用

## 使用场景
- 任何需要显示错误提示的地方
- 需要手动注册错误提示的场景

## 参数说明
| 参数名       | 类型               | 说明                     |
|--------------|--------------------|--------------------------|
| tableConfig  | [TableInstallExtProps](#tableinstallextprops-类型定义) | 表格配置对象           |

## 返回值
| 属性名        | 类型               | 说明                     |
|---------------|--------------------|--------------------------|
| install       | Function           | 注册错误监听的方法       |
| BtErrorMask   | RenderFunction     | 错误蒙层渲染函数         |

### TableInstallExtProps 类型定义
```typescript
interface TableInstallExtProps {
  tableConfig: {
    error?: ErrorMaskProps
  }
}
interface ErrorMaskProps {
  code: string
}
```

## 基本使用
```typescript
// 在表格组件中
import { useErrorMask } from '@/hooks/business/error-mask'

const {  BtErrorMask } = useErrorMask({code:"错误提示代码"})


// 在模板中使用
return () => (
  <div>
    <Table />
    <BtErrorMask />
  </div>
)
```



## 注意事项
- 需要手动注册错误提示
- 需要手动处理错误状态清除
- 需要手动处理错误状态显示
