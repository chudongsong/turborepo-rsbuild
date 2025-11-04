<template>
	<collapse :default-expanded-names="['1', '2', '3']">
		<el-collapse-item title="列项" name="1">
			<el-row :gutter="16">
				<el-col :span="12" v-for="(item, index) of columnsConfig" :key="`${index + 1}`">
					<column-item :active="getActiveWidth(item)" :options="item"
						@click="columnPercentConfirm(item, currentEditCompKey)">
					</column-item>
				</el-col>
			</el-row>
		</el-collapse-item>
		<el-collapse-item title="列项样式" name="2">
			<el-button size="default" @click="() => addCell(currentEditCompKey)">
				添加
			</el-button>
			<el-button v-if="column_map[currentEditCompKey].children.length > 1" class="ml-2" size="default"
				@click="delCell">
				删除
			</el-button>
			<bt-tabs v-model="activeCellKey" type="bg-card" class="mt-4" :options="column_map[currentEditCompKey].children.map((item, index) => ({
				label: `列项 ${index + 1}`,
				name: item
			}))"></bt-tabs>
			<div class="mt-4">
				<item-style-form v-model:value="cell_style_map[activeCellKey].style"></item-style-form>
			</div>
		</el-collapse-item>
		<el-collapse-item title="列项样式" name="3">
			<normal-form v-model:value="config.style"></normal-form>
		</el-collapse-item>
	</collapse>
</template>

<script lang="tsx" setup>
import { currentEditCompKey, column_map, cell_map, column_row_style_map,cell_style_map } from '../../store'
import { addCell, columnPercentConfirm, removeColumnItem } from '../../controller'
import { useNormalForm } from '../ComponentOptions/useNormalForm'
import { eventBUS } from '../../styleEngine'

import Collapse from './Collapse.vue'
import ColumnItem from './ColumnItem.vue'
import Padding from '../ComponentOptions/Padding.vue'
import Color from '../ComponentOptions/Color.vue'

// 可选宽度
const columnsConfig = [[100], [50, 50], [33.33, 33.33, 33.34], [25, 25, 25, 25], [33, 67], [67, 33]]

const activeCellKey = ref<string>(column_map.value[currentEditCompKey.value].children[0])

// 计算得出当前column的所有cell
const columnsChildren = computed(() => {
	const columnData = column_map.value[currentEditCompKey.value]
	return columnData ? columnData.children : []
})

// 计算出当前column所有cell的宽度
const columnsWidth = computed(() => {
	return columnsChildren.value.map(item => Number.parseFloat(cell_map.value[item].width))
})

// 根据column所有cell宽度数组字符串化与columnConfig对比，来得到配置面板中应该处于active的分列配置项
const getActiveWidth = (item: number[]) => {
	return JSON.stringify(item) === JSON.stringify(columnsWidth.value)
}

// column的样式结构
const config = computed({
	get() {
		return column_row_style_map.value[currentEditCompKey.value]
	},
	set(val) {
		column_row_style_map.value[currentEditCompKey.value] = val
	},
})

// 监听样式变化，调用样式引擎
watch(config, () => {
	eventBUS.$emit("makeDom")
}, { deep: true })

// 监听样式变化，调用样式引擎
watch(cell_style_map, () => {
	eventBUS.$emit("makeDom")
}, { deep: true })

const [ItemStyleForm] = useNormalForm([
	{
		attrKey: 'backgroundColor',
		label: '背景颜色',
	},
	{
		attrKey: 'padding',
		label: '内边距',
	},
	{
		attrKey: 'border',
		label: '边框',
	},
])

const [NormalForm] = useNormalForm([
	{
		attrKey: 'custom',
		render: () => (
			<Color v-model:value={column_row_style_map.value[currentEditCompKey.value].style.backgroundColor} label="背景颜色" />
		),
	},
	{
		attrKey: 'custom',
		render: () => (
			<Padding v-model:value={column_row_style_map.value[currentEditCompKey.value].style.padding} label="内边距" />
		),
	},
])

// 删除单元格并重新设置activeCellKey
function delCell(){
	removeColumnItem(activeCellKey.value, currentEditCompKey.value)
	nextTick(()=>{
		activeCellKey.value = column_map.value[currentEditCompKey.value].children[0] 
	})
}
</script>

<style lang="scss" scoped>
:deep(.el-tabs__header) {
	margin-bottom: 16px;
}

:deep(.bt-tabs) {
	.el-tabs__item {
		padding: 0 20px !important;
	}
}
</style>
