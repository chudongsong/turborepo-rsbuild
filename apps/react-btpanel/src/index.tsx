import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import './index.css';
import { router } from './router';

NProgress.configure({ showSpinner: false });

function App() {
  useEffect(() => {
    const unsubscribe = router.subscribe(
      (state) => state.location,
      () => {
        NProgress.start();
        setTimeout(() => NProgress.done(), 200);
      },
    );
    return () => unsubscribe();
  }, []);
  return <RouterProvider router={router} />;
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);