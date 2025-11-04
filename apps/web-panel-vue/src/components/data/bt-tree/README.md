# 树形组件

## 功能说明
基于 Element Plus 的 Tree 组件二次封装，支持常规树形结构展示

## 使用场景
- 层级数据展示
- 目录结构显示
- 分类树形导航
- 权限树选择

## 组件参数 (Props)
完整继承 Element Plus Tree 组件参数，参考：
https://element-plus.org/zh-CN/component/tree.html

| 常用参数   | 类型      | 默认值 | 说明                     |
|------------|-----------|--------|--------------------------|
| data       | Array     | []     | 树形数据                 |
| node-key   | string    | 'id'   | 节点唯一标识字段         |
| props      | object    | {}     | 节点配置（label/children等） |
| show-checkbox | boolean | false | 是否显示复选框           |

## 样式覆盖
```scss
/* 修改选中节点颜色 */
.el-tree-node.is-current > .el-tree-node__content {
  color: #20a53a;
}

/* 调整节点间距 */
.el-tree-node__content {
  padding: 4px 0;
}
```

## 注意事项
1. 数据量较大时建议使用虚拟树版本
2. 节点需包含唯一标识字段
3. 复选框需配合show-checkbox使用
4. 支持节点懒加载 