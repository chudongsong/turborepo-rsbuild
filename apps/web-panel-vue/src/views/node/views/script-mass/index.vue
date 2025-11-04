<template>
	<div class="module-ui">
			<bt-tabs type="card" v-model="activeTabs" :options="tabComponent" />
	</div>
</template>

<script setup lang="tsx">
import ScriptTable from './script-table/index.vue'
import MassTable from './mass-table/index.vue'
import ScriptDistribute from './script-distribute/index.vue'
import { useNodeScriptMassStore } from './useStore'

const { activeTabs } = useNodeScriptMassStore()

const tabComponent = ref([
	{
		label: '分发',
		name: 'script-distribute',
		lazy: true,
		render: () => <ScriptDistribute></ScriptDistribute>,
	},
	{
		label: '执行日志',
		name: 'mass-table',
		lazy: true,
		render: () => <MassTable></MassTable>,
	},
	{
		label: '脚本库',
		name: 'script-table',
		lazy: true,
		render: () => <ScriptTable></ScriptTable>,
	},
])

</script>

<style scoped>
</style>