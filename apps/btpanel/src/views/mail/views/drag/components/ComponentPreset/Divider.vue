<template>
	<div :style="style"></div>
</template>

<script setup lang="ts">
import { comp_style_map } from '../../store'
import { configToStyle } from '../../controller'

const props = defineProps<{ compKey: string }>()

const style = computed(() => configToStyle(comp_style_map.value[props.compKey]))
</script>
