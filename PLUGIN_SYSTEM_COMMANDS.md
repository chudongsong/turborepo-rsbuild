# 插件系统常用命令参考

## 🚀 快速启动

### 数据库迁移
```bash
cd apps/api-service
node scripts/run-plugin-migration.js
```

### 构建插件主机
```bash
cd apps/plugin-host
npx tsc
# 输出: dist/index.js
```

### 启动插件主机
```bash
cd apps/plugin-host
node dist/index.js
# 后台运行: node dist/index.js &
```

### 启动 API 服务
```bash
cd apps/api-service
pnpm dev
```

---

## 🧪 测试命令

### 健康检查
```bash
curl http://localhost:4001/health
```

### 获取插件列表
```bash
curl http://localhost:4001/plugins
```

### 测试 RPC 调用
```bash
curl -X POST http://localhost:4001/rpc/test/method \
  -H "Content-Type: application/json" \
  -d '{"data": "value"}'
```

---

## 📊 查看日志

### 插件主机日志
```bash
# 如果是后台运行
# 检查进程输出或日志文件
```

### API 服务日志
```bash
# API 服务日志在控制台输出
cd apps/api-service && pnpm dev
```

---

## 🔧 管理命令

### 停止插件主机
```bash
# 查找进程
ps aux | grep "node dist/index.js"
# 杀死进程
kill <PID>
```

### 重启插件主机
```bash
kill $(lsof -ti:4001)
node dist/index.js &
```

---

## 📚 相关文档

- **[部署测试报告](./PLUGIN_SYSTEM_DEPLOYMENT_REPORT.md)** - 完整测试报告
- **[完整文档](./apps/api-service/docs/plugin-system/README.md)** - 系统文档
- **[快速入门](./apps/api-service/docs/plugin-system/QUICK_START.md)** - 快速上手指南
- **[API 参考](./apps/api-service/docs/plugin-system/API_REFERENCE.md)** - 详细 API 文档
- **[最佳实践](./apps/api-service/docs/plugin-system/BEST_PRACTICES.md)** - 开发规范

---

## 🎯 当前状态

- ✅ 数据库迁移: 完成
- ✅ 插件主机: 运行中 (端口 4001)
- ✅ 健康检查: 正常
- ✅ API 功能: 正常
- ✅ 文档系统: 完整

---

*更新时间: 2025-11-06*
