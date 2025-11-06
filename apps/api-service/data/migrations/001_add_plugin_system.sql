-- 插件系统数据库迁移 - 第一阶段
-- 为支持混合架构（集成运行时 + 沙箱隔离）扩展数据库结构
-- 创建时间: 2025-11-06

-- ============================================
-- 1. 扩展 plugins 表 - 添加混合架构支持字段
-- ============================================

-- 检查字段是否存在，如果不存在则添加
-- 插件运行时类型 (integrated/sandboxed)
ALTER TABLE plugins ADD COLUMN runtime VARCHAR(20) DEFAULT 'sandboxed';

-- API 版本
ALTER TABLE plugins ADD COLUMN api_version VARCHAR(20) DEFAULT '1.0';

-- 权限列表 (JSON格式)
ALTER TABLE plugins ADD COLUMN permissions TEXT;

-- 主机配置 (仅核心插件)
ALTER TABLE plugins ADD COLUMN host_config TEXT;

-- 沙箱配置 (仅第三方插件)
ALTER TABLE plugins ADD COLUMN sandbox_config TEXT;

-- 前端入口点
ALTER TABLE plugins ADD COLUMN entry_point VARCHAR(500);

-- 后端类型
ALTER TABLE plugins ADD COLUMN backend_type VARCHAR(50);

-- 后端入口
ALTER TABLE plugins ADD COLUMN backend_entry VARCHAR(500);

-- 插件状态
ALTER TABLE plugins ADD COLUMN status VARCHAR(20) DEFAULT 'installed';

-- 安装时间
ALTER TABLE plugins ADD COLUMN installed_at INTEGER;

-- 启用时间
ALTER TABLE plugins ADD COLUMN enabled_at INTEGER;

-- ============================================
-- 2. 扩展 plugin_versions 表 - 添加运行时配置
-- ============================================

-- 前端配置
ALTER TABLE plugin_versions ADD COLUMN frontend_config TEXT;

-- 后端配置
ALTER TABLE plugin_versions ADD COLUMN backend_config TEXT;

-- Module Federation配置 (核心插件)
ALTER TABLE plugin_versions ADD COLUMN module_federation_config TEXT;

-- iFrame配置 (第三方插件)
ALTER TABLE plugin_versions ADD COLUMN iframe_config TEXT;

-- ============================================
-- 3. 创建 plugin_instances 表 - 插件实例管理
-- ============================================

CREATE TABLE IF NOT EXISTS plugin_instances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plugin_id INTEGER NOT NULL,
  version_id INTEGER NOT NULL,
  instance_name VARCHAR(255) NOT NULL,
  config TEXT,
  status VARCHAR(20) DEFAULT 'stopped',
  host_process_id VARCHAR(100),
  sandbox_url VARCHAR(500),
  mf_remote_name VARCHAR(100),
  port INTEGER,
  metadata TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
  updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
  FOREIGN KEY (plugin_id) REFERENCES plugins(id) ON DELETE CASCADE,
  FOREIGN KEY (version_id) REFERENCES plugin_versions(id) ON DELETE CASCADE,
  UNIQUE(plugin_id, instance_name),
  CONSTRAINT chk_instance_status CHECK (status IN ('running', 'stopped', 'error', 'starting', 'stopping'))
);


-- ============================================
-- 4. 创建 plugin_events 表 - 插件事件日志
-- ============================================

CREATE TABLE IF NOT EXISTS plugin_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plugin_id INTEGER NOT NULL,
  instance_id INTEGER,
  event_type VARCHAR(50) NOT NULL,
  event_data TEXT,
  user_id VARCHAR(100),
  source_ip VARCHAR(50),
  error_message TEXT,
  stack_trace TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
  FOREIGN KEY (plugin_id) REFERENCES plugins(id) ON DELETE CASCADE,
  FOREIGN KEY (instance_id) REFERENCES plugin_instances(id) ON DELETE SET NULL,
  CONSTRAINT chk_event_type CHECK (event_type IN (
    'install', 'uninstall', 'enable', 'disable',
    'start', 'stop', 'restart', 'update',
    'error', 'warning', 'info', 'debug',
    'permission_granted', 'permission_denied',
    'api_call', 'api_response', 'api_error'
  ))
);


-- ============================================
-- 5. 创建 plugin_permissions 表 - 插件权限管理
-- ============================================

CREATE TABLE IF NOT EXISTS plugin_permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plugin_id INTEGER NOT NULL,
  permission_name VARCHAR(100) NOT NULL,
  permission_type VARCHAR(20) NOT NULL DEFAULT 'allow',
  resource_pattern VARCHAR(500),
  conditions TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
  updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
  FOREIGN KEY (plugin_id) REFERENCES plugins(id) ON DELETE CASCADE,
  UNIQUE(plugin_id, permission_name),
  CONSTRAINT chk_permission_type CHECK (permission_type IN ('allow', 'deny'))
);


