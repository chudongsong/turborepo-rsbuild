# 产品支付组件

## 功能说明
提供完整的软件/插件购买流程，包含产品介绍、版本选择、支付方式选择等功能

## 使用场景
- 软件/插件的购买流程
- 企业版/专业版升级流程
- 需要展示多个产品版本的购买场景
- 需要集成多种支付方式的场景

## 参数说明

### Props

| 参数名   | 类型                     | 默认值                                                                 | 必填 | 说明                                                                 |
|----------|--------------------------|------------------------------------------------------------------------|------|--------------------------------------------------------------------|
| compData | [CompData](#compdata-数据结构) | `{ disablePro: true, sourceId: '27', plugin: true, pluginInfo: {...} }` | 是   | 支付配置对象，控制版本推荐、来源标识和插件配置，完整结构见下方 CompData |

### CompData 数据结构

```ts
interface CompData {
  /** 
   * 是否禁用专业版推荐 
   * @default true
   */
  disablePro: boolean
  
  /** 
   * 来源标识ID（需与运营配置一致）
   * @default '27'
   */
  sourceId: string
  
  /** 
   * 是否为插件类型 
   * @default true
   */
  plugin: boolean
  
  /** 
   * 插件专属配置（当 plugin=true 时必填）
   * @example { title: '安全插件', describe: '专业防护', pid: 2023 }
   */
  pluginInfo: {
    /** 插件展示标题 */
    title: string
    /** 插件功能描述 */
    describe: string
    /** 插件唯一标识ID */
    pid: number
  }
  
  /** 首页气泡配置（可选） */
  isHomeBubble?: {
    /** 是否显示气泡 */
    show?: boolean
    /** 气泡位置 */
    position?: 'left-top' | 'right-bottom'
  }
}
```

## 事件说明

| 事件名 | 说明                 | 回调参数 |
|--------|----------------------|----------|
| close  | 关闭支付弹窗时触发   | 无       |


## 基本使用

```vue
<template>
  <bt-product-payment 
    :compData="paymentConfig" 
    @close="handleClose"
  />
</template>

<script setup>
const paymentConfig = {
  disablePro: false,
  sourceId: '35',
  plugin: true,
  pluginInfo: {
    title: '网站防火墙',
    describe: '专业级Web应用防护',
    pid: 2024
  }
}

const handleClose = () => {
  console.log('支付弹窗已关闭')
}
</script>
```

## 高级用法

```vue
<!-- 带首页气泡配置 -->
<bt-product-payment
  :compData="{
    disablePro: true,
    sourceId: '28',
    plugin: false,
    isHomeBubble: {
      show: true,
      position: 'left-top'
    }
  }"
/>

<!-- 使用默认配置 -->
<bt-product-payment :compData="{}" />
```

## 注意事项

1. **sourceId 配置**：必须与后台运营配置的来源ID一致，否则会影响数据统计
2. **插件类型配置**：当 `plugin=true` 时，必须完整填写 `pluginInfo` 参数
3. **数据清理**：组件卸载时会自动清理 `sessionStorage` 中的 `PAY-VIEW-INFO-TIME` 记录
4. **外部控制**：通过 `expose` 暴露的 `onCancel` 方法可用于外部触发关闭
   ```ts
   // 组件实例使用示例
   const paymentRef = ref()
   paymentRef.value.onCancel()
   ```
5. **主题适配**：通过 `theme-{type}` 类名控制样式，需确保全局样式表中包含对应主题样式
6. **默认值说明**：未传递的字段会自动使用默认配置，建议至少配置 `sourceId` 