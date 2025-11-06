# 插件系统快速入门指南

## 🚀 快速开始

### 环境要求

- Node.js >= 20.18.1
- pnpm >= 8.15.6
- SQLite3

### 第一步：数据库迁移

```bash
cd apps/api-service

# 执行插件系统数据库迁移
node scripts/run-plugin-migration.js
```

**预期输出**：
```
🚀 开始执行插件系统数据库迁移...
📁 连接到数据库: /path/to/storage.db
⚡ 执行迁移脚本...
✅ 插件系统数据库迁移完成！
📊 验证数据库表结构:
  ✅ plugin_instances - 创建成功
  ✅ plugin_events - 创建成功
  ✅ plugin_permissions - 创建成功
  ✅ plugin_hosts - 创建成功

📋 检查 plugins 表的新字段:
  ✅ runtime - 字段存在
  ✅ permissions - 字段存在
  ✅ entry_point - 字段存在
  ✅ backend_type - 字段存在
  ...

🎉 迁移脚本执行完成！
```

### 第二步：启动 API 服务

```bash
# 开发模式
cd apps/api-service
npm run dev

# 或生产模式
npm run build
npm start
```

API 服务将在 `http://localhost:4000` 启动。

### 第三步：启动插件主机

```bash
cd apps/plugin-host

# 安装依赖
npm install
# 或使用 pnpm
pnpm install

# 构建 TypeScript
npm run build
# 或使用 pnpm
pnpm build

# 启动核心主机
node dist/index.js
```

插件主机将在 `http://localhost:4001` 启动。

### 第四步：验证安装

检查插件主机状态：
```bash
curl http://localhost:4001/health
```

检查 API 主机状态：
```bash
curl http://localhost:4000/api/v1/plugin-hosts/status
```

---

## 📦 第一个插件：计算器

### 1. 创建插件目录

```bash
mkdir -p examples/calculator/{frontend,backend}
cd examples/calculator
```

### 2. 创建 manifest.json

```json
{
  "id": "com.example.calculator",
  "name": "计算器",
  "version": "1.0.0",
  "description": "简单的计算器插件",
  "author": "Your Name",
  "license": "MIT",
  "runtime": "sandboxed",
  "type": "app",
  "permissions": [],
  "frontend": {
    "entry": "frontend/dist/index.html",
    "iframe": {
      "sandbox": ["allow-scripts"],
      "width": 300,
      "height": 400
    }
  },
  "backend": {
    "type": "none"
  }
}
```

### 3. 创建前端代码

```html
<!-- frontend/index.html -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>计算器</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: monospace; }
    .calculator {
      width: 280px;
      margin: 20px;
      background: #f0f0f0;
      border-radius: 8px;
      padding: 10px;
    }
    .display {
      width: 100%;
      height: 50px;
      background: white;
      border: none;
      text-align: right;
      font-size: 24px;
      padding: 0 10px;
      margin-bottom: 10px;
      border-radius: 4px;
    }
    .keys {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }
    button {
      padding: 15px;
      font-size: 18px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background: #4CAF50;
      color: white;
    }
    button.operator { background: #f44336; }
  </style>
</head>
<body>
  <div class="calculator">
    <input type="text" id="display" class="display" value="0" readonly>
    <div class="keys" id="keys"></div>
  </div>

  <script>
    // 监听来自宿主的消息
    window.addEventListener('message', (event) => {
      if (event.data.type === 'PLUGIN_API_INJECT') {
        console.log('收到 API 注入:', event.data.api);
        // 存储 API 供后续使用
        window.pluginAPI = event.data.api;
      }
    });

    // 向父窗口发送初始化完成消息
    window.parent.postMessage({
      type: 'PLUGIN_INIT'
    }, '*');

    // 计算器逻辑
    let display = document.getElementById('display');
    let keys = document.getElementById('keys');
    let currentInput = '0';
    let operator = null;
    let previousInput = null;

    const buttons = [
      'C', '±', '%', '÷',
      '7', '8', '9', '×',
      '4', '5', '6', '-',
      '1', '2', '3', '+',
      '0', '.', '='
    ];

    buttons.forEach(btn => {
      const button = document.createElement('button');
      button.textContent = btn;
      button.className = btn.match(/[+\-×÷=]/)? 'operator' : '';
      button.onclick = () => handleInput(btn);
      keys.appendChild(button);
    });

    function handleInput(value) {
      if (value.match(/[0-9.]/)) {
        if (currentInput === '0' || currentInput === null) {
          currentInput = value;
        } else {
          currentInput += value;
        }
      } else if (value === 'C') {
        currentInput = '0';
        operator = null;
        previousInput = null;
      } else if (value.match(/[+\-×÷]/)) {
        if (previousInput !== null) {
          calculate();
        }
        operator = value;
        previousInput = currentInput;
        currentInput = null;
      } else if (value === '=') {
        calculate();
        operator = null;
        previousInput = null;
      }

      display.value = currentInput;
    }

    function calculate() {
      if (previousInput !== null && currentInput !== null && operator !== null) {
        const prev = parseFloat(previousInput);
        const curr = parseFloat(currentInput);

        switch (operator) {
          case '+': currentInput = String(prev + curr); break;
          case '-': currentInput = String(prev - curr); break;
          case '×': currentInput = String(prev * curr); break;
          case '÷': currentInput = curr !== 0 ? String(prev / curr) : 'Error'; break;
        }
      }
    }
  </script>
</body>
</html>
```

