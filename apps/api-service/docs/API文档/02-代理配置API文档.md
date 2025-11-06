# 代理配置接口文档

## 概述

本文档描述了LinglongOS API服务中的代理配置接口，主要用于与外部面板（如宝塔面板、1Panel等）进行交互，实现文件管理等功能。

## 接口列表

### 1. 设置面板配置

**接口路径**: `POST /api/v1/proxy/panel/set_panel_config`

**功能**: 设置面板的访问密钥和地址配置

**请求参数**:

```typescript
{
  type: "bt" | "1panel";  // 面板类型
  url: string;             // 面板访问地址
  key: string;             // 面板API密钥
}
```

**响应数据**:

```typescript
{
  success: true;
  message: "Panel key bound successfully.";
  data: null;
}
```

**使用示例**:

```bash
curl -X POST http://localhost:4000/api/v1/proxy/panel/set_panel_config \
  -H "Content-Type: application/json" \
  -d '{
    "type": "bt",
    "url": "https://192.168.168.120:8888",
    "key": "your_panel_api_key"
  }'
```

---

### 2. 获取文件列表

**接口路径**: `GET /api/v1/proxy/file/get_file_list`

**功能**: 获取指定目录下的文件和文件夹列表

**请求参数** (Query String):

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `panelType` | string | 否 | "bt" | 面板类型 (bt/1panel) |
| `p` | number | 否 | 1 | 分页页码 |
| `showRow` | number | 否 | 20 | 每页显示数量 |
| `path` | string | 是 | - | 目录路径（必填） |
| `sort` | string | 否 | "name" | 排序字段 (name/size/mtime) |
| `reverse` | boolean | 否 | false | 排序方式 (true=降序/false=升序) |

**响应数据**:

```typescript
{
  code: 200;
  message: "success";
  data: {
    total: number;        // 总数量
    page: number;         // 当前页
    pageSize: number;     // 每页大小
    path: string;         // 当前目录
    list: Array<{
      name: string;       // 文件/文件夹名
      size: number;       // 文件大小（字节）
      mtime: number;      // 修改时间（时间戳）
      isDir: boolean;     // 是否为文件夹
      path: string;       // 完整路径
      type: string;       // 文件类型 (folder/file/image/document/code/audio/video/archive)
    }>;
  };
}
```

**使用示例**:

```bash
# 获取根目录文件列表
curl "http://localhost:4000/api/v1/proxy/file/get_file_list?panelType=bt&path=/"

# 按大小降序排列
curl "http://localhost:4000/api/v1/proxy/file/get_file_list?panelType=bt&path=/www&sort=size&reverse=true"

# 分页查询
curl "http://localhost:4000/api/v1/proxy/file/get_file_list?panelType=bt&path=/www&p=2&showRow=50"
```

**JavaScript调用示例**:

```javascript
// 使用 fetch API
async function fetchFileList() {
  const response = await fetch(
    'http://localhost:4000/api/v1/proxy/file/get_file_list?panelType=bt&path=/www&sort=name&reverse=false'
  );

  const result = await response.json();

  if (result.code === 200) {
    console.log('文件列表:', result.data.list);
    console.log('总数量:', result.data.total);
    console.log('当前页:', result.data.page);
  } else {
    console.error('获取失败:', result.message);
  }
}

// 使用 axios
const axios = require('axios');

async function fetchFileListWithAxios() {
  try {
    const response = await axios.get('http://localhost:4000/api/v1/proxy/file/get_file_list', {
      params: {
        panelType: 'bt',
        path: '/www',
        sort: 'name',
        reverse: false,
        p: 1,
        showRow: 20
      }
    });

    console.log('文件列表:', response.data.data.list);
  } catch (error) {
    console.error('请求失败:', error.message);
  }
}
```

---

### 3. 通用代理请求

**接口路径**: `POST /api/v1/proxy/request`

**功能**: 通用代理请求接口，可转发任意请求到配置的面板

**请求参数**:

```typescript
{
  panelType: "bt" | "1panel";    // 面板类型
  url?: string;                   // 覆盖的面板地址（可选）
  params?: Record<string, any>;   // 请求参数
  method?: "GET" | "POST" | ...;  // HTTP方法（可选，默认POST）
}
```

**响应数据**: 直接返回下游面板的响应数据

**使用示例**:

```bash
# 获取面板信息
curl -X POST http://localhost:4000/api/v1/proxy/request \
  -H "Content-Type: application/json" \
  -d '{
    "panelType": "bt",
    "params": {
      "action": "GetPanelInfo"
    }
  }'
```

---

## 文件类型说明

