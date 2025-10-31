import { defineConfig } from '@rstest/core';

export default defineConfig({
  // 统一 Node 环境，保持与原项目一致
  testEnvironment: 'node',

  // 开启全局 API（describe/it/expect），便于无侵入迁移
  globals: true,

  // 测试文件匹配
  include: ['tests/**/*.{test,spec}.ts'],

  // 覆盖率：与原阈值保持一致，输出 text/json/html
  coverage: {
    enabled: true,
    provider: 'istanbul',
    reporters: ['text', 'json', 'html'],
    thresholds: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
    include: ['src/**/*.ts'],
    exclude: ['src/index.ts'],
  },
});