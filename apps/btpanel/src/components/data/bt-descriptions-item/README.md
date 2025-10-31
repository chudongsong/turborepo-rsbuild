# 描述列表项组件

## 功能说明
基于 Element Plus 的 DescriptionsItem 组件二次封装，需配合 bt-descriptions 使用

## 使用场景
- 详情信息展示
- 键值对数据排列
- 配置参数说明
- 元数据展示

## 组件参数 (Props)
完整继承 Element Plus DescriptionsItem 组件参数，参考：
https://element-plus.org/zh-CN/component/descriptions.html

| 常用参数   | 类型      | 默认值 | 说明                     |
|------------|-----------|--------|--------------------------|
| label      | string    | -      | 项标签                   |
| span       | number    | 1      | 占据的列数               |
| width      | string    | -      | 列宽度(支持百分比)       |
| min-width  | string    | -      | 最小列宽                 |

## 样式覆盖
```scss
/* 调整标签颜色 */
.el-descriptions__label {
  color: var(--el-color-text-secondary);
}

/* 修改内容区域样式 */
.el-descriptions__content {
  font-weight: 500;
}
```

## 注意事项
1. 必须作为 bt-descriptions 的子组件使用
2. span总和建议不超过列总数
3. 支持响应式布局
4. 可设置不同屏幕尺寸下的span值 