<template>
	<div class="p-16px">
		<menu-link></menu-link>
		<normal-form v-model:value="config.style"></normal-form>
	</div>
</template>

<script lang="tsx" setup>
import { useNormalForm } from '../ComponentOptions/useNormalForm'
import { comp_style_map, currentEditCompKey } from '../../store'
import { eventBUS } from '../../styleEngine'

import MenuLink from './MenuLink.vue'
import TextAlign from '../ComponentOptions/TextAlign.vue'
import Padding from '../ComponentOptions/Padding.vue'
import Layout from '../ComponentOptions/Layout.vue'

const config = computed({
	get() {
		return comp_style_map.value[currentEditCompKey.value]
	},
	set(val) {
		comp_style_map.value[currentEditCompKey.value] = val
	},
})

// 监听样式变化，调用样式引擎
watch(
	() => config.value,
	() => {
		eventBUS.$emit("makeDom")
	},
	{ deep: true }
)

const [NormalForm] = useNormalForm([
	{
		attrKey: 'fontWeight',
	},
	{
		attrKey: 'fontSize',
	},
	{
		attrKey: 'letterSpacing',
	},
	{
		attrKey: 'color',
		label: '文本颜色',
	},
	{
		attrKey: 'color',
		key: 'linkColor',
		label: '链接颜色',
	},
	{
		attrKey: 'custom',
		render: () => <TextAlign v-model:value={config.value.general!.textAlign} label="对齐方式" />,
	},
	{
		attrKey: 'custom',
		render: () => <Layout v-model:value={config.value.info!.layout} />,
	},
	{
		attrKey: 'padding',
	},
	{
		attrKey: 'custom',
		render: () => (
			<Padding v-model:value={config.value.general!.padding} label="内边距" />
		),
	},
])
</script>

<style lang="scss" scoped></style>
