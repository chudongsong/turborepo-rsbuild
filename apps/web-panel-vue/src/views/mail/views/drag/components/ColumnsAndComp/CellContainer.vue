<template>
	<div :ref="setDrop" class="column-item" :style="cellStyle">
		<Empty v-if="showEmpty"></Empty>
		<template v-for="item in cell_map[cellKey].children" :key="item">
			<Comp :comp-key="item" :cell-key="cellKey"></Comp>
		</template>
		<!-- 用于拖拽的标识 -->
		<div v-if="cellIndex" :ref="resizeHandleRef" class="resize-handle" :style="{ right: resizeHandleRightPos + 'px' }"></div>
	</div>
</template>

<script setup lang="ts">
import { toRefs } from '@vueuse/core'
import { useDrop } from 'vue3-dnd'
import { dragColumnsAccept, type MenuCompConfig } from '../base'
import { configToStyle, getRandom, spliceCompToCell } from '../../controller'
import { cell_map, cell_style_map, column_map } from '../../store'
import { eventBUS } from '../../styleEngine'
import Comp from './Comp.vue'
import Empty from './Empty.vue'

const props = defineProps<{
	cellKey: string
	columnKey: string
}>()

const showDragOver = ref(false)

const showEmpty = computed(() => {
	return !showDragOver.value && cell_map.value[props.cellKey].children.length === 0
})

// 计算当前cell单元格的样式
const cellStyle = computed(() => {
	const style = configToStyle(cell_style_map.value[props.cellKey])
	return {
		...(style as object),
		width: cell_map.value[props.cellKey].width,
	}
})

// columns-container内容区接受拖拽进来的组件
const [monitor, drop] = useDrop({
	accept: dragColumnsAccept,
	collect(monitor) {
		return {
			isShallowOver: monitor.isOver(),
		}
	},
	drop: (item: MenuCompConfig) => {
		const index = cell_map.value[props.cellKey].children.indexOf('indicator')
		if (index > -1) {
			cell_map.value[props.cellKey].children.splice(index, 1)
		}
		if (item.key == '0') {
			showDragOver.value = false
			// 生成组件key
			const compKey = getRandom()
			// 在当前cell中添加一个组件
			spliceCompToCell(props.cellKey, compKey, item.type, index)
		}
	},
	hover: item => {
		if (item.key != '0') return
		showDragOver.value = true
		// 添加一个indicator
		if (!cell_map.value[props.cellKey].children.includes('indicator')) {
			cell_map.value[props.cellKey].children.push('indicator')
		}
	},
})

const { isShallowOver } = toRefs(monitor)

// 监听组件isShallowOver，确定当前组件如果没有再被拖拽源覆盖（即拖拽源离开），则将indicator从cell_map中移除
watch(
	() => isShallowOver.value,
	val => {
		if (val) return
		showDragOver.value = false
		cell_map.value[props.cellKey].children = cell_map.value[props.cellKey].children.filter(item => item != 'indicator')
	}
)

// 当前单元格设置放置源
const cellRef = ref<HTMLDivElement | null>(null)
const setDrop = (el: HTMLDivElement) => {
	if (el) {
		cellRef.value = drop(el)
	}
	return undefined
}

/********** cell分割线处理 **********/
// 判断当前分割线是否应该显示
const cellIndex = computed(() => {
	const index = column_map.value[props.columnKey].children.findIndex(cellKey => cellKey == props.cellKey)
	return index !== column_map.value[props.columnKey].children.length - 1
})

// 根据当前cell的key找到右侧的cell
const rightCellKey = computed<string>(() => {
	const index = column_map.value[props.columnKey].children.findIndex(cellKey => cellKey == props.cellKey)
	if (index !== -1 && index < column_map.value[props.columnKey].children.length - 1) {
		return column_map.value[props.columnKey].children[index + 1]
	} else {
		return ''
	}
})

// 分割线拖拽
const resizeHandleRightPos = ref(-1)
const resizeHandleInitX = ref(0)
let parentWidth = 0
// let compensar = 0
let resizeHandleMove = 0
let currentCell: HTMLDivElement
let nextCell: HTMLDivElement

function downEvent(e: MouseEvent) {
	// 记录divider初始位置
	resizeHandleInitX.value = e.clientX
	// 记录当前divider父级div的初始宽度
	parentWidth = cellRef.value!.getBoundingClientRect().width
	document.addEventListener('mousemove', moveEvent)
}
function moveEvent(e: MouseEvent) {
	// 找到当前cell和下一个cell
	currentCell = document.querySelector(`#cell_${props.cellKey}`) as HTMLDivElement
	nextCell = document.querySelector(`#cell_${rightCellKey.value}`) as HTMLDivElement
	// 计算divider偏移量
	resizeHandleMove = e.clientX - resizeHandleInitX.value
	// 计算divider偏移比例（左侧cell做加法，右侧cell做减法，不论正负）
	// compensar = resizeHandleMove / parentWidth
	// 优先操作dom的变化
	let currentWidth = `calc(${cell_map.value[props.cellKey].width} + ${resizeHandleMove}px)`
	let nextWidth = `calc(${cell_map.value[rightCellKey.value].width} - ${resizeHandleMove}px)`
	if (currentCell.offsetWidth <= 50 || nextCell.offsetWidth <= 50) return // 限制最小50px
	currentCell.style.width = currentWidth
	nextCell.style.width = nextWidth
	e.preventDefault()
}

// 设置偏移量
function resizeHandleRef(dom: HTMLDivElement) {
	if (!dom) return
	dom.addEventListener('mousedown', downEvent)
	document.addEventListener('mouseup', () => {
		if (resizeHandleInitX.value == 0) return // 避免所有divider都执行mouseup
		document.removeEventListener('mousemove', moveEvent)

		// 设置真实偏移量
		let realCompensar = (resizeHandleMove / parentWidth) * (Number(cell_map.value[props.cellKey].width.split('%')[0]) / 100)
		cell_map.value[props.cellKey].width = Number(((Number(cell_map.value[props.cellKey].width.split('%')[0]) / 100 + realCompensar) * 100).toFixed(2)) + '%'
		cell_map.value[rightCellKey.value].width = Number(((Number(cell_map.value[rightCellKey.value].width.split('%')[0]) / 100 - realCompensar) * 100).toFixed(2)) + '%'
		// dom更新后将拖拽标签的数据重置,并与图例通信
		nextTick(() => {
			parentWidth = 0
			// compensar = 0
			resizeHandleMove = 0
			resizeHandleInitX.value = 0
			// 通知消息中心重新编译
			eventBUS.$emit('makeDom')
		})
	})
	return undefined
}
</script>

<style lang="scss" scoped>
.column-item {
	position: relative;
	margin-right: 1px;
	// min-height: 80px;

	.resize-handle {
		position: absolute;
		top: 0;
		width: 2px;
		height: 100%;
		background-color: var(--el-base-supplement-dark);
		cursor: col-resize;
		z-index: 102;

		&:hover {
			width: 4px;
		}
	}
}
</style>
