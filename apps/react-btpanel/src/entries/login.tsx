import React from 'react';
import { createRoot } from 'react-dom/client';
import { useTitle } from 'react-use';
import '../index.css';
import { Nav } from '../shared/Nav';
import { LoginPage } from '../pages/LoginPage';

function Page() {
  useTitle('登录 - React BTPanel');
  return (
    <div className="min-h-screen">
      <Nav />
      <div className="container mx-auto p-4">
        <LoginPage />
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>,
);