# 桌面应用文档中心

欢迎来到 Linglong Desktop 应用文档中心！这里是您了解、开发和使用桌面应用的完整指南。

## 🚀 项目简介

Linglong Desktop 是基于 React 19 + TypeScript + Rsbuild + Redux Toolkit 构建的现代化桌面应用，提供统一的桌面环境和管理界面。

### 核心特性
- **🎨 现代化界面**：基于 React 19 + TypeScript + Tailwind CSS v4
- **🔧 拖拽交互**：使用 react-dnd 提供流畅的拖拽体验
- **🪟 窗口管理**：完整的窗口生命周期管理
- **🔌 插件系统**：可扩展的插件架构
- **🎭 主题切换**：支持 Dark/Light 模式切换
- **💾 状态管理**：基于 Redux Toolkit 的可靠状态管理

## 📚 文档导航

### 🎯 快速开始
- [项目概述](#-项目概述) - 了解应用架构和技术栈
- [开发指南](#-开发指南) - 本地开发环境搭建
- [构建部署](#-构建部署) - 生产环境构建和部署

### 📂 分类文档

#### 🛠️ 开发文档
- [01-架构设计](开发文档/01-架构设计.md) - 系统整体架构和设计理念
- [02-桌面模块实现](开发文档/02-桌面模块实现.md) - 桌面功能模块详解
- [03-窗口管理机制](开发文档/03-窗口管理机制.md) - 窗口生命周期和状态管理
- [04-拖拽交互系统](开发文档/04-拖拽交互系统.md) - react-dnd 拖拽系统实现
- [05-插件系统设计](开发文档/05-插件系统设计.md) - 插件架构和 API 设计

#### 🔗 API文档
- [01-桌面组件API](API文档/01-桌面组件API.md) - 桌面相关组件接口说明
- [02-窗口管理API](API文档/02-窗口管理API.md) - 窗口管理接口规范
- [03-状态管理API](API文档/03-状态管理API.md) - Redux状态管理接口

#### 🔨 构建文档
- [01-构建配置说明](构建文档/01-构建配置说明.md) - Rsbuild构建配置详解
- [02-开发环境配置](构建文档/02-开发环境配置.md) - 本地开发环境搭建
- [03-测试配置指南](构建文档/03-测试配置指南.md) - Vitest测试框架配置

#### 📋 任务文档
- [01-功能需求文档](任务文档/01-功能需求文档.md) - 应用功能需求规格
- [02-优化任务清单](任务文档/02-优化任务清单.md) - 性能和用户体验优化

## 🏗️ 项目结构

```
src/
├── components/           # React 组件
│   ├── ui/              # 基础 UI 组件（按钮、输入框等）
│   ├── Dock.tsx         # 底部 Dock 栏组件
│   ├── WindowManager.tsx # 窗口管理器组件
│   └── WindowControls.tsx # 窗口控制按钮组件
├── features/            # 功能模块
│   ├── desktop/         # 桌面功能模块
│   │   └── Desktop.tsx  # 桌面主组件
│   ├── settings/        # 设置功能模块
│   │   ├── Settings.tsx # 设置主组件
│   │   └── components/  # 设置子组件
│   └── Setup/           # 初始化设置模块
├── hooks/               # 自定义 Hooks
│   ├── useAppLauncher.ts    # 应用启动器 Hook
│   ├── useBackgroundStyle.ts # 背景样式 Hook
│   ├── useContainerDrop.ts  # 容器拖拽 Hook
│   ├── useDesktopIconDrag.ts # 桌面图标拖拽 Hook
│   ├── useDragPreview.ts     # 拖拽预览 Hook
│   ├── useGridSystem.ts      # 网格系统 Hook
│   ├── useMarqueeSelection.ts # 框选 Hook
│   ├── useSelection.ts       # 选择管理 Hook
│   ├── useSmartDragPreview.ts # 智能拖拽预览 Hook
│   └── useStyleVars.ts       # 样式变量 Hook
├── services/            # 服务层
│   ├── api.ts          # API 通信服务
│   ├── config.service.ts # 配置管理服务
│   ├── loadingManager.ts  # 加载管理服务
│   ├── settings.service.ts # 设置服务
│   └── setupService.ts # 初始化服务
├── store/              # Redux 状态管理
│   ├── slices/         # Redux Slices
│   │   ├── desktop.slice.ts # 桌面状态管理
│   │   ├── settings.slice.ts # 设置状态管理
│   │   └── window.slice.ts   # 窗口状态管理
│   ├── hooks.ts        # Redux Hooks
│   └── index.ts        # Store 配置
├── types/              # TypeScript 类型定义
│   ├── config.ts       # 配置类型
│   ├── dnd.ts         # 拖拽类型
│   ├── settings.ts    # 设置类型
│   └── setup.ts       # 初始化类型
├── utils/              # 工具函数
│   └── snap.ts        # 吸附对齐工具
└── styles/             # 样式文件
    └── index.css      # 全局样式
```

## 🛠️ 技术栈

### 核心框架和库
- **React**: 19.1.1 - 主要前端框架
- **TypeScript**: ~5.8.3 - 类型安全开发
- **Rsbuild**: 1.4.0 - 基于 Rust 的高性能构建工具
- **Redux Toolkit**: ^2.9.0 - 状态管理
- **React DnD**: ^16.0.1 - 拖拽交互

### UI 和样式
- **Tailwind CSS**: ^4.1.13 - 原子化 CSS 框架
- **Radix UI**: 提供无障碍的 UI 组件基础
- **Lucide React**: ^0.544.0 - 图标库

### 测试和工具
- **Vitest**: ^3.2.4 - 测试框架
- **Testing Library**: 组件测试库
- **Biome**: 代码检查和格式化

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

# 运行测试
pnpm test

# 代码检查
pnpm lint

# 预览生产构建
pnpm preview
```

### 类型检查
```bash
pnpm type-check
```

### 测试覆盖率
```bash
pnpm coverage
```

## 🎯 核心功能

### 1. 桌面环境
- **应用图标管理**：网格布局、拖拽排序、文件夹组织
- **自定义小组件**：可拖拽、可调整大小的小组件系统
- **背景主题**：支持自定义壁纸和主题切换

### 2. 窗口管理
- **窗口生命周期**：创建、最大化、最小化、关闭
- **拖拽和缩放**：支持自由拖动和调整大小
- **层级管理**：窗口聚焦和 z-index 管理

### 3. 状态栏功能
- **系统信息**：时间、网络、电量显示
- **主题切换**：一键切换 Dark/Light 模式
- **通知中心**：系统和应用通知聚合

### 4. 右键菜单
- **上下文敏感**：根据点击区域显示不同菜单
- **动态加载**：菜单项根据状态动态生成
- **快捷键支持**：关键操作提供快捷键提示

### 5. 插件系统
- **插件注册**：动态加载和管理插件
- **生命周期管理**：插件的加载、卸载、清理
- **插件 API**：注册小组件、状态栏图标、快捷键等

## 📊 性能指标

### 构建性能
- **首次构建时间**: < 15秒
- **增量构建**: < 3秒
- **开发热更新**: < 1秒

### 运行时性能
- **内存占用**: < 100MB（空闲状态）
- **启动时间**: < 2秒（首次加载）
- **拖拽流畅度**: 60FPS 流畅拖拽

### 浏览器兼容性
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 🎨 设计系统

### 颜色方案
- **主色调**: 蓝色系（#3b82f6）
- **成功色**: 绿色系（#10b981）
- **警告色**: 黄色系（#f59e0b）
- **错误色**: 红色系（#ef4444）
- **中性色**: 灰度系列

### 间距规范
- **基础间距**: 4px, 8px, 12px, 16px, 24px, 32px
- **组件内边距**: 8px, 12px, 16px
- **组件外边距**: 8px, 16px, 24px

### 字体规范
- **主字体**: system-ui, -apple-system, sans-serif
- **代码字体**: 'Fira Code', 'Monaco', monospace
- **字体大小**: 12px, 14px, 16px, 18px, 24px, 32px

## 🔧 开发指南

### 代码规范
- **组件命名**: 使用 PascalCase，如 `Desktop.tsx`
- **文件命名**: 使用 camelCase，如 `useAppLauncher.ts`
- **样式类**: 使用 Tailwind CSS 类名
- **TypeScript**: 严格模式，完整的类型定义

### 组件开发
```typescript
// 组件示例
interface ComponentProps {
  title: string;
  onClick?: () => void;
}

const MyComponent: React.FC<ComponentProps> = ({ title, onClick }) => {
  return (
    <div className="flex items-center gap-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <button onClick={onClick} className="btn btn-primary">
        点击
      </button>
    </div>
  );
};
```

### Hook 开发
```typescript
// 自定义 Hook 示例
export const useMyCustomHook = (initialValue: string) => {
  const [state, setState] = useState(initialValue);
  
  const updateState = useCallback((newValue: string) => {
    setState(newValue);
  }, []);
  
  return { state, updateState };
};
```

## 🧪 测试指南

### 单元测试
- **组件测试**: 使用 React Testing Library
- **Hook 测试**: 使用 Vitest 和 Testing Library
- **工具函数测试**: 直接测试逻辑函数

### 测试示例
```typescript
import { render, screen } from '@testing-library/react';
import { Desktop } from './Desktop';

describe('Desktop', () => {
  it('应该正确渲染桌面组件', () => {
    render(<Desktop />);
    expect(screen.getByTestId('desktop')).toBeInTheDocument();
  });
});
```

## 🚢 部署指南

### 生产构建
```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

### 部署配置
- **静态托管**: 支持 Vercel、Netlify 等
- **CDN 部署**: 可部署到 CDN 加速访问
- **容器化**: 支持 Docker 容器部署

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
- [ ] 添加了适当的类型定义
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

### v0.1.0 (2025年11月)
- ✨ 初始版本发布
- 🎨 实现桌面环境和窗口管理
- 🔧 集成拖拽交互系统
- 📱 支持主题切换和响应式设计

### 计划功能
- 🌍 多语言支持
- 🎮 更多桌面小组件
- 🔌 插件市场功能
- 📊 系统监控面板

---

**开始您的开发之旅** - 查看 [架构设计](开发文档/01-架构设计.md) 了解更多技术细节