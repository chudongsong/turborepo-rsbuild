# 产品预览组件

## 功能说明
用于展示产品基本信息、功能特性及多图预览，集成安装/购买操作入口

## 使用场景
- 软件商店产品详情页
- 插件市场插件详情页
- 需要展示产品核心功能及预览图的场景
- 需要快速操作安装/购买的产品展示页

## 组件参数 (Props)
| 参数名 | 类型 | 默认值 | 必填 | 说明 |
|--------|------|--------|------|-----|
| data | [DataProps](#dataprops-数据结构) | {} | 是 | 产品数据对象，结构见下方 DataProps |

### DataProps 结构
```ts
interface DataProps {
  /** 产品封面图地址 */
  imgSrc?: string
  /** 产品主标题 */
  title: string
  /** 产品副标题/简短描述 */
  ps: string
  /** 产品分类来源ID */
  source: number
  /** 产品功能特性列表 */
  desc: string[]
  /** 
   * 产品预览图集配置，支持两种格式：
   * 1. 对象数组格式: { title: 标签标题, imgSrc: 图片地址 }
   * 2. 字符串数组格式: 直接使用图片地址
   */
  tabImgs: Array<{ title: string; imgSrc: string }> | string[]
  /** 是否已安装 */
  isInstall?: boolean
  /** 产品预览页面地址 */
  productSrc?: string
  /** 插件专属配置 */
  pluginInfo?: {
    /** 插件名称 */
    name?: string
    /** 插件类型 */
    type?: string
  }
}
```

## 事件说明
组件内部处理所有交互逻辑，暂不对外暴露事件

## 基本使用
```vue
<template>
  <bt-product-preview :data="productData" />
</template>

<script setup>
const productData = {
  title: '网站监控报表',
  ps: '实时监控网站访问数据',
  source: 36,
  desc: [
    '实时流量统计',
    '访问来源分析',
    '异常访问警报',
    '多站点支持'
  ],
  tabImgs: [
    { title: '数据面板', imgSrc: '/preview/stats.png' },
    { title: '报警设置', imgSrc: '/preview/alert.png' }
  ],
  productSrc: '/demo/monitor'
}
</script>
```

## 高级用法
```vue
<!-- 已安装状态 -->
<bt-product-preview 
  :data="{
    ...productData,
    isInstall: true
  }"
/>

<!-- 简单图片模式 -->
<bt-product-preview 
  :data="{
    ...productData,
    tabImgs: ['/preview/1.jpg', '/preview/2.jpg']
  }"
/>
```

## 注意事项
1. 当 source=54 时会隐藏分隔线
2. 安装操作需要确保 pluginInfo 包含有效的 name 和 type
3. 产品预览需要提供有效的 productSrc 链接
4. 图片区域最大高度限制为 112rem，超过会出现滚动条
5. 按钮状态根据 isInstall 自动切换（安装/购买） 