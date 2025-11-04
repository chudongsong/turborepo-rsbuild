# 标签组件

## 功能说明
基于 Element Plus 的 Tag 组件二次封装，用于信息标记和分类

## 使用场景
- 状态标识
- 分类标签
- 可关闭标签
- 动态标签组

## 组件参数 (Props)
完整继承 Element Plus Tag 组件参数，参考：
https://element-plus.org/zh-CN/component/tag.html

| 常用参数   | 类型      | 默认值 | 说明                     |
|------------|-----------|--------|--------------------------|
| type       | string    | -      | 类型(success/info/warning/danger) |
| closable   | boolean   | false  | 是否可关闭               |
| disable-transitions | boolean | false | 禁用渐变动画           |
| hit        | boolean   | false  | 是否有边框描边           |

## 样式覆盖
```scss
/* 修改标签圆角 */
.el-tag {
  border-radius: 4px;
}

/* 调整关闭按钮颜色 */
.el-tag__close {
  color: var(--el-color-text-secondary);
}
```

## 注意事项
1. 可关闭标签需配合close事件使用
2. 动态标签需自行管理状态
3. 类型颜色可自定义覆盖
4. 支持不同尺寸设置 