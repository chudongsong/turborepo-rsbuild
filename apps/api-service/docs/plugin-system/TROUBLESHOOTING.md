# 故障排除指南

## 🚨 常见问题与解决方案

### 1. 数据库相关

#### 问题 1: 迁移脚本执行失败

**错误信息**：
```
❌ 迁移文件不存在: /path/to/001_add_plugin_system.sql
```

**解决方案**：
```bash
# 1. 检查文件是否存在
ls apps/api-service/data/migrations/001_add_plugin_system.sql

# 2. 如果文件不存在，从代码库重新获取
git checkout apps/api-service/data/migrations/001_add_plugin_system.sql

# 3. 重新执行迁移
node scripts/run-plugin-migration.js
```

**错误信息**：
```
Error: SQLITE_BUSY: database is locked
```

**解决方案**：
```bash
# 1. 确保没有其他进程占用数据库
lsof apps/api-service/data/storage.db

# 2. 停止 API 服务
npm run stop

# 3. 删除 WAL 文件（如果存在）
rm apps/api-service/data/storage.db-wal
rm apps/api-service/data/storage.db-shm

# 4. 重启 API 服务
npm run dev
```

#### 问题 2: 表结构不匹配

**错误信息**：
```
Error: no such column: runtime
```

**解决方案**：
```bash
# 1. 检查表结构
sqlite3 apps/api-service/data/storage.db
.schema plugins

# 2. 手动执行迁移
sqlite3 apps/api-service/data/storage.db < apps/api-service/data/migrations/001_add_plugin_system.sql

# 3. 验证表结构
.schema
```

### 2. 插件主机相关

#### 问题 3: 插件主机启动失败

**错误信息**：
```
Error: listen EADDRINUSE: address already in use :::4001
```

**解决方案**：
```bash
# 1. 检查端口占用
lsof -i :4001

# 2. 杀死占用进程
kill -9 <PID>

# 3. 或使用其他端口启动
HOST_PORT=4002 node dist/index.js
```

**错误信息**：
```
Error: Cannot find module '@linglongos/sdk'
```

**解决方案**：
```bash
# 1. 安装 SDK 依赖
cd apps/plugin-host
npm install @linglongos/sdk

# 2. 或使用相对路径引用
// 修改 index.ts 中的导入路径
// import { PluginLoader } from '../../../packages/sdk/src/index.js'
```

#### 问题 4: 主机心跳检测失败

**错误信息**：
```
健康状态: timeout
```

**解决方案**：
```bash
# 1. 检查主机进程是否存活
ps aux | grep plugin-host

# 2. 手动重启主机
curl -X POST http://localhost:4000/api/v1/plugin-hosts/core-host/restart

# 3. 检查主机日志
tail -f logs/plugin-host.log
```

### 3. 插件加载相关

#### 问题 5: 插件加载失败

**错误信息**：
```
❌ 插件 calculator 加载失败: Plugin not found
```

**调试步骤**：
```bash
# 1. 检查插件是否存在
curl http://localhost:4000/api/v1/get_plugin_detail?id=1

# 2. 检查插件状态
curl http://localhost:4000/api/v1/get_plugins

# 3. 检查插件权限
curl http://localhost:4000/api/v1/plugins/1/permissions
```

**解决方案**：
```bash
# 1. 重新安装插件
curl -X POST http://localhost:4000/api/v1/plugins/1/install \
  -H "Content-Type: application/json" \
  -d '{"versionId": 1}'

# 2. 检查 manifest.json 格式
cat plugin-package/manifest.json | jq .

# 3. 检查权限设置
# 确保插件有必要的权限
```

#### 问题 6: Module Federation 加载失败

**错误信息**：
```
Failed to load remote module: http://localhost:4001/remotes/calculator/App
```

**解决方案**：
```javascript
// 1. 检查 Webpack 配置
// webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: "calculator",
      filename: "remoteEntry.js",
      exposes: {
        "./App": "./src/App.tsx",
      },
      // 确保共享依赖正确配置
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
      },
    }),
  ],
}

// 2. 检查远程入口文件是否存在
curl http://localhost:4001/remotes/calculator/remoteEntry.js
```

#### 问题 7: iFrame 沙箱加载失败

**错误信息**：
```
Refused to load the script '...' because it violates the following Content Security Policy directive
```

**解决方案**：
```html
<!-- 1. 在 index.html 中设置正确的 CSP -->
<meta http-equiv="Content-Security-Policy"
      content="script-src 'self' 'unsafe-inline' https://cdn.example.com">

<!-- 2. 确保 iFrame 有正确的 sandbox 属性 -->
<iframe sandbox="allow-scripts allow-same-origin">

<!-- 3. 检查跨域设置 -->
<meta http-equiv="Access-Control-Allow-Origin" content="*">
```

### 4. API 调用相关

