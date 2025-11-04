# API 文档 (ftp.ts)

## 目录
1. [编辑FTP帐号状态 (单个)](#1-编辑ftp帐号状态-单个)
2. [批量编辑FTP帐号状态](#2-批量编辑ftp帐号状态)
3. [删除FTP](#3-删除ftp)
4. [修改FTP信息 (密码/目录)](#4-修改ftp信息-密码目录)
5. [添加FTP](#5-添加ftp)
6. [修改FTP服务端口](#6-修改ftp服务端口)
7. [获取FTP权限列表](#7-获取ftp权限列表)
8. [设置FTP权限列表](#8-设置ftp权限列表)
9. [获取/设置FTP日志状态](#9-获取设置ftp日志状态)
10. [查看FTP登录日志](#10-查看ftp登录日志)
11. [查看FTP操作日志](#11-查看ftp操作日志)
12. [获取FTP到期告警配置](#12-获取ftp到期告警配置)
13. [设置FTP到期时间](#13-设置ftp到期时间)
14. [设置FTP配额容量](#14-设置ftp配额容量)
15. [获取FTP日志分析配置](#15-获取ftp日志分析配置)
16. [设置FTP日志分析配置](#16-设置ftp日志分析配置)
17. [FTP日志分析](#17-ftp日志分析)
18. [FTP日志分析设置自动任务](#18-ftp日志分析设置自动任务)
19. [设置FTP日志分析忽略IP](#19-设置ftp日志分析忽略ip)
20. [获取FTP日志分析忽略IP](#20-获取ftp日志分析忽略ip)
21. [添加IP规则 (防火墙)](#21-添加ip规则-防火墙)
22. [获取FTP用户列表 (用于日志分析)](#22-获取ftp用户列表-用于日志分析)
23. [批量修改FTP密码](#23-批量修改ftp密码)
24. [获取FTP类型列表 (分类)](#24-获取ftp类型列表-分类)
25. [添加FTP分类](#25-添加ftp分类)
26. [编辑FTP分类](#26-编辑ftp分类)
27. [删除FTP分类](#27-删除ftp分类)
28. [批量设置FTP分类](#28-批量设置ftp分类)
29. [批量删除FTP](#29-批量删除ftp)

---

## API 列表

### 1. 编辑FTP帐号状态 (单个)
- **描述**: 停止FTP帐号 status:0 启动FTP帐号 status:1
- **参数**:
  - `id` (number): FTP帐号ID
  - `username` (string): FTP帐号名称
  - `status` (number): FTP帐号状态 (0:停止, 1:启动)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ftp/SetStatus' \\
-H 'Content-Type: application/json' \\
-d '{
  "id": 123,
  "username": "your_username",
  "status": 1
}'
```

### 2. 批量编辑FTP帐号状态
- **描述**: 停止FTP帐号 status:0 启动FTP帐号 status:1
- **参数**:
  - `id` (number): FTP帐号ID (此参数在批量操作中通常为ID列表或特定格式，但此处类型为 FtpEditStatusProps，具体批量ID如何传递需参考实际请求)
  - `username` (string): FTP帐号名称 (同上，批量操作时的具体传递方式)
  - `status` (number): FTP帐号状态 (0:停止, 1:启动)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/datalist/batch/batch_set_ftp_status' \\
-H 'Content-Type: application/json' \\
-d '{
  "id": 123, 
  "username": "user1,user2", 
  "status": 1
}'
```

### 3. 删除FTP
- **描述**: 删除FTP
- **参数**:
  - `id` (number): FTP帐号ID
  - `username` (string): FTP帐号名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ftp/DeleteUser' \\
-H 'Content-Type: application/json' \\
-d '{
  "id": 123,
  "username": "your_username"
}'
```

### 4. 修改FTP信息 (密码/目录)
- **描述**: 修改FTP密码 (也包含目录修改)
- **参数**:
  - `id` (number): FTP帐号ID
  - `ftp_username` (string): FTP帐号名称
  - `new_password` (string): 新密码
  - `path` (string): 目录
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ftp/SetUser' \\
-H 'Content-Type: application/json' \\
-d '{
  "id": 123,
  "ftp_username": "your_ftp_username",
  "new_password": "your_new_password",
  "path": "/your/path"
}'
```

### 5. 添加FTP
- **描述**: 添加FTP
- **参数**:
  - `ftp_username` (string): 账号名称
  - `ftp_password` (string): 密码
  - `path` (string): 目录
  - `ps` (string): 备注
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ftp/AddUser' \\
-H 'Content-Type: application/json' \\
-d '{
  "path": "/your/path",
  "ftp_username": "your_ftp_username",
  "ftp_password": "your_ftp_password",
  "ps": "your_remark"
}'
```

### 6. 修改FTP服务端口
- **描述**: 修改FTP服务端口
- **参数**:
  - `port` (number): 服务端口
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ftp/setPort' \\
-H 'Content-Type: application/json' \\
-d '{
  "port": 21
}'
```

### 7. 获取FTP权限列表
- **描述**: 获取ftp权限列表
- **参数**:
  - `username` (string): 用户名
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ftp/GetFtpUserAccess' \\
-H 'Content-Type: application/json' \\
-d '{
  "username": "your_username"
}'
```

### 8. 设置FTP权限列表
- **描述**: 设置ftp权限列表
- **参数**:
  - `data` (AnyObject): 权限设置 (具体字段结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ftp/ModifyFtpUserAccess' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 9. 获取/设置FTP日志状态
- **描述**: 获取FTP日志状态/设置FTP日志状态 (JSDoc描述不清晰，根据路径判断与FTP日志设置有关)
- **参数**:
  - `exec_name` (string): 执行名称 (具体含义未知, 可能用于区分获取或设置操作或特定日志类型)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/ftp/set_ftp_log' \\
-H 'Content-Type: application/json' \\
-d '{
  "exec_name": "your_exec_name_value"
}'
```

### 10. 查看FTP登录日志
- **描述**: 查看FTP login日志
- **参数**:
  - `data` (AnyObject): 查询参数 (具体字段未在JSDoc中指明, 可能包含分页、筛选等)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/ftp/get_login_log' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 11. 查看FTP操作日志
- **描述**: 查看FTP action日志
- **参数**:
  - `data` (AnyObject): 查询参数 (具体字段未在JSDoc中指明, 可能包含分页、筛选等)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/ftp/get_action_log' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 12. 获取FTP到期告警配置
- **描述**: 获取告警配置 (FTP到期相关)
- **参数**:
  - `data` (AnyObject): (具体参数结构未在JSDoc中指明, 可能为空或包含特定标识)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ftp/get_cron_config' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 13. 设置FTP到期时间
- **描述**: 设置ftp到期时间
- **参数**:
  - `data` (AnyObject): 到期时间配置 (具体字段未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ftp/set_cron_config' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 14. 设置FTP配额容量
- **描述**: 设置FTP配额容量
- **参数**:
  - `data` (AnyObject): 配额信息 (具体字段未在JSDoc中指明, 例如: path, size)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/quota/modify_path_quota' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 15. 获取FTP日志分析配置
- **描述**: 获取FTP日志分析配置
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/ftp/get_analysis_config' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 16. 设置FTP日志分析配置
- **描述**: 设置FTP日志分析配置
- **参数**:
  - `data` (AnyObject): 分析配置信息 (具体字段未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/ftp/set_analysis_config' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 17. FTP日志分析
- **描述**: FTP日志分析
- **参数**:
  - `data` (AnyObject): 分析参数 (具体字段未在JSDoc中指明, 可能包含日期范围、用户等)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/ftp/log_analysis' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 18. FTP日志分析设置自动任务
- **描述**: FTP日志分析设置自动任务
- **参数**:
  - `data` (AnyObject): 自动任务配置 (具体字段未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/ftp/set_cron_task' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 19. 设置FTP日志分析忽略IP
- **描述**: 忽略IP (用于FTP日志分析)
- **参数**:
  - `data` (AnyObject): IP信息 (具体字段未在JSDoc中指明, 例如: ips)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/ftp/set_white_list' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 20. 获取FTP日志分析忽略IP
- **描述**: 获取忽略IP (用于FTP日志分析)
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/ftp/get_white_list' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 21. 添加IP规则 (防火墙)
- **描述**: 添加ip规则 (此API与防火墙相关，可能用于配合FTP功能)
- **参数**:
  - `data` (AnyObject): IP规则信息 (具体字段未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/firewall/create_ip_rules' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 22. 获取FTP用户列表 (用于日志分析)
- **描述**: 获取ftp用户列表 (主要用于FTP日志分析功能)
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/ftp/ftp_users' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 23. 批量修改FTP密码
- **描述**: 修改FTP密码 (批量)
- **参数**:
  - `data` (AnyObject): 批量密码修改信息 (具体字段结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/datalist/batch/batch_set_ftp_password' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 24. 获取FTP类型列表 (分类)
- **描述**: 获取FTP类型列表 (FTP分类)
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ftp/view_ftp_types' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 25. 添加FTP分类
- **描述**: 添加FTP分类
- **参数**:
  - `ps` (string): FTP分类名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ftp/add_ftp_types' \\
-H 'Content-Type: application/json' \\
-d '{
  "ps": "your_classification_name"
}'
```

### 26. 编辑FTP分类
- **描述**: 编辑FTP分类
- **参数**:
  - `id` (number): FTP分类ID
  - `ps` (string): FTP分类名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ftp/update_ftp_types' \\
-H 'Content-Type: application/json' \\
-d '{
  "id": 123,
  "ps": "your_new_classification_name"
}'
```

### 27. 删除FTP分类
- **描述**: 删除FTP分类
- **参数**:
  - `id` (number): FTP分类ID
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ftp/delete_ftp_types' \\
-H 'Content-Type: application/json' \\
-d '{
  "id": 123
}'
```

### 28. 批量设置FTP分类
- **描述**: 批量设置分类
- **参数**:
  - `ftp_names` (string): FTP名称 (逗号分隔的FTP用户名列表)
  - `id` (number | string): 分类ID
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/datalist/batch/batch_set_ftp_type' \\
-H 'Content-Type: application/json' \\
-d '{
  "ftp_names": "user1,user2,user3",
  "id": "your_classification_id"
}'
```

### 29. 批量删除FTP
- **描述**: 批量删除FTP
- **参数**:
  - `ftp_names` (string): FTP名称 (逗号分隔的FTP用户名列表)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/datalist/batch/batch_delete_ftp' \\
-H 'Content-Type: application/json' \\
-d '{
  "ftp_names": "user1,user2,user3"
}'
```
