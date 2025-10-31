# 表格列管理组件

## 功能说明
表格列显示控制组件，支持动态配置可见列并持久化存储

## 使用场景
- 需要自定义显示列的表格
- 多列数据展示控制
- 用户偏好列配置存储

## 组件参数 (Props)
| 参数名 | 类型                  | 默认值          | 必填 | 说明                                                                 |
|--------|-----------------------|-----------------|------|--------------------------------------------------------------------|
| name   | string                | 'bt-table-column' | 否  | 存储标识名称（用于localStorage）                                   |
| column | [TableColumnProps[]](#tablecolumnprops-结构) | []              | 是   | 列配置数组                                                         |

### TableColumnProps 结构
```ts
interface TableColumnProps {
  type?: string         // 列类型（'selection'|'toping'|'notControl'|'CheckBox' 等特殊列会被过滤）
  label: string         // 列显示名称
  subtitle?: string     // 副标题（当label为空时使用）
  isCustom?: boolean    // 是否显示该列
  isLtd?: boolean       // 是否显示LTD标识
  showClick?: (val: boolean) => void // 显示状态改变回调
}
```

## 事件说明
| 事件名 | 说明                 | 回调参数               |
|--------|----------------------|------------------------|
| change | 列配置改变时触发     | 新的列配置数组         |

## 功能特性
- 列显示状态持久化存储
- 自动排除特殊类型列
- LTD标识支持
- 响应式配置更新
- 本地存储自动同步

## 使用示例
```vue
<template>
  <bt-table-column 
    name="user-table"
    :column="tableColumns"
    @change="handleColumnChange"
  />
</template>

<script setup>
const tableColumns = ref([
  { label: '用户名', isCustom: true },
  { label: '邮箱', isCustom: false, isLtd: true }
])
</script>
```

## 样式覆盖
```scss
/* 调整下拉菜单样式 */
.custom-col-list {
  max-height: 400px;
  overflow-y: auto;
}

/* 自定义复选框样式 */
:deep(.el-checkbox__label) {
  color: #20a53a;
}

/* 调整设置按钮大小 */
.el-button {
  padding: 8px 12px;
}
```

## 注意事项
1. 依赖localStorage进行配置存储
2. 列配置需包含isCustom属性用于控制显示
3. 以下类型列不会渲染：
   - selection（选择列）
   - toping（置顶列）
   - notControl（不可控列）
   - CheckBox（复选框列）
4. 建议在表格初始化时加载存储的配置
5. 需要处理跨页签的存储冲突
6. 大数据量列配置需做性能优化 