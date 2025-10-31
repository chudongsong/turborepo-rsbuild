# 徽标组件

## 功能说明
基于 Element Plus 的 Badge 组件二次封装，保持原有功能特性

## 使用场景
- 消息通知计数
- 状态标记
- 新功能提示
- 数据更新标识

## 组件参数 (Props)
完整继承 Element Plus Badge 组件参数，参考：
https://element-plus.org/zh-CN/component/badge.html

| 常用参数   | 类型      | 默认值 | 说明                     |
|------------|-----------|--------|--------------------------|
| value      | string/number | -    | 显示值                   |
| max        | number    | 99     | 最大值(超过显示为max+)    |
| is-dot     | boolean   | false  | 是否显示小圆点           |
| hidden     | boolean   | false  | 是否隐藏徽标             |
| type       | string    | danger | 类型(danger/warning等)   |

## 样式覆盖
```scss
/* 修改徽标背景色 */
.el-badge__content {
  background: #20a53a;
}

/* 调整小圆点尺寸 */
.el-badge__content.is-dot {
  width: 8px;
  height: 8px;
}
```

## 注意事项
1. 支持动态内容更新
2. 数字超过max时显示为max+
3. 独立定位需外层容器设置position
4. 隐藏时仍占位需设置hidden 