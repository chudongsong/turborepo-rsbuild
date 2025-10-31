# 单选框组件

## 功能说明
增强型单选框组件，支持按钮组和普通单选框两种样式

## 使用场景
- 单选表单场景
- 需要按钮样式的单选
- 选项分组展示
- 动态选项加载

## 组件参数 (Props)
| 参数名     | 类型               | 默认值       | 必填 | 说明                          |
|------------|--------------------|--------------|------|-----------------------------|
| options    | RadioOptionsProps[] | []        | 是   | 选项配置数组                 |
| type       | 'radio'\|'button'  | 'radio'     | 否   | 显示类型                     |
| ...其他RadioGroupProps | -         | -       | -    | 继承Element Plus RadioGroup属性 |

### RadioOptionsProps 结构
```ts
interface RadioOptionsProps {
  label: string    // 显示文本
  value: any       // 选项值
  disabled?: boolean // 是否禁用
  isHide?: boolean  // 是否隐藏
}
```

## 事件说明
| 事件名       | 说明                 | 回调参数       |
|--------------|----------------------|----------------|
| change       | 值改变时触发         | 当前选中值     |

## 基本使用
```vue
<template>
  <!-- 普通模式 -->
  <bt-radio 
    :options="options" 
    v-model="selected"
  />
  
  <!-- 按钮模式 -->
  <bt-radio
    type="button"
    :options="buttonOptions"
    v-model="buttonSelected"
  />
</template>
```

## 样式覆盖
```scss
/* 修改按钮模式选中样式 */
.el-radio-button.is-active .el-radio-button__inner {
  background: #20a53a;
  border-color: #20a53a;
}

/* 调整选项间距 */
.el-radio {
  margin-right: 20px;
}
```

## 注意事项
1. options需至少包含label和value字段
2. 动态修改options需重新渲染组件
3. 按钮模式不支持混合样式
4. 隐藏选项(isHide)不会渲染DOM
5. 建议选项数量不超过10个 