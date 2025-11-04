# API 文档 (global.ts)

## 目录
1. [获取公共配置信息](#1-获取公共配置信息)
2. [获取全局配置信息](#2-获取全局配置信息)
3. [获取企业版配置信息](#3-获取企业版配置信息)
4. [获取系统资源信息](#4-获取系统资源信息)
5. [获取列表数据 (旧)](#5-获取列表数据-旧)
6. [获取列表数据 (新)](#6-获取列表数据-新)
7. [已安装软件列表 (消息盒子)](#7-已安装软件列表-消息盒子)
8. [获取执行日志](#8-获取执行日志)
9. [获取任务列表 (通用)](#9-获取任务列表-通用)
10. [取消任务 (通用)](#10-取消任务-通用)
11. [删除消息盒子任务](#11-删除消息盒子任务)
12. [设置备注](#12-设置备注)
13. [验证登录状态](#13-验证登录状态)
14. [重启面板](#14-重启面板)
15. [修复面板 (旧)](#15-修复面板-旧)
16. [修复面板 (新)](#16-修复面板-新)
17. [获取更新日志](#17-获取更新日志)
18. [服务管理](#18-服务管理)
19. [重启服务器](#19-重启服务器)
20. [获取服务器状态](#20-获取服务器状态)
21. [获取测试版日志](#21-获取测试版日志)
22. [绑定宝塔用户](#22-绑定宝塔用户)
23. [获取绑定验证码](#23-获取绑定验证码)
24. [获取面板历史版本](#24-获取面板历史版本)
25. [获取首页推荐软件列表](#25-获取首页推荐软件列表)
26. [安装首页推荐软件](#26-安装首页推荐软件)
27. [申请Linux内测版](#27-申请linux内测版)
28. [切换Linux正式版](#28-切换linux正式版)
29. [获取任务消息数量](#29-获取任务消息数量)
30. [获取文件内容行 (日志/进度)](#30-获取文件内容行-日志进度)
31. [更新面板 (旧, 可检查)](#31-更新面板-旧-可检查)
32. [获取面板更新状态或更新面板 (旧)](#32-获取面板更新状态或更新面板-旧)
33. [更新面板 (新, 可强制)](#33-更新面板-新-可强制)
34. [设置开发者模式](#34-设置开发者模式)
35. [获取开发者模式状态](#35-获取开发者模式状态)
36. [获取授权信息](#36-获取授权信息)
37. [获取实时任务列表 (通用)](#37-获取实时任务列表-通用)
38. [获取产品购买信息](#38-获取产品购买信息)
39. [获取当前系统兼容抵扣券列表](#39-获取当前系统兼容抵扣券列表)
40. [获取所有抵扣券列表](#40-获取所有抵扣券列表)
41. [使用抵扣券创建订单](#41-使用抵扣券创建订单)
42. [获取优惠券列表](#42-获取优惠券列表)
43. [获取临时优惠券](#43-获取临时优惠券)
44. [获取产品周期价格](#44-获取产品周期价格)
45. [获取产品购买验证码等信息](#45-获取产品购买验证码等信息)
46. [获取账户余额](#46-获取账户余额)
47. [获取产品最后一次购买时间](#47-获取产品最后一次购买时间)
48. [使用余额支付](#48-使用余额支付)
49. [解绑授权](#49-解绑授权)
50. [获取支付订单状态](#50-获取支付订单状态)
51. [获取推荐内容 (支付相关)](#51-获取推荐内容-支付相关)
52. [获取选择目录列表](#52-获取选择目录列表)
53. [创建文件/文件夹 (选择目录后)](#53-创建文件文件夹-选择目录后)
54. [获取插件配置页面HTML](#54-获取插件配置页面html)
55. [获取插件权限 (通用)](#55-获取插件权限-通用)
56. [获取菜单列表](#56-获取菜单列表)
57. [设置面板菜单栏目显示状态](#57-设置面板菜单栏目显示状态)
58. [查找指定插件信息](#58-查找指定插件信息)
59. [导入插件包信息](#59-导入插件包信息)
60. [导入ZIP插件包](#60-导入zip插件包)
61. [获取插件升级信息](#61-获取插件升级信息)
62. [获取并安装插件](#62-获取并安装插件)
63. [获取软件下载进度](#63-获取软件下载进度)
64. [获取面板安全告警配置](#64-获取面板安全告警配置)
65. [设置面板安全告警](#65-设置面板安全告警)
66. [设置消息通知配置](#66-设置消息通知配置)
67. [忽略版本更新提醒](#67-忽略版本更新提醒)
68. [获取消息函数 (测试用)](#68-获取消息函数-测试用)
69. [清空回收站 (旧)](#69-清空回收站-旧)
70. [获取回收站信息 (旧)](#70-获取回收站信息-旧)
71. [设置回收站状态 (旧)](#71-设置回收站状态-旧)
72. [获取特权软件列表 (插件列表)](#72-获取特权软件列表-插件列表)
73. [获取NPS问题集 (新)](#73-获取nps问题集-新)
74. [获取NPS问题集 (旧)](#74-获取nps问题集-旧)
75. [提交NPS问卷 (新)](#75-提交nps问卷-新)
76. [获取NPS问题标签](#76-获取nps问题标签)
77. [获取自定义模块](#77-获取自定义模块)
78. [添加自定义模块](#78-添加自定义模块)
79. [删除自定义模块](#79-删除自定义模块)
80. [设置自定义模块](#80-设置自定义模块)
81. [获取可领取的优惠券列表](#81-获取可领取的优惠券列表)
82. [设置优惠券提醒时间](#82-设置优惠券提醒时间)
83. [删除单个搜索历史](#83-删除单个搜索历史)
84. [清除所有搜索历史](#84-清除所有搜索历史)
85. [设置表格头部显示列](#85-设置表格头部显示列)
86. [获取表格头部显示列配置](#86-获取表格头部显示列配置)
87. [获取登录状态 (通过favicon)](#87-获取登录状态-通过favicon)
88. [保存文件内容 (通用)](#88-保存文件内容-通用)
89. [获取备忘录文件内容](#89-获取备忘录文件内容)
90. [获取文件内容 (通用)](#90-获取文件内容-通用)
91. [获取文件内容 (files/GetFileBody)](#91-获取文件内容-filesgetfilebody)
92. [获取消息详情 (消息盒子)](#92-获取消息详情-消息盒子)
93. [获取文件历史版本内容](#93-获取文件历史版本内容)
94. [读取文件历史内容](#94-读取文件历史内容)
95. [删除文件/文件夹 (通用)](#95-删除文件文件夹-通用)
96. [文件误报发送 (安全相关)](#96-文件误报发送-安全相关)
97. [首页安装JDK (旧)](#97-首页安装jdk-旧)
98. [安装JDK (新)](#98-安装jdk-新)
99. [创建文件目录 (通用)](#99-创建文件目录-通用)
100. [一键修复风险项](#100-一键修复风险项)
101. [设置忽略风险项](#101-设置忽略风险项)
102. [设置忽略漏洞项](#102-设置忽略漏洞项)
103. [检测漏洞](#103-检测漏洞)
104. [检测风险项](#104-检测风险项)
105. [设置告警配置 (通用)](#105-设置告警配置-通用)
106. [开关告警任务 (通用)](#106-开关告警任务-通用)
107. [获取系统告警下一步可设置项](#107-获取系统告警下一步可设置项)
108. [获取首页概览数据](#108-获取首页概览数据)
109. [获取首页概览模板数据](#109-获取首页概览模板数据)
110. [首页负载等弹出框数据信息](#110-首页负载等弹出框数据信息)
111. [获取告警通道状态](#111-获取告警通道状态)
112. [获取告警列表 (旧)](#112-获取告警列表-旧)
113. [获取消息通知配置](#113-获取消息通知配置)
114. [删除告警配置](#114-删除告警配置)
115. [删除告警任务](#115-删除告警任务)
116. [设置告警状态](#116-设置告警状态)
117. [获取云端服务器列表 (数据库相关)](#117-获取云端服务器列表-数据库相关)
118. [网站-获取扫描列表](#118-网站-获取扫描列表)
119. [网站-获取网站分类](#119-网站-获取网站分类)
120. [获取告警任务模板](#120-获取告警任务模板)
121. [解绑宝塔账号](#121-解绑宝塔账号)
122. [获取消息盒子任务进度](#122-获取消息盒子任务进度)
123. [安装消息模块](#123-安装消息模块)
124. [修改用户名](#124-修改用户名)
125. [获取软件状态 (公共)](#125-获取软件状态-公共)
126. [设置系统加固临时放行](#126-设置系统加固临时放行)
127. [修改密码](#127-修改密码)
128. [延用上一次密码](#128-延用上一次密码)
129. [获取证书列表](#129-获取证书列表)
130. [获取绑定告警账号列表](#130-获取绑定告警账号列表)
131. [获取新告警任务列表](#131-获取新告警任务列表)
132. [添加/编辑新告警任务](#132-添加编辑新告警任务)
133. [更新新告警任务状态](#133-更新新告警任务状态)
134. [设置短信告警状态](#134-设置短信告警状态)
135. [设置告警账号绑定状态](#135-设置告警账号绑定状态)
136. [单一账号测试告警](#136-单一账号测试告警)
137. [通用解绑告警账号](#137-通用解绑告警账号)
138. [解绑微信公众号](#138-解绑微信公众号)
139. [设置默认告警账号](#139-设置默认告警账号)
140. [获取绑定微信二维码](#140-获取绑定微信二维码)
141. [添加/编辑通用告警账号](#141-添加编辑通用告警账号)
142. [修改FTP服务端口](#142-修改ftp服务端口)
143. [数据库修复启动-获取错误类型](#143-数据库修复启动-获取错误类型)
144. [数据库修复启动-设置Innodb恢复级别](#144-数据库修复启动-设置innodb恢复级别)
145. [查找PHP版本 (网站相关)](#145-查找php版本-网站相关)
146. [获取PHPMYADMIN SSL配置](#146-获取phpmyadmin-ssl配置)
147. [设置PHPMYADMIN SSL配置](#147-设置phpmyadmin-ssl配置)
148. [修改PHPMYADMIN SSL端口](#148-修改phpmyadmin-ssl端口)
149. [设置PHPMYADMIN密码](#149-设置phpmyadmin密码)
150. [数据库容量修改请求-获取KEY](#150-数据库容量修改请求-获取key)
151. [DOCKER或DOCKER-COMPOSE安装](#151-docker或docker-compose安装)
152. [检查第三方登录权限](#152-检查第三方登录权限)
153. [第三方登录 (腾讯云)](#153-第三方登录-腾讯云)
154. [获取第三方授权登录URL](#154-获取第三方授权登录url)
155. [备份弹窗不再弹出](#155-备份弹窗不再弹出)

---

## API 列表

### 1. 获取公共配置信息
- **描述**: 获取公共配置信息
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/public/get_public_config' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 2. 获取全局配置信息
- **描述**: 获取全局配置信息
- **参数**: 无 (内部固定传递 `status: true`)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/get_config' \\
-H 'Content-Type: application/json' \\
-d '{
  "status": true
}'
```

### 3. 获取企业版配置信息
- **描述**: 获取企业版配置信息
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/public/get_exp_ltd' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 4. 获取系统资源信息
- **描述**: 获取系统资源信息
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/system/GetNetWork' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 5. 获取列表数据 (旧)
- **描述**: 获取列表数据，支持网站，数据库，FTP，计划任务，备份列表
- **参数**:
  - `p` (number, 可选): 页码
  - `table` (string, 可选): 数据来源 (e.g., sites, databases, ftp, crontab, backup)
  - `limit` (number, 可选): 每页数量
  - `search` (string | number, 可选): 搜索关键字
  - `result` (string, 可选): 搜索结果 (用途不明确)
  - `sid` (number | string, 可选): (用途不明确)
  - `tojs` (number | string, 可选): (用途不明确)
  - `type` (string, 可选): 类型 (用途不明确)
  - `list` (number | string, 可选): (用途不明确)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/data/getData' \\
-H 'Content-Type: application/json' \\
-d '{
  "p": 1,
  "table": "sites",
  "limit": 10,
  "search": "keyword"
}'
```

### 6. 获取列表数据 (新)
- **描述**: 获取列表数据，支持网站，数据库，FTP，计划任务，备份列表
- **参数**:
  - `p` (number, 可选): 页码
  - `table` (string, 可选): 数据来源
  - `limit` (number, 可选): 每页数量
  - `search` (string | number, 可选): 搜索关键字
  - `result` (string, 可选): 搜索结果
  - `sid` (number | string, 可选): (用途不明确)
  - `tojs` (number | string, 可选): (用途不明确)
  - `type` (string, 可选): 类型
  - `list` (number | string, 可选): (用途不明确)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/datalist/data/get_data_list' \\
-H 'Content-Type: application/json' \\
-d '{
  "p": 1,
  "table": "sites",
  "limit": 10,
  "search": "keyword"
}'
```

### 7. 已安装软件列表 (消息盒子)
- **描述**: 已安裝软件列表
- **参数**:
  - `page` (string): 页数
  - `pre_page` (string): 每页数量
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/msgbox/installed_msg_list' \\
-H 'Content-Type: application/json' \\
-d '{
  "page": "1",
  "pre_page": "10"
}'
```

### 8. 获取执行日志
- **描述**: 获取执行日志
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/files/GetExecLog' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 9. 获取任务列表 (通用)
- **描述**: 获取任务列表
- **参数**:
  - `status` (AnyObject): 任务状态 (具体类型和值未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/task/get_task_lists' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 10. 取消任务 (通用)
- **描述**: 取消任务
- **参数**:
  - `id` (AnyObject): 任务ID (具体类型未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/task/remove_task' \\
-H 'Content-Type: application/json' \\
-d '{
  "id": "your_task_id"
}'
```

### 11. 删除消息盒子任务
- **描述**: 删除消息盒子任务
- **参数**:
  - `id` (number): 任务ID
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/files/RemoveTask' \\
-H 'Content-Type: application/json' \\
-d '{
  "id": 123
}'
```

### 12. 设置备注
- **描述**: 设置备注
- **参数**:
  - `id` (number): 数据ID
  - `ps` (string): 备注
  - `table` (string): 数据来源
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/data/setPs' \\
-H 'Content-Type: application/json' \\
-d '{
  "id": 123,
  "ps": "your_remark",
  "table": "sites"
}'
```

### 13. 验证登录状态
- **描述**: 验证登录状态
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/checkLogin' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 14. 重启面板
- **描述**: 重启面板
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/system/ReWeb' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 15. 修复面板 (旧)
- **描述**: 修复面板
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/system/RepPanel' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 16. 修复面板 (新)
- **描述**: 修复面板
- **参数**:
  - `force` (AnyObject, 可选): 是否修复，不传递则表示只检查，传1表示修复 (具体类型未在JSDoc中指明, 可能是 `{ "force": 1 }`)
- **cURL (检查)**:
```bash
curl -X POST 'YOUR_BASE_URL/system/repair_panel' \\
-H 'Content-Type: application/json' \\
-d '{}'
```
- **cURL (修复)**:
```bash
curl -X POST 'YOUR_BASE_URL/system/repair_panel' \\
-H 'Content-Type: application/json' \\
-d '{
  "force": 1
}'
```

### 17. 获取更新日志
- **描述**: 更新日志
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/system/get_upgrade_log' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 18. 服务管理
- **描述**: 服务管理
- **参数**:
  - `name` (string): 服务器类型
  - `type` (string): 状态(stop停止, start启动, restart重启)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/system/ServiceAdmin' \\
-H 'Content-Type: application/json' \\
-d '{
  "name": "nginx",
  "type": "stop"
}'
```

### 19. 重启服务器
- **描述**: 重启服务器
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/system/RestartServer' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 20. 获取服务器状态
- **描述**: 获取服务器状态
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/system/GetSystemTotal' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 21. 获取测试版日志
- **描述**: 获取测试版日志
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/get_beta_logs' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 22. 绑定宝塔用户
- **描述**: 绑定BT用户
- **参数**:
  - `username` (string): 用户名
  - `password` (string): 密码
  - `code` (string | number, 可选): 验证码
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl/GetAuthToken' \\
-H 'Content-Type: application/json' \\
-d '{
  "username": "your_bt_username",
  "password": "your_bt_password",
  "code": "your_verification_code"
}'
```

### 23. 获取绑定验证码
- **描述**: 获取验证码
- **参数**:
  - `username` (string | number): 用户名
  - `token` (string | number): 账号验证Token
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl/GetBindCode' \\
-H 'Content-Type: application/json' \\
-d '{
  "username": "your_bt_username",
  "token": "your_auth_token"
}'
```

### 24. 获取面板历史版本
- **描述**: 获取面板历史版本
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/public/get_update_logs' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 25. 获取首页推荐软件列表
- **描述**: 获取首页推荐软件列表
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/GetSoftList' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 26. 安装首页推荐软件
- **描述**: 获取软件列表 (应为安装首页推荐软件)
- **参数**:
  - `sName` (string): 软件名称
  - `version` (string): 软件版本
  - `type` (string): 软件类型
  - `id` (number): 软件ID
  - `min_version` (string | number): 最低版本要求
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin/install_plugin' \\
-H 'Content-Type: application/json' \\
-d '{
  "sName": "nginx",
  "version": "1.20",
  "type": "webserver",
  "id": 1,
  "min_version": "1.0"
}'
```

### 27. 申请Linux内测版
- **描述**: 申请linux内测版
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/apple_beta' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 28. 切换Linux正式版
- **描述**: 切换linux正式版
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/to_not_beta' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 29. 获取任务消息数量
- **描述**: 获取任务消息数量
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/GetTaskCount' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 30. 获取文件内容行 (日志/进度)
- **描述**: 显示进度 (通常用于获取日志文件的最新行或任务进度)
- **参数**:
  - `num` (number, 可选): 行数
  - `filename` (string): 文件名
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/get_lines' \\
-H 'Content-Type: application/json' \\
-d '{
  "num": 100,
  "filename": "/www/server/panel/logs/task.log"
}'
```

### 31. 更新面板 (旧, 可检查)
- **描述**: 更新面板
- **参数**:
  - `check` (boolean, 可选): 请求是否检查更新 (true: 检查, false/不传: 不检查直接尝试更新，具体行为看后端)
  - `toUpdate` (string, 可选): 是否更新面板 (具体值和含义需参考后端实现)
- **cURL (检查更新)**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/UpdatePanel' \\
-H 'Content-Type: application/json' \\
-d '{
  "check": true
}'
```
- **cURL (尝试更新)**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/UpdatePanel' \\
-H 'Content-Type: application/json' \\
-d '{
  "toUpdate": "yes" 
}'
```

### 32. 获取面板更新状态或更新面板 (旧)
- **描述**: 获取面板更新状态或更新面板
- **参数**:
  - `check` (boolean, 可选): 请求是否检查更新
  - `toUpdate` (string, 可选): 是否更新面板
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/UpdatePanel' \\
-H 'Content-Type: application/json' \\
-d '{
  "check": true
}'
```

### 33. 更新面板 (新, 可强制)
- **描述**: 更新面板
- **参数**:
  - `force` (AnyObject, 可选): 是否强制更新，不传递则表示只检查，传1表示更新 (具体类型未指明，可能是 `{"force": 1}`)
- **cURL (检查)**:
```bash
curl -X POST 'YOUR_BASE_URL/system/upgrade_panel' \\
-H 'Content-Type: application/json' \\
-d '{}'
```
- **cURL (强制更新)**:
```bash
curl -X POST 'YOUR_BASE_URL/system/upgrade_panel' \\
-H 'Content-Type: application/json' \\
-d '{
  "force": 1
}'
```

### 34. 设置开发者模式
- **描述**: 设置开发者模式
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/set_debug' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 35. 获取开发者模式状态
- **描述**: 获取开发者模式
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/Get_debug' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 36. 获取授权信息
- **描述**: 获取授权信息
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/get_pd' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 37. 获取实时任务列表 (通用)
- **描述**: 获取实时任务列表
- **参数**:
  - `status` (number, 可选): 状态 (默认为 -3)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/get_task_lists' \\
-H 'Content-Type: application/json' \\
-d '{
  "status": -3
}'
```

### 38. 获取产品购买信息
- **描述**: 获取产品购买信息
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/auth/get_plugin_remarks' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 39. 获取当前系统兼容抵扣券列表
- **描述**: 获取当前系统兼容抵扣券列表
- **参数**:
  - `pid` (number): 产品ID
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/auth/get_voucher_plugin' \\
-H 'Content-Type: application/json' \\
-d '{
  "pid": 123
}'
```

### 40. 获取所有抵扣券列表
- **描述**: 获取所有抵扣券列表
- **参数**:
  - `pid` (number): 产品ID
  - `status` (number): 状态，0：未使用，1：已使用
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/auth/get_all_voucher_plugin' \\
-H 'Content-Type: application/json' \\
-d '{
  "pid": 123,
  "status": 0
}'
```

### 41. 使用抵扣券创建订单
- **描述**: 使用抵扣券抵扣 (应为创建订单)
- **参数**:
  - `pid` (number): 产品ID
  - `code` (string): 抵扣券码
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/auth/create_order_voucher_plugin' \\
-H 'Content-Type: application/json' \\
-d '{
  "pid": 123,
  "code": "YOUR_VOUCHER_CODE"
}'
```

### 42. 获取优惠券列表
- **描述**: 获取优惠券列表
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/auth/get_coupons' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 43. 获取临时优惠券
- **描述**: 获取临时优惠券
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/auth/get_apply_copon' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 44. 获取产品周期价格
- **描述**: 获取产品周期价格
- **参数**:
  - `pid` (number): 产品ID
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/auth/get_plugin_price' \\
-H 'Content-Type: application/json' \\
-d '{
  "pid": 123
}'
```

### 45. 获取产品购买验证码等信息
- **描述**: 获取产品验证码等信息
- **参数**:
  - `pid` (number): 产品ID
  - `cycle` (number): 周期
  - `source` (number): 来源
  - `num` (number): 台数
  - `coupon` (string, 可选): 优惠券码
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/auth/get_buy_code' \\
-H 'Content-Type: application/json' \\
-d '{
  "pid": 123,
  "cycle": 1,
  "source": 1,
  "num": 1,
  "coupon": "YOUR_COUPON_CODE"
}'
```

### 46. 获取账户余额
- **描述**: 获取余额
- **参数**:
  - `uid` (number): 用户ID
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/auth/get_credits' \\
-H 'Content-Type: application/json' \\
-d '{
  "uid": 456
}'
```

### 47. 获取产品最后一次购买时间
- **描述**: 获取最后一次购买时间
- **参数**:
  - `pid` (number): 产品ID
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/auth/get_last_paid_time' \\
-H 'Content-Type: application/json' \\
-d '{
  "pid": 123
}'
```

### 48. 使用余额支付
- **描述**: 使用余额支付
- **参数**:
  - `num` (number): 数量/台数
  - `cycle` (number): 周期
  - `uid` (number): 用户ID
  - `pid` (number): 产品ID
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/auth/create_with_credit_by_panel' \\
-H 'Content-Type: application/json' \\
-d '{
  "num": 1,
  "cycle": 1,
  "uid": 456,
  "pid": 123
}'
```

### 49. 解绑授权
- **描述**: 解绑授权
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/auth/unbind_authorization' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 50. 获取支付订单状态
- **描述**: 获取支付订单状态
- **参数**:
  - `wxoid` (number): 订单ID
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/auth/get_wx_order_status' \\
-H 'Content-Type: application/json' \\
-d '{
  "wxoid": 789
}'
```

### 51. 获取推荐内容 (支付相关)
- **描述**: 获取推荐内容 (通常与支付方式或活动相关)
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/get_pay_type' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 52. 获取选择目录列表
- **描述**: 获取选择目录列表
- **参数**:
  - `path` (string): 路径
  - `disk` (boolean): 展示磁盘
  - `search` (string, 可选): 搜索关键字
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/files/GetDir' \\
-H 'Content-Type: application/json' \\
-d '{
  "path": "/www",
  "disk": true,
  "search": "keyword"
}'
```

### 53. 创建文件/文件夹 (选择目录后)
- **描述**: 创建文件/文件夹
- **参数**:
  - `path` (string): 路径
  - `type` (string): 类型【File/Dir】
- **cURL (创建文件)**:
```bash
curl -X POST 'YOUR_BASE_URL/files/CreateFile' \\
-H 'Content-Type: application/json' \\
-d '{
  "path": "/www/newfile.txt"
}'
```
- **cURL (创建文件夹)**:
```bash
curl -X POST 'YOUR_BASE_URL/files/CreateDir' \\
-H 'Content-Type: application/json' \\
-d '{
  "path": "/www/newdir"
}'
```

### 54. 获取插件配置页面HTML
- **描述**: 获取插件配置页面
- **参数**:
  - `name` (string): 插件名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin/getConfigHtml' \\
-H 'Content-Type: application/json' \\
-d '{
  "name": "nginx"
}'
```

### 55. 获取插件权限 (通用)
- **描述**: 获取插件权限
- **参数**:
  - `name` (string): 插件名称 (通过URL参数传递)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=your_plugin_name' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 56. 获取菜单列表
- **描述**: 获取菜单列表
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/get_menu_list' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 57. 设置面板菜单栏目显示状态
- **描述**: 设置面板菜单栏目显示状态
- **参数**:
  - `hide_list` (Array<string> | string): 需要隐藏的菜单名 (具体是数组还是字符串需确认)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/set_hide_menu_list' \\
-H 'Content-Type: application/json' \\
-d '{
  "hide_list": ["menu_item_to_hide"]
}'
```

### 58. 查找指定插件信息
- **描述**: 查找指定插件信息
- **参数**:
  - `sName` (string): 插件名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin/get_soft_find' \\
-H 'Content-Type: application/json' \\
-d '{
  "sName": "nginx"
}'
```

### 59. 导入插件包信息
- **描述**: 获取插件版本信息 (应为导入插件包)
- **参数**:
  - `plugin_name` (string): 插件名称
  - `tmp_path` (string): 插件临时路径
  - `install_opt` (string): 安装选项
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin/input_package' \\
-H 'Content-Type: application/json' \\
-d '{
  "plugin_name": "your_plugin",
  "tmp_path": "/tmp/your_plugin.pkg",
  "install_opt": "some_option"
}'
```

### 60. 导入ZIP插件包
- **描述**: 获取插件版本信息 (应为导入ZIP插件包)
- **参数**:
  - `plugin_name` (string): 插件名称
  - `tmp_path` (string): 插件临时路径
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin/input_zip' \\
-H 'Content-Type: application/json' \\
-d '{
  "plugin_name": "your_plugin",
  "tmp_path": "/tmp/your_plugin.zip"
}'
```

### 61. 获取插件升级信息
- **描述**: 获取插件版本信息 (应为获取插件升级信息)
- **参数**:
  - `plugin_name` (string): 插件名称
  - `show` (number, 可选): (用途不明确)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin/get_plugin_upgrades' \\
-H 'Content-Type: application/json' \\
-d '{
  "plugin_name": "your_plugin",
  "show": 1
}'
```

### 62. 获取并安装插件
- **描述**: 获取插件版本信息 (应为获取并安装插件)
- **参数**:
  - `sName` (string): 插件名称
  - `version` (string): 版本
  - `min_version` (string): 最低版本要求
  - `type` (string, 可选): 类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin/install_plugin' \\
-H 'Content-Type: application/json' \\
-d '{
  "sName": "nginx",
  "version": "1.20",
  "min_version": "1.0",
  "type": "webserver"
}'
```

### 63. 获取软件下载进度
- **描述**: 获取软件下载进度
- **参数**:
  - `plugin_name` (string): 插件名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin/get_download_speed' \\
-H 'Content-Type: application/json' \\
-d '{
  "plugin_name": "your_plugin"
}'
```

### 64. 获取面板安全告警配置
- **描述**: 获取告警配置 (面板安全相关)
- **参数**:
  - `id` (string): ID
  - `name` (string): 名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/push/get_push_config' \\
-H 'Content-Type: application/json' \\
-d '{
  "id": "your_id",
  "name": "panel_security"
}'
```

### 65. 设置面板安全告警
- **描述**: 设置面板安全告警
- **参数**:
  - `name` (string): 传值site_push (或其他特定告警名称)
  - `id` (number): 时间戳 (或特定ID)
  - `data` (AnyObject): 表单数据 (具体字段结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/push/set_push_config' \\
-H 'Content-Type: application/json' \\
-d '{
  "name": "site_push",
  "id": 1678886400,
  "data": {}
}'
```

### 66. 设置消息通知配置
- **描述**: 设置更新提醒信息配置 (应为通用消息通知配置)
- **参数**:
  - `type` (string): 消息类型 (通过URL参数传递)
  - `data` (AnyObject): 配置数据 (具体字段依赖于type)
- **cURL (示例type='email')**:
```bash
curl -X POST 'YOUR_BASE_URL/config/set_msg_config&name=email' \\
-H 'Content-Type: application/json' \\
-d '{
  "qq_mail": "test@example.com",
  "qq_stmp_pwd": "password",
  "hosts": "smtp.example.com",
  "port": "465"
}'
```

### 67. 忽略版本更新提醒
- **描述**: 忽略更新提醒
- **参数**:
  - `version` (string): 版本号
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/ignore_version' \\
-H 'Content-Type: application/json' \\
-d '{
  "version": "8.0.0"
}'
```

### 68. 获取消息函数 (测试用)
- **描述**: 获取msgFun (可能用于测试消息发送功能)
- **参数**:
  - `module_name` (string): 模块名称
  - `fun_name` (string): 函数名称
  - `msg` (string, 可选): 消息内容
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/get_msg_fun' \\
-H 'Content-Type: application/json' \\
-d '{
  "module_name": "test_module",
  "fun_name": "test_function",
  "msg": "Hello World"
}'
```

### 69. 清空回收站 (旧)
- **描述**: 清空回收站
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/files/Close_Recycle_bin' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 70. 获取回收站信息 (旧)
- **描述**: 获取回收站信息
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/files/Get_Recycle_bin' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 71. 设置回收站状态 (旧)
- **描述**: 设置回收站状态
- **参数**:
  - `data` (AnyObject, 可选): (具体参数结构未在JSDoc中指明, 可能包含开启/关闭状态)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/files/Recycle_bin' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 72. 获取特权软件列表 (插件列表)
- **描述**: 获取插件信息 (应为获取特权/插件列表)
- **参数**:
  - `type` (number | string, 可选): 类型
  - `p` (number | string, 可选): 页码
  - `tojs` (number | string, 可选): (用途不明确)
  - `force` (number | string, 可选): 是否强制刷新
  - `query` (number | string, 可选): 查询关键字
  - `row` (number | string, 可选): 每页行数
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin/get_soft_list' \\
-H 'Content-Type: application/json' \\
-d '{
  "type": "all",
  "p": 1,
  "row": 10
}'
```

### 73. 获取NPS问题集 (新)
- **描述**: 获取Nps问题集
- **参数**:
  - `data` (AnyObject): (具体参数结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/get_nps_new' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 74. 获取NPS问题集 (旧)
- **描述**: 获取Nps问题集
- **参数**:
  - `productType` (any): 产品类型
  - `softwareName` (any): 软件名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/get_nps' \\
-H 'Content-Type: application/json' \\
-d '{
  "product_type": "your_product_type",
  "software_name": "your_software_name"
}'
```

### 75. 提交NPS问卷 (新)
- **描述**: 提交Nps问题集
- **参数**:
  - `data` (AnyObject): 问卷答案 (具体字段结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/write_nps_new' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 76. 获取NPS问题标签
- **描述**: 获取Nps问题标签
- **参数**:
  - `data` (AnyObject): (具体参数结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/get_nps_info' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 77. 获取自定义模块
- **描述**: 获取自定义模块
- **参数**:
  - `data` (AnyObject): (具体参数结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin/get_make_args' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 78. 添加自定义模块
- **描述**: 添加自定义模块
- **参数**:
  - `data` (AnyObject): 模块信息 (具体字段结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin/add_make_args' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 79. 删除自定义模块
- **描述**: 删除自定义模块
- **参数**:
  - `data` (AnyObject): 模块标识信息 (具体字段结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin/del_make_args' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 80. 设置自定义模块
- **描述**: 设置自定义模块
- **参数**:
  - `data` (AnyObject): 模块配置信息 (具体字段结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin/set_make_args' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 81. 获取可领取的优惠券列表
- **描述**: 获取可领取的优惠卷
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/auth/get_coupon_list' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 82. 设置优惠券提醒时间
- **描述**: 设置优惠卷提醒时间
- **参数**:
  - `data` (AnyObject): 时间或忽略设置 (具体字段结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/auth/ignore_coupon_time' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 83. 删除单个搜索历史
- **描述**: 删除单个搜索历史
- **参数**:
  - `name` (AnyObject): 搜索历史名称
  - `key` (AnyObject): 搜索历史类型
  - `val` (AnyObject): 搜索历史值
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/history/remove_search_history' \\
-H 'Content-Type: application/json' \\
-d '{
  "name": "your_history_name",
  "key": "your_history_key",
  "val": "your_history_value"
}'
```

### 84. 清除所有搜索历史
- **描述**: 清楚所有搜索历史
- **参数**:
  - `name` (AnyObject): 搜索历史名称
  - `key` (AnyObject): 搜索历史类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/history/clear_search_history' \\
-H 'Content-Type: application/json' \\
-d '{
  "name": "your_history_name",
  "key": "your_history_key"
}'
```

### 85. 设置表格头部显示列
- **描述**: 设置表格头部
- **参数**:
  - `data` (AnyObject): 表头配置 (具体字段结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/set_table_header' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 86. 获取表格头部显示列配置
- **描述**: 获取表格头部
- **参数**:
  - `data` (AnyObject): 表名或标识 (具体字段结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/get_table_header' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 87. 获取登录状态 (通过favicon)
- **描述**: 获取登录状态 (通过请求favicon.ico判断跳转)
- **参数**: 无
- **cURL**:
```bash
curl -X GET 'YOUR_BASE_URL/favicon.ico' 
```

### 88. 保存文件内容 (通用)
- **描述**: 保存文件内容
- **参数**:
  - `data` (AnyObject): 包含文件路径和内容的对象 (例如: `{"path":"/path/to/file", "data":"file content", "encoding":"utf-8"}`)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/files?action=SaveFileBody' \\
-H 'Content-Type: application/json' \\
-d '{
  "path": "/path/to/your/file.txt",
  "data": "File content here",
  "encoding": "utf-8"
}'
```

### 89. 获取备忘录文件内容
- **描述**: 获取备忘录文件内容
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config?action=get_memo_body' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 90. 获取文件内容 (通用)
- **描述**: 获取文件内容
- **参数**:
  - `path` (string): 文件路径
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/files?action=GetFileBody' \\
-H 'Content-Type: application/json' \\
-d '{
  "path": "/path/to/your/file.txt"
}'
```

### 91. 获取文件内容 (files/GetFileBody)
- **描述**: 获取文件内容
- **参数**:
  - `path` (string): 文件路径
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/files/GetFileBody' \\
-H 'Content-Type: application/json' \\
-d '{
  "path": "/path/to/your/file.txt"
}'
```

### 92. 获取消息详情 (消息盒子)
- **描述**: 获取消息详情
- **参数**:
  - `msg_id` (number): 消息ID
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/msgbox/get_msg_info' \\
-H 'Content-Type: application/json' \\
-d '{
  "msg_id": 123
}'
```

### 93. 获取文件历史版本内容
- **描述**: 获取文件属性 (应为获取文件历史版本内容)
- **参数**:
  - `filename` (string): 文件完整路径
  - `history` (string): 文件时间 (历史版本标识)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/files/re_history' \\
-H 'Content-Type: application/json' \\
-d '{
  "filename": "/path/to/file.txt",
  "history": "timestamp_or_version_id"
}'
```

### 94. 读取文件历史内容
- **描述**: (无具体描述，可能与获取文件历史内容相似)
- **参数**:
  - `data` (AnyObject): (具体参数结构未在JSDoc中指明, 可能包含filename和history)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/files/read_history' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 95. 删除文件/文件夹 (通用)
- **描述**: 删除文件/文件夹
- **参数**:
  - `path` (string): 删除文件/文件夹路径
  - `type` (string, 可选): 类型 (`dir` 或 `file`)
- **cURL (删除文件)**:
```bash
curl -X POST 'YOUR_BASE_URL/files/DeleteFile' \\
-H 'Content-Type: application/json' \\
-d '{
  "path": "/path/to/file.txt"
}'
```
- **cURL (删除文件夹)**:
```bash
curl -X POST 'YOUR_BASE_URL/files/DeleteDir' \\
-H 'Content-Type: application/json' \\
-d '{
  "path": "/path/to/directory"
}'
```

### 96. 文件误报发送 (安全相关)
- **描述**: 误报 (用于发送文件误报信息)
- **参数**:
  - `data` (AnyObject): 误报信息 (具体字段结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/files/send_baota' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 97. 首页安装JDK (旧)
- **描述**: 首页安装JDK
- **参数**:
  - `data` (any): JDK版本等信息 (具体结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/java/install_jdk_new' \\
-H 'Content-Type: application/json' \\
-d 'your_jdk_install_data'
```

### 98. 安装JDK (新)
- **描述**: 安装jdk
- **参数**:
  - `version` (string): JDK版本
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/java/project/install_jdk_new' \\
-H 'Content-Type: application/json' \\
-d '{
  "version": "11"
}'
```

### 99. 创建文件目录 (通用)
- **描述**: 创建文件目录
- **参数**:
  - `path` (string): 目录路径
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/files/CreateDir' \\
-H 'Content-Type: application/json' \\
-d '{
  "path": "/new/directory/path"
}'
```

### 100. 一键修复风险项
- **描述**: 一键修复风险项
- **参数**:
  - `data` (AnyObject): 风险项信息 (具体字段结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/security/set_security' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 101. 设置忽略风险项
- **描述**: 设置忽略项
- **参数**:
  - `m_name` (string): 风险项名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/warning/set_ignore' \\
-H 'Content-Type: application/json' \\
-d '{
  "m_name": "your_risk_item_name"
}'
```

### 102. 设置忽略漏洞项
- **描述**: 设置漏洞忽略项
- **参数**:
  - `cve_list` (string): 漏洞编号列表 (可能是逗号分隔的字符串或JSON数组字符串)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/warning/set_vuln_ignore' \\
-H 'Content-Type: application/json' \\
-d '{
  "cve_list": "CVE-2023-XXXX,CVE-2023-YYYY"
}'
```

### 103. 检测漏洞
- **描述**: 检测漏洞
- **参数**:
  - `cev_id` (string): 漏洞编号 (JSDoc参数名为 `cev_id`, 应为 `cve_id`)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/warning/check_cve' \\
-H 'Content-Type: application/json' \\
-d '{
  "cev_id": "CVE-2023-XXXX"
}'
```

### 104. 检测风险项
- **描述**: 检测风险
- **参数**:
  - `m_name` (string): 风险项名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/warning/check_find' \\
-H 'Content-Type: application/json' \\
-d '{
  "m_name": "your_risk_item_name"
}'
```

### 105. 设置告警配置 (通用)
- **描述**: 设置告警配置
- **参数**:
  - `data` (AnyObject): 告警配置信息 (具体字段结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/push/set_push_config' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 106. 开关告警任务 (通用)
- **描述**: 开关告警任务
- **参数**:
  - `task_id` (number): 任务id
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/push/task/change_task_conf' \\
-H 'Content-Type: application/json' \\
-d '{
  "task_id": 123
}'
```

### 107. 获取系统告警下一步可设置项
- **描述**: 获取系统告警下一步可设置项
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/push/system_push_next' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 108. 获取首页概览数据
- **描述**: 获取首页概览数据
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/overview/GetOverview' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 109. 获取首页概览模板数据
- **描述**: 获取首页概览模板数据
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/overview/GetTemplateOverview' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 110. 首页负载等弹出框数据信息
- **描述**: 首页负载等弹出框数据信息
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/monitor/process_management/specific_resource_load_type' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 111. 获取告警通道状态
- **描述**: 获取告警通道状态
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/get_msg_configs' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 112. 获取告警列表 (旧)
- **描述**: 获取告警列表
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/push/get_push_list' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 113. 获取消息通知配置
- **描述**: 获取告警配置 (应为获取消息通知配置)
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/get_msg_configs' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 114. 删除告警配置
- **描述**: 获取消息详情 (应为删除告警配置)
- **参数**:
  - `name` (string): 配置名称
  - `id` (string): 配置ID
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/push/del_push_config' \\
-H 'Content-Type: application/json' \\
-d '{
  "name": "your_config_name",
  "id": "your_config_id"
}'
```

### 115. 删除告警任务
- **描述**: 删除告警任务
- **参数**:
  - `task_id` (string | number): 任务id
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/push/task/remove_task_conf' \\
-H 'Content-Type: application/json' \\
-d '{
  "task_id": 123
}'
```

### 116. 设置告警状态
- **描述**: 设置告警状态
- **参数**:
  - `data` (AnyObject): 告警名称或相关配置 (具体结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/push/set_push_status' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 117. 获取云端服务器列表 (数据库相关)
- **描述**: 获取云端服务器
- **参数**:
  - `data` (AnyObject, 可选): (具体参数结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/GetCloudServer' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 118. 网站-获取扫描列表
- **描述**: 网站-获取扫描列表
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/scanning/list' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 119. 网站-获取网站分类
- **描述**: 网站-获取网站分类
- **参数**:
  - `data` (AnyObject, 可选): (具体参数结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/site/get_site_types' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 120. 获取告警任务模板
- **描述**: 获取消息详情 (应为获取告警任务模板)
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/push/task/get_task_template_list' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 121. 解绑宝塔账号
- **描述**: 解绑宝塔账号
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl/DelToken' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 122. 获取消息盒子任务进度
- **描述**: 获取消息盒子任务
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/files/GetTaskSpeed' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 123. 安装消息模块
- **描述**: 安装消息模块
- **参数**:
  - `name` (string): 消息模块名称 (通过URL参数传递)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/install_msg_module&name=your_module_name' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 124. 修改用户名
- **描述**: 修改用户名
- **参数**:
  - `username1` (number | string): 用户名
  - `username2` (number | string): 重复输入的用户名
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/setUsername' \\
-H 'Content-Type: application/json' \\
-d '{
  "username1": "new_username",
  "username2": "new_username"
}'
```

### 125. 获取软件状态 (公共)
- **描述**: 获取状态 (应为获取软件状态)
- **参数**:
  - `data` (AnyObject): (具体参数结构未在JSDoc中指明, 可能包含软件名等)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/panel/public/get_soft_status' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 126. 设置系统加固临时放行
- **描述**: 设置系统加固临时放行
- **参数**:
  - `time` (number, 可选): 当下时间戳
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/set_atuo_start_syssafe' \\
-H 'Content-Type: application/json' \\
-d '{
  "time": 1678886400
}'
```

### 127. 修改密码
- **描述**: 修改密码
- **参数**:
  - `data` (AnyObject): 包含旧密码和新密码 (具体字段如 `old_password`, `new_password`)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/setPassword' \\
-H 'Content-Type: application/json' \\
-d '{
  "old_password": "current_password",
  "new_password": "new_strong_password",
  "confirm_password": "new_strong_password"
}'
```

### 128. 延用上一次密码
- **描述**: 延用上一次密码
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/config/setlastPassword' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 129. 获取证书列表
- **描述**: 获取证书列表
- **参数**:
  - `data` (AnyObject, 可选): (具体参数结构未在JSDoc中指明, 可能包含筛选条件)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl/get_cert_list' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 130. 获取绑定告警账号列表
- **描述**: 获取绑定告警账号
- **参数**:
  - `refresh` (number): 是否刷新 (1: 刷新, 其他值或不传: 不刷新)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/push/msgconf/get_sender_list' \\
-H 'Content-Type: application/json' \\
-d '{
  "refresh": 1
}'
```

### 131. 获取新告警任务列表
- **描述**: 获取新告警列表
- **参数**:
  - `page` (number, 可选): 页码
  - `limit` (number, 可选): 条数
  - `status` (string, 可选): 状态
  - `keyword` (string, 可选): 关键词
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/push/task/get_task_list' \\
-H 'Content-Type: application/json' \\
-d '{
  "page": 1,
  "limit": 10,
  "status": "all",
  "keyword": "error"
}'
```

### 132. 添加/编辑新告警任务
- **描述**: 添加告警任务
- **参数**:
  - `task_id` (number | undefined, 可选): 任务id (编辑时传)
  - `template_id` (string): 任务模板id
  - `task_data` (string): 任务数据 (JSON数据), task_data部分按模板来填写，sender为发送通道列表，number_rule为次数控制，time_rule为时间控制
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/push/task/set_task_conf' \\
-H 'Content-Type: application/json' \\
-d '{
  "template_id": "your_template_id",
  "task_data": "{\\\"sender\\\":[],\\\"number_rule\\\":{},\\\"time_rule\\\":{}}"
}'
```

### 133. 更新新告警任务状态
- **描述**: (无具体描述，可能为更新告警任务的启用/禁用状态)
- **参数**:
  - `data` (AnyObject): (具体参数结构未在JSDoc中指明, 可能包含 task_id 和 status)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/push/task/update_task_status' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 134. 设置短信告警状态
- **描述**: 设置短信告警状态
- **参数**:
  - `sender_id` (string): 告警账号id
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/push/msgconf/change_sendr_used' \\
-H 'Content-Type: application/json' \\
-d '{
  "sender_id": "your_sender_id"
}'
```

### 135. 设置告警账号绑定状态
- **描述**: 设置告警账号绑定状态
- **参数**:
  - `sender_id` (string): 告警账号id
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/push/msgconf/change_sendr_used' \\
-H 'Content-Type: application/json' \\
-d '{
  "sender_id": "your_sender_id"
}'
```

### 136. 单一账号测试告警
- **描述**: 单一账号测试告警
- **参数**:
  - `sender_id` (string): 告警账号id
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/push/msgconf/test_send_msg' \\
-H 'Content-Type: application/json' \\
-d '{
  "sender_id": "your_sender_id"
}'
```

### 137. 通用解绑告警账号
- **描述**: 通用解绑告警账号（微信公众号除外）
- **参数**:
  - `sender_id` (string): 告警账号id
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/push/msgconf/remove_sender' \\
-H 'Content-Type: application/json' \\
-d '{
  "sender_id": "your_sender_id"
}'
```

### 138. 解绑微信公众号
- **描述**: 解绑微信公众号
- **参数**:
  - `sender_id` (string): 告警账号id
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/push/msgconf/unbind_wx_account' \\
-H 'Content-Type: application/json' \\
-d '{
  "sender_id": "your_sender_id"
}'
```

### 139. 设置默认告警账号
- **描述**: 设置默认告警账号
- **参数**:
  - `sender_id` (string): 告警账号id
  - `sender_type` (string): 告警账号类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/push/msgconf/set_default_sender' \\
-H 'Content-Type: application/json' \\
-d '{
  "sender_id": "your_sender_id",
  "sender_type": "email"
}'
```

### 140. 获取绑定微信二维码
- **描述**: 获取绑定微信二维码
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/push/msgconf/wx_account_auth' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 141. 添加/编辑通用告警账号
- **描述**: 添加、编辑告警账号（微信公众号、短信除外）
- **参数**:
  - `sender_id` (string, 可选): 编辑的告警账号id
  - `sender_type` (string): 告警账号类型 (weixin, mail, webhook, feishu, dingding)
  - `sender_data` (string, 可选): 告警账号数据 (JSON对象字符串)
- **cURL (添加)**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/push/msgconf/set_sender_conf' \\
-H 'Content-Type: application/json' \\
-d '{
  "sender_type": "mail",
  "sender_data": "{\\\"email\\\":\\\"test@example.com\\\"}"
}'
```
- **cURL (编辑)**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/push/msgconf/set_sender_conf' \\
-H 'Content-Type: application/json' \\
-d '{
  "sender_id": "existing_sender_id",
  "sender_type": "mail",
  "sender_data": "{\\\"email\\\":\\\"new_test@example.com\\\"}"
}'
```

### 142. 修改FTP服务端口
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

### 143. 数据库修复启动-获取错误类型
- **描述**: 数据库 修复启动 (获取错误类型)
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/GetStartErrType' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 144. 数据库修复启动-设置Innodb恢复级别
- **描述**: 数据库 修复启动 (设置Innodb恢复级别)
- **参数**:
  - `re_level` (number): 恢复级别
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/database/SetInnodbRecovery' \\
-H 'Content-Type: application/json' \\
-d '{
  "re_level": 1
}'
```

### 145. 查找PHP版本 (网站相关)
- **描述**: 查找php版本
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/site/GetPHPVersion' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 146. 获取PHPMYADMIN SSL配置
- **描述**: 获取phpmyadmin配置
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/get_phpmyadmin_ssl' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 147. 设置PHPMYADMIN SSL配置
- **描述**: 设置phpmyadmin配置
- **参数**:
  - `data` (AnyObject): SSL配置信息 (具体字段结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/set_phpmyadmin_ssl' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 148. 修改PHPMYADMIN SSL端口
- **描述**: 修改phpmyadmin端口 (应为SSL端口)
- **参数**:
  - `data` (AnyObject): 端口信息 (具体字段结构未在JSDoc中指明, 例如 `{"port": 888}`)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/change_phpmyadmin_ssl_port' \\
-H 'Content-Type: application/json' \\
-d '{
  "port": 887
}'
```

### 149. 设置PHPMYADMIN密码
- **描述**: 设置phpmyadmin密码
- **参数**:
  - `data` (AnyObject): 密码信息 (具体字段结构未在JSDoc中指明, 例如 `{"password": "new_password"}`)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ajax/setPHPMyAdmin' \\
-H 'Content-Type: application/json' \\
-d '{
  "password": "your_new_phpmyadmin_password"
}'
```

### 150. 数据库容量修改请求-获取KEY
- **描述**: 数据库容量修改请求 (获取Key)
- **参数**:
  - `data` (AnyObject): (具体参数结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/data/getKey' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 151. DOCKER或DOCKER-COMPOSE安装
- **描述**: docker或者docker-compose安装
- **参数**:
  - `type` (number): 安装模式 (0:官方镜像源安装（推荐）, 1:二进制安装)
  - `url` (string, 可选): 模式0时安装镜像源url
- **cURL (官方源)**:
```bash
curl -X POST 'YOUR_BASE_URL/btdocker/setup/install_docker_program' \\
-H 'Content-Type: application/json' \\
-d '{
  "type": 0,
  "url": "your_mirror_url_if_needed"
}'
```
- **cURL (二进制)**:
```bash
curl -X POST 'YOUR_BASE_URL/btdocker/setup/install_docker_program' \\
-H 'Content-Type: application/json' \\
-d '{
  "type": 1
}'
```

### 152. 检查第三方登录权限
- **描述**: 判断第三方登录权限
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl?action=GetCloudType' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 153. 第三方登录 (腾讯云)
- **描述**: 第三方登录
- **参数**:
  - `data` (any): 登录凭证或相关信息 (具体结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl?action=AuthLogin' \\
-H 'Content-Type: application/json' \\
-d 'your_tencent_login_data'
```

### 154. 获取第三方授权登录URL
- **描述**: 获取第三方登录链接
- **参数**:
  - `data` (any): (具体参数结构未在JSDoc中指明, 可能包含服务商标识)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssl?action=GetAuthUrl' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 155. 备份弹窗不再弹出
- **描述**: 备份弹窗不再弹出
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/backup_restore/com/del_migrate_tips' \\
-H 'Content-Type: application/json' \\
-d '{}'
```
