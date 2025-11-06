# @linglongos/ui 文档中心

欢迎来到 @linglongos/ui 文档中心！这里是您了解、使用和扩展共享 React UI 组件库的完整指南。

## 🚀 库简介

@linglongos/ui 是一个基于 Radix UI + shadcn/ui + Tailwind CSS 模式构建的共享 React UI 组件库，为整个单体仓库提供统一的 UI 组件。

### 核心特性
- **🧩 丰富组件**: 提供按钮、输入框、卡片等基础组件
- **♿ 无障碍**: 基于 Radix UI 的完整无障碍支持
- **🎨 可定制**: 基于 Tailwind CSS 的灵活样式系统
- **📦 零依赖**: 组件库本身无运行时依赖
- **🔧 TypeScript**: 完整的类型定义支持
- **📱 响应式**: 移动端和桌面端完美适配

## 📚 文档导航

### 🎯 快速开始
- [快速开始](#-快速开始) - 5分钟上手指南
- [安装使用](#-安装使用) - 详细的安装和配置
- [组件展示](#-组件展示) - 可视化组件示例

### 📂 分类文档

#### 🛠️ 开发文档
- [01-组件设计原则](开发文档/01-组件设计原则.md) - UI 组件设计规范
- [02-样式系统设计](开发文档/02-样式系统设计.md) - Tailwind CSS 集成方案
- [03-无障碍指南](开发文档/03-无障碍指南.md) - 无障碍功能实现

#### 🔗 API文档
- [01-Basic Components API](API文档/01-Basic-Components-API.md) - 基础组件 API
- [02-Custom Components API](API文档/02-Custom-Components-API.md) - 自定义组件 API

#### 🔨 构建文档
- [01-构建配置](构建文档/01-构建配置.md) - UMD 构建和发布配置

## 🏗️ 项目结构

```
packages/ui/
├── src/                    # 源代码
│   ├── components/         # 组件实现
│   │   ├── ui/             # 基础 UI 组件
│   │   │   ├── button.tsx      # 按钮组件
│   │   │   ├── input.tsx       # 输入框组件
│   │   │   ├── card.tsx        # 卡片组件
│   │   │   └── label.tsx       # 标签组件
│   │   └── custom/          # 自定义组件
│   │       └── custom-card.tsx # 自定义卡片
│   ├── lib/                # 工具函数
│   │   └── utils.ts        # cn() 函数等
│   ├── styles/             # 样式文件
│   │   └── globals.css     # 全局样式
│   └── index.ts            # 导出入口
├── docs/                   # 文档
└── package.json            # 包配置
```

## 🚀 快速开始

### 安装

```bash
pnpm add @linglongos/ui
```

### 基本使用

```typescript
import React from 'react';
import { Button, Card, Input, Label } from '@linglongos/ui';

function MyForm() {
  return (
    <Card className="w-96">
      <div className="space-y-4">
        <div>
          <Label htmlFor="email">邮箱</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="输入您的邮箱" 
          />
        </div>
        <div>
          <Label htmlFor="password">密码</Label>
          <Input 
            id="password" 
            type="password" 
            placeholder="输入您的密码" 
          />
        </div>
        <Button className="w-full">
          登录
        </Button>
      </div>
    </Card>
  );
}
```

## 🧩 核心组件

### Button 组件

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg';
  asChild?: boolean;
}

const { Button } = {
  Button: React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
      // 实现代码...
    }
  )
};
```

### Input 组件

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    // 实现代码...
  }
);
```

### Card 组件

```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    // 实现代码...
  }
);
```

## 🎨 主题定制

### CSS 变量配置

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}
```

## 🚀 发布和维护

### 构建命令

```bash
# 构建 UMD 版本
pnpm build

# 类型检查
pnpm type-check

# 代码检查
pnpm lint
```

---

**开始使用 UI 组件** - 查看 [组件设计原则](开发文档/01-组件设计原则.md) 了解更多设计细节