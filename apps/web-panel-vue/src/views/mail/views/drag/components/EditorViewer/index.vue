<template>
	<div class="flex flex-col h-full" @click.capture="onClickEditor">
		<editor-tools></editor-tools>
		<div class="editor-container">
			<div :ref="setDrop" class="editor-draggable" :style="pageStyle">
				<div v-if="!showTips && columns_source.length === 0" class="drag-empty">这里没有内容，请从左侧拖动内容。</div>
				<div v-if="showTips && 0 === position" class="drag-empty-box"></div>
				<template v-for="(item, index) in columns_source" :key="item">
					<Columns :column-key="item"> </Columns>
					<div v-if="showTips && index + 1 === position" class="drag-empty-box"></div>
				</template>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { toRefs } from '@vueuse/core'
import { useDrop } from 'vue3-dnd'
import { cell_map, column_map, columns_source, configPanelType, currentEditCompKey, virtualDragCell, page_style } from '../../store'
import { DragComponentType, ColumnConfig, dragColumnsAccept } from '../base'
import { debounce } from '../../controller'

import EditorTools from '../EditorTools/index.vue'
import Columns from '../ColumnsAndComp/Columns.vue'

const emits = defineEmits(['columnDrag'])

const editorRef = ref<HTMLDivElement | null>(null)

// 是否显示提示
const showTips = ref(false)

// 当前拖拽下标位置
const position = ref(0)

const pageStyle = computed(() => {
	return {
		backgroundColor: page_style.value.backgroundColor,
	}
})

// 重置位置
const resetPosition = () => {
	position.value = 0
	showTips.value = false
}

const [monitor, drop] = useDrop({
	accept: [...dragColumnsAccept, DragComponentType.Columns], //[DragComponentType.Columns],
	collect(monitor) {
		return {
			isShallowOver: monitor.isOver({ shallow: true }),
		}
	},
	// 对比拖拽源与columns_source成员的key，从而决定是追加还是排序
	// 区分是column拖拽还是组件拖拽
	drop: (item: ColumnConfig) => {
		if (item.type == DragComponentType.Columns) {
			// 触发column拖拽事件
			emits('columnDrag', item, position.value)
			resetPosition()
		}
	},
	hover: (item, monitor) => {
		// 区分是column拖拽还是组件拖拽
		if (item.type == DragComponentType.Columns) {
			debounce(() => {
				const offset = monitor.getSourceClientOffset()
				const columnsList = document.querySelectorAll('.editor-container .viewer-columns')
				if (offset && columnsList.length > 0) {
					// 拖拽源的top值
					const { y: drayTop } = offset
					let flag = true
					// 循环遍历每个columns，判断鼠标位置在哪个columns的下半部分
					for (let i = columnsList.length - 1; i >= 0; i--) {
						const col = columnsList[i] as HTMLElement
						const { top: colTop, height: colHeight } = col.getBoundingClientRect()
						// 减去编辑器的高度，得到相对于编辑器的top值
						const curColTop = colTop + colHeight / 2
						if (drayTop > curColTop) {
							flag = false
							position.value = i + 1
							break
						}
					}
					if (flag) {
						position.value = 0
					}
				}
				showTips.value = isShallowOver.value
			}, 150)()
		} else {
			// 如果拖拽的是菜单中的组件，那就需要询问是否需要比对最后一个column的rect
			// 还需要判断当前舞台中是否有column
			if (isShallowOver.value) {
				if (columns_source.value.length && item.key == '0') {
					// 找到最后一个column
					const lastColumn = columns_source.value.at(-1) as string
					// 找到column的所有cell对应的dom
					const cellDomList: { [key: string]: HTMLDivElement } = {}
					column_map.value[lastColumn as string].children.forEach(cellKey => (cellDomList[cellKey] = document.querySelector(`#cell_${cellKey}`) as HTMLDivElement))
					// 计算每一个cell的rect数据
					const cellRectList: { [key: string]: DOMRect } = {}
					for (let key in cellDomList) {
						cellRectList[key] = cellDomList[key].getBoundingClientRect()
					}
					// 判断当前鼠标与所有rect的包含关系（大于left，小于right），并插入indicator标记（同时删除其他indicator的标记）
					const mouseClient = monitor.getClientOffset()
					virtualDragCell.value = ''
					for (let key in cellRectList) {
						if (mouseClient!.x > cellRectList[key].left && mouseClient!.x < cellRectList[key].right) {
							for (let _key in cellRectList) {
								cell_map.value[_key].children = cell_map.value[_key].children.filter(compKey => compKey !== 'indicator')
							}
							cell_map.value[key].children.push('indicator')
							virtualDragCell.value = key
						} else {
							cell_map.value[key].children = cell_map.value[key].children.filter(compKey => compKey !== 'indicator')
						}
					}
				}
			} else {
				virtualDragCell.value = ''
			}
		}
	},
})

const { isShallowOver } = toRefs(monitor)

const setDrop = (el: HTMLDivElement) => {
	if (el) {
		editorRef.value = drop(el)
	}
	return undefined
}

const onClickEditor = () => {
	configPanelType.value = ''
	currentEditCompKey.value = ''
}
</script>

<style lang="scss" scoped>
.editor-container {
	position: relative;
	flex: 1;
	background-color: var(--el-fill-color-light);

	.editor-draggable {
		position: absolute;
		top: 20px;
		left: 20px;
		right: 20px;
		bottom: 20px;
		box-shadow: 0 4px 12px var(--el-fill-color-darker);
		overflow-y: auto;
	}

	.drag-empty {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		color: var(--el-color-text-disabled);
		font-size: var(--el-font-size-large);
	}

	.drag-empty-box {
		width: 100%;
		height: 100px;
		border: 2px dashed var(--el-color-border-dark-tertiaryer);
		background-color: var(--el-fill-color-light);
	}
}
</style>
