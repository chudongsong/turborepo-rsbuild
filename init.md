### 核心拆分思路

1.  **`apps` 目录**：存放“可运行”的应用实例。在你的项目中，就是这个 Linux 面板本身。
2.  **`packages` 目录**：存放“可共享”的代码包。这是拆分的重点，我们将把 `src` 下的大部分目录提取到这里。

-----

### 推荐的 Turborepo 目录结构

```
linux-panel-monorepo/
├── apps/
│   └── panel/                # 你的主应用 "linux (vue3)"
│       ├── public/           # 静态资源 (包括 static/ckeditor, layer 等)
│       ├── src/
│       │   ├── components/   # 仅限 panel 应用内部使用的 "业务组件" (原 src/components/business)
│       │   ├── layout/       # 应用布局 (原 src/layout)
│       │   ├── router/       # Vue Router 配置 (原 src/router)
│       │   ├── store/        # Pinia 状态管理 (原 src/store)
│       │   ├── views/        # 所有的页面视图 (原 src/views)
│       │   ├── App.vue
│       │   └── main.ts       # 应用入口
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json     # 继承根目录的 tsconfig
│       └── vite.config.ts    # 仅 panel 应用的 Vite 配置
│
├── packages/
│   ├── ui/                   # 共享UI组件库
│   │   ├── src/              # (源自 src/components/base, data, feedback, form, other)
│   │   └── package.json
│
│   ├── hooks/                # 共享 Hooks
│   │   ├── src/              # (源自 src/hooks/tools 和部分 business)
│   │   └── package.json
│
│   ├── utils/                # 共享工具函数
│   │   ├── src/              # (源自 src/utils 和 src/public)
│   │   └── package.json
│
│   ├── types/                # 共享 TypeScript 类型
│   │   ├── src/              # (源自 src/types 和根目录的 types)
│   │   └── package.json
│
│   ├── api-client/           # 核心：API 客户端层
│   │   ├── src/              # (源自 src/api 目录下的所有 .ts 文件)
│   │   │   ├── docker.ts
│   │   │   ├── files.ts
│   │   │   ├── site.ts
│   │   │   └── ...
│   │   └── package.json
│
│   ├── plugin-aliyun/        # 阿里云插件 (可插拔模块)
│   │   ├── src/              # (源自 src/plugin/aliyun)
│   │   └── package.json
│
│   ├── plugin-tencent/       # 腾讯云插件 (可插拔模块)
│   │   ├── src/              # (源自 src/plugin/tencent)
│   │   └── package.json
│
│   ├── config-eslint/        # 共享 ESLint 配置
│   │   └── index.js
│
│   ├── config-tsconfig/      # 共享 TypeScript 基础配置
│   │   └── base.json
│
│   └── config-unocss/        # 共享 UnoCSS 配置
│       └── index.ts
│
├── package.json              # 根 package.json (管理 workspaces)
└── turbo.json                # Turborepo 配置文件
```

-----

### 拆分模块详解

你这个项目可以被拆分为 **1 个核心应用**和 **9 个核心模块包**：

#### 1\. `apps/panel` (核心应用)

这是用户实际运行的 Linux 面板应用。

  * **保留内容**：
      * `src/views`: 所有的 `.vue` 页面，这是应用的“视图”。
      * `src/router`: 路由定义，它强绑定 `views`。
      * `src/store`: Pinia 状态，它强绑定 `views` 和业务逻辑。
      * `src/layout`: 应用的整体布局。
      * `src/components/business`: *可以*保留那些与 `views` 紧密耦合、复用性不高的业务组件。
      * `public` 和 `index.html`: 应用的入口和所有静态资源（包括 `ckeditor`, `layer` 等）。

#### 2\. `packages/ui` (共享UI库)

这是最有价值的拆分。

  * **来源**：`src/components/base`, `data`, `feedback`, `form`, `other`。
  * **职责**：提供在整个 `panel` 应用中复用的基础组件（如按钮、表单、弹窗、数据表格等）。未来如果新增 `apps/mobile`，这个 `ui` 包可以被复用。

