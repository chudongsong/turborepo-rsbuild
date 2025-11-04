# API 文档 (firewall.ts)

## 目录
1. [获取安全配置数据](#1-获取安全配置数据)
2. [是否启用ssh](#2-是否启用ssh)
3. [获取ssh登录信息](#3-获取ssh登录信息)
4. [获取ssh基础设置](#4-获取ssh基础设置)
5. [是否启用SSH密码登录](#5-是否启用ssh密码登录)
6. [更改ssh端口号](#6-更改ssh端口号)
7. [获取所有ssh登录日志列表数据](#7-获取所有ssh登录日志列表数据)
8. [ssh管理-ssh登录日志-解封ip](#8-ssh管理-ssh登录日志-解封ip)
9. [ssh管理-ssh登录日志-封禁ip](#9-ssh管理-ssh登录日志-封禁ip)
10. [获取入侵防御概览命令日志列表](#10-获取入侵防御概览命令日志列表)
11. [获取入侵防御信息](#11-获取入侵防御信息)
12. [删除SSH用户](#12-删除ssh用户)
13. [入侵防御概览防入侵状态+ssh用户开关](#13-入侵防御概览防入侵状态ssh用户开关)
14. [入侵防御概览日志状态+ssh日志开关](#14-入侵防御概览日志状态ssh日志开关)
15. [设置root密码](#15-设置root密码)
16. [获取入侵防御概览命令日志日期](#16-获取入侵防御概览命令日志日期)
17. [添加SSH用户](#17-添加ssh用户)
18. [开启SSH密钥登录](#18-开启ssh密钥登录)
19. [获取SSH登录告警](#19-获取ssh登录告警)
20. [获取告警日志](#20-获取告警日志)
21. [是否启用SSH告警](#21-是否启用ssh告警)
22. [开关告警任务](#22-开关告警任务)
23. [设置防护配置配置信息 (SSH Antivirus)](#23-设置防护配置配置信息-ssh-antivirus)
24. [获取防护配置配置信息 (SSH Antivirus)](#24-获取防护配置配置信息-ssh-antivirus)
25. [获取防暴破日志](#25-获取防暴破日志)
26. [获取IP白名单 (SSH)](#26-获取ip白名单-ssh)
27. [添加IP白名单 (SSH)](#27-添加ip白名单-ssh)
28. [删除IP白名单 (SSH)](#28-删除ip白名单-ssh)
29. [获取密钥](#29-获取密钥)
30. [关闭SSH密钥登录](#30-关闭ssh密钥登录)
31. [设置root登录](#31-设置root登录)
32. [入侵防御开关](#32-入侵防御开关)
33. [入侵防御进程白名单](#33-入侵防御进程白名单)
34. [入侵防御删除进程白名单](#34-入侵防御删除进程白名单)
35. [入侵防御添加进程白名单](#35-入侵防御添加进程白名单)
36. [入侵防御操作日志](#36-入侵防御操作日志)
37. [获取系统加固防护配置列表+状态](#37-获取系统加固防护配置列表状态)
38. [系统加固总开关](#38-系统加固总开关)
39. [设置系统加固防护状态](#39-设置系统加固防护状态)
40. [获取系统加固配置信息](#40-获取系统加固配置信息)
41. [删除保护文件/目录](#41-删除保护文件目录)
42. [添加保护文件/目录](#42-添加保护文件目录)
43. [获取封锁IP信息](#43-获取封锁ip信息)
44. [添加封锁IP](#44-添加封锁ip)
45. [解封IP (系统加固)](#45-解封ip-系统加固)
46. [获取监控概览](#46-获取监控概览)
47. [获取风险列表](#47-获取风险列表)
48. [获取站点违规词检测历史](#48-获取站点违规词检测历史)
49. [获取检测历史](#49-获取检测历史)
50. [风险详情](#50-风险详情)
51. [获取监控列表](#51-获取监控列表)
52. [删除监控](#52-删除监控)
53. [立即检测](#53-立即检测)
54. [停止检测监控](#54-停止检测监控)
55. [获取自定义词库](#55-获取自定义词库)
56. [清空自定义词库](#56-清空自定义词库)
57. [删除自定义词库](#57-删除自定义词库)
58. [导出自定义词库](#58-导出自定义词库)
59. [添加自定义词库](#59-添加自定义词库)
60. [获取网站列表 (计划任务相关)](#60-获取网站列表-计划任务相关)
61. [添加/编辑监控](#61-添加编辑监控)
62. [获取PHP网站安全通知](#62-获取php网站安全通知)
63. [获取PHP网站安全状态](#63-获取php网站安全状态)
64. [获取PHP告警日志](#64-获取php告警日志)
65. [获取PHP告警设置](#65-获取php告警设置)
66. [设置PHP告警设置](#66-设置php告警设置)
67. [获取PHP模块列表](#67-获取php模块列表)
68. [设置PHP防护状态](#68-设置php防护状态)
69. [获取网站IP/URL白名单 (PHP安全)](#69-获取网站ipurl白名单-php安全)
70. [清空白名单 (IP/URL)](#70-清空白名单-ipurl)
71. [删除IP白名单 (PHP安全)](#71-删除ip白名单-php安全)
72. [删除URL白名单 (PHP安全)](#72-删除url白名单-php安全)
73. [添加到URL白名单 (PHP安全)](#73-添加到url白名单-php安全)
74. [添加到IP白名单 (PHP安全)](#74-添加到ip白名单-php安全)
75. [从木马隔离箱中恢复](#75-从木马隔离箱中恢复)
76. [删除隔离箱文件](#76-删除隔离箱文件)
77. [获取木马隔离箱列表](#77-获取木马隔离箱列表)
78. [获取PHP网站列表](#78-获取php网站列表)
79. [删除当前网站PHP版本防护监视器](#79-删除当前网站php版本防护监视器)
80. [网站防护开关 (PHP安全)](#80-网站防护开关-php安全)
81. [获取网站日志 (PHP安全)](#81-获取网站日志-php安全)
82. [添加到URL白名单-详情 (PHP安全)](#82-添加到url白名单-详情-php安全)
83. [设置已处理 (PHP安全日志)](#83-设置已处理-php安全日志)
84. [设置网站文件监视器配置 (PHP安全)](#84-设置网站文件监视器配置-php安全)
85. [模拟攻击 (PHP安全)](#85-模拟攻击-php安全)
86. [设置PHP安全首页监控开关](#86-设置php安全首页监控开关)
87. [获取防火墙统计信息](#87-获取防火墙统计信息)
88. [获取防火墙开关状态](#88-获取防火墙开关状态)
89. [初始化面板防火墙状态](#89-初始化面板防火墙状态)
90. [获取网站日志信息 (防火墙)](#90-获取网站日志信息-防火墙)
91. [清空WEB日志](#91-清空web日志)
92. [是否启用ping](#92-是否启用ping)
93. [设置防火墙开关状态](#93-设置防火墙开关状态)
94. [获取所有的端口规则](#94-获取所有的端口规则)
95. [获取监听进程](#95-获取监听进程)
96. [编辑端口规则](#96-编辑端口规则)
97. [设置端口规则](#97-设置端口规则)
98. [防火墙通用导入规则](#98-防火墙通用导入规则)
99. [防火墙通用导出规则](#99-防火墙通用导出规则)
100. [获取所有的IP规则](#100-获取所有的ip规则)
101. [编辑IP规则](#101-编辑ip规则)
102. [设置IP规则](#102-设置ip规则)
103. [获取所有的端口转发规则](#103-获取所有的端口转发规则)
104. [设置端口转发规则](#104-设置端口转发规则)
105. [编辑端口转发规则](#105-编辑端口转发规则)
106. [获取地区规则列表数据](#106-获取地区规则列表数据)
107. [删除地区规则](#107-删除地区规则)
108. [获取地区数据](#108-获取地区数据)
109. [添加地区规则](#109-添加地区规则)
110. [修改地区规则](#110-修改地区规则)
111. [获取端口防扫描状态](#111-获取端口防扫描状态)
112. [设置端口防扫描状态](#112-设置端口防扫描状态)
113. [删除IP扫描 (防爆破)](#113-删除ip扫描-防爆破)
114. [删除扫描IP (端口防扫描)](#114-删除扫描ip-端口防扫描)
115. [获取端口防扫描日志](#115-获取端口防扫描日志)
116. [添加告警任务](#116-添加告警任务)
117. [获取安全检测统计](#117-获取安全检测统计)
118. [获取文件完整性检测-检测结果](#118-获取文件完整性检测-检测结果)
119. [文件完整性检测-立即检测](#119-文件完整性检测-立即检测)
120. [文件完整性检测-立即处理](#120-文件完整性检测-立即处理)
121. [获取文件完整性检测-监控目录](#121-获取文件完整性检测-监控目录)
122. [添加文件完整性检测-目录](#122-添加文件完整性检测-目录)
123. [删除文件完整性检测-目录](#123-删除文件完整性检测-目录)
124. [获取文件完整性检测-当前定时任务信息](#124-获取文件完整性检测-当前定时任务信息)
125. [设置文件完整性检测-定时任务信息](#125-设置文件完整性检测-定时任务信息)
126. [删除监控目录 (木马查杀)](#126-删除监控目录-木马查杀)
127. [停止/启动监控目录 (木马查杀)](#127-停止启动监控目录-木马查杀)
128. [修改监控目录备注 (木马查杀)](#128-修改监控目录备注-木马查杀)
129. [停止/开启木马查杀全局状态](#129-停止开启木马查杀全局状态)
130. [获取木马查杀全局状态](#130-获取木马查杀全局状态)
131. [获取木马查杀列表 (监控目录)](#131-获取木马查杀列表-监控目录)
132. [获取隔离文件数量 (木马查杀)](#132-获取隔离文件数量-木马查杀)
133. [添加监控目录 (木马查杀)](#133-添加监控目录-木马查杀)
134. [添加所有网站目录到木马查杀](#134-添加所有网站目录到木马查杀)
135. [获取隔离文件 (木马查杀)](#135-获取隔离文件-木马查杀)
136. [处理隔离文件 (木马查杀)](#136-处理隔离文件-木马查杀)
137. [获取白名单目录 (木马查杀)](#137-获取白名单目录-木马查杀)
138. [添加白名单目录 (木马查杀)](#138-添加白名单目录-木马查杀)
139. [删除白名单目录 (木马查杀)](#139-删除白名单目录-木马查杀)
140. [安全扫描 (漏洞扫描)](#140-安全扫描-漏洞扫描)
141. [获取漏洞扫描自动化扫描告警设置](#141-获取漏洞扫描自动化扫描告警设置)
142. [设置漏洞扫描自动化扫描告警](#142-设置漏洞扫描自动化扫描告警)
143. [获取SSH服务加固配置信息](#143-获取ssh服务加固配置信息)
144. [保存SSH服务加固配置信息](#144-保存ssh服务加固配置信息)
145. [获取异常进程监控白名单 (系统加固)](#145-获取异常进程监控白名单-系统加固)
146. [添加异常进程监控白名单 (系统加固)](#146-添加异常进程监控白名单-系统加固)
147. [删除异常进程监控白名单 (系统加固)](#147-删除异常进程监控白名单-系统加固)
148. [修复计划任务 (内容监控)](#148-修复计划任务-内容监控)
149. [获取恶意IP列表 (防火墙)](#149-获取恶意ip列表-防火墙)
150. [清空恶意IP (防火墙)](#150-清空恶意ip-防火墙)
151. [删除恶意IP (防火墙)](#151-删除恶意ip-防火墙)
152. [切换恶意IP状态 (防火墙)](#152-切换恶意ip状态-防火墙)
153. [获取恶意IP拦截状态 (防火墙)](#153-获取恶意ip拦截状态-防火墙)
154. [设置恶意IP封禁时间 (防火墙)](#154-设置恶意ip封禁时间-防火墙)
155. [获取扫描感知概览](#155-获取扫描感知概览)
156. [扫描感知开关切换](#156-扫描感知开关切换)
157. [导出扫描感知IP列表](#157-导出扫描感知ip列表)
158. [获取扫描感知详情](#158-获取扫描感知详情)
159. [保存扫描感知规则](#159-保存扫描感知规则)
160. [获取扫描感知实时日志](#160-获取扫描感知实时日志)
161. [获取网站防火墙封禁IP列表](#161-获取网站防火墙封禁ip列表)
162. [封禁IP (网站防火墙)](#162-封禁ip-网站防火墙)
163. [解封IP (网站防火墙)](#163-解封ip-网站防火墙)
164. [获取扫描感知操作日志](#164-获取扫描感知操作日志)
165. [移除SSH登录失败自动封禁计划任务](#165-移除ssh登录失败自动封禁计划任务)
166. [执行SSH登录失败IP封禁](#166-执行ssh登录失败ip封禁)
167. [添加SSH登录失败自动封禁计划任务](#167-添加ssh登录失败自动封禁计划任务)
168. [清理防火墙缓存](#168-清理防火墙缓存)
169. [清理SSH登录日志](#169-清理ssh登录日志)

---

## API 列表

### 1. 获取安全配置数据
- **描述**: 获取安全配置数据
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/ssh/GetSshInfo' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 2. 是否启用ssh
- **描述**: 是否启用ssh
- **参数**:
  - `status` (string, 可选): 是否启用 '0'禁用 '1' 启用
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/firewall/SetSshStatus' \\
-H 'Content-Type: application/json' \\
-d '{
  "status": "1"
}'
```

### 3. 获取ssh登录信息
- **描述**: 获取ssh登录信息
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/ssh/com/get_ssh_intrusion' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 4. 获取ssh基础设置
- **描述**: 获取ssh基础设置
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssh_security/get_config' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 5. 是否启用SSH密码登录
- **描述**: 是否启用SSH密码登录
- **参数**:
  - `status` (boolean): 是否启用
- **cURL (启用)**:
```bash
curl -X POST 'YOUR_BASE_URL/ssh_security/set_password' \\
-H 'Content-Type: application/json' \\
-d '{}'
```
- **cURL (禁用)**:
```bash
curl -X POST 'YOUR_BASE_URL/ssh_security/stop_password' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 6. 更改ssh端口号
- **描述**: 更改ssh端口号
- **参数**:
  - `port` (number): 端口号
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/firewall/SetSshPort' \\
-H 'Content-Type: application/json' \\
-d '{
  "port": 22
}'
```

### 7. 获取所有ssh登录日志列表数据
- **描述**: 获取所有ssh登录日志列表数据
- **参数**:
  - `data` (string): JSON字符串, 内容例如: `{"p":1,"search":"keyword","select":"type"}`
    - `p` (number): 页码
    - `search` (string): 搜索内容
    - `select` (string): 搜索类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/ssh/com/get_ssh_list' \\
-H 'Content-Type: application/json' \\
-d '{
  "data": "{\\"p\\":1,\\"search\\":\\"your_search_value\\",\\"select\\":\\"your_select_value\\"}"
}'
```

### 8. ssh管理-ssh登录日志-解封ip
- **描述**: ssh管理-ssh登录日志-解封ip
- **参数**:
  - `address` (string): ip地址
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/syslog/remove_ip_rules' \\
-H 'Content-Type: application/json' \\
-d '{
  "data": "{\\"address\\":\\"your_address_value\\"}"
}'
```

### 9. ssh管理-ssh登录日志-封禁ip
- **描述**: ssh管理-ssh登录日志-封禁ip
- **参数**:
  - `address` (string): ip地址
  - `types` (string): 类型
  - `brief` (string): 描述
  - `domain` (string): 域名
  - `choose` (string): 选择
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/syslog/create_ip_rules' \\
-H 'Content-Type: application/json' \\
-d '{
  "data": "{\\"address\\":\\"your_address_value\\",\\"types\\":\\"your_types_value\\",\\"brief\\":\\"your_brief_value\\",\\"domain\\":\\"your_domain_value\\",\\"choose\\":\\"your_choose_value\\"}"
}'
```

### 10. 获取入侵防御概览命令日志列表
- **描述**: 获取入侵防御概览命令日志列表
- **参数**:
  - `p` (number): 页码
  - `num` (number): 每页数量
  - `day` (string): 日期
  - `user` (string): 用户
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=bt_security&s=get_user_log' \\
-H 'Content-Type: application/json' \\
-d '{
  "p": 1,
  "num": 10,
  "day": "your_day_value",
  "user": "your_user_value"
}'
```

### 11. 获取入侵防御信息
- **描述**: 获取入侵防御信息
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=bt_security&s=get_total_all' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 12. 删除SSH用户
- **描述**: 删除SSH用户
- **参数**:
  - `username` (string): 用户名
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssh_security/del_sys_user' \\
-H 'Content-Type: application/json' \\
-d '{
  "username": "your_username_value"
}'
```

### 13. 入侵防御概览防入侵状态+ssh用户开关
- **描述**: 入侵防御概览防入侵状态+ssh用户开关
- **参数**:
  - `status` (boolean): 是否开启
  - `user` (string): 用户名
- **cURL (开启)**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=bt_security&s=start_user_security' \\
-H 'Content-Type: application/json' \\
-d '{
  "user": "your_user_value"
}'
```
- **cURL (关闭)**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=bt_security&s=stop_user_security' \\
-H 'Content-Type: application/json' \\
-d '{
  "user": "your_user_value"
}'
```

### 14. 入侵防御概览日志状态+ssh日志开关
- **描述**: 入侵防御概览日志状态+ssh日志开关
- **参数**:
  - `status` (boolean): 是否开启
  - `uid` (string): 用户id
- **cURL (开启)**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=bt_security&s=start_user_log' \\
-H 'Content-Type: application/json' \\
-d '{
  "uid": "your_uid_value"
}'
```
- **cURL (关闭)**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=bt_security&s=stop_user_log' \\
-H 'Content-Type: application/json' \\
-d '{
  "uid": "your_uid_value"
}'
```

### 15. 设置root密码
- **描述**: 设置root密码
- **参数**:
  - `username` (string): 用户名
  - `password` (string): 密码
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssh_security/set_root_password' \\
-H 'Content-Type: application/json' \\
-d '{
  "username": "your_username_value",
  "password": "your_password_value"
}'
```

### 16. 获取入侵防御概览命令日志日期
- **描述**: 获取入侵防御概览命令日志日期
- **参数**:
  - `user` (string): 用户名
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=bt_security&s=get_logs_list' \\
-H 'Content-Type: application/json' \\
-d '{
  "user": "your_user_value"
}'
```

### 17. 添加SSH用户
- **描述**: 添加SSH用户 (JSDoc描述为"获取防护配置配置信息", 根据函数名和路径判断为"添加SSH用户")
- **参数**:
  - `username` (string): 用户名
  - `password` (string): 密码
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssh_security/add_sys_user' \\
-H 'Content-Type: application/json' \\
-d '{
  "username": "your_username_value",
  "password": "your_password_value"
}'
```

### 18. 开启SSH密钥登录
- **描述**: 开启SSH密钥登录
- **参数**:
  - `type` (string): 类型
  - `ssh` (string): ssh密钥
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssh_security/set_sshkey' \\
-H 'Content-Type: application/json' \\
-d '{
  "type": "your_type_value",
  "ssh": "your_ssh_value"
}'
```

### 19. 获取SSH登录告警
- **描述**: 获取SSH登录告警
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssh_security/get_login_send' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 20. 获取告警日志
- **描述**: 获取告警日志
- **参数**:
  - `p` (number): 页码
  - `p_size` (number): 每页数量
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssh_security/get_logs' \\
-H 'Content-Type: application/json' \\
-d '{
  "p": 1,
  "p_size": 10
}'
```

### 21. 是否启用SSH告警
- **描述**: 是否启用SSH告警
- **参数**:
  - `status` (boolean): 是否启用
  - `type` (string): 类型
- **cURL (启用)**:
```bash
curl -X POST 'YOUR_BASE_URL/ssh_security/set_login_send' \\
-H 'Content-Type: application/json' \\
-d '{
  "type": "your_type_value"
}'
```
- **cURL (禁用)**:
```bash
curl -X POST 'YOUR_BASE_URL/ssh_security/clear_login_send' \\
-H 'Content-Type: application/json' \\
-d '{
  "type": "your_type_value"
}'
```

### 22. 开关告警任务
- **描述**: 开关告警任务
- **参数**:
  - `task_id` (number | string): 任务id
  - `status` (number | string): 状态
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/push/task/change_task_conf' \\
-H 'Content-Type: application/json' \\
-d '{
  "task_id": "your_task_id_value",
  "status": "your_status_value"
}'
```

### 23. 设置防护配置配置信息 (SSH Antivirus)
- **描述**: 设置防护配置配置信息
- **参数**:
  - `act` (boolean, 可选): 状态
  - `maxretry` (number, 可选): 最大尝试次数
  - `findtime` (number, 可选): 查找时间
  - `bantime` (number, 可选): 封禁时间
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssh_security/set_anti_conf' \\
-H 'Content-Type: application/json' \\
-d '{
  "act": true,
  "maxretry": 5,
  "findtime": 60,
  "bantime": 3600
}'
```

### 24. 获取防护配置配置信息 (SSH Antivirus)
- **描述**: 获取防护配置配置信息
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssh_security/get_anti_conf' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 25. 获取防暴破日志
- **描述**: 获取防暴破日志
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssh_security/get_sshd_anti_logs' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 26. 获取IP白名单 (SSH)
- **描述**: 获取IP白名单
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssh_security/return_ip' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 27. 添加IP白名单 (SSH)
- **描述**: 添加IP白名单
- **参数**:
  - `ip` (string): ip地址
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssh_security/add_return_ip' \\
-H 'Content-Type: application/json' \\
-d '{
  "ip": "your_ip_value"
}'
```

### 28. 删除IP白名单 (SSH)
- **描述**: 删除IP白名单
- **参数**:
  - `ip` (string): ip地址
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssh_security/del_return_ip' \\
-H 'Content-Type: application/json' \\
-d '{
  "ip": "your_ip_value"
}'
```

### 29. 获取密钥
- **描述**: 获取密钥
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssh_security/get_key' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 30. 关闭SSH密钥登录
- **描述**: 关闭SSH密钥登录
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssh_security/stop_key' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 31. 设置root登录
- **描述**: 设置root登录
- **参数**:
  - `p_type` (string): 类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssh_security/set_root' \\
-H 'Content-Type: application/json' \\
-d '{
  "p_type": "your_p_type_value"
}'
```

### 32. 入侵防御开关
- **描述**: 入侵防御开关
- **参数**:
  - `status` (boolean): 是否开启
- **cURL (开启)**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=bt_security&s=start_bt_security' \\
-H 'Content-Type: application/json' \\
-d '{}'
```
- **cURL (关闭)**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=bt_security&s=stop_bt_security' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 33. 入侵防御进程白名单
- **描述**: 入侵防御进程白名单
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=bt_security&s=porcess_set_up_log' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 34. 入侵防御删除进程白名单
- **描述**: 入侵防御删除进程白名单
- **参数**:
  - `cmd` (string): 命令
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=bt_security&s=del_porcess_log' \\
-H 'Content-Type: application/json' \\
-d '{
  "cmd": "your_cmd_value"
}'
```

### 35. 入侵防御添加进程白名单
- **描述**: 入侵防御添加进程白名单
- **参数**:
  - `cmd` (string): 命令
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=bt_security&s=add_porcess_log' \\
-H 'Content-Type: application/json' \\
-d '{
  "cmd": "your_cmd_value"
}'
```

### 36. 入侵防御操作日志
- **描述**: 入侵防御操作日志
- **参数**:
  - `p` (number): 页码
  - `limit` (number): 每页数量
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=bt_security&s=get_log' \\
-H 'Content-Type: application/json' \\
-d '{
  "p": 1,
  "limit": 10
}'
```

### 37. 获取系统加固防护配置列表+状态
- **描述**: 获取系统加固防护配置列表+状态
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?name=syssafe&action=a&s=get_safe_status' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 38. 系统加固总开关
- **描述**: 系统加固总开关
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?name=syssafe&action=a&s=set_open' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 39. 设置系统加固防护状态
- **描述**: 设置系统加固防护状态 (JSDoc描述为"获取防护配置配置信息", 根据函数名和路径判断为此功能)
- **参数**:
  - `s_key` (string): 配置项key
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?name=syssafe&action=a&s=set_safe_status' \\
-H 'Content-Type: application/json' \\
-d '{
  "s_key": "your_s_key_value"
}'
```

### 40. 获取系统加固配置信息
- **描述**: 获取系统加固配置信息 (JSDoc描述为"获取防护配置配置信息", 根据函数名和路径判断为此功能)
- **参数**:
  - `s_key` (string): 配置项key
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?name=syssafe&action=a&s=get_safe_config' \\
-H 'Content-Type: application/json' \\
-d '{
  "s_key": "your_s_key_value"
}'
```

### 41. 删除保护文件/目录
- **描述**: 删除保护文件/目录
- **参数**:
  - `s_key` (string): s_key
  - `path` (string): path
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?name=syssafe&action=a&s=remove_safe_path' \\
-H 'Content-Type: application/json' \\
-d '{
  "s_key": "your_s_key_value",
  "path": "your_path_value"
}'
```

### 42. 添加保护文件/目录
- **描述**: 添加保护文件/目录
- **参数**:
  - `s_key` (string): s_key
  - `d_mode` (string): d_mode
  - `chattr` (string): chattr
  - `path` (string): path
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?name=syssafe&action=a&s=add_safe_path' \\
-H 'Content-Type: application/json' \\
-d '{
  "s_key": "your_s_key_value",
  "d_mode": "your_d_mode_value",
  "chattr": "your_chattr_value",
  "path": "your_path_value"
}'
```

### 43. 获取封锁IP信息
- **描述**: 获取封锁IP信息
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?name=syssafe&action=a&s=get_ssh_limit_info' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 44. 添加封锁IP
- **描述**: 添加封锁IP
- **参数**:
  - `ip` (string): IP地址
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?name=syssafe&action=a&s=add_ssh_limit' \\
-H 'Content-Type: application/json' \\
-d '{
  "ip": "your_ip_value"
}'
```

### 45. 解封IP (系统加固)
- **描述**: 解封IP
- **参数**:
  - `ip` (string): IP地址
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?name=syssafe&action=a&s=remove_ssh_limit' \\
-H 'Content-Type: application/json' \\
-d '{
  "ip": "your_ip_value"
}'
```

### 46. 获取监控概览
- **描述**: 获取监控概览
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/content/get_content_monitor_overview' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 47. 获取风险列表
- **描述**: 获取风险列表
- **参数**:
  - `limit` (number): 每页数量
  - `p` (number): 页码
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/content/get_risk_list' \\
-H 'Content-Type: application/json' \\
-d '{
  "limit": 10,
  "p": 1
}'
```

### 48. 获取站点违规词检测历史
- **描述**: 获取站点违规词检测历史
- **参数**:
  - `site_name` (string): 站点名称
  - `p` (number): 页码
  - `limit` (number): 每页数量
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/content/get_single_site_risk' \\
-H 'Content-Type: application/json' \\
-d '{
  "site_name": "your_site_name_value",
  "p": 1,
  "limit": 10
}'
```

### 49. 获取检测历史
- **描述**: 获取检测历史
- **参数**:
  - `limit` (number): 每页数量
  - `p` (number): 页码
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/content/get_risk' \\
-H 'Content-Type: application/json' \\
-d '{
  "limit": 10,
  "p": 1
}'
```

### 50. 风险详情
- **描述**: 风险详情
- **参数**:
  - `testing_id` (number): 检测ID
  - `limit` (number): 每页数量
  - `p` (number): 页码
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/content/get_risk_info' \\
-H 'Content-Type: application/json' \\
-d '{
  "testing_id": 123,
  "limit": 10,
  "p": 1
}'
```

### 51. 获取监控列表
- **描述**: 获取监控列表
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/content/get_content_monitor_list' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 52. 删除监控
- **描述**: 删除监控
- **参数**:
  - `id` (number): 监控id
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/content/del_content_monitor_info' \\
-H 'Content-Type: application/json' \\
-d '{
  "id": 123
}'
```

### 53. 立即检测
- **描述**: 立即检测
- **参数**:
  - `id` (number): 监控id
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/content/scanning' \\
-H 'Content-Type: application/json' \\
-d '{
  "data": "{\\"id\\":123}"
}'
```

### 54. 停止检测监控
- **描述**: 检测监控 (应为停止检测监控)
- **参数**:
  - `id` (number): 监控id
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/content/kill_scanning' \\
-H 'Content-Type: application/json' \\
-d '{
  "data": "{\\"id\\":123}"
}'
```

### 55. 获取自定义词库
- **描述**: 自定义词库
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/content/get_thesaurus' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 56. 清空自定义词库
- **描述**: 清空自定义词库
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/content/clear_thesaurus' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 57. 删除自定义词库
- **描述**: 删除自定义词库
- **参数**:
  - `key` (string): 关键词
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/content/del_thesaurus' \\
-H 'Content-Type: application/json' \\
-d '{
  "key": "your_key_value"
}'
```

### 58. 导出自定义词库
- **描述**: 导出自定义词库
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/content/out_thesaurus' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 59. 添加自定义词库
- **描述**: 添加自定义词库
- **参数**:
  - `key` (string): 关键词
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/content/add_thesaurus' \\
-H 'Content-Type: application/json' \\
-d '{
  "data": "{\\"key\\":\\"your_key_value\\"}"
}'
```

### 60. 获取网站列表 (计划任务相关)
- **描述**: 获取网站列表
- **参数**:
  - `type` (string): 类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/crontab/GetDataList' \\
-H 'Content-Type: application/json' \\
-d '{
  "type": "your_type_value"
}'
```

### 61. 添加/编辑监控
- **描述**: 添加/编辑监控
- **参数**:
  - `status` (boolean): 操作类型 (false: 添加, true: 编辑)
  - `data` (AnyObject): 监控信息 (具体字段未在JSDoc中指明)
- **cURL (添加)**:
```bash
curl -X POST 'YOUR_BASE_URL/project/content/add_content_monitor_info' \\
-H 'Content-Type: application/json' \\
-d '{
  "data": "{}"
}'
```
- **cURL (编辑)**:
```bash
curl -X POST 'YOUR_BASE_URL/project/content/set_content_monitor_info' \\
-H 'Content-Type: application/json' \\
-d '{
  "data": "{}"
}'
```

### 62. 获取PHP网站安全通知
- **描述**: 获取PHP网站安全首页列表 (应为获取通知)
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=security_notice&s=get_notice' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 63. 获取PHP网站安全状态
- **描述**: 获取PHP网站安全首页列表 (应为获取状态)
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=security_notice&s=get_status' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 64. 获取PHP告警日志
- **描述**: 获取PHP告警信息
- **参数**:
  - `p` (number): 页码
  - `rows` (number): 每页数量 (JSDoc为rows，对应代码参数为limit)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=security_notice&s=get_send_logs' \\
-H 'Content-Type: application/json' \\
-d '{
  "p": 1,
  "rows": 10
}'
```

### 65. 获取PHP告警设置
- **描述**: 获取PHP告警设置
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=security_notice&s=get_send_config' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 66. 设置PHP告警设置
- **描述**: 设置PHP告警设置
- **参数**:
  - `type` (string): 类型
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=security_notice&s=set_send' \\
-H 'Content-Type: application/json' \\
-d '{
  "type": "your_type_value"
}'
```

### 67. 获取PHP模块列表
- **描述**: PHP模块
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=security_notice&s=get_index' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 68. 设置PHP防护状态
- **描述**: 设置PHP防护状态
- **参数**:
  - `php_version` (string): PHP版本
  - `enable` (number): 是否开启
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=security_notice&s=set_php_status' \\
-H 'Content-Type: application/json' \\
-d '{
  "php_version": "your_php_version_value",
  "enable": 1
}'
```

### 69. 获取网站IP/URL白名单 (PHP安全)
- **描述**: 网站ip/url白名单
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=security_notice&s=get_overall_info' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 70. 清空白名单 (IP/URL)
- **描述**: 清空白名单【ip/url】
- **参数**:
  - `type` (string): 类型 ip/url
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=security_notice&s=empty_info' \\
-H 'Content-Type: application/json' \\
-d '{
  "type": "ip"
}'
```

### 71. 删除IP白名单 (PHP安全)
- **描述**: 删除IP白名单
- **参数**:
  - `index` (number): 索引
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=security_notice&s=remove_ip_white' \\
-H 'Content-Type: application/json' \\
-d '{
  "index": 0
}'
```

### 72. 删除URL白名单 (PHP安全)
- **描述**: 删除url白名单
- **参数**:
  - `index` (number): 索引
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=security_notice&s=remove_url_white' \\
-H 'Content-Type: application/json' \\
-d '{
  "index": 0
}'
```

### 73. 添加到URL白名单 (PHP安全)
- **描述**: 添加到url白名单
- **参数**:
  - `url_rule` (string): url规则
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=security_notice&s=add_url_white' \\
-H 'Content-Type: application/json' \\
-d '{
  "url_rule": "your_url_rule_value"
}'
```

### 74. 添加到IP白名单 (PHP安全)
- **描述**: 添加到ip白名单
- **参数**:
  - `start_ip` (string): 开始ip
  - `end_ip` (string): 结束ip
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=security_notice&s=add_ip_white' \\
-H 'Content-Type: application/json' \\
-d '{
  "start_ip": "your_start_ip_value",
  "end_ip": "your_end_ip_value"
}'
```

### 75. 从木马隔离箱中恢复
- **描述**: 从木马隔离箱中恢复
- **参数**:
  - `path` (string): 路径
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=security_notice&s=Re_Recycle_bin' \\
-H 'Content-Type: application/json' \\
-d '{
  "path": "your_path_value"
}'
```

### 76. 删除隔离箱文件
- **描述**: 删除隔离箱文件
- **参数**:
  - `path` (string): 文件路径
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=security_notice&s=Del_Recycle_bin' \\
-H 'Content-Type: application/json' \\
-d '{
  "path": "your_path_value"
}'
```

### 77. 获取木马隔离箱列表
- **描述**: 木马隔离箱
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=security_notice&s=Get_Recycle_bin' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 78. 获取PHP网站列表
- **描述**: 获取php网站列表
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=security_notice&s=get_sites' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 79. 删除当前网站PHP版本防护监视器
- **描述**: 删除当前网站php版本防护监视器-php
- **参数**:
  - `data` (any): (具体参数结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=security_notice&s=del_site_config' \\
-H 'Content-Type: application/json' \\
-d 'your_data_payload'
```

### 80. 网站防护开关 (PHP安全)
- **描述**: 网站防护开关
- **参数**:
  - `status` (boolean): 是否开启
  - `siteName` (string): 站点名称
- **cURL (开启)**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=security_notice&s=start_site' \\
-H 'Content-Type: application/json' \\
-d '{
  "siteName": "your_siteName_value"
}'
```
- **cURL (关闭)**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=security_notice&s=stop_site' \\
-H 'Content-Type: application/json' \\
-d '{
  "siteName": "your_siteName_value"
}'
```

### 81. 获取网站日志 (PHP安全)
- **描述**: 网站日志
- **参数**:
  - `p` (number): 页码
  - `limit` (number): 每页数量
  - `siteName` (string): 站点名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=security_notice&s=get_domain_logs' \\
-H 'Content-Type: application/json' \\
-d '{
  "p": 1,
  "limit": 10,
  "siteName": "your_siteName_value"
}'
```

### 82. 添加到URL白名单-详情 (PHP安全)
- **描述**: 添加到url白名单-详情
- **参数**:
  - `url_rule` (string): url规则
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=security_notice&s=wubao_url_white' \\
-H 'Content-Type: application/json' \\
-d '{
  "url_rule": "your_url_rule_value"
}'
```

### 83. 设置已处理 (PHP安全日志)
- **描述**: 设置已处理
- **参数**:
  - `operation` (number): 操作
  - `id` (number): id
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=security_notice&s=set_ignore' \\
-H 'Content-Type: application/json' \\
-d '{
  "operation": 1,
  "id": 123
}'
```

### 84. 设置网站文件监视器配置 (PHP安全)
- **描述**: 设置网站监视器配置
- **参数**:
  - `status` (boolean): 操作类型 (false: 添加, true: 编辑)
  - `domain` (string): 域名
  - `path` (string): 路径
  - `type` (string): 类型
  - `actions` (string): 动作
- **cURL (添加)**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=security_notice&s=add_site_config' \\
-H 'Content-Type: application/json' \\
-d '{
  "domain": "your_domain_value",
  "path": "your_path_value",
  "type": "your_type_value",
  "actions": "your_actions_value"
}'
```
- **cURL (编辑)**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=security_notice&s=edit_site_config' \\
-H 'Content-Type: application/json' \\
-d '{
  "domain": "your_domain_value",
  "path": "your_path_value",
  "type": "your_type_value",
  "actions": "your_actions_value"
}'
```

### 85. 模拟攻击 (PHP安全)
- **描述**: 模拟攻击
- **参数**:
  - `version` (string): 版本
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=security_notice&s=attack' \\
-H 'Content-Type: application/json' \\
-d '{
  "version": "your_version_value"
}'
```

### 86. 设置PHP安全首页监控开关
- **描述**: 设置php安全首页监控开关
- **参数**:
  - `status` (string): 状态
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?action=a&name=security_notice&s=start_service' \\
-H 'Content-Type: application/json' \\
-d '{
  "status": "your_status_value"
}'
```

### 87. 获取防火墙统计信息
- **描述**: 获取防火墙统计信息
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/firewall/com/get_firewall_info' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 88. 获取防火墙开关状态
- **描述**: 获取防火墙开关状态
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/firewall/com/get_status' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 89. 初始化面板防火墙状态
- **描述**: 初始化面板防火墙状态
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/firewall/com/update_bt_firewall' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 90. 获取网站日志信息 (防火墙)
- **描述**: 获取网站日志信息
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/firewall/com/get_www_logs_size' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 91. 清空WEB日志
- **描述**: 清空web日志
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/files/CloseLogs' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 92. 是否启用ping
- **描述**: 是否启用ping
- **参数**:
  - `status` (string, 可选): 状态
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/firewall/SetPing' \\
-H 'Content-Type: application/json' \\
-d '{
  "status": "on"
}'
```

### 93. 设置防火墙开关状态
- **描述**: 设置防火墙开关状态
- **参数**:
  - `status` (number): 状态
  - `ports` (string, 可选): 端口
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/firewall/com/set_status' \\
-H 'Content-Type: application/json' \\
-d '{
  "status": 1,
  "ports": "your_ports_value"
}'
```

### 94. 获取所有的端口规则
- **描述**: 获取所有的端口规则
- **参数**:
  - `chain` (string): 数据类型 (ALL是获取所有方向，INPUT是获取入站，OUTPUT是获取出站)
  - `query` (string): 查询关键字
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/firewall/com/port_rules_list' \\
-H 'Content-Type: application/json' \\
-d '{
  "chain": "ALL",
  "query": "your_query_value"
}'
```

### 95. 获取监听进程
- **描述**: 获取监听进程
- **参数**:
  - `port` (string | number): 端口
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/firewall/get_listening_processes' \\
-H 'Content-Type: application/json' \\
-d '{
  "data": "{\\"port\\":\\"your_port_value\\"}"
}'
```

### 96. 编辑端口规则
- **描述**: 编辑端口规则
- **参数**:
  - `data` (any): 规则数据 (具体结构未在JSDoc中指明)
  - `isDomain` (boolean): 是否为域名规则
- **cURL (非域名规则)**:
```bash
curl -X POST 'YOUR_BASE_URL/firewall/com/modify_port_rule' \\
-H 'Content-Type: application/json' \\
-d 'your_data_payload'
```
- **cURL (域名规则)**:
```bash
curl -X POST 'YOUR_BASE_URL/firewall/com/modify_domain_port_rule' \\
-H 'Content-Type: application/json' \\
-d 'your_data_payload'
```

### 97. 设置端口规则
- **描述**: 设置端口规则
- **参数**:
  - `data` (any): 规则数据 (具体结构未在JSDoc中指明)
  - `isDomain` (boolean): 是否为域名规则
- **cURL (非域名规则)**:
```bash
curl -X POST 'YOUR_BASE_URL/firewall/com/set_port_rule' \\
-H 'Content-Type: application/json' \\
-d 'your_data_payload'
```
- **cURL (域名规则)**:
```bash
curl -X POST 'YOUR_BASE_URL/firewall/com/set_domain_port_rule' \\
-H 'Content-Type: application/json' \\
-d 'your_data_payload'
```

### 98. 防火墙通用导入规则
- **描述**: 防火墙通用导入规则
- **参数**:
  - `rule` (string): 导入类型 (port, ip, forward)
  - `file` (string): 导入文件路径
  - `rule_name` (string, 可选): 规则名称, 例如 'country_rule'
- **cURL (通用规则)**:
```bash
curl -X POST 'YOUR_BASE_URL/firewall/com/import_rules' \\
-H 'Content-Type: application/json' \\
-d '{
  "rule": "port",
  "file": "/path/to/your/file"
}'
```
- **cURL (国家/地区规则)**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/firewall/import_rules' \\
-H 'Content-Type: application/json' \\
-d '{
  "data": "{\\"rule_name\\":\\"country_rule\\",\\"rule\\":\\"your_rule_type\\",\\"file\\":\\"/path/to/your/file\\"}"
}'
```

### 99. 防火墙通用导出规则
- **描述**: 防火墙通用导出规则
- **参数**:
  - `rule` (string): 导出类型 (port, ip, forward)
  - `chain` (string): 导出数据 (ALL, INPUT, OUTPUT)
  - `rule_name` (string, 可选): 规则名称, 例如 'country_rule'
- **cURL (通用规则)**:
```bash
curl -X POST 'YOUR_BASE_URL/firewall/com/export_rules' \\
-H 'Content-Type: application/json' \\
-d '{
  "rule": "port",
  "chain": "ALL"
}'
```
- **cURL (国家/地区规则)**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/firewall/export_rules' \\
-H 'Content-Type: application/json' \\
-d '{
  "data": "{\\"rule_name\\":\\"country_rule\\",\\"rule\\":\\"your_rule_type\\",\\"chain\\":\\"ALL\\"}"
}'
```

### 100. 获取所有的IP规则
- **描述**: 获取所有的ip规则
- **参数**:
  - `chain` (string): 数据类型 (ALL, INPUT, OUTPUT)
  - `query` (string, 可选): 查询关键字
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/firewall/com/ip_rules_list' \\
-H 'Content-Type: application/json' \\
-d '{
  "chain": "ALL",
  "query": "your_query_value"
}'
```

### 101. 编辑IP规则
- **描述**: 编辑ip规则
- **参数**:
  - `data` (any): 规则数据 (具体结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/firewall/com/modify_ip_rule' \\
-H 'Content-Type: application/json' \\
-d 'your_data_payload'
```

### 102. 设置IP规则
- **描述**: 设置ip规则
- **参数**:
  - `data` (any): 规则数据 (具体结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/firewall/com/set_ip_rule' \\
-H 'Content-Type: application/json' \\
-d 'your_data_payload'
```

### 103. 获取所有的端口转发规则
- **描述**: 获取所有的端口转发规则
- **参数**:
  - `query` (string): 查询关键字
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/firewall/com/port_forward_list' \\
-H 'Content-Type: application/json' \\
-d '{
  "query": "your_query_value"
}'
```

### 104. 设置端口转发规则
- **描述**: 设置端口转发规则
- **参数**:
  - `data` (any): 规则数据 (具体结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/firewall/com/set_port_forward' \\
-H 'Content-Type: application/json' \\
-d 'your_data_payload'
```

### 105. 编辑端口转发规则
- **描述**: 编辑端口转发规则
- **参数**:
  - `data` (any): 规则数据 (具体结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/firewall/com/modify_forward_rule' \\
-H 'Content-Type: application/json' \\
-d 'your_data_payload'
```

### 106. 获取地区规则列表数据
- **描述**: 获取地区规则列表数据
- **参数**:
  - `data` (any): (具体参数结构未在JSDoc中指明, 可能包含分页等)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/firewall/get_country_list' \\
-H 'Content-Type: application/json' \\
-d 'your_data_payload'
```

### 107. 删除地区规则
- **描述**: 删除地区规则
- **参数**:
  - `data` (any): (具体参数结构未在JSDoc中指明, 可能包含规则ID等)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/firewall/remove_country' \\
-H 'Content-Type: application/json' \\
-d 'your_data_payload'
```

### 108. 获取地区数据
- **描述**: 获取地区数据
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/firewall/get_countrys' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 109. 添加地区规则
- **描述**: 添加地区规则
- **参数**:
  - `data` (AnyObject): 规则数据 (具体字段未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/firewall/create_countrys' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 110. 修改地区规则
- **描述**: 修改地区规则
- **参数**:
  - `data` (AnyObject): 规则数据 (具体字段未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/firewall/modify_country' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 111. 获取端口防扫描状态
- **描述**: 获取端口防扫描
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/firewall/get_anti_scan_status' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 112. 设置端口防扫描状态
- **描述**: 设置端口防扫描状态
- **参数**:
  - `status` (number): 状态 (e.g., 0 or 1)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/firewall/set_anti_scan_status' \\
-H 'Content-Type: application/json' \\
-d '{
  "data": "{\\"status\\":1}"
}'
```

### 113. 删除IP扫描 (防爆破)
- **描述**: 删除IP扫描 (JSDoc 指向 ssh_security, 应为防爆破相关)
- **参数**:
  - `ip` (string): IP地址
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/ssh_security/del_ban_ip' \\
-H 'Content-Type: application/json' \\
-d '{
  "ip": "your_ip_value"
}'
```

### 114. 删除扫描IP (端口防扫描)
- **描述**: 删除IP扫描 (JSDoc 指向 safe/firewall, 应为端口防扫描相关)
- **参数**:
  - `data` (any): (具体参数结构未在JSDoc中指明, 可能为 { "ip": "ip_address" } )
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/firewall/del_ban_ip' \\
-H 'Content-Type: application/json' \\
-d 'your_data_payload'
```

### 115. 获取端口防扫描日志
- **描述**: 获取端口防扫描日志
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/firewall/get_anti_scan_logs' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 116. 添加告警任务
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
  "task_id": 123,
  "template_id": "your_template_id_value",
  "task_data": "{\\"sender\\":[],\\"number_rule\\":{},\\"time_rule\\":{}}"
}'
```

### 117. 获取安全检测统计
- **描述**: 获取安全检测
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safe_detect/get_safe_count' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 118. 获取文件完整性检测-检测结果
- **描述**: 获取文件完整性检测-检测结果
- **参数**:
  - `data` (AnyObject): (具体参数结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safe_detect/get_scan_res' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 119. 文件完整性检测-立即检测
- **描述**: 获取文件完整性检测-立即检测
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safe_detect/file_detect' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 120. 文件完整性检测-立即处理
- **描述**: 获取文件完整性检测-立即处理
- **参数**:
  - `path` (AnyObject): 路径 (JSDoc为AnyObject, 应为string或包含path的对象)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safe_detect/opt_dir' \\
-H 'Content-Type: application/json' \\
-d '{
  "path": "your_path_value"
}'
```

### 121. 获取文件完整性检测-监控目录
- **描述**: 获取文件完整性检测-获取监控目录
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safe_detect/get_scan_dir' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 122. 添加文件完整性检测-目录
- **描述**: 添加文件完整性检测-目录
- **参数**:
  - `dir` (AnyObject): 路径 (JSDoc为AnyObject, 应为string或包含dir的对象)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safe_detect/add_scan_dir' \\
-H 'Content-Type: application/json' \\
-d '{
  "dir": "your_dir_value"
}'
```

### 123. 删除文件完整性检测-目录
- **描述**: 删除文件完整性检测-目录
- **参数**:
  - `path` (AnyObject): 路径 (JSDoc为AnyObject, 应为string或包含path的对象)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safe_detect/del_scan_dir' \\
-H 'Content-Type: application/json' \\
-d '{
  "path": "your_path_value"
}'
```

### 124. 获取文件完整性检测-当前定时任务信息
- **描述**: 获取文件完整性检测-当前定时任务信息
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safe_detect/get_cron_file_M' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 125. 设置文件完整性检测-定时任务信息
- **描述**: 获取文件完整性检测-设置定时任务信息
- **参数**:
  - `data` (AnyObject): 定时任务信息 (具体字段未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safe_detect/set_cron_file_info' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 126. 删除监控目录 (木马查杀)
- **描述**: 删除监控目录
- **参数**:
  - `path` (string): 路径
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safe_detect/del_monitor_dir' \\
-H 'Content-Type: application/json' \\
-d '{
  "path": "your_path_value"
}'
```

### 127. 停止/启动监控目录 (木马查杀)
- **描述**: 停止监控/启动监控
- **参数**:
  - `status` (boolean): 操作类型 (true: 停止, false: 启动)
  - `data` (AnyObject): (具体参数结构未在JSDoc中指明, 可能包含路径等)
- **cURL (停止)**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safe_detect/stop_monitor_dir' \\
-H 'Content-Type: application/json' \\
-d '{}'
```
- **cURL (启动)**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safe_detect/start_monitor_dir' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 128. 修改监控目录备注 (木马查杀)
- **描述**: 修改监控目录备注
- **参数**:
  - `data` (AnyObject): (具体参数结构未在JSDoc中指明, 可能包含路径和备注)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safe_detect/edit_monitor_dir' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 129. 停止/开启木马查杀全局状态
- **描述**: 停止/开启木马查杀全局状态
- **参数**:
  - `status` (boolean): 操作类型 (true: 停止, false: 开启)
- **cURL (停止)**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safe_detect/stop_service' \\
-H 'Content-Type: application/json' \\
-d '{}'
```
- **cURL (开启)**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safe_detect/start_service' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 130. 获取木马查杀全局状态
- **描述**: 木马查杀全局状态
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safe_detect/get_service_status' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 131. 获取木马查杀列表 (监控目录)
- **描述**: 木马查杀列表
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safe_detect/get_monitor_dir' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 132. 获取隔离文件数量 (木马查杀)
- **描述**: 获取隔离文件数量
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safe_detect/get_webshell_total' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 133. 添加监控目录 (木马查杀)
- **描述**: 添加监控目录
- **参数**:
  - `data` (AnyObject): (具体参数结构未在JSDoc中指明, 可能包含路径)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safe_detect/add_monitor_dir' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 134. 添加所有网站目录到木马查杀
- **描述**: 获取所有网站目录 (应为添加所有网站目录)
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safe_detect/add_all_site' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 135. 获取隔离文件 (木马查杀)
- **描述**: 获取隔离文件
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safe_detect/webshell_file' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 136. 处理隔离文件 (木马查杀)
- **描述**: 删除隔离文件 (应为处理隔离文件)
- **参数**:
  - `data` (AnyObject): (具体参数结构未在JSDoc中指明, 可能包含文件路径和操作类型)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safe_detect/set_handle_file' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 137. 获取白名单目录 (木马查杀)
- **描述**: 获取白名单目录
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safe_detect/get_white_path' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 138. 添加白名单目录 (木马查杀)
- **描述**: 添加白名单目录
- **参数**:
  - `data` (AnyObject): (具体参数结构未在JSDoc中指明, 可能包含路径)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safe_detect/add_white_path' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 139. 删除白名单目录 (木马查杀)
- **描述**: 删除白名单目录
- **参数**:
  - `data` (AnyObject): (具体参数结构未在JSDoc中指明, 可能包含路径)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/safe_detect/del_white_path' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 140. 安全扫描 (漏洞扫描)
- **描述**: 安全扫描
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/scanning/startScan' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 141. 获取漏洞扫描自动化扫描告警设置
- **描述**: 安全检测-漏洞扫描-自动化扫描-查询告警设置
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/site/get_cron_scanin_info' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 142. 设置漏洞扫描自动化扫描告警
- **描述**: 安全检测-漏洞扫描-自动化扫描-设置告警
- **参数**:
  - `data` (AnyObject): 告警设置 (具体字段未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/site/set_cron_scanin_info' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 143. 获取SSH服务加固配置信息
- **描述**: 获取防护配置配置信息 (应为获取SSH服务加固配置)
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?name=syssafe&action=a&s=get_ssh_config' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 144. 保存SSH服务加固配置信息
- **描述**: 获取防护配置SSH服务加固配置信息 (应为保存SSH服务加固配置)
- **参数**:
  - `data` (AnyObject): 配置信息 (具体字段未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?name=syssafe&action=a&s=save_ssh_config' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 145. 获取异常进程监控白名单 (系统加固)
- **描述**: 获取防护配置异常进程监控配置信息 (应为获取白名单)
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?name=syssafe&action=a&s=get_process_white' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 146. 添加异常进程监控白名单 (系统加固)
- **描述**: 获取防护配置异常进程监控配置信息 (应为添加白名单)
- **参数**:
  - `process_name` (string): 进程名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?name=syssafe&action=a&s=add_process_white' \\
-H 'Content-Type: application/json' \\
-d '{
  "process_name": "your_process_name_value"
}'
```

### 147. 删除异常进程监控白名单 (系统加固)
- **描述**: 获取防护配置异常进程监控配置信息 (应为删除白名单)
- **参数**:
  - `process_name` (string): 进程名称
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?name=syssafe&action=a&s=remove_process_white' \\
-H 'Content-Type: application/json' \\
-d '{
  "process_name": "your_process_name_value"
}'
```

### 148. 修复计划任务 (内容监控)
- **描述**: 修复计划任务
- **参数**:
  - `data` (AnyObject): (具体参数结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/project/content/repair_cron' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 149. 获取恶意IP列表 (防火墙)
- **描述**: 获取所有的ip规则 (应为获取恶意IP列表)
- **参数**:
  - `data` (string): JSON字符串, 例如: `{"p":1,"limit":10,"query":"keyword"}`
    - `p` (number): 页码
    - `limit` (number): 每页数量
    - `query` (string, 可选): 查询关键字
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/firewall/get_malicious_ip_list' \\
-H 'Content-Type: application/json' \\
-d '{
  "data": "{\\"p\\":1,\\"limit\\":10,\\"query\\":\\"your_query_value\\"}"
}'
```

### 150. 清空恶意IP (防火墙)
- **描述**: 清空恶意IP
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/firewall/remove_all_malicious_ip' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 151. 删除恶意IP (防火墙)
- **描述**: 清空恶意IP (应为删除指定恶意IP)
- **参数**:
  - `data` (string): JSON字符串, 例如: `{"ip_list":["1.1.1.1"]}`
    - `ip_list` (Array<string>): IP地址列表
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/firewall/remove_malicious_ip' \\
-H 'Content-Type: application/json' \\
-d '{
  "data": "{\\"ip_list\\":[\\"1.2.3.4\\",\\"5.6.7.8\\"]}"
}'
```

### 152. 切换恶意IP状态 (防火墙)
- **描述**: 清空恶意IP (应为切换恶意IP状态)
- **参数**:
  - `data` (string): JSON字符串, 例如: `{"ip_list":["1.1.1.1"],"status":0}`
    - `ip_list` (Array<string>): IP地址列表
    - `status` (number): 状态
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/firewall/switch_malicious_ip' \\
-H 'Content-Type: application/json' \\
-d '{
  "data": "{\\"ip_list\\":[\\"1.2.3.4\\"],\\"status\\":1}"
}'
```

### 153. 获取恶意IP拦截状态 (防火墙)
- **描述**: 清空恶意IP (应为获取恶意IP拦截状态)
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/firewall/get_malicious_ip_status' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 154. 设置恶意IP封禁时间 (防火墙)
- **描述**: 清空恶意IP (应为设置恶意IP封禁时间)
- **参数**:
  - `time` (number): 封禁时间 (单位秒)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/safe/firewall/set_malicious_ip_bantime' \\
-H 'Content-Type: application/json' \\
-d '{
  "data": "{\\"bantime\\":3600}"
}'
```

### 155. 获取扫描感知概览
- **描述**: 获取扫描感知概览
- **参数**:
  - `start_timestamp` (string): 开始时间
  - `end_timestamp` (string): 结束时间
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?name=networkscan&action=a&s=get_overview_and_scan_info' \\
-H 'Content-Type: application/json' \\
-d '{
  "start_timestamp": "your_start_timestamp_value",
  "end_timestamp": "your_end_timestamp_value"
}'
```

### 156. 扫描感知开关切换
- **描述**: 扫描感知开关
- **参数**:
  - `switch_type` (string): 开关类型
  - `status` (boolean): 开启/关闭
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?name=networkscan&action=a&s=toggle_switch_status' \\
-H 'Content-Type: application/json' \\
-d '{
  "switch_type": "your_switch_type_value",
  "status": true
}'
```

### 157. 导出扫描感知IP列表
- **描述**: 导出扫描感知IP列表
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?name=networkscan&action=a&s=export_ip_table' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 158. 获取扫描感知详情
- **描述**: 获取扫描感知详情
- **参数**:
  - `ip` (string): ip
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?name=networkscan&action=a&s=get_ip_detail' \\
-H 'Content-Type: application/json' \\
-d '{
  "ip": "your_ip_value"
}'
```

### 159. 保存扫描感知规则
- **描述**: 保存扫描感知详情 (应为保存规则)
- **参数**:
  - `minutes` (string, 可选): 分钟
  - `scan_count` (string, 可选): 扫描次数
  - `cleanup_days` (string, 可选): 清理天数
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?name=networkscan&action=a&s=set_scan_sensing_rule' \\
-H 'Content-Type: application/json' \\
-d '{
  "minutes": "your_minutes_value",
  "scan_count": "your_scan_count_value",
  "cleanup_days": "your_cleanup_days_value"
}'
```

### 160. 获取扫描感知实时日志
- **描述**: 获取扫描感知实时日志
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/plugin?name=networkscan&action=a&s=get_networkscan_log' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 161. 获取网站防火墙封禁IP列表
- **描述**: 获取封禁IP列表 (网站防火墙)
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/btwaf/get_waf_drop_ip.json' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 162. 封禁IP (网站防火墙)
- **描述**: 封禁IP
- **参数**:
  - `ip` (string): ip
  - `timeout` (number): 封禁时间
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/btwaf/add_temporary_ip.json' \\
-H 'Content-Type: application/json' \\
-d '{
  "ip": "your_ip_value",
  "timeout": 3600
}'
```

### 163. 解封IP (网站防火墙)
- **描述**: 解封IP
- **参数**:
  - `ip` (string): ip
  - `timeout` (number): 封禁时间 (此参数在解封时通常不必要，但API定义包含)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/btwaf/del_temporary_ip.json' \\
-H 'Content-Type: application/json' \\
-d '{
  "ip": "your_ip_value",
  "timeout": 0 
}'
```

### 164. 获取扫描感知操作日志
- **描述**: 获取扫描感知操作日志
- **参数**:
  - `p` (number): 当前页
  - `rows` (number): 每页条数
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/networkscan/get_action_logs.json' \\
-H 'Content-Type: application/json' \\
-d '{
  "p": 1,
  "rows": 10
}'
```

### 165. 移除SSH登录失败自动封禁计划任务
- **描述**: 获取SSH服务加固配置-SSH服务加固配置 (应为移除计划任务)
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/ssh/com/remove_cron_job' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 166. 执行SSH登录失败IP封禁
- **描述**: 获取SSH服务加固配置-SSH服务加固配置 (应为执行封禁)
- **参数**:
  - `data` (string): JSON字符串, 内容例如: `{"client_ip":"ip_address","port":"port_number"}`
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/ssh/com/run_ban_login_failed_ip' \\
-H 'Content-Type: application/json' \\
-d '{
  "data": "{\\"client_ip\\":\\"your_client_ip_value\\",\\"port\\":\\"your_port_value\\"}"
}'
```

### 167. 添加SSH登录失败自动封禁计划任务
- **描述**: 添加SSH服务加固配置-SSH服务加固配置 (应为添加计划任务)
- **参数**:
  - `data` (any): 计划任务配置 (具体结构未在JSDoc中指明)
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/ssh/com/add_cron_job' \\
-H 'Content-Type: application/json' \\
-d 'your_cron_job_config_payload'
```

### 168. 清理防火墙缓存
- **描述**: 清理缓存
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/firewall/com/clean_cache' \\
-H 'Content-Type: application/json' \\
-d '{}'
```

### 169. 清理SSH登录日志
- **描述**: 清理登录日志
- **参数**: 无
- **cURL**:
```bash
curl -X POST 'YOUR_BASE_URL/mod/ssh/com/clean_ssh_list' \\
-H 'Content-Type: application/json' \\
-d '{}'
```
