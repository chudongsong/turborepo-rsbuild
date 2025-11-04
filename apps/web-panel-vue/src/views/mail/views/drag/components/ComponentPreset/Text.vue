<template>
	<p :style="style">{{ comp_style_map[props.compKey].content }}</p>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { comp_style_map } from '../../store'
import { configToStyle } from '../../controller'

const props = defineProps<{ compKey: string }>()

const style = computed(() => configToStyle(comp_style_map.value[props.compKey]))
</script>

<style scoped lang="scss">
.text {
	line-height: 140%;
	text-align: left;
	overflow-wrap: break-word;
	font-size: var(--el-font-size-base);
	position: relative;

	p {
		line-height: 140%;
	}
}
</style>
