import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';

export default defineConfig({
  server: {
    port: 3030,
  },
  source: {
    entry: {
      index: './src/entries/index.tsx',
      login: './src/entries/login.tsx',
      software: './src/entries/software.tsx',
      spa: './src/index.tsx',
    },
  },
  html: {
    // 默认模板指向 pages/index.html，其它入口在 tools.htmlPlugin 中覆盖
    template: './pages/index.html',
  },
  tools: {
    htmlPlugin(config, { entryName }) {
      const map: Record<string, { template: string; filename: string }> = {
        index: { template: './pages/index.html', filename: 'index.html' },
        login: { template: './pages/login.html', filename: 'login.html' },
        software: { template: './pages/software.html', filename: 'software.html' },
        spa: { template: './pages/spa.html', filename: 'spa.html' },
      };
      const matched = map[entryName];
      if (matched) {
        config.template = matched.template;
        config.filename = matched.filename;
      }
    },
    rspack: {
      optimization: {
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: -10,
            },
            'react-use': {
              test: /[\\/]node_modules[\\/]react-use[\\/]/,
              name: 'react-use',
              chunks: 'all',
              priority: 10,
              enforce: true,
            },
          },
        },
      },
    },
  },
  plugins: [pluginReact(), pluginSvgr()],
});