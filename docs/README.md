# 项目文档中心

欢迎来到 TurboRepo + RsBuild 项目的文档中心！这里是您了解、开发和使用整个项目的完整指南。

## 🚀 项目简介

本项目是一个基于 **Turborepo + RsBuild** 的现代化前端架构，包含 **双框架服务器管理面板**，实现了高性能、可扩展的前端单体仓库解决方案。

### 核心特性
- **模块联邦**：通过 `remote1` 和 `remote2` 实现应用间路由共享
- **高性能**：基于 Rust 的 Rspack 打包器，代码分割，并行构建
- **双实现**：Vue（传统版本）和 React（现代版本）并存
- **统一认证**：基于 TOTP 的双因素认证机制
- **共享组件**：React UI 库可在所有 React 应用中使用

## 📚 文档导航

### 🎯 快速开始
- [项目概览](#-项目概览) - 了解项目整体架构和技术栈
- [环境配置](#-环境配置) - 本地开发环境搭建指南
- [开发规范](#-开发规范) - 代码规范、提交规范、文档规范

### 🏗️ 项目结构

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

/docs                    # 文档中心
├── README.md             # 本文档 - 项目文档索引
├── 文档规范与指南.md       # 文档创建和管理规范
└── ...                   # 其他文档
```

### 📋 应用文档

#### 桌面应用 (desktop-app)
- **README.md** - [桌面应用详细说明](../apps/desktop-app/README.md)
- **技术栈**：React 19 + TypeScript + rsbuild + Redux Toolkit
- **核心功能**：桌面界面、窗口管理、拖拽交互、插件系统

#### React 面板 (web-panel-react)
- **README.md** - [React面板开发指南](../apps/web-panel-react/README.md)
- **技术栈**：React 19 + TypeScript + Rsbuild + TanStack Router
- **核心功能**：现代化服务器管理界面

#### Vue 面板 (web-panel-vue)
- **README.md** - [Vue面板开发指南](../apps/web-panel-vue/README.md)
- **技术栈**：Vue 3 + TypeScript + Element Plus
- **核心功能**：传统服务器管理界面

#### API 服务 (api-service)
- **文档中心** - [API服务完整文档](../apps/api-service/docs/README.md)
- **技术栈**：Node.js + Egg.js + SQLite + TypeScript
- **核心功能**：统一认证、面板代理、插件系统

### 📦 组件库文档

#### React Hooks 库 (hooks)
- **README.md** - [Hooks库详细说明](../packages/hooks/README.md)
- **包含功能**：useContainerSize、useSelection、useAxios 等常用Hooks

#### UI 组件库 (ui)
- **README.md** - [UI组件库说明](../packages/ui/README.md)
- **技术栈**：shadcn/ui + Tailwind CSS + Radix UI

#### 工具库 (utils)
- **README.md** - [工具库说明](../packages/utils/README.md)
- **功能**：通用工具函数，v2.0.0版本

#### 共享类型 (shared-types)
- **README.md** - [类型定义说明](../packages/shared-types/README.md)
- **功能**：跨应用共享的TypeScript类型定义

## 🛠️ 技术栈

### 构建和开发工具
| 技术 | 版本 | 用途 |
|------|------|------|
| **Turborepo** | v2.0.11 | 单体仓库管理和构建优化 |
| **Rsbuild** | v1.x | 基于Rust的高性能构建工具 |
| **Vite** | 7.x | 桌面应用开发构建 |
| **pnpm** | 工作区 | 包管理器和工作区管理 |

### 前端框架
| 框架 | 版本 | 用途 |
|------|------|------|
| **React** | 19.x | 主要前端框架 |
| **Vue** | 3.x | 传统面板框架 |
| **TypeScript** | 5.x+ | 类型安全的JavaScript |

### 状态管理和样式
| 技术 | 版本 | 用途 |
|------|------|------|
| **Redux Toolkit** | 最新版 | 桌面应用状态管理 |
| **Zustand** | 最新版 | React面板状态管理 |
| **Tailwind CSS** | v4 | 原子化CSS框架 |
| **Biome** | v2.3.2 | 代码检查和格式化 |

### 测试和检查
| 技术 | 用途 |
|------|------|
| **Vitest** | Vue、desktop、utils的测试框架 |
| **rstest** | Rust风格测试（utils包） |
| **Biome** | 统一的代码检查和格式化 |

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- pnpm >= 8.15.6
- Git

### 安装和启动
```bash
# 安装所有依赖
pnpm install

# 启动开发服务器（所有应用）
pnpm dev

# 构建所有应用
pnpm build

# 代码检查
pnpm lint

# 运行所有测试
pnpm test
```

### 环境变量
在项目根目录创建 `.env` 文件：
```bash
PUBLIC_HOST=http://localhost:3000
PUBLIC_REMOTE_1=http://localhost:3001
PUBLIC_REMOTE_2=http://localhost:3002
```

## 🔧 开发规范

### 代码规范
- **统一使用 Biome** 进行代码检查和格式化
- **制表符缩进，300字符行宽，单引号**
- **TypeScript 严格模式**
- **组件和文件命名使用 PascalCase**

### 提交规范
```bash
# 功能开发
git commit -m "feat: 添加新的用户界面组件"

# 修复bug
git commit -m "fix: 修复窗口拖拽异常"

# 文档更新
git commit -m "docs: 更新API文档"
```

### 文档规范
- **文档创建在对应项目的 `docs/` 目录下**
- **使用中文命名，遵循编号规范**
- **按分类组织到相应目录**：
  - 开发文档 (`开发文档/`)
  - API文档 (`API文档/`)
  - 构建文档 (`构建文档/`)
  - 任务文档 (`任务文档/`)

## 📊 性能指标

### 构建性能
- **首次构建时间**: < 30秒
- **增量构建**: < 5秒
- **包体积优化**: 代码分割 + Tree Shaking

### 开发体验
- **热更新**: < 1秒
- **类型检查**: 集成在构建流程中
- **代码提示**: 完整的TypeScript支持

## 🚢 部署指南

### 本地开发
```bash
# 启动所有开发服务器
pnpm dev

# 启动特定应用
pnpm -C apps/desktop-app dev
pnpm -C apps/web-panel-react dev
pnpm -C apps/api-service dev
```

### 生产构建
```bash
# 构建所有应用
pnpm build

# 构建特定应用
pnpm -C apps/desktop-app build
pnpm -C apps/web-panel-react build
```

## 🤝 贡献指南

### 参与贡献
1. **阅读项目文档** - 了解项目架构和开发规范
2. **Fork 项目** - 创建您的项目副本
3. **创建分支** - `git checkout -b feature/your-feature-name`
4. **开发测试** - 编写代码并运行测试
5. **提交代码** - 遵循提交规范和代码检查
6. **创建PR** - 提交Pull Request并描述改动

### 代码审查
- 所有代码变更需要通过Biome检查
- 核心功能需要完整的测试覆盖
- 文档同步更新到相关部分

## 📞 获取帮助

### 文档支持
- 📖 **查看项目文档** - 首先查阅相关文档
- 🔍 **搜索关键词** - 在文档中查找相关信息
- 📋 **查看示例代码** - 参考已有实现

### 技术支持
- 💬 **创建 Issue** - 报告问题或提出建议
- 📧 **联系维护者** - 通过GitHub联系
- 🎯 **参与讨论** - 加入项目社区讨论

## 🔄 文档更新

本文档会随项目发展持续更新，建议定期查看最新版本。

**最近更新**: 2025年11月
**文档版本**: v1.0.0
**维护团队**: TurboRepo + RsBuild 开发团队

---

*如果您发现文档有任何问题或需要改进，欢迎提交 Issue 或 Pull Request！*

## 📁 其他重要文档

- [文档规范与指南](文档规范与指南.md) - 文档创建和管理规范
- [CLAUDE.md](../CLAUDE.md) - Claude Code 工作指导说明
- [项目优化报告](../PROJECT_OPTIMIZATION.md) - 性能和架构优化记录