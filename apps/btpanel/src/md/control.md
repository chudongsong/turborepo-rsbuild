# API 文档 (control.ts)

## 目录
1. [设置监控状态](#1-设置监控状态)
2. [获取CPU/内存监控信息](#2-获取cpu内存监控信息)
3. [获取磁盘信息](#3-获取磁盘信息)
4. [获取网络信息](#4-获取网络信息)
5. [获取平均负载信息](#5-获取平均负载信息)
6. [获取进程信息](#6-获取进程信息)
7. [获取面板日报信息数据](#7-获取面板日报信息数据)
8. [获取面板日报的时间](#8-获取面板日报的时间)
9. [设置插件的启动与关闭](#9-设置插件的启动与关闭)
10. [获取插件的状态](#10-获取插件的状态)
11. [获取网络IO每天总流量统计](#11-获取网络io每天总流量统计)
12. [获取日报状态](#12-获取日报状态)
13. [设置日报状态](#13-设置日报状态)

---

## API 列表

### 1. 设置监控状态
- **描述**: 获取控制信息
- **参数**:
  - `type` (string)
  - `day` (number, 可选)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/SetControl' \
-H 'Content-Type: application/json' \
-d '{
  "type": "your_type_value",
  "day": "your_day_value"
}'
```

### 2. 获取CPU/内存监控信息
- **描述**: 获取cpu/内存监控信息
- **参数**:
  - `start` (number)
  - `end` (number, 可选)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/GetCpuIo' \
-H 'Content-Type: application/json' \
-d '{
  "start": "your_start_value",
  "end": "your_end_value"
}'
```

### 3. 获取磁盘信息
- **描述**: 获取磁盘信息
- **参数**:
  - `start` (number)
  - `end` (number, 可选)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/GetDiskIo' \
-H 'Content-Type: application/json' \
-d '{
  "start": "your_start_value",
  "end": "your_end_value"
}'
```

### 4. 获取网络信息
- **描述**: 获取网络信息
- **参数**:
  - `start` (number)
  - `end` (number, 可选)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/GetNetWorkIo' \
-H 'Content-Type: application/json' \
-d '{
  "start": "your_start_value",
  "end": "your_end_value"
}'
```

### 5. 获取平均负载信息
- **描述**: 获取平均负载信息
- **参数**:
  - `start` (number)
  - `end` (number, 可选)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/get_load_average' \
-H 'Content-Type: application/json' \
-d '{
  "start": "your_start_value",
  "end": "your_end_value"
}'
```

### 6. 获取进程信息
- **描述**: 获取进程信息
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/system/GetNetWork' \
-H 'Content-Type: application/json'
```

### 7. 获取面板日报信息数据
- **描述**: 获取面板日报信息数据
- **参数**:
  - `date` (string) (例如: "20230524")
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/daily/get_daily_data' \
-H 'Content-Type: application/json' \
-d '{
  "date": "your_date_value"
}'
```

### 8. 获取面板日报的时间
- **描述**: 获取面板日报的时间
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/daily/get_daily_list' \
-H 'Content-Type: application/json'
```

### 9. 设置插件的启动与关闭
- **描述**: 设置插件的启动与关闭
- **参数**:
  - `option` (number) (0: 关闭, 1: 启动, 2: 重启服务器)
  - `name` (string) (例如: "mysqld_safe", "nginx")
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/monitor/soft/sever_admin' \
-H 'Content-Type: application/json' \
-d '{
  "option": "your_option_value",
  "name": "your_name_value"
}'
```

### 10. 获取插件的状态
- **描述**: 获取插件的状态
- **参数**:
  - `type` (string) (插件名称)
  - `p` (number) (docker信息的当前页, 仅docker插件需要)
  - `limit` (number) (docker信息的一页多少条)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/monitor/soft/get_status' \
-H 'Content-Type: application/json' \
-d '{
  "type": "your_type_value",
  "p": "your_p_value",
  "limit": "your_limit_value"
}'
```

### 11. 获取网络IO每天总流量统计
- **描述**: 获取网络IO每天总流量统计
- **参数**: (AnyObject - 参数为空)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/GetNetWorkIoByDay' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 12. 获取日报状态
- **描述**: 获取日报状态
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/daily/check_daily_status' \
-H 'Content-Type: application/json'
```

### 13. 设置日报状态
- **描述**: 设置日报状态
- **参数**:
  - `status` (string) ("start": 开始, "stop": 停止)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/daily/set_daily_status' \
-H 'Content-Type: application/json' \
-d '{
  "status": "your_status_value"
}'
```
