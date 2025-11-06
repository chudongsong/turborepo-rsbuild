# API 参考文档

## 📡 插件生命周期管理 API

### 安装插件

```http
POST /api/v1/plugins/:id/install
```

**参数**：
```json
{
  "versionId": 1,        // 版本 ID（必需）
  "config": {            // 安装配置（可选）
    "theme": "dark"
  }
}
```

**响应**：
```json
{
  "code": 0,
  "message": "Plugin installed successfully",
  "data": {
    "instanceId": 1
  }
}
```

### 启用插件

```http
POST /api/v1/plugins/:id/enable
```

**参数**：无

**响应**：
```json
{
  "code": 0,
  "message": "Plugin enabled successfully",
  "data": null
}
```

### 禁用插件

```http
POST /api/v1/plugins/:id/disable
```

**参数**：无

**响应**：
```json
{
  "code": 0,
  "message": "Plugin disabled successfully",
  "data": null
}
```

### 卸载插件

```http
POST /api/v1/plugins/:id/uninstall
```

**参数**：无

**响应**：
```json
{
  "code": 0,
  "message": "Plugin uninstalled successfully",
  "data": null
}
```

---

## 🔧 插件实例管理 API

### 创建插件实例

```http
POST /api/v1/plugins/:id/instances
```

**参数**：
```json
{
  "versionId": 1,           // 版本 ID（必需）
  "instanceName": "default", // 实例名称（必需）
  "config": {               // 实例配置（可选）
    "window": {
      "width": 800,
      "height": 600
    }
  }
}
```

**响应**：
```json
{
  "code": 0,
  "message": "Plugin instance created successfully",
  "data": {
    "instanceId": 2
  }
}
```

### 获取插件实例列表

```http
GET /api/v1/plugins/:id/instances
```

**参数**：无

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "plugin_id": 1,
      "instance_name": "default",
      "status": "running",
      "created_at": 1634567890000
    }
  ]
}
```

### 获取插件实例详情

```http
GET /api/v1/instances/:id
```

**参数**：无

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "plugin_id": 1,
    "instance_name": "default",
    "config": {},
    "status": "running",
    "host_process_id": "1234",
    "created_at": 1634567890000
  }
}
```

### 更新插件实例

```http
PUT /api/v1/instances/:id
```

**参数**：
```json
{
  "config": {              // 实例配置
    "theme": "light"
  },
  "status": "stopped"      // 状态（可选）
}
```

**响应**：
```json
{
  "code": 0,
  "message": "Plugin instance updated successfully",
  "data": null
}
```

### 删除插件实例

```http
DELETE /api/v1/instances/:id
```

**参数**：无

**响应**：
```json
{
  "code": 0,
  "message": "Plugin instance deleted successfully",
  "data": null
}
```

### 启动插件实例

```http
POST /api/v1/instances/:id/start
```

**参数**：无

**响应**：
```json
{
  "code": 0,
  "message": "Plugin instance started successfully",
  "data": null
}
```

### 停止插件实例

```http
POST /api/v1/instances/:id/stop
```

**参数**：无

**响应**：
```json
{
  "code": 0,
  "message": "Plugin instance stopped successfully",
  "data": null
}
```

### 重启插件实例

```http
POST /api/v1/instances/:id/restart
```

**参数**：无

**响应**：
```json
{
  "code": 0,
  "message": "Plugin instance restarted successfully",
  "data": null
}
```

---

## 🔐 插件权限管理 API

### 获取插件权限列表

```http
GET /api/v1/plugins/:id/permissions
```

**参数**：无

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "plugin_id": 1,
      "permission_name": "fs:read",
      "permission_type": "allow",
      "created_at": 1634567890000
    }
  ]
}
```

### 设置插件权限

```http
POST /api/v1/plugins/:id/permissions
```

**参数**：
```json
{
  "permissionName": "fs:write",      // 权限名称（必需）
  "permissionType": "allow",         // 权限类型：allow/deny（可选，默认 allow）
  "resourcePattern": "/data/*",      // 资源模式（可选）
  "conditions": {                    // 权限条件（可选）
    "timeRange": "09:00-18:00"
  }
}
```

**响应**：
```json
{
  "code": 0,
  "message": "Permission set successfully",
  "data": null
}
```

### 撤销插件权限

```http
DELETE /api/v1/plugins/:id/permissions/:permName
```

**参数**：无

**响应**：
```json
{
  "code": 0,
  "message": "Permission revoked successfully",
  "data": null
}
```

---

## 🖥️ 插件主机管理 API

### 获取主机状态

```http
GET /api/v1/plugin-hosts/status
```

**参数**：无

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "hosts": [
      {
        "host_name": "core-host",
        "status": "running",
        "last_heartbeat": 1634567890000,
        "health_status": "healthy"
      }
    ],
    "total": 2,
    "healthy": 1,
    "timeout": 0,
    "no_heartbeat": 1
  }
}
```

