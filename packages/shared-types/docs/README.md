# @linglongos/shared-types 文档中心

欢迎来到 @linglongos/shared-types 文档中心！这里是您了解和使用跨应用共享 TypeScript 类型定义的指南。

## 🚀 库简介

@linglongos/shared-types 是一个提供跨应用共享 TypeScript 类型定义的包，确保整个单体仓库的类型一致性。

### 核心特性
- **🔧 类型定义**: 窗口、系统配置等共享类型
- **📦 轻量级**: 仅包含类型定义，无运行时代码
- **🔄 统一维护**: 所有应用共享同一套类型定义
- **📚 文档完整**: 完整的 JSDoc 注释和说明

## 🚀 快速开始

### 安装

```bash
pnpm add @linglongos/shared-types
```

### 基本使用

```typescript
import { WindowConfig, SystemInfo } from '@linglongos/shared-types';

interface MyAppProps {
  windowConfig: WindowConfig;
  systemInfo: SystemInfo;
}

// 在应用中使用
const appConfig: WindowConfig = {
  width: 800,
  height: 600,
  title: '我的应用'
};
```

## 📦 核心类型

### WindowConfig

```typescript
interface WindowConfig {
  id: string;
  title: string;
  width: number;
  height: number;
  x?: number;
  y?: number;
  resizable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
}
```

### SystemInfo

```typescript
interface SystemInfo {
  platform: 'darwin' | 'win32' | 'linux';
  version: string;
  arch: string;
  cpus: number;
  memory: number;
}
```

## 🚀 构建和维护

```bash
# 构建类型定义
pnpm build

# 类型检查
pnpm type-check
```

---

**开始使用共享类型** - 查看源码了解所有可用类型