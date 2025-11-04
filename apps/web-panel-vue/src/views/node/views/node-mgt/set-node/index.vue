<template>
	<div class="set-node-tabs">
			<BtTabs />
	</div>
</template>

<script lang="tsx" setup>
import { useTabs } from '@/hooks/tools'
import { NODE_STORE, useNodeStore } from '@node/useStore'

const { settingTabActive, isJump, setNodeInfo } = useNodeStore()
const { resetTab } = NODE_STORE()
const defaultActive = ref(settingTabActive.value || 'ssh') // 菜单默认展开项
const { BtTabs } = useTabs({
	type: 'left-bg-card',
	value: defaultActive,
	options: [
		{
			label: 'SSH',
			name: 'ssh',
			lazy: true,
			render: () => import('@node/views/node-mgt/set-node/ssh/index.vue'),
		},
	],
})

// 监听是否跳转
watch(
	() => isJump.value,
	val => {
		if (val) {
			defaultActive.value = settingTabActive.value
			resetTab()
		}
	}
)

onUnmounted(() => {
	setNodeInfo.value = {}
})
</script>

<style lang="scss" scoped>
.set-node-tabs :deep(.el-tabs__header) {
	height: auto!important;
}
</style>
