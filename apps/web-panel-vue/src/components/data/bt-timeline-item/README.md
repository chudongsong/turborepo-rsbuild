# 时间轴项组件

## 功能说明
基于 Element Plus 的 TimelineItem 组件二次封装，需配合 bt-timeline 使用

## 使用场景
- 时间节点展示
- 操作记录时间线
- 流程步骤展示
- 版本更新记录

## 组件参数 (Props)
完整继承 Element Plus TimelineItem 组件参数，参考：
https://element-plus.org/zh-CN/component/timeline.html

| 常用参数   | 类型      | 默认值 | 说明                     |
|------------|-----------|--------|--------------------------|
| timestamp  | string    | -      | 时间戳                   |
| center     | boolean   | false  | 是否居中显示             |
| placement  | string    | bottom | 时间戳位置(top/bottom)   |

## 样式覆盖
```scss
/* 修改节点颜色 */
.el-timeline-item__node {
  background-color: #20a53a;
}

/* 调整时间戳字体大小 */
.el-timeline-item__timestamp {
  font-size: 0.9rem;
}
```

## 注意事项
1. 必须作为 bt-timeline 的子组件使用
2. 时间戳格式需自行处理
3. 支持自定义图标
4. 可设置不同节点类型 