### 获取主机列表

```http
GET /api/v1/plugin-hosts
```

**参数**：无

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "host_name": "core-host",
      "process_id": "1234",
      "status": "running",
      "config": "{\"port\":4001,\"max_memory\":\"512MB\"}",
      "loaded_plugins": "[]",
      "last_heartbeat": 1634567890000
    }
  ]
}
```

### 启动插件主机

```http
POST /api/v1/plugin-hosts/:hostName/start
```

**参数**：无

**响应**：
```json
{
  "code": 0,
  "message": "Plugin host started successfully",
  "data": null
}
```

### 停止插件主机

```http
POST /api/v1/plugin-hosts/:hostName/stop
```

**参数**：无

**响应**：
```json
{
  "code": 0,
  "message": "Plugin host stopped successfully",
  "data": null
}
```

### 重启插件主机

```http
POST /api/v1/plugin-hosts/:hostName/restart
```

**参数**：无

**响应**：
```json
{
  "code": 0,
  "message": "Plugin host restarted successfully",
  "data": null
}
```

---

## 📋 原始插件管理 API（兼容）

### 创建插件

```http
POST /api/v1/create_plugin
```

**参数**：
```json
{
  "name": "my-plugin",              // 插件名称（必需）
  "description": "我的插件",         // 描述（可选）
  "author": "开发者",               // 作者（可选）
  "repository_url": "",             // 仓库地址（可选）
  "homepage_url": "",               // 主页地址（可选）
  "keywords": "工具,实用",          // 关键词（可选）
  "license": "MIT",                 // 许可证（可选）
  "category": "utilities",          // 分类（可选）
  "is_official": false              // 是否官方插件（可选）
}
```

**响应**：
```json
{
  "code": 0,
  "message": "Plugin created successfully",
  "data": {
    "id": 1
  }
}
```

### 获取插件列表

```http
GET /api/v1/get_plugins?limit=20&offset=0&category=utilities
```

**查询参数**：
- `limit`: 限制数量（默认 20）
- `offset`: 偏移量（默认 0）
- `category`: 分类过滤
- `author`: 作者过滤
- `search`: 搜索关键词

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "calculator",
      "description": "计算器插件",
      "author": "开发者",
      "runtime": "sandboxed",
      "status": "enabled",
      "latest_version": "1.0.0",
      "download_count": 0
    }
  ]
}
```

### 获取插件详情

```http
GET /api/v1/get_plugin_detail?id=1
```

**查询参数**：
- `id`: 插件 ID

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "name": "calculator",
    "description": "计算器插件",
    "author": "开发者",
    "runtime": "sandboxed",
    "status": "enabled",
    "permissions": "[]",
    "versions": [
      {
        "id": 1,
        "version": "1.0.0",
        "is_latest": true,
        "published_at": 1634567890000
      }
    ]
  }
}
```

### 创建插件版本

```http
POST /api/v1/create_plugin_version
```

**参数**：
```json
{
  "plugin_id": 1,                   // 插件 ID（必需）
  "version": "1.0.0",               // 版本号（必需）
  "manifest": "{...}",              // manifest.json（必需）
  "package_url": "/path/to/package.zip", // 包 URL（必需）
  "package_size": 102400,           // 包大小（可选）
  "checksum": "abc123...",          // 校验和（可选）
  "is_latest": true,                // 是否最新版本（可选）
  "readme": "插件说明",             // 说明文档（可选）
  "changelog": "更新日志"           // 更新日志（可选）
}
```

**响应**：
```json
{
  "code": 0,
  "message": "Plugin version created successfully",
  "data": {
    "versionId": 1
  }
}
```

### 标记版本为最新

```http
POST /api/v1/mark_plugin_latest
```

**参数**：
```json
{
  "id": 1,              // 插件 ID
  "versionId": 1        // 版本 ID
}
```

**响应**：
```json
{
  "code": 0,
  "message": "Version marked as latest successfully",
  "data": null
}
```

### 获取插件分类

```http
GET /api/v1/get_plugin_categories
```

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "category": "utilities",
      "count": 5
    },
    {
      "category": "games",
      "count": 3
    }
  ]
}
```

