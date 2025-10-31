<template>
	<div class="content-none">
		<slot></slot>
	</div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.content-none {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 100px;
	padding: 10px;
	background-color: var(--el-fill-color-light);
	border: 1px solid var(--el-color-border);
	border-radius: var(--el-border-radius-base);
	color: var(--el-color-text-tertiary);
	font-size: var(--el-font-size-base);
}
</style>
