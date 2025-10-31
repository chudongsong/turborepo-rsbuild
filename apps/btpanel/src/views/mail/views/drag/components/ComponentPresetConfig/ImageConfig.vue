<template>
	<div class="p-20px">
		<normal-form v-model:value="config.style"></normal-form>
	</div>
</template>

<script lang="tsx" setup>
import { useNormalForm } from '../ComponentOptions/useNormalForm'
import { comp_style_map, currentEditCompKey } from '../../store'
import { eventBUS } from '../../styleEngine'

import ImageUrl from '../ComponentOptions/Image.vue'
import ImageLink from '../ComponentOptions/Link.vue'
import ImageTitle from '../ComponentOptions/Title.vue'
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
		attrKey: 'custom',
		render: () => <ImageUrl v-model:value={config.value.info!.src} />,
	},
	{
		attrKey: 'widthAuto',
		key: 'width',
	},
	{
		attrKey: 'custom',
		render: () => <TextAlign v-model:value={config.value.general!.textAlign} label="对齐方式" />,
	},
	{
		attrKey: 'custom',
		render: () => <ImageTitle v-model:value={config.value.info!.alt} />,
	},
	{
		attrKey: 'custom',
		render: () => (
			<ImageLink v-model:value={config.value.info!.href} v-model:target={config.value.info!.target} />
		),
	},
	{
		attrKey: 'custom',
		render: () => (
			<Padding v-model:value={config.value.general!.padding} label="内边距"></Padding>
		),
	},
])
</script>