---

## 🩺 错误代码说明

| 错误代码 | 描述 | 解决方案 |
|---------|------|---------|
| 400 | 请求参数错误 | 检查必填参数是否完整 |
| 401 | 未授权 | 需要先登录或获取 API Key |
| 403 | 权限不足 | 检查用户权限或插件权限 |
| 404 | 资源不存在 | 检查插件 ID 或实例 ID 是否正确 |
| 409 | 冲突 | 插件名已存在或版本已存在 |
| 500 | 服务器内部错误 | 检查服务器日志或联系管理员 |
| 10001 | Plugin not found | 插件不存在，请检查 ID |
| 10002 | Plugin version not found | 插件版本不存在 |
| 10003 | Plugin is not enabled | 插件未启用，请先启用 |
| 10004 | Plugin host is not running | 插件主机未运行 |
| 10005 | Permission denied | 权限不足，检查插件权限配置 |
| 10006 | Invalid runtime type | 无效的运行时类型 |
| 10007 | Instance not found | 实例不存在 |
| 10008 | Instance is already running | 实例已在运行 |
| 10009 | Instance is not running | 实例未运行 |

---

## 🔍 调试技巧

### 1. 查看详细日志

```javascript
// 开启详细日志
const response = await axios.post('/api/v1/plugins/1/enable', {}, {
  validateStatus: (status) => status < 500, // 接受 4xx 状态码
  headers: {
    'X-Debug': 'true' // 开启调试模式
  }
})

console.log('响应:', response.data)
```

### 2. 检查主机健康状态

```bash
# 检查核心主机
curl -v http://localhost:4001/health

# 检查 API 主机
curl -v http://localhost:4000/api/v1/plugin-hosts/status
```

### 3. 查看事件日志

```bash
# 查看插件事件（需要数据库查询）
# 可以直接查看 SQLite 数据库
sqlite3 data/storage.db
SELECT * FROM plugin_events WHERE plugin_id = 1 ORDER BY created_at DESC LIMIT 10;
```

### 4. 测试插件 API 调用

```javascript
// 创建测试脚本
const axios = require('axios')

async function testPluginCall() {
  try {
    // 调用插件 API
    const result = await axios.post('http://localhost:4000/api/v1/plugins/1/call', {
      method: 'testMethod',
      data: { test: true }
    })
    console.log('API 调用成功:', result.data)
  } catch (error) {
    console.error('API 调用失败:', error.response?.data || error.message)
  }
}

testPluginCall()
```

---

## 📊 性能监控

### 获取主机性能指标

```bash
curl http://localhost:4000/api/v1/plugin-hosts/status
```

性能指标包括：
- `memory`: 内存使用情况
- `loaded_plugins`: 已加载插件数量
- `last_heartbeat`: 最后心跳时间
- `health_status`: 健康状态

### 获取插件事件统计

```javascript
// 通过 API 获取事件统计
const events = await axios.get(`/api/v1/plugins/${pluginId}/events`)
console.log('事件统计:', events.data)
```

---

## 🔄 批量操作

### 批量启用插件

```javascript
const pluginIds = [1, 2, 3]

for (const id of pluginIds) {
  try {
    await axios.post(`http://localhost:4000/api/v1/plugins/${id}/enable`)
    console.log(`插件 ${id} 启用成功`)
  } catch (error) {
    console.error(`插件 ${id} 启用失败:`, error.message)
  }
}
```

### 批量重启主机

```javascript
const hosts = ['core-host', 'user-host']

for (const host of hosts) {
  try {
    await axios.post(`http://localhost:4000/api/v1/plugin-hosts/${host}/restart`)
    console.log(`主机 ${host} 重启成功`)
  } catch (error) {
    console.error(`主机 ${host} 重启失败:`, error.message)
  }
}
```

---

## 🧪 完整测试示例

```javascript
// test-plugin-system.js
const axios = require('axios')

class PluginSystemTester {
  constructor(baseURL = 'http://localhost:4000') {
    this.api = axios.create({ baseURL })
  }

