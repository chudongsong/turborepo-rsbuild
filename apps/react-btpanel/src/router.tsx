import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { createHashHistory } from '@tanstack/history';
import { NavSpa } from './shared/NavSpa';
import { DefaultPage } from './pages/DefaultPage';
import { SoftwarePage } from './pages/SoftwarePage';
import { LoginPage } from './pages/LoginPage';

const RootComponent = () => (
  <div className="min-h-screen">
    <NavSpa />
    <div className="container mx-auto p-4">
      <Outlet />
    </div>
  </div>
);

const rootRoute = createRootRoute({ component: RootComponent });
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: DefaultPage });
const softwareRoute = createRoute({ getParentRoute: () => rootRoute, path: '/software', component: SoftwarePage });
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', component: LoginPage });

const routeTree = rootRoute.addChildren([indexRoute, softwareRoute, loginRoute]);
export const router = createRouter({ routeTree, history: createHashHistory() });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}