<template>
	<div class="columns-tools" :class="{ active }">
		<div v-for="(item, index) in options" :key="`${index + 1}`" class="columns-item" :style="{ flex: `0 0 ${item}%` }">
			<div class="text">
				{{ getValue(item) }}
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
interface Props {
	active?: boolean
	options?: number[]
}

withDefaults(defineProps<Props>(), {
	active: false,
	options: () => [100],
})

const getValue = (val: number) => {
	return `${Math.floor(val)}%`
}
</script>

<style lang="scss" scoped>
.columns-tools {
	display: flex;
	width: 100%;
	height: 36px;
	background-color: var(--el-fill-color-light);
	border: 1px solid var(--el-color-border);
	border-radius: var(--el-border-radius-small);
	margin-bottom: 10px;
	cursor: pointer;

	&.active,
	&:hover {
		background-color: var(--el-fill-color-lighter);
		border-color: var(--el-color-border-darker);

		.columns-item {
			border-right-color: var(--el-color-border-darker);

			.text {
				visibility: visible;
			}
		}
	}

	.columns-item {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		border-right: 1px solid var(--el-color-border-darker);
		color: var(--el-color-text-primary);
		.text {
			visibility: hidden;
		}
		&:last-of-type {
			border-right: none;
		}
	}
}
</style>
