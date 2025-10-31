<template>
	<el-collapse v-model="expandedNames">
		<slot></slot>
	</el-collapse>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
	defaultExpandedNames?: string[]
}>()

const expandedNames = ref(props.defaultExpandedNames || [])

// 监听 props 变化同步更新
watch(
	() => props.defaultExpandedNames,
	newVal => {
		if (newVal) {
			expandedNames.value = newVal
		}
	}
)
</script>

<style lang="scss" scoped>
.el-collapse {
	--el-collapse-header-height: auto;
	border-top: 1px solid var(--el-color-border);
	border-bottom: 1px solid var(--el-color-border);

	:deep(.el-collapse-item) {
		background-color: var(--el-fill-color-dark);

		.el-collapse-item__header {
			padding: 12px 16px;
			font-weight: bold;
			justify-content: space-between;
			flex-direction: row-reverse;

			&:hover {
				background-color: var(--el-fill-color-light);
			}
		}

		.el-collapse-item__content {
			padding: 16px;
		}
	}
}
</style>
