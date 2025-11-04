# @org/hooks

[![npm version](https://img.shields.io/npm/v/@org/hooks.svg)](https://www.npmjs.com/package/@org/hooks)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

通用 React Hooks 库，提供可复用的 hooks，涵盖常见开发场景。

## 📦 安装

```bash
pnpm add @org/hooks
# 或者
npm install @org/hooks
# 或者
yarn add @org/hooks
```

## 🚀 快速开始

```typescript
import { useContainerSize, useSelection } from '@org/hooks'

function MyComponent() {
  // 监听容器尺寸
  const { containerRef, containerWidth, containerHeight } = useContainerSize()

  // 管理选择状态
  const { selected, handleClick, toggleSelect } = useSelection<string>()

  return (
    <div ref={containerRef}>
      {/* 组件内容 */}
    </div>
  )
}
```

## 🪝 可用 Hooks

### useContainerSize

监听并返回容器尺寸（宽高）。

**特性：**
- 提供 ref 绑定容器节点
- 自动监听 window resize
- 支持 SSR 环境
- 完全通用，任何需要监听元素尺寸的组件都可以使用

**参数：**
```typescript
useContainerSize(initialWidth?: number, initialHeight?: number)
```

**返回值：**
```typescript
{
  containerRef: RefObject<HTMLDivElement>
  containerWidth: number
  containerHeight: number
}
```

**示例：**
```typescript
import { useContainerSize } from '@org/hooks'

function ResponsiveComponent() {
  const { containerRef, containerWidth, containerHeight } = useContainerSize()

  return (
    <div ref={containerRef}>
      尺寸：{containerWidth} x {containerHeight}
    </div>
  )
}
```

### useSelection

通用的选择管理 Hook，支持单选/多选。

**特性：**
- 支持单选/多选（cmd/ctrl/shift）
- 提供事件处理函数
- 支持自定义选择变化回调
- 类型安全，支持泛型

**参数：**
```typescript
useSelection<T>(options?: {
  multiSelect?: boolean
  onSelectionChange?: (selected: Set<T>) => void
})
```

**返回值：**
```typescript
{
  selected: Set<T>
  suppressNextClickClearRef: Ref<boolean>
  dragMultiKeyRef: Ref<boolean>
  handleClick: (e: React.MouseEvent, id: T) => void
  handleMouseDown: (e: React.MouseEvent) => void
  toggleSelect: (id: T) => void
  clearSelection: () => void
  selectOnly: (id: T) => void
  isSelected: (id: T) => boolean
  getSelectedCount: () => number
  getSelectedItems: () => T[]
}
```

**示例：**
```typescript
import { useSelection } from '@org/hooks'

function SelectableList() {
  const {
    selected,
    handleClick,
    toggleSelect,
    clearSelection,
    isSelected,
    getSelectedItems,
  } = useSelection<string>()

  return (
    <div>
      {items.map(item => (
        <div
          key={item.id}
          onClick={(e) => handleClick(e, item.id)}
          style={{
            background: isSelected(item.id) ? '#e0e0e0' : 'transparent'
          }}
        >
          {item.name}
        </div>
      ))}
      <button onClick={clearSelection}>清除选择</button>
      <div>已选择: {getSelectedItems().length} 项</div>
    </div>
  )
}
```

## 🛠️ 技术栈

- **React** >= 18.0.0
- **TypeScript** 5.9+
- **Vitest** 3.2+ (测试)
- **Biome** 2.3+ (代码检查)

## 📝 开发

### 安装依赖

```bash
pnpm install
```

### 构建

```bash
pnpm build
```

### 开发模式

```bash
pnpm dev
```

### 测试

```bash
pnpm test          # 运行测试
pnpm test:watch    # 监视模式
pnpm coverage      # 生成覆盖率报告
```

### 代码检查

```bash
pnpm lint          # 检查代码
pnpm lint:fix      # 自动修复
pnpm format        # 格式化代码
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 提交规范

- 使用conventional commits格式
- 确保所有测试通过
- 遵循Biome代码规范
- 添加适当的类型定义和文档

## 📄 许可证

MIT License

## 🙏 致谢

感谢所有贡献者和使用者的支持！

## 📚 相关资源

- [React Hooks 官方文档](https://react.dev/reference/react)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Vitest 测试框架](https://vitest.dev/)
