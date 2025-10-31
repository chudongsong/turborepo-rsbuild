# 上传组件

## 功能说明
基于 Element Plus Upload 的二次封装组件，提供文件上传功能

## 使用场景
- 单文件/多文件上传
- 图片上传预览
- 大文件分片上传
- 拖拽上传场景

## 组件参数 (Props)
完整继承 Element Plus Upload 组件参数，参考：
https://element-plus.org/zh-CN/component/upload.html

| 常用参数     | 类型       | 默认值    | 说明                     |
|--------------|------------|-----------|--------------------------|
| action       | string     | -         | 上传地址                 |
| multiple     | boolean    | false     | 是否支持多选文件         |
| drag         | boolean    | false     | 是否启用拖拽上传         |
| accept       | string     | -         | 接受上传的文件类型       |
| limit        | number     | -         | 最大允许上传个数         |
| headers      | object     | -         | 请求头设置               |

## 事件说明
| 事件名       | 说明                 | 回调参数       |
|--------------|----------------------|----------------|
| success      | 文件上传成功时触发   | 响应结果, 文件, 文件列表 |
| error        | 文件上传失败时触发   | 错误信息, 文件, 文件列表 |

## 基本使用
```vue
<template>
  <bt-upload
    action="/api/upload"
    :headers="{ Authorization: 'Bearer xxx' }"
    @success="handleSuccess"
  >
    <el-button type="primary">点击上传</el-button>
  </bt-upload>
</template>
```

## 样式覆盖
```scss
/* 修改上传按钮颜色 */
.el-upload {
  --el-color-primary: #20a53a;
}

/* 调整拖拽区域边框 */
.el-upload-dragger {
  border: 2px dashed #dcdfe6;
}
```

## 注意事项
1. 需要配置有效的action地址
2. 大文件上传建议配置chunk-size
3. 图片预览需设置list-type为picture-card
4. 需要手动处理上传结果
5. 跨域上传需配置with-credentials 