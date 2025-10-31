# 密码显示组件

## 功能说明
表格密码列专用组件，支持密码显示切换和复制功能

## 使用场景
- 表格中敏感信息（如密码）的展示
- 需要临时查看密码的场景
- 密码修改提示场景

## 组件参数 (Props)
| 参数名       | 类型       | 默认值 | 必填 | 说明                                                                 |
|--------------|------------|--------|------|--------------------------------------------------------------------|
| modelValue   | string     | ''     | 否   | 密码值                                                             |
| onClickPwd   | Function   | -      | 是   | 改密按钮点击事件回调                                               |

## 功能特性
- 密码明文/星号切换
- 一键复制密码
- 改密提示功能
- 自动隐藏空密码
- 响应式状态更新

## 使用示例
```vue
<template>
  <bt-table-password 
    :model-value="row.password" 
    :on-click-pwd="handleChangePassword"
  />
</template>

<script setup>
const handleChangePassword = () => {
  // 处理改密逻辑
}
</script>
```

## 样式覆盖
```scss
/* 调整密码显示区域 */
.bt-table-password {
  .truncate {
    max-width: 140px;
  }
  
  /* 图标按钮样式 */
  i[class^="svgtofont-"] {
    transition: opacity 0.3s;
    &:hover {
      opacity: 0.8;
    }
  }
  
  /* 改密提示文字 */
  .text-danger {
    text-decoration: underline;
  }
}
```

## 注意事项
1. 需要配合copyText工具函数使用
2. 密码字段建议加密传输
3. 明文显示需控制权限
4. 复制功能依赖clipboard.js
5. 空密码状态显示改密提示
6. 建议设置合理的最大显示宽度 