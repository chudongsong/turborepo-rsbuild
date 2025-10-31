# 标签页组件

## 功能说明
增强型标签页组件，支持多种样式和动态内容加载

## 使用场景
- 内容分类展示
- 需要缓存标签页内容的场景
- 动态添加/删除标签页
- 需要左右布局的标签页

## 组件参数 (Props)
| 参数名       | 类型               | 默认值    | 说明                     |
|--------------|--------------------|-----------|--------------------------|
| modelValue   | string             | ''        | 当前激活的标签页name     |
| type         | 'card'\|'bg-card'\|'left-bg-card' | 'card' | 样式类型 |
| options      | TabsOptionsProps[] | []        | 标签页配置数组           |

### TabsOptionsProps 结构
```ts
interface TabsOptionsProps {
  name: string        // 唯一标识
  label: string       // 标签标题
  disabled?: boolean  // 是否禁用
  closable?: boolean  // 是否可关闭
  lazy?: boolean      // 是否延迟渲染
  render: Component | () => Promise<Component> // 内容组件
}
```

## 事件说明
| 事件名       | 说明                 | 回调参数       |
|--------------|----------------------|----------------|
| change       | 切换标签时触发       | 当前标签name   |
| tab-click    | 点击标签时触发       | 标签实例       |

## 基本使用
```vue
<template>
  <bt-tabs 
    v-model="activeTab"
    type="bg-card"
    :options="tabsOptions"
  />
</template>
```

## 样式覆盖
```scss
/* 修改激活标签背景色 */
.el-tabs__item.is-active {
  background-color: #20a53a;
}

/* 调整左右布局宽度 */
.tabs-left-bg-card .el-tabs__header {
  width: 200px;
}
```

## 注意事项
1. 动态更新options需重新渲染
2. 延迟渲染需设置lazy为true
3. 组件销毁需手动清理缓存
4. 建议为每个标签页设置唯一name
5. 复杂内容建议使用异步组件 