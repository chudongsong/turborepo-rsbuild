# 代码编辑器组件

## 功能说明
基于 Ace Editor 封装的代码编辑器组件，支持文件操作、请求数据绑定和双向绑定模式

## 使用场景
- 代码编辑与查看
- 配置文件修改
- 实时代码预览
- 需要语法高亮的文本编辑

## 组件参数 (Props)
| 参数名           | 类型                  | 默认值       | 必填 | 说明                                                                 |
|------------------|-----------------------|--------------|------|--------------------------------------------------------------------|
| modelValue       | string                | ''           | 否   | 双向绑定的编辑器内容                                               |
| isZoom           | boolean               | false        | 否   | 是否全屏显示                                                       |
| isScrollBottom   | boolean               | false        | 否   | 是否自动滚动到底部                                                 |
| filePath         | string                | ''           | 否   | 文件路径（文件模式必填）                                           |
| request          | object                | false        | 否   | 请求配置对象 { get: 获取方法, set: 保存方法 }                      |
| encoding         | string                | 'utf-8'      | 否   | 文件编码格式                                                       |
| autoSave         | boolean               | false        | 否   | 是否开启自动保存                                                   |
| editorOption     | object                | {}           | 否   | Ace Editor 配置项                                                  |

## 事件说明
| 事件名   | 说明                 | 回调参数       |
|----------|----------------------|----------------|
| save     | 保存内容时触发       | 当前编辑器内容 |
| update:modelValue | 内容更新时触发 | 当前编辑器内容 |

## 功能特性
- 支持三种模式：文件模式、请求模式、双向绑定模式
- 自动保存功能（Ctrl+S/Command+S）
- 全屏切换功能
- 语法高亮支持
- 自定义快捷键
- 自动滚动控制

## 使用示例
```vue
<template>
  <bt-editor 
    v-model="content"
    :file-path="/path/to/file"
    :auto-save="true"
    @save="handleSave"
  />
</template>

<script setup>
import { ref } from 'vue'

const content = ref('')
const handleSave = (value) => {
  console.log('保存内容:', value)
}
</script>
```

## 样式覆盖
```scss
/* 调整编辑器容器 */
.ace-editor-content {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

/* 修改全屏按钮样式 */
.icon-zoom {
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
}
```

## 注意事项
1. 需要引入 Ace Editor 资源文件
2. 文件模式需要配置正确的文件路径
3. 请求模式需要提供有效的 get/set 方法
4. 大文件编辑建议关闭自动滚动功能
5. 编码格式需与文件实际编码一致
6. 全屏模式需自行处理父容器样式
7. 复杂配置建议使用 editorOption 参数 