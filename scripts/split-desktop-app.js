#!/usr/bin/env node

/**
 * 拆分desktop应用为多个独立包
 */

const fs = require('fs');
const path = require('path');

const desktopAppPath = path.join(process.cwd(), 'apps/desktop-app');
const packagesPath = path.join(process.cwd(), 'packages');

console.log('🔨 开始拆分desktop应用...\n');

// 定义拆分映射
const splitPackages = [
  {
    name: '@org/ui-components',
    path: 'packages/ui-components',
    files: [
      'components/ui'
    ],
  },
  {
    name: '@org/desktop-core',
    path: 'packages/desktop-core',
    files: [
      'components/AppCenterOverlay.tsx',
      'components/Dock.tsx',
      'components/WindowControls.tsx',
      'components/WindowManager.tsx',
      'lib/utils.ts',
      'utils',
      'types/config.ts',
      'types/dnd.ts'
    ],
  },
  {
    name: '@org/desktop-features',
    path: 'packages/desktop-features',
    files: [
      'features',
      'pages',
      'routes'
    ],
  },
  {
    name: '@org/desktop-hooks',
    path: 'packages/desktop-hooks',
    files: [
      'hooks'
    ],
  },
  {
    name: '@org/desktop-services',
    path: 'packages/desktop-services',
    files: [
      'services'
    ],
  },
  {
    name: '@org/desktop-store',
    path: 'packages/desktop-store',
    files: [
      'store',
      'types/settings.ts',
      'types/setup.ts'
    ],
  }
];

// 创建新包目录
splitPackages.forEach(pkg => {
  const fullPath = path.join(process.cwd(), pkg.path);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ 创建包目录: ${pkg.path}`);
  }

  // 复制文件
  pkg.files.forEach(fileOrDir => {
    const src = path.join(desktopAppPath, 'src', fileOrDir);
    const dst = path.join(fullPath, 'src', fileOrDir);

    if (fs.existsSync(src)) {
      if (fs.statSync(src).isDirectory()) {
        // 复制目录
        copyDirectory(src, dst);
      } else {
        // 复制文件
        ensureDirectoryExists(path.dirname(dst));
        fs.copyFileSync(src, dst);
      }
      console.log(`  📁 复制: ${fileOrDir}`);
    } else {
      console.log(`  ⚠️  不存在: ${fileOrDir}`);
    }
  });

  // 创建package.json
  createPackageJson(pkg);
});

// 复制主入口文件
fs.copyFileSync(
  path.join(desktopAppPath, 'src/main.tsx'),
  path.join(desktopAppPath, 'src/main.tsx.bak')
);
fs.copyFileSync(
  path.join(desktopAppPath, 'src/App.tsx'),
  path.join(desktopAppPath, 'src/App.tsx.bak')
);

console.log('\n✨ 拆分完成！');
console.log('\n📋 接下来需要手动完成的任务：');
console.log('  1. 更新各包的package.json依赖');
console.log('  2. 调整文件导入路径');
console.log('  3. 更新turbo.json配置');
console.log('  4. 创建前端项目模板');

/**
 * 复制目录
 */
function copyDirectory(src, dst) {
  if (!fs.existsSync(dst)) {
    fs.mkdirSync(dst, { recursive: true });
  }

  const items = fs.readdirSync(src);
  items.forEach(item => {
    const srcItem = path.join(src, item);
    const dstItem = path.join(dst, item);

    if (fs.statSync(srcItem).isDirectory()) {
      copyDirectory(srcItem, dstItem);
    } else {
      ensureDirectoryExists(path.dirname(dstItem));
      fs.copyFileSync(srcItem, dstItem);
    }
  });
}

/**
 * 确保目录存在
 */
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * 创建package.json
 */
function createPackageJson(pkg) {
  const packageJson = {
    "name": pkg.name,
    "version": "0.1.0",
    "description": "",
    "type": "module",
    "main": "./dist/index.js",
    "module": "./dist/index.js",
    "types": "./dist/index.d.ts",
    "files": [
      "dist",
      "src"
    ],
    "scripts": {
      "build": "tsc -p tsconfig.json",
      "dev": "tsc -w",
      "lint": "biome check ./src",
      "lint:fix": "biome check --write ./src",
      "format": "biome format ./src",
      "format:fix": "biome format --write ./src",
      "test": "vitest run",
      "test:watch": "vitest",
      "coverage": "vitest run --coverage"
    },
    "devDependencies": {
      "typescript": "^5.9.2",
      "vitest": "^3.2.4",
      "@vitest/coverage-v8": "^3.2.4",
      "biome": "^2.3.2"
    },
    "peerDependencies": {
      "react": ">=18.0.0",
      "react-dom": ">=18.0.0"
    }
  };

  const packageJsonPath = path.join(process.cwd(), pkg.path, 'package.json');
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

  // 创建tsconfig.json
  const tsconfig = {
    "compilerOptions": {
      "target": "ES2020",
      "useDefineForClassFields": true,
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "module": "ESNext",
      "skipLibCheck": true,
      "moduleResolution": "bundler",
      "allowImportingTsExtensions": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": false,
      "jsx": "react-jsx",
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noFallthroughCasesInSwitch": true,
      "declaration": true,
      "outDir": "./dist"
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist"]
  };

  const tsconfigPath = path.join(process.cwd(), pkg.path, 'tsconfig.json');
  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n');

  // 创建src/index.ts
  const indexPath = path.join(process.cwd(), pkg.path, 'src', 'index.ts');
  fs.writeFileSync(indexPath, '// Re-exports\n');

  console.log(`  📦 创建配置文件: ${pkg.path}/package.json`);
}
