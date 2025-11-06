# @linglongos/utils 文档中心

欢迎来到 @linglongos/utils 文档中心！这里是您了解、使用和扩展通用工具库的完整指南。

## 🚀 库简介

@linglongos/utils 是一个 v2.0.0 版本的通用工具库，整合了多种实用工具函数，支持现代 JavaScript/TypeScript 开发。

### 核心特性
- **🛠️ 丰富工具**: 提供颜色、日期、数字、字符串等工具函数
- **🧪 双测试**: 支持 Vitest 和 Rust rstest 测试
- **📦 轻量级**: 零依赖，高性能
- **🔧 TypeScript**: 完整类型定义支持
- **⚡ 高性能**: 优化的算法实现

## 🚀 快速开始

### 安装

```bash
pnpm add @linglongos/utils
```

### 基本使用

```typescript
import { formatNumber, generateRandomColor, isValidEmail } from '@linglongos/utils';

// 数字格式化
const formatted = formatNumber(1234567.89); // "1,234,567.89"

// 颜色工具
const color = generateRandomColor(); // "#3b82f6"

// 验证工具
const isValid = isValidEmail('user@example.com'); // true
```

## 🧪 测试

```bash
# 运行 Vitest 测试
pnpm test

# 运行 Rust rstest 测试
pnpm test:rust

# 监视模式
pnpm test:watch
```

---

**开始使用工具函数** - 查看源码了解所有可用工具