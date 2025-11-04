#!/usr/bin/env node

/**
 * 自动更新导入语句脚本
 * 更新所有文件中的包名引用
 */

const fs = require('fs');
const path = require('path');

// 包名映射
const packageNameMap = {
  '@rsbuild/btpanel': '@org/web-panel-vue',
  '@turbo/react-btpanel': '@org/web-panel-react',
  '@linglongos/desktop': '@org/desktop-app',
  '@linglongos/api': '@org/api-service',
  '@turbo/ui': '@org/ui',
  '@panel/utils': '@org/utils',
  '@linglongos/utils': '@org/utils',
  '@linglongos/shared-types': '@org/shared-types',
};

// 文件扩展名白名单
const allowedExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.vue'];

/**
 * 递归遍历目录
 */
function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  const results = [];

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (file.startsWith('.') || file === 'node_modules' || file === 'dist' || file === 'build') {
        continue;
      }
      results.push(...traverseDir(fullPath));
    } else {
      const ext = path.extname(file);
      if (allowedExtensions.includes(ext)) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

/**
 * 更新文件中的导入语句
 */
function updateFileImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  let updated = false;
  let newContent = content;

  for (const [oldName, newName] of Object.entries(packageNameMap)) {
    // 匹配 import 语句
    const importRegex = new RegExp(`from\\s+['"`](${escapeRegex(oldName)}.*?)['"`]`, 'g');
    const requireRegex = new RegExp(`require\\(['"`](${escapeRegex(oldName)}.*?)['"']\\)`, 'g');

    if (importRegex.test(newContent)) {
      newContent = newContent.replace(importRegex, `from '${newName}$2'`);
      updated = true;
    }

    if (requireRegex.test(newContent)) {
      newContent = newContent.replace(requireRegex, `require('${newName}$1')`);
      updated = true;
    }
  }

  if (updated) {
    fs.writeFileSync(filePath, newContent);
    console.log(`✅ Updated: ${path.relative(process.cwd(), filePath)}`);
    return true;
  }

  return false;
}

/**
 * 转义正则特殊字符
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 主函数
 */
function main() {
  console.log('🔄 开始更新导入语句...\n');

  // 需要检查的目录
  const dirsToCheck = ['apps', 'packages'];

  let updatedCount = 0;
  let checkedCount = 0;

  for (const dir of dirsToCheck) {
    if (!fs.existsSync(dir)) {
      console.log(`⚠️  Directory ${dir} not found, skipping...`);
      continue;
    }

    console.log(`📂 Scanning ${dir}...`);
    const files = traverseDir(dir);

    for (const file of files) {
      checkedCount++;
      if (updateFileImports(file)) {
        updatedCount++;
      }
    }
    console.log(`  Found ${files.length} files\n`);
  }

  console.log('✨ 更新完成！');
  console.log(`📊 统计：`);');
  console.log(`   - 检查文件: ${checkedCount}`);
  console.log(`   - 更新文件: ${updatedCount}\n`);

  if (updatedCount > 0) {
    console.log('📌 提示：');
    console.log('   请检查更新的文件，确保所有导入语句正确');
    console.log('   如果发现问题，可以使用 git diff 查看更改\n');
  }
}

main();
