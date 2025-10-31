# API 文档 (site.ts)

## 目录
1. [获取项目列表](#1-获取项目列表)
2. [设置项目](#2-设置项目)
3. [设置到期时间](#3-设置到期时间)
4. [批量设置模块到期时间](#4-批量设置模块到期时间)
5. [批量设置站点到期时间](#5-批量设置站点到期时间)
6. [高级检查端口](#6-高级检查端口)
7. [获取项目信息](#7-获取项目信息)
8. [获取系统用户列表](#8-获取系统用户列表)
9. [修改项目](#9-修改项目)
10. [创建项目](#10-创建项目)
11. [删除项目](#11-删除项目)
12. [删除代理项目](#12-删除代理项目)
13. [批量删除Nginx](#13-批量删除nginx)
14. [获取其他域名列表](#14-获取其他域名列表)
15. [添加域名](#15-添加域名)
16. [添加项目域名](#16-添加项目域名)
17. [删除域名](#17-删除域名)
18. [删除项目域名](#18-删除项目域名)
19. [获取HTTPS端口](#19-获取https端口)
20. [设置代理HTTPS端口](#20-设置代理https端口)
21. [设置HTTPS端口](#21-设置https端口)
22. [绑定外网](#22-绑定外网)
23. [解绑外网](#23-解绑外网)
24. [设置Java静态文件](#24-设置java静态文件)
25. [删除服务器代理](#25-删除服务器代理)
26. [修改服务器代理](#26-修改服务器代理)
27. [添加服务器代理](#27-添加服务器代理)
28. [添加Python服务器代理](#28-添加python服务器代理)
29. [获取端口状态](#29-获取端口状态)
30. [获取Python端口状态](#30-获取python端口状态)
31. [获取重写列表](#31-获取重写列表)
32. [设置重写电话](#32-设置重写电话)
33. [获取文件内容](#33-获取文件内容)
34. [保存文件内容](#34-保存文件内容)
35. [删除重写电话](#35-删除重写电话)
36. [获取重写电话](#36-获取重写电话)
37. [获取重定向列表](#37-获取重定向列表)
38. [获取重定向文件](#38-获取重定向文件)
39. [获取代理重定向](#39-获取代理重定向)
40. [创建重定向](#40-创建重定向)
41. [修改重定向](#41-修改重定向)
42. [设置错误重定向](#42-设置错误重定向)
43. [删除重定向](#43-删除重定向)
44. [批量删除重定向](#44-批量删除重定向)
45. [获取项目域名](#45-获取项目域名)
46. [获取负载信息](#46-获取负载信息)
47. [设置重启项目配置](#47-设置重启项目配置)
48. [更改项目路径](#48-更改项目路径)
49. [获取项目日志](#49-获取项目日志)
50. [获取日志分割](#50-获取日志分割)
51. [设置日志分割](#51-设置日志分割)
52. [管理日志分割](#52-管理日志分割)
53. [设置推送任务](#53-设置推送任务)
54. [获取站点日志推送状态](#54-获取站点日志推送状态)
55. [获取IP区域](#55-获取IP区域)
56. [更改站点日志路径](#56-更改站点日志路径)
57. [获取站点日志](#57-获取站点日志)
58. [获取站点日志文件](#58-获取站点日志文件)
59. [获取站点错误日志](#59-获取站点错误日志)
60. [获取SSL信息](#60-获取SSL信息)
61. [重新签发证书订单](#61-重新签发证书订单)
62. [获取支付状态](#62-获取支付状态)
63. [申请证书订单续期](#63-申请证书订单续期)
64. [设置SSL信息](#64-设置SSL信息)
65. [续期证书](#65-续期证书)
66. [获取证书初始化API](#66-获取证书初始化API)
67. [设置代理HTTPS](#67-设置代理HTTPS)
68. [设置Docker HTTPS](#68-设置Docker HTTPS)
69. [设置站点HTTPS](#69-设置站点HTTPS)
70. [关闭站点HTTPS](#70-关闭站点HTTPS)
71. [下载证书](#71-下载证书)
72. [关闭证书安排](#72-关闭证书安排)
73. [获取商业SSL订单列表](#73-获取商业SSL订单列表)
74. [设置证书订单](#74-设置证书订单)
75. [获取验证结果](#75-获取验证结果)
76. [检查URL文本](#76-检查URL文本)
77. [编辑再次验证](#77-编辑再次验证)
78. [申请商业SSL](#78-申请商业SSL)
79. [检查SSL方法](#79-检查SSL方法)
80. [获取域名列表](#80-获取域名列表)
81. [获取DNS API列表](#81-获取DNS API列表)
82. [获取证书管理员信息](#82-获取证书管理员信息)
83. [设置DNS API信息](#83-设置DNS API信息)
84. [购买服务](#84-购买服务)
85. [申请证书订单支付](#85-申请证书订单支付)
86. [获取商业SSL产品列表](#86-获取商业SSL产品列表)
87. [获取TrustAsia列表](#87-获取TrustAsia列表)
88. [部署TrustAsia证书](#88-部署TrustAsia证书)
89. [验证TrustAsia证书](#89-验证TrustAsia证书)
90. [通过CA申请证书](#90-通过CA申请证书)
91. [申请TrustAsia证书](#91-申请TrustAsia证书)
92. [获取Let's Encrypt列表](#92-获取Let's Encrypt列表)
93. [设置证书到站点](#93-设置证书到站点)
94. [设置Docker证书到站点](#94-设置Docker证书到站点)
95. [下载证书到本地](#95-下载证书到本地)
96. [续期证书](#96-续期证书)
97. [执行Composer](#97-执行Composer)
98. [删除Composer文件](#98-删除Composer文件)
99. [获取Composer行](#99-获取Composer行)
100. [获取订单详情](#100-获取订单详情)

---

## API 列表

### 1. 获取项目列表
- **描述**: 获取项目列表
- **参数**:
  - `data` (AnyObject): 查询参数
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/{type}/get_project_list' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 2. 设置项目
- **描述**: 设置项目
- **参数**:
  - `data` (AnyObject): 项目数据
  - `type` (string): 项目类型
  - `module` (string): 模块名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/{type}/{module}/set_project' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 3. 设置到期时间
- **描述**: 设置到期时间
- **参数**:
  - `data` (AnyObject): 包含到期时间的数据
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/site/SetEdate' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 4. 批量设置模块到期时间
- **描述**: 批量设置模块到期时间
- **参数**:
  - `sites_id` (string): 站点ID
  - `edate` (string): 到期时间
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/go/set_site_etime_multiple' \\
-H 'Content-Type: application/json' \\
-d '{
  "sites_id": "site_id_1,site_id_2",
  "edate": "2023-12-31"
}'
```

### 5. 批量设置站点到期时间
- **描述**: 批量设置站点到期时间
- **参数**:
  - `data` (AnyObject): 包含站点ID和到期时间的数据
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/site/set_site_etime_multiple' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 6. 高级检查端口
- **描述**: 高级检查端口
- **参数**:
  - `port` (number | string): 端口号
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/{type}/advance_check_port' \\
-H 'Content-Type: application/json' \\
-d '{
  "port": 8080
}'
```

### 7. 获取项目信息
- **描述**: 获取项目信息
- **参数**:
  - `data` (AnyObject): 查询参数
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/{type}/get_project_info' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 8. 获取系统用户列表
- **描述**: 获取系统用户列表
- **参数**:
  - `data` (AnyObject): 查询参数
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/java/get_system_user_list' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 9. 修改项目
- **描述**: 修改项目
- **参数**:
  - `data` (AnyObject): 项目数据
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/{type}/modify_project' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 10. 创建项目
- **描述**: 创建项目
- **参数**:
  - `data` (AnyObject): 项目数据
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/{type}/create_project' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 11. 删除项目
- **描述**: 删除项目
- **参数**:
  - `data` (AnyObject): 项目数据
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/{type}/remove_project' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 12. 删除代理项目
- **描述**: 删除代理项目
- **参数**:
  - `id` (string): 项目ID
  - `site_name` (string): 站点名称
  - `remove_path` (number): 是否删除路径
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/proxy/com/delete' \\
-H 'Content-Type: application/json' \\
-d '{
  "id": "123",
  "site_name": "example.com",
  "remove_path": 1
}'
```

### 13. 批量删除Nginx
- **描述**: 批量删除Nginx
- **参数**:
  - `site_list` (string): 站点列表
  - `remove_path` (number): 是否删除路径
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/proxy/com/batch_delete' \\
-H 'Content-Type: application/json' \\
-d '{
  "site_list": "site1,site2",
  "remove_path": 1
}'
```

### 14. 获取其他域名列表
- **描述**: 获取其他域名列表
- **参数**:
  - `data` (AnyObject): 查询参数
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/{type}/get_other_domain_list' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 15. 添加域名
- **描述**: 添加域名
- **参数**:
  - `domain` (string): 域名
  - `webname` (string): 网站名称
  - `id` (number): 站点ID
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/site/AddDomain' \\
-H 'Content-Type: application/json' \\
-d '{
  "domain": "example.com",
  "webname": "Example Site",
  "id": 123
}'
```

### 16. 添加项目域名
- **描述**: 添加项目域名
- **参数**:
  - `data` (AnyObject): 域名数据
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/{type}/add_domain' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 17. 删除域名
- **描述**: 删除域名
- **参数**:
  - `id` (number): 站点ID
  - `domain` (string): 域名
  - `port` (number): 端口
  - `webname` (string): 网站名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/site/DelDomain' \\
-H 'Content-Type: application/json' \\
-d '{
  "id": 123,
  "domain": "example.com",
  "port": 80,
  "webname": "Example Site"
}'
```

### 18. 删除项目域名
- **描述**: 删除项目域名
- **参数**:
  - `data` (AnyObject): 域名数据
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/{type}/remove_domain' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 19. 获取HTTPS端口
- **描述**: 获取HTTPS端口
- **参数**:
  - `siteName` (string): 站点名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/data/get_https_port' \\
-H 'Content-Type: application/json' \\
-d '{
  "siteName": "example.com"
}'
```

### 20. 设置代理HTTPS端口
- **描述**: 设置代理HTTPS端口
- **参数**:
  - `site_name` (string): 站点名称
  - `https_port` (number): HTTPS端口
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/proxy/com/set_https_port' \\
-H 'Content-Type: application/json' \\
-d '{
  "site_name": "example.com",
  "https_port": 443
}'
```

### 21. 设置HTTPS端口
- **描述**: 设置HTTPS端口
- **参数**:
  - `siteName` (string): 站点名称
  - `port` (number): 端口
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/data/set_https_port' \\
-H 'Content-Type: application/json' \\
-d '{
  "siteName": "example.com",
  "port": 443
}'
```

### 22. 绑定外网
- **描述**: 绑定外网
- **参数**:
  - `data` (AnyObject): 绑定数据
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/{type}/bind_extranet' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 23. 解绑外网
- **描述**: 解绑外网
- **参数**:
  - `data` (AnyObject): 解绑数据
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/{type}/unbind_extranet' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 24. 设置Java静态文件
- **描述**: 设置Java静态文件
- **参数**:
  - `status` (number): 状态
  - `index` (string): 索引
  - `path` (string): 路径
  - `project_name` (string): 项目名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/java/project/set_static_path' \\
-H 'Content-Type: application/json' \\
-d '{
  "status": 1,
  "index": "index.html",
  "path": "/static",
  "project_name": "example"
}'
```

### 25. 删除服务器代理
- **描述**: 删除服务器代理
- **参数**:
  - `proxy_id` (number): 代理ID
  - `site_name` (string): 站点名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/java/project/remove_server_proxy' \\
-H 'Content-Type: application/json' \\
-d '{
  "proxy_id": 123,
  "site_name": "example.com"
}'
```

### 26. 修改服务器代理
- **描述**: 修改服务器代理
- **参数**:
  - `data` (AnyObject): 代理数据
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/java/project/modify_server_proxy' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 27. 添加服务器代理
- **描述**: 添加服务器代理
- **参数**:
  - `data` (AnyObject): 代理数据
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/java/project/add_server_proxy' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 28. 添加Python服务器代理
- **描述**: 添加Python服务器代理
- **参数**:
  - `data` (AnyObject): 代理数据
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/python/add_server_proxy' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 29. 获取端口状态
- **描述**: 获取端口状态
- **参数**:
  - `project_name` (string): 项目名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/java/project/get_port_status' \\
-H 'Content-Type: application/json' \\
-d '{
  "project_name": "example"
}'
```

### 30. 获取Python端口状态
- **描述**: 获取Python端口状态
- **参数**:
  - `project_name` (string): 项目名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/python/get_port_status' \\
-H 'Content-Type: application/json' \\
-d '{
  "project_name": "example"
}'
```

### 31. 获取重写列表
- **描述**: 获取重写列表
- **参数**:
  - `siteName` (string): 站点名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/site/GetRewriteList' \\
-H 'Content-Type: application/json' \\
-d '{
  "siteName": "example.com"
}'
```

### 32. 设置重写电话
- **描述**: 设置重写电话
- **参数**:
  - `data` (AnyObject): 重写数据
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/site/SetRewriteTel' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 33. 获取文件内容
- **描述**: 获取文件内容
- **参数**:
  - `path` (string): 文件路径
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/files/GetFileBody' \\
-H 'Content-Type: application/json' \\
-d '{
  "path": "/path/to/file"
}'
```

### 34. 保存文件内容
- **描述**: 保存文件内容
- **参数**:
  - `data` (AnyObject): 文件数据
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/files?action=SaveFileBody' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 35. 删除重写电话
- **描述**: 删除重写电话
- **参数**:
  - `data` (AnyObject): 重写数据
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/site/DelRewriteTel' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 36. 获取重写电话
- **描述**: 获取重写电话
- **参数**:
  - `data` (AnyObject): 查询参数
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/files/read_history' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 37. 获取重定向列表
- **描述**: 获取重定向列表
- **参数**:
  - `sitename` (string): 站点名称
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/{type}/get_redirect_list' \\
-H 'Content-Type: application/json' \\
-d '{
  "sitename": "example.com"
}'
```

### 38. 获取重定向文件
- **描述**: 获取重定向文件
- **参数**:
  - `data` (AnyObject): 查询参数
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/{type}/get_redirect_file' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 39. 获取代理重定向
- **描述**: 获取代理重定向
- **参数**:
  - `path` (string): 路径
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/proxy/com/GetRedirectFile' \\
-H 'Content-Type: application/json' \\
-d '{
  "path": "/path/to/redirect"
}'
```

### 40. 创建重定向
- **描述**: 创建重定向
- **参数**:
  - `redirecttype` (string): 重定向类型
  - `sitename` (string): 站点名称
  - `site_name` (string): 站点名称
  - `domainorpath` (string): 域名或路径
  - `redirectpath` (string): 重定向路径
  - `tourl` (string): 目标URL
  - `redirectdomain` (string): 重定向域名
  - `redirectname` (string): 重定向名称
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/{type}/create_redirect' \\
-H 'Content-Type: application/json' \\
-d '{
  "redirecttype": "301",
  "sitename": "example.com",
  "domainorpath": "example.com",
  "redirectpath": "/redirect",
  "tourl": "https://target.com",
  "redirectdomain": "example.com",
  "redirectname": "redirect_name"
}'
```

### 41. 修改重定向
- **描述**: 修改重定向
- **参数**:
  - `data` (AnyObject): 重定向数据
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/{type}/modify_redirect' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 42. 设置错误重定向
- **描述**: 设置错误重定向
- **参数**:
  - `data` (AnyObject): 错误重定向数据
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/site/set_error_redirect' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 43. 删除重定向
- **描述**: 删除重定向
- **参数**:
  - `data` (AnyObject): 重定向数据
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/{type}/remove_redirect' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 44. 批量删除重定向
- **描述**: 批量删除重定向
- **参数**:
  - `site_id` (string): 站点ID
  - `redirectnames` (string): 重定向名称列表
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/{type}/multi_del_redirect' \\
-H 'Content-Type: application/json' \\
-d '{
  "site_id": "123",
  "redirectnames": "redirect1,redirect2"
}'
```

### 45. 获取项目域名
- **描述**: 获取项目域名
- **参数**:
  - `data` (AnyObject): 查询参数
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/{type}/get_project_domain' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 46. 获取负载信息
- **描述**: 获取负载信息
- **参数**:
  - `data` (AnyObject): 查询参数
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/{type}/get_load_info' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 47. 设置重启项目配置
- **描述**: 设置重启项目配置
- **参数**:
  - `data` (AnyObject): 配置数据
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/set_restart_project' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 48. 更改项目路径
- **描述**: 更改项目路径
- **参数**:
  - `data` (AnyObject): 路径数据
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/{type}/change_project_path' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 49. 获取项目日志
- **描述**: 获取项目日志
- **参数**:
  - `data` (AnyObject): 查询参数
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/{type}/get_project_logs' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 50. 获取日志分割
- **描述**: 获取日志分割
- **参数**:
  - `data` (AnyObject): 查询参数
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/{type}/get_log_split' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 51. 设置日志分割
- **描述**: 设置日志分割
- **参数**:
  - `data` (AnyObject): 日志分割配置
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/{type}/set_log_split' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 52. 管理日志分割
- **描述**: 管理日志分割
- **参数**:
  - `data` (AnyObject): 日志分割管理配置
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/{type}/mamger_log_split' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 53. 设置推送任务
- **描述**: 设置推送任务
- **参数**:
  - `data` (AnyObject): 推送任务配置
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/monitor/sitelogpush/set_push_task' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 54. 获取站点日志推送状态
- **描述**: 获取站点日志推送状态
- **参数**:
  - `sitename` (string): 站点名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/monitor/sitelogpush/get_site_log_push_status' \\
-H 'Content-Type: application/json' \\
-d '{
  "sitename": "example.com"
}'
```

### 55. 获取IP区域
- **描述**: 获取IP区域
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/site/get_ip_area' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 56. 更改站点日志路径
- **描述**: 更改站点日志路径
- **参数**:
  - `data` (AnyObject): 日志路径配置
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/site/change_site_log_path' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 57. 获取站点日志
- **描述**: 获取站点日志
- **参数**:
  - `data` (AnyObject): 查询参数
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/site/get_site_logs' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 58. 获取站点日志文件
- **描述**: 获取站点日志文件
- **参数**:
  - `siteName` (string): 站点名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/site/get_site_log_file' \\
-H 'Content-Type: application/json' \\
-d '{
  "siteName": "example.com"
}'
```

### 59. 获取站点错误日志
- **描述**: 获取站点错误日志
- **参数**:
  - `data` (AnyObject): 查询参数
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/logs/site/get_site_error_logs' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 60. 获取SSL信息
- **描述**: 获取SSL信息
- **参数**:
  - `siteName` (string): 站点名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/site/GetSSL' \\
-H 'Content-Type: application/json' \\
-d '{
  "siteName": "example.com"
}'
```

### 61. 重新签发证书订单
- **描述**: 重新签发证书订单
- **参数**:
  - `pdata` (string): 证书数据
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl/renew_cert_order' \\
-H 'Content-Type: application/json' \\
-d '{
  "pdata": "certificate_data"
}'
```

### 62. 获取支付状态
- **描述**: 获取支付状态
- **参数**:
  - `oid` (number): 订单ID
  - `pid` (number): 产品ID
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl/get_pay_status' \\
-H 'Content-Type: application/json' \\
-d '{
  "oid": 123,
  "pid": 456
}'
```

### 63. 申请证书订单续期
- **描述**: 申请证书订单续期
- **参数**:
  - `oid` (number): 订单ID
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl/apply_order' \\
-H 'Content-Type: application/json' \\
-d '{
  "oid": 123
}'
```

### 64. 设置SSL信息
- **描述**: 设置SSL信息
- **参数**:
  - `siteName` (string): 站点名称
  - `site_name` (string): 站点名称
  - `type` (number): 证书类型
  - `key` (string): 私钥
  - `csr` (string): CSR
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/site/SetSSL' \\
-H 'Content-Type: application/json' \\
-d '{
  "siteName": "example.com",
  "key": "private_key_content",
  "csr": "csr_content"
}'
```

### 65. 续期证书
- **描述**: 续期证书
- **参数**:
  - `data` (AnyObject): 证书数据
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/acme/renew_cert' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 66. 获取证书初始化API
- **描述**: 获取证书初始化API
- **参数**:
  - `data` (AnyObject): 证书数据
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/acme/get_cert_init_api' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 67. 设置代理HTTPS
- **描述**: 设置代理HTTPS
- **参数**:
  - `site_name` (string): 站点名称
  - `force_https` (number): 强制HTTPS
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/proxy/com/set_force_https' \\
-H 'Content-Type: application/json' \\
-d '{
  "site_name": "example.com",
  "force_https": 1
}'
```

### 68. 设置Docker HTTPS
- **描述**: 设置Docker HTTPS
- **参数**:
  - `site_name` (string): 站点名称
  - `force_https` (number): 强制HTTPS
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/docker/com/set_force_https' \\
-H 'Content-Type: application/json' \\
-d '{
  "site_name": "example.com",
  "force_https": 1
}'
```

### 69. 设置站点HTTPS
- **描述**: 设置站点HTTPS
- **参数**:
  - `siteName` (string): 站点名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/site/HttpToHttps' \\
-H 'Content-Type: application/json' \\
-d '{
  "siteName": "example.com"
}'
```

### 70. 关闭站点HTTPS
- **描述**: 关闭站点HTTPS
- **参数**:
  - `siteName` (string): 站点名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/site/CloseToHttps' \\
-H 'Content-Type: application/json' \\
-d '{
  "siteName": "example.com"
}'
```

### 71. 下载证书
- **描述**: 下载证书
- **参数**:
  - `siteName` (string): 站点名称
  - `ssl_type` (string): 证书类型
  - `pem` (string): 证书内容
  - `key` (string): 私钥
  - `pwd` (string): 密码
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/site/download_cert' \\
-H 'Content-Type: application/json' \\
-d '{
  "siteName": "example.com",
  "pem": "certificate_content",
  "key": "private_key_content"
}'
```

### 72. 关闭证书安排
- **描述**: 关闭证书安排
- **参数**:
  - `updateOf` (number): 更新标志
  - `siteName` (string): 站点名称
  - `site_name` (string): 站点名称
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/site/close_cert_arrange' \\
-H 'Content-Type: application/json' \\
-d '{
  "site_name": "example.com"
}'
```

### 73. 获取商业SSL订单列表
- **描述**: 获取商业SSL订单列表
- **参数**:
  - `siteName` (string): 站点名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl/get_order_list' \\
-H 'Content-Type: application/json' \\
-d '{
  "siteName": "example.com"
}'
```

### 74. 设置证书订单
- **描述**: 设置证书订单
- **参数**:
  - `oid` (number): 订单ID
  - `siteName` (string): 站点名称
  - `site_name` (string): 站点名称
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl/set_cert_order' \\
-H 'Content-Type: application/json' \\
-d '{
  "oid": 123,
  "siteName": "example.com"
}'
```

### 75. 获取验证结果
- **描述**: 获取验证结果
- **参数**:
  - `oid` (number): 订单ID
  - `cert_ssl_type` (number): 证书SSL类型
  - `pid` (number): 产品ID
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl/get_verify_result' \\
-H 'Content-Type: application/json' \\
-d '{
  "oid": 123,
  "cert_ssl_type": 1,
  "pid": 456
}'
```

### 76. 检查URL文本
- **描述**: 检查URL文本
- **参数**:
  - `url` (string): URL
  - `content` (string): 内容
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl/check_url_txt' \\
-H 'Content-Type: application/json' \\
-d '{
  "url": "https://example.com/.well-known/pki-validation/fileauth.txt",
  "content": "file_content"
}'
```

### 77. 编辑再次验证
- **描述**: 编辑再次验证
- **参数**:
  - `oid` (number): 订单ID
  - `dcvMethod` (string): DCV方法
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl/again_verify' \\
-H 'Content-Type: application/json' \\
-d '{
  "oid": 123,
  "dcvMethod": "dns"
}'
```

### 78. 申请商业SSL
- **描述**: 申请商业SSL
- **参数**:
  - `pdata` (string): 证书数据
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl/apply_order_ca' \\
-H 'Content-Type: application/json' \\
-d '{
  "pdata": "certificate_data"
}'
```

### 79. 检查SSL方法
- **描述**: 检查SSL方法
- **参数**:
  - `domain` (string): 域名
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl/check_ssl_method' \\
-H 'Content-Type: application/json' \\
-d '{
  "domain": "example.com"
}'
```

### 80. 获取域名列表
- **描述**: 获取域名列表
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/datalist/data/get_data_list' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 81. 获取DNS API列表
- **描述**: 获取DNS API列表
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/site/GetDnsApi' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 82. 获取证书管理员信息
- **描述**: 获取证书管理员信息
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl/get_cert_admin' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 83. 设置DNS API信息
- **描述**: 设置DNS API信息
- **参数**:
  - `pdata` (string): DNS数据
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/site/SetDnsApi' \\
-H 'Content-Type: application/json' \\
-d '{
  "pdata": "dns_api_data"
}'
```

### 84. 购买服务
- **描述**: 购买服务
- **参数**:
  - `pdata` (string): 支付数据
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl/apply_cert_install_pay' \\
-H 'Content-Type: application/json' \\
-d '{
  "pdata": "payment_data"
}'
```

### 85. 申请证书订单支付
- **描述**: 申请证书订单支付
- **参数**:
  - `pdata` (string): 支付数据
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl/apply_cert_order_pay' \\
-H 'Content-Type: application/json' \\
-d '{
  "pdata": "payment_data"
}'
```

### 86. 获取商业SSL产品列表
- **描述**: 获取商业SSL产品列表
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl/get_product_list_v2' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 87. 获取TrustAsia列表
- **描述**: 获取TrustAsia列表
- **参数**:
  - `siteName` (string): 站点名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl/GetOrderList' \\
-H 'Content-Type: application/json' \\
-d '{
  "siteName": "example.com"
}'
```

### 88. 部署TrustAsia证书
- **描述**: 部署TrustAsia证书
- **参数**:
  - `site_name` (string): 站点名称
  - `siteName` (string): 站点名称
  - `partnerOrderId` (string): 合作伙伴订单ID
  - `type` (string): 项目类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl/deploy_cert' \\
-H 'Content-Type: application/json' \\
-d '{
  "site_name": "example.com",
  "partnerOrderId": "order123"
}'
```

### 89. 验证TrustAsia证书
- **描述**: 验证TrustAsia证书
- **参数**:
  - `siteName` (string): 站点名称
  - `partnerOrderId` (string): 合作伙伴订单ID
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl/Completed' \\
-H 'Content-Type: application/json' \\
-d '{
  "siteName": "example.com",
  "partnerOrderId": "order123"
}'
```

### 90. 通过CA申请证书
- **描述**: 通过CA申请证书
- **参数**:
  - `data` (AnyObject): 证书数据
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl/apply_order_byca' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 91. 申请TrustAsia证书
- **描述**: 申请TrustAsia证书
- **参数**:
  - `domain` (string): 域名
  - `orgName` (string): 组织名称
  - `orgRegion` (string): 组织地区
  - `orgCity` (string): 组织城市
  - `orgAddress` (string): 组织地址
  - `orgPhone` (string): 组织电话
  - `orgPostalCode` (string): 组织邮编
  - `orgDivision` (string): 组织部门
  - `ssl_id` (number): SSL ID
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl/ApplyDVSSL' \\
-H 'Content-Type: application/json' \\
-d '{
  "domain": "example.com",
  "orgName": "Example Org",
  "orgRegion": "Example Region",
  "orgCity": "Example City",
  "orgAddress": "Example Address",
  "orgPhone": "123456789",
  "orgPostalCode": "123456",
  "orgDivision": "IT"
}'
```

### 92. 获取Let's Encrypt列表
- **描述**: 获取Let's Encrypt列表
- **参数**:
  - `siteName` (string): 站点名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/acme/get_order_list' \\
-H 'Content-Type: application/json' \\
-d '{
  "siteName": "example.com"
}'
```

### 93. 设置证书到站点
- **描述**: 设置证书到站点
- **参数**:
  - `index` (string): 索引
  - `siteName` (string): 站点名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/acme/SetCertToSite' \\
-H 'Content-Type: application/json' \\
-d '{
  "index": "cert_index",
  "siteName": "example.com"
}'
```

### 94. 设置Docker证书到站点
- **描述**: 设置Docker证书到站点
- **参数**:
  - `index` (string): 索引
  - `siteName` (string): 站点名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/docker/com/set_cert_to_site' \\
-H 'Content-Type: application/json' \\
-d '{
  "index": "cert_index",
  "siteName": "example.com"
}'
```

### 95. 下载证书到本地
- **描述**: 下载证书到本地
- **参数**:
  - `index` (string): 索引
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/acme/download_cert_to_local' \\
-H 'Content-Type: application/json' \\
-d '{
  "index": "cert_index"
}'
```

### 96. 续期证书
- **描述**: 续期证书
- **参数**:
  - `data` (AnyObject): 证书数据
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl/cert/renewal_cert' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 97. 执行Composer
- **描述**: 执行Composer
- **参数**:
  - `data` (AnyObject): Composer数据
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/files/exec_composer' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 98. 删除Composer文件
- **描述**: 删除Composer文件
- **参数**:
  - `data` (AnyObject): 文件数据
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/files/DeleteFile' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 99. 获取Composer行
- **描述**: 获取Composer行
- **参数**:
  - `data` (AnyObject): 查询参数
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/get_lines' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 100. 获取订单详情
- **描述**: 获取订单详情
- **参数**:
  - `data` (AnyObject): 查询参数
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/acme/get_order_detail' \\
-H 'Content-Type: application/json' \\
-d '{}'
```
