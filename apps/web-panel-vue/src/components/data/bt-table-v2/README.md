# 虚拟表格组件

## 功能说明
基于 Element Plus 的 TableV2 组件二次封装，支持大数据量的虚拟滚动表格

## 使用场景
- 万级数据量表格展示
- 高性能表格需求
- 动态列配置
- 复杂表格交互

## 组件参数 (Props)
完整继承 Element Plus TableV2 组件参数，参考：
https://element-plus.org/zh-CN/component/table-v2.html

| 常用参数   | 类型      | 默认值 | 说明                     |
|------------|-----------|--------|--------------------------|
| columns    | Array     | []     | 列配置                   |
| data       | Array     | []     | 表格数据                 |
| width      | number    | -      | 表格宽度                 |
| height     | number    | 400    | 表格高度                 |
| row-height | number    | 50     | 行高                     |

## 样式覆盖
```scss
/* 修改表头背景色 */
.el-table-v2__header-row {
  background: #f5f7fa;
}

/* 调整行悬停效果 */
.el-table-v2__row:hover {
  background-color: #fafafa;
}
```

## 注意事项
1. 大数据量需合理设置height/row-height
2. 列配置需包含width属性
3. 支持动态更新数据
4. 需手动引入element-plus样式 