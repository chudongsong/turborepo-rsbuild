# BtNpsSurveyPassive 被动式用户反馈组件

## 功能特性
- ⏱️ 自动倒计时关闭（15秒）
- 🎚️ 五级评分系统（1-5分）
- 🏷️ 智能标签分类（好评/差评）
- 📝 自定义反馈输入
- 📦 本地存储防打扰机制

## 组件对比
| 特性               | bt-nps-survey-passive | bt-nps-survey-ltd     |
|--------------------|-----------------------|-----------------------|
| 触发机制           | 使用后自动触发         | 手动触发              |
| 评分体系           | 5分制                 | 无评分                |
| 数据维度           | 评分+标签+反馈         | 纯文本反馈            |
| 关闭方式           | 倒计时/手动            | 手动关闭              |
| 适用场景           | 功能使用后反馈         | 企业版专项调研        |

## 参数说明
### Props
| 参数名       | 类型               | 默认值   | 说明                          |
|-------------|-------------------|---------|-----------------------------|
| compData    | Object            | {}      | 包含以下配置项：               |
| - id        | number           |         | 问题唯一标识                  |
| - name      | string           |         | 功能模块名称(中文)            |
| - type      | number           |         | 产品类型标识                  |
| - softName  | string           | panel   | 软件类型(panel/total/btwaf)   |
| - description | string         |         | 问题描述                      |

## 交互事件
| 事件名       | 说明                 | 回调参数       |
|-------------|----------------------|---------------|
| close       | 关闭反馈窗口时触发    | 无            |

## 核心方法
| 方法名            | 说明                 |
|-------------------|----------------------|
| initData          | 初始化标签数据        |
| startInterval     | 启动自动关闭倒计时    |
| handleMouseEnter  | 暂停自动关闭机制      |

## 最佳实践
```vue
<template>
  <bt-nps-survey-passive 
    :comp-data="{
      id: 2023,
      name: '网站监控',
      type: 2,
      softName: 'total'
    }"
    @close="handleFeedbackClose"
  />
</template>
```

## 接口说明
### 提交参数
```typescript
{
  reason_tags: string   // 选中标签ID(逗号分隔)
  questions: string     // 自定义反馈内容(JSON)
  rate: number          // 用户评分(1-5)
  product_type: number  // 产品类型标识
  software_name: string // 软件标识
  phone_back: 0         // 电话回访标识(固定)
}
```

## 样式定制
| CSS类名              | 说明                  |
|----------------------|----------------------|
| rate-tips           | 评分提示气泡样式      |
| active              | 选中标签激活状态      |
| nps-content         | 反馈内容区域容器      |
| time-keeping        | 倒计时显示样式        |

## 注意事项
1. 依赖`getNewNpsTag`接口获取动态标签
2. 自动设置2天免打扰(localStorage)
3. 评分≤3分显示差评标签，否则显示好评标签
4. 提交后统一显示感谢弹窗
5. 鼠标移入暂停自动关闭倒计时 