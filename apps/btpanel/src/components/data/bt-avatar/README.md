# 头像组件

## 功能说明
基于 Element Plus 的 Avatar 组件二次封装，保持原有功能特性

## 使用场景
- 用户头像展示
- 评论系统用户标识
- 需要圆形/方形头像的展示场景

## 组件参数 (Props)
完整继承 Element Plus Avatar 组件参数，参考：
https://element-plus.org/zh-CN/component/avatar.html

| 常用参数   | 类型      | 默认值 | 说明                     |
|------------|-----------|--------|--------------------------|
| size       | string    | -      | 尺寸(small/medium/large) |
| shape      | string    | circle | 形状(circle/square)      |
| color      | string    | -      | 颜色                     |


## 样式覆盖
```scss
/* 修改默认尺寸 */
.el-avatar {
  width: 40px;
  height: 40px;
}

/* 调整图标大小 */
.el-avatar > i {
  font-size: 18px;
}
```

## 注意事项
1. 直接使用 Element Plus Avatar 的所有功能
2. 需要手动引入 Element Plus 样式
3. 默认继承所有原生事件
4. 支持全部插槽用法 