# 气泡卡片组件

## 功能说明
基于 Element Plus Popover 的二次封装组件，用于显示浮层信息

## 使用场景
- 操作菜单展示
- 详细信息预览
- 上下文相关操作
- 复杂信息提示

## 组件参数 (Props)
完整继承 Element Plus Popover 组件参数，参考：
https://element-plus.org/zh-CN/component/popover.html

| 常用参数     | 类型       | 默认值     | 说明                     |
|--------------|------------|------------|--------------------------|
| title        | string     | -          | 标题                     |
| width        | string     | '150px'    | 弹出层宽度               |
| trigger      | string     | 'hover'    | 触发方式(hover/click/focus) |
| placement    | string     | 'bottom'   | 出现位置                 |
| content      | string     | -          | 显示内容                 |

## 事件说明
| 事件名       | 说明                 | 回调参数       |
|--------------|----------------------|----------------|
| show         | 显示时触发           | -              |
| hide         | 隐藏时触发           | -              |

## 基本使用
```vue
<template>
  <bt-popover title="标题" content="内容">
    <el-button>点击显示气泡卡片</el-button>
  </bt-popover>
</template>
```

## 样式覆盖
```scss
/* 修改标题样式 */
.el-popover__title {
  color: #20a53a;
  font-weight: 500;
}

/* 调整弹出层圆角 */
.el-popover {
  border-radius: 8px;
}
```

## 注意事项
1. 需要设置合适的width值
2. 点击触发时需自行处理关闭逻辑
3. 复杂内容建议使用插槽
4. 移动端建议使用click触发方式
5. 避免嵌套多个popover 