<template>
	<div :ref="setRef" :class="['comp-wrapper', { indicator: dragCollect.isDragging || compKey == 'indicator' }]" @click="openConfigPanel" :data-handler-id="dropCollect.handlerId" :style="style">
		<template v-if="!dragCollect.isDragging">
			<div class="viewer-selector" :class="{ active: currentEditCompKey === compKey }">
				<div class="viewer-drag" :ref="drag">
					<bt-icon icon="el-fullscreen-expand" color="var(--el-color-white)" :size="20"></bt-icon>
				</div>
				<div class="viewer-action">
					<div class="action-btn" @click="() => copyComp(compKey, cellKey)">
						<bt-icon icon="el-document-copy" :size="16" color="var(--el-color-white)"></bt-icon>
					</div>
					<div class="action-btn" @click="delComp">
						<bt-icon icon="el-delete" :size="16" color="var(--el-color-white)"></bt-icon>
					</div>
				</div>
				<div v-if="comp_map[compKey]" class="viewer-type">
					{{ capitalizeFirstLetter(comp_map[compKey].type) }}
				</div>
			</div>
			<component :is="RenderComp" :comp-key="compKey" />
		</template>
	</div>
</template>

<script setup lang="tsx">
import { Identifier } from 'dnd-core'
import { DropTargetMonitor, useDrag, useDrop } from 'vue3-dnd'
import { dragColumnsAccept, DragComponentType } from '../base'
import { configPanelVisible, configPanelType, currentEditCompKey, comp_style_map, comp_map, column_map, currentZindexColumnKey } from '../../store'
import { compSortLeft, compSortRight, configToStyle, copyComp, delFromCompMap } from '../../controller'

const props = defineProps<{ compKey: string; cellKey: string }>()

// 引入各个组件
const Button = defineAsyncComponent(() => import('../ComponentPreset/Button.vue'))
const Divider = defineAsyncComponent(() => import('../ComponentPreset/Divider.vue'))
const Header = defineAsyncComponent(() => import('../ComponentPreset/Header.vue'))
const Text = defineAsyncComponent(() => import('../ComponentPreset/Text.vue'))
const Image = defineAsyncComponent(() => import('../ComponentPreset/Image.vue'))
const Menu = defineAsyncComponent(() => import('../ComponentPreset/Menu.vue'))
const HTML = defineAsyncComponent(() => import('../ComponentPreset/Html.vue'))
const Other = defineAsyncComponent(() => import('../ComponentPreset/Other.vue'))

function capitalizeFirstLetter(string: string) {
	return string.charAt(0).toUpperCase() + string.slice(1)
}

// 暴露拖拽行为用于排序
const draggingKey = ref('') // 当前拖拽源的key

// 设置handle为拖拽源
const [dragCollect, drag, dragPreview] = useDrag({
	type: DragComponentType.commonComp,
	item: { key: props.compKey },
	collect(monitor) {
		return {
			isDragging: monitor.isDragging(),
		}
	},
})

// 监听isDragging变化，为true则说明开始了拖拽，为排序做准备
watch(
	() => dragCollect.value.isDragging,
	val => {
		if (val) {
			draggingKey.value = props.compKey
		}
	}
)

// 设置div.comp-wrapper为放置源
const [dropCollect, drop] = useDrop<{ key: string }, void, { handlerId: Identifier | null }>({
	accept: dragColumnsAccept.filter(item => item !== 'columns'),
	hover(item: { key: string }, monitor) {
		setCompSelector()
		if (item.key != '0') {
			compSort(item.key, monitor)
		} else {
			compSort('indicator', monitor)
		}
	},

	drop() {
		removeCompSelector()
	},
	collect(monitor) {
		return {
			handlerId: monitor.getHandlerId(),
		}
	},
})

const setCompSelector = () => {
	const columns = document.querySelectorAll('.comp-wrapper')
	columns.forEach(item => {
		item.querySelector('.viewer-selector')?.classList.add('no-hover')
	})
}

const removeCompSelector = () => {
	const columns = document.querySelectorAll('.comp-wrapper')
	columns.forEach(item => {
		item.querySelector('.viewer-selector')?.classList.remove('no-hover')
	})
}

