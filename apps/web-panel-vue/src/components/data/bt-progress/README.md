# 进度条组件

## 功能说明
基于 Element Plus 的 Progress 组件二次封装，保持原有功能特性

## 使用场景
- 任务进度展示
- 上传/下载进度
- 资源使用情况
- 数据加载状态

## 组件参数 (Props)
完整继承 Element Plus Progress 组件参数，参考：
https://element-plus.org/zh-CN/component/progress.html

| 常用参数   | 类型      | 默认值 | 说明                     |
|------------|-----------|--------|--------------------------|
| percentage | number    | 0      | 进度百分比(0-100)        |
| type       | string    | line   | 类型(line/circle/dashboard) |
| status     | string    | -      | 状态(success/exception/warning) |
| stroke-width | number | 6     | 进度条宽度               |

## 样式覆盖
```scss
/* 修改进度条颜色 */
.el-progress-bar__inner {
  background-color: #20a53a;
}

/* 调整环形进度条尺寸 */
.el-progress-circle {
  width: 120px;
  height: 120px;
}
```

## 注意事项
1. 环形进度条需设置width/height
2. dashboard类型需要指定stroke-width
3. 状态颜色可自定义覆盖
4. 支持动态更新百分比 