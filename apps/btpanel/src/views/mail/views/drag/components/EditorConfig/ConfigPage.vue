<template>
	<div class="p-20px">
		<normal-form v-model:value="page_style"></normal-form>
	</div>
</template>

<script lang="tsx" setup>
import { useNormalForm } from '../ComponentOptions/useNormalForm'
import { page_style } from '../../store'
import { eventBUS } from '../../styleEngine'

// 监听样式变化，调用样式引擎
watch(page_style, () => {
	eventBUS.$emit("makeDom")
}, { deep: true })

const [NormalForm] = useNormalForm([
	{
		attrKey: 'color',
		key: 'backgroundColor',
		label: '背景颜色'
	},
	{
		attrKey: 'widthNumber',
		key: 'maxWidth',
	},
])
</script>

<style lang="scss" scoped></style>