  // 测试插件生命周期
  async testPluginLifecycle() {
    console.log('=== 测试插件生命周期 ===')

    // 1. 创建插件
    const plugin = await this.createPlugin()
    console.log('✅ 插件创建成功:', plugin.data.data.id)

    // 2. 创建版本
    const version = await this.createVersion(plugin.data.data.id)
    console.log('✅ 版本创建成功:', version.data.data.versionId)

    // 3. 安装插件
    const install = await this.installPlugin(plugin.data.data.id, version.data.data.versionId)
    console.log('✅ 插件安装成功:', install.data.data.instanceId)

    // 4. 启用插件
    await this.enablePlugin(plugin.data.data.id)
    console.log('✅ 插件启用成功')

    // 5. 检查状态
    const detail = await this.getPluginDetail(plugin.data.data.id)
    console.log('✅ 插件状态:', detail.data.data.status)

    // 6. 禁用插件
    await this.disablePlugin(plugin.data.data.id)
    console.log('✅ 插件禁用成功')

    // 7. 卸载插件
    await this.uninstallPlugin(plugin.data.data.id)
    console.log('✅ 插件卸载成功')
  }

  async createPlugin() {
    return this.api.post('/api/v1/create_plugin', {
      name: `test-plugin-${Date.now()}`,
      description: '测试插件',
      runtime: 'sandboxed'
    })
  }

  async createVersion(pluginId) {
    return this.api.post('/api/v1/create_plugin_version', {
      plugin_id: pluginId,
      version: '1.0.0',
      manifest: JSON.stringify({
        id: `com.test.plugin`,
        name: 'Test Plugin',
        version: '1.0.0',
        runtime: 'sandboxed'
      }),
      package_url: '/path/to/package.zip'
    })
  }

  async installPlugin(pluginId, versionId) {
    return this.api.post(`/api/v1/plugins/${pluginId}/install`, {
      versionId
    })
  }

  async enablePlugin(pluginId) {
    return this.api.post(`/api/v1/plugins/${pluginId}/enable`)
  }

  async disablePlugin(pluginId) {
    return this.api.post(`/api/v1/plugins/${pluginId}/disable`)
  }

  async uninstallPlugin(pluginId) {
    return this.api.post(`/api/v1/plugins/${pluginId}/uninstall`)
  }

  async getPluginDetail(pluginId) {
    return this.api.get(`/api/v1/get_plugin_detail`, {
      params: { id: pluginId }
    })
  }

  // 测试插件主机
  async testPluginHosts() {
    console.log('\n=== 测试插件主机 ===')

    // 1. 获取主机状态
    const status = await this.getHostStatus()
    console.log('✅ 主机状态:', status.data.data)

    // 2. 重启核心主机
    await this.restartHost('core-host')
    console.log('✅ 核心主机重启成功')

    // 3. 再次检查状态
    const newStatus = await this.getHostStatus()
    console.log('✅ 重启后状态:', newStatus.data.data)
  }

  async getHostStatus() {
    return this.api.get('/api/v1/plugin-hosts/status')
  }

  async restartHost(hostName) {
    return this.api.post(`/api/v1/plugin-hosts/${hostName}/restart`)
  }
}

// 运行测试
async function runTests() {
  const tester = new PluginSystemTester()

  try {
    await tester.testPluginLifecycle()
    await tester.testPluginHosts()
    console.log('\n🎉 所有测试通过！')
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message)
  }
}

runTests()
```

---

## 📝 注意事项

1. **参数验证**：
   - 所有必填参数必须提供
   - ID 必须是数字类型
   - 版本号必须符合语义化版本规范

2. **权限控制**：
   - 部分 API 需要管理员权限
   - 插件调用需要相应权限
   - 主机管理需要系统权限

3. **状态一致性**：
   - 插件状态变更需要按顺序进行
   - 实例状态与插件状态关联
   - 主机状态影响插件运行

4. **错误处理**：
   - 始终检查响应状态码
   - 记录详细的错误信息
   - 提供回滚机制

5. **性能考虑**：
   - 批量操作时控制并发数
   - 定期清理无用数据
   - 监控内存和 CPU 使用

---

## 🚀 最佳实践

1. **API 调用**：
   - 使用连接池复用连接
   - 设置合理的超时时间
   - 实现重试机制

2. **错误处理**：
   - 分类处理不同错误
   - 提供友好的错误信息
   - 记录详细日志

3. **监控**：
   - 定期检查主机健康状态
   - 监控插件性能指标
   - 设置告警阈值

4. **安全**：
   - 验证所有输入参数
   - 限制 API 访问频率
   - 使用 HTTPS 加密通信
