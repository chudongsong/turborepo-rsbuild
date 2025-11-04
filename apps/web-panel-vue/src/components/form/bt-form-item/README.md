# 表单项组件

## 功能说明
基于 Element Plus FormItem 的二次封装组件，用于表单校验和布局控制

## 使用场景
- 表单字段校验
- 表单布局管理
- 必填项标识
- 错误提示展示

## 组件参数 (Props)
完整继承 Element Plus FormItem 组件参数，参考：
https://element-plus.org/zh-CN/component/form.html#formitem-属性

| 常用参数     | 类型       | 默认值    | 说明                     |
|--------------|------------|-----------|--------------------------|
| prop         | string     | -         | 表单校验字段名           |
| label        | string     | -         | 标签文本                 |
| required     | boolean    | false     | 是否必填                 |
| rules        | object     | -         | 校验规则                 |
| labelWidth   | string     | -         | 标签宽度                 |
| error        | string     | -         | 自定义错误信息           |

## 事件说明
本组件无独立事件，继承Element Plus FormItem事件

## 基本使用
```vue
<template>
  <bt-form-item label="用户名" prop="username" :rules="[{ required: true }]">
    <el-input v-model="form.username" />
  </bt-form-item>
</template>
```

## 样式覆盖
```scss
/* 修改必填星号颜色 */
.el-form-item.is-required .el-form-item__label::before {
  color: #f56c6c;
}

/* 调整错误提示位置 */
.el-form-item__error {
  padding-top: 4px;
}
```

## 注意事项
1. 需要包裹在bt-form组件内使用
2. prop属性需与表单数据字段对应
3. 复杂校验建议使用async-validator
4. 动态规则变化需重新校验
5. 多个校验规则按数组顺序执行 