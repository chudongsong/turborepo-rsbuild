<template>
	<bt-tabs type="card" :options="tabComponent" v-model="activeTab" />
</template>

<script lang="tsx" setup>
import ConfigComponent from './ConfigComponent.vue'
import ConfigPage from './ConfigPage.vue'

const tabComponent = ref([
	{
		label: '内容配置',
		name: 'component',
		render: () => <ConfigComponent />,
	},
	{
		label: '页面配置',
		name: 'page',
		render: () => <ConfigPage />,
	}
])

const activeTab = ref('component')
</script>

<style lang="scss" scoped>
.el-tabs {
	height: 100%;

	:deep(.el-tabs__item) {
		padding: 0 55px !important;
	}

	:deep(.el-tabs__content) {
		overflow: auto;
	}
}
</style>
