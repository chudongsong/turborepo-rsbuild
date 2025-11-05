# Axios Hooks 使用指南

本文档展示如何使用 `@linglongos/hooks` 包中提供的各种 Axios Hooks。

## 目录

- [基础用法](#基础用法)
- [useAxios](#useaxios)
- [useRequest](#userequest)
- [useAsyncFetch](#useasyncfetch)
- [useErrorHandler](#useerrorhandler)
- [usePreload](#usepreload)
- [完整示例](#完整示例)

---

## 基础用法

### 安装依赖

```bash
pnpm add @linglongos/hooks axios
```

### 导入 Hooks

```typescript
import {
  useAxios,
  useRequest,
  useAsyncFetch,
  useErrorHandler,
  usePreload,
} from '@linglongos/hooks'
```

---

## useAxios

基础 Axios Hook，提供直接访问 axios 实例的能力。

### 基本用法

```typescript
import { useAxios } from '@org/hooks'

function MyComponent() {
  const axios = useAxios()

  const handleRequest = async () => {
    try {
      const result = await axios.post('user/login', {
        data: { username: 'admin', password: '123456' }
      })
      console.log(result)
    } catch (error) {
      console.error(error)
    }
  }

  return <button onClick={handleRequest}>登录</button>
}
```

---

## useRequest

高级请求 Hook，提供完整的状态管理。

### 自动执行

```typescript
import { useRequest } from '@org/hooks'

function UserList() {
  const {
    data,
    loading,
    error,
    execute,
  } = useRequest(
    {
      url: 'user/list',
      method: 'GET',
    },
    {
      immediate: true, // 组件挂载时自动执行
      onSuccess: (data) => {
        console.log('请求成功:', data)
      },
      onError: (error) => {
        console.error('请求失败:', error)
      },
    }
  )

  return (
    <div>
      {loading && <div>加载中...</div>}
      {error && <div>错误: {error.message}</div>}
      {data && <ul>{data.map(user => <li key={user.id}>{user.name}</li>)}</ul>}
      <button onClick={() => execute()}>刷新</button>
    </div>
  )
}
```

### 手动控制

```typescript
import { useLazyRequest } from '@org/hooks'

function LoginForm() {
  const { run, loading, data } = useLazyRequest({
    url: 'user/login',
    method: 'POST',
  })

  const handleSubmit = async (formData) => {
    try {
      const result = await run({ data: formData })
      if (result.status) {
        // 登录成功
      }
    } catch (error) {
      // 处理错误
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" />
      <input name="password" type="password" />
      <button type="submit" disabled={loading}>
        {loading ? '登录中...' : '登录'}
      </button>
    </form>
  )
}
```

### POST/GET 专用 Hooks

```typescript
import { usePost, useGet } from '@org/hooks'

// POST 请求
function CreateUser() {
  const { run, loading } = usePost('user/create', {
    onSuccess: (data) => {
      console.log('用户创建成功')
    },
  })

  return (
    <button onClick={() => run({ name: '张三', email: 'zhangsan@example.com' })}>
      创建用户 {loading && '...'}
    </button>
  )
}

// GET 请求
function UserProfile({ userId }) {
  const { data, loading, error } = useGet(`user/${userId}`, {
    immediate: true,
  })

  if (loading) return <div>加载中...</div>
  if (error) return <div>加载失败</div>
  return <div>{data.name}</div>
}
```

---

## useAsyncFetch

Promise 风格的异步请求 Hook。

### 基本用法

```typescript
import { useAsyncFetch } from '@org/hooks'

function SearchBox() {
  const { execute, data, loading, error } = useAsyncFetch({
    onSuccess: (data) => {
      console.log('搜索结果:', data)
    },
  })

  const handleSearch = async (query) => {
    try {
      await execute({
        url: 'search',
        method: 'GET',
        data: { q: query },
      })
    } catch (err) {
      console.error('搜索失败:', err)
    }
  }

  return (
    <div>
      <input onChange={(e) => handleSearch(e.target.value)} />
      {loading && <div>搜索中...</div>}
      {error && <div>搜索出错</div>}
      {data && <div>结果: {data.length}</div>}
    </div>
  )
}
```

### POST/GET 变体

```typescript
import { useAsyncPost, useAsyncGet } from '@org/hooks'

function UploadFile() {
  const { execute, loading } = useAsyncPost({
    onSuccess: () => alert('上传成功!'),
    onError: () => alert('上传失败!'),
  })

  const handleUpload = async (file) => {
    await execute('upload', { file })
  }

  return (
    <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
  )
}
```

---

## useErrorHandler

全局错误处理 Hook。

### 基本用法

```typescript
import { useErrorHandler } from '@org/hooks'

function MyComponent() {
  const { handleError } = useErrorHandler({
    showError: true,
    redirectOn401: true,
  })

  const handleOperation = async () => {
    try {
      await someAsyncOperation()
    } catch (error) {
      handleError(error, '操作失败')
    }
  }

  return <button onClick={handleOperation}>执行操作</button>
}
```

### 错误重试

```typescript
import { useErrorHandler } from '@org/hooks'

function RetryableOperation() {
  const { errors, retryError } = useErrorHandler()

  const handleRetry = async (errorId) => {
    try {
      await retryError(errorId, () => someAsyncOperation())
    } catch (error) {
      console.error('重试失败:', error)
    }
  }

  return (
    <div>
      {errors.map(error => (
        <div key={error.id}>
          {error.message}
          {error.retryable && (
            <button onClick={() => handleRetry(error.id)}>
              重试
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
```

---

## usePreload

文件预加载 Hook。

### 预加载文件

```typescript
import { usePreload } from '@org/hooks'

function PreloadAssets() {
  const { loadFile, loading, loaded, total } = usePreload({
    onProgress: (loaded, total) => {
      console.log(`加载进度: ${loaded}/${total}`)
    },
    onComplete: (files) => {
      console.log('所有文件加载完成', files)
    },
  })

  const handleLoad = async () => {
    await loadFile([
      'vendor.js',
      'app.css',
      'lib.js',
    ])
  }

  return (
    <div>
      <button onClick={handleLoad}>预加载资源</button>
      {loading && <div>加载中: {loaded}/{total}</div>}
    </div>
  )
}
```

### 脚本预加载

```typescript
import { useScript } from '@org/hooks'

function LoadThirdPartyScript() {
  const { load, loaded, loading, error } = useScript('https://example.com/sdk.js')

  useEffect(() => {
    load()
  }, [load])

  return (
    <div>
      {loading && <div>加载脚本中...</div>}
      {loaded && <div>脚本加载完成!</div>}
      {error && <div>脚本加载失败</div>}
    </div>
  )
}
```

### 样式预加载

```typescript
import { useStyle } from '@org/hooks'

function LoadTheme() {
  const { load, loaded, loading } = useStyle('/themes/dark.css')

  const toggleTheme = () => {
    load()
  }

  return (
    <button onClick={toggleTheme}>
      加载深色主题 {loading && '...'}
    </button>
  )
}
```

---

## 完整示例

### 用户管理系统

```typescript
import {
  useRequest,
  useLazyRequest,
  useErrorHandler,
} from '@org/hooks'

function UserManagement() {
  // 错误处理
  const { handleError } = useErrorHandler({
    showError: true,
  })

  // 获取用户列表
  const {
    data: users,
    loading: listLoading,
    execute: fetchUsers,
  } = useRequest(
    { url: 'users', method: 'GET' },
    {
      immediate: true,
      onError: (error) => handleError(error, '获取用户列表失败'),
    }
  )

  // 创建用户
  const {
    run: createUser,
    loading: createLoading,
  } = useLazyPost('users', {
    onSuccess: () => {
      fetchUsers() // 刷新列表
      alert('用户创建成功')
    },
    onError: (error) => handleError(error, '创建用户失败'),
  })

  // 删除用户
  const {
    run: deleteUser,
    loading: deleteLoading,
  } = useLazyRequest(
    ({ id }) => ({
      url: `users/${id}`,
      method: 'DELETE',
    }),
    {
      onSuccess: () => {
        fetchUsers()
        alert('用户删除成功')
      },
      onError: (error) => handleError(error, '删除用户失败'),
    }
  )

  return (
    <div>
      <h2>用户管理</h2>

      {/* 创建用户表单 */}
      <CreateUserForm
        onSubmit={createUser}
        loading={createLoading}
      />

      {/* 用户列表 */}
      {listLoading ? (
        <div>加载中...</div>
      ) : (
        <UserList
          users={users}
          onDelete={deleteUser}
          loading={deleteLoading}
        />
      )}
    </div>
  )
}

function CreateUserForm({ onSubmit, loading }) {
  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await onSubmit({
      name: formData.get('name'),
      email: formData.get('email'),
    })
    e.currentTarget.reset()
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="姓名" required />
      <input name="email" placeholder="邮箱" required type="email" />
      <button type="submit" disabled={loading}>
        {loading ? '创建中...' : '创建用户'}
      </button>
    </form>
  )
}

function UserList({ users, onDelete, loading }) {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>姓名</th>
          <th>邮箱</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {users?.map(user => (
          <tr key={user.id}>
            <td>{user.id}</td>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>
              <button
                onClick={() => onDelete({ id: user.id })}
                disabled={loading}
              >
                删除
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

---

## API 参考

详细 API 文档请参考类型定义文件：
- [types/axios.ts](../src/types/axios.ts)

所有 Hooks 的完整类型定义都在该文件中查看。

---

## 迁移指南

从 Vue 版本迁移到 React 版本的主要变化：

1. **Vue 特定的 API 替换**：
   - `nextTick` → 使用 React 的 `useEffect`
   - Vue 响应式数据 → React `useState`
   - Vue 组件实例 → React 函数组件

2. **错误处理**：
   - Vue 错误边界 → React Error Boundaries
   - `console.log` → 使用 `onSuccess`/`onError` 回调

3. **生命周期**：
   - `mounted` → `useEffect`
   - `beforeUnmount` → cleanup 函数

---

## 许可证

MIT
