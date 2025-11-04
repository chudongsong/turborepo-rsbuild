# CLAUDE.md

本文档为 Claude Code (claude.ai/code) 在本代码仓库中工作提供指导说明。

## 快速参考

### 常用命令

**安装依赖**
- `pnpm install` - 安装所有依赖（需要 pnpm v8.15.6+）

**开发命令**
- `pnpm dev` - 并行启动所有开发服务器（需要 `.env` 文件）
- `pnpm with-env turbo dev` - 带环境变量的开发模式
- `pnpm build` - 按依赖顺序构建所有应用和包
- `pnpm lint` - 对所有工作区进行代码检查

**代码格式化与检查（Biome）**
- `pnpm biome:check` - 检查所有文件的代码风格/格式问题
- `pnpm biome:check:fix` - 自动修复所有代码风格/格式问题
- `pnpm biome:lint` - 仅运行代码检查
- `pnpm biome:format` - 仅运行代码格式化
- `pnpm biome:format:fix` - 修复代码格式问题

**测试命令**
- `pnpm -C packages/utils test` - 运行 utils 包的 Rust 测试
- `pnpm -C packages/utils test:watch` - 监视模式运行测试
- `pnpm -C apps/btpanel test` - 运行 btpanel 的 Vitest 测试
- `pnpm -C apps/btpanel coverage` - 运行带覆盖率的测试

### 各项目专用命令

**Vue 面板 (btpanel)**
- `pnpm -C apps/btpanel dev` - 启动 Vue 开发服务器
- `pnpm -C apps/btpanel build` - 使用 Rsbuild + Gulp 构建
- `pnpm -C apps/btpanel build:git` - 构建 Git 部署版本
- `pnpm -C apps/btpanel build:docker` - 构建 Docker 镜像版本
- `pnpm -C apps/btpanel preview` - 预览生产构建结果
- `pnpm -C apps/btpanel lint` - Biome 代码检查（Vue/TypeScript）

**React 面板 (react-btpanel)**
- `pnpm -C apps/react-btpanel dev` - 启动 React 开发服务器
- `pnpm -C apps/react-btpanel build` - 使用 Rsbuild 构建
- `pnpm -C apps/react-btpanel preview` - 预览生产构建结果
- `pnpm -C apps/react-btpanel check` - Biome 检查（代码检查 + 格式化）

**桌面应用 (desktop-app)**
- `pnpm -C apps/desktop-app dev` - 启动 Vite 开发服务器
- `pnpm -C apps/desktop-app build` - 生产环境构建
- `pnpm -C apps/desktop-app test` - 运行 Vitest 测试
- `pnpm -C apps/desktop-app test:watch` - 监视模式运行测试
- `pnpm -C apps/desktop-app coverage` - 运行带覆盖率的测试
- `pnpm -C apps/desktop-app preview` - 预览生产构建结果

**API 服务 (api-service)**
- `pnpm -C apps/api-service dev` - 启动开发服务器
- `pnpm -C apps/api-service build` - TypeScript 构建
- `pnpm -C apps/api-service start` - 启动生产服务器
- `pnpm -C apps/api-service test` - 运行测试
- `pnpm -C apps/api-service test:local` - 本地测试
- `pnpm -C apps/api-service ci` - CI 模式测试

**UI 组件库**
- `pnpm -C packages/ui dev` - 启动 UI 库开发服务器
- `pnpm -C packages/ui build` - 构建 UMD 发行版
- `pnpm -C packages/ui type-check` - TypeScript 类型检查
- `pnpm -C packages/ui clean` - 清理构建产物

**通用 Hooks 库**
- `pnpm -C packages/hooks dev` - 启动开发服务器
- `pnpm -C packages/hooks build` - TypeScript 构建
- `pnpm -C packages/hooks test` - 运行 Vitest 测试
- `pnpm -C packages/hooks test:watch` - 监视模式运行测试
- `pnpm -C packages/hooks coverage` - 运行带覆盖率的测试
- `pnpm -C packages/hooks lint` - Biome 代码检查

**Utils 工具库**
- `pnpm -C packages/utils dev` - 启动开发服务器
- `pnpm -C packages/utils build` - 使用 Rsbuild + TypeScript 构建
- `pnpm -C packages/utils test` - 运行 Vitest 测试（支持 Rust rstest）
- `pnpm -C packages/utils test:watch` - 监视模式运行测试
- `pnpm -C packages/utils coverage` - 运行带覆盖率的测试
- `pnpm -C packages/utils lint` - Biome 代码检查

**共享类型包**
- `pnpm -C packages/shared-types build` - 构建类型定义
- `pnpm -C packages/shared-types type-check` - TypeScript 类型检查

### 环境变量

在项目根目录创建 `.env` 文件：
```bash
PUBLIC_HOST=http://localhost:3000
PUBLIC_REMOTE_1=http://localhost:3001
PUBLIC_REMOTE_2=http://localhost:3002
```

这些变量用于 Turborepo 的缓存机制，并在构建/开发过程中传递给各应用。

## 架构概览

