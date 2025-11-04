# 警告提示组件

## 功能说明
基于 Element Plus Alert 的二次封装组件，用于页面级提示反馈

## 使用场景
- 操作成功/失败提示
- 系统警告信息
- 需要强调的提示内容
- 表单提交反馈

## 组件参数 (Props)
完整继承 Element Plus Alert 组件参数，参考：
https://element-plus.org/zh-CN/component/alert.html

| 常用参数     | 类型       | 默认值     | 说明                     |
|--------------|------------|------------|--------------------------|
| title        | string     | -          | 标题                     |
| type         | string     | 'info'     | 类型(success/warning/info/error) |
| closable     | boolean    | true       | 是否可关闭               |
| center       | boolean    | false      | 是否居中                 |
| showIcon     | boolean    | true       | 是否显示图标             |

## 事件说明
| 事件名       | 说明                 | 回调参数       |
|--------------|----------------------|----------------|
| close        | 关闭时触发           | -              |

## 基本使用
```vue
<template>
  <bt-alert 
    title="成功提示" 
    type="success" 
    description="操作已成功完成"
  />
</template>
```

## 样式覆盖
```scss
/* 修改成功提示背景色 */
.el-alert--success {
  background-color: #f0f9eb;
}

/* 调整关闭按钮位置 */
.el-alert__closebtn {
  top: 12px;
}
```

## 注意事项
1. 重要提示建议设置closable为false
2. 需要自动关闭时可配合定时器使用
3. 长文本建议设置description属性
4. 需要自定义图标时使用插槽
5. 多个提示需控制垂直间距 