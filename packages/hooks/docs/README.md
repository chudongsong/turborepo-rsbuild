# @linglongos/hooks 文档中心

欢迎来到 @linglongos/hooks 文档中心！这里是您了解、使用和扩展 React Hooks 库的完整指南。

## 🚀 库简介

@linglongos/hooks 是一个通用 React Hooks 库，提供可复用的 hooks，涵盖常见开发场景，致力于提升开发效率和代码质量。

### 核心特性
- **🪝 丰富 Hooks**: 提供 20+ 常用 React Hooks
- **🔧 类型安全**: 完整的 TypeScript 类型定义
- **🧪 测试覆盖**: 高测试覆盖率，确保可靠性
- **📦 轻量级**: 零依赖，体积小，性能优
- **🔄 React 19 兼容**: 支持最新 React 版本
- **🎯 实用导向**: 针对实际开发场景设计

## 📚 文档导航

### 🎯 快速开始
- [快速开始](#-快速开始) - 5分钟上手指南
- [安装使用](#-安装使用) - 详细的安装和配置
- [API 参考](#-api-参考) - 完整的 API 文档

### 📂 分类文档

#### 🛠️ 开发文档
- [01-架构设计](开发文档/01-架构设计.md) - Hooks 库架构和设计理念
- [02-性能优化策略](开发文档/02-性能优化策略.md) - Hooks 性能优化指南
- [03-测试策略](开发文档/03-测试策略.md) - 测试覆盖和测试策略
- [04-贡献指南](开发文档/04-贡献指南.md) - 如何为库贡献新的 Hooks

#### 🔗 API文档
- [01-Basic Hooks API](API文档/01-Basic-Hooks-API.md) - 基础 Hooks API 文档
- [02-Advanced Hooks API](API文档/02-Advanced-Hooks-API.md) - 高级 Hooks API 文档
- [03-Utility Hooks API](API文档/03-Utility-Hooks-API.md) - 工具类 Hooks API 文档

#### 🔨 构建文档
- [01-构建配置](构建文档/01-构建配置.md) - TypeScript 构建和打包配置
- [02-测试配置](构建文档/02-测试配置.md) - Vitest 测试框架配置
- [03-发布流程](构建文档/03-发布流程.md) - npm 包发布和维护流程

#### 📋 任务文档
- [01-Hook 需求清单](任务文档/01-Hook-需求清单.md) - 待实现的 Hooks 功能列表
- [02-版本路线图](任务文档/02-版本路线图.md) - 版本规划和开发路线图

## 🏗️ 项目结构

```
packages/hooks/
├── src/                    # 源代码
│   ├── hooks/              # Hook 实现
│   │   ├── useAsyncFetch.ts    # 异步数据获取
│   │   ├── useAxios.ts         # Axios 封装 Hook
│   │   ├── useContainerSize.ts # 容器尺寸监听
│   │   ├── useErrorHandler.ts  # 错误处理 Hook
│   │   ├── usePreload.ts       # 预加载 Hook
│   │   ├── useRequest.ts       # 请求管理 Hook
│   │   └── useSelection.ts     # 选择管理 Hook
│   ├── utils/              # 工具函数
│   │   ├── axios-cancel.ts     # Axios 取消请求工具
│   │   ├── axios-instance.ts   # Axios 实例配置
│   │   ├── check-utils/        # 验证工具
│   │   ├── color-utils/        # 颜色工具
│   │   ├── data-utils/         # 数据工具
│   │   ├── date-utils/         # 时间工具
│   │   ├── helpers.ts          # 辅助函数
│   │   ├── json-utils/         # JSON 工具
│   │   ├── random-utils/       # 随机数工具
│   │   └── type-utils/         # 类型工具
│   ├── types/              # TypeScript 类型定义
│   └── index.ts            # 导出入口
├── tests/                  # 测试文件
│   ├── __tests__/          # 集成测试
│   ├── hooks/              # Hook 测试
│   └── utils/              # 工具函数测试
├── examples/               # 使用示例
│   └── AxiosHooks.md       # Axios Hooks 示例
├── docs/                   # 文档
└── package.json            # 包配置
```

## 🛠️ 技术栈

### 核心依赖
- **React**: >= 18.0.0 - 基础框架
- **TypeScript**: >= 5.9.0 - 类型系统
- **Axios**: >= 1.7.0 - HTTP 客户端

### 开发工具
- **Vitest**: >= 3.2.0 - 测试框架
- **Biome**: >= 2.3.0 - 代码检查和格式化
- **@testing-library/react**: 组件测试库

### 构建工具
- **TypeScript Compiler**: 编译和类型检查
- **pnpm**: 包管理和工作区

## 🚀 快速开始

### 安装

```bash
# 使用 pnpm
pnpm add @linglongos/hooks

# 使用 npm
npm install @linglongos/hooks

# 使用 yarn
yarn add @linglongos/hooks
```

### 基本使用

```typescript
import React from 'react';
import { useContainerSize, useSelection, useAxios } from '@linglongos/hooks';

function MyComponent() {
  // 监听容器尺寸
  const { containerRef, containerWidth, containerHeight } = useContainerSize();
  
  // 管理选择状态
  const { selected, handleClick, toggleSelect } = useSelection<string>();
  
  // HTTP 请求
  const { response, loading, error, fetchData } = useAxios({
    url: 'https://api.example.com/data',
    method: 'get'
  });

  return (
    <div ref={containerRef}>
      <h1>尺寸: {containerWidth} x {containerHeight}</h1>
      
      <div>
        {['item1', 'item2', 'item3'].map(item => (
          <div
            key={item}
            onClick={(e) => handleClick(e, item)}
            style={{ 
              background: selected.has(item) ? '#e0e0e0' : 'transparent' 
            }}
          >
            {item}
          </div>
        ))}
      </div>
      
      {loading && <div>加载中...</div>}
      {error && <div>错误: {error.message}</div>}
      {response && <div>数据: {JSON.stringify(response.data)}</div>}
    </div>
  );
}
```

## 🪝 核心 Hooks

### useContainerSize

监听并返回容器尺寸。

```typescript
const { containerRef, containerWidth, containerHeight } = useContainerSize(800, 600);

// 参数
useContainerSize(initialWidth?: number, initialHeight?: number)

// 返回值
{
  containerRef: RefObject<HTMLDivElement>
  containerWidth: number
  containerHeight: number
}
```

### useSelection

通用的选择管理 Hook。

```typescript
const {
  selected,
  handleClick,
  toggleSelect,
  clearSelection,
  isSelected,
  getSelectedItems,
} = useSelection<string>({
  multiSelect: true,
  onSelectionChange: (selected) => {
    console.log('选择变化:', selected);
  }
});
```

### useAxios

封装 Axios 的 React Hook。

```typescript
const { 
  response, 
  error, 
  loading, 
  fetchData, 
  cancel 
} = useAxios<UserData>({
  url: '/api/users',
  method: 'get'
});
```

### useAsyncFetch

异步数据获取 Hook。

```typescript
const { 
  data, 
  loading, 
  error, 
  execute 
} = useAsyncFetch<UserData>('/api/users');
```

### useRequest

请求状态管理 Hook。

```typescript
const { 
  data, 
  loading, 
  error, 
  execute,
  reset 
} = useRequest(fetchUserData, {
  immediate: false,
  onSuccess: (data) => {
    console.log('请求成功:', data);
  },
  onError: (error) => {
    console.log('请求失败:', error);
  }
});
```

### usePreload

资源预加载 Hook。

```typescript
const { preload, isPreloaded } = usePreload();
const imageUrl = 'https://example.com/image.jpg';

// 预加载图片
useEffect(() => {
  preload(imageUrl);
}, [imageUrl]);

// 检查是否已预加载
if (isPreloaded(imageUrl)) {
  return <img src={imageUrl} alt="预加载图片" />;
}
```

### useErrorHandler

错误处理 Hook。

```typescript
const { handleError, clearError } = useErrorHandler({
  onError: (error) => {
    console.error('全局错误处理:', error);
  }
});

// 在组件中使用
try {
  await someAsyncOperation();
} catch (error) {
  handleError(error);
}
```

## 🔧 工具函数

### Axios 相关工具

```typescript
import { createAxiosInstance, cancelRequest, setupInterceptors } from '@linglongos/hooks';

// 创建 Axios 实例
const apiClient = createAxiosInstance({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 取消请求
const cancelToken = cancelRequest();

// 设置拦截器
setupInterceptors(apiClient, {
  request: (config) => {
    // 请求拦截
    return config;
  },
  response: (response) => {
    // 响应拦截
    return response;
  },
});
```

### 数据验证工具

```typescript
import { validateEmail, validatePhone, validateUrl } from '@linglongos/hooks';

// 邮箱验证
if (validateEmail(email)) {
  console.log('邮箱格式正确');
}

// 手机号验证
if (validatePhone(phone)) {
  console.log('手机号格式正确');
}

// URL 验证
if (validateUrl(url)) {
  console.log('URL 格式正确');
}
```

### 日期时间工具

```typescript
import { formatDate, relativeTime, isValidDate } from '@linglongos/hooks';

// 格式化日期
const formattedDate = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');

// 相对时间
const timeAgo = relativeTime(new Date('2024-01-01'), new Date());
// 输出: "3个月前"

// 日期有效性检查
if (isValidDate(dateString)) {
  console.log('日期有效');
}
```

### 颜色工具

```typescript
import { hexToRgb, rgbToHex, getContrastColor, generatePalette } from '@linglongos/hooks';

// 颜色转换
const rgb = hexToRgb('#3b82f6');
const hex = rgbToHex(59, 130, 246);

// 获取对比色
const textColor = getContrastColor('#3b82f6'); // 返回白色 '#ffffff'

// 生成调色板
const palette = generatePalette('#3b82f6', 5);
```

### 类型工具

```typescript
import { isPlainObject, isEmpty, deepClone, getType } from '@linglongos/hooks';

// 对象检查
if (isPlainObject(value)) {
  console.log('是纯对象');
}

// 空值检查
if (isEmpty(value)) {
  console.log('为空值');
}

// 深拷贝
const clonedData = deepClone(originalData);

// 类型获取
const typeName = getType(anyValue); // 返回 'Array', 'Object', 'String' 等
```

## 🧪 测试

### 运行测试

```bash
# 运行所有测试
pnpm test

# 监视模式运行测试
pnpm test:watch

# 生成覆盖率报告
pnpm coverage

# 运行特定测试文件
pnpm test useContainerSize.test.ts
```

### 测试示例

```typescript
import { renderHook, act } from '@testing-library/react';
import { useContainerSize } from '@linglongos/hooks';

describe('useContainerSize', () => {
  it('应该正确返回初始尺寸', () => {
    const { result } = renderHook(() => useContainerSize(100, 200));
    
    expect(result.current.containerWidth).toBe(100);
    expect(result.current.containerHeight).toBe(200);
  });

  it('应该正确更新容器尺寸', async () => {
    const { result } = renderHook(() => useContainerSize());
    
    // 模拟 resize 事件
    act(() => {
      window.innerWidth = 1024;
      window.innerHeight = 768;
      window.dispatchEvent(new Event('resize'));
    });
    
    // 这里应该根据实际实现来验证更新
    expect(result.current.containerWidth).toBeGreaterThan(0);
  });
});
```

## 📊 性能优化

### Hook 使用最佳实践

```typescript
// ✅ 推荐：使用 useMemo 缓存计算结果
const MemoizedComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      processed: true,
    }));
  }, [data]);
  
  return <div>{/* 使用 processedData */}</div>;
});

// ✅ 推荐：使用 useCallback 缓存事件处理函数
const ComponentWithCallback = ({ onItemClick }) => {
  const handleClick = useCallback((item) => {
    onItemClick(item);
  }, [onItemClick]);
  
  return <List onItemClick={handleClick} />;
};

// ❌ 避免：在 render 中创建对象或函数
const BadComponent = ({ items }) => {
  return (
    <div>
      {items.map((item, index) => (
        <Item 
          key={item.id}
          // 避免这样做，每次 render 都会创建新对象
          data={{ item, index }}
          // 避免这样做，每次 render 都会创建新函数
          onClick={() => console.log(item.id)}
        />
      ))}
    </div>
  );
};
```

### 内存优化

```typescript
// ✅ 使用 useRef 缓存计算结果
const useCachedData = (data: DataType) => {
  const cacheRef = useRef<Map<string, Result>>(new Map());
  
  const getCachedResult = useCallback((key: string, compute: () => Result) => {
    if (cacheRef.current.has(key)) {
      return cacheRef.current.get(key)!;
    }
    
    const result = compute();
    cacheRef.current.set(key, result);
    return result;
  }, []);
  
  return { getCachedResult };
};

// ✅ 清理副作用
const useEventListener = (eventName: string, handler: EventHandler) => {
  const savedHandler = useRef(handler);
  
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  
  useEffect(() => {
    const eventHandler = (event: Event) => savedHandler.current(event);
    window.addEventListener(eventName, eventHandler);
    
    return () => {
      window.removeEventListener(eventName, eventHandler);
    };
  }, [eventName]);
};
```

## 🔧 配置和自定义

### Axios 配置

```typescript
// 自定义 Axios 配置
import { setupAxiosDefaults } from '@linglongos/hooks';

// 全局配置
setupAxiosDefaults({
  baseURL: 'https://api.example.com',
  timeout: 30000,
  headers: {
    'Authorization': 'Bearer your-token',
  },
  interceptors: {
    request: [
      (config) => {
        // 请求拦截器
        return config;
      },
    ],
    response: [
      (response) => {
        // 响应拦截器
        return response;
      },
      (error) => {
        // 错误处理拦截器
        return Promise.reject(error);
      },
    ],
  },
});
```

### 主题配置

```typescript
// 主题配置
const themeConfig = {
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
};
```

## 🚀 发布和维护

### 版本发布

```bash
# 1. 更新版本号
npm version patch|minor|major

# 2. 构建和测试
pnpm build
pnpm test
pnpm lint

# 3. 发布到 npm
npm publish

# 4. 创建发布标签
git tag v1.0.0
git push origin v1.0.0
```

### 文档更新

```bash
# 生成 API 文档
pnpm run docs:build

# 启动文档服务器
pnpm run docs:serve
```

## 🤝 贡献指南

### 添加新 Hook

1. **创建 Hook 文件**
```typescript
// src/hooks/useNewHook.ts
import { useState, useEffect } from 'react';

interface UseNewHookOptions {
  enabled?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

interface UseNewHookReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: () => Promise<void>;
}

export function useNewHook<T>(
  fetcher: () => Promise<T>,
  options: UseNewHookOptions = {}
): UseNewHookReturn<T> {
  const { enabled = true, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetcher();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      execute();
    }
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, execute };
}
```

2. **添加测试**
```typescript
// src/__tests__/hooks/useNewHook.test.ts
import { renderHook, act } from '@testing-library/react';
import { useNewHook } from '../useNewHook';

describe('useNewHook', () => {
  it('应该正确获取数据', async () => {
    const mockFetcher = jest.fn().mockResolvedValue('test data');
    const { result } = renderHook(() => useNewHook(mockFetcher));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.data).toBe('test data');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('应该正确处理错误', async () => {
    const mockFetcher = jest.fn().mockRejectedValue(new Error('API Error'));
    const { result } = renderHook(() => useNewHook(mockFetcher));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('API Error');
  });
});
```

3. **更新导出**
```typescript
// src/index.ts
export { useNewHook } from './hooks/useNewHook';
// ... 其他 exports
```

4. **更新文档**
```markdown
### useNewHook

新 Hook 的文档说明...

```typescript
const { data, loading, error, execute } = useNewHook(fetchData, {
  enabled: true,
  onSuccess: (result) => console.log('成功:', result),
  onError: (error) => console.log('失败:', error),
});
```
```

### 代码规范

- **TypeScript**: 严格模式，所有函数必须有类型定义
- **测试**: 新 Hook 必须包含完整的测试覆盖
- **文档**: 添加清晰的文档注释和使用示例
- **命名**: 使用描述性的变量名和函数名
- **性能**: 避免不必要的重渲染和内存泄漏

## 📞 获取帮助

### 文档支持
- 📖 查看完整的 [API 文档](API文档/)
- 🔍 搜索 Hooks 和工具函数
- 📋 查看 [使用示例](examples/)

### 技术支持
- 💬 创建 Issue 报告问题
- 📧 发送邮件到维护者
- 🎯 参与项目讨论

### 社区贡献
- 🌟 欢迎提交 Pull Request
- 🐛 报告 Bug 和问题
- 💡 提出新功能建议

## 🔄 更新日志

### v2.0.0 (2025年11月)
- ✨ 升级到 React 19 兼容
- 🚀 添加 5 个新的 Hooks
- 🔧 优化性能和内存使用
- 📚 完善文档和使用示例
- 🧪 提升测试覆盖率到 95%

### v1.5.0 (2025年10月)
- 📦 添加 Axios 相关工具函数
- 🛠️ 增强错误处理能力
- 📊 添加性能监控 Hooks
- 🔍 改进类型定义

### v1.0.0 (2025年9月)
- 🎉 初始版本发布
- 🪝 提供 15 个核心 Hooks
- 📖 完整的文档和使用指南

---

**开始使用 Hooks** - 查看 [Basic Hooks API](API文档/01-Basic-Hooks-API.md) 了解详细用法