#### 问题 8: RPC 调用失败

**错误信息**：
```
Error: Permission denied for API call: myMethod
```

**解决方案**：
```javascript
// 1. 检查插件权限
const permissions = await getPluginPermissions(pluginId)
console.log('插件权限:', permissions)

// 2. 添加权限
await setPluginPermission(pluginId, {
  permissionName: 'api:call',
  permissionType: 'allow'
})

// 3. 重新启用插件
await enablePlugin(pluginId)
```

**错误信息**：
```
Error: Plugin is not enabled
```

**解决方案**：
```bash
# 1. 检查插件状态
curl http://localhost:4000/api/v1/get_plugin_detail?id=1

# 2. 启用插件
curl -X POST http://localhost:4000/api/v1/plugins/1/enable

# 3. 检查实例状态
curl http://localhost:4000/api/v1/plugins/1/instances
```

#### 问题 9: 插件间通信失败

**错误信息**：
```
Error: Source plugin does not have inter-plugin communication permission
```

**解决方案**：
```javascript
// 1. 为源插件添加通信权限
await setPluginPermission(fromPluginId, {
  permissionName: 'plugin:interact',
  permissionType: 'allow'
})

// 2. 确保目标插件已启用
await enablePlugin(toPluginId)

// 3. 检查插件 API
const apis = await getPluginAPIs(toPluginId)
console.log('目标插件 API:', apis)
```

### 5. 权限相关

#### 问题 10: 权限被拒绝

**错误信息**：
```
Error: Permission denied for resource: /etc/passwd
```

**解决方案**：
```json
// 1. 在 manifest.json 中申请正确权限
{
  "permissions": [
    "fs:read",
    "fs:write",
    "network:http"
  ]
}

// 2. 使用资源模式限制访问范围
{
  "permission_name": "fs:read",
  "resource_pattern": "/data/*",
  "conditions": {
    "readonly": true
  }
}

// 3. 检查权限设置
GET /api/v1/plugins/:id/permissions
```

#### 问题 11: 权限管理混乱

**解决方案**：
```javascript
// 1. 重置插件权限
await removeAllPermissions(pluginId)
await setupDefaultPermissions(pluginId, runtime)

// 2. 查看所有权限
const permissions = await getPluginPermissions(pluginId)
permissions.forEach(p => {
  console.log(`${p.permission_name}: ${p.permission_type}`)
})

// 3. 清理无效权限
for (const perm of permissions) {
  if (!isValidPermission(perm.permission_name)) {
    await removePermission(pluginId, perm.permission_name)
  }
}
```

### 6. 性能相关

#### 问题 12: 插件主机内存泄漏

**现象**：
- 主机内存持续增长
- 响应速度变慢
- 系统卡顿

**解决方案**：
```javascript
// 1. 定期重启主机
setInterval(async () => {
  await restartHost('core-host')
}, 3600000) // 每小时重启一次

// 2. 监控内存使用
const memUsage = process.memoryUsage()
console.log('内存使用:', {
  rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
  heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB'
})

// 3. 清理无用插件
const loadedPlugins = await getLoadedPlugins()
for (const pluginName of loadedPlugins) {
  if (!isPluginInUse(pluginName)) {
    await unloadPlugin(pluginName)
  }
}
```

#### 问题 13: API 响应慢

**解决方案**：
```javascript
// 1. 使用缓存
const cache = new Map()
const result = cache.get(key) || await loadData(key)
cache.set(key, result)

// 2. 批量操作
const results = await Promise.all(
  requests.map(req => callAPI(req))
)

// 3. 分页加载
const plugins = await getPlugins({
  limit: 20,
  offset: page * 20
})
```

### 7. 开发相关

#### 问题 14: TypeScript 类型错误

**错误信息**：
```
TS2307: Cannot find module '@linglongos/sdk' or its corresponding type declarations.
```

**解决方案**：
```bash
# 1. 安装 SDK 类型
npm install @types/node

# 2. 在 tsconfig.json 中配置
{
  "compilerOptions": {
    "paths": {
      "@linglongos/sdk": ["../packages/sdk/src"]
    }
  }
}

# 3. 重新编译
npm run build
```

#### 问题 15: 热重载不工作

**解决方案**：
```javascript
// 1. 启用监听模式
npm run dev

// 2. 配置 watch 选项
// webpack.config.js
module.exports = {
  watchOptions: {
    ignored: /node_modules/,
    poll: 1000
  }
}

// 3. 清理缓存
rm -rf dist
rm -rf .cache
npm run build
```

## 🔍 调试技巧

### 1. 启用详细日志

```javascript
// 在插件中启用调试模式
const DEBUG = process.env.NODE_ENV === 'development'

function debug(...args) {
  if (DEBUG) {
    console.log('[Plugin Debug]', ...args)
  }
}

// 使用调试函数
debug('插件已激活', pluginName)
```