返回的文件列表中，`type` 字段表示文件类型，可能的值包括：

| 类型值 | 说明 | 常见扩展名 |
|--------|------|------------|
| `folder` | 文件夹 | - |
| `image` | 图片文件 | .jpg, .jpeg, .png, .gif, .bmp, .svg, .webp |
| `document` | 文档文件 | .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx |
| `text` | 文本文件 | .txt, .md |
| `code` | 代码文件 | .js, .ts, .jsx, .tsx, .html, .css, .py, .java, .cpp, .php 等 |
| `audio` | 音频文件 | .mp3, .wav, .flac, .aac |
| `video` | 视频文件 | .mp4, .avi, .mkv, .mov, .wmv |
| `archive` | 压缩文件 | .zip, .rar, .7z, .tar, .gz |
| `file` | 普通文件 | 其他类型 |
| `unknown` | 未知类型 | 无扩展名或无法识别 |

---

## 错误处理

### 常见错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 400 | 参数错误 | 检查必填参数是否提供，参数类型是否正确 |
| 401 | 未授权 | 检查面板密钥是否正确 |
| 404 | 面板未配置 | 先调用绑定面板密钥接口 |
| 500 | 服务器内部错误 | 检查面板地址是否可访问，查看服务器日志 |

### 错误响应格式

```typescript
{
  code: 400;
  message: "参数错误：缺少必填参数 'path'";
  data: null;
}
```

---

## 面板配置说明

### 宝塔面板 (bt)

- **API地址**: 面板设置 → API接口 → 查看API接口信息
- **所需参数**: API接口地址和API密钥
- **认证方式**: MD5签名（自动处理）

### 1Panel

- **API地址**: 面板设置 → API接口 → 查看API接口信息
- **所需参数**: 面板访问地址和API密钥
- **认证方式**: Bearer Token（自动处理）

---

## 使用流程

### 1. 初始化面板配置

```javascript
// 设置面板配置
async function setupPanel() {
  await fetch('http://localhost:4000/api/v1/proxy/panel/set_panel_config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'bt',
      url: 'https://192.168.168.120:8888',
      key: 'your_api_key_here'
    })
  });
}
```

### 2. 获取文件列表

```javascript
// 获取文件列表
async function getFiles() {
  const response = await fetch(
    'http://localhost:4000/api/v1/proxy/file/get_file_list?panelType=bt&path=/www/wwwroot'
  );
  const data = await response.json();

  if (data.code === 200) {
    return data.data;
  } else {
    throw new Error(data.message);
  }
}
```

### 3. 处理返回数据

```javascript
// 渲染文件列表
function renderFileList(fileList) {
  const container = document.getElementById('file-list');

  fileList.list.forEach(file => {
    const row = document.createElement('div');
    row.className = 'file-row';

    // 显示文件图标
    const icon = getFileIcon(file.type);
    row.innerHTML = `
      <span class="file-icon">${icon}</span>
      <span class="file-name">${file.name}</span>
      <span class="file-size">${formatFileSize(file.size)}</span>
      <span class="file-time">${formatTime(file.mtime)}</span>
      <span class="file-type">${file.type}</span>
    `;

    container.appendChild(row);
  });
}

// 获取文件图标
function getFileIcon(type) {
  const iconMap = {
    folder: '📁',
    image: '🖼️',
    document: '📄',
    text: '📝',
    code: '💻',
    audio: '🎵',
    video: '🎬',
    archive: '🗜️',
    file: '📦',
    unknown: '❓'
  };
  return iconMap[type] || iconMap.file;
}
```

---

## 注意事项

1. **路径格式**: 目录路径需要使用绝对路径，如 `/www/wwwroot`、`/home` 等
2. **分页参数**: 当文件数量较多时，建议使用分页查询，避免一次返回过多数据
3. **排序字段**: `sort` 参数支持 name（文件名）、size（文件大小）、mtime（修改时间）
4. **面板状态**: 确保面板已正确配置并可访问，否则接口会返回错误
5. **网络延迟**: 代理请求可能存在网络延迟，建议添加适当的错误处理和重试机制
6. **文件大小**: 所有文件大小单位为字节，需要在前端进行格式化显示

---

## 更新日志

### v1.0.0 (2025-11-05)

- 新增文件列表获取接口
- 支持宝塔面板和1Panel两种面板类型
- 支持分页、排序和文件类型识别
- 提供完整的类型定义和错误处理

---

## 技术支持

如有疑问或需要技术支持，请联系开发团队或查看项目文档。

---

**API版本**: v1.0.0
**最后更新**: 2025-11-05
