# API 文档

## 目录
1. [获取消息中心](#1-获取消息中心)
2. [设置全部已读](#2-设置全部已读)
3. [全部删除](#3-全部删除)
4. [获取告警列表](#4-获取告警列表)
5. [设置告警状态](#5-设置告警状态)
6. [删除告警配置](#6-删除告警配置)
7. [获取备份还原列表](#7-获取备份还原列表)
8. [删除备份任务](#8-删除备份任务)
9. [立即执行备份](#9-立即执行备份)
10. [立即执行恢复](#10-立即执行恢复)
11. [获取告警日志](#11-获取告警日志)
12. [获取备份数据显示列表](#12-获取备份数据显示列表)
13. [添加/恢复备份](#13-添加恢复备份)
14. [获取备份还原数据日志](#14-获取备份还原数据日志)
15. [关闭面板事件处理](#15-关闭面板事件处理)
16. [设置离线模式](#16-设置离线模式)
17. [监听IPv6状态](#17-监听ipv6状态)
18. [开发者模式](#18-开发者模式)
19. [设置API配置](#19-设置api配置)
20. [设置在线客服](#20-设置在线客服)
21. [设置用户体验改进计划状态](#21-设置用户体验改进计划状态)
22. [设置面板配置](#22-设置面板配置)
23. [设置左侧菜单标题](#23-设置左侧菜单标题)
24. [同步服务器时间](#24-同步服务器时间)
25. [修改用户名](#25-修改用户名)
26. [设置面板密码](#26-设置面板密码)
27. [解绑宝塔账号](#27-解绑宝塔账号)
28. [设置云端请求方式](#28-设置云端请求方式)
29. [设置云端启用节点](#29-设置云端启用节点)
30. [设置云端请求线路](#30-设置云端请求线路)
31. [设置-选择地区信息](#31-设置-选择地区信息)
32. [删除面板免端口访问配置](#32-删除面板免端口访问配置)
33. [设置动态口令](#33-设置动态口令)
34. [获取访问设备验证状态](#34-获取访问设备验证状态)
35. [设置访问设备验证状态](#35-设置访问设备验证状态)
36. [开关告警任务](#36-开关告警任务)
37. [添加告警任务](#37-添加告警任务)
38. [设置密码复杂度](#38-设置密码复杂度)
39. [设置安全入口](#39-设置安全入口)
40. [设置未认证响应状态](#40-设置未认证响应状态)
41. [获取密码过期验证状态](#41-获取密码过期验证状态)
42. [设置密码过期时间](#42-设置密码过期时间)
43. [获取API配置](#43-获取api配置)
44. [获取云端节点配置](#44-获取云端节点配置)
45. [获取动态口令认证状态](#45-获取动态口令认证状态)
46. [获取面板免端口访问配置](#46-获取面板免端口访问配置)
47. [获取证书列表](#47-获取证书列表)
48. [获取证书信息](#48-获取证书信息)
49. [设置面板免端口访问配置](#49-设置面板免端口访问配置)
50. [获取动态口令认证状态 (get_key)](#50-获取动态口令认证状态-get_key)
51. [获取动态口令数据](#51-获取动态口令数据)
52. [获取操作日志](#52-获取操作日志)
53. [删除临时授权链接](#53-删除临时授权链接)
54. [获取临时授权列表](#54-获取临时授权列表)
55. [创建临时授权链接](#55-创建临时授权链接)
56. [获取UA限制信息](#56-获取ua限制信息)
57. [修改UA限制信息](#57-修改ua限制信息)
58. [删除UA限制信息](#58-删除ua限制信息)
59. [添加UA限制信息](#59-添加ua限制信息)
60. [获取-选择地区信息 (get_limit_area)](#60-获取-选择地区信息-get_limit_area)
61. [删除告警任务](#61-删除告警任务)
62. [清空告警任务记录](#62-清空告警任务记录)
63. [删除单条告警任务记录](#63-删除单条告警任务记录)
64. [获取告警任务记录](#64-获取告警任务记录)
65. [设置BasicAuth基础认证](#65-设置basicauth基础认证)
66. [设置面板证书配置](#66-设置面板证书配置)
67. [保存自定义证书信息](#67-保存自定义证书信息)
68. [获取面板证书配置](#68-获取面板证书配置)
69. [获取自定义证书信息](#69-获取自定义证书信息)
70. [获取信息](#70-获取信息)
71. [获取进程信息](#71-获取进程信息)
72. [获取云存储插件安装情况](#72-获取云存储插件安装情况)
73. [获取本地目录配置](#73-获取本地目录配置)
74. [配置本地目录](#74-配置本地目录)
75. [删除云存储账号](#75-删除云存储账号)
76. [获取腾讯云存储方式](#76-获取腾讯云存储方式)
77. [保存腾讯云存储方式](#77-保存腾讯云存储方式)
78. [修改腾讯云存储方式](#78-修改腾讯云存储方式)
79. [获取腾讯云存储配置](#79-获取腾讯云存储配置)
80. [保存ftp存储配置](#80-保存ftp存储配置)
81. [获取ftp存储配置](#81-获取ftp存储配置)
82. [保存阿里云存储配置](#82-保存阿里云存储配置)
83. [获取阿里云存储配置](#83-获取阿里云存储配置)
84. [保存七牛云存储配置](#84-保存七牛云存储配置)
85. [获取七牛云存储配置](#85-获取七牛云存储配置)
86. [下载备份文件](#86-下载备份文件)
87. [获取WebDAV配置](#87-获取webdav配置)
88. [保存WebDAV配置](#88-保存webdav配置)
89. [获取备份列表 (新版)](#89-获取备份列表-新版)
90. [下载备份文件 (新版)](#90-下载备份文件-新版)
91. [删除备份文件 (新版)](#91-删除备份文件-新版)
92. [取消备份 (新版)](#92-取消备份-新版)
93. [立即执行备份、还原任务 (新版)](#93-立即执行备份还原任务-新版)
94. [还原备份文件 (新版)](#94-还原备份文件-新版)
95. [获取备份、还原日志 (新版)](#95-获取备份还原日志-新版)
96. [获取备份、还原详情 (新版)](#96-获取备份还原详情-新版)
97. [获取备份、还原进度 (新版)](#97-获取备份还原进度-新版)
98. [添加备份 (新版)](#98-添加备份-新版)
99. [取消备份、还原任务 (新版)](#99-取消备份还原任务-新版)
100. [获取备份数据统计接口](#100-获取备份数据统计接口)
101. [检查SSH认证方式](#101-检查ssh认证方式)
102. [开始迁移](#102-开始迁移)
103. [终止迁移](#103-终止迁移)
104. [获取迁移任务状态](#104-获取迁移任务状态)
105. [获取迁移进度](#105-获取迁移进度)
106. [获取迁移历史](#106-获取迁移历史)
107. [获取迁移日志](#107-获取迁移日志)
108. [获取迁移详情](#108-获取迁移详情)
109. [删除迁移历史](#109-删除迁移历史)

---

## API 列表

### 1. 获取消息中心
- **描述**: 获取消息中心
- **参数**:
  - `page` (number)
  - `size` (number)
  - `sub_type` (string)
  - `is_read` (boolean)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/msgbox/get_msg_list' \
-H 'Content-Type: application/json' \
-d '{
  "page": "your_page_value",
  "size": "your_size_value",
  "sub_type": "your_sub_type_value",
  "is_read": "your_is_read_value"
}'
```

### 2. 设置全部已读
- **描述**: 设置全部已读
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/msgbox/read_all' \
-H 'Content-Type: application/json'
```

### 3. 全部删除
- **描述**: 全部删除
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/msgbox/delete_all' \
-H 'Content-Type: application/json'
```

### 4. 获取告警列表
- **描述**: 获取告警列表
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/push/get_push_list' \
-H 'Content-Type: application/json'
```

### 5. 设置告警状态
- **描述**: 设置告警状态
- **参数**:
  - `id` (string)
  - `name` (string)
  - `status` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/push/set_push_status' \
-H 'Content-Type: application/json' \
-d '{
  "id": "your_id_value",
  "name": "your_name_value",
  "status": "your_status_value"
}'
```

### 6. 删除告警配置
- **描述**: 获取消息详情 (实际为删除告警配置)
- **参数**:
  - `name` (string)
  - `id` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/push/del_push_config' \
-H 'Content-Type: application/json' \
-d '{
  "name": "your_name_value",
  "id": "your_id_value"
}'
```

### 7. 获取备份还原列表
- **描述**: 获取备份还原列表
- **参数**:
  - `page` (number)
  - `limit` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/whole_machine_backup/get_task_list' \
-H 'Content-Type: application/json' \
-d '{
  "page": "your_page_value",
  "limit": "your_limit_value"
}'
```

### 8. 删除备份任务
- **描述**: 删除备份任务
- **参数**:
  - `id` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/whole_machine_backup/del_task' \
-H 'Content-Type: application/json' \
-d '{
  "id": "your_id_value"
}'
```

### 9. 立即执行备份
- **描述**: 立即执行备份
- **参数**:
  - `id` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/whole_machine_backup/backup' \
-H 'Content-Type: application/json' \
-d '{
  "id": "your_id_value"
}'
```

### 10. 立即执行恢复
- **描述**: 立即执行恢复
- **参数**:
  - `id` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/whole_machine_backup/reduction' \
-H 'Content-Type: application/json' \
-d '{
  "id": "your_id_value"
}'
```

### 11. 获取告警日志
- **描述**: 获取告警日志
- **参数**: (AnyObject - 参数为空)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/push/get_push_logs' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 12. 获取备份数据显示列表
- **描述**: 获取备份数据显示列表
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/whole_machine_backup/get_data_list' \
-H 'Content-Type: application/json'
```

### 13. 添加/恢复备份
- **描述**: 添加/恢复备份
- **参数**: (AnyObject - 参数为空)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/whole_machine_backup/create_task' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 14. 获取备份还原数据日志
- **描述**: 获取备份还原数据日志
- **参数**:
  - `id` (string | number)
  (type 参数决定路径，此处合并展示)
- **cURL (backup)**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/whole_machine_backup/get_backup_log' \
-H 'Content-Type: application/json' \
-d '{
  "id": "your_id_value"
}'
```
- **cURL (reduction)**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/whole_machine_backup/get_reduction_log' \
-H 'Content-Type: application/json' \
-d '{
  "id": "your_id_value"
}'
```

### 15. 关闭面板事件处理
- **描述**: 关闭面板事件处理
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/ClosePanel' \
-H 'Content-Type: application/json'
```

### 16. 设置离线模式
- **描述**: 设置离线模式
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/set_local' \
-H 'Content-Type: application/json'
```

### 17. 监听IPv6状态
- **描述**: 监听IPv6状态
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/set_ipv6_status' \
-H 'Content-Type: application/json'
```

### 18. 开发者模式
- **描述**: 开发者模式
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/set_debug' \
-H 'Content-Type: application/json'
```

### 19. 设置API配置
- **描述**: 设置API配置
- **参数**:
  - `t_type` (number)
  - `limit_addr` (string, 可选)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/set_token' \
-H 'Content-Type: application/json' \
-d '{
  "t_type": "your_t_type_value",
  "limit_addr": "your_limit_addr_value"
}'
```

### 20. 设置在线客服
- **描述**: 设置在线客服
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/show_workorder' \
-H 'Content-Type: application/json'
```

### 21. 设置用户体验改进计划状态
- **描述**: 设置用户体验改进计划状态
- **参数**:
  - `status` (number | string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/set_improvement' \
-H 'Content-Type: application/json' \
-d '{
  "status": "your_status_value"
}'
```

### 22. 设置面板配置
- **描述**: 设置面板配置
- **参数**:
  - `webname` (string, 可选)
  - `session_timeout` (number, 可选)
  - `domain` (string, 可选)
  - `limitip` (string, 可选)
  - `sites_path` (string, 可选)
  - `backup_path` (string, 可选)
  - `address` (string, 可选)
  - `systemdate` (string, 可选)
  - `port` (number, 可选)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/setPanel' \
-H 'Content-Type: application/json' \
-d '{
  "webname": "your_webname_value",
  "session_timeout": "your_session_timeout_value",
  "domain": "your_domain_value",
  "limitip": "your_limitip_value",
  "sites_path": "your_sites_path_value",
  "backup_path": "your_backup_path_value",
  "address": "your_address_value",
  "systemdate": "your_systemdate_value",
  "port": "your_port_value"
}'
```

### 23. 设置左侧菜单标题
- **描述**: 设置左侧菜单标题
- **参数**:
  - `title` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/set_left_title' \
-H 'Content-Type: application/json' \
-d '{
  "title": "your_title_value"
}'
```

### 24. 同步服务器时间
- **描述**: 同步服务器时间
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/syncDate' \
-H 'Content-Type: application/json'
```

### 25. 修改用户名
- **描述**: 修改用户名
- **参数**:
  - `username1` (string)
  - `username2` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/setUsername' \
-H 'Content-Type: application/json' \
-d '{
  "username1": "your_username1_value",
  "username2": "your_username2_value"
}'
```

### 26. 设置面板密码
- **描述**: 设置面板密码
- **参数**:
  - `password1` (string)
  - `password2` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/setPassword' \
-H 'Content-Type: application/json' \
-d '{
  "password1": "your_password1_value",
  "password2": "your_password2_value"
}'
```

### 27. 解绑宝塔账号
- **描述**: 解绑宝塔账号
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl/DelToken' \
-H 'Content-Type: application/json'
```

### 28. 设置云端请求方式
- **描述**: 设置云端请求方式
- **参数**:
  - `http_type` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/set_request_type' \
-H 'Content-Type: application/json' \
-d '{
  "http_type": "your_http_type_value"
}'
```

### 29. 设置云端启用节点
- **描述**: 设置云端启用节点
- **参数**:
  - `node_id` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/set_node_config' \
-H 'Content-Type: application/json' \
-d '{
  "node_id": "your_node_id_value"
}'
```

### 30. 设置云端请求线路
- **描述**: 设置云端请求线路
- **参数**:
  - `iptype` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/set_request_iptype' \
-H 'Content-Type: application/json' \
-d '{
  "iptype": "your_iptype_value"
}'
```

### 31. 设置-选择地区信息
- **描述**: 设置-选择地区信息
- **参数**:
  - `limit_area_status` (boolean)
  - `limit_type` (string, 可选)
  - `limit_area` (string, 可选)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/set_limit_area' \
-H 'Content-Type: application/json' \
-d '{
  "limit_area_status": "your_limit_area_status_value",
  "limit_type": "your_limit_type_value",
  "limit_area": "your_limit_area_value"
}'
```

### 32. 删除面板免端口访问配置
- **描述**: 删除面板免端口访问配置
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/panel_reverse_generation/del_panel_generation' \
-H 'Content-Type: application/json'
```

### 33. 设置动态口令
- **描述**: 设置动态口令
- **参数**:
  - `act` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/set_two_step_auth' \
-H 'Content-Type: application/json' \
-d '{
  "act": "your_act_value"
}'
```

### 34. 获取访问设备验证状态
- **描述**: 获取访问设备验证状态
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/get_ssl_verify' \
-H 'Content-Type: application/json'
```

### 35. 设置访问设备验证状态
- **描述**: 设置访问设备验证状态
- **参数**:
  - `status` (number)
  - `crl` (string, 可选)
  - `cert` (string, 可选)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/set_ssl_verify' \
-H 'Content-Type: application/json' \
-d '{
  "status": "your_status_value",
  "crl": "your_crl_value",
  "cert": "your_cert_value"
}'
```

### 36. 开关告警任务
- **描述**: 开关告警任务
- **参数**:
  - `task_id` (string)
  - `status` (number, 可选)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/push/task/change_task_conf' \
-H 'Content-Type: application/json' \
-d '{
  "task_id": "your_task_id_value",
  "status": "your_status_value"
}'
```

### 37. 添加告警任务
- **描述**: 添加告警任务
- **参数**: (AnyObject - 参数为空)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/push/task/set_task_conf' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 38. 设置密码复杂度
- **描述**: 设置密码复杂度
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/set_password_safe' \
-H 'Content-Type: application/json'
```

### 39. 设置安全入口
- **描述**: 设置安全入口
- **参数**:
  - `admin_path` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/set_admin_path' \
-H 'Content-Type: application/json' \
-d '{
  "admin_path": "your_admin_path_value"
}'
```

### 40. 设置未认证响应状态
- **描述**: 设置未认证响应状态
- **参数**:
  - `status_code` (number | string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/set_not_auth_status' \
-H 'Content-Type: application/json' \
-d '{
  "status_code": "your_status_code_value"
}'
```

### 41. 获取密码过期验证状态
- **描述**: 获取密码过期验证状态
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/get_password_config' \
-H 'Content-Type: application/json'
```

### 42. 设置密码过期时间
- **描述**: 设置密码过期时间
- **参数**:
  - `expire` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/set_password_expire' \
-H 'Content-Type: application/json' \
-d '{
  "expire": "your_expire_value"
}'
```

### 43. 获取API配置
- **描述**: 获取API配置
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/get_token' \
-H 'Content-Type: application/json'
```

### 44. 获取云端节点配置
- **描述**: 获取云端节点配置
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/get_node_config' \
-H 'Content-Type: application/json'
```

### 45. 获取动态口令认证状态
- **描述**: 获取动态口令认证状态
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/check_two_step' \
-H 'Content-Type: application/json'
```

### 46. 获取面板免端口访问配置
- **描述**: 获取面板免端口访问配置
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/panel_reverse_generation/get_panel_generation' \
-H 'Content-Type: application/json'
```

### 47. 获取证书列表
- **描述**: 获取证书列表
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl/get_cert_list' \
-H 'Content-Type: application/json'
```

### 48. 获取证书信息
- **描述**: 获取证书信息
- **参数**:
  - `ssl_id` (string)
  - `ssl_hash` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl/get_cert_info' \
-H 'Content-Type: application/json' \
-d '{
  "ssl_id": "your_ssl_id_value",
  "ssl_hash": "your_ssl_hash_value"
}'
```

### 49. 设置面板免端口访问配置
- **描述**: 设置面板免端口访问配置
- **参数**: (AnyObject - 参数为空)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/panel_reverse_generation/AddSite' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 50. 获取动态口令认证状态 (get_key)
- **描述**: 获取动态口令认证状态
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/get_key' \
-H 'Content-Type: application/json'
```

### 51. 获取动态口令数据
- **描述**: 获取动态口令数据
- **参数**:
  - `act` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/get_qrcode_data' \
-H 'Content-Type: application/json' \
-d '{
  "act": "your_act_value"
}'
```

### 52. 获取操作日志
- **描述**: 获取操作日志
- **参数**:
  - `id` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/get_temp_login_logs' \
-H 'Content-Type: application/json' \
-d '{
  "id": "your_id_value"
}'
```

### 53. 删除临时授权链接
- **描述**: 删除临时授权链接
- **参数**:
  - `id` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/remove_temp_login' \
-H 'Content-Type: application/json' \
-d '{
  "id": "your_id_value"
}'
```

### 54. 获取临时授权列表
- **描述**: 获取临时授权列表
- **参数**:
  - `p` (number)
  - `rows` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/get_temp_login' \
-H 'Content-Type: application/json' \
-d '{
  "p": "your_p_value",
  "rows": "your_rows_value"
}'
```

### 55. 创建临时授权链接
- **描述**: 创建临时授权链接
- **参数**:
  - `expire_time` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/set_temp_login' \
-H 'Content-Type: application/json' \
-d '{
  "expire_time": "your_expire_time_value"
}'
```

### 56. 获取UA限制信息
- **描述**: 获取UA限制信息
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/get_limit_ua' \
-H 'Content-Type: application/json'
```

### 57. 修改UA限制信息
- **描述**: 修改UA限制信息
- **参数**:
  - `status` (number, 可选)
  - `new_name` (string, 可选)
  - `ua_list` (string, 可选)
  - `id` (number, 可选)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/modify_ua' \
-H 'Content-Type: application/json' \
-d '{
  "status": "your_status_value",
  "new_name": "your_new_name_value",
  "ua_list": "your_ua_list_value",
  "id": "your_id_value"
}'
```

### 58. 删除UA限制信息
- **描述**: 删除UA限制信息
- **参数**:
  - `id` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/delete_ua' \
-H 'Content-Type: application/json' \
-d '{
  "id": "your_id_value"
}'
```

### 59. 添加UA限制信息
- **描述**: 添加UA限制信息
- **参数**:
  - `ua_list` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/set_ua' \
-H 'Content-Type: application/json' \
-d '{
  "ua_list": "your_ua_list_value"
}'
```

### 60. 获取-选择地区信息 (get_limit_area)
- **描述**: 获取-选择地区信息
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/get_limit_area' \
-H 'Content-Type: application/json'
```

### 61. 删除告警任务
- **描述**: 删除告警任务
- **参数**:
  - `task_id` (string | number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/push/task/remove_task_conf' \
-H 'Content-Type: application/json' \
-d '{
  "task_id": "your_task_id_value"
}'
```

### 62. 清空告警任务记录
- **描述**: 清空告警任务记录
- **参数**:
  - `task_id` (string)
  - `record_ids` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/push/task/clear_task_record' \
-H 'Content-Type: application/json' \
-d '{
  "task_id": "your_task_id_value",
  "record_ids": "your_record_ids_value"
}'
```

### 63. 删除单条告警任务记录
- **描述**: 删除单条告警任务记录
- **参数**:
  - `task_id` (string)
  - `record_ids` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/push/task/remove_task_records' \
-H 'Content-Type: application/json' \
-d '{
  "task_id": "your_task_id_value",
  "record_ids": "your_record_ids_value"
}'
```

### 64. 获取告警任务记录
- **描述**: 获取告警任务记录
- **参数**:
  - `task_id` (string)
  - `page` (number)
  - `size` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/push/task/get_task_record' \
-H 'Content-Type: application/json' \
-d '{
  "task_id": "your_task_id_value",
  "page": "your_page_value",
  "size": "your_size_value"
}'
```

### 65. 设置BasicAuth基础认证
- **描述**: 设置BasicAuth基础认证
- **参数**:
  - `basic_user` (string)
  - `basic_pwd` (string)
  - `open` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/set_basic_auth' \
-H 'Content-Type: application/json' \
-d '{
  "basic_user": "your_basic_user_value",
  "basic_pwd": "your_basic_pwd_value",
  "open": "your_open_value"
}'
```

### 66. 设置面板证书配置
- **描述**: 设置面板证书配置
- **参数**:
  - `cert_type` (number)
  - `privateKey` (string)
  - `certPem` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/SetPanelSSL' \
-H 'Content-Type: application/json' \
-d '{
  "cert_type": "your_cert_type_value",
  "privateKey": "your_privateKey_value",
  "certPem": "your_certPem_value"
}'
```

### 67. 保存自定义证书信息
- **描述**: 保存自定义证书信息
- **参数**:
  - `privateKey` (string)
  - `certPem` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/SavePanelSSL' \
-H 'Content-Type: application/json' \
-d '{
  "privateKey": "your_privateKey_value",
  "certPem": "your_certPem_value"
}'
```

### 68. 获取面板证书配置
- **描述**: 获取面板证书配置
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/get_cert_source' \
-H 'Content-Type: application/json'
```

### 69. 获取自定义证书信息
- **描述**: 获取自定义证书信息
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/GetPanelSSL' \
-H 'Content-Type: application/json'
```

### 70. 获取信息
- **描述**: 获取信息
- **参数**:
  - `filename` (string)
  - `num` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/get_lines' \
-H 'Content-Type: application/json' \
-d '{
  "filename": "your_filename_value",
  "num": "your_num_value"
}'
```

### 71. 获取进程信息
- **描述**: 获取进程信息
- **参数**: (AnyObject - 参数为空, url 为函数参数)
- **cURL**:
```bash
# URL 需要根据实际调用时的 url 参数填写
curl -X POST 'YOUR_BASE_URL/YOUR_URL_PARAM_VALUE' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 72. 获取云存储插件安装情况
- **描述**: 获取云存储插件安装情况
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/whole_machine_backup/check_plugins' \
-H 'Content-Type: application/json'
```

### 73. 获取本地目录配置
- **描述**: 获取本地目录配置
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/whole_machine_backup/get_sys_backup_path_config' \
-H 'Content-Type: application/json'
```

### 74. 配置本地目录
- **描述**: 配置本地目录
- **参数**:
  - `sys_backup_path` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/whole_machine_backup/set_sys_backup_path_config' \
-H 'Content-Type: application/json' \
-d '{
  "sys_backup_path": "your_sys_backup_path_value"
}'
```

### 75. 删除云存储账号
- **描述**: 删除云存储账号
- **参数**:
  - `storage_type` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/whole_machine_backup/delete_account' \
-H 'Content-Type: application/json' \
-d '{
  "storage_type": "your_storage_type_value"
}'
```

### 76. 获取腾讯云存储方式
- **描述**: 获取腾讯云存储方式
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=txcos&s=get_pattern_list' \
-H 'Content-Type: application/json'
```

### 77. 保存腾讯云存储方式
- **描述**: 保存腾讯云存储方式
- **参数**: (AnyObject - 参数为空)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&s=set_config&name=txcos' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 78. 修改腾讯云存储方式
- **描述**: 修改腾讯云存储方式
- **参数**:
  - `pattern` (string)
  - `backup_path` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=txcos&s=set_save_path_pattern' \
-H 'Content-Type: application/json' \
-d '{
  "pattern": "your_pattern_value",
  "backup_path": "your_backup_path_value"
}'
```

### 79. 获取腾讯云存储配置
- **描述**: 获取腾讯云存储配置
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=txcos&s=get_config' \
-H 'Content-Type: application/json'
```

### 80. 保存ftp存储配置
- **描述**: 保存ftp存储配置
- **参数**: (AnyObject - 参数为空)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&s=set_config&name=ftp' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 81. 获取ftp存储配置
- **描述**: 获取ftp存储配置
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=ftp&s=get_config' \
-H 'Content-Type: application/json'
```

### 82. 保存阿里云存储配置
- **描述**: 保存阿里云存储配置
- **参数**: (AnyObject - 参数为空)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&s=set_config&name=alioss' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 83. 获取阿里云存储配置
- **描述**: 获取阿里云存储配置
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=alioss&s=get_config' \
-H 'Content-Type: application/json'
```

### 84. 保存七牛云存储配置
- **描述**: 保存七牛云存储配置
- **参数**: (AnyObject - 参数为空)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&s=set_config&name=qiniu' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 85. 获取七牛云存储配置
- **描述**: 获取七牛云存储配置
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=qiniu&s=get_config' \
-H 'Content-Type: application/json'
```

### 86. 下载备份文件
- **描述**: 下载备份文件
- **参数**:
  - `backup_path` (string)
  - `storage_type` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/whole_machine_backup/backup_download' \
-H 'Content-Type: application/json' \
-d '{
  "backup_path": "your_backup_path_value",
  "storage_type": "your_storage_type_value"
}'
```

### 87. 获取WebDAV配置
- **描述**: 获取WebDAV配置
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=webdav&s=get_config' \
-H 'Content-Type: application/json'
```

### 88. 保存WebDAV配置
- **描述**: 保存WebDAV配置
- **参数**: (AnyObject - 参数为空)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=webdav&s=set_config' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 89. 获取备份列表 (新版)
- **描述**: 获取备份列表1
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/backup_restore/com/get_backup_list' \
-H 'Content-Type: application/json'
```

### 90. 下载备份文件 (新版)
- **描述**: 下载备份文件
- **参数**:
  - `id` (string)
- **cURL**:
```bash
# 注意：此接口路径与旧版下载备份文件接口路径相同，但参数不同
curl -X POST 'YOUR_BASE_URL/panel/whole_machine_backup/backup_download' \
-H 'Content-Type: application/json' \
-d '{
  "id": "your_id_value"
}'
```

### 91. 删除备份文件 (新版)
- **描述**: 删除备份文件1
- **参数**:
  - `timestamp` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/backup_restore/com/del_backup' \
-H 'Content-Type: application/json' \
-d '{
  "timestamp": "your_timestamp_value"
}'
```

### 92. 取消备份 (新版)
- **描述**: 取消备份1
- **参数**:
  - `timestamp` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/backup_restore/backup_stop' \
-H 'Content-Type: application/json' \
-d '{
  "timestamp": "your_timestamp_value"
}'
```

### 93. 立即执行备份、还原任务 (新版)
- **描述**: 立即执行备份、还原任务
- **参数**:
  - `timestamp` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/backup_restore/com/exec_backup' \
-H 'Content-Type: application/json' \
-d '{
  "timestamp": "your_timestamp_value"
}'
```

### 94. 还原备份文件 (新版)
- **描述**: 还原备份文件1
- **参数**:
  - `timestamp` (number)
  - `auto_exit` (number)
  - `force_restore` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/backup_restore/com/add_restore' \
-H 'Content-Type: application/json' \
-d '{
  "timestamp": "your_timestamp_value",
  "auto_exit": "your_auto_exit_value",
  "force_restore": "your_force_restore_value"
}'
```

### 95. 获取备份、还原日志 (新版)
- **描述**: 获取备份、还原日志
- **参数**:
  - `timestamp` (string)
  - `type` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/backup_restore/com/get_exec_logs' \
-H 'Content-Type: application/json' \
-d '{
  "timestamp": "your_timestamp_value",
  "type": "your_type_value"
}'
```

### 96. 获取备份、还原详情 (新版)
- **描述**: 获取备份、还原详情
- **参数**:
  - `timestamp` (number)
  - `type` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/backup_restore/com/get_details' \
-H 'Content-Type: application/json' \
-d '{
  "timestamp": "your_timestamp_value",
  "type": "your_type_value"
}'
```

### 97. 获取备份、还原进度 (新版)
- **描述**: 获取备份、还原进度
- **参数**:
  - `type` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/backup_restore/com/get_progress' \
-H 'Content-Type: application/json' \
-d '{
  "type": "your_type_value"
}'
```

### 98. 添加备份 (新版)
- **描述**: 添加备份1
- **参数**:
  - `backup_name` (string)
  - `auto_exit` (number)
  - `storage_type` (string)
  - `timestamp` (number)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/backup_restore/com/add_backup' \
-H 'Content-Type: application/json' \
-d '{
  "backup_name": "your_backup_name_value",
  "auto_exit": "your_auto_exit_value",
  "storage_type": "your_storage_type_value",
  "timestamp": "your_timestamp_value"
}'
```

### 99. 取消备份、还原任务 (新版)
- **描述**: 取消备份、还原任务
- **参数**:
  - `timestamp` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/backup_restore/com/task_stop' \
-H 'Content-Type: application/json' \
-d '{
  "timestamp": "your_timestamp_value"
}'
```

### 100. 获取备份数据统计接口
- **描述**: 获取备份数据统计接口
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/backup_restore/com/get_data_total' \
-H 'Content-Type: application/json'
```

### 101. 检查SSH认证方式
- **描述**: 检查SSH认证方式
- **参数**:
  - `auth_type` (number)
  - `server_ip` (string)
  - `ssh_port` (number)
  - `ssh_user` (string)
  - `password` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/backup_restore/com/ssh_auth_check' \
-H 'Content-Type: application/json' \
-d '{
  "auth_type": "your_auth_type_value",
  "server_ip": "your_server_ip_value",
  "ssh_port": "your_ssh_port_value",
  "ssh_user": "your_ssh_user_value",
  "password": "your_password_value"
}'
```

### 102. 开始迁移
- **描述**: 开始迁移
- **参数**:
  - `auth_type` (number)
  - `server_ip` (string)
  - `ssh_port` (number)
  - `ssh_user` (string)
  - `password` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/backup_restore/com/add_migrate_task' \
-H 'Content-Type: application/json' \
-d '{
  "auth_type": "your_auth_type_value",
  "server_ip": "your_server_ip_value",
  "ssh_port": "your_ssh_port_value",
  "ssh_user": "your_ssh_user_value",
  "password": "your_password_value"
}'
```

### 103. 终止迁移
- **描述**: 终止迁移
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/backup_restore/com/stop_migrate' \
-H 'Content-Type: application/json'
```

### 104. 获取迁移任务状态
- **描述**: 获取迁移任务状态
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/backup_restore/com/get_migrate_status' \
-H 'Content-Type: application/json'
```

### 105. 获取迁移进度
- **描述**: 获取迁移进度
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/backup_restore/com/get_migrate_progress' \
-H 'Content-Type: application/json'
```

### 106. 获取迁移历史
- **描述**: 获取迁移历史
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/backup_restore/com/get_history_migrate_list' \
-H 'Content-Type: application/json'
```

### 107. 获取迁移日志
- **描述**: 获取迁移日志
- **参数**:
  - `timestamp` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/backup_restore/com/get_history_migrate_log' \
-H 'Content-Type: application/json' \
-d '{
  "timestamp": "your_timestamp_value"
}'
```

### 108. 获取迁移详情
- **描述**: 获取迁移详情
- **参数**:
  - `timestamp` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/backup_restore/com/get_history_migrate_info' \
-H 'Content-Type: application/json' \
-d '{
  "timestamp": "your_timestamp_value"
}'
```

### 109. 删除迁移历史
- **描述**: 删除迁移历史
- **参数**:
  - `timestamp` (string)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/backup_restore/com/del_history_migrate' \
-H 'Content-Type: application/json' \
-d '{
  "timestamp": "your_timestamp_value"
}'
```
