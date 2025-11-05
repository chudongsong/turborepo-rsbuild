# @linglongos/hooks

[![npm version](https://img.shields.io/npm/v/@linglongos/hooks.svg)](https://www.npmjs.com/package/@linglongos/hooks)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

通用 React Hooks 库，提供可复用的 hooks，涵盖常见开发场景。

## 📦 安装

```bash
pnpm add @linglongos/hooks
# 或者
npm install @linglongos/hooks
# 或者
yarn add @linglongos/hooks
```

## 🚀 快速开始

```typescript
import { useContainerSize, useSelection } from '@linglongos/hooks'

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
import { useContainerSize } from '@linglongos/hooks'

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
import { useSelection } from '@linglongos/hooks'

function SelectableList() {
  const items = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
    { id: '3', name: 'Item 3' },
  ];
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

### useBoolean

在 true 和 false 之间切换状态。

**特性：**
- 提供切换、设置为 true、设置为 false 的方法
- 返回一个稳定的函数引用

**参数：**
```typescript
useBoolean(initialValue?: boolean)
```

**返回值：**
```typescript
[
  boolean,
  {
    toggle: () => void;
    setTrue: () => void;
    setFalse: () => void;
  }
]
```

**示例：**
```typescript
import { useBoolean } from '@linglongos/hooks'

function BooleanComponent() {
  const [state, { toggle, setTrue, setFalse }] = useBoolean(false);

  return (
    <div>
      <p>当前状态: {state ? 'True' : 'False'}</p>
      <button onClick={toggle}>切换</button>
      <button onClick={setTrue}>设为 True</button>
      <button onClick={setFalse}>设为 False</button>
    </div>
  );
}
```

### useEventListener

在 React 组件中轻松添加和移除事件监听器。

**特性：**
- 自动处理事件监听器的添加和移除
- 支持多种事件目标（window, document, RefObject）
- 类型安全的事件处理

**参数：**
```typescript
useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: undefined,
  options?: boolean | AddEventListenerOptions
): void

useEventListener<K extends keyof HTMLElementEventMap, T extends HTMLElement = HTMLDivElement>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  element: React.RefObject<T>,
  options?: boolean | AddEventListenerOptions
): void
```

**示例：**
```typescript
import { useEventListener } from '@linglongos/hooks'
import { useRef, useState } from 'react'

function EventListenerComponent() {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const divRef = useRef<HTMLDivElement>(null);

  // 监听 window 的 mousemove 事件
  useEventListener('mousemove', (event) => {
    setCoords({ x: event.clientX, y: event.clientY });
  });

  // 监听特定元素的 click 事件
  useEventListener('click', () => {
    console.log('Div clicked!');
  }, divRef);

  return (
    <div ref={divRef} style={{ width: 200, height: 200, border: '1px solid black' }}>
      <p>移动鼠标查看坐标变化</p>
      <p>X: {coords.x}, Y: {coords.y}</p>
      <p>点击此区域查看控制台输出</p>
    </div>
  );
}
```

### useLockBodyScroll

锁定和解锁 body 元素的滚动。

**特性：**
- 切换 body 元素的 `overflow` 样式
- 自动处理组件挂载和卸载时的样式恢复
- 在 SSR 环境下安全

**参数：**
```typescript
useLockBodyScroll(isLocked: boolean)
```

**返回值：**
`void`

**示例：**
```typescript
import { useLockBodyScroll } from '@linglongos/hooks'
import { useState } from 'react'

