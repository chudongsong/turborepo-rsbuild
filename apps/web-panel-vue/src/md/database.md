# API 文档 (database.ts)

## 目录
1. [检查数据库连接](#1-检查数据库连接)
2. [检查数据库连接 (模块)](#2-检查数据库连接-模块)
3. [获取数据库状态](#3-获取数据库状态)
4. [修改数据库密码](#4-修改数据库密码)
5. [修改数据库密码 (模块)](#5-修改数据库密码-模块)
6. [数据库工具箱 查询数据库表信息](#6-数据库工具箱-查询数据库表信息)
7. [数据库工具箱 查询数据库表信息 (模块)](#7-数据库工具箱-查询数据库表信息-模块)
8. [修改数据库工具备注](#8-修改数据库工具备注)
9. [导出表的结构](#9-导出表的结构)
10. [转换数据库表引擎](#10-转换数据库表引擎)
11. [优化数据库表信息](#11-优化数据库表信息)
12. [修复数据库表信息](#12-修复数据库表信息)
13. [增加数据库 (模块)](#13-增加数据库-模块)
14. [添加数据库](#14-添加数据库)
15. [获取导入数据库大小信息](#15-获取导入数据库大小信息)
16. [获取备份数据库大小信息](#16-获取备份数据库大小信息)
17. [查询模块数据库权限 (mongodb)](#17-查询模块数据库权限-mongodb)
18. [设置模块数据库权限 (mongodb)](#18-设置模块数据库权限-mongodb)
19. [同步数据库](#19-同步数据库)
20. [同步数据库 (模块)](#20-同步数据库-模块)
21. [同步数据库到面板 (从服务器获取)](#21-同步数据库到面板-从服务器获取)
22. [模块-同步数据库到面板 (从服务器获取)](#22-模块-同步数据库到面板-从服务器获取)
23. [开启安全认证](#23-开启安全认证)
24. [列表查询 (mysql)](#24-列表查询-mysql)
25. [列表查询 (模块)](#25-列表查询-模块)
26. [列表查询是否配置远程数据库 (mysql)](#26-列表查询是否配置远程数据库-mysql)
27. [列表查询是否配置远程数据库 (模块)](#27-列表查询是否配置远程数据库-模块)
28. [查询mongodb是否开启安全认证等配置信息](#28-查询mongodb是否开启安全认证等配置信息)
29. [修改密码 (mysql)](#29-修改密码-mysql)
30. [删除远程数据库 (mysql)](#30-删除远程数据库-mysql)
31. [删除模块远程数据库](#31-删除模块远程数据库)
32. [增加远程数据库 (mysql)](#32-增加远程数据库-mysql)
33. [增加模块远程数据库](#33-增加模块远程数据库)
34. [修改远程数据库](#34-修改远程数据库)
35. [修改模块远程数据库](#35-修改模块远程数据库)
36. [批量备份数据库 (mysql)](#36-批量备份数据库-mysql)
37. [批量备份MySQL数据](#37-批量备份mysql数据)
38. [批量备份数据库 (module)](#38-批量备份数据库-module)
39. [删除备份数据库](#39-删除备份数据库)
40. [常规备份 恢复数据库 导入数据库](#40-常规备份-恢复数据库-导入数据库)
41. [常规备份 恢复数据库 导入数据库 (模块)](#41-常规备份-恢复数据库-导入数据库-模块)
42. [获取下载地址](#42-获取下载地址)
43. [导入 - 获取备份信息](#43-导入---获取备份信息)
44. [导入 - 获取备份信息 (module)](#44-导入---获取备份信息-module)
45. [检查数据库删除数据 (mysql)](#45-检查数据库删除数据-mysql)
46. [删除弹窗查询数据库信息](#46-删除弹窗查询数据库信息)
47. [删除数据库 (模块删除+mysql通用)](#47-删除数据库-模块删除mysql通用)
48. [批量删除MySQL数据](#48-批量删除mysql数据)
49. [修改管理员数据库密码 (pgsql)](#49-修改管理员数据库密码-pgsql)
50. [获取管理员数据库密码 (pgsql)](#50-获取管理员数据库密码-pgsql)
51. [列表查询 (redis)](#51-列表查询-redis)
52. [redis查询指定key的value数据](#52-redis查询指定key的value数据)
53. [清空数据库 (redis)](#53-清空数据库-redis)
54. [获取备份列表 (redis)](#54-获取备份列表-redis)
55. [添加redis值](#55-添加redis值)
56. [删除redis值](#56-删除redis值)
57. [批量删除redis值](#57-批量删除redis值)
58. [数据库root密码获取 (mysql)](#58-数据库root密码获取-mysql)
59. [获取所有备份 (mysql)](#59-获取所有备份-mysql)
60. [获取详细备份信息 (mysql - 数据库备份)](#60-获取详细备份信息-mysql---数据库备份)
61. [导入数据库](#61-导入数据库)
62. [根据sid获取可备份的数据库](#62-根据sid获取可备份的数据库)
63. [备份数据库 (常规)](#63-备份数据库-常规)
64. [查询数据库权限 (mysql)](#64-查询数据库权限-mysql)
65. [设置数据库权限 (mysql)](#65-设置数据库权限-mysql)
66. [查询增量数据库发送请求-检测是否开启二进制日志](#66-查询增量数据库发送请求-检测是否开启二进制日志)
67. [企业增量备份查询备份数据库选项](#67-企业增量备份查询备份数据库选项)
68. [企业增量备份查询详细信息](#68-企业增量备份查询详细信息)
69. [执行任务-企业增量备份](#69-执行任务-企业增量备份)
70. [获取任务执行日志](#70-获取任务执行日志)
71. [清空任务执行日志](#71-清空任务执行日志)
72. [删除增量数据库备份请求](#72-删除增量数据库备份请求)
73. [获取备份信息记录](#73-获取备份信息记录)
74. [恢复备份信息记录](#74-恢复备份信息记录)
75. [导出备份信息记录](#75-导出备份信息记录)
76. [修改增量备份任务](#76-修改增量备份任务)
77. [添加增量备份任务](#77-添加增量备份任务)
78. [添加数据库配额容量](#78-添加数据库配额容量)
79. [恢复数据库写入权限](#79-恢复数据库写入权限)
80. [获取显示日志 数据库导入 (mysql)](#80-获取显示日志-数据库导入-mysql)
81. [获取导入状态](#81-获取导入状态)
82. [设置MySQL守护进程状态](#82-设置mysql守护进程状态)
83. [获取MySQL守护进程状态](#83-获取mysql守护进程状态)
84. [获取数据库信息-关联服务](#84-获取数据库信息-关联服务)
85. [获取站点信息](#85-获取站点信息)
86. [修改ftp链接](#86-修改ftp链接)
87. [修改mysql链接](#87-修改mysql链接)
88. [获取ftp信息](#88-获取ftp信息)
89. [删除索引](#89-删除索引)
90. [获取索引列表](#90-获取索引列表)
91. [获取数据库信息-敏感词检测](#91-获取数据库信息-敏感词检测)
92. [获取用户数据](#92-获取用户数据)
93. [设置告警状态](#93-设置告警状态)
94. [删除用户管理](#94-删除用户管理)
95. [导出用户数据](#95-导出用户数据)
96. [获取数据库数据](#96-获取数据库数据)
97. [添加用户管理](#97-添加用户管理)
98. [删除用户数据](#98-删除用户数据)
99. [添加用户数据](#99-添加用户数据)
100. [修改用户密码](#100-修改用户密码)
101. [获取自动备份数据库配置](#101-获取自动备份数据库配置)
102. [设置自动备份数据库配置](#102-设置自动备份数据库配置)
103. [获取数据库分类](#103-获取数据库分类)
104. [添加数据库分类](#104-添加数据库分类)
105. [删除数据库分类](#105-删除数据库分类)
106. [修改数据库分类](#106-修改数据库分类)
107. [设置pgsql数据库权限](#107-设置pgsql数据库权限)
108. [同步数据库sqllite](#108-同步数据库sqllite)
109. [获取指定数据库所有表数据](#109-获取指定数据库所有表数据)
110. [查询sql语句](#110-查询sql语句)
111. [获取指定数据库表信息](#111-获取指定数据库表信息)
112. [获取指定数据库表字段](#112-获取指定数据库表字段)
113. [删除表数据](#113-删除表数据)
114. [插入表数据](#114-插入表数据)
115. [修改表数据](#115-修改表数据)
116. [备份sqlite数据库](#116-备份sqlite数据库)
117. [删除sqlite数据库备份](#117-删除sqlite数据库备份)
118. [备份sqlite数据库 (ToBackup)](#118-备份sqlite数据库-tobackup)
119. [设置数据库分类](#119-设置数据库分类)
120. [获取等保基础设置 (mysql)](#120-获取等保基础设置-mysql)
121. [设置等保基础设置 (mysql)](#121-设置等保基础设置-mysql)
122. [获取密码复杂度设置 (mysql)](#122-获取密码复杂度设置-mysql)
123. [设置密码复杂度设置 (mysql)](#123-设置密码复杂度设置-mysql)
124. [获取登录限制设置 (mysql)](#124-获取登录限制设置-mysql)
125. [设置登录限制 (mysql)](#125-设置登录限制-mysql)
126. [获取审计日志设置 (mysql)](#126-获取审计日志设置-mysql)
127. [设置审计日志设置 (mysql)](#127-设置审计日志设置-mysql)
128. [获取审计日志高级设置数据库列表 (mysql)](#128-获取审计日志高级设置数据库列表-mysql)
129. [获取审计日志高级设置用户列表 (mysql)](#129-获取审计日志高级设置用户列表-mysql)
130. [获取审计日志高级设置查询列表 (mysql)](#130-获取审计日志高级设置查询列表-mysql)
131. [设置审计日志高级设置 (mysql)](#131-设置审计日志高级设置-mysql)
132. [获取审计日志--日志 (mysql)](#132-获取审计日志--日志-mysql)
133. [刷新写入权限状态](#133-刷新写入权限状态)
134. [检查数据库是否加密](#134-检查数据库是否加密)
135. [备份数据库 (sqlite)](#135-备份数据库-sqlite)
136. [删除数据库 (sqlite)](#136-删除数据库-sqlite)
137. [批量设置权限 (mysql)](#137-批量设置权限-mysql)

---

## API 列表

### 1. 检查数据库连接
- **描述**: 检查数据库连接
- **参数**:
  - `sid` (number | string) (服务器id)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/CheckDatabaseStatus' \
-H 'Content-Type: application/json' \
-d '{
  "sid": "your_sid_value"
}'
```

### 2. 检查数据库连接 (模块)
- **描述**: 检查数据库连接
- **参数**:
  - `data` (string) (JSON字符串格式)
  - `type` (string) (数据库类型，将拼接到URL中)
- **cURL (示例 type='your_type_value')**:
```bash
curl -X POST 'YOUR_BASE_URL/database/your_type_value/CheckDatabaseStatus' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_data_json_string"
}'
```

### 3. 获取数据库状态
- **描述**: 获取数据库状态
- **参数**:
  - `name` (string) (数据库名称)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/public/get_soft_status' \
-H 'Content-Type: application/json' \
-d '{
  "name": "your_name_value"
}'
```

### 4. 修改数据库密码
- **描述**: 修改数据库密码
- **参数**:
  - `id` (number) (数据库id)
  - `name` (string) (数据库名称)
  - `password` (string) (数据库密码)
  - `data_name` (string) (数据库名称)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/ResDatabasePassword' \
-H 'Content-Type: application/json' \
-d '{
  "id": your_id_value,
  "name": "your_name_value",
  "password": "your_password_value",
  "data_name": "your_data_name_value"
}'
```

### 5. 修改数据库密码 (模块)
- **描述**: 修改数据库密码 - 模块
- **参数**:
  - `data` (string) (JSON字符串格式, 包含id, name, password, data_name)
  - `type` (string) (查询列表类型，将拼接到URL中)
- **cURL (示例 type='your_type_value')**:
```bash
curl -X POST 'YOUR_BASE_URL/database/your_type_value/ResDatabasePassword' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_data_json_string"
}'
```

### 6. 数据库工具箱 查询数据库表信息
- **描述**: 数据库工具箱 查询数据库表信息
- **参数**:
  - `db_name` (string) (数据库名称)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/GetInfo' \
-H 'Content-Type: application/json' \
-d '{
  "db_name": "your_db_name_value"
}'
```

### 7. 数据库工具箱 查询数据库表信息 (模块)
- **描述**: 数据库工具箱 查询数据库表信息 - 模块
- **参数**:
  - `data` (string) (JSON字符串格式, 包含db_name)
  - `type` (any) (数据库类型，将拼接到URL中)
- **cURL (示例 type='your_type_value')**:
```bash
curl -X POST 'YOUR_BASE_URL/database/your_type_value/GetInfo' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_data_json_string"
}'
```

### 8. 修改数据库工具备注
- **描述**: 修改数据库工具备注
- **参数**:
  - `table_name` (string) (数据库表名)
  - `comment` (string) (备注)
  - `db_name` (string) (数据库名称)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/ModifyTableComment' \
-H 'Content-Type: application/json' \
-d '{
  "table_name": "your_table_name_value",
  "comment": "your_comment_value",
  "db_name": "your_db_name_value"
}'
```

### 9. 导出表的结构
- **描述**: 导出表的结构
- **参数**:
  - `db_name` (string)
  - `table_name` (string)
  - `filename` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/export_table_structure' \
-H 'Content-Type: application/json' \
-d '{
  "db_name": "your_db_name_value",
  "table_name": "your_table_name_value",
  "filename": "your_filename_value"
}'
```

### 10. 转换数据库表引擎
- **描述**: 转换数据库表引擎
- **参数**:
  - `table_type` (string, 可选)
  - `tables` (string) (表名)
  - `db_name` (string) (数据库名)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/AlTable' \
-H 'Content-Type: application/json' \
-d '{
  "table_type": "your_table_type_value",
  "tables": "your_tables_value",
  "db_name": "your_db_name_value"
}'
```

### 11. 优化数据库表信息
- **描述**: 优化数据库表信息
- **参数**:
  - `db_name` (string) (数据库名)
  - `tables` (string) (表名)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/OpTable' \
-H 'Content-Type: application/json' \
-d '{
  "db_name": "your_db_name_value",
  "tables": "your_tables_value"
}'
```

### 12. 修复数据库表信息
- **描述**: 修复数据库表信息
- **参数**:
  - `db_name` (string) (数据库名)
  - `tables` (string) (表名)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/ReTable' \
-H 'Content-Type: application/json' \
-d '{
  "db_name": "your_db_name_value",
  "tables": "your_tables_value"
}'
```

### 13. 增加数据库 (模块)
- **描述**: 增加数据库 - 模块
- **参数**:
  - `name` (string) (数据库名称)
  - `password` (string) (数据库密码)
  - `ps` (string) (备注)
  - `db_user` (string) (数据库用户名)
  - `sid` (number | string) (服务器id)
  - `type` (string) (数据库类型，将拼接到URL中)
- **cURL (示例 type='your_type_value')**:
```bash
curl -X POST 'YOUR_BASE_URL/database/your_type_value/AddDatabase' \
-H 'Content-Type: application/json' \
-d '{
  "data": "{\"name\":\"your_name_value\",\"password\":\"your_password_value\",\"ps\":\"your_ps_value\",\"db_user\":\"your_db_user_value\",\"sid\":\"your_sid_value\"}"
}'
```

### 14. 添加数据库
- **描述**: 添加数据库
- **参数**:
  - `name` (string) (数据库名称)
  - `password` (string) (数据库密码)
  - `ps` (string) (备注)
  - `db_user` (string) (数据库用户名)
  - `codeing` (string) (数据库编码)
  - `host` (string) (数据库地址)
  - `sid` (number | string) (服务器id)
  - `dtype` (string) (数据库类型)
  - `address` (string) (数据库地址)
  - `dataAccess` (string) (数据库访问地址)
  - `listen_ip` (string) (监听地址)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/AddDatabase' \
-H 'Content-Type: application/json' \
-d '{
  "name": "your_name_value",
  "password": "your_password_value",
  "ps": "your_ps_value",
  "db_user": "your_db_user_value",
  "codeing": "your_codeing_value",
  "host": "your_host_value",
  "sid": "your_sid_value",
  "dtype": "your_dtype_value",
  "address": "your_address_value",
  "dataAccess": "your_dataAccess_value",
  "listen_ip": "your_listen_ip_value"
}'
```

### 15. 获取导入数据库大小信息
- **描述**: 获取导入数据库大小信息
- **参数**:
  - `name` (string) (数据库名称)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/GetImportSize' \
-H 'Content-Type: application/json' \
-d '{
  "name": "your_name_value"
}'
```

### 16. 获取备份数据库大小信息
- **描述**: 获取备份数据库大小信息
- **参数**:
  - `id` (number) (数据库id)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/GetBackupSize' \
-H 'Content-Type: application/json' \
-d '{
  "id": your_id_value
}'
```

### 17. 查询模块数据库权限 (mongodb)
- **描述**: 查询模块数据库权限 (mongodb)
- **参数**:
  - `data` (string) (JSON字符串格式, 包含user_name)
  - `type` (string) (数据库类型，将拼接到URL中)
- **cURL (示例 type='your_type_value')**:
```bash
curl -X POST 'YOUR_BASE_URL/database/your_type_value/GetDatabaseAccess' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_data_json_string"
}'
```

### 18. 设置模块数据库权限 (mongodb)
- **描述**: 设置模块数据库权限 (mongodb)
- **参数**:
  - `data` (string) (JSON字符串格式, 包含user_name, db_permission: Array<string>)
  - `type` (string) (数据库类型，将拼接到URL中)
- **cURL (示例 type='your_type_value')**:
```bash
curl -X POST 'YOUR_BASE_URL/database/your_type_value/SetDatabaseAccess' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_data_json_string"
}'
```

### 19. 同步数据库
- **描述**: 同步数据库
- **参数**:
  - `ids` (string) (同步id, string数组)
  - `type` (number, 可选) (0: 同步到云端(旧接口), 1: 同步到云端(新接口))
- **cURL (type=0, 旧接口)**:
```bash
curl -X POST 'YOUR_BASE_URL/database/SyncToDatabases&type=0' \
-H 'Content-Type: application/json' \
-d '{
  "ids": "your_ids_value"
}'
```
- **cURL (type=1或未指定, 新接口)**:
```bash
curl -X POST 'YOUR_BASE_URL/datalist/batch/batch_sync_db_to_server' \
-H 'Content-Type: application/json' \
-d '{
  "ids": "your_ids_value"
}'
```

### 20. 同步数据库 (模块)
- **描述**: 同步数据库 - 模块
- **参数**:
  - `data` (string) (JSON字符串格式, 包含type:同步类型, ids:同步id)
  - `tab` (string) (查询列表类型，将拼接到URL中)
- **cURL (示例 tab='your_tab_value')**:
```bash
curl -X POST 'YOUR_BASE_URL/database/your_tab_value/SyncToDatabases' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_data_json_string"
}'
```

### 21. 同步数据库到面板 (从服务器获取)
- **描述**: 同步数据库到面板 (从服务器获取)
- **参数**:
  - `sid` (number) (服务器id)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/SyncGetDatabases' \
-H 'Content-Type: application/json' \
-d '{
  "sid": your_sid_value
}'
```

### 22. 模块-同步数据库到面板 (从服务器获取)
- **描述**: 模块-同步数据库到面板 从服务器获取
- **参数**:
  - `data` (string) (JSON字符串格式, 包含sid:服务器id)
  - `type` (string) (类型，将拼接到URL中)
- **cURL (示例 type='your_type_value')**:
```bash
curl -X POST 'YOUR_BASE_URL/database/your_type_value/SyncGetDatabases' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_data_json_string"
}'
```

### 23. 开启安全认证
- **描述**: 开启安全认证
- **参数**:
  - `data` (string) (JSON字符串格式, 包含status:开启状态, 1开启 0关闭)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/mongodb/set_auth_status' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_data_json_string"
}'
```

### 24. 列表查询 (mysql)
- **描述**: 列表查询 - mysql
- **参数**:
  - `p` (number) (分页参数)
  - `limit` (number) (分页参数)
  - `search` (string) (查询条件)
  - `table` (string) (查询表名)
  - `order` (string, 可选) (排序参数)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/datalist/data/get_data_list' \
-H 'Content-Type: application/json' \
-d '{
  "p": your_p_value,
  "limit": your_limit_value,
  "search": "your_search_value",
  "table": "your_table_value",
  "order": "your_order_value"
}'
```

### 25. 列表查询 (模块)
- **描述**: 列表查询 - 模块
- **参数**:
  - `data` (string, 可选) (JSON字符串格式, 内容视具体模块而定，包含table, search, limit, p, sid等)
  - `type` (string) (查询列表类型，将拼接到URL中)
- **cURL (示例 type='your_type_value')**:
```bash
curl -X POST 'YOUR_BASE_URL/database/your_type_value/get_list' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_data_json_string"
}'
```

### 26. 列表查询是否配置远程数据库 (mysql)
- **描述**: 列表查询是否配置远程数据库-mysql
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/GetCloudServer' \
-H 'Content-Type: application/json'
```

### 27. 列表查询是否配置远程数据库 (模块)
- **描述**: 列表查询是否配置远程数据库 - 模块
- **参数**:
  - `data` (string) (JSON字符串格式, 包含type:查询远程数据库类型)
  - `type` (string) (查询列表类型，将拼接到URL中)
- **cURL (示例 type='your_type_value')**:
```bash
curl -X POST 'YOUR_BASE_URL/database/your_type_value/GetCloudServer' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_data_json_string"
}'
```

### 28. 查询mongodb是否开启安全认证等配置信息
- **描述**: 查询mongodb是否开启安全认证等配置信息
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/mongodb/get_root_pwd' \
-H 'Content-Type: application/json'
```

### 29. 修改密码 (mysql)
- **描述**: 修改密码 -mysql
- **参数**:
  - `password` (string) (数据库密码)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/SetupPassword' \
-H 'Content-Type: application/json' \
-d '{
  "password": "your_password_value"
}'
```

### 30. 删除远程数据库 (mysql)
- **描述**: 删除远程数据库 -mysql
- **参数**:
  - `id` (number) (数据库id)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/RemoveCloudServer' \
-H 'Content-Type: application/json' \
-d '{
  "id": your_id_value
}'
```

### 31. 删除模块远程数据库
- **描述**: 删除模块远程数据库
- **参数**:
  - `data` (string) (JSON字符串格式, 包含id:远程数据库id)
  - `type` (string) (查询列表类型，将拼接到URL中)
- **cURL (示例 type='your_type_value')**:
```bash
curl -X POST 'YOUR_BASE_URL/database/your_type_value/RemoveCloudServer' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_data_json_string"
}'
```

### 32. 增加远程数据库 (mysql)
- **描述**: 增加远程数据库 -mysql
- **参数**:
  - `db_host` (string) (数据库地址)
  - `db_port` (string | number) (数据库端口)
  - `db_user` (string) (数据库用户名)
  - `db_password` (string) (数据库密码)
  - `ps` (string) (备注)
  - `type` (string, 可选) (数据库类型)
  - `sid` (number | string, 可选) (服务器id)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/AddCloudServer' \
-H 'Content-Type: application/json' \
-d '{
  "db_host": "your_db_host_value",
  "db_port": "your_db_port_value",
  "db_user": "your_db_user_value",
  "db_password": "your_db_password_value",
  "ps": "your_ps_value",
  "type": "your_type_value",
  "sid": "your_sid_value"
}'
```

### 33. 增加模块远程数据库
- **描述**: 增加模块远程数据库
- **参数**:
  - `data` (string) (JSON字符串格式, 包含CloudServerParams内容)
  - `type` (string) (查询列表类型，将拼接到URL中)
- **cURL (示例 type='your_type_value')**:
```bash
curl -X POST 'YOUR_BASE_URL/database/your_type_value/AddCloudServer' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_data_json_string"
}'
```

### 34. 修改远程数据库
- **描述**: 修改远程数据库
- **参数**:
  - `db_host` (string) (数据库地址)
  - `db_port` (string | number) (数据库端口)
  - `db_user` (string) (数据库用户名)
  - `db_password` (string) (数据库密码)
  - `ps` (string) (备注)
  - `type` (string, 可选) (数据库类型)
  - `sid` (number | string, 可选) (服务器id)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/ModifyCloudServer' \
-H 'Content-Type: application/json' \
-d '{
  "db_host": "your_db_host_value",
  "db_port": "your_db_port_value",
  "db_user": "your_db_user_value",
  "db_password": "your_db_password_value",
  "ps": "your_ps_value",
  "type": "your_type_value",
  "sid": "your_sid_value"
}'
```

### 35. 修改模块远程数据库
- **描述**: 修改模块远程数据库
- **参数**:
  - `data` (AnyObject) (JSON字符串格式, 包含CloudServerParams内容)
  - `type` (string) (查询列表类型，将拼接到URL中)
- **cURL (示例 type='your_type_value')**:
```bash
curl -X POST 'YOUR_BASE_URL/database/your_type_value/ModifyCloudServer' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 36. 批量备份数据库 (mysql)
- **描述**: 批量备份数据库 - mysql
- **参数**:
  - `id` (number, 可选) (数据库id)
  - `data` (string, 可选) (JSON字符串，内容可能包含table_list, storage_type, file_type, collection_list)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/ToBackup' \
-H 'Content-Type: application/json' \
-d '{
  "id": your_id_value,
  "data": "your_data_json_string"
}'
```

### 37. 批量备份MySQL数据
- **描述**: 批量备份MySQL数据
- **参数**: (any - 参数结构未知，此处留空)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/datalist/batch/batch_backup_mysql' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 38. 批量备份数据库 (module)
- **描述**: 批量备份数据库-module
- **参数**:
  - `data` (string, 可选) (JSON字符串格式, 包含id, table_list, storage_type, file_type, collection_list等)
  - `type` (string) (数据库类型，将拼接到URL中)
- **cURL (示例 type='your_type_value')**:
```bash
curl -X POST 'YOUR_BASE_URL/database/your_type_value/ToBackup' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_data_json_string"
}'
```

### 39. 删除备份数据库
- **描述**: 删除备份数据库
- **参数**:
  - `id` (number) (备份id)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/DelBackup' \
-H 'Content-Type: application/json' \
-d '{
  "id": your_id_value
}'
```

### 40. 常规备份 恢复数据库 导入数据库
- **描述**: 常规备份 恢复数据库 导入数据库
- **参数**:
  - `file` (string) (备份文件路径)
  - `name` (string) (数据库名称)
  - `disk_check` (boolean, 可选) (是否检查磁盘空间)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/InputSql' \
-H 'Content-Type: application/json' \
-d '{
  "file": "your_file_value",
  "name": "your_name_value",
  "disk_check": your_disk_check_value
}'
```

### 41. 常规备份 恢复数据库 导入数据库 (模块)
- **描述**: 常规备份 恢复数据库 导入数据库
- **参数**:
  - `data` (string) (JSON字符串格式, 包含file, name)
  - `type` (string) (数据库类型，将拼接到URL中)
- **cURL (示例 type='your_type_value')**:
```bash
curl -X POST 'YOUR_BASE_URL/database/your_type_value/InputSql' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_data_json_string"
}'
```

### 42. 获取下载地址
- **描述**: 获取下载地址
- **参数**:
  - `filename` (string) (文件名)
  - `cron_id` (number, 可选) (定时任务id)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/cloud_backup_download' \
-H 'Content-Type: application/json' \
-d '{
  "filename": "your_filename_value",
  "cron_id": your_cron_id_value
}'
```

### 43. 导入 - 获取备份信息
- **描述**: 导入 - 获取备份信息
- **参数**:
  - `p` (number) (分页参数)
  - `search` (string) (查询条件)
  - `limit` (number) (分页限制)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/GetBackup' \
-H 'Content-Type: application/json' \
-d '{
  "p": your_p_value,
  "search": "your_search_value",
  "limit": your_limit_value
}'
```

### 44. 导入 - 获取备份信息 (module)
- **描述**: 导入 - 获取备份信息 - module
- **参数**:
  - `data` (string) (JSON字符串格式)
  - `type` (string) (数据库类型，将拼接到URL中)
- **cURL (示例 type='your_type_value')**:
```bash
curl -X POST 'YOUR_BASE_URL/database/your_type_value/GetBackup' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_data_json_string"
}'
```

### 45. 检查数据库删除数据 (mysql)
- **描述**: 检查数据库删除数据 -mysql
- **参数**:
  - `ids` (string) (数据库id列表 JSON数组)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/check_del_data' \
-H 'Content-Type: application/json' \
-d '{
  "ids": "your_ids_json_array_string"
}'
```

### 46. 删除弹窗查询数据库信息
- **描述**: 删除弹窗查询数据库信息
- **参数**:
  - `data` (string) (JSON字符串格式, 包含ids: 数据库id列表 JSON数组)
  - `type` (string) (数据库类型，将拼接到URL中)
- **cURL (示例 type='your_type_value')**:
```bash
curl -X POST 'YOUR_BASE_URL/database/your_type_value/check_del_data' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_data_json_string"
}'
```

### 47. 删除数据库 (模块删除+mysql通用)
- **描述**: 删除数据库 模块删除+mysql通用
- **参数**:
  - `id` (number, 可选)
  - `name` (string, 可选) (数据库名称)
  - `path` (string, 可选)
  - `type` (string, 可选) (数据库类型，如果提供，则URL动态变化)
- **cURL (mysql/通用)**:
```bash
curl -X POST 'YOUR_BASE_URL/database/DeleteDatabase' \
-H 'Content-Type: application/json' \
-d '{
  "id": your_id_value,
  "name": "your_name_value",
  "path": "your_path_value"
}'
```
- **cURL (模块, 示例 type='your_type_value')**:
```bash
curl -X POST 'YOUR_BASE_URL/database/your_type_value/DeleteDatabase' \
-H 'Content-Type: application/json' \
-d '{
  "data": "{\"id\":your_id_value,\"name\":\"your_name_value\",\"path\":\"your_path_value\"}"
}'
```

### 48. 批量删除MySQL数据
- **描述**: 批量删除MySQL数据
- **参数**: (any - 参数结构未知，此处留空)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/datalist/batch/batch_delete_database' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 49. 修改管理员数据库密码 (pgsql)
- **描述**: 修改管理员数据库密码 - pgsql
- **参数**:
  - `data` (string) (JSON字符串格式, 包含password)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/pgsql/set_root_pwd' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_data_json_string"
}'
```

### 50. 获取管理员数据库密码 (pgsql)
- **描述**: 获取管理员数据库密码 - pgsql
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/pgsql/get_root_pwd' \
-H 'Content-Type: application/json'
```

### 51. 列表查询 (redis)
- **描述**: 列表查询
- **参数**:
  - `data` (string) (JSON字符串格式, 包含sid:服务器id)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/redis/get_list' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_data_json_string"
}'
```

### 52. redis查询指定key的value数据
- **描述**: redis查询指定key 的value数据
- **参数**:
  - `data` (string) (JSON字符串格式, 包含limit, db_idx, search, sid, p)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/redis/get_db_keylist' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_data_json_string"
}'
```

### 53. 清空数据库 (redis)
- **描述**: 清空数据库-redis
- **参数**:
  - `data` (string) (JSON字符串格式, 包含id_list:数据库key索引, sid:服务器id)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/redis/clear_flushdb' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_data_json_string"
}'
```

### 54. 获取备份列表 (redis)
- **描述**: 获取备份列表-redis
- **参数**:
  - `data` (string) (JSON字符串格式, 包含sort:排序方式)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/redis/get_backup_list' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_data_json_string"
}'
```

### 55. 添加redis值
- **描述**: 添加redis值
- **参数**:
  - `data` (string) (JSON字符串格式, 包含db_idx, name, val, endtime, sid)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/redis/set_redis_val' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_data_json_string"
}'
```

### 56. 删除redis值
- **描述**: 删除redis值
- **参数**:
  - `data` (string) (JSON字符串格式, 包含db_idx, key, sid)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/redis/del_redis_val' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_data_json_string"
}'
```

### 57. 批量删除redis值
- **描述**: 删除redis值 (注: 接口路径为批量删除)
- **参数**:
  - `data` (string) (JSON字符串格式, 包含db_idx, key, sid)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/datalist/batch/batch_delete_redis' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_data_json_string"
}'
```

### 58. 数据库root密码获取 (mysql)
- **描述**: 数据库root密码获取 mysql
- **参数**:
  - `table` (string) (数据库名称)
  - `key` (string) (数据库key)
  - `id` (number) (数据库id)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/data/getKey' \
-H 'Content-Type: application/json' \
-d '{
  "table": "your_table_value",
  "key": "your_key_value",
  "id": your_id_value
}'
```

### 59. 获取所有备份 (mysql)
- **描述**: 获取所有备份 - mysql
- **参数**:
  - `p` (number) (分页参数 - 页码)
  - `limit` (number) (分页参数 - 每页显示数量)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/GetAllBackup' \
-H 'Content-Type: application/json' \
-d '{
  "p": your_p_value,
  "limit": your_limit_value
}'
```

### 60. 获取详细备份信息 (mysql - 数据库备份)
- **描述**: 获取详细备份信息 - mysql - 数据库备份
- **参数**:
  - `file` (string) (备份文件路径)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/GetBackupInfo' \
-H 'Content-Type: application/json' \
-d '{
  "file": "your_file_value"
}'
```

### 61. 导入数据库
- **描述**: 导入数据库
- **参数**:
  - `file` (string) (备份文件路径)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/InputSqlAll' \
-H 'Content-Type: application/json' \
-d '{
  "file": "your_file_value"
}'
```

### 62. 根据sid获取可备份的数据库
- **描述**: 根据sid获取可备份的数据库
- **参数**:
  - `sid` (number) (服务器id)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/GetBackupDatabase' \
-H 'Content-Type: application/json' \
-d '{
  "sid": your_sid_value
}'
```

### 63. 备份数据库 (常规)
- **描述**: 备份数据库 - 常规
- **参数**:
  - `sid` (number) (服务器id)
  - `db_list` (string) (数据库名称列表 string格式)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/ToBackupAll' \
-H 'Content-Type: application/json' \
-d '{
  "sid": your_sid_value,
  "db_list": "your_db_list_value"
}'
```

### 64. 查询数据库权限 (mysql)
- **描述**: 查询数据库权限 -mysql
- **参数**:
  - `name` (string) (数据库名称)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/GetDatabaseAccess' \
-H 'Content-Type: application/json' \
-d '{
  "name": "your_name_value"
}'
```

### 65. 设置数据库权限 (mysql)
- **描述**: 设置数据库权限 -mysql
- **参数**:
  - `name` (string) (数据库名称)
  - `dataAccess` (string) (数据库访问地址)
  - `access` (string) (数据库权限)
  - `address` (string) (数据库地址)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/SetDatabaseAccess' \
-H 'Content-Type: application/json' \
-d '{
  "name": "your_name_value",
  "dataAccess": "your_dataAccess_value",
  "access": "your_access_value",
  "address": "your_address_value"
}'
```

### 66. 查询增量数据库发送请求-检测是否开启二进制日志
- **描述**: 查询增量数据库发送请求-检测是否开启二进制日志
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/binlog/get_binlog_status' \
-H 'Content-Type: application/json'
```

### 67. 企业增量备份查询备份数据库选项
- **描述**: 企业增量备份查询备份数据库选项
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/binlog/get_databases' \
-H 'Content-Type: application/json'
```

### 68. 企业增量备份查询详细信息
- **描述**:  企业增量备份查询详细信息
- **参数**:
  - `p` (number) (分页参数)
  - `limit` (number) (分页参数)
  - `db_name` (string) (数据库名称)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/binlog/get_increment_crontab' \
-H 'Content-Type: application/json' \
-d '{
  "p": your_p_value,
  "limit": your_limit_value,
  "db_name": "your_db_name_value"
}'
```

### 69. 执行任务-企业增量备份
- **描述**: 执行任务-企业增量备份
- **参数**:
  - `id` (number) (任务id)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/StartTask' \
-H 'Content-Type: application/json' \
-d '{
  "id": your_id_value
}'
```

### 70. 获取任务执行日志
- **描述**: 获取任务执行日志
- **参数**:
  - `id` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/GetLogs' \
-H 'Content-Type: application/json' \
-d '{
  "id": your_id_value
}'
```

### 71. 清空任务执行日志
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

### 72. 删除增量数据库备份请求
- **描述**: 删除增量数据库备份请求
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

### 73. 获取备份信息记录
- **描述**: 获取备份信息记录
- **参数**:
  - `cron_id` (number) (任务ID)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/binlog/get_backup' \
-H 'Content-Type: application/json' \
-d '{
  "cron_id": your_cron_id_value
}'
```

### 74. 恢复备份信息记录
- **描述**: 恢复备份信息记录
- **参数**:
  - `cron_id` (number) (任务ID)
  - `node_time` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/binlog/restore_time_database' \
-H 'Content-Type: application/json' \
-d '{
  "cron_id": your_cron_id_value,
  "node_time": "your_node_time_value"
}'
```

### 75. 导出备份信息记录
- **描述**: 导出备份信息记录
- **参数**:
  - `cron_id` (number) (任务ID)
  - `node_time` (string | number) (时间节点)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/binlog/export_time_database' \
-H 'Content-Type: application/json' \
-d '{
  "cron_id": your_cron_id_value,
  "node_time": "your_node_time_value"
}'
```

### 76. 修改增量备份任务
- **描述**: 修改增量备份任务
- **参数**: (AnyObject - 参数为空)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/binlog/modify_mysql_increment_crontab' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 77. 添加增量备份任务
- **描述**: 添加增量备份任务
- **参数**: (AnyObject - 参数为空)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/binlog/add_mysql_increment_crontab' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 78. 添加数据库配额容量
- **描述**: 添加数据库配额容量
- **参数**: (string - data本身作为JSON字符串内容)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/quota/modify_database_quota' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_json_string_data_value"
}'
```

### 79. 恢复数据库写入权限
- **描述**: 恢复数据库写入权限
- **参数**: (AnyObject - 包含db_name:数据库名称)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/quota/recover_database_insert_accept' \
-H 'Content-Type: application/json' \
-d '{
  "db_name": "your_db_name_value"
}'
```

### 80. 获取显示日志 数据库导入 (mysql)
- **描述**: 获取显示日志 数据库导入-mysql
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/GetImportLog' \
-H 'Content-Type: application/json'
```

### 81. 获取导入状态
- **描述**: 获取导入状态
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/GetImportStatus' \
-H 'Content-Type: application/json'
```

### 82. 设置MySQL守护进程状态
- **描述**: 设置MySQL守护进程状态
- **参数**:
  - `status` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/set_restart_task' \
-H 'Content-Type: application/json' \
-d '{
  "status": your_status_value
}'
```

### 83. 获取MySQL守护进程状态
- **描述**: 获取MySQL守护进程状态
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/get_restart_task' \
-H 'Content-Type: application/json'
```

### 84. 获取数据库信息-关联服务
- **描述**: 获取数据库信息-关联服务
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/sitelink/get_mysql_info' \
-H 'Content-Type: application/json'
```

### 85. 获取站点信息
- **描述**: 获取站点信息
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/sitelink/get_site_info' \
-H 'Content-Type: application/json'
```

### 86. 修改ftp链接
- **描述**: 修改ftp链接
- **参数**: (AnyObject - 参数为空)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/sitelink/modify_ftp_link' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 87. 修改mysql链接
- **描述**: 修改mysql链接
- **参数**: (AnyObject - 参数为空)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/sitelink/modify_mysql_link' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 88. 获取ftp信息
- **描述**: 获取ftp信息
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/sitelink/get_ftp_info' \
-H 'Content-Type: application/json'
```

### 89. 删除索引
- **描述**: 删除索引
- **参数**:
  - `sid` (number)
  - `db_name` (string)
  - `tb_name` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/sphinx_search/del_index_list' \
-H 'Content-Type: application/json' \
-d '{
  "sid": your_sid_value,
  "db_name": "your_db_name_value",
  "tb_name": "your_tb_name_value"
}'
```

### 90. 获取索引列表
- **描述**: 获取索引列表
- **参数**:
  - `sid` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/sphinx_search/get_index_list' \
-H 'Content-Type: application/json' \
-d '{
  "sid": your_sid_value
}'
```

### 91. 获取数据库信息-敏感词检测
- **描述**: 获取数据库信息-敏感词检测
- **参数**:
  - `sid` (number | string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/sphinx_search/get_database' \
-H 'Content-Type: application/json' \
-d '{
  "sid": "your_sid_value"
}'
```

### 92. 获取用户数据
- **描述**: 获取用户数据
- **参数**:
  - `search` (string, 可选)
  - `sid` (number | string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/GetMysqlUser' \
-H 'Content-Type: application/json' \
-d '{
  "search": "your_search_value",
  "sid": "your_sid_value"
}'
```

### 93. 设置告警状态
- **描述**: 设置告警状态
- **参数**:
  - `name` (string) (告警名称)
  - `id` (number)
  - `status` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/push/set_push_status' \
-H 'Content-Type: application/json' \
-d '{
  "name": "your_name_value",
  "id": your_id_value,
  "status": your_status_value
}'
```

### 94. 删除用户管理
- **描述**: 删除用户管理
- **参数**:
  - `username` (string)
  - `host` (string)
  - `sid` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/DelMysqlUser' \
-H 'Content-Type: application/json' \
-d '{
  "username": "your_username_value",
  "host": "your_host_value",
  "sid": your_sid_value
}'
```

### 95. 导出用户数据
- **描述**: 导出用户数据
- **参数**:
  - `username` (string)
  - `host` (string)
  - `sid` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/GetUserGrants' \
-H 'Content-Type: application/json' \
-d '{
  "username": "your_username_value",
  "host": "your_host_value",
  "sid": your_sid_value
}'
```

### 96. 获取数据库数据
- **描述**: 获取数据库数据
- **参数**:
  - `sid` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/GetDatabasesList' \
-H 'Content-Type: application/json' \
-d '{
  "sid": your_sid_value
}'
```

### 97. 添加用户管理
- **描述**: 添加用户管理
- **参数**:
  - `sid` (number)
  - `username` (string)
  - `host` (string)
  - `password` (string, 可选)
  - `db_name` (string)
  - `tb_name` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/AddMysqlUser' \
-H 'Content-Type: application/json' \
-d '{
  "sid": your_sid_value,
  "username": "your_username_value",
  "host": "your_host_value",
  "password": "your_password_value",
  "db_name": "your_db_name_value",
  "tb_name": "your_tb_name_value"
}'
```

### 98. 删除用户数据
- **描述**: 删除用户数据
- **参数**:
  - `sid` (number)
  - `username` (string)
  - `host` (string)
  - `password` (string, 可选)
  - `db_name` (string)
  - `tb_name` (string)
  - `with_grant` (number)
  - `access` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/DelUserGrants' \
-H 'Content-Type: application/json' \
-d '{
  "sid": your_sid_value,
  "username": "your_username_value",
  "host": "your_host_value",
  "password": "your_password_value",
  "db_name": "your_db_name_value",
  "tb_name": "your_tb_name_value",
  "with_grant": your_with_grant_value,
  "access": "your_access_value"
}'
```

### 99. 添加用户数据
- **描述**: 添加用户数据
- **参数**:
  - `sid` (number)
  - `username` (string)
  - `host` (string)
  - `password` (string, 可选)
  - `db_name` (string)
  - `tb_name` (string)
  - `with_grant` (number)
  - `access` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/AddUserGrants' \
-H 'Content-Type: application/json' \
-d '{
  "sid": your_sid_value,
  "username": "your_username_value",
  "host": "your_host_value",
  "password": "your_password_value",
  "db_name": "your_db_name_value",
  "tb_name": "your_tb_name_value",
  "with_grant": your_with_grant_value,
  "access": "your_access_value"
}'
```

### 100. 修改用户密码
- **描述**: 修改用户密码
- **参数**:
  - `username` (string)
  - `password` (string)
  - `host` (string)
  - `sid` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/ChangeUserPass' \
-H 'Content-Type: application/json' \
-d '{
  "username": "your_username_value",
  "password": "your_password_value",
  "host": "your_host_value",
  "sid": your_sid_value
}'
```

### 101. 获取自动备份数据库配置
- **描述**: 获取自动备份数据库配置
- **参数**:
  - `name` (string) (数据库名称)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/get_auto_config' \
-H 'Content-Type: application/json' \
-d '{
  "name": "your_name_value"
}'
```

### 102. 设置自动备份数据库配置
- **描述**: 设置自动备份数据库配置
- **参数**:
  - `name` (string) (数据库名称)
  - `status` (number) (状态)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/set_auto_config' \
-H 'Content-Type: application/json' \
-d '{
  "name": "your_name_value",
  "status": your_status_value
}'
```

### 103. 获取数据库分类
- **描述**: 获取数据库分类
- **参数**:
  - `db_type` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/view_database_types' \
-H 'Content-Type: application/json' \
-d '{
  "db_type": "your_db_type_value"
}'
```

### 104. 添加数据库分类
- **描述**: 添加数据库分类
- **参数**:
  - `db_type` (string)
  - `ps` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/add_database_types' \
-H 'Content-Type: application/json' \
-d '{
  "db_type": "your_db_type_value",
  "ps": "your_ps_value"
}'
```

### 105. 删除数据库分类
- **描述**: 删除数据库分类
- **参数**:
  - `id` (number)
  - `db_type` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/delete_database_types' \
-H 'Content-Type: application/json' \
-d '{
  "id": your_id_value,
  "db_type": "your_db_type_value"
}'
```

### 106. 修改数据库分类
- **描述**: 修改数据库分类
- **参数**:
  - `db_type` (string)
  - `id` (number)
  - `ps` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/update_database_types' \
-H 'Content-Type: application/json' \
-d '{
  "db_type": "your_db_type_value",
  "id": your_id_value,
  "ps": "your_ps_value"
}'
```

### 107. 设置pgsql数据库权限
- **描述**: 设置pgsql数据库权限
- **参数**:
  - `data` (string) (数据库 JSON字符串格式)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/pgsql/modify_pgsql_listen_ip' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_data_json_string"
}'
```

### 108. 同步数据库sqllite
- **描述**: 同步数据库sqllite
- **参数**:
  - `data` (AnyObject) (请求数据库信息)
  - `type` (string, 可选) (1:同步到云端 2:从云端同步，将拼接到URL中)
- **cURL (示例 type='your_type_value')**:
```bash
curl -X POST 'YOUR_BASE_URL/database/SyncToDatabases&type=your_type_value' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 109. 获取指定数据库所有表数据
- **描述**: 获取指定数据库所有表数据
- **参数**:
  - `path` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/sqlite/get_table_list' \
-H 'Content-Type: application/json' \
-d '{
  "data": "{\"path\":\"your_path_value\"}"
}'
```

### 110. 查询sql语句
- **描述**: 查询sql语句
- **参数**:
  - `path` (string)
  - `sql_shell` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/sqlite/query_sql' \
-H 'Content-Type: application/json' \
-d '{
  "data": "{\"path\":\"your_path_value\",\"sql_shell\":\"your_sql_shell_value\"}"
}'
```

### 111. 获取指定数据库表信息
- **描述**: 获取指定数据库表信息
- **参数**:
  - `path` (string)
  - `table` (string)
  - `p` (number)
  - `search` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/sqlite/get_table_info' \
-H 'Content-Type: application/json' \
-d '{
  "data": "{\"path\":\"your_path_value\",\"table\":\"your_table_value\",\"p\":your_p_value,\"search\":\"your_search_value\"}"
}'
```

### 112. 获取指定数据库表字段
- **描述**: 获取指定数据库表字段
- **参数**:
  - `path` (string)
  - `table` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/sqlite/get_keys_bytable' \
-H 'Content-Type: application/json' \
-d '{
  "data": "{\"path\":\"your_path_value\",\"table\":\"your_table_value\"}"
}'
```

### 113. 删除表数据
- **描述**: 删除表数据
- **参数**:
  - `path` (string)
  - `table` (string)
  - `where_data` (any)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/sqlite/delete_table_data' \
-H 'Content-Type: application/json' \
-d '{
  "data": "{\"path\":\"your_path_value\",\"table\":\"your_table_value\",\"where_data\":your_where_data_value}"
}'
```

### 114. 插入表数据
- **描述**: 插入表数据
- **参数**:
  - `data` (string) (JSON字符串格式)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/sqlite/create_table_data' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_data_json_string"
}'
```

### 115. 修改表数据
- **描述**: 修改表数据
- **参数**:
  - `data` (string) (JSON字符串格式)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/sqlite/update_table_info' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_data_json_string"
}'
```

### 116. 备份sqlite数据库
- **描述**: 备份sqlite数据库
- **参数**:
  - `data` (string) (JSON字符串格式)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/datalist/batch/batch_backup_sqlite' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_ISqliteTableList_object_or_array"
}'
```

### 117. 删除sqlite数据库备份
- **描述**: 删除sqlite数据库备份
- **参数**:
  - `data` (string) (JSON字符串格式)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/datalist/batch/batch_delete_sqlite' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_ISqliteTableList_object_or_array"
}'
```

### 118. 备份sqlite数据库 (ToBackup)
- **描述**: 备份sqlite数据库
- **参数**:
  - `data` (string) (JSON字符串格式)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/sqlite/ToBackup' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_data_json_string"
}'
```

### 119. 设置数据库分类
- **描述**: 设置数据库分类
- **参数**: (AnyObject - 参数为空)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/datalist/batch/batch_set_mysql_type' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 120. 获取等保基础设置 (mysql)
- **描述**: 获取等保基础设置 - mysql
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/GetTimeOut' \
-H 'Content-Type: application/json'
```

### 121. 设置等保基础设置 (mysql)
- **描述**: 设置等保基础设置 - mysql
- **参数**:
  - `wait_timeout` (string) (等待超时时间)
  - `interactive_timeout` (string) (交互超时时间)
  - `default_password_lifetime` (string) (密码到期限制)
  - `expire_logs_days` (string) (日志保存时间)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/SetTimeOut' \
-H 'Content-Type: application/json' \
-d '{
  "wait_timeout": "your_wait_timeout_value",
  "interactive_timeout": "your_interactive_timeout_value",
  "default_password_lifetime": "your_default_password_lifetime_value",
  "expire_logs_days": "your_expire_logs_days_value"
}'
```

### 122. 获取密码复杂度设置 (mysql)
- **描述**: 获取密码复杂度设置 - mysql
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/GetValidatePasswordConfig' \
-H 'Content-Type: application/json'
```

### 123. 设置密码复杂度设置 (mysql)
- **描述**: 设置密码复杂度设置 - mysql
- **参数**:
  - `status` ('on' | 'off')
  - `validate_password_length` (string, 可选)
  - `validate_password_mixed_case_count` (string, 可选)
  - `validate_password_number_count` (string, 可选)
  - `validate_password_special_char_count` (string, 可选)
  - `validate_password_policy` (string, 可选)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/SetValidatePasswordConfig' \
-H 'Content-Type: application/json' \
-d '{
  "status": "your_status_value",
  "validate_password_length": "your_validate_password_length_value",
  "validate_password_mixed_case_count": "your_validate_password_mixed_case_count_value",
  "validate_password_number_count": "your_validate_password_number_count_value",
  "validate_password_special_char_count": "your_validate_password_special_char_count_value",
  "validate_password_policy": "your_validate_password_policy_value"
}'
```

### 124. 获取登录限制设置 (mysql)
- **描述**: 获取登录限制设置 - mysql
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/GetLoginFailed' \
-H 'Content-Type: application/json'
```

### 125. 设置登录限制 (mysql)
- **描述**: 设置登录限制 - mysql
- **参数**:
  - `status` ('on' | 'off')
  - `connection_control_failed_connections_threshold` (string, 可选) (连接失败次数)
  - `connection_control_min_connection_delay` (string, 可选) (最小连接延迟)
  - `connection_control_max_connection_delay` (string, 可选) (最大连接延迟)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/SetLoginFailed' \
-H 'Content-Type: application/json' \
-d '{
  "status": "your_status_value",
  "connection_control_failed_connections_threshold": "your_threshold_value",
  "connection_control_min_connection_delay": "your_min_delay_value",
  "connection_control_max_connection_delay": "your_max_delay_value"
}'
```

### 126. 获取审计日志设置 (mysql)
- **描述**: 获取审计日志设置 - mysql
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/GetAuditLogConfig' \
-H 'Content-Type: application/json'
```

### 127. 设置审计日志设置 (mysql)
- **描述**: 设置审计日志设置 - mysql
- **参数**:
  - `status` ('on' | 'off')
  - `audit_log_buffer_size` (number, 可选) (日志缓冲区大小 单位为字节)
  - `audit_log_file` (string, 可选) (审计日志名称)
  - `audit_log_flush` ('ON' | 'OFF', 可选) (审计日志刷新)
  - `audit_log_format` ('JSON' | 'OLD' | 'NEW' | 'CSV', 可选) (存储日志类型)
  - `audit_log_policy` ('ALL' | 'LOGINS' | 'QUERIES', 可选) (审计日志记录策略)
  - `audit_log_rotate_on_size` (number, 可选) (日志文件最大大小，0为不限制)
  - `audit_log_rotations` (string, 可选) (保留的最大日志文件数)
  - `audit_log_strategy` ('ASYNCHRONOUS' | 'PERFORMANCE' | 'SYNCHRONOUS', 可选) (日志写入类型)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/SetAuditLogConfig' \
-H 'Content-Type: application/json' \
-d '{
  "status": "your_status_value",
  "audit_log_buffer_size": your_audit_log_buffer_size_value,
  "audit_log_file": "your_audit_log_file_value",
  "audit_log_flush": "your_audit_log_flush_value",
  "audit_log_format": "your_audit_log_format_value",
  "audit_log_policy": "your_audit_log_policy_value",
  "audit_log_rotate_on_size": your_audit_log_rotate_on_size_value,
  "audit_log_rotations": "your_audit_log_rotations_value",
  "audit_log_strategy": "your_audit_log_strategy_value"
}'
```

### 128. 获取审计日志高级设置数据库列表 (mysql)
- **描述**: 获取审计日志高级设置数据库列表 - mysql
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/GetDatabaseList' \
-H 'Content-Type: application/json' \
-d '{
  "id": 0
}'
```

### 129. 获取审计日志高级设置用户列表 (mysql)
- **描述**: 获取审计日志高级设置用户列表 - mysql
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/GeUserHostList' \
-H 'Content-Type: application/json' \
-d '{
  "id": 0
}'
```

### 130. 获取审计日志高级设置查询列表 (mysql)
- **描述**: 获取审计日志高级设置查询列表 - mysql
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/GetMysqlCommands' \
-H 'Content-Type: application/json' \
-d '{
  "id": 0
}'
```

### 131. 设置审计日志高级设置 (mysql)
- **描述**: 设置审计日志高级设置 - mysql
- **参数**:
  - `type` ('exclude' | 'include') (操作类型 exclude 排除 include 包含)
  - `accounts` (string) (记录的用户)
  - `commands` (string) (记录的语句)
  - `databases` (string) (记录的数据库)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/SetAuditLogRules' \
-H 'Content-Type: application/json' \
-d '{
  "type": "your_type_value",
  "accounts": "your_accounts_value",
  "commands": "your_commands_value",
  "databases": "your_databases_value"
}'
```

### 132. 获取审计日志--日志 (mysql)
- **描述**: 获取审计日志--日志 - mysql
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/GetAuditLog' \
-H 'Content-Type: application/json'
```

### 133. 刷新写入权限状态
- **描述**: 刷新写入权限状态
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/quota/database_quota_check' \
-H 'Content-Type: application/json'
```

### 134. 检查数据库是否加密
- **描述**: 检查数据库是否加密
- **参数**: (AnyObject - 参数为空)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/is_zip_password_protected' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 135. 备份数据库 (sqlite)
- **描述**: 备份数据库 - sqlite
- **参数**:
  - `data` (ISqliteTableList - 实际可能为包含 ISqliteTableList 结构的对象)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/datalist/batch/batch_backup_sqlite' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_ISqliteTableList_object_or_array"
}'
```

### 136. 删除数据库 (sqlite)
- **描述**: 删除数据库 - sqlite
- **参数**:
  - `data` (ISqliteTableList - 实际可能为包含 ISqliteTableList 结构的对象)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/datalist/batch/batch_delete_sqlite' \
-H 'Content-Type: application/json' \
-d '{
  "data": "your_ISqliteTableList_object_or_array"
}'
```

### 137. 批量设置权限 (mysql)
- **描述**: 批量设置权限 - mysql
- **参数**: (any - 参数结构未知，此处留空)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/datalist/batch/batch_set_mysql_access' \
-H 'Content-Type: application/json' \
-d '{}'
```
