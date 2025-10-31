/*
 * @Descripttion: 图表
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import * as echarts from 'echarts/core'
import { BarChart, LineChart, LineSeriesOption, PieChart, PieSeriesOption, MapChart } from 'echarts/charts'
import {
	TooltipComponent,
	TooltipComponentOption,
	GridComponent,
	GridComponentOption,
	DataZoomComponent,
	DataZoomComponentOption,
	DataZoomInsideComponent,
	GraphicComponent,
	GraphicComponentOption,
	LegendComponent,
	TitleComponent,
	DatasetComponent,
	VisualMapComponent,
	BrushComponent,
	ToolboxComponent,
} from 'echarts/components'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers'
import { isDark } from '@/utils/theme-config'

// 通过 ComposeOption 来组合出一个只有必须组件和图表的 Option 类型
export type ECOption = echarts.ComposeOption<LineSeriesOption | TooltipComponentOption | GridComponentOption | DataZoomComponentOption | GraphicComponentOption | PieSeriesOption>

// type MapECOption = echarts.ComposeOption<MapSeriesOption>;

// export const chartsOptions = <T extends echarts.EChartsCoreOption>(option: T) => shallowReactive<T>(option);

echarts.use([
	LineChart,
	TooltipComponent,
	GridComponent,
	LabelLayout,
	DataZoomComponent,
	CanvasRenderer,
	UniversalTransition,
	DataZoomInsideComponent,
	SVGRenderer,
	GraphicComponent,
	LegendComponent,
	BarChart,
	PieChart,
	MapChart,
	TitleComponent,
	DatasetComponent,
	VisualMapComponent,
	BrushComponent,
	ToolboxComponent,
])

export default defineComponent({
	name: 'BtEchart',
	props: {
		width: {
			type: String,
			default: '100%',
		},
		height: {
			type: String,
			default: '100%',
		},
		options: {
			type: Object as PropType<ECOption>,
		},
	},
	setup(props, { expose }) {
		const echartsRef = ref()
		const chart = shallowRef<echarts.ECharts>()
		watch(
			() => props.options,
			newOptions => {
				if (chart.value) {
					chart.value?.setOption({ ...(newOptions as ECOption), backgroundColor: isDark.value ? 'transparent' : 'transparent' })
				}
			}
		)

		// 自动调整大小
		const resize = () => chart.value?.resize()

		onMounted(() => {
			if (props.options) {
				chart.value = echarts.init(echartsRef.value, isDark.value ? 'dark' : 'light')
				chart.value?.setOption({ ...props.options, backgroundColor: isDark.value ? 'transparent' : 'transparent' })
				window.addEventListener('resize', resize) // 添加窗口改变监听
				resize()
			}
		})

		onUnmounted(() => {
			chart.value?.dispose()
			window.removeEventListener('resize', resize)
		})

		expose({ chart })

		return () => <div ref={echartsRef} style={{ width: props.width, height: props.height }} />
	},
})
