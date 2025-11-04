# 评分组件

## 功能说明
基于 Element Plus Rate 的二次封装组件，提供评分功能

## 使用场景
- 商品/服务评分
- 满意度评价
- 需要半星评分的场景
- 只读模式显示评分

## 组件参数 (Props)
完整继承 Element Plus Rate 组件参数，参考：
https://element-plus.org/zh-CN/component/rate.html

| 常用参数     | 类型       | 默认值    | 说明                     |
|--------------|------------|-----------|--------------------------|
| v-model      | number     | 0         | 绑定值                   |
| max          | number     | 5         | 最大分值                 |
| allowHalf    | boolean    | false     | 是否允许半选             |
| disabled     | boolean    | false     | 是否禁用                 |
| showText     | boolean    | false     | 是否显示辅助文字         |

## 事件说明
| 事件名       | 说明                 | 回调参数       |
|--------------|----------------------|----------------|
| change       | 值改变时触发         | 当前评分值     |

## 基本使用
```vue
<template>
  <bt-rate
    v-model="rating"
    :max="10"
    allow-half
    show-text
  />
</template>
```

## 样式覆盖
```scss
/* 修改激活星颜色 */
.el-rate__item .el-icon {
  color: #20a53a;
}

/* 调整星大小 */
.el-rate__icon {
  font-size: 24px;
}
```

## 注意事项
1. 半星需设置allowHalf为true
2. 只读模式需设置disabled为true
3. 自定义图标需使用icon-component
4. 移动端建议增大点击区域
5. 辅助文字需通过texts参数配置 