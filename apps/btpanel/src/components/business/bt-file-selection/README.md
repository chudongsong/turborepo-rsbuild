# BtFileSelection 文件选择器

可视化文件系统导航组件，支持文件/目录选择与路径跳转。

## 功能特性
- 多级目录导航
- 路径标签化显示
- 文件类型过滤
- 实时搜索功能
- 新建文件/目录
- 磁盘空间显示

## 基本用法

```vue
<template>
  <bt-file-selection :comp-data="{ type: 'file', path: '/www' }" />
</template>
```


## 配置参数
| 参数名       | 类型     | 默认值       | 说明                |
|-------------|---------|-------------|-------------------|
| type        | string  | 'all'       | 选择类型(file/dir/all) |
| path        | string  | 当前面板路径    | 初始路径            |
| confirmText | string  | '确认'       | 确认按钮文案          |

## 组件事件
| 事件名         | 说明                          | 参数                  |
|-------------|-----------------------------|-------------------------|
| createStatus   | 新建文件/文件夹状态事件               | —                         |
| pathChange     | 路径变更事件                   | 新路径 string           |
| selectConfirm  | 确认选择事件                   | 选中项 FileItem         |


## 核心交互
1. **路径导航**：面包屑导航与输入框双向绑定
2. **双击进入**：双击目录进入子文件夹
3. **类型过滤**：根据 compData.type 过滤显示
4. **智能搜索**：实时匹配文件名/目录名
5. **新建操作**：支持创建文件/文件夹


## 数据结构
```typescript
interface FileItem {
  title: string
  path: string
  type: 'file' | 'dir'
  size: string
  mtime: string
}
```

## 最佳实践
1. **路径监听**：通过 change 事件获取路径变更
2. **类型验证**：选择目录时自动过滤文件
3. **性能优化**：虚拟滚动处理大型目录
4. **样式覆盖**：使用深层选择器调整表格样式
5. **键盘导航**：支持方向键浏览文件列表
6. **权限控制**：自动隐藏不可访问路径

## 关联接口
- 目录获取：`/files?action=get_dir`
- 文件搜索：`/files?action=search`
- 新建操作：`/files?action=create_file`

> 需配合文件管理模块使用 