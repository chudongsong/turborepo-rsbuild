# 测试指南

本文档介绍如何使用和运行 `@org/hooks` 包的测试套件。

---

## 📋 目录

- [测试框架](#测试框架)
- [测试结构](#测试结构)
- [运行测试](#运行测试)
- [测试文件说明](#测试文件说明)
- [覆盖率报告](#覆盖率报告)
- [编写测试](#编写测试)

---

## 🧪 测试框架

我们使用以下工具进行测试：

- **Vitest** - 快速的单元测试框架
- **@testing-library/react** - React 组件测试工具
- **jsdom** - 浏览器环境模拟

---

## 📁 测试结构

```
packages/hooks/src/
├── hooks/
│   ├── __tests__/
│   │   ├── useAxios.test.ts              # useAxios 测试
│   │   ├── useRequest.test.ts            # useRequest 测试
│   │   ├── useAsyncFetch.test.ts         # useAsyncFetch 测试
│   │   ├── useErrorHandler.test.ts       # useErrorHandler 测试
│   │   ├── usePreload.test.ts            # usePreload 测试
│   │   └── integration.test.tsx          # 集成测试
│   └── ...
├── test-utils.tsx                        # 测试工具和 mocks
└── ...
```

---

## 🚀 运行测试

### 运行所有测试

```bash
pnpm test
```

### 监视模式运行测试

```bash
pnpm test:watch
```

### 生成覆盖率报告

```bash
pnpm coverage
```

### 仅运行特定测试

```bash
# 运行 useAxios 测试
vitest run useAxios

# 运行集成测试
vitest run integration

# 运行匹配模式的测试
vitest run --grep "should handle error"
```

### 查看覆盖率报告

```bash
pnpm coverage

# 在浏览器中打开 HTML 报告
open coverage/index.html
```

---

## 📄 测试文件说明

### useAxios.test.ts

测试 `useAxios` Hook 的基础功能：

```typescript
describe('useAxios', () => {
  it('应该返回 axios 实例', () => {
    // 测试返回实例的结构
  })

  it('应该能够发起 GET 请求', async () => {
    // 测试 GET 请求
  })

  it('应该能够发起 POST 请求', async () => {
    // 测试 POST 请求
  })

  // ... 更多测试用例
})
```

**测试覆盖：**
- ✅ 实例创建
- ✅ GET/POST 请求
- ✅ 错误处理
- ✅ 自定义配置
- ✅ 响应格式处理
- ✅ 字符串/函数配置

### useRequest.test.ts

测试 `useRequest` Hook 的高级功能：

```typescript
describe('useRequest', () => {
  it('应该初始化状态', () => {
    // 测试初始状态
  })

  it('应该自动执行请求（immediate: true）', async () => {
    // 测试自动执行
  })

  it('应该支持手动执行（manual: true）', async () => {
    // 测试手动控制
  })

  // ... 更多测试用例
})
```

**测试覆盖：**
- ✅ 状态初始化
- ✅ 自动/手动执行
- ✅ 成功/错误回调
- ✅ 初始数据
- ✅ 取消请求
- ✅ 重置状态
- ✅ run/refresh 别名
- ✅ usePost/useGet 变体
- ✅ useLazy* 变体

### useAsyncFetch.test.ts

测试 `useAsyncFetch` Hook 的 Promise 风格功能：

```typescript
describe('useAsyncFetch', () => {
  it('应该执行请求并返回结果', async () => {
    // 测试请求执行
  })

  it('应该更新 loading 状态', async () => {
    // 测试状态更新
  })

  // ... 更多测试用例
})
```

**测试覆盖：**
- ✅ 状态管理
- ✅ 请求执行
- ✅ Loading 状态
- ✅ 成功回调
- ✅ 错误处理
- ✅ 初始数据
- ✅ 取消/重置
- ✅ useAsyncPost/useAsyncGet

### useErrorHandler.test.ts

测试 `useErrorHandler` Hook 的错误处理功能：

```typescript
describe('useErrorHandler', () => {
  it('应该能够处理错误', () => {
    // 测试错误处理
  })

  it('应该能够重试错误', async () => {
    // 测试错误重试
  })

  // ... 更多测试用例
})
```

**测试覆盖：**
- ✅ 错误处理
- ✅ 字符串/对象错误
- ✅ 错误严重性
- ✅ 清理错误
- ✅ 移除特定错误
- ✅ 错误重试机制
- ✅ 错误上报
- ✅ useAsyncErrorHandler
- ✅ useErrorBoundary

### usePreload.test.ts

测试 `usePreload` Hook 的文件预加载功能：

```typescript
describe('usePreload', () => {
  it('应该加载文件列表', async () => {
    // 测试文件加载
  })

  it('应该跟踪加载进度', async () => {
    // 测试进度跟踪
  })

  // ... 更多测试用例
})
```

**测试覆盖：**
- ✅ 状态初始化
- ✅ 文件列表加载
- ✅ 进度跟踪
- ✅ 错误处理
- ✅ SessionStorage 缓存
- ✅ 取消请求
- ✅ 版本检查
- ✅ useScript/useStyle
- ✅ 动态加载

### integration.test.tsx

集成测试覆盖完整的使用场景：

```typescript
describe('集成测试 - 综合场景', () => {
  it('完整用户登录流程', async () => {
    // 测试登录流程
  })

  it('分页数据加载场景', async () => {
    // 测试分页加载
  })

  it('购物车操作场景', async () => {
    // 测试购物车
  })

  // ... 更多场景
})
```

**场景覆盖：**
- ✅ 用户登录/注册
- ✅ 错误处理流程
- ✅ 分页数据加载
- ✅ 文件上传
- ✅ 搜索防抖
- ✅ 购物车操作
- ✅ 实时数据轮询
- ✅ 批量操作
- ✅ 网络错误重试
- ✅ 并发请求处理

---

## 📊 覆盖率报告

运行覆盖率测试后，报告将显示在 `coverage/` 目录中，包括：

### HTML 报告

```bash
open coverage/index.html
```

### 文本报告

```bash
pnpm coverage --reporter=text
```

### JSON 报告

```bash
pnpm coverage --reporter=json
```

### 覆盖率阈值

我们设定了以下覆盖率阈值：

- **分支覆盖率 (Branches)**: 70%
- **函数覆盖率 (Functions)**: 80%
- **行覆盖率 (Lines)**: 80%
- **语句覆盖率 (Statements)**: 80%

如果覆盖率低于阈值，测试将失败。

---

## ✍️ 编写测试

### 测试工具

使用 `test-utils.tsx` 中的工具函数：

```typescript
import { renderHook, setupAxiosMock, resetMocks } from '../../test-utils'

// 渲染 Hook
const { result } = renderHook(() => useAxios())

// Mock axios
setupAxiosMock()

// 重置 mocks
resetMocks()
```

### 模拟响应

```typescript
// 模拟成功响应
setupAxiosMock({
  data: {
    status: true,
    msg: 'success',
    code: 200,
    data: { id: 1 },
  },
})

// 模拟错误响应
setupAxiosErrorMock(new Error('Network Error'))
```

### 异步测试

```typescript
it('应该执行请求', async () => {
  const { result } = renderHook(() => useAxios())

  const response = await result.current.get('/api/users')

  expect(response).toHaveProperty('status', true)
})
```

### 状态测试

```typescript
it('应该更新 loading 状态', async () => {
  const { result } = renderHook(() => useRequest(config, { manual: true }))

  expect(result.current.loading).toBe(false)

  result.current.execute()

  expect(result.current.loading).toBe(true)
})
```

### 错误测试

```typescript
it('应该处理错误', async () => {
  setupAxiosErrorMock(new Error('Test error'))

  const { result } = renderHook(() => useRequest(config, { manual: true }))

  await expect(result.current.execute()).rejects.toThrow('Test error')
})
```

---

## 🔧 最佳实践

### 1. 使用描述性测试名称

```typescript
// ✅ 好的测试名称
it('应该在请求成功时更新 data 状态')

// ❌ 不好的测试名称
it('应该工作')
```

### 2. 测试一个特定功能

```typescript
it('应该在请求完成后将 loading 设为 false', async () => {
  // 只测试 loading 状态
})

it('应该在请求成功时调用 onSuccess 回调', async () => {
  // 只测试 onSuccess 回调
})
```

### 3. 清理测试环境

```typescript
beforeEach(() => {
  resetMocks()
})

afterEach(() => {
  vi.clearAllMocks()
})
```

### 4. 使用适当的断言

```typescript
// ✅ 使用具体的断言
expect(result.current.data).toEqual({ id: 1 })
expect(result.current.loading).toBe(false)

// ❌ 过于宽泛的断言
expect(result.current).toBeTruthy()
```

### 5. 模拟异步行为

```typescript
// 使用假计时器测试异步代码
beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})
```

---

## 📚 参考资源

- [Vitest 文档](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest 匹配器](https://jestjs.io/docs/using-matchers)
- [测试 React Hooks](https://react-hooks-testing-library.com/)

---

## 🐛 报告问题

如果您发现测试问题或有改进建议，请在项目仓库中创建 Issue。

---

## ✅ 测试清单

运行测试前请确认：

- [ ] 所有 mocks 已正确设置
- [ ] 异步测试使用了 `async/await` 或 `done` 回调
- [ ] 测试名称描述性强
- [ ] 每个测试都是独立的
- [ ] 覆盖率阈值达标

---

**最后更新：** 2025-11-04
