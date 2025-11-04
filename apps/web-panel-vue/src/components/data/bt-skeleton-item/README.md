# 骨架屏项组件

## 功能说明
基于 Element Plus 的 SkeletonItem 组件二次封装，用于构建复杂骨架屏布局

## 使用场景
- 自定义骨架屏元素
- 复杂布局占位
- 图片/卡片占位
- 表格行占位

## 组件参数 (Props)
完整继承 Element Plus SkeletonItem 组件参数，参考：
https://element-plus.org/zh-CN/component/skeleton.html

| 常用参数   | 类型      | 默认值 | 说明                     |
|------------|-----------|--------|--------------------------|
| variant    | string    | text   | 元素类型(text/button等)  |
| style      | object    | {}     | 自定义样式               |

## 样式覆盖
```scss
/* 自定义图片占位样式 */
.el-skeleton__image {
  border-radius: 8px;
}

/* 调整按钮占位尺寸 */
.el-skeleton__button {
  width: 100px;
  height: 40px;
}
```

## 注意事项
1. 必须作为 bt-skeleton 的子组件使用
2. 可组合多种variant创建复杂布局
3. 自定义样式需考虑响应式
4. 动画效果继承父级设置 