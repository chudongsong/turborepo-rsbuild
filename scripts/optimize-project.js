#!/usr/bin/env node

/**
 * 项目优化脚本
 * 1. 重命名目录
 * 2. 更新package.json的name字段
 * 3. 更新依赖引用
 */

const fs = require('fs');
const path = require('path');

// 命名映射表
const renameMap = {
  // apps
  'apps/btpanel': 'apps/web-panel-vue',
  'apps/react-btpanel': 'apps/web-panel-react',
  'apps/desktop': 'apps/desktop-app',
  'apps/api': 'apps/api-service',

  // packages
  'packages/ui': 'packages/ui',
  'packages/utils': 'packages/utils',
  'packages/linglongos-utils': 'packages/utils', // 将合并到utils
  'packages/shared-types': 'packages/shared-types'
};

// 包名映射
const packageNameMap = {
  '@rsbuild/btpanel': '@org/web-panel-vue',
  '@turbo/react-btpanel': '@org/web-panel-react',
  '@linglongos/desktop': '@org/desktop-app',
  '@linglongos/api': '@org/api-service',
  '@turbo/ui': '@org/ui',
  '@panel/utils': '@org/utils',
  '@linglongos/utils': '@org/utils',
  '@linglongos/shared-types': '@org/shared-types'
};

console.log('🚀 开始项目优化...\n');

// 步骤1: 重命名目录
console.log('📁 步骤1: 重命名目录');
for (const [oldPath, newPath] of Object.entries(renameMap)) {
  const fullOldPath = path.join(process.cwd(), oldPath);
  const fullNewPath = path.join(process.cwd(), newPath);

  if (fs.existsSync(fullOldPath)) {
    // 处理合并情况：linglongos-utils 合并到 utils
    if (oldPath === 'packages/linglongos-utils') {
      console.log(`  ➡️  ${oldPath} -> ${newPath} (将合并内容)`);
      continue; // 延迟处理
    }

    if (fs.existsSync(fullNewPath)) {
      console.log(`  ⚠️  ${newPath} 已存在，跳过`);
      continue;
    }

    fs.renameSync(fullOldPath, fullNewPath);
    console.log(`  ✅ ${oldPath} -> ${newPath}`);
  } else {
    console.log(`  ⚠️  ${oldPath} 不存在，跳过`);
  }
}

console.log('\n📦 步骤2: 更新package.json name字段');

// 步骤2: 更新所有package.json的name字段
const allPackages = [
  'apps/web-panel-vue',
  'apps/web-panel-react',
  'apps/desktop-app',
  'apps/api-service',
  'packages/ui',
  'packages/utils',
  'packages/shared-types'
];

for (const pkgPath of allPackages) {
  const packageJsonPath = path.join(process.cwd(), pkgPath, 'package.json');

  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    for (const [oldName, newName] of Object.entries(packageNameMap)) {
      if (packageJson.name === oldName) {
        packageJson.name = newName;
        console.log(`  ✅ ${pkgPath}/package.json: ${oldName} -> ${newName}`);
      }
    }

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  }
}

console.log('\n✨ 项目优化完成！');
console.log('\n📋 接下来需要手动完成的任务：');
console.log('  1. 合并 linglongos-utils 和 utils 包的源代码');
console.log('  2. 更新所有导入语句中的包名');
console.log('  3. 拆分 desktop-app 为多个独立包');
console.log('  4. 创建前端项目模板');
