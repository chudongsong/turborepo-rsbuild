<template>
	<div class="module-ui" ref="chartModulesRef">
		<div class="module-ui-header">
			<div class="flex items-center">
				<ControlTitle :type="type" :title="props.title" :active="props.active" v-bind="$attrs" @cut-day-click="showElement"></ControlTitle>
				<el-tooltip ref="tooltipFull" effect="dark" content="全屏展示" placement="top" trigger="hover">
					<i class="full-icon svgtofont-el-fullscreen-expand hover:text-primary" v-if="!isFullScreen && !isInfo" @click="setFullScreen"> </i>
				</el-tooltip>
			</div>
			<div class="flex items-center" v-if="!isInfo">
				<el-button v-if="props.title === '网络IO：'" class="<2xl:hidden 2xl:inline-block" type="default" @click="openPopup(chartModulesRef)">统计 </el-button>
				<el-tooltip v-if="props.title === '网络IO：'" effect="dark" content="网络IO统计" placement="top-start">
					<i @click="openPopup(chartModulesRef)" class="cursor-pointer svgtofont-left-control hover:text-primary <2xl:inline-block 2xl:hidden" title="网络IO统计"></i>
				</el-tooltip>

				<div class="flex items-center ml-[1rem]">
					<el-tooltip effect="dark" content="点击刷新数据" placement="top-start">
						<el-button type="default" @click="initAllData(props.type)" class="<2xl:hidden 2xl:inline-block">
							<i class="svgtofont-el-refresh text-medium"></i>
						</el-button>
					</el-tooltip>
					<ControlDay class="ml-[1rem]" :type="type" @cut-day-click="showElement"></ControlDay>
					<i title="退出全屏" class="mt-2px text-large svgtofont-el-close cursor-pointer ml-[.5rem] hover:text-primary" v-if="isFullScreen" @click="setExitScreen"></i>
				</div>
			</div>
		</div>
		<div class="module-ui-body">
			<template v-if="isInfo">
				<template v-if="!props.controlValue && props.compData.series[0].data === undefined">
					<el-empty class="w-[100%]" description="未开启监控，暂无数据">
						<span class="bt-link" @click="updateEvent">点击开启监控 </span>
					</el-empty>
				</template>
				<el-empty v-else class="w-[100%]" description="我们正在努力为您收集数据，请耐心等待1-2分钟后再尝试查看。"> </el-empty>
			</template>
			<div v-show="!isInfo" v-bt-loading="JSON.stringify(props.compData) === '{}'" :style="{ height: fullHeight }" class="percentage w-full" style="position: relative">
				<BtECharts class="!h-full" />
				<div v-if="props.unitVisible" class="show">
					单位：
					<div class="bt-crontab-select-button">
						<div class="bt-select-full only-one disk-unit">
							<div class="select-picker-search">
								<span class="picker-text-list">KB/s</span>
								<span class="down-select-full"></span>
							</div>
							<div class="select-list-item" style="display: none">
								<ul style="width: auto; max-height: auto" class="active">
									<li data-attr="KB/s" class="active">
										<span class="select-name-full active">KB/s</span>
									</li>
									<li data-attr="MB/s"><span class="select-name-full">MB/s</span></li>
									<li data-attr="GB/s" style="display: none">
										<span class="select-name-full">GB/s</span>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- <el-card ref="chartModulesRef" class="relative module-box chart-modules-ref is-always-shadow" shadow="never" :body-style="{ padding: 0, display: 'flex' }">
			<template #header> </template>
		</el-card> -->
	</div>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue'
import ControlTitle from './card-title.vue'
import ControlDay from './card-day.vue'
import { useECharts } from '@/hooks/tools/echarts/index'
import { acceptAllId, initAllData } from '../useController'
import { openPopup, updateEvent } from './useController'

interface Props {
	title: string
	active?: boolean
	compData: any
	controlValue: boolean
	type: string
	unitVisible?: boolean
}

const emits = defineEmits(['accept-echarts-id', 'reset'])

// 每个实例的唯一 ID
const selfId = (crypto as any)?.randomUUID?.() ?? Math.random().toString(36).slice(2)

const props = withDefaults(defineProps<Props>(), {
	title: '默认',
	active: false,
	compData: () => {},
	unitVisible: false,
	controlValue: false,
	value: false,
	type: '',
})

// 是否为信息提示
const isInfo = computed(() => {
	return Object.keys(props.compData).includes('series') && props.compData.series[0].data === undefined
})

const chartModulesRef = ref()
const echartRef = ref()
const isFullScreen = ref<boolean>(false) // 是否全屏
const tooltipFull = ref() // 全屏提示
const fullHeight = ref('34rem') // 全屏高度

