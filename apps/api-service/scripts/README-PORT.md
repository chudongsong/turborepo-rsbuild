# 端口管理功能说明

本文档说明 LinglongOS API 服务的端口管理功能，包括端口检测、自动切换和冲突处理机制。

## 功能概述

- ✅ **智能端口检测**: 自动检测端口占用情况
- ✅ **自动端口切换**: 端口冲突时自动使用下一个可用端口
- ✅ **友好错误提示**: 提供详细的错误信息和解决建议
- ✅ **多种启动方式**: 支持多种启动脚本和命令选项

## 启动方式

### 1. 默认启动（使用端口 7001）
```bash
pnpm -C apps/api-service dev
```

### 2. 使用智能启动脚本（推荐）
```bash
pnpm -C apps/api-service run dev:smart
# 或
bash scripts/start-dev.sh
# 或
bash scripts/dev-with-port-check.sh
```

### 3. 自定义端口启动
```bash
PORT=8080 pnpm -C apps/api-service dev
```

### 4. 检查端口可用性
```bash
pnpm -C apps/api-service run dev:check
# 或
node scripts/check-port.js [起始端口] [检测范围]
```

## 端口检测机制

### 检测范围
- **默认起始端口**: 7001
- **默认检测范围**: 7001-7050（共50个端口）
- **可通过环境变量自定义**: `PORT_RANGE_START`, `PORT_RANGE_END`

### 检测逻辑
1. 从起始端口开始检测
2. 检查端口是否被占用
3. 如果端口可用，立即使用
4. 如果端口被占用，继续检测下一个
5. 直到找到可用端口或达到检测上限

## 文件说明

### 脚本文件

| 脚本文件 | 功能描述 |
|---------|----------|
| `scripts/check-port.js` | 端口占用检测工具，独立运行 |
| `scripts/port-check.js` | 端口检测核心库，被其他脚本调用 |
| `scripts/start-dev.sh` | 简单智能启动脚本（推荐） |
| `scripts/dev-with-port-check.sh` | 高级智能启动脚本，支持更多参数 |

### 配置修改

**`config/config.default.ts`** - 端口配置
- 添加了端口检测函数
- 支持从环境变量读取端口配置
- 实现了集群模式的端口 failover 策略

## 使用示例

### 示例 1: 基本端口检测
```bash
# 检测 7001-7010 端口
node scripts/check-port.js 7001 10

# 输出示例:
# ✓ 端口 7001 可用
# ✗ 端口 7002 被占用
#   └─ 进程: node (PID: 12345)
# ✓ 端口 7003 可用
```

### 示例 2: 使用智能启动
```bash
# 自动检测并启动
bash scripts/start-dev.sh

# 输出示例:
# ========================================
#   LinglongOS API 服务启动器
# ========================================
# 正在检测端口可用性...
# 检测范围: 7001 - 7050
# ✓ 端口 7001 可用
# ✓ 端口检测完成
# 启动端口: 7001
# ========================================
#   启动开发服务器
# ========================================
```

### 示例 3: 自定义端口范围
```bash
# 使用 8000-8049 范围
PORT_RANGE_START=8000 bash scripts/start-dev.sh

# 或
PORT=8000 pnpm -C apps/api-service dev
```

### 示例 4: 端口冲突处理
```bash
# 场景: 端口 7001-7005 都被占用

# 解决方案 1: 自动检测（脚本会找到下一个可用端口）
bash scripts/start-dev.sh
# 自动使用端口 7006

# 解决方案 2: 关闭占用端口的进程
lsof -i :7001
kill -9 <PID>

# 解决方案 3: 使用其他端口范围
PORT_RANGE_START=8000 bash scripts/start-dev.sh
```

## 错误处理

### 错误 1: 所有端口都被占用
```
✗ 错误: 无法找到可用端口
检测范围: 7001 - 7050

解决方案:
  1. 关闭占用端口的进程
  2. 设置自定义端口范围: PORT_RANGE_START=8000
  3. 查看端口占用: lsof -i :7001
```

### 错误 2: 依赖未安装
```
⚠ 依赖未安装，正在安装...
✓ 依赖安装完成
```

### 错误 3: 项目目录不正确
```
✗ 错误: 未找到 package.json
请确保在正确的项目目录中运行此脚本
```

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | 起始端口号 | 7001 |
| `EGG_PORT` | Egg.js 端口配置 | 继承 PORT |
| `PORT_RANGE_START` | 端口检测起始值 | 继承 PORT |
| `PORT_RANGE_END` | 端口检测结束值 | PORT_RANGE_START + 49 |

## 最佳实践

### ✅ 推荐做法
1. **使用智能启动脚本**: `bash scripts/start-dev.sh`
2. **设置合理的端口范围**: 避免与系统服务冲突
3. **监控端口占用**: 定期检查端口使用情况

### ❌ 避免做法
1. 不要手动杀死 Egg.js 进程（使用 `pnpm stop`）
2. 不要使用小于 1024 的端口（需要 root 权限）
3. 不要在生产环境使用自动端口切换

## 故障排除

### 问题 1: 脚本权限错误
```bash
chmod +x scripts/*.sh scripts/*.js
```

### 问题 2: 端口检测不准确
- 确保没有防火墙阻止
- 检查 `lsof` 命令是否可用

### 问题 3: 服务启动后端口不正确
```bash
# 查看实际使用端口
netstat -tlnp | grep node
# 或
lsof -i -P | grep node
```

## 相关命令

```bash
# 查看端口占用
lsof -i :7001
netstat -tulpn | grep 7001

# 杀死端口进程
kill -9 $(lsof -ti:7001)

# 测试端口连通性
telnet 127.0.0.1 7001
nc -zv 127.0.0.1 7001
```

## 贡献指南

如需改进端口管理功能，请参考：
- `scripts/port-check.js` - 核心检测逻辑
- `scripts/start-dev.sh` - 启动脚本
- `config/config.default.ts` - 配置管理

## 更新日志

### v1.0.0 (2025-11-06)
- ✨ 初始版本
- ✅ 端口占用检测
- ✅ 自动端口切换
- ✅ 智能启动脚本
- ✅ 友好错误提示
