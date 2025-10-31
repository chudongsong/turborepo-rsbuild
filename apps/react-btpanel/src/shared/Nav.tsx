import { Button } from '../ui/button';
import logoUrl from '../assets/logo.svg';

export function Nav() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex items-center gap-4 p-4">
        <img src={logoUrl} alt="logo" width={24} height={24} />
        <nav className="flex items-center gap-2">
          <a href="/">
            <Button variant="link">首页</Button>
          </a>
          <a href="/software.html">
            <Button variant="link">软件兼容</Button>
          </a>
          <a href="/login.html">
            <Button variant="link">登录</Button>
          </a>
        </nav>
      </div>
    </header>
  );
}