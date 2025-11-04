/**
 * 测试环境设置
 */

import { beforeAll, vi } from 'vitest'

// 模拟 window.location
Object.defineProperty(window, 'location', {
	value: {
		href: 'http://localhost:3000',
		protocol: 'http:',
		hostname: 'localhost',
		port: '3000',
		pathname: '/',
		search: '',
		hash: '',
	},
	writable: true,
})

// 模拟 localStorage
const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
	value: localStorageMock,
})

// 模拟 sessionStorage
const sessionStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
	value: sessionStorageMock,
})

// 模拟 console
global.console = {
	...console,
	log: vi.fn(),
	error: vi.fn(),
	warn: vi.fn(),
	info: vi.fn(),
	debug: vi.fn(),
}

// 模拟 window.vite_public_request_token
Object.defineProperty(window, 'vite_public_request_token', {
	value: 'test-token',
	writable: true,
})

// 模拟 process.env
Object.defineProperty(process, 'env', {
	value: {
		NODE_ENV: 'test',
	},
})
