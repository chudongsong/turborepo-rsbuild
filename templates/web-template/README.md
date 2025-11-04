# Web 模板

基于 React 19 + TypeScript + Vite 的现代化前端项目模板。

## 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite 7
- **样式方案**: Tailwind CSS v4
- **组件库**: shadcn/ui + Radix UI
- **路由**: React Router v7
- **状态管理**: Zustand
- **数据获取**: React Query
- **代码检查**: Biome
- **测试**: Vitest + Testing Library

## 项目结构

```
src/
├── components/    # 公共组件
├── pages/         # 页面组件
├── hooks/         # 自定义 Hooks
├── store/         # 状态管理
├── services/      # API 服务
├── types/         # 类型定义
├── utils/         # 工具函数
└── assets/        # 静态资源
```

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 预览生产版本

```bash
pnpm preview
```

### 运行测试

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

## 特性

- ⚡️ 基于 Vite 的极速开发体验
- 🔥 React 19 最新特性支持
- 📦 基于 pnpm 的高效包管理
- 🎨 Tailwind CSS 原子化样式
- 🧩 shadcn/ui 组件库
- ✅ 完整的测试配置
- 📝 严格的 TypeScript 配置
- 🎯 基于 Biome 的代码质量保证

## 使用说明

### 添加新页面

1. 在 `src/pages/` 目录下创建新组件
2. 在 `src/App.tsx` 中添加路由配置
3. 可选：在 `src/components/` 中创建对应布局

### 添加新组件

1. 在 `src/components/` 目录下创建组件
2. 使用 `@/components` 别名导入
3. 利用 `@/utils/cn` 合并 className

### 添加 API 服务

1. 在 `src/services/` 目录下创建服务模块
2. 在 `src/types/` 中定义数据类型
3. 使用 React Query 进行数据获取

### 自定义样式

1. 在 `tailwind.config.js` 中扩展主题
2. 在 `src/index.css` 中使用 CSS 变量
3. 利用 `@apply` 指令复用样式

## 最佳实践

- 使用 TypeScript 严格模式进行类型检查
- 组件采用函数式编程 + Hooks
- 使用 Zustand 进行状态管理
- 使用 React Query 进行服务端状态管理
- 遵循 Biome 代码规范
- 编写单元测试和集成测试

## 相关资源

- [React 文档](https://react.dev/)
- [Vite 文档](https://vitejs.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [shadcn/ui 文档](https://ui.shadcn.com/)
- [React Router 文档](https://reactrouter.com/)
- [Zustand 文档](https://docs.pmnd.rs/zustand/)
- [React Query 文档](https://tanstack.com/query/latest)
- [Biome 文档](https://biomejs.dev/)
- [Vitest 文档](https://vitest.dev/)
