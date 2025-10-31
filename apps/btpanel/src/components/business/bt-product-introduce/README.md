# 产品介绍组件

## 功能说明
用于展示软件/插件产品的详细介绍，包含产品预览、安装/购买操作、功能特性说明和图文展示

## 使用场景
- 软件商店产品详情页
- 插件市场插件详情展示
- 需要展示多图预览的产品介绍页面
- 包含安装/购买操作的产品展示场景

## 参数说明

### Props

| 参数名 | 类型               | 默认值 | 必填 | 说明                                                                 |
|--------|--------------------|--------|------|--------------------------------------------------------------------|
| data   | [DataProps](#dataprops-数据结构) | {}     | 是   | 产品数据对象，包含产品基本信息、状态和展示内容，完整结构见下方 DataProps |

### DataProps 数据结构

```ts
interface DataProps {
  /** 产品名称 */
  name?: string
  /** 产品封面图 URL 地址 */
  imgSrc?: string
  /** 产品主标题 */
  title: string
  /** 产品副标题/简短描述 */
  ps: string
  /** 产品分类来源 ID */
  source: number
  /** 产品功能特性列表（支持 HTML 换行） */
  desc: string[]
  /** 
   * 产品预览图集配置，支持两种格式：
   * 1. 对象数组格式: { title: 标签标题, imgSrc: 图片地址 }
   * 2. 字符串数组格式: 直接使用图片地址 
   */
  tabImgs: Array<{ title: string; imgSrc: string }> | string[]
  /** 是否已安装（用于控制安装按钮状态） */
  isInstall?: boolean
  /** 产品预览页面 URL 地址 */
  productSrc?: string
  /** 插件专属配置（当产品为插件时使用） */
  pluginInfo?: {
    /** 是否已完成初始设置 */
    setup?: boolean
    /** 插件到期时间（时间戳格式） */
    endtime?: number
    /** 插件名称 */
    name?: string
  }
}
```

## 事件说明
组件内部处理所有交互逻辑，暂不对外暴露事件

## 基本使用
```vue
<template>
  <bt-product-introduce :data="productData" />
</template>

<script setup>
const productData = {
  title: 'MySQL管理工具',
  ps: '专业的数据库管理解决方案',
  source: 54,
  desc: [
    '可视化数据库管理',
    '支持多版本MySQL',
    '一键备份/恢复',
    '实时性能监控'
  ],
  tabImgs: [
    { title: '界面预览', imgSrc: '/preview/1.png' },
    { title: '功能演示', imgSrc: '/preview/2.png' }
  ],
  productSrc: 'https://demo.bt.cn/mysql'
}
</script>
```

## 高级用法
```vue
<!-- 带安装状态的用法 -->
<bt-product-introduce 
  :data="{
    ...productData,
    isInstall: true,
    pluginInfo: {
      setup: false,
      endtime: 1735660800
    }
  }"
/>

<!-- 简单图片模式 -->
<bt-product-introduce 
  :data="{
    ...productData,
    tabImgs: ['/preview/1.png', '/preview/2.png']
  }"
/>
```

## 注意事项
1. tabImgs 支持两种格式：对象数组（带标题）或直接图片地址数组
2. 当 source=54 时会隐藏分隔线
3. 插件安装需要确保传入正确的 pluginInfo.name
4. 产品预览需要提供有效的 productSrc 链接
5. 图片区域最大高度限制为 112rem，超过会出现滚动条 