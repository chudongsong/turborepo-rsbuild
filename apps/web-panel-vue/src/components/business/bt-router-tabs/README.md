# 路由标签组件

## 功能说明
提供基于 Vue Router 的标签式导航功能，支持动态路由展示和状态管理

## 使用场景
- 多标签页管理界面
- 需要缓存路由视图的场景
- 需要响应式隐藏/显示标签的场景
- 结合权限控制动态展示路由标签

## 组件参数 (Props)
| 参数名         | 类型      | 默认值       | 必填 | 说明                                                                 |
|----------------|-----------|--------------|------|--------------------------------------------------------------------|
| options        | Route[]   | []           | 否   | 路由配置数组，默认使用当前路由的子路由                              |
| store          | Boolean   | true         | 否   | 是否使用 localStorage 存储当前选中标签                            |
| disabled       | Boolean   | false        | 是   | 是否禁用标签切换功能                                               |
| showContent    | Boolean   | true         | 否   | 是否显示路由视图内容                                               |
| contentClass   | String    | 'router-tabs-content' | 否 | 内容区域自定义类名                                                |

## 事件说明
| 事件名   | 说明                 | 回调参数       |
|----------|----------------------|----------------|
| cutTab   | 切换标签时触发       | 当前标签 name |

## 功能特性
- 自动检测路由层级并展示对应标签
- 响应式布局适配（主宽度变化自动调整）
- 支持路由视图过渡动画
- 集成产品状态显示（宽度足够时）
- 支持通过 slot 插入右侧自定义内容

## 路由配置要求
```ts
interface RouteRecordRaw {
  name: string
  meta: {
    title: string
    ignore?: boolean // 是否隐藏标签
  }
  show?: boolean // 是否展示标签（动态控制）
}
```

## 基本使用
```vue
<template>
  <bt-router-tabs v-model="activeTab" @cutTab="handleTabChange">
    <template #right>
      <el-button>自定义操作</el-button>
    </template>
  </bt-router-tabs>
</template>

<script setup>
const activeTab = ref('dashboard')
const handleTabChange = (tabName) => {
  console.log('当前标签:', tabName)
}
</script>
```

## 样式覆盖指南
```css
/* 标签容器 */
.header-tabs {
  background: #fff;
  box-shadow: 0 1px 3px 1px rgba(0,0,0,0.05);
}

/* 激活态标签 */
.active-tab {
  color: #20a53a;
  background: rgba(32, 165, 58, 0.063);
}

/* 内容区域 */
.router-tabs-content {
  background: #fff;
  margin-top: 12px;
  box-shadow: 0 1px 3px 1px rgba(0,0,0,0.05);
}
```

## 注意事项
1. 依赖 vue-router 4.x 版本
2. 需要配合全局状态管理使用（mainWidth/forceLtd）
3. 标签显示状态通过路由配置的 show/meta.ignore 控制
4. 组件卸载时会自动移除 resize 监听
5. 默认使用 localStorage 存储最后选中的标签
6. 二级路由会自动处理标签切换逻辑 