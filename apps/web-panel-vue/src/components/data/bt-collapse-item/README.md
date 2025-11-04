# 折叠面板项组件

## 功能说明
基于 Element Plus 的 CollapseItem 组件二次封装，需配合 bt-collapse 使用

## 使用场景
- 可折叠内容区块
- 手风琴菜单项
- 步骤说明面板
- 设置项分组

## 组件参数 (Props)
完整继承 Element Plus CollapseItem 组件参数，参考：
https://element-plus.org/zh-CN/component/collapse.html

| 常用参数   | 类型      | 默认值 | 说明                     |
|------------|-----------|--------|--------------------------|
| name       | string    | -      | 唯一标识(必填)           |
| title      | string    | -      | 面板标题                 |
| disabled   | boolean   | false  | 是否禁用                 |

## 样式覆盖
```scss
/* 修改箭头颜色 */
.el-collapse-item__arrow {
  color: #20a53a;
}

/* 调整内容区域内边距 */
.el-collapse-item__content {
  padding: 1rem;
}
```

## 注意事项
1. 必须作为 bt-collapse 的子组件使用
2. 每个项需设置唯一name
3. 禁用状态不可展开
4. 支持动态增减项 