// 图表组-渲染组件
const { BtECharts, getEChart, setOption, setQuickOption } = useECharts({
	// 图表配置
	options: {
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: [],
		},
		yAxis: {
			boundaryGap: [0, '50%'],
			type: 'value',
		},
		tooltip: {
			extraCssText: 'background-color: transparent!important;',
		},
		series: [
			{
				name: '成交',
				type: 'line',
				smooth: true,
				symbol: 'none',
				stack: 'a',
				// areaStyle: {
				// 	normal: {},
				// },
				data: [],
			},
		],
	},
})

const setConfig = async (config: any) => {
	setOption(config)
	echartRef.value = await getEChart()
	echartRef.value?.resize()
}

/**
 * @description 设置 brush 功能
 */
const isBrushSetup = ref(false) // 标记是否已设置 brush
let mouseDownPosition = { x: 0, y: 0 } // 记录 mousedown 位置
const isTooltipFixed = ref(false) // 标记 tooltip 是否被固定
const justClickedLegend = ref(false)

const otherClick = (ev: any) => {
	if (!isTooltipFixed.value) return
	const tipEl = echartRef.value.getDom().querySelector('.echarts-tooltip') // ECharts 生成的 tooltip 容器
	// 点击不在 tooltip 内部，且不是 tooltip 的子节点 → 取消固定
	if (!tipEl || !tipEl.contains(ev.target)) {
		closeTooltip()
		document.removeEventListener('click', otherClick)
	}
}

const mouseClick = (e: any) => {
	if (justClickedLegend.value) return // 刚才点的是图例，忽略
	// 避免后面的 document 点击监听立刻把它又关掉
	if (!mouseDownPosition) return
	if (isTooltipFixed.value) {
		closeTooltip()
		return
	}
	// 固定 tooltip
	echartRef.value.setOption({
		backgroundColor: 'transparent',
		tooltip: {
			alwaysShowContent: true,
			extraCssText: 'background-color: transparent!important;',
		},
	})
	isTooltipFixed.value = true
	// if (e.event && e.event.stopPropagation) e.event.stopPropagation();
	document.removeEventListener('click', otherClick)
	setTimeout(() => {
		document.addEventListener('click', otherClick)
	}, 100)
}

const brushEnd = (e: any) => {
	const area = e.areas && e.areas[0]
	if (!area) return

	// 对于 lineX：coordRange 是选区的像素坐标范围 [xStart, xEnd]
	const coordRange = area.coordRange || area.range
	if (!coordRange || coordRange.length < 2) return

	// 将像素坐标转换为数据值（时间戳）
	const startValue = area.coordRange ? area.coordRange[0] : echartRef.value.convertFromPixel({ xAxisIndex: 0 }, coordRange[0])
	const endValue = area.coordRange ? area.coordRange[1] : echartRef.value.convertFromPixel({ xAxisIndex: 0 }, coordRange[1])

	// 清除刷选框，避免叠加
	setTimeout(() => {
		echartRef.value?.dispatchAction({ type: 'brush', areas: [] })
		echartRef.value.resize()
	}, 50)
	// 应用选区到 dataZoom
	echartRef.value?.dispatchAction({
		type: 'dataZoom',
		xAxisIndex: [0, 1],
		startValue,
		endValue,
	})
	emits('reset', selfId) // 触发reset事件，通知父组件刷新其它组件数据
}

const setupBrushFunctionality = () => {
	if (!echartRef.value) return

	// 延迟激活刷选光标，确保图表渲染完成
	setTimeout(() => {
		echartRef.value?.dispatchAction({
			type: 'takeGlobalCursor',
			key: 'brush',
			brushOption: { brushType: 'lineX', brushMode: 'single' },
		})
		echartRef.value.resize()
		// 标记已设置
		isBrushSetup.value = true
	}, 500)

	// 先解绑旧事件，避免重复绑定
	echartRef.value.off('brushEnd', brushEnd)

	// 监听刷选结束事件，应用选区到 dataZoom
	echartRef.value.on('brushEnd', brushEnd)

	// 注册双击还原事件
	// echartRef.value.getZr().off('dblclick') // 先解绑
	// echartRef.value.getZr().on('dblclick', () => {
	// 	closeTooltip()
	// 	// echartRef.value?.dispatchAction({ type: 'dataZoom', xAxisIndex: 0, start: 0, end: 100 })
	// 	// nextTick(() => {
	// 	// 	echartRef.value.resize()
	// 	// })
	// })

	// 注册点击固定tooltip
	echartRef.value.getZr().off('click') // 先解绑

	// mouseup 事件 - 判断是否固定或取消 tooltip
	echartRef.value.getZr().on('click', mouseClick)
	echartRef.value.off('legendselectchanged')
	echartRef.value.on('legendselectchanged', () => {
		justClickedLegend.value = true
		// 这个 tick 结束后复位（避免和 zr 的 click 冲突）
		Promise.resolve().then(() => {
			justClickedLegend.value = false
		})
	})
}

