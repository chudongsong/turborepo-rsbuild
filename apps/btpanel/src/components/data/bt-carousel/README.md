# 走马灯组件

## 功能说明
基于 Element Plus 的 Carousel 组件二次封装，保持原有功能特性

## 使用场景
- 轮播图展示
- 多内容切换展示
- 图片画廊
- 产品特性轮播

## 组件参数 (Props)
完整继承 Element Plus Carousel 组件参数，参考：
https://element-plus.org/zh-CN/component/carousel.html

| 常用参数   | 类型      | 默认值 | 说明                     |
|------------|-----------|--------|--------------------------|
| height     | string    | -      | 走马灯高度               |
| initial-index | number | 0      | 初始激活的幻灯片索引     |
| trigger    | string    | hover  | 指示器触发方式           |
| autoplay   | boolean   | true   | 是否自动切换             |
| interval   | number    | 3000   | 自动切换时间间隔(ms)     |
| indicator-position | string | - | 指示器位置               |

## 样式覆盖
```scss
/* 修改指示器颜色 */
.el-carousel__indicator button {
  background: #20a53a;
}

/* 调整箭头大小 */
.el-carousel__arrow {
  font-size: 1.5rem;
}
```

## 注意事项
1. 需要配合 bt-carousel-item 使用
2. 自动播放默认开启
3. 支持手势滑动切换（移动端）
4. 需引入 Element Plus 动画样式 