# API 文档 (files.ts)

## 目录
1. [获取文件内容](#1-获取文件内容)
2. [获取文件列表](#2-获取文件列表)
3. [获取文件对应的目录列表](#3-获取文件对应的目录列表)
4. [文件重命名](#4-文件重命名)
5. [新建文件/文件夹](#5-新建文件文件夹)
6. [删除文件/文件夹](#6-删除文件文件夹)
7. [添加收藏](#7-添加收藏)
8. [取消收藏](#8-取消收藏)
9. [文件置顶/取消置顶](#9-文件置顶取消置顶)
10. [检查文件是否存在](#10-检查文件是否存在)
11. [复制文件](#11-复制文件)
12. [剪切文件](#12-剪切文件)
13. [创建副本](#13-创建副本)
14. [获取磁盘分区列表](#14-获取磁盘分区列表)
15. [获取收藏列表](#15-获取收藏列表)
16. [获取分享列表](#16-获取分享列表)
17. [获取回收站数据](#17-获取回收站数据)
18. [设置回收站状态](#18-设置回收站状态)
19. [清空回收站](#19-清空回收站)
20. [回收站恢复文件](#20-回收站恢复文件)
21. [回收站删除文件](#21-回收站删除文件)
22. [回收站批量删除数据库](#22-回收站批量删除数据库)
23. [回收站下载文件](#23-回收站下载文件)
24. [获取zip压缩包内文件列表](#24-获取zip压缩包内文件列表)
25. [获取tar.gz压缩包内文件列表](#25-获取targz压缩包内文件列表)
26. [切割文件](#26-切割文件)
27. [获取切割文件信息](#27-获取切割文件信息)
28. [合并文件](#28-合并文件)
29. [外链分享文件](#29-外链分享文件)
30. [获取分享文件详情](#30-获取分享文件详情)
31. [关闭外链分享](#31-关闭外链分享)
32. [监听日志](#32-监听日志)
33. [压缩文件](#33-压缩文件)
34. [压缩并下载文件](#34-压缩并下载文件)
35. [解压文件](#35-解压文件)
36. [获取邮箱信息](#36-获取邮箱信息)
37. [发送到邮箱](#37-发送到邮箱)
38. [获取文件属性 (get_file_attribute)](#38-获取文件属性-get_file_attribute)
39. [获取文件历史版本内容 (re_history)](#39-获取文件历史版本内容-re_history)
40. [获取文件权限](#40-获取文件权限)
41. [设置文件权限](#41-设置文件权限)
42. [导入数据库](#42-导入数据库)
43. [zip压缩包提交文件](#43-zip压缩包提交文件)
44. [tar.gz压缩包提交文件](#44-targz压缩包提交文件)
45. [zip压缩包获取文件详情](#45-zip压缩包获取文件详情)
46. [tar.gz压缩包获取文件详情](#46-targz压缩包获取文件详情)
47. [zip压缩包保存文件](#47-zip压缩包保存文件)
48. [tar.gz压缩包保存文件](#48-targz压缩包保存文件)
49. [zip压缩包解压文件](#49-zip压缩包解压文件)
50. [tar.gz压缩包解压文件](#50-targz压缩包解压文件)
51. [zip压缩包删除文件](#51-zip压缩包删除文件)
52. [tar.gz压缩包删除文件](#52-targz压缩包删除文件)
53. [格式转换获取可转换的格式](#53-格式转换获取可转换的格式)
54. [格式转换](#54-格式转换)
55. [下载文件](#55-下载文件)
56. [计算目录大小](#56-计算目录大小)
57. [设置备注](#57-设置备注)
58. [文件同步-增加接收端](#58-文件同步-增加接收端)
59. [添加文件同步规则 (files/add_files_rsync)](#59-添加文件同步规则-filesadd_files_rsync)
60. [文件同步-增加发送端](#60-文件同步-增加发送端)
61. [文件历史](#61-文件历史)
62. [文件操作记录](#62-文件操作记录)
63. [文件历史删除](#63-文件历史删除)
64. [批量操作文件](#64-批量操作文件)
65. [批量粘贴文件](#65-批量粘贴文件)
66. [企业防篡改-获取有效路径](#66-企业防篡改-获取有效路径)
67. [企业防篡改-设置全局状态](#67-企业防篡改-设置全局状态)
68. [上传文件是否存在 (upload_files_exists)](#68-上传文件是否存在-upload_files_exists)
69. [添加文件防篡改 (batch_setting.json)](#69-添加文件防篡改-batch_settingjson)
70. [创建防篡改路径 (create_path.json)](#70-创建防篡改路径-create_pathjson)
71. [批量设置文件防篡改](#71-批量设置文件防篡改)
72. [获取文件缩略图列表](#72-获取文件缩略图列表)
73. [获取文件播放列表](#73-获取文件播放列表)
74. [获取文件当前目录大小](#74-获取文件当前目录大小)
75. [获取当前文件计算状态](#75-获取当前文件计算状态)
76. [创建软链接](#76-创建软链接)
77. [获取格式转换操作列表](#77-获取格式转换操作列表)
78. [测试路径](#78-测试路径)
79. [设置文件历史](#79-设置文件历史)
80. [获取当前目录下全文件大小](#80-获取当前目录下全文件大小)
81. [获取文件历史内容 (read_history)](#81-获取文件历史内容-read_history)
82. [删除文件历史 (del_history)](#82-删除文件历史-del_history)
83. [获取云存储配置](#83-获取云存储配置)
84. [获取云存储文件列表](#84-获取云存储文件列表)
85. [上传/下载云存储文件](#85-上传下载云存储文件)

---

## API 列表

### 1. 获取文件内容
- **描述**: 获取文件内容
- **参数**:
  - `path` (string)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/GetFileBody' \
-H 'Content-Type: application/json' \
-d '{
  "path": "your_path_value"
}'
```

### 2. 获取文件列表
- **描述**: 获取文件列表
- **参数**: (TableParamsProps - 包含 p, limit, search, path, show_all, sort, reverse, type,pid 等)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/GetDirNew' \
-H 'Content-Type: application/json' \
-d '{
  "p": 1,
  "limit": 10,
  "search": "your_search_keyword",
  "path": "/your/target/path",
  "show_all": true,
  "sort": "name",
  "reverse": false,
  "type": "all",
  "pid": "your_pid_value"
}'
```

### 3. 获取文件对应的目录列表
- **描述**: 获取文件对应的目录列表
- **参数**: (TableParamsProps - 包含 p, limit, search, path, show_all, sort, reverse, type,pid 等)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files?action=GetDirNew&tojs=GetFiles' \
-H 'Content-Type: application/json' \
-d '{
  "p": 1,
  "limit": 10,
  "search": "your_search_keyword",
  "path": "/your/target/path",
  "show_all": true,
  "sort": "name",
  "reverse": false,
  "type": "all",
  "pid": "your_pid_value"
}'
```

### 4. 文件重命名
- **描述**: 文件重命名
- **参数**:
  - `sfile` (string) (旧名称路径)
  - `dfile` (string) (新名称路径)
  - `rename` (boolean)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/MvFile' \
-H 'Content-Type: application/json' \
-d '{
  "sfile": "your_sfile_value",
  "dfile": "your_dfile_value",
  "rename": true
}'
```

### 5. 新建文件/文件夹
- **描述**: 新建文件/文件夹
- **参数**:
  - `path` (string) (新建文件/文件夹路径)
  - `type` (string) ('dir' 或 'file')
- **cURL (新建文件夹)**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/CreateDir' \
-H 'Content-Type: application/json' \
-d '{
  "path": "your_path_value"
}'
```
- **cURL (新建文件)**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/CreateFile' \
-H 'Content-Type: application/json' \
-d '{
  "path": "your_path_value"
}'
```

### 6. 删除文件/文件夹
- **描述**: 删除文件/文件夹
- **参数**:
  - `path` (string) (删除文件/文件夹路径)
  - `type` (string, 可选) ('dir' 或 'file')
- **cURL (删除文件夹)**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/DeleteDir' \
-H 'Content-Type: application/json' \
-d '{
  "path": "your_path_value"
}'
```
- **cURL (删除文件)**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/DeleteFile' \
-H 'Content-Type: application/json' \
-d '{
  "path": "your_path_value"
}'
```

### 7. 添加收藏
- **描述**: 添加收藏
- **参数**:
  - `path` (string) (文件/文件夹路径)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/add_files_store' \
-H 'Content-Type: application/json' \
-d '{
  "path": "your_path_value"
}'
```

### 8. 取消收藏
- **描述**: 取消收藏
- **参数**:
  - `path` (string) (文件/文件夹路径)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/del_files_store' \
-H 'Content-Type: application/json' \
-d '{
  "path": "your_path_value"
}'
```

### 9. 文件置顶/取消置顶
- **描述**: 文件置顶/取消置顶
- **参数**:
  - `path` (string) (文件/文件夹路径)
  - `type` (string) ('set'置顶 'unset'取消置顶)
- **cURL (置顶)**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/logs/set_topping_status' \
-H 'Content-Type: application/json' \
-d '{
  "sfile": "your_path_value",
  "status": 1
}'
```
- **cURL (取消置顶)**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/logs/set_topping_status' \
-H 'Content-Type: application/json' \
-d '{
  "sfile": "your_path_value",
  "status": 0
}'
```

### 10. 检查文件是否存在
- **描述**: 检查文件是否存在（复制文件和文件夹前需要调用）
- **参数**:
  - `path` (string) (文件/文件夹路径(不包含文件名) 或 完整目标文件路径)
  - `name` (string, 可选) (文件名，如果提供path则为目标目录)
- **cURL (检查目标文件是否存在)**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/CheckExistsFiles' \
-H 'Content-Type: application/json' \
-d '{
  "dfile": "your_path_value"
}'
```
- **cURL (检查目标目录中是否存在同名文件)**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/CheckExistsFiles' \
-H 'Content-Type: application/json' \
-d '{
  "dfile": "your_path_value",
  "filename": "your_name_value"
}'
```

### 11. 复制文件
- **描述**: 复制文件（文件和文件夹）
- **参数**:
  - `sfile` (string) (旧名称路径)
  - `dfile` (string) (新名称路径)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/CopyFile' \
-H 'Content-Type: application/json' \
-d '{
  "sfile": "your_sfile_value",
  "dfile": "your_dfile_value"
}'
```

### 12. 剪切文件
- **描述**: 剪切文件（文件和文件夹）
- **参数**:
  - `sfile` (string) (旧名称路径)
  - `dfile` (string) (新名称路径)
  - `rename` (boolean, 可选)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/MvFile' \
-H 'Content-Type: application/json' \
-d '{
  "sfile": "your_sfile_value",
  "dfile": "your_dfile_value",
  "rename": false
}'
```

### 13. 创建副本
- **描述**: 创建副本
- **参数**:
  - `path` (string) (文件路径)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/logs/copy_file_to' \
-H 'Content-Type: application/json' \
-d '{
  "sfile": "your_path_value"
}'
```

### 14. 获取磁盘分区列表
- **描述**: 获取磁盘分区列表
- **参数**: 无
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/system/GetDiskInfo' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 15. 获取收藏列表
- **描述**: 获取收藏列表
- **参数**: 无
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/get_files_store' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 16. 获取分享列表
- **描述**: 获取分享列表
- **参数**: (AnyObject - 通常包含 p，其他参数未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/get_download_url_list' \
-H 'Content-Type: application/json' \
-d '{
  "p": 1
}'
```

### 17. 获取回收站数据
- **描述**: 获取回收站数据
- **参数**:
  - `type` (string, 可选) (类型)
  - `p` (number, 可选) (页码)
  - `limit` (number, 可选) (每页条数)
  - `search` (string, 可选) (搜索关键字)
  - `time_search` (Array<number>, 可选) (时间搜索)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/Get_Recycle_bin' \
-H 'Content-Type: application/json' \
-d '{
  "type": "your_type_value",
  "p": 1,
  "limit": 10,
  "search": "your_search_value",
  "time_search": []
}'
```

### 18. 设置回收站状态
- **描述**: 设置回收站状态
- **参数**: (AnyObject, 可选 - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/Recycle_bin' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 19. 清空回收站
- **描述**: 清空回收站
- **参数**:
  - `force` (number, 可选)
  - `type` (string)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/Close_Recycle_bin_new' \
-H 'Content-Type: application/json' \
-d '{
  "force": 0,
  "type": "your_type_value"
}'
```

### 20. 回收站恢复文件
- **描述**: 回收站恢复文件
- **参数**:
  - `path` (string) (恢复前的rname)
  - `rpath` (string) (恢复到的完整路径)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/Re_Recycle_bin' \
-H 'Content-Type: application/json' \
-d '{
  "path": "your_path_value",
  "rpath": "your_rpath_value"
}'
```

### 21. 回收站删除文件
- **描述**: 回收站删除文件
- **参数**:
  - `path` (string) (文件的rname)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/Del_Recycle_bin_new' \
-H 'Content-Type: application/json' \
-d '{
  "path": "your_path_value"
}'
```

### 22. 回收站批量删除数据库
- **描述**: 回收站批量删除数据库
- **参数**:
  - `force` (number, 可选)
  - `path_list` (any) (文件的rname列表)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/Batch_Del_Recycle_bin' \
-H 'Content-Type: application/json' \
-d '{
  "force": 0,
  "path_list": "your_path_list_value"
}'
```

### 23. 回收站下载文件
- **描述**: 回收站下载文件
- **参数**:
  - `name` (string) (文件的name)
  - `rname` (string) (文件的rname)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/download_file' \
-H 'Content-Type: application/json' \
-d '{
  "name": "your_name_value",
  "rname": "your_rname_value"
}'
```

### 24. 获取zip压缩包内文件列表
- **描述**: 获取zip压缩包内文件列表
- **参数**:
  - `sfile` (string) (文件的path)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/zip/get_zip_files' \
-H 'Content-Type: application/json' \
-d '{
  "sfile": "your_sfile_path_value"
}'
```

### 25. 获取tar.gz压缩包内文件列表
- **描述**: 获取tar.gz压缩包内文件列表
- **参数**:
  - `sfile` (string) (文件的path)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/gz/get_zip_files' \
-H 'Content-Type: application/json' \
-d '{
  "sfile": "your_sfile_path_value"
}'
```

### 26. 切割文件
- **描述**: 切割文件
- **参数**:
  - `file_path` (string) (文件的完整路径)
  - `save_path` (string) (文件的保存路径)
  - `split_size` (string, 可选) (文件的分割大小)
  - `split_num` (string, 可选) (文件的分割数量)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/SplitFile' \
-H 'Content-Type: application/json' \
-d '{
  "file_path": "your_file_path_value",
  "save_path": "your_save_path_value",
  "split_size": "your_split_size_value",
  "split_num": "your_split_num_value"
}'
```

### 27. 获取切割文件信息
- **描述**: 获取切割文件信息
- **参数**:
  - `file_path` (string) (文件的完整路径)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/JoinConfigFile' \
-H 'Content-Type: application/json' \
-d '{
  "file_path": "your_file_path_value"
}'
```

### 28. 合并文件
- **描述**: 合并文件
- **参数**:
  - `file_path` (string) (文件的完整路径)
  - `save_path` (string) (文件的保存路径)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/JoinFile' \
-H 'Content-Type: application/json' \
-d '{
  "file_path": "your_file_path_value",
  "save_path": "your_save_path_value"
}'
```

### 29. 外链分享文件
- **描述**: 外链分享文件
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/create_download_url' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 30. 获取分享文件详情
- **描述**: 获取分享文件详情
- **参数**:
  - `id` (any)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/get_download_url_find' \
-H 'Content-Type: application/json' \
-d '{
  "id": "your_id_value"
}'
```

### 31. 关闭外链分享
- **描述**: 关闭外链分享
- **参数**:
  - `id` (any)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/remove_download_url' \
-H 'Content-Type: application/json' \
-d '{
  "id": "your_id_value"
}'
```

### 32. 监听日志
- **描述**: 监听日志
- **参数**:
  - `file` (any)
  - `limit` (any)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/logs/get_logs_info' \
-H 'Content-Type: application/json' \
-d '{
  "file": "your_file_value",
  "limit": "your_limit_value"
}'
```

### 33. 压缩文件
- **描述**: 压缩文件
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/Zip' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 34. 压缩并下载文件
- **描述**: 压缩并下载文件
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/ZipAndDownload' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 35. 解压文件
- **描述**: 解压文件
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/UnZip' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 36. 获取邮箱信息
- **描述**: 获取邮箱信息
- **参数**: 无
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/upload/check_email_config' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 37. 发送到邮箱
- **描述**: 发送到邮箱
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/upload/send_to_email' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 38. 获取文件属性 (get_file_attribute)
- **描述**: 获取文件属性
- **参数**:
  - `filename` (any) (文件完整路径)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/get_file_attribute' \
-H 'Content-Type: application/json' \
-d '{
  "filename": "your_filename_value"
}'
```

### 39. 获取文件历史版本内容 (re_history)
- **描述**: 获取文件属性 (注意: JSDoc描述为获取文件属性，但函数名和路径与文件历史相关)
- **参数**:
  - `filename` (string) (文件完整路径)
  - `history` (string) (文件时间)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/re_history' \
-H 'Content-Type: application/json' \
-d '{
  "filename": "your_filename_value",
  "history": "your_history_value"
}'
```

### 40. 获取文件权限
- **描述**: 获取文件权限
- **参数**:
  - `filename` (string) (文件完整路径)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/GetFileAccess' \
-H 'Content-Type: application/json' \
-d '{
  "filename": "your_filename_value"
}'
```

### 41. 设置文件权限
- **描述**: 设置文件权限
- **参数**:
  - `filename` (string) (文件完整路径)
  - `user` (string) (文件用户)
  - `access` (string) (文件权限)
  - `all` (string)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/SetFileAccess' \
-H 'Content-Type: application/json' \
-d '{
  "filename": "your_filename_value",
  "user": "your_user_value",
  "access": "your_access_value",
  "all": "your_all_value"
}'
```

### 42. 导入数据库
- **描述**: 导入数据库
- **参数**:
  - `name` (string) (数据库名称)
  - `file` (string) (文件完整路径)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/database/InputSql' \
-H 'Content-Type: application/json' \
-d '{
  "name": "your_name_value",
  "file": "your_file_value"
}'
```

### 43. zip压缩包提交文件
- **描述**: zip压缩包提交文件
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/zip/add_zip_file' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 44. tar.gz压缩包提交文件
- **描述**: tar.gz压缩包提交文件
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/gz/add_zip_file' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 45. zip压缩包获取文件详情
- **描述**: zip压缩包获取文件详情
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/zip/get_fileinfo_by' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 46. tar.gz压缩包获取文件详情
- **描述**: tar.gz压缩包获取文件详情
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/gz/get_fileinfo_by' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 47. zip压缩包保存文件
- **描述**: zip压缩包保存文件
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/zip/write_zip_file' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 48. tar.gz压缩包保存文件
- **描述**: tar.gz压缩包保存文件
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/gz/write_zip_file' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 49. zip压缩包解压文件
- **描述**: zip压缩包解压文件
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/zip/extract_byfiles' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 50. tar.gz压缩包解压文件
- **描述**: tar.gz压缩包解压文件
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/gz/extract_byfiles' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 51. zip压缩包删除文件
- **描述**: zip压缩包删除文件
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/zip/delete_zip_file' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 52. tar.gz压缩包删除文件
- **描述**: tar.gz压缩包删除文件
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/gz/delete_zip_file' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 53. 格式转换获取可转换的格式
- **描述**: 格式转换获取可转换的格式
- **参数**: 无
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/conversion/get_convert_liet' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 54. 格式转换
- **描述**: 格式转换
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/conversion/run' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 55. 下载文件
- **描述**: 下载文件
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/DownloadFile' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 56. 计算目录大小
- **描述**: 计算目录大小
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/size/get_batch_path_size' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 57. 设置备注
- **描述**: 设置备注
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/set_file_ps' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 58. 文件同步-增加接收端
- **描述**: 文件同步-增加接收端
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/plugin?action=a&name=rsync&s=add_module' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 59. 添加文件同步规则 (files/add_files_rsync)
- **描述**: (无描述)
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/add_files_rsync' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 60. 文件同步-增加发送端
- **描述**: 文件同步-增加发送端
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/plugin?action=a&name=rsync&s=add_ormodify_send' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 61. 文件历史
- **描述**: 文件历史
- **参数**: 无
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/file_history_list' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 62. 文件操作记录
- **描述**: 文件操作记录
- **参数**:
  - `content` (string)
  - `p` (number)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/GetFileHistory' \
-H 'Content-Type: application/json' \
-d '{
  "content": "your_content_value",
  "p": your_p_value
}'
```

### 63. 文件历史删除
- **描述**: 文件历史删除
- **参数**:
  - `id` (string) (文件历史id)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/del_file_history' \
-H 'Content-Type: application/json' \
-d '{
  "id": "your_id_value"
}'
```

### 64. 批量操作文件
- **描述**: 批量操作文件
- **参数**:
  - `data` (Array) (文件名称数组)
  - `type` (number) (模式 1复制 2剪切 3权限 4删除)
  - `path` (string) (当前路径)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/SetBatchData' \
-H 'Content-Type: application/json' \
-d '{
  "data": [],
  "type": your_type_value,
  "path": "your_path_value"
}'
```

### 65. 批量粘贴文件
- **描述**: 批量粘贴文件
- **参数**:
  - `type` (number) (模式 1粘贴 2剪切粘贴)
  - `path` (string) (当前路径)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/BatchPaste' \
-H 'Content-Type: application/json' \
-d '{
  "type": your_type_value,
  "path": "your_path_value"
}'
```

### 66. 企业防篡改-获取有效路径
- **描述**: 企业防篡改-获取有效路径
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/tamper_core/get_effective_path.json' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 67. 企业防篡改-设置全局状态
- **描述**: 企业防篡改-获取有效路径 (注意: JSDoc描述为获取路径，但函数名和路径为设置状态)
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/tamper_core/modify_global_config.json' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 68. 上传文件是否存在 (upload_files_exists)
- **描述**: 上传文件是否存在
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/upload_files_exists' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 69. 添加文件防篡改 (batch_setting.json)
- **描述**: 添加文件防篡改
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/tamper_core/batch_setting.json' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 70. 创建防篡改路径 (create_path.json)
- **描述**: 添加文件防篡改 (注意: JSDoc描述为添加文件防篡改，但函数名和路径为创建路径)
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/tamper_core/create_path.json' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 71. 批量设置文件防篡改
- **描述**: 批量设置文件防篡改
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/tamper_core/batch_setting.json' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 72. 获取文件缩略图列表
- **描述**: 获取文件缩略图列表
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/get_images_resize' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 73. 获取文件播放列表
- **描述**: 获取文件播放列表
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/get_videos' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 74. 获取文件当前目录大小
- **描述**: 获取文件当前目录大小
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/GetDirSize' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 75. 获取当前文件计算状态
- **描述**: 获取当前文件计算状态
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/CheckTaskStatus' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 76. 创建软链接
- **描述**: 创建软链接
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/CreateLink' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 77. 获取格式转换操作列表
- **描述**: 获取格式转换操作列表
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/conversion/get_log' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 78. 测试路径
- **描述**: 获取文件内容 (注意: JSDoc描述为获取文件内容，但函数名和路径为测试路径)
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/test_path' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 79. 设置文件历史
- **描述**: 获取文件历史 (注意: JSDoc描述为获取文件历史，但函数名和路径为设置文件历史)
- **参数**: (AnyObject - 具体参数结构未知)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/file_history' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 80. 获取当前目录下全文件大小
- **描述**: 获取当前目录下全文件大小
- **参数**:
  - `path` (string) (目录路径)
  - `is_refresh` (boolean) (应为true)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/size/get_dir_path_size' \
-H 'Content-Type: application/json' \
-d '{
  "path": "your_path_value",
  "is_refresh": true
}'
```

### 81. 获取文件历史内容 (read_history)
- **描述**: 获取文件历史内容
- **参数**:
  - `filename` (string) (文件完整路径)
  - `history` (string) (文件历史版本时间戳)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/read_history' \
-H 'Content-Type: application/json' \
-d '{
  "filename": "your_filename_value",
  "history": "your_history_timestamp_value"
}'
```

### 82. 删除文件历史 (del_history)
- **描述**: 删除文件历史
- **参数**:
  - `filename` (string) (文件完整路径)
  - `history` (string) (文件历史)
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/del_history' \
-H 'Content-Type: application/json' \
-d '{
  "filename": "your_filename_value",
  "history": "your_history_value"
}'
```

### 83. 获取云存储配置
- **描述**: 获取云存储配置
- **参数**: 无
- **cURL**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/upload/get_oss_objects' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 84. 获取云存储文件列表
- **描述**: 获取云存储文件列表
- **参数**:
  - `path` (string) (目录路径)
  - `pname` (string) (云存储名称)
- **cURL (示例 pname='your_pname_value')**:
```bash
cURL -X POST 'YOUR_BASE_URL/plugin?action=a&s=get_list&name=your_pname_value' \
-H 'Content-Type: application/json' \
-d '{
  "path": "your_path_value"
}'
```

### 85. 上传/下载云存储文件
- **描述**: 上传、下载云存储文件
- **参数**:
  - `data` (AnyObject) (具体参数结构未知，作为JSON字符串传递)
  - `type` (string) ('upload' 或 'download')
- **cURL (上传)**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/upload/upload_file' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_json_data_string"
}'
```
- **cURL (下载)**:
```bash
cURL -X POST 'YOUR_BASE_URL/files/down/download_file' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_json_data_string"
}'
```
