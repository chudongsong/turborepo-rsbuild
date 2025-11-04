# 表格分类管理组件

## 功能说明
集成分类管理的表格筛选组件，支持分类的增删改查操作

## 使用场景
- 需要分类管理的表格筛选
- 动态分类配置场景
- 多维度数据分类展示

## 组件参数 (Props)
| 参数名    | 类型                | 默认值              | 必填 | 说明                                                                 |
|-----------|---------------------|---------------------|------|--------------------------------------------------------------------|
| name      | string              | 'bt-table-type'     | 否   | 分类管理名称                                                       |
| size      | 'default' \| 'small' | 'default'           | 否   | 组件尺寸                                                           |
| options   | [SelectOptionProps[]](#selectoptionprops-结构) | [{label: '全部分类', value: 'all'}] | 否 | 分类选项配置                                                       |
| ignore    | string[]            | []                  | 否   | 需要忽略的分类项                                                   |
| config    | [TableClassProps](#tableclassprops-结构)     | 基础配置对象        | 否   | 分类管理操作配置                                                   |
| field     | string              | 'ps'                | 否   | 请求字段名称                                                       |
| showEdit  | boolean             | true                | 否   | 是否显示编辑功能                                                   |

### TableClassProps 结构
```ts
interface TableClassProps {
  getClassList: () => Promise<any>  // 获取分类列表
  addClass: (data: any) => Promise<any>    // 新增分类
  editClass: (data: any) => Promise<any>   // 编辑分类
  deleteClass: (id: string) => Promise<any> // 删除分类
  field?: string  // 请求字段名
}
```

### SelectOptionProps 结构
```ts
interface SelectOptionProps {
  label: string
  value: string | number
  disabled?: boolean
}
```

## 事件说明
| 事件名         | 说明                 | 回调参数               |
|----------------|----------------------|------------------------|
| change         | 分类改变时触发       | 当前选中值             |
| update:options | 分类选项更新时触发   | 新的分类选项数组       |

## 方法说明
| 方法名          | 说明                 | 参数       |
|-----------------|----------------------|------------|
| setClassManage  | 打开分类管理对话框   | 无         |

## 功能特性
- 动态分类管理
- 响应式尺寸适配
- 分类状态可视化
- 操作确认机制
- 自动选项更新

## 使用示例
```vue
<template>
  <bt-table-class 
    v-model="selectedClass"
    :config="classConfig"
    @change="handleClassChange"
  />
</template>

<script setup>
const classConfig = {
  getClassList: async () => {/* 获取分类 */},
  addClass: async (data) => {/* 添加分类 */},
  editClass: async (data) => {/* 编辑分类 */},
  deleteClass: async (id) => {/* 删除分类 */}
}
</script>
```

## 样式覆盖
```scss
/* 修改选中状态样式 */
.select-active :deep(.el-select__wrapper) {
  background-color: #f0f9eb;
  border-color: #20a53a;
}

/* 调整下拉菜单宽度 */
:deep(.el-select-dropdown) {
  min-width: 240px !important;
}
```

## 注意事项
1. 需要配合useDialog钩子使用
2. 分类管理对话框需单独实现
3. 分类数据需包含id/name字段
4. 大数据量需做分页处理
5. 分类名称需保持唯一
6. 删除操作需二次确认
7. 建议分类数量不超过100个 