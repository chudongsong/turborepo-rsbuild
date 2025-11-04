<template>
	<div class="flex items-center h-[28px]">
		<template v-if="p > 1">
			<span class="page-btn bt-link" @click="$emit('click', 1, $event)"> 首页 </span>
			<span class="page-btn bt-link" @click="$emit('click', p - 1, $event)"> 上一页 </span>
		</template>
		<span v-if="num >= limit" class="page-btn bt-link" @click="$emit('click', p + 1, $event)"> 下一页 </span>
		<span class="page-text">第 {{ p }} 页</span>
	</div>
</template>

<script setup lang="ts">
interface Props {
	limit: number
	p: number
	num: number
}

withDefaults(defineProps<Props>(), {
	limit: 10, // 每页条数
	p: 1, // 当前页
	num: 10, // 总条数
})

// 声明事件
defineEmits<{
	(e: 'click', value: number, event: Event): void
}>()
</script>

<style lang="css" scoped>
.page-btn,
.page-text {
	border: 1px solid var(--el-color-border-dark-tertiary);
	padding-left: 10px;
	padding-right: 10px;
	height: 28px;
	line-height: 28px;
	text-align: center;
}
</style>
