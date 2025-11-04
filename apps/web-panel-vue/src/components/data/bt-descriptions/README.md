# 描述列表组件

## 功能说明
基于 Element Plus 的 Descriptions 组件二次封装，用于展示多个键值对信息

## 使用场景
- 详情信息展示
- 配置参数说明
- 元数据排列
- 数据概览面板

## 组件参数 (Props)
完整继承 Element Plus Descriptions 组件参数，参考：
https://element-plus.org/zh-CN/component/descriptions.html

| 常用参数   | 类型      | 默认值 | 说明                     |
|------------|-----------|--------|--------------------------|
| border     | boolean   | false  | 是否显示边框             |
| column     | number    | 3      | 分栏数量                 |
| direction  | string    | horizontal | 排列方向(horizontal/vertical) |
| size       | string    | medium | 尺寸(medium / small)    |

## 样式覆盖
```scss
/* 调整行间距 */
.el-descriptions__row {
  margin-bottom: 1rem;
}

/* 修改标题样式 */
.el-descriptions__title {
  font-size: 1.1rem;
}
```

## 注意事项
1. 需要配合 bt-descriptions-item 使用
2. 分栏数量需与子项span配合
3. 支持响应式布局
4. 可设置不同屏幕尺寸下的column值 