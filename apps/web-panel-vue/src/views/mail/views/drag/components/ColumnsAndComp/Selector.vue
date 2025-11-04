<template>
	<div class="viewer-selector" :class="{ active }">
		<div class="viewer-drag">拖拽</div>
		<div class="viewer-action">
			<span class="text">Row</span>
			<div class="action-btn">复制</div>
			<div class="action-btn">删除</div>
		</div>
	</div>
	<slot></slot>
</template>

<script lang="ts" setup>
interface Props {
	active?: boolean
}

withDefaults(defineProps<Props>(), {
	active: false,
})
</script>

<style lang="scss" scoped>
.viewer-selector {
	--primary-color: var(--el-base-supplement);
	&.active {
		--primary-color: var(--el-base-supplement-dark);
	}
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	width: 100%;
	&::after {
		content: ' ';
		opacity: 0;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: auto;
		z-index: 100;
	}
	.add-btn {
		left: 50%;
		width: 100px;
		height: 22px;
		line-height: 1;
		margin-left: -50px;
		color: var(--el-color-white);
		font-size: var(--el-font-size-large);
		cursor: pointer;
		&.top {
			top: -20px;
		}
		&.bottom {
			bottom: -20px;
		}
	}
	.viewer-action {
		right: 0;
		bottom: -30px;
		height: 30px;
		padding: 0px 4px;
		color: var(--el-color-white);
		z-index: 102;
		.text {
			padding: 0 4px;
		}
		.action-btn {
			padding: 0 4px;
			cursor: pointer;
		}
	}
	.viewer-drag {
		top: 50%;
		right: 0;
		width: 42px;
		height: 30px;
		margin-top: -15px;
		border-radius: var(--el-border-radius-base) 0 0 var(--el-border-radius-base);
		color: var(--el-color-white);
		z-index: 102;
		cursor: grab;
	}
	.viewer-action,
	.viewer-drag,
	.add-btn {
		visibility: hidden;
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--primary-color);
	}
	&:hover {
		&:not(.active)::after {
			background-color: rgba(var(--el-base-supplement-rgb), 0.2);
		}
	}
	&:hover,
	&.active {
		&::after {
			opacity: 1;
			border: 2px solid var(--primary-color);
		}
		.viewer-action,
		.viewer-drag,
		.add-btn {
			visibility: visible;
		}
	}
}
</style>