-- ============================================
-- 6. 创建 plugin_hosts 表 - 插件主机进程管理
-- ============================================

CREATE TABLE IF NOT EXISTS plugin_hosts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  host_name VARCHAR(100) NOT NULL UNIQUE,
  process_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'stopped',
  config TEXT,
  loaded_plugins TEXT,
  last_heartbeat INTEGER,
  start_time INTEGER,
  stop_time INTEGER,
  restart_count INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
  updated_at DEFAULT (strftime('%s', 'now') * 1000),
  CONSTRAINT chk_host_status CHECK (status IN ('running', 'stopped', 'error', 'starting', 'stopping'))
);


-- ============================================
-- 7. 创建索引以提高查询性能
-- ============================================

-- plugin_instances 表索引
CREATE INDEX IF NOT EXISTS idx_plugin_instances_plugin_id ON plugin_instances(plugin_id);
CREATE INDEX IF NOT EXISTS idx_plugin_instances_version_id ON plugin_instances(version_id);
CREATE INDEX IF NOT EXISTS idx_plugin_instances_status ON plugin_instances(status);
CREATE INDEX IF NOT EXISTS idx_plugin_instances_created_at ON plugin_instances(created_at);

-- plugin_events 表索引
CREATE INDEX IF NOT EXISTS idx_plugin_events_plugin_id ON plugin_events(plugin_id);
CREATE INDEX IF NOT EXISTS idx_plugin_events_instance_id ON plugin_events(instance_id);
CREATE INDEX IF NOT EXISTS idx_plugin_events_type ON plugin_events(event_type);
CREATE INDEX IF NOT EXISTS idx_plugin_events_created_at ON plugin_events(created_at);
CREATE INDEX IF NOT EXISTS idx_plugin_events_user_id ON plugin_events(user_id);

-- plugin_permissions 表索引
CREATE INDEX IF NOT EXISTS idx_plugin_permissions_plugin_id ON plugin_permissions(plugin_id);
CREATE INDEX IF NOT EXISTS idx_plugin_permissions_name ON plugin_permissions(permission_name);

-- plugin_hosts 表索引
CREATE INDEX IF NOT EXISTS idx_plugin_hosts_status ON plugin_hosts(status);
CREATE INDEX IF NOT EXISTS idx_plugin_hosts_heartbeat ON plugin_hosts(last_heartbeat);

-- plugins 表新字段索引
CREATE INDEX IF NOT EXISTS idx_plugins_runtime ON plugins(runtime);
CREATE INDEX IF NOT EXISTS idx_plugins_status ON plugins(status);
CREATE INDEX IF NOT EXISTS idx_plugins_backend_type ON plugins(backend_type);

-- ============================================
-- 8. 插入默认数据
-- ============================================

-- 初始化默认插件主机
INSERT OR IGNORE INTO plugin_hosts (host_name, status, config, last_heartbeat)
VALUES (
  'core-host',
  'stopped',
  '{"port": 4001, "max_memory": "512MB", "log_level": "info", "plugin_timeout": 30000}',
  NULL
);

INSERT OR IGNORE INTO plugin_hosts (host_name, status, config, last_heartbeat)
VALUES (
  'user-host',
  'stopped',
  '{"port": 4002, "max_memory": "256MB", "log_level": "info", "plugin_timeout": 15000}',
  NULL
);

-- ============================================
-- 9. 创建触发器 - 自动更新时间戳
-- ============================================

-- plugin_instances 表更新触发器
CREATE TRIGGER IF NOT EXISTS trg_plugin_instances_updated_at
AFTER UPDATE ON plugin_instances
FOR EACH ROW
BEGIN
  UPDATE plugin_instances SET updated_at = (strftime('%s', 'now') * 1000) WHERE id = NEW.id;
END;

-- plugin_permissions 表更新触发器
CREATE TRIGGER IF NOT EXISTS trg_plugin_permissions_updated_at
AFTER UPDATE ON plugin_permissions
FOR EACH ROW
BEGIN
  UPDATE plugin_permissions SET updated_at = (strftime('%s', 'now') * 1000) WHERE id = NEW.id;
END;

-- plugin_hosts 表更新触发器
CREATE TRIGGER IF NOT EXISTS trg_plugin_hosts_updated_at
AFTER UPDATE ON plugin_hosts
FOR EACH ROW
BEGIN
  UPDATE plugin_hosts SET updated_at = (strftime('%s', 'now') * 1000) WHERE id = NEW.id;
END;

-- ============================================
-- 10. 更新表注释
-- ============================================

-- 为新字段添加注释
