<template>
	<a :href="info?.href || 'javascript:;'" :target="info?.target" :style="style" rel="noreferrer noopener">
		{{ comp_style_map[props.compKey].content }}
	</a>
</template>

<script setup lang="ts">
import { comp_style_map } from '../../store'
import { configToStyle } from '../../controller'

const props = defineProps<{ compKey: string }>()

const style = computed(() => configToStyle(comp_style_map.value[props.compKey]))

const info = computed(() => comp_style_map.value[props.compKey].info)
</script>
