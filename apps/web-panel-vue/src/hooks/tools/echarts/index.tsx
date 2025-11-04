import BtEChartCmp, { ECOption } from '@/components/extension/bt-echart'
import { isFunction } from '@/utils'

interface UseEchartsProps {
	defalut?: boolean
	options: ECOption | ((xAxisData: AnyObject[], seriesData: Array<AnyObject[]>) => ECOption)
}

/**
 * @description echarts实例
 * @param {UseEchartsProps} props 参数
 * @returns {Object} echarts实例
 */
export const useECharts = (props: UseEchartsProps) => {
	const echartsRef = ref()
	const { options, defalut } = toRaw(props)
	const customOptions = shallowRef<ECOption>()

	const setOption = (option: ECOption) => echartsRef.value.chart.setOption(option)

	/**
	 * @description 设置图表配置
	 * @param xAxisData
	 * @param seriesData
	 */
	const setQuickOption = (xAxisData: any[], seriesData: any[]) => {
		echartsRef?.value.chart.setOption({
			xAxis: { data: xAxisData },
			series: seriesData.map(item => ({ data: item })),
		})
	}

	if (isFunction(options)) {
		customOptions.value = options([], [[]])
	} else {
		customOptions.value = options
	}

	return {
		// echarts组件
		BtECharts: (props: AnyObject) => <BtEChartCmp {...props} ref={echartsRef} options={customOptions.value} />,
		// 获取echarts实例
		getEChart: async () => {
			await nextTick()
			return echartsRef.value.chart as echarts.ECharts
		},
		// 设置option
		setOption,
		// 设置配置-快速设置
		setQuickOption,
	}
}
