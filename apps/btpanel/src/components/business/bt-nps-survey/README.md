# BtNpsSurvey NPS调查组件

## 功能特性
- 📊 10分制NPS评分系统
- 📝 动态问题加载
- 🔍 实时表单验证
- 📤 问卷数据提交
- 🎨 交互式评分样式

## 评分规则
| 评分区间 | 颜色    | 分类       |
|---------|---------|------------|
| 1-6     | 红色    | 贬低者     |
| 7-8     | 橙色    | 被动者     |
| 9-10    | 绿色    | 推荐者     |

## 数据结构
### 参数说明
| 参数名         | 类型      | 必填 | 说明                          |
|---------------|-----------|------|-----------------------------|
| id            | number    | 是   | 唯一问题标识                  |
| hint          | string    | 是   | 输入框下方的提示文字          |
| product_type  | number    | 是   | 关联的产品分类                |
| question      | string    | 是   | 问题正文内容                  |
| required      | number    | 是   | 是否必填项（1-是 0-否）       |
| version       | number    | 是   | 问题版本号用于更新控制        |
| textarea      | boolean   | 是   | 是否启用多行文本输入          |
| isHint        | boolean   | 是   | 控制提示信息的显示状态        |

## 交互事件
| 事件名       | 说明                 | 回调参数       |
|-------------|----------------------|---------------|
| close       | 关闭调查弹窗时触发    | 无            |

## 核心方法
| 方法名            | 说明                 |
|-------------------|----------------------|
| checkScore       | 验证当前评分状态     |
| scoreMouseOver   | 评分区鼠标移入事件    |
| scoreMouseLeave  | 评分区鼠标移出事件    |
| scoreClick       | 评分点击事件         |
| submit          | 提交问卷数据         |

## 最佳实践
```vue
<template>
  <bt-nps-survey @close="handleClose" />
</template>

<script setup>
const handleClose = () => {
  // 处理关闭逻辑
}
</script>
```

## 接口说明
### 提交参数
```typescript
{
  questions: string       // 问题答案(JSON字符串)
  product_type: number    // 产品类型 0:面板
  rate: number           // 评分值
  software_name: string   // 软件名称
}
```

## 样式定制
| CSS类名              | 说明                  |
|----------------------|----------------------|
| nps-survey-banner    | 顶部横幅样式          |
| survey-score-num     | 评分数字容器          |
| small/medium/large   | 不同评分区间样式      |

## 注意事项
1. 依赖`getNpsQuestion`和`writeNpsQuestion`接口
2. 需要预先加载问题配置
3. 评分提交后自动显示感谢弹窗
4. 必填项未填写时阻止提交
5. 文本域输入限制500字符 