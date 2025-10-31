import { Link } from '@tanstack/react-router';
import { Button } from '../ui/button';
import logoUrl from '../assets/logo.svg';

export function NavSpa() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex items-center gap-4 p-4">
        <img src={logoUrl} alt="logo" width={24} height={24} />
        <nav className="flex items-center gap-2">
          <Link to="/">
            <Button variant="link">首页(SPA)</Button>
          </Link>
          <Link to="/software">
            <Button variant="link">软件兼容(SPA)</Button>
          </Link>
          <Link to="/login">
            <Button variant="link">登录(SPA)</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}