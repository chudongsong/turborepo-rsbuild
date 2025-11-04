# useRouterTabs 钩子

## 功能说明
用于管理基于 Vue Router 的标签页导航系统

## 使用场景
- 需要与路由同步的标签页导航
- 动态生成路由标签页
- 需要缓存页面状态的场景
- 嵌套路由的标签页管理

## 参数配置
| 参数名       | 类型       | 默认值    | 说明                     |
|--------------|------------|-----------|--------------------------|
| level        | boolean    | false     | 是否为一级路由（仅支持一级和二级）       |
| contentClass | string     | -         | 内容容器自定义类名       |
| store        | boolean    | true      | 是否保持页面状态         |
| disabled     | boolean    | false     | 是否禁用标签页切换       |

## 返回值
| 属性名        | 类型               | 说明                     |
|---------------|--------------------|--------------------------|
| BtRouterTabs  | 渲染函数           | 路由标签页组件           |

## 核心功能
1. 自动同步当前路由状态
2. 动态生成导航标签
3. 支持路由层级控制
4. 页面状态保持功能
5. 标签页禁用控制

## 使用示例
```typescript
import { useRouterTabs } from '@/hooks/business/router-tabs'

// 初始化钩子
const { BtRouterTabs } = useRouterTabs({
  level: true,
  contentClass: 'custom-tabs-content'
})

// 在组件中渲染
return () => (
  <BtRouterTabs>
    <template #default>
      <router-view />
    </template>
  </BtRouterTabs>
)
```

## 样式定制
```scss
/* 标签页容器 */
.router-tabs-container {
  background: #f5f7fa;
  padding: 0 20px;
  
  /* 激活标签 */
  .is-active {
    color: #20a53a;
    font-weight: 500;
  }
}

/* 内容区域 */
.tabs-content {
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}
```

## 最佳实践
1. 路由配置需包含 `name` 和 `meta.title`
2. 嵌套路由建议使用二级路由
3. 需要缓存的页面使用 `keep-alive`
4. 权限控制通过路由守卫实现
5. 动态路由参数需统一处理

## 注意事项
1. 路由变化会自动更新标签页
2. 页面状态保持需要配置 `store: true`
3. 禁用状态会阻止路由切换
4. 需要合理配置路由层级
5. 移动端需优化标签显示方式 