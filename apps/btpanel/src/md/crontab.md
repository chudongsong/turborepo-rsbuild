# API 文档 (crontab.ts)

## 目录
1. [获取脚本列表分类](#1-获取脚本列表分类)
2. [获取脚本列表](#2-获取脚本列表)
3. [删除脚本](#3-删除脚本)
4. [创建脚本](#4-创建脚本)
5. [修改脚本](#5-修改脚本)
6. [获取脚本日志](#6-获取脚本日志)
7. [测试脚本](#7-测试脚本)
8. [获取任务列表](#8-获取任务列表)
9. [删除任务](#9-删除任务)
10. [获取任务日志](#10-获取任务日志)
11. [执行任务](#11-执行任务)
12. [删除后置位任务](#12-删除后置位任务)
13. [获取后置位任务列表](#13-获取后置位任务列表)
14. [获取后置位任务日志](#14-获取后置位任务日志)
15. [修改后置位任务](#15-修改后置位任务)
16. [创建后置位任务](#16-创建后置位任务)
17. [获取任务列表 所有](#17-获取任务列表-所有)
18. [排序任务列表](#18-排序任务列表)
19. [添加任务分类](#19-添加任务分类)
20. [修改任务分类名称](#20-修改任务分类名称)
21. [删除任务分类](#21-删除任务分类)
22. [获取任务编排分类数据](#22-获取任务编排分类数据)
23. [设置任务状态](#23-设置任务状态)
24. [设置任务分类数据](#24-设置任务分类数据)
25. [修改任务](#25-修改任务)
26. [创建任务](#26-创建任务)
27. [获取任务列表 (GetCrontab)](#27-获取任务列表-getcrontab)
28. [获取服务状态](#28-获取服务状态)
29. [获取任务分类数据 (get_crontab_types)](#29-获取任务分类数据-get_crontab_types)
30. [执行任务 (StartTask)](#30-执行任务-starttask)
31. [批量设置任务状态](#31-批量设置任务状态)
32. [导出任务](#32-导出任务)
33. [删除计划任务](#33-删除计划任务)
34. [设置任务分类数据 (set_crontab_type)](#34-设置任务分类数据-set_crontab_type)
35. [单个执行任务 (crontabDelCrontab)](#35-单个执行任务-crontabdelcrontab)
36. [获取备份目录](#36-获取备份目录)
37. [获取日志路径](#37-获取日志路径)
38. [获取任务执行日志](#38-获取任务执行日志)
39. [清空任务执行日志](#39-清空任务执行日志)
40. [修改任务执行状态](#40-修改任务执行状态)
41. [获取置顶列表+设置置顶](#41-获取置顶列表设置置顶)
42. [获取置顶列表+取消设置置顶](#42-获取置顶列表取消设置置顶)
43. [获取任务类型](#43-获取任务类型)
44. [获取备份文件信息列表](#44-获取备份文件信息列表)
45. [计划任务-获取日志切割配置](#45-计划任务-获取日志切割配置)
46. [设置日志配置](#46-设置日志配置)
47. [设置日志切割状态](#47-设置日志切割状态)
48. [获取系统用户列表](#48-获取系统用户列表)
49. [获取数据库列表 (GetDatabases)](#49-获取数据库列表-getdatabases)
50. [获取数据库列表 (get_zone)](#50-获取数据库列表-get_zone)
51. [添加计划任务](#51-添加计划任务)
52. [修改计划任务](#52-修改计划任务)
53. [添加任务分类 (add_crontab_type)](#53-添加任务分类-add_crontab_type)
54. [修改任务分类名称 (modify_crontab_type_name)](#54-修改任务分类名称-modify_crontab_type_name)
55. [删除任务分类 (remove_crontab_type)](#55-删除任务分类-remove_crontab_type)
56. [计划任务添加-添加数据库增量备份](#56-计划任务添加-添加数据库增量备份)
57. [企业增量备份查询备份数据库选项](#57-企业增量备份查询备份数据库选项)
58. [检查url是否可连接](#58-检查url是否可连接)
59. [计划任务编辑-修改数据库增量备份](#59-计划任务编辑-修改数据库增量备份)
60. [设置系统加固临时放行](#60-设置系统加固临时放行)
61. [获取网站站点和网站备份目标云厂商类型数据](#61-获取网站站点和网站备份目标云厂商类型数据)
62. [获取数据库列表 (get_databases_binlog)](#62-获取数据库列表-get_databases_binlog)

---

## API 列表

### 1. 获取脚本列表分类
- **描述**: 获取脚本列表分类
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/script/get_script_list_by_type' \
-H 'Content-Type: application/json'
```

### 2. 获取脚本列表
- **描述**: 获取脚本列表
- **参数**:
  - `p` (number)
  - `rows` (number)
  - `type` (string)
  - `search` (string)
  - `type_id` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/script/get_script_list' \
-H 'Content-Type: application/json' \
-d '{
  "data": "{\"p\":your_p_value,\"rows\":your_rows_value,\"type\":\"your_type_value\",\"search\":\"your_search_value\",\"type_id\":\"your_type_id_value\"}"
}'
```

### 3. 删除脚本
- **描述**: 删除脚本
- **参数**:
  - `script_id` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/script/remove_script' \
-H 'Content-Type: application/json' \
-d '{
  "script_id": your_script_id_value
}'
```

### 4. 创建脚本
- **描述**: 创建脚本
- **参数**: (AnyObject - 参数为空)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/script/create_script' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 5. 修改脚本
- **描述**: 修改脚本
- **参数**: (AnyObject - 参数为空)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/script/modify_script' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 6. 获取脚本日志
- **描述**: 获取脚本日志
- **参数**:
  - `script_id` (number)
  - `p` (number)
  - `rows` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/script/get_script_logs' \
-H 'Content-Type: application/json' \
-d '{
  "data": "{\"script_id\":your_script_id_value,\"p\":your_p_value,\"rows\":your_rows_value}"
}'
```

### 7. 测试脚本
- **描述**: 测试脚本
- **参数**:
  - `script_id` (string) (脚本id)
  - `args` (string) (脚本内容)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/script/test_script' \
-H 'Content-Type: application/json' \
-d '{
  "data": "{\"script_id\":\"your_script_id_value\",\"args\":\"your_args_value\"}"
}'
```

### 8. 获取任务列表
- **描述**: 获取任务列表
- **参数**:
  - `p` (number) (页码)
  - `rows` (number) (每页数量)
  - `search` (string) (搜索关键字)
  - `order_param` (string) (排序字段)
  - `type_id` (number) (类型id)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/trigger/get_trigger_list' \
-H 'Content-Type: application/json' \
-d '{
  "data": "{\"p\":your_p_value,\"rows\":your_rows_value,\"search\":\"your_search_value\",\"order_param\":\"your_order_param_value\",\"type_id\":your_type_id_value}"
}'
```

### 9. 删除任务
- **描述**: 删除任务
- **参数**:
  - `trigger_id` (number) (任务id)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/trigger/remove_trigger' \
-H 'Content-Type: application/json' \
-d '{
  "trigger_id": your_trigger_id_value
}'
```

### 10. 获取任务日志
- **描述**: 获取任务日志
- **参数**:
  - `trigger_id` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/trigger/get_trigger_logs' \
-H 'Content-Type: application/json' \
-d '{
  "trigger_id": your_trigger_id_value
}'
```

### 11. 执行任务
- **描述**: 执行任务
- **参数**:
  - `trigger_id` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/trigger/test_trigger' \
-H 'Content-Type: application/json' \
-d '{
  "data": "{\"trigger_id\":your_trigger_id_value}"
}'
```

### 12. 删除后置位任务
- **描述**: 删除后置位任务
- **参数**:
  - `where_id` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/trigger/remove_operator_where' \
-H 'Content-Type: application/json' \
-d '{
  "where_id": your_where_id_value
}'
```

### 13. 获取后置位任务列表
- **描述**: 获取后置位任务列表
- **参数**:
  - `trigger_id` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/trigger/get_operator_where_list' \
-H 'Content-Type: application/json' \
-d '{
  "trigger_id": your_trigger_id_value
}'
```

### 14. 获取后置位任务日志
- **描述**: 获取后置位任务日志
- **参数**:
  - `where_id` (number) (后置位任务id)
  - `p` (number) (页码)
  - `rows` (number) (每页数量)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/trigger/get_operator_logs' \
-H 'Content-Type: application/json' \
-d '{
  "data": "{\"where_id\":your_where_id_value,\"p\":your_p_value,\"rows\":your_rows_value}"
}'
```

### 15. 修改后置位任务
- **描述**: 修改后置位任务
- **参数**:
  - `run_script_id` (number)
  - `operator` (string)
  - `op_value` (string)
  - `run_script` (string)
  - `trigger_id` (number, 可选)
  - `args` (string)
  - `where_id` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/trigger/modify_operator_where' \
-H 'Content-Type: application/json' \
-d '{
  "data": "{\"run_script_id\":your_run_script_id_value,\"operator\":\"your_operator_value\",\"op_value\":\"your_op_value_value\",\"run_script\":\"your_run_script_value\",\"trigger_id\":your_trigger_id_value,\"args\":\"your_args_value\",\"where_id\":your_where_id_value}"
}'
```

### 16. 创建后置位任务
- **描述**: 创建后置位任务
- **参数**:
  - `run_script_id` (number)
  - `operator` (string)
  - `op_value` (string)
  - `run_script` (string)
  - `trigger_id` (number, 可选)
  - `args` (string)
  - `where_id` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/trigger/create_operator_where' \
-H 'Content-Type: application/json' \
-d '{
  "data": "{\"run_script_id\":your_run_script_id_value,\"operator\":\"your_operator_value\",\"op_value\":\"your_op_value_value\",\"run_script\":\"your_run_script_value\",\"trigger_id\":your_trigger_id_value,\"args\":\"your_args_value\",\"where_id\":your_where_id_value}"
}'
```

### 17. 获取任务列表 所有
- **描述**: 获取任务列表 所有
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/trigger/get_trigger_list_all' \
-H 'Content-Type: application/json'
```

### 18. 排序任务列表
- **描述**: 排序任务列表
- **参数**:
  - `order_list` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/trigger/save_custom_order' \
-H 'Content-Type: application/json' \
-d '{
  "order_list": "your_order_list_value"
}'
```

### 19. 添加任务分类
- **描述**: 添加任务分类
- **参数**:
  - `name` (string) (任务分类名称)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/trigger/add_trigger_type' \
-H 'Content-Type: application/json' \
-d '{
  "name": "your_name_value"
}'
```

### 20. 修改任务分类名称
- **描述**: 修改任务分类名称
- **参数**:
  - `id` (number) (任务分类id)
  - `name` (string) (任务分类名称)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/trigger/modify_trigger_type_name' \
-H 'Content-Type: application/json' \
-d '{
  "id": your_id_value,
  "name": "your_name_value"
}'
```

### 21. 删除任务分类
- **描述**: 删除任务分类
- **参数**:
  - `id` (number) (任务分类id)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/trigger/remove_trigger_type' \
-H 'Content-Type: application/json' \
-d '{
  "id": your_id_value
}'
```

### 22. 获取任务编排分类数据
- **描述**: 获取任务编排分类数据
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/trigger/get_trigger_types' \
-H 'Content-Type: application/json'
```

### 23. 设置任务状态
- **描述**: 设置任务状态
- **参数**:
  - `trigger_id` (number) (任务id)
  - `status` (number) (任务状态)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/trigger/set_trigger_status' \
-H 'Content-Type: application/json' \
-d '{
  "trigger_id": your_trigger_id_value,
  "status": your_status_value
}'
```

### 24. 设置任务分类数据
- **描述**: 设置任务分类数据
- **参数**:
  - `id` (number | string)
  - `trigger_ids` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/trigger/set_trigger_type' \
-H 'Content-Type: application/json' \
-d '{
  "id": "your_id_value",
  "trigger_ids": "your_trigger_ids_value"
}'
```

### 25. 修改任务
- **描述**: 修改任务
- **参数**: (AnyObject - 参数为空)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/trigger/modify_trigger' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 26. 创建任务
- **描述**: 创建任务
- **参数**: (AnyObject - 参数为空)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/trigger/create_trigger' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 27. 获取任务列表 (GetCrontab)
- **描述**: 获取任务列表
- **参数**:
  - `type_id` (number | string, 可选) (任务类型ID)
  - `search` (string, 可选) (搜索关键字)
  - `order_param` (string, 可选)
  - `count` (number, 可选)
  - `p` (number, 可选)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/GetCrontab' \
-H 'Content-Type: application/json' \
-d '{
  "type_id": "your_type_id_value",
  "search": "your_search_value",
  "order_param": "your_order_param_value",
  "count": your_count_value,
  "p": your_p_value
}'
```

### 28. 获取服务状态
- **描述**: 获取服务状态
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/get_crontab_service' \
-H 'Content-Type: application/json'
```

### 29. 获取任务分类数据 (get_crontab_types)
- **描述**: 获取任务分类数据
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/get_crontab_types' \
-H 'Content-Type: application/json'
```

### 30. 执行任务 (StartTask)
- **描述**: 执行任务
- **参数**:
  - `id` (string | number) (任务ID)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/StartTask' \
-H 'Content-Type: application/json' \
-d '{
  "id": "your_id_value"
}'
```

### 31. 批量设置任务状态
- **描述**: 批量设置任务状态
- **参数**:
  - `id_list` (string)
  - `type` (string)
  - `if_stop` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/set_cron_status_all' \
-H 'Content-Type: application/json' \
-d '{
  "id_list": "your_id_list_value",
  "type": "your_type_value",
  "if_stop": "your_if_stop_value"
}'
```

### 32. 导出任务
- **描述**: 导出任务
- **参数**:
  - `ids` (string, 可选)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/export_crontab_to_json' \
-H 'Content-Type: application/json' \
-d '{
  "ids": "your_ids_value"
}'
```

### 33. 删除计划任务
- **描述**: 删除计划任务
- **参数**:
  - `id` (number) (任务id)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/DelCrontab' \
-H 'Content-Type: application/json' \
-d '{
  "id": your_id_value
}'
```

### 34. 设置任务分类数据 (set_crontab_type)
- **描述**: 设置任务分类数据
- **参数**:
  - `id` (number | string)
  - `crontab_ids` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/set_crontab_type' \
-H 'Content-Type: application/json' \
-d '{
  "id": "your_id_value",
  "crontab_ids": "your_crontab_ids_value"
}'
```

### 35. 单个执行任务 (crontabDelCrontab)
- **描述**: 删除计划任务 (注: 函数名crontabDelCrontab，但描述为删除，路径为DelCrontab，与 #33 接口相同)
- **参数**:
  - `id` (number) (任务ID)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/DelCrontab' \
-H 'Content-Type: application/json' \
-d '{
  "id": your_id_value
}'
```

### 36. 获取备份目录
- **描述**: 获取备份目录
- **参数**:
  - `id` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/get_local_backup_path' \
-H 'Content-Type: application/json' \
-d '{
  "id": your_id_value
}'
```

### 37. 获取日志路径
- **描述**: 获取日志路径
- **参数**:
  - `id` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/get_log_path' \
-H 'Content-Type: application/json' \
-d '{
  "id": your_id_value
}'
```

### 38. 获取任务执行日志
- **描述**: 获取任务执行日志
- **参数**:
  - `id` (number)
  - `start_timestamp` (number)
  - `end_timestamp` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/GetLogs' \
-H 'Content-Type: application/json' \
-d '{
  "id": your_id_value,
  "start_timestamp": your_start_timestamp_value,
  "end_timestamp": your_end_timestamp_value
}'
```

### 39. 清空任务执行日志
- **描述**: 清空任务执行日志
- **参数**:
  - `id` (number) (任务ID)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/DelLogs' \
-H 'Content-Type: application/json' \
-d '{
  "id": your_id_value
}'
```

### 40. 修改任务执行状态
- **描述**: 修改任务执行状态
- **参数**:
  - `id` (number) (任务id)
  - `if_stop` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/set_cron_status' \
-H 'Content-Type: application/json' \
-d '{
  "id": your_id_value,
  "if_stop": "your_if_stop_value"
}'
```

### 41. 获取置顶列表+设置置顶
- **描述**: 获取置顶列表+设置置顶
- **参数**:
  - `task_id` (number, 可选)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/set_task_top' \
-H 'Content-Type: application/json' \
-d '{
  "task_id": your_task_id_value
}'
```

### 42. 获取置顶列表+取消设置置顶
- **描述**: 获取置顶列表+取消设置置顶
- **参数**:
  - `task_id` (number, 可选)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/cancel_top' \
-H 'Content-Type: application/json' \
-d '{
  "task_id": your_task_id_value
}'
```

### 43. 获取任务类型
- **描述**: 获取任务类型 (注: 函数名 backupDownload, 实际为下载备份)
- **参数**:
  - `cron_id` (number)
  - `filename` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/cloud_backup_download' \
-H 'Content-Type: application/json' \
-d '{
  "cron_id": your_cron_id_value,
  "filename": "your_filename_value"
}'
```

### 44. 获取备份文件信息列表
- **描述**: 获取备份文件信息列表
- **参数**:
  - `cron_id` (number) (任务id)
  - `p` (number)
  - `rows` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/get_backup_list' \
-H 'Content-Type: application/json' \
-d '{
  "cron_id": your_cron_id_value,
  "p": your_p_value,
  "rows": your_rows_value
}'
```

### 45. 计划任务-获取日志切割配置
- **描述**: 计划任务-获取日志切割配置
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/get_rotate_log_config' \
-H 'Content-Type: application/json'
```

### 46. 设置日志配置
- **描述**: 设置日志配置
- **参数**:
  - `status` (number)
  - `compress` (number)
  - `num` (number)
  - `log_size` (number)
  - `hour` (number)
  - `minute` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/set_rotate_log' \
-H 'Content-Type: application/json' \
-d '{
  "status": your_status_value,
  "compress": your_compress_value,
  "num": your_num_value,
  "log_size": your_log_size_value,
  "hour": your_hour_value,
  "minute": your_minute_value
}'
```

### 47. 设置日志切割状态
- **描述**: 设置日志切割状态
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/set_rotate_log_status' \
-H 'Content-Type: application/json'
```

### 48. 获取系统用户列表
- **描述**: 获取系统用户列表
- **参数**:
  - `all_user` (boolean)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/get_system_user_list' \
-H 'Content-Type: application/json' \
-d '{
  "all_user": your_all_user_value
}'
```

### 49. 获取数据库列表 (GetDatabases)
- **描述**: 获取数据库列表
- **参数**: (AnyObject - 参数为空)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/GetDatabases' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 50. 获取数据库列表 (get_zone)
- **描述**: 获取数据库列表
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/get_zone' \
-H 'Content-Type: application/json'
```

### 51. 添加计划任务
- **描述**: 添加计划任务
- **参数**: (any - 参照 CrontabSubmitForm, 此处作为空对象)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/AddCrontab' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 52. 修改计划任务
- **描述**: 修改计划任务
- **参数**: (any - 参数为空)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/modify_crond' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 53. 添加任务分类 (add_crontab_type)
- **描述**: 添加任务分类
- **参数**:
  - `name` (string) (任务分类名称)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/add_crontab_type' \
-H 'Content-Type: application/json' \
-d '{
  "name": "your_name_value"
}'
```

### 54. 修改任务分类名称 (modify_crontab_type_name)
- **描述**: 修改任务分类名称
- **参数**:
  - `id` (number) (任务分类id)
  - `name` (string) (任务分类名称)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/modify_crontab_type_name' \
-H 'Content-Type: application/json' \
-d '{
  "id": your_id_value,
  "name": "your_name_value"
}'
```

### 55. 删除任务分类 (remove_crontab_type)
- **描述**: 删除任务分类
- **参数**:
  - `id` (number) (任务分类id)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/remove_crontab_type' \
-H 'Content-Type: application/json' \
-d '{
  "id": your_id_value
}'
```

### 56. 计划任务添加-添加数据库增量备份
- **描述**: 计划任务添加-添加数据库增量备份
- **参数**: (AnyObject - 参数为空)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/binlog/add_mysql_increment_crontab' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 57. 企业增量备份查询备份数据库选项
- **描述**: 企业增量备份查询备份数据库选项
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/get_databases' \
-H 'Content-Type: application/json'
```

### 58. 检查url是否可连接
- **描述**: 检查url是否可连接
- **参数**: (AnyObject - 参数为空)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/check_url_connecte' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 59. 计划任务编辑-修改数据库增量备份
- **描述**: 计划任务编辑-修改数据库增量备份
- **参数**: (AnyObject - 参数为空)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/binlog/modify_mysql_increment_crontab' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 60. 设置系统加固临时放行
- **描述**: 设置系统加固临时放行
- **参数**:
  - `time` (number, 可选) (当下时间戳)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/set_atuo_start_syssafe' \
-H 'Content-Type: application/json' \
-d '{
  "time": your_time_value
}'
```

### 61. 获取网站站点和网站备份目标云厂商类型数据
- **描述**: 获取网站站点和网站备份目标云厂商类型数据
- **参数**: (AnyObject - 参数 `{type:'site' || 'databases'}`)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/GetDataList' \
-H 'Content-Type: application/json' \
-d '{
  "type": "your_type_value"
}'
```

### 62. 获取数据库列表 (get_databases_binlog)
- **描述**: 获取数据库列表
- **参数**: (AnyObject - 参数为空)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/binlog/get_databases' \
-H 'Content-Type: application/json' \
-d '{}'
```
