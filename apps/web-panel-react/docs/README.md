# React 面板文档中心

欢迎来到 Linglong Web Panel React 文档中心！这里是您了解、开发和使用 React 现代化服务器管理面板的完整指南。

## 🚀 项目简介

Linglong Web Panel React 是基于 React 19 + TypeScript + Rsbuild 构建的现代化服务器管理面板，提供直观、高效的管理界面和丰富的功能特性。

### 核心特性
- **🎨 现代化界面**：基于 React 19 + TypeScript + Tailwind CSS
- **🔗 模块联邦**：通过 `remote1` 和 `remote2` 实现路由共享
- **🧠 智能路由**：TanStack Router 提供的类型安全路由
- **⚡ 高性能构建**：Rsbuild 基于 Rust 的极速构建
- **📊 丰富组件**：内置终端、代码编辑器、图表等工具
- **🔄 状态管理**：Zustand 轻量级状态管理
- **🎯 拖拽支持**：react-dnd 提供的拖拽交互

## 📚 文档导航

### 🎯 快速开始
- [项目概述](#-项目概述) - 了解面板架构和技术栈
- [开发指南](#-开发指南) - 本地开发环境搭建
- [构建部署](#-构建部署) - 生产环境构建和部署

### 📂 分类文档

#### 🛠️ 开发文档
- [01-项目架构设计](开发文档/01-项目架构设计.md) - 系统整体架构和设计理念
- [02-路由系统实现](开发文档/02-路由系统实现.md) - TanStack Router 路由实现
- [03-状态管理设计](开发文档/03-状态管理设计.md) - Zustand 状态管理方案
- [04-模块联邦配置](开发文档/04-模块联邦配置.md) - 微前端架构实现
- [05-组件开发规范](开发文档/05-组件开发规范.md) - React 组件开发标准

#### 🔗 API文档
- [01-面板组件API](API文档/01-面板组件API.md) - 面板相关组件接口说明
- [02-服务接口API](API文档/02-服务接口API.md) - API 通信接口规范
- [03-工具组件API](API文档/03-工具组件API.md) - 终端、编辑器等工具组件

#### 🔨 构建文档
- [01-构建配置说明](构建文档/01-构建配置说明.md) - Rsbuild 构建配置详解
- [02-开发环境配置](构建文档/02-开发环境配置.md) - 本地开发环境搭建
- [03-部署配置指南](构建文档/03-部署配置指南.md) - 生产环境部署配置

#### 📋 任务文档
- [01-功能开发清单](任务文档/01-功能开发清单.md) - 面板功能开发计划
- [02-优化任务记录](任务文档/02-优化任务记录.md) - 性能优化和改进记录

## 🏗️ 项目结构

```
src/
├── components/           # React 组件
│   ├── ui/              # 基础 UI 组件
│   ├── layout/          # 布局组件
│   ├── common/          # 通用组件
│   └── features/        # 功能组件
├── pages/               # 页面组件
│   ├── DefaultPage.tsx  # 默认首页
│   ├── LoginPage.tsx    # 登录页面
│   └── SoftwarePage.tsx # 软件管理页面
├── entries/             # 入口文件
│   ├── index.tsx        # 主入口
│   ├── login.tsx        # 登录入口
│   └── software.tsx     # 软件管理入口
├── shared/              # 共享组件和逻辑
│   ├── Nav.tsx          # 导航组件
│   ├── NavSpa.tsx       # SPA 导航组件
│   ├── hooks/           # 共享 Hooks
│   └── utils/           # 工具函数
├── router.tsx           # 路由配置
├── store/               # 状态管理
│   └── app.ts           # Zustand 状态存储
├── types/               # TypeScript 类型定义
│   └── modules.d.ts     # 模块声明
├── index.css            # 全局样式
└── index.tsx            # 应用入口
```

## 🛠️ 技术栈

### 核心框架和库
- **React**: 19.2.0 - 主要前端框架
- **TypeScript**: ^5.5.4 - 类型安全开发
- **Rsbuild**: ^1.0.0 - 基于 Rust 的高性能构建工具
- **TanStack Router**: ^1.38.0 - 类型安全的路由管理

### 状态管理和数据
- **Zustand**: ^4.5.2 - 轻量级状态管理
- **Axios**: ^1.7.2 - HTTP 客户端
- **react-use**: ^17.6.0 - React Hooks 工具库

### UI 和样式
- **Tailwind CSS**: ^3.4.13 - 原子化 CSS 框架
- **@linglongos/ui**: 工作区共享 UI 组件库
- **Lucide React**: ^0.468.0 - 图标库
- **Radix UI**: 无障碍 UI 组件基础

### 专业工具
- **@xterm/xterm**: ^5.5.0 - Web 终端模拟器
- **Monaco Editor**: ^0.51.0 - VS Code 同源编辑器
- **ECharts**: ^5.5.0 - 数据可视化图表
- **Asciinema Player**: ^3.6.3 - 终端录制播放器
- **React DnD**: ^16.0.1 - 拖拽交互系统

### 开发工具
- **Biome**: ^2.3.2 - 代码检查和格式化
- **PostCSS**: ^8.4.47 - CSS 处理
- **Autoprefixer**: ^10.4.20 - CSS 供应商前缀

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- pnpm >= 8.15.6

### 安装依赖
```bash
pnpm install
```

### 开发命令
```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview

# 代码检查
pnpm lint

# 自动修复代码问题
pnpm lint:fix

# 代码格式化
pnpm format

# 自动格式化代码
pnpm format:fix

# 综合检查
pnpm check

# 自动修复所有问题
pnpm check:fix

# CI 模式检查
pnpm ci
```

### 环境变量
```bash
# 开发环境配置
VITE_API_BASE_URL=http://localhost:4000
VITE_MODULE_FEDERATION_URL=http://localhost:3002
VITE_PUBLIC_HOST=http://localhost:3000
```

## 🎯 核心功能

### 1. 服务器管理
- **服务监控**：实时监控服务器状态和资源使用
- **进程管理**：查看和管理系统进程
- **文件管理**：浏览和管理服务器文件系统
- **日志查看**：实时查看和分析系统日志

### 2. 终端功能
- **Web 终端**：基于 xterm.js 的全功能终端
- **多标签**：支持多个终端标签页
- **会话管理**：保存和管理终端会话
- **命令历史**：命令历史记录和快速执行

### 3. 代码编辑
- **在线编辑**：Monaco Editor 提供 VS Code 体验
- **语法高亮**：支持多种编程语言
- **自动补全**：智能代码补全和提示
- **代码格式化**：自动代码格式化和检查

### 4. 数据可视化
- **实时图表**：ECharts 提供的交互式图表
- **性能监控**：CPU、内存、网络等资源监控
- **历史趋势**：历史数据趋势分析
- **自定义仪表板**：可配置的数据展示面板

### 5. 系统管理
- **用户管理**：用户账户和权限管理
- **安全设置**：SSL 证书、防火墙等安全配置
- **备份恢复**：数据备份和恢复管理
- **系统更新**：软件包更新和系统升级

## 📊 性能指标

### 构建性能
- **首次构建时间**: < 20秒
- **增量构建**: < 3秒
- **开发热更新**: < 1秒

### 运行时性能
- **首屏加载时间**: < 2秒
- **页面切换时间**: < 300ms
- **内存占用**: < 80MB（空闲状态）

### 浏览器兼容性
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 🔧 开发指南

### 代码规范
- **组件命名**: 使用 PascalCase，如 `ServerPanel.tsx`
- **文件命名**: 使用 camelCase，如 `serverService.ts`
- **Hook 命名**: 使用 camelCase，以 use 开头，如 `useServerData.ts`
- **类型命名**: 使用 PascalCase，如 `ServerInfo`

### 项目结构
```typescript
// 组件示例
interface PanelProps {
  title: string;
  data: ServerData[];
  onRefresh?: () => void;
}

const ServerPanel: React.FC<PanelProps> = ({ 
  title, 
  data, 
  onRefresh 
}) => {
  const { refresh, loading } = useServerData();
  
  return (
    <div className="server-panel">
      <PanelHeader 
        title={title} 
        onRefresh={onRefresh || refresh} 
        loading={loading} 
      />
      <PanelContent data={data} />
    </div>
  );
};
```

### 状态管理
```typescript
// Zustand store 示例
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AppState {
  user: User | null;
  servers: Server[];
  currentServer: Server | null;
  setUser: (user: User) => void;
  setServers: (servers: Server[]) => void;
  setCurrentServer: (server: Server) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      user: null,
      servers: [],
      currentServer: null,
      setUser: (user) => set({ user }),
      setServers: (servers) => set({ servers }),
      setCurrentServer: (server) => set({ currentServer: server }),
    }),
    {
      name: 'app-store',
    }
  )
);
```

### 路由配置
```typescript
// TanStack Router 示例
import { createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { rootComponent } from './rootComponent';

const rootRoute = createRootRoute({
  component: () => (
    <div className="app">
      <Nav />
      <main>
        <Outlet />
      </main>
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DefaultPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const softwareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/software',
  component: SoftwarePage,
});

const routeTree = rootRoute.addChildren([indexRoute, loginRoute, softwareRoute]);
```

## 🧪 测试指南

### 测试框架
- **Vitest**: 单元测试框架
- **React Testing Library**: 组件测试
- **MSW**: API Mock 服务

### 测试示例
```typescript
import { render, screen } from '@testing-library/react';
import { ServerPanel } from './ServerPanel';
import { useAppStore } from '../store/app';

// Mock Zustand store
jest.mock('../store/app', () => ({
  useAppStore: jest.fn(),
}));

describe('ServerPanel', () => {
  it('应该正确渲染服务器面板', () => {
    (useAppStore as jest.Mock).mockReturnValue({
      servers: [
        { id: 1, name: 'Server 1', status: 'online' },
        { id: 2, name: 'Server 2', status: 'offline' },
      ],
    });

    render(<ServerPanel title="服务器列表" data={[]} />);
    
    expect(screen.getByText('服务器列表')).toBeInTheDocument();
    expect(screen.getByText('Server 1')).toBeInTheDocument();
    expect(screen.getByText('Server 2')).toBeInTheDocument();
  });
});
```

## 🚀 部署指南

### 本地部署
```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview

# 使用静态服务器部署
npx serve dist -p 3002
```

### Docker 部署
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 环境配置
```bash
# 生产环境变量
VITE_API_BASE_URL=https://api.example.com
VITE_MODULE_FEDERATION_URL=https://remote.example.com
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=true
```

## 🤝 贡献指南

### 开发流程
1. **Fork 项目** - 创建您的项目副本
2. **创建分支** - `git checkout -b feature/your-feature-name`
3. **开发测试** - 编写代码并运行测试
4. **代码检查** - 确保通过 Biome 检查
5. **提交代码** - 遵循提交规范
6. **创建PR** - 提交 Pull Request

### 代码审查检查清单
- [ ] 代码符合 TypeScript 严格模式
- [ ] 通过所有测试用例
- [ ] 通过 Biome 代码检查
- [ ] 组件有完整的类型定义
- [ ] 添加了适当的文档注释
- [ ] 更新了相关文档

## 📞 获取帮助

### 文档支持
- 📖 查看 [开发文档](开发文档/) 获取详细技术指南
- 🔍 搜索关键词在文档中查找解决方案
- 📋 查看 [API文档](API文档/) 了解接口规范

### 技术支持
- 💬 创建 Issue 报告问题
- 📧 联系项目维护者
- 🎯 参与项目讨论

## 🔄 更新日志

### v1.0.0 (2025年11月)
- ✨ 初始版本发布
- 🎨 实现现代化服务器管理界面
- 🔗 集成模块联邦路由共享
- 📊 添加终端、编辑器、图表工具
- 🚀 集成 Rsbuild 构建系统

### 计划功能
- 📱 移动端适配优化
- 🌐 多语言支持
- 🔌 插件系统扩展
- 📈 高级监控和告警

---

**开始您的开发之旅** - 查看 [项目架构设计](开发文档/01-项目架构设计.md) 了解更多技术细节