# TurboRepo + RsBuild 项目

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-blue.svg)](https://www.typescriptlang.org/)

一个基于 **Turborepo + RsBuild** 的现代化前端单体仓库，包含 **双框架服务器管理面板**，实现了高性能、可扩展的前端解决方案。

## 🚀 项目概览

本项目采用现代化的前端架构，通过模块联邦和统一认证机制，为服务器管理提供双面板解决方案。

### 核心特性
- **🏗️ Turborepo 单体仓库**：统一的工作区管理，高效的构建缓存
- **⚡ Rsbuild 高性能构建**：基于 Rust 的 Rspack，提供极速构建体验
- **🔄 模块联邦**：通过 `remote1` 和 `remote2` 实现应用间路由共享
- **🎨 双框架面板**：Vue 3（传统版本）+ React 19（现代版本）
- **🔐 统一认证**：基于 TOTP 的双因素认证机制
- **🧩 共享组件**：可复用的 React UI 组件库
- **🔧 插件系统**：可扩展的桌面应用插件架构

## 📁 项目结构

```
/apps
├── desktop-app/          # LinglongOS 桌面应用（React 19 + Vite + Redux Toolkit）
├── web-panel-react/      # React 19 + TypeScript 面板（现代化重构）
├── web-panel-vue/        # Vue 3 + TypeScript 面板（基于 Element Plus）
└── api-service/          # LinglongOS API 服务（Node.js + Egg.js + SQLite）

/packages
├── ui/                   # 共享 React UI 组件（shadcn/ui + Tailwind）
├── hooks/                # 通用 React Hooks 库（useContainerSize、useSelection）
├── utils/                # 通用工具库（v2.0.0，合并了 linglongos-utils）
└── shared-types/         # 共享 TypeScript 类型定义

/templates
└── web-template/         # 独立的前端项目模板（React 19 + Vite）

/docs                    # 文档中心
├── README.md             # 文档索引
├── 文档规范与指南.md       # 文档创建规范
└── ...                   # 更多文档

根目录配置文件
├── CLAUDE.md             # Claude Code 工作指导
├── biome.json            # 统一代码检查配置
├── turbo.json            # Turborepo 构建配置
└── package.json          # 项目依赖管理
```

## 🛠️ 技术栈

### 核心构建工具
| 技术 | 版本 | 用途 |
|------|------|------|
| **Turborepo** | v2.0.11 | 单体仓库管理和构建优化 |
| **Rsbuild** | v1.x | 基于 Rust 的高性能构建 |
| **Vite** | 7.x | 桌面应用开发构建 |
| **pnpm** | v8.15.6+ | 工作区包管理 |

### 前端技术
| 框架 | 版本 | 用途 |
|------|------|------|
| **React** | 19.x | 主要前端框架 |
| **Vue** | 3.x | 传统面板框架 |
| **TypeScript** | 5.x+ | 类型安全开发 |

### 状态管理和样式
| 技术 | 用途 |
|------|------|
| **Redux Toolkit** | 桌面应用状态管理 |
| **Zustand** | React 面板状态管理 |
| **Tailwind CSS v4** | 原子化 CSS |
| **Element Plus** | Vue UI 组件库 |

### 工具和检查
| 技术 | 用途 |
|------|------|
| **Biome v2.3.2** | 统一的代码检查和格式化 |
| **Vitest** | 前端测试框架 |
| **rstest** | Rust 风格测试 |

## 🚀 快速开始

### 环境要求
- **Node.js** >= 18.0.0
- **pnpm** >= 8.15.6
- **Git** 版本控制

### 安装依赖
```bash
# 克隆项目
git clone <your-repo-url>
cd turborepo-rsbuild

# 安装所有依赖
pnpm install
```

### 环境配置
在项目根目录创建 `.env` 文件：
```bash
PUBLIC_HOST=http://localhost:3000
PUBLIC_REMOTE_1=http://localhost:3001
PUBLIC_REMOTE_2=http://localhost:3002
```

### 开发命令

#### 全局命令
```bash
pnpm dev           # 并行启动所有开发服务器
pnpm build         # 按依赖顺序构建所有应用和包
pnpm lint          # 对所有工作区进行代码检查
pnpm test          # 运行所有测试
pnpm clean         # 清理所有构建产物
```

#### 代码格式化（Biome）
```bash
pnpm biome:check           # 检查所有文件的代码风格/格式问题
pnpm biome:check:fix       # 自动修复所有代码风格/格式问题
pnpm biome:lint            # 仅运行代码检查
pnpm biome:format          # 仅运行代码格式化
pnpm biome:format:fix      # 修复代码格式问题
```

### 应用特定命令

#### 桌面应用 (desktop-app)
```bash
pnpm -C apps/desktop-app dev        # 启动 Vite 开发服务器
pnpm -C apps/desktop-app build      # 生产环境构建
pnpm -C apps/desktop-app test       # 运行 Vitest 测试
pnpm -C apps/desktop-app coverage   # 运行带覆盖率的测试
pnpm -C apps/desktop-app preview    # 预览生产构建结果
```

#### React 面板 (web-panel-react)
```bash
pnpm -C apps/web-panel-react dev        # 启动 React 开发服务器
pnpm -C apps/web-panel-react build      # 使用 Rsbuild 构建
pnpm -C apps/web-panel-react check      # Biome 检查（代码检查 + 格式化）
pnpm -C apps/web-panel-react preview    # 预览生产构建结果
```

#### Vue 面板 (web-panel-vue)
```bash
pnpm -C apps/web-panel-vue dev          # 启动 Vue 开发服务器
pnpm -C apps/web-panel-vue build        # 使用 Rsbuild + Gulp 构建
pnpm -C apps/web-panel-vue build:git    # 构建 Git 部署版本
pnpm -C apps/web-panel-vue build:docker # 构建 Docker 镜像版本
pnpm -C apps/web-panel-vue preview      # 预览生产构建结果
pnpm -C apps/web-panel-vue lint         # Biome 代码检查（Vue/TypeScript）
```

#### API 服务 (api-service)
```bash
pnpm -C apps/api-service dev        # 启动开发服务器
pnpm -C apps/api-service build      # TypeScript 构建
pnpm -C apps/api-service start      # 启动生产服务器
pnpm -C apps/api-service test       # 运行测试
pnpm -C apps/api-service ci         # CI 模式测试
```

### 包特定命令

#### UI 组件库 (packages/ui)
```bash
pnpm -C packages/ui dev         # 启动 UI 库开发服务器
pnpm -C packages/ui build       # 构建 UMD 发行版
pnpm -C packages/ui type-check  # TypeScript 类型检查
pnpm -C packages/ui clean       # 清理构建产物
```

#### React Hooks 库 (packages/hooks)
```bash
pnpm -C packages/hooks dev       # 启动开发服务器
pnpm -C packages/hooks build     # TypeScript 构建
pnpm -C packages/hooks test      # 运行 Vitest 测试
pnpm -C packages/hooks test:watch  # 监视模式运行测试
pnpm -C packages/hooks coverage  # 运行带覆盖率的测试
pnpm -C packages/hooks lint      # Biome 代码检查
```

#### Utils 工具库 (packages/utils)
```bash
pnpm -C packages/utils dev       # 启动开发服务器
pnpm -C packages/utils build     # 使用 Rsbuild + TypeScript 构建
pnpm -C packages/utils test      # 运行 Vitest 测试（支持 Rust rstest）
pnpm -C packages/utils test:watch  # 监视模式运行测试
pnpm -C packages/utils coverage  # 运行带覆盖率的测试
pnpm -C packages/utils lint      # Biome 代码检查
```

#### 共享类型 (packages/shared-types)
```bash
pnpm -C packages/shared-types build     # 构建类型定义
pnpm -C packages/shared-types type-check # TypeScript 类型检查
```

## 🎯 应用详情

### 桌面应用 (desktop-app)
**技术栈**：React 19 + TypeScript + Vite + Redux Toolkit + Tailwind CSS
- **核心功能**：LinglongOS 统一运行环境
- **特色功能**：拖拽交互、窗口管理、插件系统、主题切换
- **访问端口**：3001

### React 面板 (web-panel-react)
**技术栈**：React 19 + TypeScript + Rsbuild + TanStack Router + Zustand
- **核心功能**：现代化的服务器管理界面
- **特色功能**：模块联邦、路由共享、状态管理
- **访问端口**：3002

### Vue 面板 (web-panel-vue)
**技术栈**：Vue 3 + TypeScript + Element Plus + Rsbuild + Gulp
- **核心功能**：传统服务器管理界面
- **特色功能**：完整的服务器管理功能、Git 部署、Docker 支持
- **访问端口**：3000

### API 服务 (api-service)
**技术栈**：Node.js + Egg.js + SQLite + TypeScript
- **核心功能**：统一认证、面板代理、插件系统
- **特色功能**：TOTP 双因素认证、代理转发、数据库管理
- **访问地址**：http://localhost:4000/docs（Swagger UI）

## 📚 文档资源

- **[项目文档中心](docs/README.md)** - 完整的项目文档索引
- **[文档规范指南](docs/文档规范与指南.md)** - 文档创建和管理规范
- **[API 服务文档](apps/api-service/docs/README.md)** - API 详细说明
- **[桌面应用文档](apps/desktop-app/README.md)** - 桌面应用开发指南
- **[Hooks 库文档](packages/hooks/README.md)** - React Hooks 库说明

## 📊 性能指标

### 构建性能
- **首次构建时间**: < 30秒
- **增量构建**: < 5秒
- **缓存命中**: > 80%

### 开发体验
- **热更新**: < 1秒
- **类型检查**: 集成在构建流程中
- **代码提示**: 完整的 TypeScript 支持

### 包大小优化
- **代码分割**: 基于路由和组件
- **Tree Shaking**: 自动移除未使用代码
- **压缩优化**: 生产环境自动压缩

## 🤝 贡献指南

### 开发规范
- **代码检查**: 统一使用 Biome 进行代码检查和格式化
- **提交规范**: 使用 Conventional Commits 格式
- **TypeScript**: 严格模式，完整的类型定义
- **测试覆盖**: 核心功能需要测试覆盖

### 文档贡献
- **中文文档**: 所有文档使用中文命名和编写
- **分类组织**: 按照开发文档、API文档、构建文档、任务文档分类
- **命名规范**: 使用序号前缀，如 `01-`、`02-`

### 参与流程
1. **Fork 项目** - 创建您的项目副本
2. **创建分支** - `git checkout -b feature/your-feature-name`
3. **开发测试** - 编写代码并运行测试
4. **提交代码** - 遵循提交规范和代码检查
5. **创建PR** - 提交 Pull Request 并描述改动

## 📞 获取帮助

- 📖 **查看文档** - 首先查阅 [项目文档中心](docs/README.md)
- 🔍 **搜索问题** - 在现有 Issues 中查找解决方案
- 💬 **创建 Issue** - 报告问题或提出改进建议
- 📧 **联系维护者** - 通过 GitHub 私信联系

## 🔄 更新日志

### v2.0.0 (2025年11月)
- ✨ 升级到 React 19 和最新的现代技术栈
- 🚀 集成 Rsbuild 构建系统，提升构建性能
- 📚 完善文档体系，统一文档规范
- 🔧 迁移到 Biome 代码检查工具
- 🎯 优化项目结构和组织方式

### v1.0.0 (早期版本)
- 🎉 项目初始版本
- 📦 基于 Turborepo 的单体仓库架构
- 🔄 实现 Vue 和 React 双面板系统

## 📄 许可证

本项目基于 MIT 许可证开源。详情请参阅 [LICENSE](LICENSE) 文件。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和使用者！

---

**开始您的开发之旅** - 查看 [项目文档中心](docs/README.md) 获取详细指南
