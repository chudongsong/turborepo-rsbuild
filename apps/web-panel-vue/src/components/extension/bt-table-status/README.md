# 状态显示组件

## 功能说明
表格状态显示组件，支持布尔值和数字类型的状态展示，可配置图标显示

## 使用场景
- 表格中状态列的展示
- 需要状态图标联动的场景
- 布尔/数字状态映射显示

## 组件参数 (Props)
| 参数名       | 类型               | 默认值          | 必填 | 说明                                                                 |
|--------------|--------------------|-----------------|------|--------------------------------------------------------------------|
| modelValue   | boolean \| number  | true           | 是   | 当前状态值（支持v-model双向绑定）                                  |
| data         | string[]           | ['未启动', '运行中'] | 否 | 状态文本映射数组（索引对应状态值）                                |
| isIcon       | boolean            | true           | 否   | 是否显示状态图标                                                  |

## 功能特性
- 自动状态文本映射
- 状态颜色自动切换
- 可配置图标显示
- 响应式状态更新
- 支持数字/布尔类型
- 无障碍颜色对比

## 使用示例
```vue
<template>
  <!-- 布尔类型状态 -->
  <bt-table-status v-model="row.status" />
  
  <!-- 数字类型状态 -->
  <bt-table-status 
    v-model="row.state"
    :data="['待处理', '进行中', '已完成']"
  />
</template>
```

## 样式覆盖
```scss
/* 修改状态文本颜色 */
.bt-link {
  color: #20a53a;  // 激活状态颜色
}

.bt-danger {
  color: #f56c6c;  // 非激活状态颜色
}

/* 调整图标大小 */
.svgtofont-icon {
  font-size: var(--el-font-size-base);
  vertical-align: -2px;
}

/* 自定义状态容器 */
[class^="bt-"] {
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
}
```

## 注意事项
1. data数组长度需匹配状态值范围
2. 数字类型状态值不能超过data索引范围
3. 图标名称需与状态值对应（start/stop）
4. 颜色样式通过bt-link/bt-danger类控制
5. 建议状态值不超过3种
6. 需要扩展状态类型时可使用枚举
7. 确保状态文本简洁（建议2-4字） 