function ModalComponent() {
  const [isOpen, setIsOpen] = useState(false);

  // 当 isOpen 为 true 时锁定滚动
  useLockBodyScroll(isOpen);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>打开弹窗</button>
      {isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)' }}>
          <div style={{ background: 'white', padding: 20, margin: 50 }}>
            <h2>弹窗内容</h2>
            <p>Body 滚动已被锁定。</p>
            <button onClick={() => setIsOpen(false)}>关闭弹窗</button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### useMediaQuery

在 React 组件中轻松实现媒体查询。

**特性：**
- 响应式地跟踪媒体查询的匹配状态
- 在 SSR 环境下安全，提供初始默认值

**参数：**
```typescript
useMediaQuery(query: string, defaultState?: boolean): boolean
```

**返回值：**
`boolean`

**示例：**
```typescript
import { useMediaQuery } from '@linglongos/hooks'

function MediaQueryComponent() {
  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  return (
    <div>
      {isSmallScreen ? (
        <p>当前是小屏幕</p>
      ) : (
        <p>当前是大屏幕</p>
      )}
    </div>
  );
}
```

### useUpdate

提供一个函数，用于手动触发组件的重新渲染。

**特性：**
- 强制组件更新
- 返回一个稳定的函数引用

**参数：**
```typescript
useUpdate(): () => void
```

**返回值：**
`() => void`

**示例：**
```typescript
import { useUpdate } from '@linglongos/hooks'
import { useRef } from 'react'

function UpdateComponent() {
  const update = useUpdate();
  const timeRef = useRef(Date.now());

  return (
    <div>
      <p>当前时间: {timeRef.current}</p>
      <button onClick={() => {
        timeRef.current = Date.now();
        update();
      }}>更新时间</button>
    </div>
  );
}
```

### useAxios

一个封装了 Axios 的 React Hook，用于简化 API 请求。

**特性：**
- 支持加载、错误、成功状态管理
- 提供取消请求的功能
- 类型安全，自动推断响应数据类型

**参数：**
```typescript
useAxios<T>(config: AxiosRequestConfig)
```

**返回值：**
```typescript
{
  response: AxiosResponse<T> | null
  error: AxiosError | null
  loading: boolean
  fetchData: (overrideConfig?: AxiosRequestConfig) => Promise<void>
  cancel: () => void
}
```

**示例：**
```typescript
import { useAxios } from '@linglongos/hooks'
import { useEffect } from 'react'

function FetchComponent() {
  const { response, loading, error, fetchData } = useAxios<{ id: number; name: string }[]>({
    url: 'https://api.example.com/data',
    method: 'get'
  });

  useEffect(() => {
    fetchData();
  }, []); // fetchData 是稳定的

  if (loading) return <p>加载中...</p>;
  if (error) return <p>错误: {error.message}</p>;

  return (
    <ul>
      {response?.data.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

### useCookie

在 React 中轻松管理 Cookie。

**特性：**
- 支持读取、写入和删除 Cookie
- 响应式地返回 Cookie 值
- 在 SSR 环境下安全

**参数：**
```typescript
useCookie(key: string, initialValue?: string)
```

**返回值：**
```typescript
[
  string | null,
  (newValue: string, options?: Cookies.CookieAttributes) => void,
  () => void
]
```

**示例：**
```typescript
import { useCookie } from '@linglongos/hooks'

function CookieComponent() {
  const [cookie, setCookie, deleteCookie] = useCookie('my-cookie', 'default-value');

  return (
    <div>
      <p>Cookie 值: {cookie}</p>
      <input
        type="text"
        value={cookie || ''}
        onChange={(e) => setCookie(e.target.value)}
      />
      <button onClick={deleteCookie}>删除 Cookie</button>
    </div>
  );
}
```

### useDarkMode

在亮色和暗色模式之间切换，并可选择持久化到 localStorage。

**特性：**
- 自动检测系统偏好 (`prefers-color-scheme`)
- 将状态持久化到 localStorage
- 在 SSR 环境下安全
- 自动在 `<html>` 元素上添加/移除 `class`

**参数：**
```typescript
useDarkMode(options?: {
  initialValue?: boolean;
  localStorageKey?: string;
  classNameDark?: string;
  classNameLight?: string;
})
```

**返回值：**
```typescript
{
  isDarkMode: boolean;
  toggle: () => void;
  enable: () => void;
  disable: () => void;
}
```

**示例：**
```typescript
import { useDarkMode } from '@linglongos/hooks'

function DarkModeComponent() {
  const { isDarkMode, toggle } = useDarkMode();

  return (
    <div>
      <p>当前是 {isDarkMode ? '暗色' : '亮色'} 模式</p>
      <button onClick={toggle}>切换模式</button>
      <p>（查看 html 元素的 class 变化）</p>
    </div>
  );
}
```

### useFavicon

动态设置页面的 favicon。

**特性：**
- 支持 URL 和 data URI
- 在 SSR 环境下安全

**参数：**
```typescript
useFavicon(href: string)
```

**返回值：**
`void`

**示例：**
```typescript
import { useFavicon } from '@linglongos/hooks'
import { useState } from 'react'

function FaviconComponent() {
  const [favicon, setFavicon] = useState('default-favicon.ico');
  useFavicon(favicon);

  return (
    <div>
      <p>当前 Favicon: {favicon}</p>
      <button onClick={() => setFavicon('new-favicon.ico')}>设置新 Favicon</button>
      <button onClick={() => setFavicon('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔥</text></svg>')}>
        设置为 Emoji
      </button>
    </div>
  );
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