### 4. 创建插件包

```bash
# 创建压缩包
zip -r calculator-v1.0.0.zip manifest.json frontend/
```

### 5. 上传插件

使用 API 上传插件：
```bash
curl -X POST http://localhost:4000/api/v1/create_plugin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "calculator",
    "description": "简单的计算器插件",
    "author": "Your Name",
    "runtime": "sandboxed",
    "category": "utilities"
  }'
```

响应示例：
```json
{
  "code": 0,
  "message": "Plugin created successfully",
  "data": {
    "id": 1
  }
}
```

### 6. 创建版本

```bash
curl -X POST http://localhost:4000/api/v1/create_plugin_version \
  -H "Content-Type: application/json" \
  -d '{
    "plugin_id": 1,
    "version": "1.0.0",
    "manifest": "{\"id\":\"com.example.calculator\",\"name\":\"计算器\",\"version\":\"1.0.0\",\"runtime\":\"sandboxed\",\"type\":\"app\",\"permissions\":[],\"frontend\":{\"entry\":\"frontend/dist/index.html\"}}",
    "package_url": "/path/to/calculator-v1.0.0.zip",
    "is_latest": true
  }'
```

### 7. 安装插件

```bash
curl -X POST http://localhost:4000/api/v1/plugins/1/install \
  -H "Content-Type: application/json" \
  -d '{
    "versionId": 1
  }'
```

### 8. 启用插件

```bash
curl -X POST http://localhost:4000/api/v1/plugins/1/enable
```

### 9. 查看状态

```bash
curl http://localhost:4000/api/v1/get_plugin_detail?id=1
```

---

## 🔧 核心插件开发

### 创建文件管理器插件

```bash
mkdir -p examples/file-manager/{frontend/src,backend}
cd examples/file-manager
```

### manifest.json

```json
{
  "id": "com.linglong.file-manager",
  "name": "文件管理器",
  "version": "1.0.0",
  "description": "核心文件管理插件",
  "author": "LinglongOS Team",
  "license": "MIT",
  "runtime": "integrated",
  "type": "app",
  "permissions": [
    "fs:read",
    "fs:write",
    "window:create"
  ],
  "frontend": {
    "entry": "./frontend/dist/remoteEntry.js",
    "framework": "react",
    "moduleFederation": {
      "name": "fileManager",
      "filename": "remoteEntry.js",
      "exposes": {
        "./App": "./src/App.tsx"
      },
      "shared": {
        "react": { "singleton": true },
        "react-dom": { "singleton": true }
      }
    }
  },
  "backend": {
    "type": "shared-host",
    "entry": "./backend/index.js"
  }
}
```

### 前端代码 (React)

```typescript
// frontend/src/App.tsx
import React, { useState, useEffect } from 'react'

interface FileItem {
  name: string
  type: 'file' | 'directory'
  size?: number
  modified: number
}

const FileManager: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([])
  const [currentPath, setCurrentPath] = useState('/')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  // 获取文件列表
  const loadFiles = async (path: string) => {
    try {
      // 使用 SDK 的 RPC 调用
      const result = await window.linglong.rpc.call('listFiles', { path })
      setFiles(result.files || [])
    } catch (error) {
      console.error('加载文件失败:', error)
    }
  }

  useEffect(() => {
    loadFiles(currentPath)
  }, [currentPath])

  // 创建新文件夹
  const createFolder = async () => {
    const folderName = prompt('请输入文件夹名称')
    if (folderName) {
      await window.linglong.rpc.call('createFolder', {
        path: `${currentPath}${folderName}`
      })
      loadFiles(currentPath)
    }
  }

  // 删除文件
  const deleteFile = async (fileName: string) => {
    if (confirm(`确定要删除 ${fileName} 吗？`)) {
      await window.linglong.rpc.call('deleteFile', {
        path: `${currentPath}${fileName}`
      })
      loadFiles(currentPath)
    }
  }

  return (
    <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 工具栏 */}
      <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
        <button onClick={createFolder}>新建文件夹</button>
        <span>当前路径: {currentPath}</span>
      </div>

      {/* 文件列表 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {files.map((file) => (
          <div
            key={file.name}
            style={{
              padding: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              background: selectedFile === file.name ? '#e3f2fd' : 'transparent'
            }}
            onClick={() => setSelectedFile(file.name)}
          >
            <span style={{ marginRight: '10px', fontSize: '20px' }}>
              {file.type === 'directory' ? '📁' : '📄'}
            </span>
            <div style={{ flex: 1 }}>
              <div>{file.name}</div>
              {file.size && (
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {formatSize(file.size)}
                </div>
              )}
            </div>
            {file.type === 'file' && (
              <button onClick={() => deleteFile(file.name)}>删除</button>
            )}
          </div>
        ))}
      </div>

      {/* 操作栏 */}
      {selectedFile && (
        <div style={{ marginTop: '10px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
          已选择: {selectedFile}
        </div>
      )}
    </div>
  )
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default FileManager
```

