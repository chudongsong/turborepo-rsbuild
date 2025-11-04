# 按钮上传组件

## 功能说明
增强型文件上传按钮组件，支持CSV文件上传及自定义请求参数

## 使用场景
- CSV文件上传
- 需要自定义请求头的上传场景
- 分片上传需求
- 需要进度提示的文件上传

## 组件参数 (Props)
| 参数名   | 类型                  | 默认值 | 必填 | 说明                                                                 |
|----------|-----------------------|--------|------|--------------------------------------------------------------------|
| url      | string                | ''     | 是   | 上传接口地址                                                       |
| path     | string                | ''     | 是   | 文件存储路径                                                       |
| data     | Record<string, any>   | -      | 否   | 附加请求参数                                                       |
| error    | Function              | -      | 否   | 自定义错误处理函数                                                 |
| success  | Function              | -      | 否   | 自定义成功处理函数                                                 |
| before   | Function              | -      | 否   | 上传前处理函数                                                     |

## 事件说明
| 事件名   | 说明                 | 回调参数                          |
|----------|----------------------|-----------------------------------|
| error    | 上传失败时触发       | (response, uploadFile, uploadFiles) |
| success  | 上传成功时触发       | 无                                |

## 功能特性
- 自动处理文件路径
- 携带认证Token
- 支持开发环境代理
- 文件信息自动填充
- 默认CSV文件类型限制

## 使用示例
```vue
<template>
  <bt-button-upload 
    url="/api/upload"
    path="/uploads"
    :data="{ category: 'docs' }"
  >
    上传文件
  </bt-button-upload>
</template>
```

## 样式覆盖
```scss
/* 修改上传按钮颜色 */
.el-button {
  background-color: #20a53a;
  color: white;
}

/* 调整上传组件间距 */
.el-upload {
  margin-right: 1rem;
}
```

## 注意事项
1. 需要配置有效的上传接口
2. 文件路径需符合服务器要求
3. 开发环境自动添加/api前缀
4. 需确保请求头Token有效
5. 仅支持单文件上传 