import React from 'react';
import { createRoot } from 'react-dom/client';
import { useTitle, useWindowSize } from 'react-use';
import '../index.css';
import { Nav } from '../shared/Nav';
import { DefaultPage } from '../pages/DefaultPage';

function Page() {
  useTitle('首页 - React BTPanel');
  const { width } = useWindowSize();
  return (
    <div className="min-h-screen">
      <Nav />
      <div className="container mx-auto p-4 space-y-2">
        <DefaultPage />
        <div className="text-xs text-gray-500">窗口宽度：{Math.round(width)}px</div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>,
);