# 项目命令参考

本文档提供了 Turborepo-Rsbuild 项目中常用的命令参考，按功能分类以便快速查找。

## 1. 基础命令

### 依赖管理
```bash
pnpm install                    # 安装所有依赖（需要 pnpm v8.15.6+）
```

### 开发与构建
```bash
pnpm dev                        # 并行启动所有开发服务器（需要 .env 文件）
pnpm with-env turbo dev         # 带环境变量的开发模式
pnpm build                      # 按依赖顺序构建所有应用和包
pnpm lint                       # 对所有工作区进行代码检查
```

### 代码检查与格式化（Biome）
```bash
pnpm biome:check                # 检查所有文件的代码风格/格式问题
pnpm biome:check:fix            # 自动修复所有代码风格/格式问题
pnpm biome:lint                 # 仅运行代码检查
pnpm biome:format               # 仅运行代码格式化
pnpm biome:format:fix           # 修复代码格式问题
```

## 2. 应用特定命令

### Vue 面板 (web-panel-vue)
```bash
pnpm -C apps/web-panel-vue dev              # 启动 Vue 开发服务器
pnpm -C apps/web-panel-vue build            # 使用 Rsbuild + Gulp 构建
pnpm -C apps/web-panel-vue build:git        # 构建 Git 部署版本
pnpm -C apps/web-panel-vue build:docker     # 构建 Docker 镜像版本
pnpm -C apps/web-panel-vue preview          # 预览生产构建结果
pnpm -C apps/web-panel-vue lint             # Biome 代码检查（Vue/TypeScript）
```

### React 面板 (web-panel-react)
```bash
pnpm -C apps/web-panel-react dev            # 启动 React 开发服务器
pnpm -C apps/web-panel-react build          # 使用 Rsbuild 构建
pnpm -C apps/web-panel-react preview        # 预览生产构建结果
pnpm -C apps/web-panel-react check          # Biome 检查（代码检查 + 格式化）
```

### 桌面应用 (desktop-app)
```bash
pnpm -C apps/desktop-app dev                # 启动 Vite 开发服务器
pnpm -C apps/desktop-app build              # 生产环境构建
pnpm -C apps/desktop-app test               # 运行 Vitest 测试
pnpm -C apps/desktop-app test:watch         # 监视模式运行测试
pnpm -C apps/desktop-app coverage           # 运行带覆盖率的测试
pnpm -C apps/desktop-app preview            # 预览生产构建结果
```

### API 服务 (api-service)
```bash
pnpm -C apps/api-service dev                # 启动开发服务器
pnpm -C apps/api-service build              # TypeScript 构建
pnpm -C apps/api-service start              # 启动生产服务器
pnpm -C apps/api-service test               # 运行测试
pnpm -C apps/api-service test:local         # 本地测试
pnpm -C apps/api-service ci                 # CI 模式测试
```

## 3. 包特定命令

### UI 组件库
```bash
pnpm -C packages/ui dev                     # 启动 UI 库开发服务器
pnpm -C packages/ui build                   # 构建 UMD 发行版
pnpm -C packages/ui type-check              # TypeScript 类型检查
pnpm -C packages/ui clean                   # 清理构建产物
```

### 通用 Hooks 库
```bash
pnpm -C packages/hooks dev                   # 启动开发服务器
pnpm -C packages/hooks build                 # TypeScript 构建
pnpm -C packages/hooks test                  # 运行 Vitest 测试
pnpm -C packages/hooks test:watch            # 监视模式运行测试
pnpm -C packages/hooks coverage              # 运行带覆盖率的测试
pnpm -C packages/hooks lint                   # Biome 代码检查
```

### Utils 工具库
```bash
pnpm -C packages/utils dev                   # 启动开发服务器
pnpm -C packages/utils build                 # 使用 Rsbuild + TypeScript 构建
pnpm -C packages/utils test                  # 运行 Vitest 测试（支持 Rust rstest）
pnpm -C packages/utils test:watch            # 监视模式运行测试
pnpm -C packages/utils coverage              # 运行带覆盖率的测试
pnpm -C packages/utils lint                  # Biome 代码检查
```

### 共享类型包
```bash
pnpm -C packages/shared-types build          # 构建类型定义
pnpm -C packages/shared-types type-check     # TypeScript 类型检查
```

## 4. 环境配置

### 环境变量设置
在项目根目录创建 `.env` 文件：
```bash
PUBLIC_HOST=http://localhost:3000
PUBLIC_REMOTE_1=http://localhost:3001
PUBLIC_REMOTE_2=http://localhost:3002
```

这些变量用于 Turborepo 的缓存机制，并在构建/开发过程中传递给各应用。

## 5. 特殊命令

### 项目优化
```bash
node scripts/optimize-project.js             # 运行项目优化脚本
```

### 清理模块
```bash
bash scripts/clean-modules.sh                # 清理所有 node_modules
```

### API 测试
```bash
bash scripts/test-api-e2e.sh                 # 运行 API 端到端测试
```

### 更新导入
```bash
node scripts/update-imports.js               # 更新项目中的导入语句
```

### 拆分桌面应用
```bash
node scripts/split-desktop-app.js            # 拆分桌面应用代码
```

## 6. 服务地址

开发服务器默认地址：
- Vue 面板：http://localhost:3000
- React 面板：http://localhost:3001
- 桌面应用：http://localhost:3002
- API 服务：http://localhost:4000
- API 文档（Swagger UI）：http://localhost:4000/docs

## 7. 常见问题解决

### 依赖问题
```bash
# 清理并重新安装依赖
bash scripts/clean-modules.sh
pnpm install
```

### 构建缓存问题
```bash
# 清理 Turborepo 缓存
pnpm build --force
```

### 类型检查问题
```bash
# 重新生成类型定义
pnpm -C packages/shared-types build
```

### 代码格式问题
```bash
# 自动修复所有代码格式问题
pnpm biome:check:fix
```

## 8. 开发提示

1. **并行开发**：使用 `pnpm dev` 可以同时启动所有应用的开发服务器
2. **快速检查**：在提交代码前运行 `pnpm biome:check` 确保代码风格一致
3. **测试覆盖**：使用 `coverage` 命令查看测试覆盖率报告
4. **类型安全**：定期运行 `type-check` 确保 TypeScript 类型正确
5. **性能优化**：使用 `optimize-project.js` 脚本优化项目性能

## 9. 版本要求

- Node.js：大多数应用需要 Node 18+，API 服务需要 Node 20.18.1+
- pnpm：v8.15.6+
- React：19（通过工作区覆盖）
- Biome：v2.3.2
- Turborepo：v2.0.11