<template>
	<div :ref="drag" class="comp-box">
		<bt-icon :icon="`${itemConfig.icon}`" :size="24"></bt-icon>
		<div class="text">{{ itemConfig.name }}</div>
	</div>
</template>

<script lang="ts" setup>
import { useDrag } from 'vue3-dnd'
import { MenuCompConfig, ColumnConfig, DragComponentType } from '../base'
import { cell_map, virtualDragCell } from '../../store'
import { insertCompToCell, getRandom, cloneDeep } from '../../controller'

const props = defineProps<{ itemConfig: MenuCompConfig | ColumnConfig }>()

const [, drag] = useDrag(() => {
	return {
		type: props.itemConfig.type,
		item: cloneDeep(props.itemConfig),
		end(item, monitor) {
			if (virtualDragCell.value && monitor.getDropResult()) {
				const compKey = getRandom()
				cell_map.value[virtualDragCell.value].children = cell_map.value[virtualDragCell.value].children.filter(compKey => compKey !== 'indicator')
				insertCompToCell(virtualDragCell.value, compKey, item.type as DragComponentType)
			}
		},
		collect(monitor) {
			return {
				isDragging: monitor.isDragging(),
			}
		},
	}
})
</script>

<style lang="scss" scoped>
.comp-box {
	position: relative;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 70px;
	border: 1px solid var(--el-color-border-dark);
	border-radius: var(--el-border-radius-base);
	text-align: center;
	font-weight: 500;
	cursor: grab;

	.text {
		margin-top: 4px;
	}
}
</style>
