# API 文档 (home.ts)

## 目录
1. [获取首页软件列表](#1-获取首页软件列表)
2. [获取软件商店已安装的软件列表](#2-获取软件商店已安装的软件列表)
3. [添加软件到首页](#3-添加软件到首页)
4. [移除首页软件](#4-移除首页软件)
5. [获取安全风险 (可强制刷新)](#5-获取安全风险-可强制刷新)
6. [获取安全风险列表](#6-获取安全风险列表)
7. [获取安全总览](#7-获取安全总览)
8. [获取待处理告警趋势](#8-获取待处理告警趋势)
9. [获取安全趋势](#9-获取安全趋势)
10. [获取安全动态](#10-获取安全动态)
11. [设置入侵检测开关](#11-设置入侵检测开关)
12. [设置首页软件排序](#12-设置首页软件排序)
13. [清理内存](#13-清理内存)
14. [首页负载等弹出框数据信息](#14-首页负载等弹出框数据信息)
15. [首页负载等弹出框结束进程](#15-首页负载等弹出框结束进程)
16. [获取扫描进度条进度](#16-获取扫描进度条进度)
17. [获取修复进度条进度](#17-获取修复进度条进度)
18. [获取首页概览数据](#18-获取首页概览数据)
19. [添加首页概览](#19-添加首页概览)
20. [修改首页概览](#20-修改首页概览)
21. [排序首页概览](#21-排序首页概览)
22. [删除首页概览](#22-删除首页概览)
23. [获取首页概览模板数据](#23-获取首页概览模板数据)
24. [获取扫描中断时数据](#24-获取扫描中断时数据)
25. [扫描中断](#25-扫描中断)
26. [获取腾讯专享版信息](#26-获取腾讯专享版信息)
27. [获取腾讯专享版服务器信息](#27-获取腾讯专享版服务器信息)
28. [获取腾讯专享版服务器流量信息](#28-获取腾讯专享版服务器流量信息)
29. [获取腾讯专享版服务器快照列表](#29-获取腾讯专享版服务器快照列表)
30. [创建快照 (腾讯云)](#30-创建快照-腾讯云)
31. [添加腾讯云API凭证](#31-添加腾讯云api凭证)
32. [删除快照 (腾讯云)](#32-删除快照-腾讯云)
33. [更新腾讯云API信息](#33-更新腾讯云api信息)
34. [取消腾讯云API凭证](#34-取消腾讯云api凭证)
35. [设置磁盘别名](#35-设置磁盘别名)
36. [获取SSH登录信息 (首页用)](#36-获取ssh登录信息-首页用)
37. [获取安全报告PDF](#37-获取安全报告pdf)
38. [获取安全风险扫描总数](#38-获取安全风险扫描总数)
39. [获取恶意文件检测结果](#39-获取恶意文件检测结果)
40. [获取漏洞扫描检测结果](#40-获取漏洞扫描检测结果)
41. [获取恶意文件配置](#41-获取恶意文件配置)
42. [修改恶意文件配置](#42-修改恶意文件配置)
43. [处理恶意文件](#43-处理恶意文件)
44. [修改告警配置 (安全云相关)](#44-修改告警配置-安全云相关)

---

## API 列表

### 1. 获取首页软件列表
- **描述**: 获取首页软件列表
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin/get_index_list' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 2. 获取软件商店已安装的软件列表
- **描述**: 获取软件商店已安装的软件列表
- **参数**:
  - `data` (AnyObject, 可选): (具体参数结构未在JSDoc中指明, 可能包含分页或筛选条件)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin/get_soft_list' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 3. 添加软件到首页
- **描述**: 添加软件到首页
- **参数**:
  - `sName` (string): 软件名称 (通过 data 对象传递)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=add_index' \\
-H 'Content-Type: application/json' \\
-d '{
  "sName": "your_software_name"
}'
```

### 4. 移除首页软件
- **描述**: 移除首页软件
- **参数**:
  - `sName` (string): 软件名称 (通过 data 对象传递)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=remove_index' \\
-H 'Content-Type: application/json' \\
-d '{
  "sName": "your_software_name"
}'
```

### 5. 获取安全风险 (可强制刷新)
- **描述**: 获取安全风险
- **参数**:
  - `force` (number, 可选): 是否强制刷新 (例如: 1 为强制刷新)
- **cURL (不强制刷新)**:
```bash
curl -X POST 'YOUR_BASE_URL/warning/get_list' \\
-H 'Content-Type: application/json' \\
-d '{}'
```
- **cURL (强制刷新)**:
```bash
curl -X POST 'YOUR_BASE_URL/warning/get_list' \\
-H 'Content-Type: application/json' \\
-d '{
  "force": 1
}'
```

### 6. 获取安全风险列表
- **描述**: 获取安全风险列表
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/warning/get_result' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 7. 获取安全总览
- **描述**: 获取安全总览
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safecloud/get_safe_overview' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 8. 获取待处理告警趋势
- **描述**: 获取待处理告警趋势
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safecloud/get_pending_alarm_trend' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 9. 获取安全趋势
- **描述**: 安全趋势
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safecloud/get_security_trend' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 10. 获取安全动态
- **描述**: 安全动态
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safecloud/get_security_dynamic' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 11. 设置入侵检测开关
- **描述**: 设置入侵检测开关 (具体是开启还是关闭或切换状态，需要参照插件实际行为)
- **参数**: 无 (操作通过URL参数指定: `action=a&name=bt_hids&s=set_process`)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=bt_hids&s=set_process' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 12. 设置首页软件排序
- **描述**: 设置首页软件排序
- **参数**:
  - `ssort` (AnyObject): 名称排序字符串 (具体格式未在JSDoc中指明，可能是一个逗号分隔的软件名列表或特定格式的JSON)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin/sort_index' \\
-H 'Content-Type: application/json' \\
-d '{
  "ssort": "nginx,mysql,php"
}'
```

### 13. 清理内存
- **描述**: 清理内存
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/system/ReMemory' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 14. 首页负载等弹出框数据信息
- **描述**: 首页负载等弹出框数据信息
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/monitor/process_management/specific_resource_load_type' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 15. 首页负载等弹出框结束进程
- **描述**: 首页负载等弹出框结束进程
- **参数**:
  - `pid` (number): 进程ID
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/monitor/process_management/kill_process_all' \\
-H 'Content-Type: application/json' \\
-d '{
  "pid": 12345
}'
```

### 16. 获取扫描进度条进度
- **描述**: 获取扫描进度条进度
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/warning/get_scan_bar' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 17. 获取修复进度条进度
- **描述**: 获取修复进度条进度
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/security/get_repair_bar' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 18. 获取首页概览数据
- **描述**: 获取首页概览数据
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/overview/GetOverview' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 19. 添加首页概览
- **描述**: 添加首页概览
- **参数**:
  - `data` (AnyObject): 概览项配置 (具体字段结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/overview/AddOverview' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 20. 修改首页概览
- **描述**: 修改首页概览
- **参数**:
  - `data` (AnyObject): 概览项修改后的配置 (具体字段结构未在JSDoc中指明, 可能需要 `overview_id`)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/overview/SetOverview' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 21. 排序首页概览
- **描述**: (无具体描述，应为排序首页概览项)
- **参数**:
  - `data` (AnyObject): 排序信息 (具体字段结构未在JSDoc中指明, 可能是一个包含ID和顺序的列表)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/overview/SortOverview' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 22. 删除首页概览
- **描述**: 删除首页概览
- **参数**:
  - `overview_id` (number): 概览项ID
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/overview/DelOverview' \\
-H 'Content-Type: application/json' \\
-d '{
  "overview_id": 123
}'
```

### 23. 获取首页概览模板数据
- **描述**: 获取首页概览模板数据
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/overview/GetTemplateOverview' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 24. 获取扫描中断时数据
- **描述**: 获取扫描中断时数据
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/warning/get_tmp_result' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 25. 扫描中断
- **描述**: 扫描中断
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/warning/kill_get_list' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 26. 获取腾讯专享版信息
- **描述**: 获取腾讯专享版信息
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/tencent/get_config' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 27. 获取腾讯专享版服务器信息
- **描述**: 获取腾讯专享版服务器信息
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/tencent/get_local_lighthouse' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 28. 获取腾讯专享版服务器流量信息
- **描述**: 获取腾讯专享版服务器流量信息
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/tencent/get_request_pack' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 29. 获取腾讯专享版服务器快照列表
- **描述**: 获取腾讯专享版服务器快照
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/tencent/get_snapshots_list' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 30. 创建快照 (腾讯云)
- **描述**: 创建快照
- **参数**:
  - `SnapshotName` (string): 快照名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/tencent/create_snapshots' \\
-H 'Content-Type: application/json' \\
-d '{
  "SnapshotName": "your_snapshot_name"
}'
```

### 31. 添加腾讯云API凭证
- **描述**: 添加腾讯云api
- **参数**:
  - `appid` (string): APP ID
  - `secretId` (string): Secret ID
  - `secretKey` (string): Secret Key
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/tencent/set_config' \\
-H 'Content-Type: application/json' \\
-d '{
  "appid": "your_app_id",
  "secretId": "your_secret_id",
  "secretKey": "your_secret_key"
}'
```

### 32. 删除快照 (腾讯云)
- **描述**: 删除快照
- **参数**:
  - `SnapshotId` (string): 快照id
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/tencent/delete_snapshots' \\
-H 'Content-Type: application/json' \\
-d '{
  "SnapshotId": "your_snapshot_id"
}'
```

### 33. 更新腾讯云API信息
- **描述**: 获取腾讯云api (应为更新或同步腾讯云API相关信息)
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/tencent/update_tencent' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 34. 取消腾讯云API凭证
- **描述**: 取消腾讯云api
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/tencent/cancel_config' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 35. 设置磁盘别名
- **描述**: 设置磁盘别名
- **参数**:
  - `path` (string): 磁盘路径
  - `name` (string): 别名
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/system/set_rname' \\
-H 'Content-Type: application/json' \\
-d '{
  "path": "/mnt/disk1",
  "name": "DataDisk1"
}'
```

### 36. 获取SSH登录信息 (首页用)
- **描述**: 获取SSH登录信息
- **参数**:
  - `log_type` (string): 日志类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/ssh/com/index_ssh_info' \\
-H 'Content-Type: application/json' \\
-d '{
  "log_type": "your_log_type"
}'
```

### 37. 获取安全报告PDF
- **描述**: (无具体描述，应为获取安全报告PDF)
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/exportreport/get_pdf' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 38. 获取安全风险扫描总数
- **描述**: 获取安全风险扫描总数
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safecloud/get_safecloud_list' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 39. 获取恶意文件检测结果
- **描述**: 获取恶意文件检测结果
- **参数**:
  - `day` (number, 可选): 天数 (例如：7表示最近7天)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safecloud/get_webshell_result' \\
-H 'Content-Type: application/json' \\
-d '{
  "day": 7
}'
```

### 40. 获取漏洞扫描检测结果
- **描述**: 获取漏洞扫描检测结果
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/scanning/get_vuln_info' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 41. 获取恶意文件配置
- **描述**: 获取恶意文件配置
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safecloud/get_config' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 42. 修改恶意文件配置
- **描述**: 修改恶意文件配置
- **参数**:
  - `quarantine` (boolean): 是否自动拦截
  - `dynamic_detection` (boolean): 是否开启动态检测
  - `scan_oss` (boolean, 可选): 是否扫描OSS
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safecloud/set_config' \\
-H 'Content-Type: application/json' \\
-d '{
  "quarantine": true,
  "dynamic_detection": true,
  "scan_oss": false
}'
```

### 43. 处理恶意文件
- **描述**: 处理恶意文件
- **参数**:
  - `file_list` (string): 文件列表 (具体格式未指明，可能是逗号分隔的路径或JSON数组字符串)
  - `action_type` (string): 操作类型 (例如：delete, quarantine, trust)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safecloud/deal_webshell_file' \\
-H 'Content-Type: application/json' \\
-d '{
  "file_list": "/path/to/file1.php,/path/to/file2.php",
  "action_type": "delete"
}'
```

### 44. 修改告警配置 (安全云相关)
- **描述**: 修改告警配置
- **参数**:
  - `sender` (string): 发送通道
  - `status` (boolean): 是否开启
  - `send_type` (string): 发送类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safecloud/set_alarm_config' \\
-H 'Content-Type: application/json' \\
-d '{
  "sender": "email",
  "status": true,
  "send_type": "daily_report"
}'
```
