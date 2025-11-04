# 虚拟树组件

## 功能说明
基于 Element Plus 的 TreeV2 组件二次封装，支持大数据量的虚拟滚动树形结构

## 使用场景
- 大型树形数据展示
- 需要高性能渲染的场景
- 动态加载节点数据
- 复杂层级结构展示

## 组件参数 (Props)
完整继承 Element Plus TreeV2 组件参数，参考：
https://element-plus.org/zh-CN/component/tree-v2.html

| 常用参数   | 类型      | 默认值 | 说明                     |
|------------|-----------|--------|--------------------------|
| data       | Array     | []     | 树形数据                 |
| height     | number    | 200    | 容器高度                 |
| item-size  | number    | 26     | 每个节点的高度           |
| props      | object    | {}     | 节点配置（label/children等） |

## 样式覆盖
```scss
/* 修改节点悬停背景色 */
.el-tree-v2__node:hover {
  background-color: #f5f7fa;
}

/* 调整展开图标颜色 */
.el-tree-v2__expand-icon {
  color: #20a53a;
}
```

## 注意事项
1. 大数据量需合理设置height/item-size
2. 节点数据需符合树形结构
3. 支持动态更新数据
4. 需手动引入element-plus样式 