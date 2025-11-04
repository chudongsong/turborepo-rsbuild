# 折叠面板组件

## 功能说明
基于 Element Plus 的 Collapse 组件二次封装，用于展示可折叠/展开的内容区域

## 使用场景
- 常见问题解答
- 设置项分组
- 多步骤表单
- 长内容收纳展示

## 组件参数 (Props)
完整继承 Element Plus Collapse 组件参数，参考：
https://element-plus.org/zh-CN/component/collapse.html

| 常用参数   | 类型      | 默认值 | 说明                     |
|------------|-----------|--------|--------------------------|
| model-value | array   | []     | 当前激活的面板(需配合bt-collapse-item使用) |
| accordion  | boolean   | false  | 是否手风琴模式           |

## 样式覆盖
```scss
/* 修改边框颜色 */
.el-collapse {
  border-color: #e4e7ed;
}

/* 调整标题间距 */
.el-collapse-item__header {
  padding: 1rem;
}
```

## 注意事项
1. 必须配合 bt-collapse-item 使用
2. 手风琴模式每次只能展开一个面板
3. 动态修改modelValue可控制展开状态
4. 支持全部插槽用法 