/* // 当前组件的排序方法(节流)
function compSort() {
	let timer: number | null = null
	return (itemKey: string, monitor: DropTargetMonitor) => {
		if (timer) return
		timer = window.setTimeout(() => {
			// 如果排序的对象是自己就放弃
			if (itemKey == props.compKey) return
			// 放置源的rect
			const dropRect = compWrapper.value?.getBoundingClientRect()
			// 放置源中线位置
			const dropRectMiddle = dropRect.top + (dropRect.bottom - dropRect.top) / 2
			// 鼠标位置
			const mouseRect = monitor.getClientOffset()
			// 如果鼠标位置在中线上方则拖拽源与目标执行左交换
			if (mouseRect!.y < dropRectMiddle) {
				compSortLeft(props.cellKey, props.compKey, itemKey)
			}
			// 如果鼠标位置在中线下方则拖拽源与目标执行右交换
			if (mouseRect!.y > dropRectMiddle) {
				compSortRight(props.cellKey, props.compKey, itemKey)
			}

			timer = null
		}, 200)
	}
}
// 得到排序闭包
const compSortClosure = compSort() */
function compSort(itemKey: string, monitor: DropTargetMonitor) {
	// 如果排序的对象是自己就放弃
	if (itemKey == props.compKey) return
	// 放置源的rect
	const dropRect = compWrapper.value?.getBoundingClientRect()
	// 放置源中线位置
	const dropRectMiddle = dropRect.top + (dropRect.bottom - dropRect.top) / 2
	// 鼠标位置
	const mouseRect = monitor.getClientOffset()
	// 如果鼠标位置在中线上方则拖拽源与目标执行左交换
	if (mouseRect!.y < dropRectMiddle) {
		compSortLeft(props.cellKey, props.compKey, itemKey)
	}
	// 如果鼠标位置在中线下方则拖拽源与目标执行右交换
	if (mouseRect!.y > dropRectMiddle) {
		compSortRight(props.cellKey, props.compKey, itemKey)
	}
}

// 定义ref方法，将外层div同时设置为放置源和预览源
const compWrapper = ref()
function setRef(e: HTMLDivElement) {
	compWrapper.value = dragPreview(drop(e))
	return undefined
}
// 将放置源暴露出去
defineExpose({
	compSort,
	key: props.compKey,
})

// 应用general样式
const style = computed(() => {
	return configToStyle(comp_style_map.value[props.compKey], 'general')
})

// 计算属性进行渲染控制
const RenderComp = computed(() => {
	const type = comp_map.value && comp_map.value[props.compKey] ? comp_map.value[props.compKey].type : ''

	switch (type) {
		case 'button':
			return Button
		case 'divider':
			return Divider
		case 'header':
			return Header
		case 'text':
			return Text
		case 'image':
			return Image
		case 'menu':
			return Menu
		case 'html':
			return HTML
		default:
			return Other
	}
})

// 打开配置面板
function openConfigPanel() {
	configPanelVisible.value = true
	configPanelType.value = comp_map.value[props.compKey].type
	currentEditCompKey.value = props.compKey

	// 根据当前点击的单元格key找到对应父级column的key，用于提升对应column-container的z-index权重，防止被遮挡
	for (let key in column_map.value) {
		if (column_map.value[key].children.includes(props.cellKey)) {
			currentZindexColumnKey.value = key
		}
	}
}

// 删除当前组件
function delComp(e: MouseEvent) {
	delFromCompMap(props.compKey, props.cellKey)
	e.stopPropagation()
}
</script>

<style scoped lang="scss">
.comp-wrapper {
	position: relative;
	width: 100%;
}

.indicator {
	height: 80px;
	box-sizing: border-box;
	border: 2px dashed var(--el-color-border-dark-tertiaryer);
	background-color: var(--el-fill-color-light);
}

.viewer-selector {
	--primary-color: var(--el-base-supplement);

	&.active {
		--primary-color: var(--el-base-supplement-dark);

		.viewer-drag {
			z-index: 111;
		}

		.viewer-action {
			z-index: 121;
		}
	}

	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	width: 100%;

	&::after {
		content: ' ';
		opacity: 0;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: auto;
		z-index: 100;
	}

	.viewer-action,
	.viewer-drag,
	.viewer-type {
		visibility: hidden;
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--primary-color);
	}

	.viewer-drag {
		top: 50%;
		right: 0;
		height: 30px;
		padding: 0 7px;
		margin-top: -15px;
		border-radius: var(--el-border-radius-base) 0 0 var(--el-border-radius-base);
		color: var(--el-color-white);
		z-index: 110;
		cursor: grab;
	}

	.viewer-action {
		right: 0;
		bottom: -30px;
		height: 30px;
		padding: 0 7px 2px;
		border-bottom-left-radius: var(--el-border-radius-base);
		border-bottom-right-radius: var(--el-border-radius-base);
		color: var(--el-color-white);
		z-index: 120;

		.text {
			padding: 0 4px;
		}

		.action-btn {
			display: flex;
			align-items: center;
			height: 26px;
			padding: 0 5px;
			cursor: pointer;
		}
	}

	.viewer-type {
		right: 0;
		bottom: -24px;
		height: 24px;
		padding: 0 12px;
		border-bottom-left-radius: var(--el-border-radius-small);
		border-bottom-right-radius: var(--el-border-radius-small);
		color: var(--el-color-white);
		z-index: 105;
	}

	&:hover:not(.no-hover) {
		&:not(.active)::after {
			background-color: rgba(var(--el-base-supplement-rgb), 0.2);
		}
	}

	&:hover:not(.no-hover),
	&.active {
		&::after {
			opacity: 1;
			border: 2px solid var(--primary-color);
		}
		.viewer-drag {
			visibility: visible;
		}
	}

	&:hover:not(.no-hover) {
		.viewer-type {
			visibility: visible;
		}
	}

	&.active {
		.viewer-action {
			visibility: visible;
		}

		.viewer-type {
			visibility: hidden !important;
		}
	}
}
</style>
