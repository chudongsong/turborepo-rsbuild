# 走马灯项组件

## 功能说明
基于 Element Plus 的 CarouselItem 组件二次封装，需配合 bt-carousel 使用

## 使用场景
- 轮播图单项内容
- 分页内容容器
- 幻灯片式展示项

## 组件参数 (Props)
完整继承 Element Plus CarouselItem 组件参数，参考：
https://element-plus.org/zh-CN/component/carousel.html

| 参数       | 类型      | 默认值 | 说明                     |
|------------|-----------|--------|--------------------------|
| name       | string    | -      | 唯一标识                 |
| label      | string    | -      | 对应指示器的文本标签     |

## 样式覆盖
```scss
/* 调整项内边距 */
.el-carousel__item {
  padding: 1rem;
}

/* 自定义指示器标签 */
.el-carousel__button::after {
  content: attr(data-label);
}
```

## 注意事项
1. 必须作为 bt-carousel 的子组件使用
2. 每个项需设置唯一name
3. 支持动态增减项
4. 内容高度由父容器控制 