export function AboutPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-bold">关于项目</h1>
      <p className="text-muted-foreground">
        这是一个现代化的前端项目模板，旨在为新项目提供快速启动的基础架构。
      </p>
      <div className="p-6 border rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">技术栈</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <h3 className="font-semibold mb-2">核心框架</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>React 19</li>
              <li>TypeScript 5.9</li>
              <li>Vite 7</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">样式方案</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Tailwind CSS 4</li>
              <li>shadcn/ui</li>
              <li>CSS Variables</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">开发工具</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Biome 代码检查</li>
              <li>Vitest 测试</li>
              <li>pnpm 工作区</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
