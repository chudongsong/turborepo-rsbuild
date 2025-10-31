# 卡片组件

## 功能说明
基于 Element Plus 的 Card 组件二次封装，保持原有功能特性

## 使用场景
- 信息聚合展示
- 数据统计面板
- 内容区块划分
- 图文组合展示

## 组件参数 (Props)
完整继承 Element Plus Card 组件参数，参考：
https://element-plus.org/zh-CN/component/card.html

| 常用参数   | 类型      | 默认值 | 说明                     |
|------------|-----------|--------|--------------------------|
| header     | string    | -      | 卡片标题                 |
| shadow     | string    | always | 阴影显示时机(hover/always) |
| body-style | object    | {}     | 内容区域样式             |

## 样式覆盖
```scss
/* 修改标题颜色 */
.el-card__header {
  color: #20a53a;
}

/* 调整内边距 */
.el-card__body {
  padding: 1.5rem;
}
```

## 注意事项
1. 支持 header 插槽自定义标题
2. 阴影效果需外层有足够空间
3. body-style 可覆盖默认样式
4. 可嵌套其他数据组件使用 