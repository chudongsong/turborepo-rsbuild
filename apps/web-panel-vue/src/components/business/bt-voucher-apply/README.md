# 优惠券领取组件

## 功能说明
提供优惠券领取入口及倒计时管理功能

## 使用场景
- 支付页面优惠提示
- 用户中心优惠券入口
- 活动促销通知展示
- 需要延迟加载优惠信息的场景

## 组件参数 (Props)
本组件为状态展示组件，无需传入参数

## 功能特性
- 自动延迟加载优惠信息（3秒后）
- 7天免打扰功能
- 动态数量展示
- 集成领取弹窗
- 会话存储状态管理

## 使用示例
```vue
<template>
  <bt-voucher-apply />
</template>
```

## 数据结构
```ts
interface VoucherItem {
  id: string
  title: string
  amount: number      // 优惠金额
  condition: string   // 使用条件
  expireTime: string  // 过期时间
}
```

## 样式定制
```scss
/* 修改背景颜色 */
.recom-bg {
  background: #FFF3E0;
}

/* 调整提示文字颜色 */
.text-[#ef9f00] {
  color: #ef9f00;
}

/* 自定义箭头样式 */
.icon-end-time::after {
  border-left-color: #FFF3E0;
}
```

## 注意事项
1. 依赖 sessionStorage 存储关闭时间
2. 需要支付中心接口支持
3. 自动请求延迟为3秒
4. 优惠券数据通过全局状态管理
5. 关闭后7天内不再显示
6. 图标路径为 '/static/images/vip/voucher-icon.svg' 