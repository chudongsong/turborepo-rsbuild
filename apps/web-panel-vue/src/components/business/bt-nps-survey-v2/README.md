# BtNpsSurveyV2 增强版用户反馈组件

## 功能特性
- 🎚️ 动态评分提示气泡
- 📝 智能行业分类输入
- 📱 企业版用户回访机制
- 🏷️ 多维度标签选择
- 📦 本地存储防重复提交

## 组件对比
| 特性               | bt-nps-survey-v2     | bt-nps-survey         |
|--------------------|----------------------|-----------------------|
| 评分交互           | 动态气泡提示          | 静态评分              |
| 行业分类           | 智能行业选择器        | 无                    |
| 企业版功能         | 支持电话回访          | 无                    |
| 输入方式           | 智能提示+标签选择      | 纯文本输入            |
| 数据验证           | 实时表单验证          | 提交时验证            |

## 参数说明
### Props
| 参数名       | 类型      | 必填 | 默认值   | 说明              |
|-------------|-----------|------|---------|-------------------|
| compData    | object    | 是   | -       | 包含以下配置项：   |
| - id        | number    | 是   | -       | 问题唯一标识      |
| - name      | string    | 是   | -       | 功能模块名称      |
| - type      | number    | 是   | -       | 产品类型ID        |
| - softName  | string    | 否   | panel   | 软件标识          |
| - isNoRate  | boolean   | 否   | false   | 是否隐藏评分      |
| - isCard    | boolean   | 否   | true    | 显示行业分类      |


## 最佳实践
```vue
<template>
  <bt-nps-survey-v2 
    :comp-data="{
      id: 3001,
      name: '安全巡检',
      type: 5,
      softName: 'btwaf',
      isCard: false
    }"
    @close="handleClose"
  />
</template>
```

## 接口说明
### 提交参数
```typescript
{
  questions: string       // 反馈内容(JSON字符串)
  product_type: number    // 产品类型标识
  software_name: string   // 软件标识
  rate: number            // 用户评分(1-5)
  reason_tags: string     // 行业标签(逗号分隔)
  phone_back: string      // 回访联系方式
}
```

## 异常处理
| 错误场景               | 处理方式                     |
|-----------------------|----------------------------|
| 必填项未填             | 红色边框+震动反馈           |
| 联系方式格式错误       | 实时验证提示                |
| 提交失败               | 自动重试(最多3次)          |
| 网络中断               | 本地草稿保存                |
