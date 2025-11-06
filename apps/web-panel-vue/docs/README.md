# Vue 面板文档中心

欢迎来到 Linglong Web Panel Vue 文档中心！这里是您了解、开发和使用 Vue 3 传统服务器管理面板的完整指南。

## 🚀 项目简介

Linglong Web Panel Vue 是基于 Vue 3 + TypeScript + Element Plus 构建的传统服务器管理面板，提供完整、稳定的管理界面和丰富的服务器管理功能。

### 核心特性
- **🎨 Vue 3 现代化**: 基于 Vue 3.5.12 + Composition API
- **📱 Element Plus UI**: 丰富的桌面级 UI 组件库
- **🔧 Pinia 状态管理**: 现代化状态管理解决方案
- **🛣️ Vue Router 4**: 完整的路由系统
- **🖥️ 终端功能**: 集成 xterm.js 提供完整终端体验
- **📊 数据可视化**: ECharts 图表展示系统资源
- **🎯 拖拽支持**: vue3-dnd 提供流畅拖拽交互
- **⚡ Rsbuild 构建**: 高性能构建和热更新

## 📚 文档导航

### 🎯 快速开始
- [项目概述](#-项目概述) - 了解面板架构和技术栈
- [开发指南](#-开发指南) - 本地开发环境搭建
- [构建部署](#-构建部署) - 生产环境构建和部署

### 📂 分类文档

#### 🛠️ 开发文档
- [01-项目架构设计](开发文档/01-项目架构设计.md) - Vue 3 架构和设计理念
- [02-组件开发规范](开发文档/02-组件开发规范.md) - Vue SFC 组件开发标准
- [03-状态管理设计](开发文档/03-状态管理设计.md) - Pinia 状态管理方案
- [04-路由系统实现](开发文档/04-路由系统实现.md) - Vue Router 配置和使用
- [05-终端功能实现](开发文档/05-终端功能实现.md) - 终端集成和 WebSocket 通信

#### 🔗 API文档
- [01-面板组件API](API文档/01-面板组件API.md) - 面板相关组件接口说明
- [02-服务接口API](API文档/02-服务接口API.md) - API 通信和状态管理接口
- [03-终端API](API文档/03-终端API.md) - 终端功能和 WebSocket API

#### 🔨 构建文档
- [01-构建配置说明](构建文档/01-构建配置说明.md) - Rsbuild + Gulp 构建配置
- [02-开发环境配置](构建文档/02-开发环境配置.md) - Vue 开发环境搭建
- [03-Git部署配置](构建文档/03-Git部署配置.md) - Git 集成部署方案
- [04-Docker部署配置](构建文档/04-Docker部署配置.md) - 容器化部署方案

#### 📋 任务文档
- [01-功能开发计划](任务文档/01-功能开发计划.md) - 面板功能开发路线图
- [02-性能优化记录](任务文档/02-性能优化记录.md) - 性能优化实践记录

## 🏗️ 项目结构

```
apps/web-panel-vue/
├── src/                    # 源代码
│   ├── components/         # Vue 组件
│   │   ├── common/         # 通用组件
│   │   ├── layout/         # 布局组件
│   │   ├── forms/          # 表单组件
│   │   ├── tables/         # 表格组件
│   │   └── charts/         # 图表组件
│   ├── views/              # 页面组件
│   │   ├── Dashboard.vue   # 仪表板
│   │   ├── Terminal.vue    # 终端页面
│   │   ├── Files.vue       # 文件管理
│   │   └── Settings.vue    # 设置页面
│   ├── stores/             # Pinia 状态管理
│   │   ├── user.ts         # 用户状态
│   │   ├── system.ts       # 系统状态
│   │   └── terminal.ts     # 终端状态
│   ├── utils/              # 工具函数
│   │   ├── api.ts          # API 请求封装
│   │   ├── websocket.ts    # WebSocket 连接
│   │   └── helpers.ts      # 辅助函数
│   ├── router/             # 路由配置
│   │   └── index.ts        # 路由定义
│   ├── types/              # TypeScript 类型
│   ├── styles/             # 样式文件
│   └── main.ts             # 应用入口
├── pages/                  # 静态页面
├── public/                 # 静态资源
├── config/                 # 配置文件
├── scripts/                # 构建脚本
├── docs/                   # 文档目录
└── package.json            # 包配置
```

## 🛠️ 技术栈

### 核心框架和库
- **Vue**: 3.5.12 - 渐进式前端框架
- **TypeScript**: ^5.7.3 - 类型安全开发
- **Element Plus**: 2.8.4 - Vue 3 UI 组件库
- **Vue Router**: 4.4.5 - 官方路由管理

### 状态管理和数据
- **Pinia**: ^2.3.1 - Vue 官方状态管理
- **VueUse**: ^11.1.0 - Composition 工具库
- **Axios**: ^1.7.7 - HTTP 客户端

### 工具和集成
- **@xterm/xterm**: ^5.5.0 - Web 终端模拟器
- **ECharts**: ^5.5.1 - 数据可视化
- **vue3-dnd**: ^2.1.0 - Vue 拖拽系统
- **SortableJS**: ^1.15.3 - 列表拖拽排序
- **Ace Diff**: ^3.0.3 - 代码对比工具

### 构建和开发
- **Rsbuild**: ^1.4.0 - 高性能构建工具
- **Gulp**: ^5.0.0 - 任务自动化
- **UnoCSS**: ^0.60.2 - 原子化 CSS
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

# 构建 Git 部署版本
pnpm build:git

# 构建 Docker 镜像版本
pnpm build:docker

# 代码检查
pnpm lint

# 自动修复代码问题
pnpm lint:fix

# 代码格式化
pnpm format

# 自动格式化代码
pnpm format:fix

# 运行测试
pnpm test

# 生成覆盖率报告
pnpm coverage

# 预览生产构建
pnpm preview

# 上传到远程服务器
pnpm upload

# 上传到 Git 仓库
pnpm upload:git
```

### 环境变量
```bash
# 开发环境配置
VITE_API_BASE_URL=http://localhost:4000
VITE_WS_BASE_URL=ws://localhost:4000
VITE_APP_TITLE=Linglong Panel
VITE_DEBUG=true

# 生产环境配置
VITE_API_BASE_URL=https://api.example.com
VITE_WS_BASE_URL=wss://api.example.com
VITE_APP_TITLE=Linglong Panel - Production
VITE_DEBUG=false
```

## 🎯 核心功能

### 1. 仪表板
- **系统概览**: CPU、内存、磁盘、网络状态
- **实时监控**: 资源使用率的实时图表
- **服务状态**: 关键服务的运行状态
- **告警信息**: 系统告警和通知

### 2. 终端功能
- **Web 终端**: 基于 xterm.js 的全功能终端
- **多标签管理**: 多个终端会话管理
- **历史记录**: 命令历史和输出记录
- **文件上传**: 通过终端上传下载文件

### 3. 文件管理
- **文件浏览**: 树形文件目录浏览
- **文件操作**: 新建、删除、重命名、复制、移动
- **权限管理**: 文件权限设置和管理
- **在线编辑**: 内置文件编辑器

### 4. 软件管理
- **包管理**: 系统的软件包管理
- **应用商店**: 可用软件列表和安装
- **服务管理**: 系统服务的启停管理
- **更新管理**: 软件和系统更新

### 5. 系统监控
- **性能监控**: 系统性能指标监控
- **进程管理**: 进程查看和操作
- **日志查看**: 系统和应用日志
- **网络监控**: 网络连接状态

### 6. 设置管理
- **用户设置**: 个人偏好设置
- **系统设置**: 系统级别配置
- **安全设置**: 安全相关配置
- **主题设置**: 界面主题和样式

## 📊 性能指标

### 构建性能
- **首次构建时间**: < 25秒
- **增量构建**: < 5秒
- **开发热更新**: < 1秒

### 运行时性能
- **首屏加载时间**: < 2.5秒
- **页面切换时间**: < 300ms
- **内存占用**: < 100MB（空闲状态）

### 浏览器兼容性
- **Chrome**: 88+
- **Firefox**: 85+
- **Safari**: 14+
- **Edge**: 88+

## 🔧 开发指南

### 组件开发规范
```vue
<template>
  <div class="server-card">
    <el-card class="server-card__content">
      <template #header>
        <div class="server-card__header">
          <h3>{{ server.name }}</h3>
          <el-tag :type="getStatusType(server.status)">
            {{ getStatusText(server.status) }}
          </el-tag>
        </div>
      </template>
      
      <div class="server-card__body">
        <el-descriptions :column="2" size="small">
          <el-descriptions-item label="CPU">{{ server.cpu }}%</el-descriptions-item>
          <el-descriptions-item label="内存">{{ server.memory }}%</el-descriptions-item>
          <el-descriptions-item label="磁盘">{{ server.disk }}%</el-descriptions-item>
          <el-descriptions-item label="网络">{{ server.network }}%</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <template #footer>
        <el-button-group>
          <el-button size="small" @click="handleConnect">
            连接
          </el-button>
          <el-button size="small" @click="handleMonitor">
            监控
          </el-button>
        </el-button-group>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElCard, ElTag, ElButton, ElButtonGroup, ElDescriptions, ElDescriptionsItem } from 'element-plus'

interface Server {
  id: string
  name: string
  status: 'online' | 'offline' | 'error'
  cpu: number
  memory: number
  disk: number
  network: number
}

interface Props {
  server: Server
}

interface Emits {
  connect: [server: Server]
  monitor: [server: Server]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const statusType = computed(() => {
  const statusMap = {
    online: 'success',
    offline: 'info',
    error: 'danger'
  } as const
  return statusMap[props.server.status] || 'info'
})

const statusText = computed(() => {
  const textMap = {
    online: '在线',
    offline: '离线',
    error: '错误'
  } as const
  return textMap[props.server.status] || '未知'
})

const handleConnect = () => {
  emit('connect', props.server)
}

const handleMonitor = () => {
  emit('monitor', props.server)
}

defineOptions({
  name: 'ServerCard'
})
</script>

<style scoped>
.server-card {
  margin-bottom: 16px;
}

.server-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.server-card__header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.server-card__body {
  margin: 16px 0;
}
</style>
```

### Pinia 状态管理
```typescript
// stores/system.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { systemApi } from '@/utils/api'

export const useSystemStore = defineStore('system', () => {
  // 状态
  const servers = ref<Server[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // 计算属性
  const onlineServers = computed(() => 
    servers.value.filter(server => server.status === 'online')
  )
  
  const offlineServers = computed(() => 
    servers.value.filter(server => server.status === 'offline')
  )
  
  const totalServers = computed(() => servers.value.length)
  
  const averageCpu = computed(() => {
    if (servers.value.length === 0) return 0
    const total = servers.value.reduce((sum, server) => sum + server.cpu, 0)
    return Math.round(total / servers.value.length)
  })
  
  // 方法
  const fetchServers = async () => {
    try {
      isLoading.value = true
      error.value = null
      const data = await systemApi.getServers()
      servers.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取服务器列表失败'
    } finally {
      isLoading.value = false
    }
  }
  
  const addServer = async (serverData: Omit<Server, 'id'>) => {
    try {
      const newServer = await systemApi.addServer(serverData)
      servers.value.push(newServer)
      return newServer
    } catch (err) {
      error.value = err instanceof Error ? err.message : '添加服务器失败'
      throw err
    }
  }
  
  const removeServer = async (serverId: string) => {
    try {
      await systemApi.removeServer(serverId)
      const index = servers.value.findIndex(server => server.id === serverId)
      if (index !== -1) {
        servers.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除服务器失败'
      throw err
    }
  }
  
  const updateServer = async (serverId: string, updates: Partial<Server>) => {
    try {
      const updatedServer = await systemApi.updateServer(serverId, updates)
      const index = servers.value.findIndex(server => server.id === serverId)
      if (index !== -1) {
        servers.value[index] = updatedServer
      }
      return updatedServer
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新服务器失败'
      throw err
    }
  }
  
  return {
    // 状态
    servers,
    isLoading,
    error,
    // 计算属性
    onlineServers,
    offlineServers,
    totalServers,
    averageCpu,
    // 方法
    fetchServers,
    addServer,
    removeServer,
    updateServer
  }
})
```

### 路由配置
```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      title: '仪表板',
      icon: 'Monitor',
      requiresAuth: true
    }
  },
  {
    path: '/terminal',
    name: 'Terminal',
    component: () => import('@/views/Terminal.vue'),
    meta: {
      title: '终端',
      icon: 'Terminal',
      requiresAuth: true
    }
  },
  {
    path: '/files',
    name: 'Files',
    component: () => import('@/views/Files.vue'),
    meta: {
      title: '文件管理',
      icon: 'Folder',
      requiresAuth: true
    }
  },
  {
    path: '/software',
    name: 'Software',
    component: () => import('@/views/Software.vue'),
    meta: {
      title: '软件管理',
      icon: 'Package',
      requiresAuth: true
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: {
      title: '设置',
      icon: 'Setting',
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - Linglong Panel`
  }
  
  // 检查登录状态
  const isAuthenticated = localStorage.getItem('token')
  
  if (to.meta?.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.name === 'Login' && isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
```

## 🧪 测试指南

### 测试框架
- **Vitest**: Vue 3 单元测试框架
- **Vue Test Utils**: Vue 组件测试工具
- **@vue/vue3-jest**: Vue 3 Jest 转换器

### 测试示例
```typescript
// tests/components/ServerCard.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ServerCard from '@/components/ServerCard.vue'

describe('ServerCard', () => {
  it('应该正确渲染服务器信息', () => {
    const server = {
      id: '1',
      name: '测试服务器',
      status: 'online' as const,
      cpu: 45,
      memory: 62,
      disk: 78,
      network: 23
    }
    
    const wrapper = mount(ServerCard, {
      props: { server }
    })
    
    expect(wrapper.find('h3').text()).toBe('测试服务器')
    expect(wrapper.find('.el-tag').text()).toBe('在线')
    expect(wrapper.text()).toContain('45%')
    expect(wrapper.text()).toContain('62%')
  })
  
  it('应该正确处理点击事件', async () => {
    const server = {
      id: '1',
      name: '测试服务器',
      status: 'online' as const,
      cpu: 45,
      memory: 62,
      disk: 78,
      network: 23
    }
    
    const wrapper = mount(ServerCard, {
      props: { server }
    })
    
    await wrapper.find('button').trigger('click')
    
    expect(wrapper.emitted('connect')).toBeTruthy()
    expect(wrapper.emitted('connect')[0][0]).toEqual(server)
  })
})
```

## 🚀 部署指南

### Git 部署
```bash
# 构建 Git 部署版本
pnpm build:git

# 上传到 Git 仓库
pnpm upload:git
```

### Docker 部署
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build:docker

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 自动化部署脚本
```bash
#!/bin/bash
# deploy.sh

set -e

echo "开始部署流程..."

# 1. 安装依赖
pnpm install

# 2. 运行测试
pnpm test

# 3. 代码检查
pnpm lint

# 4. 构建生产版本
pnpm build:git

# 5. 上传到远程服务器
pnpm upload:git

echo "部署完成！"
```

## 🤝 贡献指南

### 开发流程
1. **Fork 项目** - 创建您的项目副本
2. **创建分支** - `git checkout -b feature/your-feature-name`
3. **开发测试** - 编写代码并运行测试
4. **代码检查** - 确保通过 Biome 检查
5. **提交代码** - 遵循提交规范
6. **创建PR** - 提交 Pull Request

### 代码规范
- **组件命名**: 使用 PascalCase，如 `ServerCard.vue`
- **文件名**: 使用 kebab-case，如 `server-card.vue`
- **Prop 命名**: 使用 camelCase
- **CSS 类名**: 使用 BEM 命名规范
- **TypeScript**: 严格模式，完整类型定义

### Vue 特定规范
- **组合式 API**: 使用 `<script setup>` 语法
- **响应式**: 使用 `ref` 和 `reactive`
- **组件通信**: 使用 `defineProps` 和 `defineEmits`
- **路由**: 使用命名路由和路由元信息

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
- 🎨 实现完整的服务器管理界面
- 🖥️ 集成终端功能和管理
- 📊 添加数据可视化图表
- 🚀 升级到 Rsbuild 构建系统
- 🐳 添加 Docker 支持

### 计划功能
- 📱 移动端适配优化
- 🌐 多语言支持
- 🔌 插件系统扩展
- 📈 高级监控和告警

---

**开始您的开发之旅** - 查看 [项目架构设计](开发文档/01-项目架构设计.md) 了解更多技术细节