# 输入框组件

## 功能说明
增强型输入框组件，支持前后缀和单位显示

## 使用场景
- 普通文本输入
- 带前后缀的输入
- 需要单位显示的输入
- 复合型输入框

## 组件参数 (Props)
完整继承 Element Plus Input 组件参数，参考：
https://element-plus.org/zh-CN/component/input.html

| 参数名       | 类型               | 默认值    | 说明                     |
|--------------|--------------------|-----------|--------------------------|
| width        | string\|number    | '100%'    | 输入框宽度               |
| textType     | string            | ''        | 后缀文本类型             |
| prependText  | string            | ''        | 前置文本                 |
| modelValue   | string\|number    | ''        | 绑定值                   |
| ...其他InputProps | -         | -       | 继承Element Plus Input属性 |

## 事件说明
| 事件名       | 说明                 | 回调参数       |
|--------------|----------------------|----------------|
| input        | 输入时触发           | 当前值         |
| change       | 值改变时触发         | 当前值         |
| keyup        | 按键抬起时触发       | KeyboardEvent  |

## 基本使用
```vue
<template>
  <!-- 带单位输入 -->
  <bt-input v-model="price" unit="元" />
  
  <!-- 带前后缀输入 -->
  <bt-input
    v-model="url"
    prepend-text="https://"
    append-text=".com"
  />
</template>
```

## 样式覆盖
```scss
/* 修改前置背景色 */
.el-input-group__prepend {
  background-color: #f5f7fa;
}

/* 调整单位颜色 */
.bt-input-unit {
  color: #20a53a;
}
```

## 注意事项
1. 单位显示需使用unit插槽
2. 动态修改宽度需响应式更新
3. 复合输入框需合理设置前后缀
4. 需要格式化输入可使用formatter
5. 移动端建议禁用输入法首字母大写 