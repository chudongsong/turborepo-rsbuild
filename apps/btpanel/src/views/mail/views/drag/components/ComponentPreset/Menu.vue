<template>
	<div>
		<None v-if="links.length === 0">菜单</None>
		<a v-for="item of links" :key="item.id" :style="style" rel="noreferrer noopener">{{ item.label }}</a>
	</div>
</template>

<script setup lang="ts">
import { configToStyle } from '../../controller';
import { comp_style_map } from '../../store';
import None from './None.vue'

const props = defineProps<{ compKey: string }>()

const links = computed(() => {
	return comp_style_map.value[props.compKey].links
})

const style = computed(() => {
	const { info } = comp_style_map.value[props.compKey]
	const configStyle = configToStyle(comp_style_map.value[props.compKey]);
	return {
		...(configStyle as Record<string, string>),
		display: info?.layout === 'vertical' ? 'block' : 'inline-block'
	}
})
</script>
