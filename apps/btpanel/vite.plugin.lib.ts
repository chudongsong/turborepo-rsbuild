import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue2'
import vueJsx from '@vitejs/plugin-vue2-jsx'

export default defineConfig({
	plugins: [
		// 引入Vue2
		Vue(),
		// 引入vue2的jsx语法
		vueJsx(),
	],
	build: {
		lib: {
			entry: './lib/main.ts',
			name: 'aliyun',
			fileName: 'aliyun',
		},
		rollupOptions: {
			// 确保外部化处理那些你不想打包进库的依赖
			external: ['vue'],
			output: {
				// 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
				globals: {
					vue: 'Vue',
				},
			},
		},
	},
})
