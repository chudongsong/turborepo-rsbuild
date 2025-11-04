<template>
	<div class="p-20px">
		<normal-form v-model:value="config.style"></normal-form>
	</div>
</template>

<script lang="tsx" setup>
import { useNormalForm } from '../ComponentOptions/useNormalForm'
import { comp_style_map, currentEditCompKey } from '../../store'
import { eventBUS } from '../../styleEngine'
import BtnLink from '../ComponentOptions/Link.vue'
import TextAlign from '../ComponentOptions/TextAlign.vue'
import Padding from '../ComponentOptions/Padding.vue'
import ContentText from '../ComponentOptions/ContentText.vue'

const config = computed({
	get() {
		return comp_style_map.value[currentEditCompKey.value]
	},
	set(val) {
		console.log("测试")
		comp_style_map.value[currentEditCompKey.value] = val
	},
})
// 监听样式变化，调用样式引擎
watch(config,()=>{
	eventBUS.$emit("makeDom")
},{deep:true})

// 定义Button的配置面板
const [NormalForm] = useNormalForm([
	{
		attrKey:"custom",
		render:()=><ContentText v-model:value={config.value.content}/>
	},
	{
		attrKey: 'custom',
		render: () => (
			<BtnLink v-model:value={config.value.info!.href} v-model:target={config.value.info!.target} label="链接" />
		),
	},
	{
		attrKey: 'backgroundColor',
		label: '背景颜色',
	},
	{
		attrKey: 'color',
		label: '文本颜色',
	},
	{
		attrKey: 'widthAuto',
		key: 'width',
	},
	{
		attrKey: 'fontWeight',
	},
	{
		attrKey: 'fontSize',
	},
	{
		attrKey: 'lineHeight',
	},
	{
		attrKey: 'letterSpacing',
	},
	{
		attrKey: 'custom',
		render: () => <TextAlign v-model:value={config.value.general!.textAlign} label="对齐方式" />,
	},
	{
		attrKey: 'padding',
	},
	{
		attrKey: 'border',
	},
	{
		attrKey: 'borderRadius',
	},
	{
		attrKey: 'custom',
		render: () => (
			<Padding v-model:value={config.value.general!.padding} label="内边距"></Padding>
		),
	},
])
</script>
