<!--
  @description 
      - 编辑区列组件
      - 该组件自身参与编辑区拖拽排序
      - 
-->
<template>
	<div :ref="setRef" :class="['viewer-columns', { indicator: isDragging }]" :data-handler-id="handlerId" @click.capture="openConfigPanel" :id="`column_${columnKey}`">
		<template v-if="!isDragging">
			<div class="viewer-selector" :class="{ active: currentEditCompKey === columnKey }">
				<div :ref="drag_column" class="viewer-drag">
					<bt-icon icon="el-fullscreen-expand" color="#fff" :size="20"></bt-icon>
				</div>
				<div class="viewer-action">
					<div v-if="false" class="action-btn">
						<bt-icon icon="el-document-copy" :size="16" color="#fff"></bt-icon>
					</div>
					<div class="action-btn" @click="() => delFromColumnMap(columnKey)">
						<bt-icon icon="el-delete" :size="16" color="#fff"></bt-icon>
					</div>
				</div>
				<div v-if="column_map[columnKey]" class="viewer-type">
					{{ capitalizeFirstLetter(column_map[columnKey].type) }}
				</div>
			</div>
			<div class="columns-container" :style="{ ...(style as CSSProperties), maxWidth, zIndex: currentZindexColumnKey == columnKey ? 2000 : 100 }">
				<CellContainer v-for="item in column_map[columnKey].children" :key="item" :cell-key="item" :column-key="columnKey" :id="`cell_${item}`"> </CellContainer>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { toRefs } from '@vueuse/core'
import { useDrop, useDrag } from 'vue3-dnd'
import { Identifier } from 'dnd-core'
import { configPanelVisible, configPanelType, currentEditCompKey, column_map, column_row_style_map, currentZindexColumnKey, page_style } from '../../store'
import { columnSortLeft, columnSortRight, configToStyle, delFromColumnMap } from '../../controller'

import CellContainer from './CellContainer.vue'
import { CSSProperties } from 'vue'

const props = defineProps<{ columnKey: string }>()

// 计算得到当前column的基本样式
const style = computed(() => {
	return configToStyle(column_row_style_map.value[props.columnKey])
})

const maxWidth = computed(() => {
	return page_style.value.maxWidth as string
})

function capitalizeFirstLetter(string: string) {
	return string.charAt(0).toUpperCase() + string.slice(1)
}

// viewer-columns作为拖拽成员,用于排序
const [dragColumnCollect, drag_column, dragColumnPreview] = useDrag({
	type: 'Drag_Columns',
	item: () => {
		return { key: props.columnKey }
	},
	collect(monitor) {
		return {
			isDragging: monitor.isDragging(),
		}
	},
})

// 当前成员是否被拖拽
const { isDragging } = toRefs(dragColumnCollect)

// view-columns作为放置源，用于排序
const [dropColumnCollect, drop_column] = useDrop<{ key: string }, void, { handlerId: Identifier | null }>({
	accept: 'Drag_Columns',
	hover(item: { key: string }, monitor) {
		setColumnSelector()

		// 如果排序的对象是自己就放弃
		if (item.key == props.columnKey) return
		// 放置源的rect
		const dropRect = viewColumn.value!.getBoundingClientRect()
		// 放置源中线位置
		const dropRectMiddle = dropRect.top + (dropRect.bottom - dropRect.top) / 2
		// 鼠标位置
		const mouseRect = monitor.getClientOffset()
		// 如果鼠标位置在中线上方则拖拽源与目标执行左交换
		if (mouseRect!.y < dropRectMiddle) {
			columnSortLeft(props.columnKey, item.key)
		}
		// 如果鼠标位置在中线下方则拖拽源与目标执行右交换
		if (mouseRect!.y > dropRectMiddle) {
			columnSortRight(props.columnKey, item.key)
		}
	},
	drop() {
		removeColumnSelector()
	},
	collect(monitor) {
		return {
			handlerId: monitor.getHandlerId(),
		}
	},
})

const setColumnSelector = () => {
	const columns = document.querySelectorAll('.viewer-columns')
	columns.forEach(item => {
		item.querySelector('.viewer-selector')?.classList.add('no-hover')
	})
}

const removeColumnSelector = () => {
	const columns = document.querySelectorAll('.viewer-columns')
	columns.forEach(item => {
		item.querySelector('.viewer-selector')?.classList.remove('no-hover')
	})
}

const { handlerId } = toRefs(dropColumnCollect)

// 将drag和drop的视图渲染器绑定到view-columns上
const viewColumn = ref<HTMLDivElement>()

const setRef = (el: HTMLDivElement) => {
	viewColumn.value = dragColumnPreview(drop_column(el))
	return undefined
}

// 打开配置面板
function openConfigPanel() {
	const { columnKey } = props
	const { key, type } = column_map.value[columnKey]

	configPanelType.value = type
	currentEditCompKey.value = key
	configPanelVisible.value = true
}
</script>

<style lang="scss" scoped>
.viewer-columns {
	position: relative;
}

.indicator {
	height: 100px;
	box-sizing: border-box;
	border: 2px dashed var(--el-color-border-dark-tertiary);
	background-color: var(--el-fill-color-light);
}

.columns-container {
	position: relative;
	display: flex;
	margin: 0 auto;
	z-index: 100;
}

.viewer-selector {
	--primary-color: var(--el-base-supplement);

	&.active {
		--primary-color: var(--el-base-supplement-dark);
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
		.viewer-type {
			visibility: hidden !important;
		}

		.viewer-action {
			visibility: visible;
		}
	}
}

// 拖拽标记的样式
.sort-sign {
	position: absolute;
	bottom: 0;
	height: 2px;
	background: var(--el-base-supplement-dark);
	width: 100%;
}
</style>
