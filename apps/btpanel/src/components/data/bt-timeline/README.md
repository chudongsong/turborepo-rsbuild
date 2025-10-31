# 时间轴组件

## 功能说明
基于 Element Plus 的 Timeline 组件二次封装，用于垂直展示时间流信息

## 使用场景
- 操作流程展示
- 项目进度跟踪
- 历史记录时间线
- 版本更新日志

## 组件参数 (Props)
完整继承 Element Plus Timeline 组件参数，参考：
https://element-plus.org/zh-CN/component/timeline.html

| 常用参数   | 类型      | 默认值 | 说明                     |
|------------|-----------|--------|--------------------------|
| reverse    | boolean   | false  | 是否倒序排列             |
| center     | boolean   | false  | 是否居中显示             |

## 样式覆盖
```scss
/* 修改时间轴线条颜色 */
.el-timeline-item__tail {
  border-color: #e4e7ed;
}

/* 调整整体间距 */
.el-timeline {
  padding-left: 2rem;
}
```

## 注意事项
1. 需要配合 bt-timeline-item 使用
2. 倒序排列需设置reverse参数
3. 支持动态增减时间轴项
4. 可自定义时间节点图标 