# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此代码库中工作提供指导。

## 快速参考

### 常用命令

**安装**
- `pnpm install` - 安装依赖项（需要 pnpm v8.15.6+）

**开发**
- `pnpm dev` - 并行运行所有开发服务器（需要 `.env` 文件）
- `pnpm with-env turbo dev` - 带环境变量的开发模式
- `pnpm build` - 按依赖顺序构建所有应用和包
- `pnpm lint` - 对所有工作空间运行代码检查

**格式化与检查 (Biome)**
- `pnpm biome:check` - 检查所有文件的代码风格/格式错误
- `pnpm biome:check:fix` - 修复所有代码风格/格式问题
- `pnpm biome:lint` - 仅运行代码检查
- `pnpm biome:format` - 仅运行代码格式化

**测试**
- `pnpm -C packages/utils test` - 运行 utils 包的 Rust 测试
- `pnpm -C packages/utils test:watch` - 运行监视模式测试
- `pnpm -C apps/btpanel test` - 运行 btpanel 的 Vitest 测试
- `pnpm -C apps/btpanel coverage` - 运行带覆盖率的测试

**各项目专用命令**

*Vue 面板 (btpanel)*
- `pnpm -C apps/btpanel dev` - 启动 Vue 开发服务器
- `pnpm -C apps/btpanel build` - 使用 Rsbuild + Gulp 构建
- `pnpm -C apps/btpanel build:git` - 构建用于 git 部署
- `pnpm -C apps/btpanel build:docker` - 构建用于 Docker
- `pnpm -C apps/btpanel preview` - 预览生产构建
- `pnpm -C apps/btpanel lint` - ESLint (Vue/TypeScript)

*React 面板 (react-btpanel)*
- `pnpm -C apps/react-btpanel dev` - 启动 React 开发服务器（端口 3030）
- `pnpm -C apps/react-btpanel build` - 使用 Rsbuild 构建
- `pnpm -C apps/react-btpanel preview` - 预览生产构建
- `pnpm -C apps/react-btpanel lint` - Biome 代码检查
- `pnpm -C apps/react-btpanel check` - Biome 检查（代码检查 + 格式化）

*桌面应用 (desktop)*
- `pnpm -C apps/desktop dev` - 启动 Vite 开发服务器
- `pnpm -C apps/desktop build` -  producción 构建
- `pnpm -C apps/desktop test` - 运行 Vitest 测试
- `pnpm -C apps/desktop test:watch` - 监视模式测试
- `pnpm -C apps/desktop coverage` - 运行带覆盖率的测试
- `pnpm -C apps/desktop preview` - 预览生产构建

*API 服务 (api)*
- `pnpm -C apps/api dev` - 启动开发模式（端口 4000）
- `pnpm -C apps/api build` - 构建 TypeScript
- `pnpm -C apps/api start` - 启动生产服务器
- `pnpm -C apps/api test` - 运行测试
- `pnpm -C apps/api test:local` - 本地测试
- `pnpm -C apps/api ci` - CI 模式测试

*UI 包*
- `pnpm -C packages/ui dev` - 启动 UI 库开发服务器
- `pnpm -C packages/ui build` - 构建 UMD 分发版本
- `pnpm -C packages/ui type-check` - TypeScript 类型检查
- `pnpm -C packages/ui clean` - 清理构建产物
- `pnpm -C packages/ui lint` - ESLint (TypeScript)

*Utils 包*
- `pnpm -C packages/utils dev` - 启动开发服务器
- `pnpm -C packages/utils build` - 使用 Rsbuild + TypeScript 构建
- `pnpm -C packages/utils test` - 带覆盖率的 Rust 测试
- `pnpm -C packages/utils lint` - Biome 代码检查
- `pnpm -C packages/utils lint:fix` - 自动修复 Biome 问题
- `pnpm -C packages/utils format` - Biome 代码格式化

*Shared Types 包*
- `pnpm -C packages/shared-types build` - 构建类型定义

*LinglongOS Utils 包*
- `pnpm -C packages/linglongos-utils dev` - 启动开发服务器
- `pnpm -C packages/linglongos-utils build` - 使用 tsup 构建
- `pnpm -C packages/linglongos-utils test` - 运行 Vitest 测试
- `pnpm -C packages/linglongos-utils test:watch` - 监视模式测试
- `pnpm -C packages/linglongos-utils coverage` - 带覆盖率的测试

### 环境变量

在根目录创建 `.env` 文件：
```bash
PUBLIC_HOST=http://localhost:3000
PUBLIC_REMOTE_1=http://localhost:3001
PUBLIC_REMOTE_2=http://localhost:3002
```

这些变量用于 Turbo 的缓存机制，并在构建/开发过程中传递给应用。

## 架构概览

这是一个 **Turborepo 单体仓库**，包含 **双框架服务器管理面板**：

