# 多选框组件

## 功能说明
增强型多选框组件，支持复选框组和按钮组两种样式

## 使用场景
- 多项选择场景
- 选项分组展示
- 需要按钮样式的多选
- 动态选项加载

## 组件参数 (Props)
| 参数名     | 类型               | 默认值       | 必填 | 说明                          |
|------------|--------------------|--------------|------|-----------------------------|
| options    | CheckboxOptionsProps[] | []        | 是   | 选项配置数组                 |
| type       | 'checkbox'\|'button' | 'checkbox' | 否   | 显示类型                     |
| ...其他CheckboxProps | -         | -       | -    | 继承Element Plus CheckboxGroup属性 |

### CheckboxOptionsProps 结构
```ts
interface CheckboxOptionsProps {
  label: string    // 显示文本
  value: string   // 选项值
  disabled?: boolean // 是否禁用
  isHide?: boolean  // 是否隐藏
}
```

## 事件说明
| 事件名       | 说明                 | 回调参数       |
|--------------|----------------------|----------------|
| change       | 值改变时触发         | 当前选中值数组 |

## 基本使用
```vue
<template>
  <!-- 复选框模式 -->
  <bt-checkbox 
    :options="options" 
    v-model="checkedList"
  />
  
  <!-- 按钮模式 -->
  <bt-checkbox
    type="button"
    :options="buttonOptions"
    v-model="buttonChecked"
  />
</template>
```

## 样式覆盖
```scss
/* 修改按钮模式选中样式 */
.el-checkbox-button.is-checked .el-checkbox-button__inner {
  background: #20a53a;
  border-color: #20a53a;
}

/* 调整选项间距 */
.el-checkbox {
  margin-right: 20px;
}
```

## 注意事项
1. options需至少包含label和value字段
2. 动态修改options需重新渲染组件
3. 按钮模式不支持混合样式
4. 隐藏选项(isHide)不会渲染DOM
5. 建议选项数量不超过20个 