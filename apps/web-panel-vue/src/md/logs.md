# API 文档 (logs.ts)

## 目录
1. [获取SSH日志列表](#1-获取ssh日志列表)
2. [获取SSH登录信息](#2-获取ssh登录信息)
3. [获取系统日志菜单](#3-获取系统日志菜单)
4. [获取系统日志数据](#4-获取系统日志数据)
5. [获取软件日志菜单](#5-获取软件日志菜单)
6. [获取软件日志数据](#6-获取软件日志数据)
7. [获取慢日志数据 (MySQL)](#7-获取慢日志数据-mysql)
8. [获取错误日志数据](#8-获取错误日志数据)
9. [获取通用列表数据](#9-获取通用列表数据)
10. [设置FTP日志状态](#10-设置ftp日志状态)
11. [获取FTP登录日志](#11-获取ftp登录日志)
12. [获取FTP操作日志](#12-获取ftp操作日志)
13. [获取Docker日志](#13-获取docker日志)
14. [获取PHP软件日志](#14-获取php软件日志)
15. [获取堡塔防入侵日志](#15-获取堡塔防入侵日志)
16. [获取宝塔系统加固日志](#16-获取宝塔系统加固日志)
17. [获取面板运行日志](#17-获取面板运行日志)
18. [清空面板运行日志](#18-清空面板运行日志)
19. [清空面板操作日志](#19-清空面板操作日志)
20. [获取IP地理位置信息](#20-获取ip地理位置信息)
21. [获取计划任务日志数据](#21-获取计划任务日志数据)
22. [获取网站列表信息 (用于日志)](#22-获取网站列表信息-用于日志)
23. [获取网站访问日志](#23-获取网站访问日志)
24. [获取网站错误日志](#24-获取网站错误日志)
25. [获取网站操作日志](#25-获取网站操作日志)
26. [获取网站日志文件路径 (用于日志分析)](#26-获取网站日志文件路径-用于日志分析)
27. [获取日志分析的定时任务配置](#27-获取日志分析的定时任务配置)
28. [设置日志分析的定时任务](#28-设置日志分析的定时任务)
29. [获取Web日志分析数据](#29-获取web日志分析数据)
30. [执行日志分析 (扫描)](#30-执行日志分析-扫描)
31. [获取网站速度日志](#31-获取网站速度日志)
32. [获取网站详细日志](#32-获取网站详细日志)
33. [导出查杀日志](#33-导出查杀日志)
34. [清理查杀日志](#34-清理查杀日志)
35. [导出网站日志](#35-导出网站日志)
36. [清理网站日志](#36-清理网站日志)
37. [获取SSH日志导出路径](#37-获取ssh日志导出路径)
38. [清空面板登录日志](#38-清空面板登录日志)
39. [获取面板登录日志](#39-获取面板登录日志)
40. [导出面板操作日志 (按搜索)](#40-导出面板操作日志-按搜索)
41. [获取日志采集列表](#41-获取日志采集列表)
42. [添加日志发送源](#42-添加日志发送源)
43. [删除日志发送源](#43-删除日志发送源)
44. [修改日志服务器](#44-修改日志服务器)
45. [添加日志服务器](#45-添加日志服务器)
46. [获取日志服务器列表](#46-获取日志服务器列表)
47. [获取网站日志关键词告警状态](#47-获取网站日志关键词告警状态)
48. [设置网站日志关键词告警](#48-设置网站日志关键词告警)
49. [导出面板域名操作日志](#49-导出面板域名操作日志)
50. [删除Web分析日志](#50-删除web分析日志)
51. [删除软件日志](#51-删除软件日志)
52. [导出面板登录日志 (按条件)](#52-导出面板登录日志-按条件)
53. [创建SSH IP规则 (封禁IP)](#53-创建ssh-ip规则-封禁ip)
54. [移除SSH IP规则 (解封IP)](#54-移除ssh-ip规则-解封ip)

---

## API 列表

### 1. 获取SSH日志列表
- **描述**: 获取SSH连接相关的日志列表。
- **参数**:
  - `data` (string): JSON字符串格式的请求数据。
    - `search` (string, 可选): 搜索关键字。
    - `limit` (number, 可选): 每页显示数量。
    - `select` (string, 可选): 列别，例如 'ALL'。
    - `p` (number, 可选): 页码。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/ssh/com/get_ssh_list' \
-H 'Content-Type: application/json' \
-d '{
  "data": "{\"search\":\"keyword\",\"limit\":10,\"p\":1}"
}'
```

### 2. 获取SSH登录信息
- **描述**: 获取SSH登录尝试（例如入侵检测）的相关信息。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/ssh/com/get_ssh_intrusion' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 3. 获取系统日志菜单
- **描述**: 获取可用的系统日志文件列表，用于菜单展示。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/syslog/get_sys_logfiles' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 4. 获取系统日志数据
- **描述**: 获取指定系统日志文件的内容。
- **参数**:
  - `data` (string): JSON字符串格式的请求数据。
    - `log_name` (string): 日志名称。
    - `search` (string, 可选): 搜索关键字。
    - `limit` (number, 可选): 每页显示数量。
    - `p` (number, 可选): 页码。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/syslog/get_sys_log' \
-H 'Content-Type: application/json' \
-d '{
  "data": "{\"log_name\":\"secure\",\"search\":\"keyword\",\"limit\":50,\"p\":1}"
}'
```

### 5. 获取软件日志菜单
- **描述**: 获取各类软件的日志文件列表，用于菜单展示。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/monitor/soft/soft_log_list' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 6. 获取软件日志数据
- **描述**: 获取指定软件的日志内容。
- **参数**:
  - `data` (string): JSON字符串格式的请求数据。
    - `name` (string): 软件/日志名称。
    - `search` (string, 可选): 搜索关键字。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/monitor/soft/get_log' \
-H 'Content-Type: application/json' \
-d '{
  "data": "{\"name\":\"php\",\"search\":\"error\"}"
}'
```

### 7. 获取慢日志数据 (MySQL)
- **描述**: 获取MySQL的慢查询日志信息。
- **参数**:
  - `data` (string): JSON字符串格式的请求数据。
    - `search` (string, 可选): 搜索关键字。
    - `limit` (string, 可选): 每页显示数量。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/panel/get_slow_logs' \
-H 'Content-Type: application/json' \
-d '{
  "data": "{\"search\":\"SELECT\",\"limit\":\"20\"}"
}'
```

### 8. 获取错误日志数据
- **描述**: 获取数据库错误日志信息。
- **参数**:
  - `screening` (string): 日志筛选条件。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/GetErrorLog' \
-H 'Content-Type: application/json' \
-d '{
  "screening": "your_screening_condition"
}'
```

### 9. 获取通用列表数据
- **描述**: 获取各类列表数据，如网站、数据库、FTP、计划任务、备份列表等。
- **参数**:
  - `table` (string): 数据来源的表名。
  - `p` (number, 可选): 页码。
  - `limit` (number, 可选): 每页数量。
  - `search` (string, 可选): 搜索关键字。
  - `result` (string, 可选): 搜索结果 (具体用途根据后端确定)。
  - `sid` (number | string, 可选): 特定ID，如站点ID。
  - `tojs` (number | string, 可选): JavaScript相关参数 (具体用途根据后端确定)。
  - `log_type` (string, 可选): 日志类型。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/data/getData' \
-H 'Content-Type: application/json' \
-d '{
  "table": "sites",
  "p": 1,
  "limit": 10,
  "search": "keyword"
}'
```

### 10. 设置FTP日志状态
- **描述**: 设置FTP服务的日志记录状态（开启/关闭）。
- **参数**:
  - `exec_name` (string): 执行名称，例如 "open" 或 "close"。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/ftp/set_ftp_log' \
-H 'Content-Type: application/json' \
-d '{
  "exec_name": "open"
}'
```

### 11. 获取FTP登录日志
- **描述**: 获取FTP登录尝试的日志信息。
- **参数**: (参考 `GetDataParam` 定义，`table` 参数可能需要指定)
  - `table` (string): 数据来源的表名 (例如相关的FTP日志表)。
  - `p` (number, 可选): 页码。
  - `limit` (number, 可选): 每页数量。
  - `search` (string, 可选): 搜索关键字。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ftp/get_login_logs' \
-H 'Content-Type: application/json' \
-d '{
  "table": "ftp_login_log_table_name",
  "search": "user_xyz",
  "limit": 20,
  "p": 1
}'
```

### 12. 获取FTP操作日志
- **描述**: 获取FTP文件操作（上传、下载、删除等）的日志信息。
- **参数**: (参考 `ActionLogDataParam` 定义)
  - `type` (string): 操作类型。
  - `table` (string): 数据来源的表名。
  - `p` (number, 可选): 页码。
  - `limit` (number, 可选): 每页数量。
  - `search` (string, 可选): 搜索关键字。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/ftp/get_action_log' \
-H 'Content-Type: application/json' \
-d '{
  "type": "upload",
  "table": "ftp_action_log_table_name",
  "search": "file.zip",
  "limit": 20,
  "p": 1
}'
```

### 13. 获取Docker日志
- **描述**: 获取Docker容器的相关日志信息。
- **参数**: (参考 `DockerLogDataParam` 定义)
  - `ROWS` (string): 需要获取的日志行数。
  - `table` (string): 数据来源的表名 (可能指代特定容器或日志源)。
  - `p` (number, 可选): 页码。
  - `limit` (number, 可选): 每页数量 (若与ROWS冲突，以后端为准)。
  - `search` (string, 可选): 搜索关键字。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/monitor/soft/get_docker_log?name=Docker' \
-H 'Content-Type: application/json' \
-d '{
  "ROWS": "100",
  "table": "docker_container_log",
  "search": "error"
}'
```

### 14. 获取PHP软件日志
- **描述**: 获取PHP相关的软件日志信息。
- **参数**:
  - `data` (string): JSON字符串格式的请求数据，具体内容依赖于后端对PHP日志的查询需求 (例如包含PHP版本、站点信息等)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/monitor/soft/get_log' \
-H 'Content-Type: application/json' \
-d '{
  "data": "{\"php_version\":\"7.4\",\"site_name\":\"example.com\"}"
}'
```

### 15. 获取堡塔防入侵日志
- **描述**: 获取堡塔面板自带的防入侵日志。
- **参数**:
  - `data` (string): JSON字符串格式的请求数据，用于查询特定条件下的日志。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/monitor/soft/get_bt_security_log?name=bt_security' \
-H 'Content-Type: application/json' \
-d '{
  "data": "{\"limit\":50,\"p\":1}"
}'
```

### 16. 获取宝塔系统加固日志
- **描述**: 获取宝塔面板系统加固模块的相关日志。
- **参数**:
  - `data` (string): JSON字符串格式的请求数据，用于查询特定条件下的日志。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/monitor/soft/get_syssafe_log?name=syssafe' \
-H 'Content-Type: application/json' \
-d '{
  "data": "{\"limit\":50,\"p\":1}"
}'
```

### 17. 获取面板运行日志
- **描述**: 获取宝塔面板本身的运行日志或错误日志。
- **参数**:
  - `limit` (number, 可选): 获取的日志条数。
  - `search` (string, 可选): 搜索关键字。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/panel/get_panel_error_logs' \
-H 'Content-Type: application/json' \
-d '{
  "limit": 100,
  "search": "CRITICAL"
}'
```

### 18. 清空面板运行日志
- **描述**: 清空宝塔面板的运行日志。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/clean_panel_error_logs' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 19. 清空面板操作日志
- **描述**: 清空宝塔面板的用户操作日志数据。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/delClose' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 20. 获取IP地理位置信息
- **描述**: 获取访问IP的地理位置统计数据。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/panel/IP_geolocation' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 21. 获取计划任务日志数据
- **描述**: 获取特定计划任务的执行日志。
- **参数**:
  - `type` (string): 类型 (具体含义需参照后端实现)。
  - `id` (number): 计划任务的ID。
  - `time_search` (string): 时间搜索条件 (例如日期范围)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/GetLogs' \
-H 'Content-Type: application/json' \
-d '{
  "type": "script",
  "id": 123,
  "time_search": "2023-01-01_2023-01-31"
}'
```

### 22. 获取网站列表信息 (用于日志)
- **描述**: 获取用于日志相关功能的网站列表。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/site/get_site_list' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 23. 获取网站访问日志
- **描述**: 获取指定网站的访问日志信息。
- **参数**:
  - `siteName` (string): 网站名称。
  - `search` (string, 可选): 搜索关键字。
  - `time_search` (string, 可选): 时间搜索条件。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/site/get_site_access_logs' \
-H 'Content-Type: application/json' \
-d '{
  "siteName": "example.com",
  "search": "googlebot",
  "time_search": "2023-10-27"
}'
```

### 24. 获取网站错误日志
- **描述**: 获取指定网站的错误日志信息。
- **参数**:
  - `siteName` (string): 网站名称。
  - `search` (string, 可选): 搜索关键字。
  - `time_search` (string, 可选): 时间搜索条件。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/site/get_site_error_logs' \
-H 'Content-Type: application/json' \
-d '{
  "siteName": "example.com",
  "search": "404",
  "time_search": "2023-10-27"
}'
```

### 25. 获取网站操作日志
- **描述**: 获取通过面板对网站进行操作的日志。
- **参数**:
  - `data` (string): JSON字符串格式的请求数据。
    - `search` (string, 可选): 搜索关键字。
    - `limit` (number, 可选): 每页显示数量。
    - `p` (number, 可选): 页码。
    - `stype` (string, 可选): 列别/类型。
    - `keywords` (string, 可选): 关键字。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/panel/get_logs_bytype' \
-H 'Content-Type: application/json' \
-d '{
  "data": "{\"search\":\"修改配置\",\"limit\":10,\"p\":1,\"stype\":\"site\",\"keywords\":\"example.com\"}"
}'
```

### 26. 获取网站日志文件路径 (用于日志分析)
- **描述**: 获取指定网站的日志文件存储路径，通常用于后续的日志分析。
- **参数**:
  - `siteName` (string): 网站名称。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/site/get_site_log_file' \
-H 'Content-Type: application/json' \
-d '{
  "siteName": "example.com"
}'
```

### 27. 获取日志分析的定时任务配置
- **描述**: 获取针对特定日志路径的定时分析任务的配置信息。
- **参数**:
  - `path` (string): 日志文件的路径。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/get_cron_task' \
-H 'Content-Type: application/json' \
-d '{
  "path": "/www/wwwlogs/example.com.log"
}'
```

### 28. 设置日志分析的定时任务
- **描述**: 设置或修改针对特定日志路径的定时分析任务。
- **参数**:
  - `path` (string): 日志文件的路径。
  - `cycle` (string | number): 执行周期 (例如 "daily", "hourly", 或cron表达式)。
  - `status` (number): 任务状态 (例如 0表示禁用, 1表示启用)。
  - `channel` (string): 通道 (具体含义需参照后端实现)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/set_cron_task' \
-H 'Content-Type: application/json' \
-d '{
  "path": "/www/wwwlogs/example.com.log",
  "cycle": "daily",
  "status": 1,
  "channel": "default"
}'
```

### 29. 获取Web日志分析数据
- **描述**: 获取对Web服务器日志进行分析后的结果数据。
- **参数**:
  - `p` (number): 页码。
  - `row` (number): 每页显示数量。
  - `path` (string): 已分析的日志任务或结果对应的路径/标识。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/get_result' \
-H 'Content-Type: application/json' \
-d '{
  "p": 1,
  "row": 20,
  "path": "/www/wwwlogs/example.com.log_analysis_id"
}'
```

### 30. 执行日志分析 (扫描)
- **描述**: 触发对指定日志文件路径进行分析扫描的操作。
- **参数**:
  - `path` (string): 需要分析的日志文件路径。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/log_analysis' \
-H 'Content-Type: application/json' \
-d '{
  "path": "/www/wwwlogs/example.com.log"
}'
```

### 31. 获取网站速度日志
- **描述**: 获取与网站加载速度或性能相关的日志信息。
- **参数**:
  - `path` (string): 日志文件或相关标识的路径。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/speed_log' \
-H 'Content-Type: application/json' \
-d '{
  "path": "/www/wwwlogs/example.com.speed.log"
}'
```

### 32. 获取网站详细日志
- **描述**: 根据特定条件获取网站的详细日志条目。
- **参数**:
  - `path` (string): 日志文件路径或标识。
  - `type` (string): 查询的日志类型或维度 (例如 "ip", "url", "status_code")。
  - `time` (string | number): 时间条件 (例如具体时间点、日期、时间范围)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/get_detailed' \
-H 'Content-Type: application/json' \
-d '{
  "path": "/www/wwwlogs/example.com.log",
  "type": "ip",
  "time": "2023-10-27"
}'
```

### 33. 导出查杀日志
- **描述**: 导出文件查杀或安全扫描相关的日志。
- **参数**:
  - `type` (string): 导出类型或日志来源。
  - `day` (string): 日期或时间范围。
  - `id` (number): 相关任务或扫描的ID。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/download_logs' \
-H 'Content-Type: application/json' \
-d '{
  "type": "webshell_scan",
  "day": "2023-10-27",
  "id": 45
}'
```

### 34. 清理查杀日志
- **描述**: 清理指定条件下的文件查杀或安全扫描日志。
- **参数**:
  - `id` (number): 相关任务或扫描的ID。
  - `day` (string): 日期或时间范围，用于指定清理哪些日志。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/clear_logs' \
-H 'Content-Type: application/json' \
-d '{
  "id": 45,
  "day": "2023-10-27"
}'
```

### 35. 导出网站日志
- **描述**: 导出指定网站的日志（访问日志、错误日志等）。
- **参数**:
  - `siteName` (string): 网站名称。
  - `time_search` (string): 时间范围。
  - `logType` (string): 日志类型 (例如 "access", "error")。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/site/download_logs' \
-H 'Content-Type: application/json' \
-d '{
  "siteName": "example.com",
  "time_search": "2023-10-01_2023-10-31",
  "logType": "access"
}'
```

### 36. 清理网站日志
- **描述**: 清理指定网站在特定时间范围和类型的日志。
- **参数**:
  - `siteName` (string): 网站名称。
  - `time_search` (string): 时间范围。
  - `logType` (string): 日志类型 (例如 "access", "error", "all")。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/site/clear_logs' \
-H 'Content-Type: application/json' \
-d '{
  "siteName": "example.com",
  "time_search": "2023-09-01_2023-09-30",
  "logType": "all"
}'
```

### 37. 获取SSH日志导出路径
- **描述**: 请求导出SSH日志，并获取导出文件的路径或下载链接。
- **参数**:
  - `data` (string): JSON字符串格式的请求数据，可能包含导出条件如数量限制 `count`。
    (例如: `data: '{"count": 1000}'`)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/syslog/export_ssh_log' \
-H 'Content-Type: application/json' \
-d '{
  "data": "{\"count\":1000}"
}'
```

### 38. 清空面板登录日志
- **描述**: 清空宝塔面板的所有登录日志。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/panel/clear_panel_login_log' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 39. 获取面板登录日志
- **描述**: 获取宝塔面板的登录日志，支持搜索和分页。
- **参数**:
  - `search` (string): 搜索关键字。
  - `limit` (number): 每页显示数量。
  - `login_type` (string): 登录类型进行筛选。
  - `page` (number): 页码。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/panel/get_panel_login_log' \
-H 'Content-Type: application/json' \
-d '{
  "search": "admin_user",
  "limit": 20,
  "login_type": "success",
  "page": 1
}'
```

### 40. 导出面板操作日志 (按搜索)
- **描述**: 根据搜索条件导出宝塔面板的操作日志。
- **参数**:
  - `search` (string): 搜索关键字。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/panel/export_panel_log' \
-H 'Content-Type: application/json' \
-d '{
  "search": "删除网站"
}'
```

### 41. 获取日志采集列表
- **描述**: 获取已配置的日志发送（采集）任务列表。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/logserver/collect_list' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 42. 添加日志发送源
- **描述**: 为指定的日志服务器添加新的日志发送源。
- **参数**:
  - `server_id` (number): 日志服务器的ID。
  - `source_type` (string): 日志源类型。
  - `source_list` (string): 日志源列表 (具体格式依赖后端，可能是逗号分隔或JSON数组字符串)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/logserver/add_source' \
-H 'Content-Type: application/json' \
-d '{
  "server_id": 1,
  "source_type": "site_access_log",
  "source_list": "example.com,another.com"
}'
```

### 43. 删除日志发送源
- **描述**: 从指定的日志服务器移除日志发送源。
- **参数**:
  - `server_id` (number): 日志服务器的ID。
  - `source_type` (string): 日志源类型。
  - `source_list` (string): 要移除的日志源列表。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/logserver/remove_source' \
-H 'Content-Type: application/json' \
-d '{
  "server_id": 1,
  "source_type": "site_access_log",
  "source_list": "another.com"
}'
```

### 44. 修改日志服务器
- **描述**: 修改已存在的日志服务器配置。
- **参数**:
  - `server_data` (string): JSON字符串格式的服务器配置数据。
  - `server_id` (number, 可选): 要修改的服务器ID (如果 `server_data` 中已包含ID，则可能冗余)。
  - `server_type` (string, 可选): 服务器类型 (如果 `server_data` 中已包含类型，则可能冗余)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/logserver/modify_logserver' \
-H 'Content-Type: application/json' \
-d '{
  "server_id": 1,
  "server_data": "{\"host\":\"newlogserver.example.com\",\"port\":514}",
  "server_type": "syslog"
}'
```

### 45. 添加日志服务器
- **描述**: 添加新的日志服务器配置。
- **参数**:
  - `data` (AnyObject): 包含日志服务器配置信息的对象。具体字段依赖后端定义 (例如: `host`, `port`, `type`, `name`)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/logserver/add_logserver' \
-H 'Content-Type: application/json' \
-d '{
  "name": "My Syslog Server",
  "host": "logserver.example.com",
  "port": 514,
  "type": "syslog"
}'
```

### 46. 获取日志服务器列表
- **描述**: 获取已配置的日志服务器列表。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/logserver/server_list' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 47. 获取网站日志关键词告警状态
- **描述**: 获取指定网站的日志关键词告警配置状态。
- **参数**:
  - `sitename` (string): 网站名称。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/monitor/sitelogpush/get_site_log_push_status' \
-H 'Content-Type: application/json' \
-d '{
  "sitename": "example.com"
}'
```

### 48. 设置网站日志关键词告警
- **描述**: 设置或修改指定网站的日志关键词告警任务。
- **参数**:
  - `data` (AnyObject): 包含告警配置的对象。具体字段依赖后端定义 (例如: `sitename`, `keywords`, `push_url`, `status`)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/monitor/sitelogpush/set_push_task' \
-H 'Content-Type: application/json' \
-d '{
  "sitename": "example.com",
  "keywords": ["error", "critical", "payment failed"],
  "push_url": "http://myalertsystem.com/notify",
  "status": 1
}'
```

### 49. 导出面板域名操作日志
- **描述**: 导出与域名相关的面板操作日志。
- **参数**:
  - `search` (string): 搜索关键字，用于筛选要导出的日志。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/panel/export_domain_log' \
-H 'Content-Type: application/json' \
-d '{
  "search": "example.com"
}'
```

### 50. 删除Web分析日志
- **描述**: 删除已执行的Web日志分析任务及其结果。
- **参数**:
  - `path` (string): 要删除的日志分析任务的路径或标识。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax?action=remove_analysis' \
-H 'Content-Type: application/json' \
-d '{
  "path": "/www/wwwlogs/example.com.log_analysis_id"
}'
```

### 51. 删除软件日志
- **描述**: 删除特定类型或路径的软件日志。
- **参数**:
  - `type` (number): 日志类型标识。
  - `id` (number, 可选): 特定日志条目或任务的ID。
  - `path` (string, 可选): 日志文件的路径。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/monitor/soft/del_soft_log' \
-H 'Content-Type: application/json' \
-d '{
  "type": 1,
  "path": "/var/log/php7.4-fpm.log"
}'
```

### 52. 导出面板登录日志 (按条件)
- **描述**: 根据指定条件导出宝塔面板的登录日志。
- **参数**:
  - `data` (AnyObject): 包含导出条件的参数对象。具体字段依赖后端定义 (例如: `search_ip`, `date_range`, `login_status`)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/panel/export_penel_login_log' \
-H 'Content-Type: application/json' \
-d '{
  "search_ip": "192.168.1.100",
  "date_range": "2023-10-01_2023-10-31",
  "login_status": "failed"
}'
```

### 53. 创建SSH IP规则 (封禁IP)
- **描述**: 在系统防火墙中创建规则以封禁通过SSH登录日志发现的恶意IP。
- **参数**:
  - `data` (string): JSON字符串格式的请求数据，包含要封禁的IP地址列表及其他规则参数。
    (例如: `data: '{"ips":["1.2.3.4", "5.6.7.8"],"expire":"24h"}'`)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/syslog/create_ip_rules' \
-H 'Content-Type: application/json' \
-d '{
  "data": "{\"ips\":[\"1.2.3.4\", \"5.6.7.8\"],\"expire\":\"24h\"}"
}'
```

### 54. 移除SSH IP规则 (解封IP)
- **描述**: 从系统防火墙中移除之前为SSH登录IP设置的规则 (解封IP)。
- **参数**:
  - `data` (string): JSON字符串格式的请求数据，包含要解封的IP地址列表及其他规则参数。
    (例如: `data: '{"ips":["1.2.3.4"]}'`)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/syslog/remove_ip_rules' \
-H 'Content-Type: application/json' \
-d '{
  "data": "{\"ips\":[\"1.2.3.4\"]}"
}'
```