### 单体仓库结构

```
/apps
  ├── btpanel/              # Vue 3 + TypeScript 面板 (Element Plus)
  ├── react-btpanel/        # React 19 + TypeScript 面板（现代重构版）
  ├── desktop/              # 玲珑OS 桌面应用 (React 19 + Vite + Redux Toolkit)
  └── api/                  # 玲珑OS API 服务 (Node.js + Egg.js + SQLite)

/packages
  ├── ui/                   # 共享 React UI 组件 (shadcn/ui + Tailwind)
  ├── utils/                # TypeScript 工具函数 (Rust 测试)
  ├── linglongos-utils/     # 玲珑OS 工具库 (Vitest 测试)
  ├── shared-types/         # 共享 TypeScript 类型定义
  └── hooks/                # 共享 hooks（空目录，计划中）

/environment
  └── tsconfig/             # TypeScript 环境配置
```

### 技术栈

| 层级 | 技术 |
|-------|-----------|
| **单体仓库** | Turborepo v2.0.11 + pnpm workspaces |
| **构建系统** | Rsbuild v1.x (Rspack, 基于 Rust), Vite 7 (desktop) |
| **语言** | TypeScript 贯穿始终, Vue SFC, React TSX, Node.js (API) |
| **样式** | Tailwind CSS v4, UnoCSS (Vue), Sass |
| **代码检查** | Biome v2.3.2 (统一配置) |
| **测试** | Vitest (Vue/desktop/utils), rstest (utils), Egg.js (API) |
| **状态管理** | Zustand (React), Redux Toolkit (desktop) |

### 核心特性

- **模块联邦**: `remote1` 和 `remote2` 在应用间共享路由
- **性能**: 基于 Rust 的 Rspack 打包器，代码分割，并行构建
- **双实现**: Vue（传统）和 React（现代）两个版本并存
- **共享组件**: React UI 库可在所有 React 应用中使用
- **服务器管理**: 终端集成，部署工具，监控
- **统一操作环境**: 玲珑OS 提供多面板 API 统一前端操作环境
- **API 代理服务**: Node.js + Egg.js 后端服务，支持面板集成
- **SQLite 数据库**: API 服务使用 SQLite 进行数据存储
- **拖拽支持**: @dnd-kit 驱动的桌面应用界面

### 代码组织

- **Vue 面板**: 基于 Element Plus 组件的全功能服务器管理界面
- **React 面板**: 基于 React 19 的现代重构版，使用 TanStack Router 和 Zustand
- **桌面应用**: 玲珑OS 统一操作环境，React 19 + Redux Toolkit + Tailwind CSS v4
- **API 服务**: Node.js + Egg.js + SQLite，提供面板管理和代理服务
- **UI 库**: 基于 Radix UI + shadcn/ui 模式的可复用 React 组件
- **Utils**: 带全面 Rust 测试的纯函数工具库
- **LinglongOS Utils**: 玲珑OS 工具库，带 Vitest 测试和 tsup 构建
- **Shared Types**: 跨应用共享的 TypeScript 类型定义

### 构建配置

- **构建配置**: 每个应用/包都有 `rsbuild.config.ts`，桌面应用使用 `vite.config.ts`
- **Biome**: `biome.json` - 标签缩进，300 行宽度，单引号，配置覆盖 `apps/**`、`packages/**`、`environment/**`
- **配置清理**: 已移除 ESLint、Prettier、Stylint 等配置，统一使用 Biome
- **Turborepo**: `turbo.json` - 任务依赖图，缓存，环境管理，支持 type-check 和 test 任务
- **TypeScript**: React 19 覆盖设置（需要 Node 18+）

### 重要说明

- 使用 **React 19**（通过工作区覆盖固定）
- **代码检查策略**: 所有项目统一使用 **Biome** 进行代码检查和格式化
  - biomes.json 覆盖范围：`apps/**`、`packages/**`、`environment/**`
  - 支持 Vue (.vue)、TypeScript (.ts/.tsx)、JavaScript (.js/.jsx)、CSS 等文件
  - 统一的格式化规则：标签缩进、300 行宽度、单引号
- **Vue 应用集成了 Gulp** 用于额外的构建任务
- **多种测试框架** - Vue 使用 Vitest，desktop 和 linglongos-utils 使用 Vitest，utils 使用 rstest，API 使用 Egg.js 测试
- **迁移状态**: 所有项目已从 ESLint + Prettier 迁移至 Biome
- **新项目**: desktop 和 api 从 linglongos 项目迁移而来，shared-types 和 linglongos-utils 为新增包
- **API 文档**: API 服务运行在 http://localhost:4000/docs (Swagger UI)
- **预提交钩子**: 使用 Husky + lint-staged 进行预提交验证（已移除 ESLint + Prettier 相关配置）