### 后端代码

```javascript
// backend/index.js
class FileManagerPlugin {
  constructor() {
    this.files = new Map()
    this.files.set('/', [
      { name: 'Documents', type: 'directory', modified: Date.now() },
      { name: 'Pictures', type: 'directory', modified: Date.now() },
      { name: 'readme.txt', type: 'file', size: 1024, modified: Date.now() }
    ])
  }

  // 列出文件
  async listFiles({ path }) {
    console.log('列出文件:', path)
    const files = this.files.get(path) || []
    return {
      files: files,
      path: path
    }
  }

  // 创建文件夹
  async createFolder({ path }) {
    console.log('创建文件夹:', path)
    const dirName = path.split('/').pop()
    const parentPath = path.substring(0, path.lastIndexOf('/') + 1) || '/'

    const files = this.files.get(parentPath) || []
    files.push({
      name: dirName,
      type: 'directory',
      modified: Date.now()
    })
    this.files.set(parentPath, files)
    this.files.set(path, [])

    return { success: true, path }
  }

  // 删除文件
  async deleteFile({ path }) {
    console.log('删除文件:', path)
    const fileName = path.split('/').pop()
    const parentPath = path.substring(0, path.lastIndexOf('/') + 1) || '/'

    const files = this.files.get(parentPath) || []
    const index = files.findIndex(f => f.name === fileName)
    if (index !== -1) {
      files.splice(index, 1)
      this.files.set(parentPath, files)
      return { success: true }
    }

    throw new Error('文件不存在')
  }
}

module.exports = FileManagerPlugin
```

---

## 🔍 API 测试示例

### 使用 curl 测试

```bash
# 1. 获取插件列表
curl http://localhost:4000/api/v1/get_plugins

# 2. 获取插件详情
curl http://localhost:4000/api/v1/get_plugin_detail?id=1

# 3. 获取插件版本
curl http://localhost:4000/api/v1/get_plugin_versions?pluginId=1

# 4. 获取插件权限
curl http://localhost:4000/api/v1/plugins/1/permissions

# 5. 获取插件实例
curl http://localhost:4000/api/v1/plugins/1/instances

# 6. 获取主机状态
curl http://localhost:4000/api/v1/plugin-hosts/status

# 7. 启动主机
curl -X POST http://localhost:4000/api/v1/plugin-hosts/core-host/start

# 8. 停止主机
curl -X POST http://localhost:4000/api/v1/plugin-hosts/core-host/stop

# 9. 重启主机
curl -X POST http://localhost:4000/api/v1/plugin-hosts/core-host/restart
```

### 使用 JavaScript 测试

```javascript
// test-plugin-api.js
const axios = require('axios')

const API_BASE = 'http://localhost:4000'

async function testPluginAPI() {
  try {
    // 获取插件列表
    const plugins = await axios.get(`${API_BASE}/api/v1/get_plugins`)
    console.log('插件列表:', plugins.data)

    if (plugins.data.data.length > 0) {
      const pluginId = plugins.data.data[0].id

      // 获取插件详情
      const detail = await axios.get(`${API_BASE}/api/v1/get_plugin_detail`, {
        params: { id: pluginId }
      })
      console.log('插件详情:', detail.data)

      // 获取权限
      const permissions = await axios.get(`${API_BASE}/api/v1/plugins/${pluginId}/permissions`)
      console.log('插件权限:', permissions.data)
    }

    // 获取主机状态
    const hosts = await axios.get(`${API_BASE}/api/v1/plugin-hosts/status`)
    console.log('主机状态:', hosts.data)
  } catch (error) {
    console.error('API 测试失败:', error.message)
  }
}

testPluginAPI()
```

---

## 🎯 下一步

- 阅读 [完整文档](README.md) 了解详细功能
- 查看 [API 参考](API.md) 获取完整 API 列表
- 学习 [最佳实践](BEST_PRACTICES.md) 编写高质量插件
- 参考 [示例插件](EXAMPLES.md) 获取更多示例
