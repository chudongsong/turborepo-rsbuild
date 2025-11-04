import { Outlet, Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex gap-4">
            <Link to="/" className="font-semibold hover:underline">
              首页
            </Link>
            <Link to="/about" className="hover:underline">
              关于
            </Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
