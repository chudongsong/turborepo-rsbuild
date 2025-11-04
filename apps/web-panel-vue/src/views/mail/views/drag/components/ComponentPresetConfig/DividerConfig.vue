<template>
	<div class="p-20px">
		<normal-form v-model:value="config.style"></normal-form>
	</div>
</template>

<script lang="tsx" setup>
import { useNormalForm } from '../ComponentOptions/useNormalForm'
import { comp_style_map, currentEditCompKey } from '../../store'
import { eventBUS } from '../../styleEngine'

import TextAlign from '../ComponentOptions/TextAlign.vue'
import Padding from '../ComponentOptions/Padding.vue'

const config = computed({
	get() {
		return comp_style_map.value[currentEditCompKey.value]
	},
	set(val) {
		comp_style_map.value[currentEditCompKey.value] = val
	},
})
// 监听样式变化，调用样式引擎
watch(config,()=>{
	eventBUS.$emit("makeDom")
},{deep:true})

const [NormalForm] = useNormalForm([
	{
		attrKey: 'width',
	},
	{
		attrKey: 'borderTop',
	},
	{
		attrKey: 'custom',
		render: () => <TextAlign v-model:value={config.value.general!.textAlign} label="对齐方式" />,
	},
	{
		attrKey: 'custom',
		render: () => (
			<Padding v-model:value={config.value.general!.padding} label="内边距" />
		),
	},
])
</script>
