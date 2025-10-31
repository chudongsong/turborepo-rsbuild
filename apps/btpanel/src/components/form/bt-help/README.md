# 帮助提示组件

## 功能说明
用于展示表单字段的帮助信息和说明内容

## 使用场景
- 表单字段说明
- 输入提示信息
- 校验规则说明
- 需要HTML内容展示的帮助信息

## 组件参数 (Props)
| 参数名       | 类型               | 默认值    | 说明                     |
|--------------|--------------------|-----------|--------------------------|
| options      | Array<[HelpOption](#helpoption-结构)> | []        | 帮助内容配置数组         |
| listStyle    | 'none'\|'disc'\|'circle'\|'square' | 'disc' | 列表样式 |

### HelpOption 结构
```ts
interface HelpOption {
  content: string | Component // 内容(支持HTML/组件)
  isHtml?: boolean            // 是否HTML内容
  class?: string               // 自定义类名
}
```

## 基本使用
```vue
<template>
  <bt-help
    :options="[
      { content: '请输入6-20位字符', class: 'text-sm' },
      { content: '<b>包含字母和数字</b>', isHtml: true }
    ]"
  />
</template>
```

## 样式覆盖
```scss
/* 修改列表符号颜色 */
.bt-help ul {
  color: #20a53a;
}

/* 调整行高 */
.bt-help li {
  line-height: 1.8;
}
```

## 注意事项
1. HTML内容需设置isHtml为true
2. 动态内容需使用响应式数据
3. 组件内容需注意XSS防护
4. 复杂内容建议使用插槽
5. 列表样式可通过list-style全局配置 