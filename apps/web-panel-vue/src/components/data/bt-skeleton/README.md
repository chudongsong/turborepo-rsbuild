# 骨架屏组件

## 功能说明
基于 Element Plus 的 Skeleton 组件二次封装，用于数据加载时的占位显示

## 使用场景
- 数据加载等待状态
- 内容区块预占位
- 提升加载体验
- 复杂内容预渲染

## 组件参数 (Props)
完整继承 Element Plus Skeleton 组件参数，参考：
https://element-plus.org/zh-CN/component/skeleton.html

| 常用参数   | 类型      | 默认值 | 说明                     |
|------------|-----------|--------|--------------------------|
| animated   | boolean   | false  | 是否开启动画             |
| count      | number    | 1      | 渲染占位元素数量         |
| rows       | number    | 3      | 段落占位行数             |
| loading    | boolean   | true   | 是否显示骨架屏           |

## 样式覆盖
```scss
/* 修改占位背景色 */
.el-skeleton__item {
  background: #f5f7fa;
}

/* 调整动画速度 */
.el-skeleton.is-animated .el-skeleton__item {
  animation-duration: 1.5s;
}
```

## 注意事项
1. 需配合 bt-skeleton-item 使用复杂布局
2. 动画效果可能影响性能
3. 动态修改loading可切换状态
4. 段落行数需与实际内容匹配 