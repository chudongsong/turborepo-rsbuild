# 设置分割组件

## 功能说明
提供可折叠的内容区域分割线，用于管理复杂表单的显示层级

## 使用场景
- 设置页面的高级配置区域
- 需要折叠/展开的模块化内容
- 长表单的分组展示控制
- 需要节省页面空间的配置项管理

## 组件参数 (Props)
| 参数名          | 类型      | 默认值  | 必填 | 说明                                                                 |
|-----------------|-----------|---------|------|--------------------------------------------------------------------|
| isShowDivider   | Boolean   | true    | 否   | 是否显示顶部折叠控制栏                                              |
| showConfig      | Boolean   | false   | 否   | 是否展开配置区域，可通过v-model:show-config绑定                      |

## 插槽说明
| 插槽名   | 说明                 |
|----------|----------------------|
| default  | 主内容区域           |
| config   | 折叠区域内容         |

## 基本使用
```vue
<template>
  <bt-setting-divider>
    <template #config>
      <el-form-item label="高级配置">
        <el-input />
      </el-form-item>
    </template>
    
    <!-- 主内容 -->
    <el-form-item label="基础配置">
      <el-input />
    </el-form-item>
  </bt-setting-divider>
</template>
```

## 高级用法
```vue
<!-- 始终显示配置区域 -->
<bt-setting-divider :is-show-divider="false">
  <template #config>
    <advanced-settings />
  </template>
</bt-setting-divider>

<!-- 动态控制折叠状态 -->
<bt-setting-divider v-model:show-config="isExpanded" />
```

## 样式定制
```scss
/* 修改分割线颜色 */
.el-divider {
  border-color: #e4e7ed;
}

/* 调整折叠按钮样式 */
.bt-link {
  color: #20a53a;
  font-size: 0.9rem;
}

/* 配置区域内边距 */
.config-area {
  padding: 1rem;
}
```
## 注意事项
1. 当 isShowDivider=false 时默认展开配置区域
2. 通过 v-model 可控制折叠状态（showConfig）
3. 配置区域使用 v-show 控制显示，保持组件状态
4. 箭头图标使用 svgtofont 字体图标库
5. 组件高度变化可能需要外部容器处理过渡动画 
