# ECharts 图表组件

## 功能说明
基于 Apache ECharts 封装的 Vue 图表组件，支持响应式布局和动态配置更新

## 使用场景
- 数据可视化展示
- 动态图表更新需求
- 需要响应式布局的图表
- 复杂图表交互场景

## 组件参数 (Props)
| 参数名   | 类型                  | 默认值       | 必填 | 说明                                                                 |
|----------|-----------------------|--------------|------|--------------------------------------------------------------------|
| width    | string                | '100%'       | 否   | 图表容器宽度，支持 CSS 单位                                         |
| height   | string                | '100%'       | 否   | 图表容器高度，支持 CSS 单位                                         |
| options  | ECOption              | -            | 是   | ECharts 配置项，类型参考 [ECOption](#ecoption-类型说明)            |

### ECOption 类型说明
```ts
type ECOption = echarts.ComposeOption<
  LineSeriesOption | 
  TooltipComponentOption | 
  GridComponentOption | 
  DataZoomComponentOption | 
  GraphicComponentOption | 
  PieSeriesOption
>
```

## 暴露方法
| 方法名  | 说明                 | 参数       |
|---------|----------------------|------------|
| chart   | ECharts 实例         | -          |
| resize  | 手动调整图表尺寸     | -          |

## 功能特性
- 自动响应窗口大小变化
- 动态配置更新
- 支持 Canvas/SVG 渲染
- 按需引入 ECharts 组件
- 内存优化处理

## 使用示例
```vue
<template>
  <bt-echart 
    :options="chartOptions" 
    width="800px"
    height="600px"
    theme="dark"
    @chart-ready="handleChartReady"
  />
</template>

<script setup>
import { ref } from 'vue'

const chartOptions = ref({
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed'] },
  yAxis: { type: 'value' },
  series: [{ data: [120, 200, 150], type: 'line' }]
})

const handleChartReady = (chart) => {
  // Handle chart ready event
}
</script>
```

## 样式覆盖
```scss
/* 调整图表容器间距 */
.echarts-container {
  padding: 1rem;
  background: #f8f9fa;
}

/* 修改提示框样式 */
.echarts-tooltip {
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
```

## 注意事项
1. 需安装 ECharts 核心库及类型定义
2. 按需引入需要的图表组件
3. 复杂图表建议使用 debounce 处理 resize 事件
4. 大数据量建议使用 Canvas 渲染模式
5. 动态更新 options 需保持引用地址变化
6. 服务端渲染需特殊处理
7. 地图数据需额外注册 