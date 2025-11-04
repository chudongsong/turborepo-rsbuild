/**
 * Vitest 配置文件
 */

import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		// 测试环境
		environment: 'jsdom',
		// 设置每个测试的超时时间
		timeout: 10000,
		// 在测试中启用源码映射（用于调试）
		sourcemap: true,
		// 全局设置
		globals: true,
		// 设置测试文件匹配模式
		include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		// 排除的文件
		exclude: [
			'node_modules',
			'dist',
			'.git',
			'.cache',
			'**/*.d.ts',
			'examples',
		],
		// 覆盖率配置
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'src/**/*.d.ts',
				'src/**/__tests__/**',
				'src/test-utils.tsx',
				'**/*.config.{js,ts,mjs,cjs}',
				'**/setup.ts',
				'examples/',
				'dist/',
			],
			thresholds: {
				global: {
					branches: 80,
					functions: 80,
					lines: 80,
					statements: 80,
				},
			},
		},
		// reporters
		reporters: ['default', 'verbose'],
		// 模拟配置
		mockReset: true,
		// 并行测试
		threads: true,
		// 测试超时
		testTimeout: 10000,
		// 钩子超时
		hookTimeout: 10000,
		// 输出
		outputFile: 'test-results.xml',
	},
})