这是一个 **Turborepo 单体仓库**，包含 **双框架服务器管理面板**：

### 项目结构

```
/apps
  ├── web-panel-vue/        # Vue 3 + TypeScript 面板（基于 Element Plus）
  ├── web-panel-react/      # React 19 + TypeScript 面板（现代化重构）
  ├── desktop-app/          # LinglongOS 桌面应用（React 19 + Vite + Redux Toolkit）
  └── api-service/          # LinglongOS API 服务（Node.js + Egg.js + SQLite）

/packages
  ├── ui/                   # 共享 React UI 组件（shadcn/ui + Tailwind）
  ├── hooks/                # 通用 React Hooks 库（useContainerSize、useSelection）
  ├── utils/                # 通用工具库（v2.0.0，合并了 linglongos-utils）
  └── shared-types/         # 共享 TypeScript 类型定义

/templates
  └── web-template/         # 独立的前端项目模板（React 19 + Vite）

/docs
  ├── README.md             # 文档索引
  └── PROJECT_OPTIMIZATION.md  # 项目优化报告
```

### 技术栈

| 层级 | 技术 |
|-------|-----------|
| **单体仓库** | Turborepo v2.0.11 + pnpm 工作区 |
| **构建系统** | Rsbuild v1.x（Rspack，基于 Rust），Vite 7（桌面应用） |
| **开发语言** | 全程 TypeScript，Vue SFC，React TSX，Node.js（API） |
| **样式方案** | Tailwind CSS v4，UnoCSS（Vue），Sass |
| **代码检查** | Biome v2.3.2（统一配置） |
| **测试框架** | Vitest（Vue/desktop/utils），rstest（utils），Egg.js（API） |
| **状态管理** | Zustand（React），Redux Toolkit（桌面应用） |

### 核心特性

- **模块联邦**：通过 `remote1` 和 `remote2` 实现应用间路由共享
- **高性能**：基于 Rust 的 Rspack 打包器，代码分割，并行构建
- **双实现**：Vue（传统版本）和 React（现代版本）并存
- **共享组件**：React UI 库可在所有 React 应用中使用
- **服务器管理**：终端集成，部署工具，监控面板
- **统一运行环境**：LinglongOS 提供多面板 API 统一前端操作
- **API 代理服务**：Node.js + Egg.js 后端服务，支持面板集成
- **SQLite 数据库**：API 服务使用 SQLite 进行数据存储
- **拖拽支持**：@dnd-kit 驱动的桌面应用界面

### 代码组织

- **Vue 面板**：基于 Element Plus 组件的全功能服务器管理界面
- **React 面板**：基于 React 19 的现代化重构，使用 TanStack Router 和 Zustand
- **桌面应用**：LinglongOS 统一运行环境，React 19 + Redux Toolkit + Tailwind CSS v4
- **API 服务**：Node.js + Egg.js + SQLite，提供面板管理和代理服务
- **UI 组件库**：基于 Radix UI + shadcn/ui 模式的复用 React 组件
- **通用 Hooks**：独立的 hooks 库，包含 useContainerSize、useSelection 等常用 Hooks
- **Utils**：通用工具库（v2.0.0），合并了 linglongos-utils，配备 Vitest 和 Rust 测试
- **共享类型**：跨应用共享的 TypeScript 类型定义
- **项目模板**：独立的前端项目模板，可快速创建新项目

### 构建配置

- **构建配置**：每个应用/包都有 `rsbuild.config.ts`，桌面应用使用 `vite.config.ts`
- **Biome**：`biome.json` - 制表符缩进，300 字符行宽，单引号，覆盖 `apps/**`、`packages/**`
- **配置清理**：移除 ESLint、Prettier、Stylelint 配置，统一使用 Biome
- **Turborepo**：`turbo.json` - 任务依赖图、缓存、环境管理，支持 type-check 和 test 任务
- **TypeScript**：React 19 覆盖（大多数应用需要 Node 18+，API 需要 Node 20.18.1+）

### 重要说明

- 使用 **React 19**（通过工作区覆盖修复）
- **代码检查策略**：所有项目使用 **Biome** 进行代码检查和格式化
  - Biome 覆盖范围：`apps/**`、`packages/**`
  - 支持文件：Vue (.vue)、TypeScript (.ts/.tsx)、JavaScript (.js/.jsx)、CSS 文件
  - 统一格式化规则：制表符缩进，300 字符行宽，单引号
- **Vue 应用集成 Gulp** 用于额外的构建任务
- **多测试框架支持** - Vue 使用 Vitest，desktop 和 linglongos-utils 使用 Vitest，utils 使用 rstest，API 使用 Egg.js 测试
- **迁移状态**：所有项目已从 ESLint + Prettier 迁移到 Biome
- **新项目**：desktop 和 api 从 linglongos 项目迁移而来，shared-types 和 linglongos-utils 是新增的包
- **API 文档**：API 服务运行在 <http://localhost:4000/docs>（Swagger UI）
- **预提交钩子**：使用 Husky + lint-staged 进行预提交验证（已移除 ESLint + Prettier 配置）
