import { defineConfig } from '@rsbuild/core'

/** Rsbuild 配置 */
export default defineConfig({
  source: {
    entry: {
      index: './src/index.ts',
    },
    define: {
      'process.env.RSTEST': false,
    },
  },
  output: {
    distPath: { root: 'dist' },
    cleanDistPath: true,
    // 生成两种格式，借助 bundler 输出 CJS 与 ESM
    // Rsbuild 底层使用 Rspack，CJS/ESM 双构建通过多入口输出文件名实现
    filenameHash: false,
  },
  tools: {
    rspack(config) {
      config.output = {
        ...(config.output || {}),
        library: { type: 'module' },
      }
      config.experiments = {
        ...(config.experiments || {}),
        outputModule: true,
      }
    },
  },
})
