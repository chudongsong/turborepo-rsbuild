<template>
	<div class="editor-tools">
		<div>
			<span class="cursor-pointer" @click="onShowPreview">
				<bt-icon icon="el-view" :size="18"></bt-icon>
			</span>
		</div>
		<div>
			<div class="tools-view" v-if="false">
				<div class="view-item checked">
					<bt-icon name="drag-computer" :size="16"></bt-icon>
				</div>
				<div class="view-item">
					<bt-icon name="drag-app" :size="16"></bt-icon>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { useDialog } from '@/hooks/tools'

import EditorPreview from '../EditorPreview/index.vue'

const onShowPreview = () => {
	useDialog({
		title: '预览',
		area: 80,
		component: EditorPreview,
	})
}
</script>

<style lang="scss" scoped>
.editor-tools {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 40px;
	min-height: 40px;
	padding: 0 16px;
	border-bottom: 2px solid var(--el-color-border);
}

.tools-view {
	display: flex;
	align-items: center;
	gap: 4px;
	height: 28px;
	padding: 2px;
	border: 1px solid var(--el-color-border);
	border-radius: var(--el-border-radius-base);

	.view-item {
		@apply flex items-center transition-colors;
		height: 24px;
		padding: 0 4px;
		border-radius: var(--el-border-radius-small);
		cursor: pointer;

		&.checked {
			background-color: var(--el-fill-color-light);
			color: var(--el-base-supplement);
		}
	}
}
</style>