#### 3\. `packages/api-client` (API客户端)

这是架构清晰的关键。

  * **来源**：`src/api/` 目录下的所有文件（`docker.ts`, `files.ts`, `site.ts`...）。
  * **职责**：封装所有与后端的 HTTP 通信。`apps/panel` 中的 `views` 或 `store` 不再直接导入 `axios`，而是导入这个包提供的服务。
  * **示例**：在 `apps/panel` 中，用法将从 `import { getFiles } from '../../api/files'` 变为 `import { getFiles } from '@linux-panel/api-client/files'`。

#### 4\. `packages/hooks` (共享Hooks)

  * **来源**：`src/hooks/tools` 和 `src/hooks/business` 中可复用的部分。
  * **职责**：沉淀可复用的 Vue 3 组合式函数（如 `usePagination`, `useRequest` 等）。

#### 5\. `packages/utils` (共享工具)

  * **来源**：`src/utils` 和 `src/public` (公共方法)。
  * **职责**：存放纯函数、格式化工具、常量等（如 `formatDate`, `validateIP`）。

#### 6\. `packages/types` (共享类型)

  * **来源**：`src/types` 和根 `types` 目录。
  * **职责**：统一管理 TypeScript 类型，特别是 `api-client` 和 `apps/panel` 都会用到的数据结构（如 `SiteConfig`, `DatabaseUser`）。

#### 7\. `packages/plugin-aliyun` 和 `packages/plugin-tencent` (插件包)

  * **来源**：`src/plugin/*`。
  * **职责**：将可选的、与特定供应商绑定的功能（如阿里云OSS、腾讯云COS）封装成独立的包。这使得主应用 `apps/panel` 更加轻量，也便于未来扩展更多插件。

#### 8\. `packages/config-*` (配置包)

  * **来源**：根目录的 `tsconfig.json`, `.eslintrc.js`, `uno.config.ts`。
  * **职责**：创建 `config-tsconfig`, `config-eslint`, `config-unocss` 包，让 `apps/panel` 和所有其他 `packages` 继承这些基础配置，保证整个 monorepo 的代码规范和构建行为一致。

### 迁移步骤建议

1.  **初始化 Monorepo**: 在新目录运行 `npx create-turbo@latest`。
2.  **创建 `apps/panel`**: 将你现有的整个 `linux (vue3)` 项目代码（除配置文件外）**原封不动**地移动到 `apps/panel` 中。
3.  **配置根目录**: 将 `package.json` 的 `dependencies` 提升到 monorepo 根目录，并配置 `pnpm-workspace.yaml` (推荐 pnpm)。
4.  **跑通应用**: 此时，**先不要拆分 `packages`**，首先确保 `apps/panel` 能在 monorepo 结构下正常 `pnpm run dev` 和 `build`。
5.  **增量提取 `packages` (关键)**:
      * **第一步**: 创建 `packages/utils`。将 `apps/panel/src/utils` 的代码剪切到 `packages/utils/src`。
      * **第二步**: 在 `packages/utils/package.json` 中声明它。
      * **第三步**: 在 `apps/panel/package.json` 中添加对 `"@linux-panel/utils": "workspace:*"` 的依赖。
      * **第四步**: 在 `apps/panel` 中，全局搜索替换 `from '../utils/...'` 为 `from '@linux-panel/utils'`。
      * **重复**: 对 `hooks`, `types`, `ui`, `api-client` 重复上述“剪切-粘贴-声明依赖-替换路径”的过程。

这个拆分方案将使你的项目边界清晰，`apps/panel` 只负责“视图和业务编排”，而 `packages` 负责提供“能力”（UI、API、工具）。使用 Turborepo 后，你修改 `packages/ui`，Turborepo 会自动知道 `apps/panel` 依赖了它，并只构建受影响的部分，大大加快开发和 CI/CD 的速度。