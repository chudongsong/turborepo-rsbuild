<template>
	<div class="viewer-empty">
		<div>这里没有内容，请从左侧拖动内容。</div>
	</div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.viewer-empty {
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	min-height: 80px;
	padding: 20px;
	background-color: rgba(var(--el-base-supplement-rgb), 0.1);
	border: 1px dashed rgba(var(--el-base-supplement-rgb), 0.5);
	border-radius: var(--el-border-radius-small);
	font-size: var(--el-font-size-base);
	color: var(--el-base-supplement);
}
</style>
