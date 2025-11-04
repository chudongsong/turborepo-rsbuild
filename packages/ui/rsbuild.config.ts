import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
  output: {
    target: 'web',
    distPath: {
      root: 'dist',
    },
    filename: {
      js: '[name].js',
      css: '[name].css',
    },
    filenameHash: false,
  },
  tools: {
    rspack: {
      output: {
        library: {
          name: 'TurboUI',
          type: 'umd',
        },
        globalObject: 'this',
      },
      externals: {
        react: {
          commonjs: 'react',
          commonjs2: 'react',
          amd: 'react',
          root: 'React',
        },
        'react-dom': {
          commonjs: 'react-dom',
          commonjs2: 'react-dom',
          amd: 'react-dom',
          root: 'ReactDOM',
        },
        'react/jsx-runtime': {
          commonjs: 'react/jsx-runtime',
          commonjs2: 'react/jsx-runtime',
          amd: 'react/jsx-runtime',
          root: ['React', 'jsx'],
        },
        '@radix-ui/react-slot': '@radix-ui/react-slot',
        '@radix-ui/react-label': '@radix-ui/react-label',
        'class-variance-authority': 'class-variance-authority',
        'clsx': 'clsx',
        'tailwind-merge': 'tailwind-merge',
        'lucide-react': 'lucide-react',
      },
    },
  },
})