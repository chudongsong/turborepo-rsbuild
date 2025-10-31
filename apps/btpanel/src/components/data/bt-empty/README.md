# 空状态组件

## 功能说明
基于 Element Plus 的 Empty 组件二次封装，用于数据为空时的占位提示

## 使用场景
- 无数据展示
- 搜索结果为空
- 筛选条件无匹配项
- 初始化状态提示

## 组件参数 (Props)
完整继承 Element Plus Empty 组件参数，参考：
https://element-plus.org/zh-CN/component/empty.html

| 常用参数   | 类型      | 默认值 | 说明                     |
|------------|-----------|--------|--------------------------|
| image      | string    | -      | 图片URL                 |
| description | string  | 暂无数据 | 描述文字               |
| image-size | number    | 120    | 图片尺寸(宽度)           |

## 样式覆盖
```scss
/* 修改描述文字颜色 */
.el-empty__description {
  color: var(--el-color-text-secondary);
}

/* 调整图片间距 */
.el-empty__image {
  margin-bottom: 1rem;
}
```

## 注意事项
1. 支持自定义图片和描述
2. 可配合操作按钮使用
3. 图片支持SVG/PNG格式
4. 默认提供多种内置样式 