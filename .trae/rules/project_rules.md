# 项目规则

本文档定义了 Turborepo-Rsbuild 项目的开发规则和最佳实践，所有参与者必须遵守。

## 1. 开发规则

### 1.1 依赖管理
- 使用 `pnpm v8.15.6+` 作为包管理器
- 安装依赖使用 `pnpm install`
- 所有依赖必须通过工作区管理，不允许直接安装到项目根目录

### 1.2 开发环境
- 必须在项目根目录创建 `.env` 文件，包含以下变量：
  ```bash
  PUBLIC_HOST=http://localhost:3000
  PUBLIC_REMOTE_1=http://localhost:3001
  PUBLIC_REMOTE_2=http://localhost:3002
  ```
- 开发服务器启动使用 `pnpm dev`（并行启动所有服务）
- 带环境变量的开发模式使用 `pnpm with-env turbo dev`

### 1.3 构建规则
- 构建所有应用和包使用 `pnpm build`
- 各应用/包必须有自己的 `rsbuild.config.ts` 配置文件
- 桌面应用使用 `vite.config.ts` 而非 rsbuild 配置

### 1.4 代码检查与格式化
- **统一使用 Biome v2.3.2** 进行代码检查和格式化
- 禁止使用 ESLint、Prettier、Stylelint
- 代码检查命令：
  - `pnpm biome:check` - 检查所有文件的代码风格/格式问题
  - `pnpm biome:check:fix` - 自动修复所有代码风格/格式问题
  - `pnpm biome:lint` - 仅运行代码检查
  - `pnpm biome:format` - 仅运行代码格式化
  - `pnpm biome:format:fix` - 修复代码格式问题

### 1.5 测试规则
- 各项目必须配置适当的测试框架
- 测试命令：
  - Vue 面板：`pnpm -C apps/web-panel-vue test`
  - React 面板：`pnpm -C apps/web-panel-react test`
  - 桌面应用：`pnpm -C apps/desktop-app test`
  - API 服务：`pnpm -C apps/api-service test`
  - UI 组件库：`pnpm -C packages/ui test`
  - Hooks 库：`pnpm -C packages/hooks test`
  - Utils 库：`pnpm -C packages/utils test`（支持 Rust rstest）

## 2. 文档规则

### 2.1 文档存放位置
- **所有项目文档必须创建在对应项目的 `docs/` 目录下**
- 项目根文档存放在 `/docs` 目录

### 2.2 文档命名规范
- **文档命名必须使用中文**
- 按重要性添加序号前缀（01-, 02-, 03-）
- 名称简洁明了，避免过长
- 禁止使用英文名称或随意命名

### 2.3 文档分类规范
项目内的 `docs/` 目录必须按以下分类组织：

- **开发文档** (`docs/开发文档/`) - 开发流程、规范、设计方案
  - 示例：`01-认证系统设计.md`、`02-数据库设计.md`

- **API文档** (`docs/API文档/`) - API接口说明、参数文档
  - 示例：`01-用户认证API.md`、`02-文件管理API.md`

- **构建文档** (`docs/构建文档/`) - 构建流程、部署指南
  - 示例：`01-Docker部署指南.md`、`02-CI配置说明.md`

- **任务文档** (`docs/任务文档/`) - 开发任务、需求文档
  - 示例：`01-功能需求文档.md`、`02-优化任务清单.md`

### 2.4 文档目录结构示例
```
apps/api-service/docs/
├── 开发文档/
│   ├── 01-访问控制流程.md
│   ├── 02-API路由规范.md
│   └── 03-认证与初始化状态.md
├── API文档/
│   ├── 01-桌面配置API.md
│   └── 02-代理配置API文档.md
├── 构建文档/
│   └── 01-Docker部署指南.md
└── 任务文档/
    └── 01-插件系统开发任务.md
```

## 3. 代码规范

### 3.1 代码风格
- 使用 **Biome** 统一代码风格
- 格式化规则：制表符缩进，300 字符行宽，单引号
- Biome 覆盖范围：`apps/**`、`packages/**`
- 支持文件：Vue (.vue)、TypeScript (.ts/.tsx)、JavaScript (.js/.jsx)、CSS 文件

### 3.2 TypeScript 规范
- 所有新代码必须使用 TypeScript
- 使用 React 19（通过工作区覆盖）
- 大多数应用需要 Node 18+，API 服务需要 Node 20.18.1+
- 共享类型定义放在 `packages/shared-types`

### 3.3 组件开发规范
- React 组件使用函数式组件和 Hooks
- UI 组件优先使用 `packages/ui` 中的共享组件
- 新组件应遵循 shadcn/ui 设计模式

### 3.4 状态管理
- React 应用使用 Zustand 进行状态管理
- 桌面应用使用 Redux Toolkit
- 状态变更必须通过预定义的 actions/mutations

## 4. 项目结构规则

### 4.1 应用结构
```
/apps
  ├── web-panel-vue/        # Vue 3 + TypeScript 面板（基于 Element Plus）
  ├── web-panel-react/      # React 19 + TypeScript 面板（现代化重构）
  ├── desktop-app/          # LinglongOS 桌面应用（React 19 + Vite + Redux Toolkit）
  └── api-service/          # LinglongOS API 服务（Node.js + Egg.js + SQLite）

/packages
  ├── ui/                   # 共享 React UI 组件（shadcn/ui + Tailwind）
  ├── hooks/                # 通用 React Hooks 库
  ├── utils/                # 通用工具库（v2.0.0）
  └── shared-types/         # 共享 TypeScript 类型定义
```

### 4.2 技术栈选择
- **单体仓库**：Turborepo v2.0.11 + pnpm 工作区
- **构建系统**：Rsbuild v1.x（Rspack，基于 Rust），Vite 7（桌面应用）
- **开发语言**：全程 TypeScript，Vue SFC，React TSX，Node.js（API）
- **样式方案**：Tailwind CSS v4，UnoCSS（Vue），Sass
- **测试框架**：Vitest（Vue/desktop/utils），rstest（utils），Egg.js（API）

### 4.3 模块联邦
- 通过 `remote1` 和 `remote2` 实现应用间路由共享
- 共享组件必须在独立包中定义
- 避免应用间的直接依赖

## 5. 特殊规则

### 5.1 Vue 应用规则
- Vue 应用集成 Gulp 用于额外的构建任务
- 使用 Element Plus 作为 UI 组件库
- 使用 UnoCSS 作为样式方案

### 5.2 React 应用规则
- 使用 React 19 最新特性
- 使用 TanStack Router 进行路由管理
- 使用 Tailwind CSS v4 作为样式方案

### 5.3 API 服务规则
- 使用 Node.js + Egg.js + SQLite
- API 文档运行在 <http://localhost:4000/docs>（Swagger UI）
- 所有 API 必须有适当的错误处理和验证

### 5.4 提交规则
- 使用 Husky + lint-staged 进行预提交验证
- 提交前必须通过 Biome 代码检查
- 提交信息必须清晰描述变更内容

## 6. 违规处理

违反以上规则可能导致：
- 代码审查被拒绝
- 构建流程失败
- 合并请求被延迟
- 严重违规可能被撤销提交权限

所有团队成员有责任了解并遵守这些规则，规则更新将通过团队通知进行分发。