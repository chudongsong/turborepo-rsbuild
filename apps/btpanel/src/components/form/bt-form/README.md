# 表单组件

## 功能说明
基于 Element Plus Form 的二次封装组件，提供表单校验和布局功能

## 使用场景
- 数据收集场景
- 复杂表单校验
- 需要响应式布局的表单
- 多步骤表单容器

## 组件参数 (Props)
完整继承 Element Plus Form 组件参数，参考：
https://element-plus.org/zh-CN/component/form.html#form-属性

| 常用参数     | 类型       | 默认值    | 说明                     |
|--------------|------------|-----------|--------------------------|
| model        | object     | -         | 表单数据对象             |
| rules        | object     | -         | 表单校验规则             |
| labelWidth   | string     | '80px'    | 表单标签宽度             |
| labelPosition| string     | 'right'   | 标签位置(right/left/top) |
| size         | string     | -         | 表单尺寸(medium/small/mini) |

## 方法说明
| 方法名        | 说明                 | 参数       |
|--------------|----------------------|------------|
| validate     | 表单整体校验         | callback   |
| resetFields  | 重置表单             | -          |
| clearValidate| 清除校验结果         | -          |

## 基本使用
```vue
<template>
  <bt-form :model="form" :rules="rules" ref="formRef">
    <!-- 表单项 -->
  </bt-form>
</template>
```

## 样式覆盖
```scss
/* 修改表单标签颜色 */
.el-form-item__label {
  color: #606266;
}

/* 调整表单间距 */
.el-form-item {
  margin-bottom: 22px;
}
```

## 注意事项
1. 需要配合bt-form-item使用
2. 动态修改rules需调用clearValidate
3. 复杂表单建议拆分多个form组件
4. 超大表单建议使用虚拟滚动优化
5. 移动端建议使用labelPosition="top" 