### 2. 查看事件日志

```sql
-- 查看插件事件
SELECT
  pe.*,
  p.name as plugin_name
FROM plugin_events pe
LEFT JOIN plugins p ON pe.plugin_id = p.id
WHERE pe.plugin_id = 1
ORDER BY pe.created_at DESC
LIMIT 50;

-- 查看错误事件
SELECT * FROM plugin_events
WHERE event_type = 'error'
  AND created_at > strftime('%s', 'now') * 1000 - 3600000
ORDER BY created_at DESC;
```

### 3. 网络调试

```bash
# 监控 API 请求
curl -v http://localhost:4000/api/v1/plugins/1/status

# 监控插件主机请求
curl -v http://localhost:4001/health

# 检查插件加载
curl -v http://localhost:4001/plugins
```

### 4. 性能分析

```javascript
// 插件加载性能测试
console.time('loadPlugin')
await loadPlugin('my-plugin')
console.timeEnd('loadPlugin') // 输出: loadPlugin: 123.45ms

// 内存使用分析
const used = process.memoryUsage()
console.log('内存使用:')
for (let key in used) {
  console.log(`${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`)
}
```

## 📋 检查清单

### 安装前检查

- [ ] Node.js 版本 >= 20.18.1
- [ ] 数据库文件存在且可写
- [ ] 端口 4000、4001 未被占用
- [ ] 权限设置正确

### 开发前检查

- [ ] 插件 manifest.json 格式正确
- [ ] 权限配置合理
- [ ] TypeScript 编译通过
- [ ] 测试用例通过

### 部署前检查

- [ ] 数据库迁移完成
- [ ] 插件主机启动成功
- [ ] API 服务运行正常
- [ ] 监控配置完成

### 运行中检查

- [ ] 主机心跳正常
- [ ] 插件状态正确
- [ ] 内存使用正常
- [ ] 错误日志无异常

## 🆘 紧急处理

### 插件崩溃

```bash
# 1. 查看崩溃日志
tail -f logs/plugin-host.log

# 2. 重启插件主机
curl -X POST http://localhost:4000/api/v1/plugin-hosts/core-host/restart

# 3. 禁用问题插件
curl -X POST http://localhost:4000/api/v1/plugins/:id/disable

# 4. 查看事件日志
sqlite3 data/storage.db "SELECT * FROM plugin_events WHERE event_type = 'error' ORDER BY created_at DESC LIMIT 10;"
```

### 数据库损坏

```bash
# 1. 备份数据库
cp data/storage.db data/storage.db.backup

# 2. 检查数据库完整性
sqlite3 data/storage.db "PRAGMA integrity_check;"

# 3. 重建数据库
rm data/storage.db
node scripts/run-plugin-migration.js

# 4. 恢复数据（如果有备份）
sqlite3 data/storage.db < backup.sql
```

### 主机宕机

```bash
# 1. 检查进程状态
ps aux | grep plugin-host

# 2. 手动启动主机
node apps/plugin-host/dist/index.js &

# 3. 验证启动
curl http://localhost:4001/health

# 4. 重启所有插件
for id in {1..10}; do
  curl -X POST http://localhost:4000/api/v1/plugins/$id/enable
done
```

## 📞 获取帮助

### 日志文件位置

- API 服务日志: `apps/api-service/logs/`
- 插件主机日志: `apps/plugin-host/logs/`
- 数据库日志: SQLite 日志

### 诊断信息收集

```bash
# 收集诊断信息
cat > diagnose.sh << 'EOF'
#!/bin/bash
echo "=== 系统信息 ==="
node --version
npm --version

echo -e "\n=== 端口占用 ==="
lsof -i :4000 || echo "端口 4000 未占用"
lsof -i :4001 || echo "端口 4001 未占用"

echo -e "\n=== 数据库状态 ==="
ls -lh apps/api-service/data/storage.db || echo "数据库文件不存在"

echo -e "\n=== 进程状态 ==="
ps aux | grep -E "(plugin-host|egg)" | grep -v grep || echo "无相关进程"

echo -e "\n=== 插件主机状态 ==="
curl -s http://localhost:4000/api/v1/plugin-hosts/status || echo "API 服务不可达"
EOF

chmod +x diagnose.sh
./diagnose.sh > diagnostics.txt
```

### 提交问题

提交 Issue 时请包含：
1. 详细的错误信息
2. 复现步骤
3. 系统环境信息
4. 诊断信息文件
5. 相关日志片段

### 社区支持

- 项目主页: https://github.com/linglongos/turborepo-rsbuild
- 问题反馈: https://github.com/linglongos/turborepo-rsbuild/issues
- 讨论区: https://github.com/linglongos/turborepo-rsbuild/discussions
- 邮件: support@linglongos.com
