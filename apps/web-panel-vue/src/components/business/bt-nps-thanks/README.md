# NPS 感谢提示组件

## 功能说明
在用户完成 NPS 评分后显示的感谢提示组件，支持自动关闭和自定义显示时长

## 使用场景
- 用户提交 NPS 评分后展示感谢信息
- 需要短暂提示操作成功的场景
- 替代默认 alert 的更友好提示方式

## 组件参数 (Props)
| 参数名       | 类型    | 默认值  | 必填 | 说明                     |
|-------------|---------|--------|------|-------------------------|
| visible     | Boolean | false  | 是   | 控制提示框显示/隐藏      |
| duration    | Number  | 2000   | 否   | 自动关闭延时（毫秒）     |
| message     | String  | 感谢您的评分！ | 否 | 自定义显示的感谢信息     |

## 事件说明 (Events)
| 事件名     | 说明                     | 回调参数 |
|-----------|-------------------------|---------|
| close     | 提示关闭时触发           | 无      |

## 基本使用
```vue
<template>
  <bt-nps-thanks 
    :visible="showThanks" 
    @close="showThanks = false"
  />
</template>

<script>
export default {
  data() {
    return {
      showThanks: false
    }
  }
}
</script>
```

## 高级用法
```vue
<!-- 自定义显示时长和提示内容 -->
<bt-nps-thanks
  :visible="true"
  :duration="3000"
  message="感谢您的宝贵反馈！"
/>

<!-- 监听关闭事件 -->
<bt-nps-thanks
  :visible="showThanks"
  @close="handleClose"
/>
```

## 注意事项
1. 组件需要配合 visible 的双向绑定使用
2. 建议 duration 不要小于 1500 毫秒以保证用户可阅读内容
3. 如需多行显示，可在 message 中使用换行符 \n
4. 组件样式依赖全局基础样式，需确保已引入相关 CSS