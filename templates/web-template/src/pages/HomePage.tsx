export function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-bold">欢迎使用 Web 模板</h1>
      <p className="text-muted-foreground">
        这是一个基于 React 19 + TypeScript + Vite + Tailwind CSS 的现代化前端项目模板。
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">特性</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>• React 19 最新特性</li>
            <li>• TypeScript 严格模式</li>
            <li>• Vite 极速开发</li>
            <li>• Tailwind CSS 样式方案</li>
            <li>• React Router 路由管理</li>
            <li>• Zustand 状态管理</li>
            <li>• React Query 数据获取</li>
            <li>• shadcn/ui 组件库</li>
          </ul>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">项目结构</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>• /src/components - 公共组件</li>
            <li>• /src/pages - 页面组件</li>
            <li>• /src/hooks - 自定义 Hooks</li>
            <li>• /src/store - 状态管理</li>
            <li>• /src/services - API 服务</li>
            <li>• /src/types - 类型定义</li>
            <li>• /src/utils - 工具函数</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
