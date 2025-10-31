# API 文档 (mail.ts)

## 目录
1. [获取今日数据](#1-获取今日数据)
2. [获取邮件日志](#2-获取邮件日志)
3. [获取域名列表](#3-获取域名列表)
4. [刷新域名记录](#4-刷新域名记录)
5. [设置域名Catchall](#5-设置域名catchall)
6. [设置域名证书](#6-设置域名证书)
7. [删除域名证书](#7-删除域名证书)
8. [添加域名](#8-添加域名)
9. [编辑域名](#9-编辑域名)
10. [删除域名](#10-删除域名)
11. [删除MX和TXT记录缓存](#11-删除mx和txt记录缓存)
12. [获取域名名称列表](#12-获取域名名称列表)
13. [获取邮箱用户列表](#13-获取邮箱用户列表)
14. [添加邮箱用户](#14-添加邮箱用户)
15. [编辑邮箱用户](#15-编辑邮箱用户)
16. [删除邮箱用户](#16-删除邮箱用户)
17. [获取密抄邮箱列表](#17-获取密抄邮箱列表)
18. [添加密抄邮箱](#18-添加密抄邮箱)
19. [修改密抄邮箱](#19-修改密抄邮箱)
20. [删除密抄邮箱](#20-删除密抄邮箱)
21. [获取邮件转发列表](#21-获取邮件转发列表)
22. [添加转发邮件](#22-添加转发邮件)
23. [编辑转发邮件](#23-编辑转发邮件)
24. [删除转发邮件](#24-删除转发邮件)
25. [获取所有用户列表](#25-获取所有用户列表)
26. [获取收件箱邮件](#26-获取收件箱邮件)
27. [标记为垃圾邮件](#27-标记为垃圾邮件)
28. [删除邮件](#28-删除邮件)
29. [获取垃圾箱邮件](#29-获取垃圾箱邮件)
30. [从垃圾邮件恢复](#30-从垃圾邮件恢复)
31. [获取已发送邮件](#31-获取已发送邮件)
32. [发送邮件内容](#32-发送邮件内容)
33. [获取发送任务列表](#33-获取发送任务列表)
34. [获取发送任务错误](#34-获取发送任务错误)
35. [获取发送任务错误详情](#35-获取发送任务错误详情)
36. [删除发送任务](#36-删除发送任务)
37. [导入收件人](#37-导入收件人)
38. [获取导入收件人数据](#38-获取导入收件人数据)
39. [添加批量发送任务](#39-添加批量发送任务)
40. [暂停/恢复发送任务](#40-暂停恢复发送任务)
41. [获取备份设置参数](#41-获取备份设置参数)
42. [关闭备份计划](#42-关闭备份计划)
43. [获取已安装云存储列表](#43-获取已安装云存储列表)
44. [保存备份设置](#44-保存备份设置)
45. [获取备份路径](#45-获取备份路径)
46. [获取备份邮件列表](#46-获取备份邮件列表)
47. [恢复备份邮件](#47-恢复备份邮件)
48. [获取服务状态](#48-获取服务状态)
49. [设置服务状态](#49-设置服务状态)
50. [修复服务配置](#50-修复服务配置)
51. [获取服务配置文件](#51-获取服务配置文件)
52. [保存服务配置文件](#52-保存服务配置文件)
53. [获取服务监控任务状态](#53-获取服务监控任务状态)
54. [打开服务状态监测任务](#54-打开服务状态监测任务)
55. [关闭服务状态监控任务](#55-关闭服务状态监控任务)
56. [获取邮件保留天数](#56-获取邮件保留天数)
57. [设置邮件保留天数](#57-设置邮件保留天数)
58. [检查邮箱环境](#58-检查邮箱环境)
59. [修复邮局环境](#59-修复邮局环境)
60. [修改主机名](#60-修改主机名)
61. [安装邮局服务 (初始化)](#61-安装邮局服务-初始化)
62. [获取初始化日志](#62-获取初始化日志)
63. [获取WebMail状态](#63-获取webmail状态)
64. [获取WebMail绑定域名](#64-获取webmail绑定域名)
65. [卸载WebMail](#65-卸载webmail)
66. [安装WebMail](#66-安装webmail)
67. [添加WebMail配置信息](#67-添加webmail配置信息)
68. [一键登录WebMail](#68-一键登录webmail)
69. [获取收件人黑名单列表](#69-获取收件人黑名单列表)
70. [添加收件人到黑名单](#70-添加收件人到黑名单)
71. [从收件人黑名单删除](#71-从收件人黑名单删除)
72. [导出收件人黑名单](#72-导出收件人黑名单)
73. [导入收件人黑名单](#73-导入收件人黑名单)
74. [删除文件](#74-删除文件)
75. [获取邮局扩展包产品信息](#75-获取邮局扩展包产品信息)
76. [创建邮局扩展包订单](#76-创建邮局扩展包订单)
77. [邮局扩展包余额购买](#77-邮局扩展包余额购买)
78. [监听支付状态](#78-监听支付状态)
79. [获取用户邮局扩展包余量](#79-获取用户邮局扩展包余量)
80. [安装邮局扩展包服务](#80-安装邮局扩展包服务)
81. [营销邮件数据总览](#81-营销邮件数据总览)
82. [获取营销邮件错误详情](#82-获取营销邮件错误详情)
83. [编辑批量发送任务](#83-编辑批量发送任务)
84. [发送测试邮件](#84-发送测试邮件)
85. [获取订阅趋势数据](#85-获取订阅趋势数据)
86. [获取邮件类型列表 (联系人分类)](#86-获取邮件类型列表-联系人分类)
87. [删除批量发送邮箱列表(应为删除邮件类型/联系人分类)](#87-删除批量发送邮箱列表应为删除邮件类型联系人分类)
88. [获取批量发送邮箱列表(应为获取邮件类型/联系人分类下的联系人)](#88-获取批量发送邮箱列表应为获取邮件类型联系人分类下的联系人)
89. [添加邮件类型 (联系人分类)](#89-添加邮件类型-联系人分类)
90. [编辑邮件类型 (联系人分类)](#90-编辑邮件类型-联系人分类)
91. [清空所有异常邮箱数据](#91-清空所有异常邮箱数据)
92. [删除指定异常邮箱列表](#92-删除指定异常邮箱列表)
93. [获取异常邮箱列表](#93-获取异常邮箱列表)
94. [获取异常邮箱状态类型](#94-获取异常邮箱状态类型)
95. [获取退订列表](#95-获取退订列表)
96. [删除退订记录](#96-删除退订记录)
97. [切换退订状态](#97-切换退订状态)
98. [导入联系人到指定分类](#98-导入联系人到指定分类)
99. [导入联系人到指定退订状态分类](#99-导入联系人到指定退订状态分类)
100. [删除邮件类型 (联系人分类)](#100-删除邮件类型-联系人分类)
101. [批量设置联系人分类 (订阅/退订)](#101-批量设置联系人分类-订阅退订)
102. [批量设置联系人退订分类](#102-批量设置联系人退订分类)
103. [添加邮件模板](#103-添加邮件模板)
104. [删除邮件模板](#104-删除邮件模板)
105. [获取邮件模板列表](#105-获取邮件模板列表)
106. [编辑邮件模板](#106-编辑邮件模板)
107. [获取邮件模板内容](#107-获取邮件模板内容)
108. [获取指定分类联系人数量](#108-获取指定分类联系人数量)
109. [获取邮件模板选择列表](#109-获取邮件模板选择列表)
110. [删除退订配置的域名和端口](#110-删除退订配置的域名和端口)
111. [获取退订配置的域名和端口](#111-获取退订配置的域名和端口)
112. [设置退订配置的域名和端口](#112-设置退订配置的域名和端口)
113. [获取任务相关的退订列表](#113-获取任务相关的退订列表)
114. [获取邮局黑名单提示状态](#114-获取邮局黑名单提示状态)
115. [设置邮局黑名单提示状态](#115-设置邮局黑名单提示状态)
116. [检测域名是否在RBL黑名单内](#116-检测域名是否在rbl黑名单内)
117. [获取邮局域名扫描RBL日志](#117-获取邮局域名扫描rbl日志)
118. [邮局域名一键DNS解析](#118-邮局域名一键dns解析)
119. [判断邮局是否已安装](#119-判断邮局是否已安装)
120. [从证书夹部署证书到邮局域名](#120-从证书夹部署证书到邮局域名)
121. [获取自动申请SSL证书任务状态](#121-获取自动申请ssl证书任务状态)
122. [开启自动申请SSL证书任务](#122-开启自动申请ssl证书任务)
123. [关闭自动申请SSL证书任务](#123-关闭自动申请ssl证书任务)
124. [邮局环境初始化](#124-邮局环境初始化)
125. [获取邮局IP标签列表](#125-获取邮局ip标签列表)
126. [获取可绑定的域名列表 (根据IP标签)](#126-获取可绑定的域名列表-根据ip标签)
127. [获取IP地址列表 (网卡信息)](#127-获取ip地址列表-网卡信息)
128. [添加IP标签](#128-添加ip标签)
129. [删除IP标签](#129-删除ip标签)
130. [编辑IP标签](#130-编辑ip标签)
131. [设置IP轮换](#131-设置ip轮换)
132. [获取邮件转发规则列表 (按类型)](#132-获取邮件转发规则列表-按类型)
133. [获取指定域名的邮箱用户列表](#133-获取指定域名的邮箱用户列表)
134. [添加邮件转发规则](#134-添加邮件转发规则)
135. [编辑邮件转发规则](#135-编辑邮件转发规则)
136. [删除邮件转发规则](#136-删除邮件转发规则)

---

## API 列表

### 1. 获取今日数据
- **描述**: 获取邮件服务的今日统计数据。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_today_count' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 2. 获取邮件日志
- **描述**: 获取邮件服务的操作日志或传输日志。
- **参数**:
  - `p` (number): 页码。
  - `size` (number): 每页显示数量。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/mail_log_list' \
-H 'Content-Type: application/json' \
-d '{
  "p": 1,
  "size": 10
}'
```

### 3. 获取域名列表
- **描述**: 获取在邮局服务中配置的域名列表。
- **参数**:
  - `p` (number): 页码。
  - `size` (number): 每页显示数量。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_domains' \
-H 'Content-Type: application/json' \
-d '{
  "p": 1,
  "size": 10
}'
```

### 4. 刷新域名记录
- **描述**: 强制刷新指定域名的DNS记录缓存。
- **参数**:
  - `domain` (string): 需要刷新记录的域名。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/flush_domain_record' \
-H 'Content-Type: application/json' \
-d '{
  "domain": "example.com"
}'
```

### 5. 设置域名Catchall
- **描述**: 设置指定域名的Catch-all（邮件捕获）规则。
- **参数**:
  - `domain` (string): 目标域名。
  - `email` (string): 用于接收所有未匹配邮件的邮箱地址。
  - `catch_type` (string): Catch-all类型 (具体值需参考后端定义)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/enable_catchall' \
-H 'Content-Type: application/json' \
-d '{
  "domain": "example.com",
  "email": "catchall@example.com",
  "catch_type": "forward"
}'
```

### 6. 设置域名证书
- **描述**: 为指定域名设置SSL/TLS证书。
- **参数**:
  - `domain` (string): 目标域名。
  - `csr` (string): 证书签名请求 (CSR)内容。
  - `key` (string): 证书私钥内容。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/set_mail_certificate_multiple' \
-H 'Content-Type: application/json' \
-d '{
  "domain": "example.com",
  "csr": "-----BEGIN CERTIFICATE REQUEST-----\n...\n-----END CERTIFICATE REQUEST-----",
  "key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----",
  "act": "add"
}'
```

### 7. 删除域名证书
- **描述**: 删除指定域名的SSL/TLS证书配置。
- **参数**:
  - `domain` (string): 目标域名。
  - `csr` (string): (此参数在删除时可能不需要，但API定义中存在，具体以后端为准)
  - `key` (string): (此参数在删除时可能不需要，但API定义中存在，具体以后端为准)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/set_mail_certificate_multiple' \
-H 'Content-Type: application/json' \
-d '{
  "domain": "example.com",
  "csr": "",
  "key": "",
  "act": "delete"
}'
```

### 8. 添加域名
- **描述**: 在邮局服务中添加新的域名。
- **参数**:
  - `domain` (string): 要添加的域名。
  - `a_record` (string): 域名的A记录值 (IP地址)。
  - `mailboxes` (number): 该域名下允许的邮箱数量。
  - `quota` (string): 邮箱配额 (例如 '1024M')。
  - `email` (string): (可能是管理员邮箱或Catch-all邮箱，根据实际功能确定)
  - `catch_type` (string): Catch-all类型。
  - `auto_create_record` (number): 是否自动创建DNS记录 (0或1)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/add_domain_new' \
-H 'Content-Type: application/json' \
-d '{
  "domain": "newdomain.com",
  "a_record": "192.0.2.1",
  "mailboxes": 10,
  "quota": "1G",
  "email": "admin@newdomain.com",
  "catch_type": "reject",
  "auto_create_record": 1
}'
```

### 9. 编辑域名
- **描述**: 修改已添加域名的配置信息。
- **参数**:
  - `domain` (string): 要编辑的域名。
  - `a_record` (string): 新的A记录值。
  - `mailboxes` (number): 新的允许邮箱数量。
  - `quota` (string): 新的邮箱配额。
  - `email` (string): (可能是管理员邮箱或Catch-all邮箱)
  - `catch_type` (string): 新的Catch-all类型。
  - `auto_create_record` (number): 是否自动创建DNS记录。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/update_domain' \
-H 'Content-Type: application/json' \
-d '{
  "domain": "newdomain.com",
  "a_record": "192.0.2.2",
  "mailboxes": 20,
  "quota": "2G",
  "email": "sysadmin@newdomain.com",
  "catch_type": "forward",
  "auto_create_record": 0
}'
```

### 10. 删除域名
- **描述**: 从邮局服务中删除指定的域名及其相关配置。
- **参数**:
  - `domain` (string): 要删除的域名。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/delete_domain' \
-H 'Content-Type: application/json' \
-d '{
  "domain": "newdomain.com"
}'
```

### 11. 删除MX和TXT记录缓存
- **描述**: 清除指定域名的MX记录和TXT记录的本地DNS缓存。
- **参数**:
  - `domain` (string): 目标域名。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/delete_mx_txt_cache' \
-H 'Content-Type: application/json' \
-d '{
  "domain": "example.com"
}'
```

### 12. 获取域名名称列表
- **描述**: 获取所有已添加到邮局服务中的域名名称列表 (通常用于下拉选择)。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_domain_name' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 13. 获取邮箱用户列表
- **描述**: 获取邮局服务中所有邮箱用户的列表，支持分页。
- **参数**:
  - `p` (number): 页码。
  - `size` (number): 每页显示数量。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_mailboxs' \
-H 'Content-Type: application/json' \
-d '{
  "p": 1,
  "size": 20
}'
```

### 14. 添加邮箱用户
- **描述**: 在指定域名下添加新的邮箱用户。
- **参数**:
  - `full_name` (string): 用户全名。
  - `username` (string): 邮箱用户名 (通常是 `user@domain.com` 格式)。
  - `quota` (string): 邮箱配额 (例如 '512M')。
  - `is_admin` (number): 是否为管理员 (0或1)。
  - `password` (string): 邮箱密码。
  - `active` (number): 账户是否激活 (0或1)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/add_mailbox' \
-H 'Content-Type: application/json' \
-d '{
  "full_name": "John Doe",
  "username": "john.doe@example.com",
  "quota": "1G",
  "is_admin": 0,
  "password": "s3cr3tP@sswOrd",
  "active": 1
}'
```

### 15. 编辑邮箱用户
- **描述**: 修改已存在的邮箱用户的配置信息。
- **参数**:
  - `full_name` (string): 用户全名。
  - `username` (string): 要编辑的邮箱用户名。
  - `quota` (string): 新的邮箱配额。
  - `is_admin` (number): 是否为管理员。
  - `password` (string, 可选): 新密码 (不提供则不修改)。
  - `active` (number): 账户激活状态。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/update_mailbox' \
-H 'Content-Type: application/json' \
-d '{
  "full_name": "Johnathan Doe",
  "username": "john.doe@example.com",
  "quota": "2G",
  "is_admin": 0,
  "active": 1
}'
```

### 16. 删除邮箱用户
- **描述**: 从邮局服务中删除指定的邮箱用户。
- **参数**:
  - `username` (string): 要删除的邮箱用户名。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/delete_mailbox' \
-H 'Content-Type: application/json' \
-d '{
  "username": "john.doe@example.com"
}'
```

### 17. 获取密抄邮箱列表
- **描述**: 获取当前的邮件密送 (BCC) 规则列表。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_bcc' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 18. 添加密抄邮箱
- **描述**: 添加新的邮件密送 (BCC) 规则。
- **参数**:
  - `user` (string): 源邮箱地址 (发送或接收方，根据type确定)。
  - `forward_user` (string): 密送到的目标邮箱地址。
  - `type` (string): 密送类型 (例如 'sender' 或 'recipient')。
  - `active` (number): 规则是否激活 (0或1)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/set_mail_bcc' \
-H 'Content-Type: application/json' \
-d '{
  "user": "source@example.com",
  "forward_user": "bcc_recipient@another.com",
  "type": "sender",
  "active": 1
}'
```

### 19. 修改密抄邮箱
- **描述**: 修改已存在的邮件密送 (BCC) 规则。
- **参数**:
  - `user` (string): 要修改规则的源邮箱地址 (原始)。
  - `type` (string): 原始密送类型。
  - `forward_user` (string): 原始密送到的目标邮箱地址。
  - `type_new` (string): 新的密送类型。
  - `forward_user_new` (string): 新的密送目标邮箱地址。
  - `active_new` (number): 新的激活状态。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/update_bcc' \
-H 'Content-Type: application/json' \
-d '{
  "user": "source@example.com",
  "type": "sender",
  "forward_user": "bcc_recipient@another.com",
  "type_new": "recipient",
  "forward_user_new": "new_bcc@another.com",
  "active_new": 1
}'
```

### 20. 删除密抄邮箱
- **描述**: 删除指定的邮件密送 (BCC) 规则。
- **参数**:
  - `user` (string): 源邮箱地址。
  - `type` (string): 密送类型。
  - `forward_user` (string): 密送到的目标邮箱地址。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/del_bcc' \
-H 'Content-Type: application/json' \
-d '{
  "user": "source@example.com",
  "type": "recipient",
  "forward_user": "new_bcc@another.com"
}'
```

### 21. 获取邮件转发列表
- **描述**: 获取当前的邮件转发规则列表。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_mail_forward' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 22. 添加转发邮件
- **描述**: 添加新的邮件转发规则。
- **参数**:
  - `user` (string): 源邮箱地址 (不含域名部分)。
  - `domain` (string): 源邮箱地址的域名部分。
  - `forward_user` (string): 转发到的目标邮箱地址。
  - `active` (number): 规则是否激活 (0或1)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/set_mail_forward' \
-H 'Content-Type: application/json' \
-d '{
  "user": "original_user",
  "domain": "example.com",
  "forward_user": "forward_to@another.com",
  "active": 1
}'
```

### 23. 编辑转发邮件
- **描述**: 修改已存在的邮件转发规则。
- **参数**:
  - `user` (string): 要修改规则的源邮箱地址 (完整地址 `user@domain.com`)。
  - `forward_user` (string): 新的转发目标邮箱地址。
  - `active` (number): 新的激活状态。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/edit_mail_forward' \
-H 'Content-Type: application/json' \
-d '{
  "user": "original_user@example.com",
  "forward_user": "new_forward_to@another.com",
  "active": 1
}'
```

### 24. 删除转发邮件
- **描述**: 删除指定的邮件转发规则。
- **参数**:
  - `user` (string): 要删除规则的源邮箱地址 (完整地址 `user@domain.com`)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/delete_mail_forward' \
-H 'Content-Type: application/json' \
-d '{
  "user": "original_user@example.com"
}'
```

### 25. 获取所有用户列表
- **描述**: 获取邮局服务中所有用户的简要列表 (通常用于选择器)。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_all_user' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 26. 获取收件箱邮件
- **描述**: 获取指定用户的收件箱邮件列表。
- **参数**:
  - `p` (number): 页码。
  - `username` (string): 目标用户的邮箱地址。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_mails' \
-H 'Content-Type: application/json' \
-d '{
  "p": 1,
  "username": "user@example.com"
}'
```

### 27. 标记为垃圾邮件
- **描述**: 将指定的邮件移动到该用户的垃圾邮件文件夹。
- **参数**:
  - `path` (string): 邮件在文件系统中的路径或唯一标识符。
  - `username` (string): 所属用户的邮箱地址。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/move_to_junk' \
-H 'Content-Type: application/json' \
-d '{
  "path": "/path/to/mail/file_or_id",
  "username": "user@example.com"
}'
```

### 28. 删除邮件
- **描述**: 永久删除指定的邮件。
- **参数**:
  - `path` (string): 邮件在文件系统中的路径或唯一标识符。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/delete_mail' \
-H 'Content-Type: application/json' \
-d '{
  "path": "/path/to/mail/file_or_id"
}'
```

### 29. 获取垃圾箱邮件
- **描述**: 获取指定用户的垃圾邮件文件夹中的邮件列表。
- **参数**:
  - `p` (number): 页码。
  - `username` (string): 目标用户的邮箱地址。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_junk_mails' \
-H 'Content-Type: application/json' \
-d '{
  "p": 1,
  "username": "user@example.com"
}'
```

### 30. 从垃圾邮件恢复
- **描述**: 将指定的垃圾邮件移回到该用户的收件箱。
- **参数**:
  - `path` (string): 邮件在垃圾箱中的路径或唯一标识符。
  - `username` (string): 所属用户的邮箱地址。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/move_out_junk' \
-H 'Content-Type: application/json' \
-d '{
  "path": "/path/to/junk/mail/file_or_id",
  "username": "user@example.com"
}'
```

### 31. 获取已发送邮件
- **描述**: 获取指定用户的已发送邮件文件夹中的邮件列表。
- **参数**:
  - `p` (number): 页码。
  - `username` (string): 目标用户的邮箱地址。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_sent_mails' \
-H 'Content-Type: application/json' \
-d '{
  "p": 1,
  "username": "user@example.com"
}'
```

### 32. 发送邮件内容
- **描述**: 通过邮局服务发送一封新邮件。
- **参数**:
  - `mail_from` (string): 发件人邮箱地址。
  - `mail_to` (string): 收件人邮箱地址 (多个用逗号分隔)。
  - `subject` (string): 邮件主题。
  - `content` (string): 邮件内容 (HTML或纯文本)。
  - `subtype` (string): 内容类型 (例如 'html' 或 'plain')。
  - `smtp_server` (string): 使用的SMTP服务器地址。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/send_mail' \
-H 'Content-Type: application/json' \
-d '{
  "mail_from": "sender@example.com",
  "mail_to": "recipient1@example.net,recipient2@example.org",
  "subject": "Hello from API",
  "content": "<h1>This is a test email</h1><p>Sent via API.</p>",
  "subtype": "html",
  "smtp_server": "mail.example.com"
}'
```

### 33. 获取发送任务列表
- **描述**: 获取批量邮件发送任务的列表。
- **参数**:
  - `p` (number): 页码。
  - `size` (number): 每页显示数量。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_task_list' \
-H 'Content-Type: application/json' \
-d '{
  "p": 1,
  "size": 10
}'
```

### 34. 获取发送任务错误
- **描述**: 获取指定批量发送任务的错误汇总信息。
- **参数**:
  - `task_id` (number): 任务ID。
  - `type` (string): 错误类型或分类。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_log_rank' \
-H 'Content-Type: application/json' \
-d '{
  "task_id": 123,
  "type": "bounce"
}'
```

### 35. 获取发送任务错误详情
- **描述**: 获取指定批量发送任务特定错误类型的详细列表。
- **参数**:
  - `task_id` (number): 任务ID。
  - `type` (string): 错误类型。
  - `value` (string): 错误值或具体错误信息用于筛选。
  - `page` (number): 页码。
  - `size` (number): 每页显示数量。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_log_list' \
-H 'Content-Type: application/json' \
-d '{
  "task_id": 123,
  "type": "bounce",
  "value": "user unknown",
  "page": 1,
  "size": 20
}'
```

### 36. 删除发送任务
- **描述**: 删除指定的批量邮件发送任务。
- **参数**:
  - `task_id` (number): 要删除的任务ID。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/delete_task' \
-H 'Content-Type: application/json' \
-d '{
  "task_id": 123
}'
```

### 37. 导入收件人
- **描述**: 从文件导入收件人列表用于批量发送。
- **参数**:
  - `file` (string): 上传的收件人文件路径或标识。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/processing_recipient' \
-H 'Content-Type: application/json' \
-d '{
  "file": "/path/to/uploaded/recipients.csv"
}'
```

### 38. 获取导入收件人数据
- **描述**: 获取已导入收件人文件的处理结果或数据预览。
- **参数**:
  - `file` (string): 已上传并处理的收件人文件路径或标识。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_recipient_data' \
-H 'Content-Type: application/json' \
-d '{
  "file": "/path/to/uploaded/recipients.csv"
}'
```

### 39. 添加批量发送任务
- **描述**: 创建一个新的批量邮件发送任务。
- **参数**:
  - `task_name` (string): 任务名称。
  - `addresser` (string): 发件人邮箱地址。
  - `file_recipient` (string): 收件人文件路径或标识。
  - `subject` (string): 邮件主题。
  - `up_content` (number): (具体含义未知，可能与内容来源有关，0或1)。
  - `file_content` (string): 邮件内容文件路径 (如果 `up_content` 指向文件)。
  - `content` (string): 邮件内容 (如果 `up_content` 指向直接输入)。
  - `is_record` (number): 是否记录发送日志 (0或1)。
  - `unsubscribe` (number): 是否添加退订链接 (0或1)。
  - `threads` (number): 发送线程数。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/bulk/add_task' \
-H 'Content-Type: application/json' \
-d '{
  "task_name": "Newsletter Q4",
  "addresser": "newsletter@example.com",
  "file_recipient": "/path/to/recipients_q4.csv",
  "subject": "Q4 Updates and Offers",
  "up_content": 0,
  "content": "<p>Dear subscriber, here are our Q4 updates...</p>",
  "is_record": 1,
  "unsubscribe": 1,
  "threads": 5
}'
```

### 40. 暂停/恢复发送任务
- **描述**: 暂停或恢复指定的批量邮件发送任务。
- **参数**:
  - `task_id` (number): 任务ID。
  - `pause` (number): 操作类型 (1表示暂停, 0表示恢复)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/pause_task' \
-H 'Content-Type: application/json' \
-d '{
  "task_id": 123,
  "pause": 1
}'
```

### 41. 获取备份设置参数
- **描述**: 获取当前邮局服务的备份计划（定时任务）状态和参数。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_backup_task_status' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 42. 关闭备份计划
- **描述**: 关闭当前邮局服务的自动备份计划。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/close_backup_task' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 43. 获取已安装云存储列表
- **描述**: 获取面板中已安装并可用于备份的云存储插件列表。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_cloud_storage_list' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 44. 保存备份设置
- **描述**: 设置并保存邮局服务的自动备份计划。
- **参数**:
  - `type` (string): 备份周期类型 (例如 'day', 'week')。
  - `week` (string, 可选): 如果 `type` 为 'week', 指定星期几 (例如 '1' for Monday)。
  - `hour` (number): 执行备份的小时。
  - `minute` (number): 执行备份的分钟。
  - `backupTo` (string): 备份目标路径或云存储标识。
  - `save` (number): 保留的备份数量。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/open_backup_task' \
-H 'Content-Type: application/json' \
-d '{
  "type": "day",
  "hour": 2,
  "minute": 30,
  "backupTo": "local_disk_backup_path",
  "save": 7
}'
```

### 45. 获取备份路径
- **描述**: 获取邮局服务默认的本地备份存储路径。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_backup_path' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 46. 获取备份邮件列表
- **描述**: 获取指定路径下的备份文件列表。
- **参数**:
  - `path` (string): 备份文件所在的路径。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_backup_file_list' \
-H 'Content-Type: application/json' \
-d '{
  "path": "/www/backup/mail"
}'
```

### 47. 恢复备份邮件
- **描述**: 从指定的备份文件恢复邮件数据。
- **参数**:
  - `file_path` (string): 备份文件的完整路径。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/restore' \
-H 'Content-Type: application/json' \
-d '{
  "file_path": "/www/backup/mail/backup_20231027.zip"
}'
```

### 48. 获取服务状态
- **描述**: 获取邮局相关服务（如Postfix, Dovecot等）的当前运行状态。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_service_status' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 49. 设置服务状态
- **描述**: 启动、停止或重启指定的邮局相关服务。
- **参数**:
  - `service` (string): 服务名称 (例如 'postfix', 'dovecot')。
  - `type` (string): 操作类型 (例如 'start', 'stop', 'restart')。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/service_admin' \
-H 'Content-Type: application/json' \
-d '{
  "service": "postfix",
  "type": "restart"
}'
```

### 50. 修复服务配置
- **描述**:尝试修复指定邮局服务的配置文件。
- **参数**:
  - `service` (string): 服务名称。
  - `type` (string): (具体含义未知，可能与修复类型或特定配置相关)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/repair_service_conf' \
-H 'Content-Type: application/json' \
-d '{
  "service": "dovecot",
  "type": "default_fix"
}'
```

### 51. 获取服务配置文件
- **描述**: 获取指定邮局服务的配置文件内容。
- **参数**:
  - `service` (string): 服务名称。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_config' \
-H 'Content-Type: application/json' \
-d '{
  "service": "postfix"
}'
```

### 52. 保存服务配置文件
- **描述**: 保存对指定邮局服务配置文件的修改。
- **参数**:
  - `service` (string): 服务名称。
  - `data` (string): 修改后的完整配置文件内容。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/save_config' \
-H 'Content-Type: application/json' \
-d '{
  "service": "postfix",
  "data": "# Postfix main.cf new content...\nmyhostname = mail.example.com\n..."
}'
```

### 53. 获取服务监控任务状态
- **描述**: 获取邮局服务状态监控的定时任务是否启用。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_service_monitor_status' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 54. 打开服务状态监测任务
- **描述**: 启用邮局服务的状态自动监控任务。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/open_service_monitor_task' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 55. 关闭服务状态监控任务
- **描述**: 关闭邮局服务的状态自动监控任务。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/close_service_monitor_task' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 56. 获取邮件保留天数
- **描述**: 获取当前设置的邮件在服务器上的保留天数。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_save_day' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 57. 设置邮件保留天数
- **描述**: 设置邮件在服务器上的保留天数。
- **参数**:
  - `save_day` (number): 保留天数 (0可能表示永久保留，具体看后端实现)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/set_save_day' \
-H 'Content-Type: application/json' \
-d '{
  "save_day": 30
}'
```

### 58. 检查邮箱环境
- **描述**: 检查当前服务器环境是否满足邮局服务的运行要求。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/check_mail_env' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 59. 修复邮局环境
- **描述**: 尝试修复邮局环境检测中发现的问题项。
- **参数**:
  - `key` (string): (可能为问题项的标识，用于日志或提示)
  - `method` (string): 对应修复操作的后端方法名或路径片段。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/your_repair_method_name' \
-H 'Content-Type: application/json' \
-d '{}'
```
*注意: 上述cURL中的 `your_repair_method_name` 需要根据实际的 `method` 参数值替换。*

### 60. 修改主机名
- **描述**: 修改服务器的主机名 (hostname)，这对于邮件服务正常运行很重要。
- **参数**:
  - `hostname` (string): 新的主机名。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/change_hostname' \
-H 'Content-Type: application/json' \
-d '{
  "hostname": "new.mail.example.com"
}'
```

### 61. 安装邮局服务 (初始化)
- **描述**: 执行邮局服务的初始化安装流程。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/setup_mail_sys' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 62. 获取初始化日志
- **描述**: 获取邮局服务初始化安装过程的日志。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_init_log' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 63. 获取WebMail状态
- **描述**: 获取WebMail (如Roundcube) 应用程序的安装和运行状态。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_roundcube_status' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 64. 获取WebMail绑定域名
- **描述**: 获取当前WebMail服务绑定的域名信息。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_domain' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 65. 卸载WebMail
- **描述**: 卸载已安装的WebMail应用程序。
- **参数**:
  - `id` (number): WebMail站点的ID。
  - `site_name` (string): WebMail站点的名称 (通常是域名)。
  - `force` (number): 是否强制卸载 (0或1)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/uninstall_roundcube' \
-H 'Content-Type: application/json' \
-d '{
  "id": 1,
  "site_name": "webmail.example.com",
  "force": 0
}'
```

### 66. 安装WebMail
- **描述**: 安装WebMail应用程序 (如Roundcube)。
- **参数**:
  - `site_name` (string): WebMail要安装到的站点名称 (域名)。
  - `php_version` (string): 用于运行WebMail的PHP版本。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/add_roundcube' \
-H 'Content-Type: application/json' \
-d '{
  "site_name": "webmail.example.com",
  "php_version": "74"
}'
```

### 67. 添加WebMail配置信息
- **描述**: 为已安装的WebMail添加或更新配置信息。
- **参数**:
  - `id` (number): WebMail站点的ID。
  - `site_name` (string): WebMail站点的名称。
  - `path` (string): WebMail的安装路径。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/add_roundcube_info' \
-H 'Content-Type: application/json' \
-d '{
  "id": 1,
  "site_name": "webmail.example.com",
  "path": "/www/wwwroot/webmail.example.com"
}'
```

### 68. 一键登录WebMail
- **描述**: 获取用于自动登录指定用户到WebMail的令牌或URL。
- **参数**:
  - `rc_user` (string): 要登录的邮箱用户名。
  - `rc_pass` (string): 邮箱密码。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/login_roundcube' \
-H 'Content-Type: application/json' \
-d '{
  "rc_user": "user@example.com",
  "rc_pass": "s3cr3tP@sswOrd"
}'
```

### 69. 获取收件人黑名单列表
- **描述**: 获取当前邮局系统中的收件人黑名单列表。
- **参数**:
  - `keyword` (string): 搜索关键字 (用于筛选黑名单中的邮箱地址)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/recipient_blacklist' \
-H 'Content-Type: application/json' \
-d '{
  "keyword": "spam@domain.com"
}'
```

### 70. 添加收件人到黑名单
- **描述**: 将一个或多个邮箱地址添加到收件人黑名单。
- **参数**:
  - `emails_to_add` (string[]): 要添加到黑名单的邮箱地址数组。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/add_recipient_blacklist' \
-H 'Content-Type: application/json' \
-d '{
  "emails_to_add": "[\"spammer1@evil.com\", \"spammer2@bad.org\"]"
}'
```
*注意: `emails_to_add` 需要传递JSON字符串形式的数组。*

### 71. 从收件人黑名单删除
- **描述**: 将一个或多个邮箱地址从收件人黑名单中移除。
- **参数**:
  - `emails_to_remove` (string[]): 要从黑名单移除的邮箱地址数组。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/del_recipient_blacklist' \
-H 'Content-Type: application/json' \
-d '{
  "emails_to_remove": "[\"spammer1@evil.com\"]"
}'
```
*注意: `emails_to_remove` 需要传递JSON字符串形式的数组。*

### 72. 导出收件人黑名单
- **描述**: 导出当前的收件人黑名单列表。
- **参数**: (该接口参数定义为 `data = {}`，通常表示不需要特定参数，或参数可选)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/export_recipient_blacklist' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 73. 导入收件人黑名单
- **描述**: 从文件导入邮箱地址到收件人黑名单。
- **参数**:
  - `file` (string): 上传的黑名单文件路径或标识。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/import_recipient_blacklist' \
-H 'Content-Type: application/json' \
-d '{
  "file": "/path/to/uploaded/blacklist.txt"
}'
```

### 74. 删除文件
- **描述**: (通用文件删除接口) 删除服务器上指定路径的文件。
- **参数**:
  - `path` (string): 要删除的文件的完整路径。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/files?action=DeleteFile' \
-H 'Content-Type: application/json' \
-d '{
  "path": "/www/wwwroot/example.com/temp_file.zip"
}'
```

### 75. 获取邮局扩展包产品信息
- **描述**: 获取邮局服务相关的商业扩展包或增值服务的产品信息。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/manage/get_product_info' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 76. 创建邮局扩展包订单
- **描述**: 为购买邮局扩展包或增值服务创建订单。
- **参数**: `data` (AnyObject): 订单相关参数 (具体字段依赖后端定义，例如产品ID、周期等)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/manage/create_order' \
-H 'Content-Type: application/json' \
-d '{
  "product_id": "premium_feature_pack",
  "billing_cycle": "monthly"
}'
```

### 77. 邮局扩展包余额购买
- **描述**: 使用账户余额购买邮局扩展包或增值服务。
- **参数**: `data` (AnyObject): 购买参数 (具体字段依赖后端定义)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/manage/product_credit_buy' \
-H 'Content-Type: application/json' \
-d '{
  "order_id": "ORDER12345",
  "amount": 10.00
}'
```

### 78. 监听支付状态
- **描述**: 查询特定订单的支付状态。
- **参数**: `data` (AnyObject): 包含订单标识等信息的参数。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/manage/pay_status' \
-H 'Content-Type: application/json' \
-d '{
  "transaction_id": "PAYMENT_XYZ789"
}'
```

### 79. 获取用户邮局扩展包余量
- **描述**: 获取用户当前拥有的邮局扩展包或增值服务的余量信息。
- **参数**: `data` (AnyObject): (可能包含用户标识等，具体字段依赖后端定义)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/manage/user_surplus' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 80. 安装邮局扩展包服务
- **描述**: 安装或激活已购买的邮局扩展包服务。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/manage/install_service' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 81. 营销邮件数据总览
- **描述**: 获取营销邮件活动的整体数据统计和概览。
- **参数**:
  - `domain` (string, 可选): 按域名筛选。
  - `start_time` (number): 开始时间戳。
  - `end_time` (number): 结束时间戳。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/overview_api?action=overview' \
-H 'Content-Type: application/json' \
-d '{
  "domain": "example.com",
  "start_time": 1672502400,
  "end_time": 1675180799
}'
```

### 82. 获取营销邮件错误详情
- **描述**: 获取营销邮件发送失败的详细错误信息。
- **参数**: 无 (接口名为 `getErrorDetails`，但参数未定，可能通过其他方式筛选)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_data_info' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 83. 编辑批量发送任务
- **描述**: 修改已创建的批量邮件发送任务的配置。
- **参数**:
  - `id` (number): 要编辑的任务ID。
  (其他参数未在签名中列出，但通常编辑操作会包含任务的各项属性，如名称、主题、内容、收件人列表等，需要参照添加任务的参数或实际API行为)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/bulk/update_task' \
-H 'Content-Type: application/json' \
-d '{
  "id": 123
  # "task_name": "Updated Newsletter Q4", ... other fields to update
}'
```

### 84. 发送测试邮件
- **描述**: 发送一封测试邮件，通常用于验证邮件模板或发送配置。
- **参数**:
  - `mail_from` (string): 发件人邮箱地址。
  - `mail_to` (string): 测试收件人邮箱地址。
  - `subject` (string): 测试邮件主题。
  - `temp_id` (number): 使用的邮件模板ID。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/send_mail_test' \
-H 'Content-Type: application/json' \
-d '{
  "mail_from": "test_sender@example.com",
  "mail_to": "tester@example.net",
  "subject": "Test Email - Template Check",
  "temp_id": 15
}'
```

### 85. 获取订阅趋势数据
- **描述**: 获取联系人订阅/退订数量随时间变化的趋势数据 (用于图表展示)。
- **参数**:
  - `active` (number): (具体含义未知，可能用于筛选订阅状态或特定活动，0或1或其他枚举值)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_contacts_list' \
-H 'Content-Type: application/json' \
-d '{
  "active": 1 
}'
```

### 86. 获取邮件类型列表 (联系人分类)
- **描述**: 获取用户定义的邮件类型或联系人分类列表。
- **参数**: `data` (any): (参数类型为 `any`，具体结构依赖后端实现，可能包含分页、搜索等)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_mail_type_list' \
-H 'Content-Type: application/json' \
-d '{
  "page": 1,
  "size": 10
}'
```

### 87. 删除批量发送邮箱列表(应为删除邮件类型/联系人分类)
- **描述**: 删除指定的邮件类型或联系人分类。
- **参数**:
  - `ids` (number[]): 要删除的邮件类型/分类的ID数组。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/del_mail_type_list' \
-H 'Content-Type: application/json' \
-d '{
  "ids": [1, 2, 3]
}'
```

### 88. 获取批量发送邮箱列表(应为获取邮件类型/联系人分类下的联系人)
- **描述**: 获取指定邮件类型/联系人分类下的联系人列表。
- **参数**:
  - `search` (string): 搜索关键字 (用于筛选联系人)。
  (可能还需要一个邮件类型/分类ID作为参数，但签名中未体现)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_mail_type_info_list' \
-H 'Content-Type: application/json' \
-d '{
  "search": "john.doe@example.com"
  # "mail_type_id": 5 (example of a missing parameter)
}'
```

### 89. 添加邮件类型 (联系人分类)
- **描述**: 添加新的邮件类型或联系人分类。
- **参数**:
  - `mail_type` (string): 新邮件类型/分类的名称。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/add_mail_type' \
-H 'Content-Type: application/json' \
-d '{
  "mail_type": "VIP Customers"
}'
```

### 90. 编辑邮件类型 (联系人分类)
- **描述**: 修改已存在的邮件类型或联系人分类的名称。
- **参数**:
  - `id` (number): 要编辑的邮件类型/分类的ID。
  - `mail_type` (string): 新的邮件类型/分类名称。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/edit_mail_type' \
-H 'Content-Type: application/json' \
-d '{
  "id": 10,
  "mail_type": "Premium Subscribers"
}'
```

### 91. 清空所有异常邮箱数据
- **描述**: 清空所有被标记为指定状态的异常邮箱记录。
- **参数**:
  - `status` (string): 要清空的异常状态类型 (例如 'bounce', 'complaint')。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/clear_abnormal_recipient' \
-H 'Content-Type: application/json' \
-d '{
  "status": "bounce"
}'
```

### 92. 删除指定异常邮箱列表
- **描述**: 删除指定的异常邮箱记录。
- **参数**:
  - `ids` (number): (签名中为number，但通常批量删除用number[]，以JSDoc或实际为准) 要删除的异常记录ID或ID列表。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/del_abnormal_recipient' \
-H 'Content-Type: application/json' \
-d '{
  "ids": 123 # or [123, 124]
}'
```

### 93. 获取异常邮箱列表
- **描述**: 获取被标记为异常的邮箱列表 (如退回、投诉等)。
- **参数**:
  - `search` (string): 搜索关键字。
  (可能还需要状态类型等参数进行筛选)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_abnormal_recipient' \
-H 'Content-Type: application/json' \
-d '{
  "search": "user@example.com"
  # "status": "bounce" (example of potential missing parameter)
}'
```

### 94. 获取异常邮箱状态类型
- **描述**: 获取系统中定义的异常邮箱状态类型列表 (例如 'bounce', 'complaint', 'unsubscribed')。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_abnormal_status' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 95. 获取退订列表
- **描述**: 获取已退订邮件服务的联系人列表。
- **参数**:
  - `search` (string): 搜索关键字。
  - `etype` (number, 可选): (具体含义未知，可能是邮件类型或活动ID进行筛选)。
  - `active` (number): (具体含义未知，通常退订列表active应为特定值，例如表示已退订)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_unsubscribe_list' \
-H 'Content-Type: application/json' \
-d '{
  "search": "user@example.com",
  "active": 1 # Assuming 1 means unsubscribed
}'
```

### 96. 删除退订记录
- **描述**: 从退订列表中删除指定的记录。
- **参数**:
  - `ids` (number): (签名中为number，批量操作通常为number[]) 要删除的退订记录ID或ID列表。
  - `active` (number): (具体含义未知，可能与记录状态有关)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/del_unsubscribe_list' \
-H 'Content-Type: application/json' \
-d '{
  "ids": 45,
  "active": 1
}'
```

### 97. 切换退订状态
- **描述**: 修改指定联系人的邮件订阅状态 (订阅/退订)。
- **参数**:
  - `recipient` (string): 目标联系人的邮箱地址。
  - `active` (number): 新的订阅状态 (例如 1表示订阅, 0表示退订)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/update_subscription_state' \
-H 'Content-Type: application/json' \
-d '{
  "recipient": "user@example.com",
  "active": 0
}'
```

### 98. 导入联系人到指定分类
- **描述**: 从文件导入联系人列表，并将其归类到指定的邮件类型/联系人分类。
- **参数**:
  - `file` (string): 上传的联系人文件路径或标识。
  - `mail_type` (string): 目标邮件类型/联系人分类的名称或ID。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/bulk/import_contacts' \
-H 'Content-Type: application/json' \
-d '{
  "file": "/path/to/contacts.csv",
  "mail_type": "Newsletter Subscribers"
}'
```

### 99. 导入联系人到指定退订状态分类
- **描述**: 从文件导入联系人列表，并根据其退订状态 (etypes) 和 active 状态进行分类。
- **参数**:
  - `file` (string): 上传的联系人文件路径或标识。
  - `etypes` (string): 邮件类型/分类的标识 (可能是ID或名称，逗号分隔)。
  - `active` (number): 活跃状态 (例如 0表示退订, 1表示订阅)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/bulk/import_contacts_etypes' \
-H 'Content-Type: application/json' \
-d '{
  "file": "/path/to/contacts_with_status.csv",
  "etypes": "TypeA,TypeB",
  "active": 0
}'
```

### 100. 删除邮件类型 (联系人分类)
- **描述**: 删除指定的邮件类型或联系人分类。
- **参数**:
  - `ids` (string): 要删除的邮件类型/分类的ID列表 (逗号分隔的字符串)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/del_mail_type_list' \
-H 'Content-Type: application/json' \
-d '{
  "ids": "1,2,3"
}'
```

### 101. 批量设置联系人分类 (订阅/退订)
- **描述**: 批量修改联系人的邮件类型/分类以及其订阅状态。
- **参数**:
  - `etypes` (string): 目标邮件类型/分类的标识 (ID或名称，逗号分隔)。
  - `recipients` (string): 要操作的联系人邮箱地址列表 (逗号分隔)。
  - `active` (number): 新的订阅状态 (0或1)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/edit_type_unsubscribe_list' \
-H 'Content-Type: application/json' \
-d '{
  "etypes": "VIP Customers",
  "recipients": "user1@example.com,user2@example.com",
  "active": 1
}'
```

### 102. 批量设置联系人退订分类
- **描述**: (此接口与上一个接口路径和参数签名完全相同，功能可能重复或有细微差别，需后端确认)。批量修改联系人的邮件类型/分类以及其退订状态。
- **参数**:
  - `etypes` (string): 目标邮件类型/分类的标识 (ID或名称，逗号分隔)。
  - `recipients` (string): 要操作的联系人邮箱地址列表 (逗号分隔)。
  - `active` (number): 新的订阅状态 (0或1)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/edit_type_unsubscribe_list' \
-H 'Content-Type: application/json' \
-d '{
  "etypes": "Unsubscribed Users",
  "recipients": "user3@example.com,user4@example.com",
  "active": 0
}'
```

### 103. 添加邮件模板
- **描述**: 创建新的邮件模板。
- **参数**:
  - `temp_name` (string, 可选): 模板名称。
  - `type` (number): 模板类型 (例如 0表示HTML编辑器, 1表示可视化编辑器, 2表示上传文件)。
  - `render` (string, 可选): (可视化编辑器的渲染数据或HTML模板的预览)。
  - `content` (string, 可选): 邮件模板的HTML内容 (当type为HTML编辑器时)。
  - `upload_path` (string, 可选): 上传的模板文件路径 (当type为上传文件时)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/bulk/add_email_temp' \
-H 'Content-Type: application/json' \
-d '{
  "temp_name": "Welcome Email Template",
  "type": 0,
  "content": "<h1>Welcome, {{name}}!</h1>"
}'
```

### 104. 删除邮件模板
- **描述**: 删除一个或多个指定的邮件模板。
- **参数**:
  - `id` (number | number[]): 要删除的模板ID或ID数组。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/bulk/del_email_temp' \
-H 'Content-Type: application/json' \
-d '{
  "id": 25 # or [25, 26]
}'
```

### 105. 获取邮件模板列表
- **描述**: 获取邮件模板列表，支持分页。
- **参数**:
  - `p` (number): 页码。
  - `size` (number): 每页显示数量。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/bulk/get_email_temp_list' \
-H 'Content-Type: application/json' \
-d '{
  "p": 1,
  "size": 10
}'
```

### 106. 编辑邮件模板
- **描述**: 修改已存在的邮件模板。
- **参数**:
  - `id` (number): 要编辑的模板ID。
  - `type` (number): 模板类型。
  - `temp_name` (string): 新的模板名称。
  - `render` (string, 可选): 新的渲染数据或预览。
  - `content` (string, 可选): 新的HTML内容。
  - `upload_path` (string, 可选): 新的上传文件路径。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/bulk/edit_email_temp' \
-H 'Content-Type: application/json' \
-d '{
  "id": 25,
  "type": 0,
  "temp_name": "Updated Welcome Email",
  "content": "<h1>Hello {{name}}, Welcome Aboard!</h1>"
}'
```

### 107. 获取邮件模板内容
- **描述**: 获取指定邮件模板的详细内容 (通常用于编辑或预览)。
- **参数**:
  - `id` (number): 模板ID。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_task_email_content' \
-H 'Content-Type: application/json' \
-d '{
  "id": 25
}'
```

### 108. 获取指定分类联系人数量
- **描述**: 获取指定邮件类型/联系人分类下的联系人总数。
- **参数**:
  - `etypes` (string): 邮件类型/联系人分类的标识 (ID或名称，逗号分隔)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_contact_number' \
-H 'Content-Type: application/json' \
-d '{
  "etypes": "VIP Customers,Newsletter Subscribers"
}'
```

### 109. 获取邮件模板选择列表
- **描述**: 获取简要的邮件模板列表，通常用于下拉选择器。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/bulk/get_email_temp' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 110. 删除退订配置的域名和端口
- **描述**: 清除或删除用于生成退订链接的域名和端口配置。
- **参数**: `data` (AnyObject, 可选): (参数定义为 `data = {}`，通常表示不需要特定参数)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/del_unsubscribe_info' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 111. 获取退订配置的域名和端口
- **描述**: 获取当前配置的用于生成退订链接的域名和端口信息。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_unsubscribe_info' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 112. 设置退订配置的域名和端口
- **描述**: 设置用于生成退订链接的自定义域名和端口。
- **参数**:
  - `url` (string): 退订链接使用的基础URL (例如 `http://unsubscribe.example.com:8888`)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/set_unsubscribe_info' \
-H 'Content-Type: application/json' \
-d '{
  "url": "http://unsubscribe.mydomain.com"
}'
```

### 113. 获取任务相关的退订列表
- **描述**: 获取特定批量发送任务产生的退订用户列表。
- **参数**:
  - `task_id` (number): 目标发送任务的ID。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_task_unsubscribe_list' \
-H 'Content-Type: application/json' \
-d '{
  "task_id": 123
}'
```

### 114. 获取邮局黑名单提示状态
- **描述**: 获取关于邮局域名可能在RBL黑名单中的提示功能的当前状态 (是否已提示或用户选择不再提示)。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_blacklist_tips' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 115. 设置邮局黑名单提示状态
- **描述**: 用户对邮局域名RBL黑名单提示的操作 (例如选择不再提示)。
- **参数**:
  - `operation` (number): 操作代码 (具体值依赖后端定义, 例如 1表示不再提示)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/Blacklist_tips' \
-H 'Content-Type: application/json' \
-d '{
  "operation": 1
}'
```

### 116. 检测域名是否在RBL黑名单内
- **描述**: 主动检测指定的域名 (A记录对应的IP) 是否存在于常见的RBL (Real-time Blackhole List) 黑名单中。
- **参数**:
  - `a_record` (string): 域名的A记录值 (IP地址)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/bulk/check_blacklists' \
-H 'Content-Type: application/json' \
-d '{
  "a_record": "192.0.2.1"
}'
```

### 117. 获取邮局域名扫描RBL日志
- **描述**: 获取邮局域名进行RBL黑名单扫描的日志记录。
- **参数**:
  - `path` (string): 扫描日志文件的路径或标识。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/read_blacklist_scan_log' \
-H 'Content-Type: application/json' \
-d '{
  "path": "/var/log/mail_blacklist_scan.log"
}'
```

### 118. 邮局域名一键DNS解析
- **描述**: 尝试自动为邮局相关域名在DNS服务商处创建必要的DNS记录 (如MX, SPF, DKIM)。
- **参数**:
  - `domain` (string): 目标域名。
  - `a_record` (string): 域名的A记录值 (IP地址)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/auto_create_dns_record' \
-H 'Content-Type: application/json' \
-d '{
  "domain": "example.com",
  "a_record": "192.0.2.1"
}'
```

### 119. 判断邮局是否已安装
- **描述**: 检查当前服务器上邮局服务是否已经安装和基础配置完成。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/manage/install_status' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 120. 从证书夹部署证书到邮局域名
- **描述**: 将已存在于面板证书夹中的SSL证书部署到指定的邮局域名。
- **参数**:
  - `ssl_hash` (string): 证书在证书夹中的唯一哈希值或标识。
  - `domain` (string): 要部署证书的目标邮局域名。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/set_cert_from_local' \
-H 'Content-Type: application/json' \
-d '{
  "ssl_hash": "abcdef1234567890",
  "domain": "mail.example.com"
}'
```

### 121. 获取自动申请SSL证书任务状态
- **描述**: 获取邮局域名自动申请和续签SSL证书的定时任务的当前状态 (开启/关闭)。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_auto_ssl_task_status' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 122. 开启自动申请SSL证书任务
- **描述**: 开启邮局域名自动申请和续签SSL证书的定时任务。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/open_auto_ssl_task' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 123. 关闭自动申请SSL证书任务
- **描述**: 关闭邮局域名自动申请和续签SSL证书的定时任务。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/close_auto_ssl_task' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 124. 邮局环境初始化
- **描述**: (此接口与 #61 功能描述相似，可能为同一接口或特定场景下的初始化)。执行邮局服务的初始化安装流程。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/setup_mail_sys' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 125. 获取邮局IP标签列表
- **描述**: 获取为邮局多IP发送功能配置的IP标签列表。
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/multipleip/get_ip_tags_api' \
-H 'Content-Type: application/json' \
-d '{}'
```

### 126. 获取可绑定的域名列表 (根据IP标签)
- **描述**: 获取可以绑定到指定IP标签的域名列表。
- **参数**:
  - `tag` (string, 可选): IP标签名称。如果提供，则返回该标签下已绑定的域名；否则可能返回所有可绑定域名。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/multipleip/tag_get_domain_list' \
-H 'Content-Type: application/json' \
-d '{
  "tag": "marketing_ips"
}'
```

### 127. 获取IP地址列表 (网卡信息)
- **描述**: 获取服务器上配置的网络接口及其IP地址列表。
- **参数**:
  - `refresh` (number, 可选): 是否强制刷新缓存 (例如 1 表示刷新)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/multipleip/get_net_interface' \
-H 'Content-Type: application/json' \
-d '{
  "refresh": 1
}'
```

### 128. 添加IP标签
- **描述**: 为邮局多IP发送功能添加新的IP标签配置。
- **参数**:
  - `tag` (string): IP标签名称 (唯一标识)。
  - `ip` (string): 该标签关联的IP地址。
  - `syslog` (string): (具体含义未知，可能与日志配置有关)。
  - `helo` (string): 该IP发送邮件时使用的HELO域名。
  - `ipv` (number): IP版本 (4 或 6)。
  - `binds` (string): 此标签绑定的域名列表 (逗号分隔)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/multipleip/add_ip_tag_api' \
-H 'Content-Type: application/json' \
-d '{
  "tag": "transactional_ip1",
  "ip": "192.0.2.10",
  "syslog": "default",
  "helo": "mail-tx1.example.com",
  "ipv": 4,
  "binds": "orders.example.com,support.example.com"
}'
```

### 129. 删除IP标签
- **描述**: 删除一个或多个已配置的IP标签。
- **参数**:
  - `tags` (string): 要删除的IP标签名称列表 (逗号分隔)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/multipleip/del_ip_tag_api' \
-H 'Content-Type: application/json' \
-d '{
  "tags": "transactional_ip1,old_marketing_ip"
}'
```

### 130. 编辑IP标签
- **描述**: 修改已存在的IP标签配置。
- **参数**:
  - `tag` (string): 要编辑的IP标签名称。
  - `ip` (string): 新的IP地址。
  - `syslog` (string): 新的syslog配置。
  - `helo` (string): 新的HELO域名。
  - `ipv` (number): 新的IP版本。
  - `binds` (string): 新的绑定域名列表 (逗号分隔)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/multipleip/edit_ip_tag_api' \
-H 'Content-Type: application/json' \
-d '{
  "tag": "transactional_ip1",
  "ip": "192.0.2.11",
  "syslog": "custom_log",
  "helo": "mail-tx1-updated.example.com",
  "ipv": 4,
  "binds": "orders.example.com,support.example.com,alerts.example.com"
}'
```

### 131. 设置IP轮换
- **描述**: 为指定的域名或发信组配置IP轮换策略。
- **参数**:
  - `bind` (string): 要配置IP轮换的域名或标识。
  - `tags` (string): 用于轮换的IP标签列表 (逗号分隔)。
  - `cycle` (number): 轮换周期 (单位可能为分钟、小时等，需后端确认)。
  - `status` (number): IP轮换状态 (0表示禁用, 1表示启用)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/multipleip/set_ip_rotate' \
-H 'Content-Type: application/json' \
-d '{
  "bind": "marketing.example.com",
  "tags": "marketing_ip_pool1,marketing_ip_pool2",
  "cycle": 60, 
  "status": 1
}'
```

### 132. 获取邮件转发规则列表 (按类型)
- **描述**: 获取邮件转发规则列表，可以根据类型筛选 (例如用户级转发、域名级转发)。
- **参数**:
  - `dtype` (number): 转发类型 (具体值含义需后端定义)。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/foward/get_mail_forward' \
-H 'Content-Type: application/json' \
-d '{
  "dtype": 1 
}'
```

### 133. 获取指定域名的邮箱用户列表
- **描述**: 获取指定域名下的所有邮箱用户列表。
- **参数**:
  - `domain` (string): 目标域名。
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/main/get_mailbox' \
-H 'Content-Type: application/json' \
-d '{
  "domain": "example.com"
}'
```

### 134. 添加邮件转发规则
- **描述**: 添加新的邮件转发规则。
- **参数**: `data` (any): 包含转发规则详细信息的对象 (具体字段结构依赖后端 `foward/add_forward` 接口的定义)。
  (示例参数，实际字段需参考后端)
  `{
    "source_address": "user@example.com",
    "destination_address": "forwardto@another.org",
    "type": "user_level", 
    "keep_copy": true
  }`
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/foward/add_forward' \
-H 'Content-Type: application/json' \
-d '{
  "source_address": "original@example.com",
  "destination_address": "forwarded@example.net",
  "active": 1
}'
```

### 135. 编辑邮件转发规则
- **描述**: 修改已存在的邮件转发规则。
- **参数**: `data` (any): 包含要修改的转发规则ID以及新规则信息的对象 (具体字段结构依赖后端 `foward/edit_forward` 接口的定义)。
  (示例参数，实际字段需参考后端)
  `{
    "rule_id": 101,
    "destination_address": "new_forwardto@another.org",
    "keep_copy": false
  }`
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/foward/edit_forward' \
-H 'Content-Type: application/json' \
-d '{
  "rule_id": 77,
  "destination_address": "updated_forward@example.net",
  "active": 0
}'
```

### 136. 删除邮件转发规则
- **描述**: 删除指定的邮件转发规则。
- **参数**: `data` (any): 包含要删除的转发规则ID的对象 (具体字段结构依赖后端 `foward/del_forward` 接口的定义)。
  (示例参数，实际字段需参考后端)
  `{
    "rule_id": 101
  }`
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mail/foward/del_forward' \
-H 'Content-Type: application/json' \
-d '{
  "rule_id": 77
}'
```
