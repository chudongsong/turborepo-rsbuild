<template>
	<div class="p-16px">
		<normal-form v-model:value="config.style"></normal-form>
	</div>
</template>

<script setup lang="tsx">
import { useNormalForm } from '../ComponentOptions/useNormalForm'
import { comp_style_map, currentEditCompKey } from '../../store'
import { eventBUS } from '../../styleEngine'

import Padding from '../ComponentOptions/Padding.vue'
import ContentText from '../ComponentOptions/ContentText.vue'

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
		attrKey:"custom",
		render:()=><ContentText v-model:value={config.value.content}/>
	},
	{
		attrKey: 'fontWeight',
	},
	{
		attrKey: 'fontSize',
	},
	{
		attrKey: 'color',
		label: '文本颜色',
	},
	{
		attrKey: 'textAlign',
	},
	{
		attrKey: 'lineHeight',
	},
	{
		attrKey: 'letterSpacing',
	},
	{
		attrKey: 'custom',
		render: () => (
			<Padding v-model:value={config.value.general!.padding} label="内边距"></Padding>
		),
	},
])
</script>
