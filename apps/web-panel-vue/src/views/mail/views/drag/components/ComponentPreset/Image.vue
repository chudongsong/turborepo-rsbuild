<template>
	<a :href="info?.href || 'javascript:;'" :target="info?.target" :style="style" rel="noreferrer noopener">
		<img v-if="info?.src" :src="info?.src" :alt="info?.alt" />
		<None v-else>Image</None>
	</a>
</template>

<script setup lang="ts">
import { comp_style_map } from '../../store'
import { configToStyle } from '../../controller'

import None from './None.vue'

const props = defineProps<{ compKey: string }>()

const style = computed(() => configToStyle(comp_style_map.value[props.compKey]))

const info = computed(() => comp_style_map.value[props.compKey].info)
</script>

<style lang="scss" scoped>
img {
	width: 100%;
}
</style>
