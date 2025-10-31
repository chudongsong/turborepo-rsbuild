# 产品状态组件

## 功能说明
展示产品授权状态及剩余时间，提供续费/升级操作入口

## 使用场景
- 导航栏产品授权状态展示
- 首页产品状态快速查看
- 需要提醒用户续费的场景
- 专业版/企业版功能入口

## 组件参数 (Props)
| 参数名    | 类型    | 默认值  | 必填 | 说明                          |
|-----------|---------|---------|------|-----------------------------|
| disablePro | Boolean | false   | 否   | 是否禁用专业版推荐            |
| isHome    | Boolean | false   | 否   | 是否为首页展示模式            |

## 事件说明
组件内部处理所有交互逻辑，暂不对外暴露事件

## 基本使用
```vue
<template>
  <bt-product-state />
</template>

<script setup>
// 默认展示当前产品授权状态
</script>
```

## 高级用法
```vue
<!-- 首页展示模式 -->
<bt-product-state is-home />

<!-- 禁用专业版推荐 -->
<bt-product-state :disable-pro="true" />
```

## 状态显示规则
| 授权类型 | 显示内容                     | 操作按钮       |
|----------|----------------------------|---------------|
| 免费版   | "安全、高效、让您更安心"    | "立即体验"     |
| 专业版   | 到期时间 + 续费链接         | -             |
| 企业版   | 到期时间 + 续费链接         | -             |

## 样式说明
```css
/* 授权状态容器 */
.recom-bg {
  background: #FEF7EB;
  border-radius: 0.4rem;
}

/* 体验按钮样式 */
.recom-btn {
  background: #ef9f00;
  color: white;
  border-radius: 0.2rem;
  transition: background 0.3s;
}

/* 图标基础样式 */
.icon-end-time {
  background-size: 6.4rem;
  cursor: pointer;
}
```

## 注意事项
1. 依赖全局状态管理中的授权信息（authRemainingDays/authExpirationTime）
2. 续费弹窗配置根据当前授权类型自动适配
3. 首页模式(isHome=true)下显示简化版状态
4. 专业版推荐可通过 disablePro 属性控制
5. 图标资源路径为 `/static/images/vip/` 需确保资源存在 