// 监听全屏状态
watch(isFullScreen, val => {
	if (val) {
		fullHeight.value = setFullHeight()
	} else {
		fullHeight.value = '34rem'
		nextTick(() => {
			echartRef.value?.resize() // 重新渲染图表大小
		})
	}
})

/**
 * @description 设置全屏高度
 */
const setFullHeight = () => {
	let chartH = 34
	if (isFullScreen.value) {
		let windowH = window.screen.height
		chartH = (windowH - 60) / 10
	}
	return `${chartH}rem`
}

/**
 * @description 退出全屏
 */
const setExitScreen = () => {
	isFullScreen.value = false
	document?.exitFullscreen()
	chartModulesRef.value.removeAttribute('style')
	echartRef.value?.resize()
}

/**
 * @description 设置全屏
 */
const setFullScreen = () => {
	isFullScreen.value = true
	tooltipFull.value.hide()
	nextTick(() => {
		if (chartModulesRef.value.requestFullscreen) {
			chartModulesRef.value.style.backgroundColor = 'var(--el-fill-color-lighter)'
			chartModulesRef.value.requestFullscreen()
		}
	})
}

/**
 * @description 检查是否全屏
 */
const checkFull = () => {
	let isFull = document.fullscreenElement ? true : false
	if (isFull === undefined || isFull === null) isFull = false
	return isFull
}

/**
 * @description 显示元素 -全屏状态下
 */
const showElement = () => {
	if (checkFull()) {
		nextTick(async () => {
			if (document.querySelector('.el-select-dropdown.el-popper')) {
				nextTick(() => {
					chartModulesRef.value.$el.appendChild(document.querySelector('.el-select-dropdown.el-popper'))
				})
			}
			// if (document.querySelector('.el-popper.el-picker__popper')) {
			// 	if (chartModulesRef.value.$el) chartModulesRef.value.$el.appendChild(document.querySelector('.el-popper.el-picker__popper'))(document.querySelector('.el-popper.el-picker__popper') as HTMLElement).style.display = 'block'
			// 	;(document.querySelector('.el-popper.el-picker__popper') as HTMLElement).style.inset = '40px 0 auto auto'
			// }
		})
	}
}

const initData = (compData: any, type: string) => {
	try {
		nextTick(() => {
			setConfig(compData)
			// 初始化 brush 功能
			setupBrushFunctionality()
		})
		acceptAllId(echartRef.value.id, type)
	} catch (e) {}
}

// 监听数据变化
watch(
	() => [props.compData, echartRef.value],
	() => {
		try {
			setConfig(props.compData)
			if (echartRef.value) {
				echartRef.value?.resize()
				// 只有在图表实例真正改变时才重新设置 brush 功能
				isBrushSetup.value = false
				nextTick(() => {
					setupBrushFunctionality()
				})
			}
		} catch (e) {
			console.log(e)
		}
	}
)

const closeTooltip = async (chartId?: string) => {
	// 如果传入的chartId与当前实例的id相同，则不进行任何操作
	if (chartId && selfId === chartId) {
		return
	}
	isTooltipFixed.value = false
	const chart = await getEChart()
	chart.clear()
	chart.setOption({
		backgroundColor: 'transparent',
		tooltip: {
			extraCssText: 'background-color: transparent!important;',
		},
	})
	setConfig(props.compData)
	nextTick(() => {
		setupBrushFunctionality()
	})
}

onMounted(() => {
	initData(props.compData, props.type)
	window.addEventListener(
		'fullscreenchange',
		() => {
			// 监听到屏幕变化，在回调中判断是否已退出全屏
			if (!checkFull()) {
				isFullScreen.value = false // 隐藏了全屏的内容
				if (document.fullscreenElement) {
					document.exitFullscreen().catch(console.error)
				}
			}
		},
		{ passive: true }
	)
})

// 组件卸载时清理事件
onUnmounted(() => {
	if (echartRef.value) {
		echartRef.value.off('brushEnd')
		echartRef.value?.getZr()?.off('dblclick')
		echartRef.value?.getZr()?.off('mousedown')
		echartRef.value?.getZr()?.off('mouseup')
	}
})

defineExpose({
	setConfig: setOption,
	echartRef,
	closeTooltip,
	selfId,
})
</script>

<style lang="css">
.el-card {
	@apply w-full mt-[10px] overflow-visible rounded-medium;
}

.el-card__header {
	@apply flex items-center justify-between;
}

.full-icon {
	@apply inline-block ml-[0.6rem] cursor-pointer text-medium;
}

:deep(.el-col .label) {
	color: var(--color-text-secondary);
}

.show {
	display: flex;
	justify-content: flex-start;
	position: absolute;
	top: 1.5625rem;
	left: 6%;
}
</style>
