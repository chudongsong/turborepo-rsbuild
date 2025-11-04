# 项目模板目录

本目录包含可复用的项目模板，用于快速创建新项目。

## 📦 可用模板

### web-template

基于 React 19 + Vite 的现代化前端项目模板。

**技术栈：**
- React 19
- TypeScript 5.9
- Vite 7
- Tailwind CSS v4
- React Router v7
- Zustand
- React Query
- Vitest
- Biome

**使用方式：**

```bash
# 1. 复制模板到workspace
cp -r templates/web-template apps/my-new-app

# 2. 更新项目信息
cd apps/my-new-app
# 编辑 package.json，修改 name、description 等信息

# 3. 安装依赖
pnpm install

# 4. 开始开发
pnpm dev
```

**特性：**
- ✅ 完整的 TypeScript 配置
- ✅ 路径别名支持（@/*）
- ✅ 单元测试配置
- ✅ 代码检查与格式化
- ✅ 现代化开发体验

## 🆕 添加新模板

要添加新的项目模板：

1. 在本目录下创建新的模板文件夹
2. 包含完整的项目结构和配置
3. 添加 README.md 说明使用方法
4. 确保模板独立，不依赖 workspace 配置

## 📝 注意事项

- 模板是独立的，不参与主 workspace 的构建
- 复制后需要手动安装依赖
- 根据需要更新 package.json 中的项目信息
