<template>
	<div class="node-clb module-ui">
		<bt-tabs type="card" v-model="activeTabs" :options="tabComponent" />
	</div>
</template>

<script setup lang="tsx">
import { useNodeClbStore } from './useStore'
import NodeClbHttp from './clb-http/index.vue'
import NodeClbTcpudp from './clb-tcpudp/index.vue'
const { activeTabs } = useNodeClbStore()

const tabComponent = ref([
	{
		label: 'HTTP',
		name: 'http',
		render: () => <NodeClbHttp></NodeClbHttp>,
	},
	{
		label: 'TCP/UDP',
		name: 'tcpudp',
		lazy: true,
		render: () => <NodeClbTcpudp></NodeClbTcpudp>,
	},
])
onUpdated(() => {
	console.log(activeTabs.value)
})
</script>

<style lang="scss" scoped>
.node-clb :deep(.bt-ico-ask) {
	border: none;
	color: var(--el-color-white) !important;
	background-color: var(--el-fill-color-darker) !important;
}
.node-clb :deep(.bt-ico-ask:hover) {
	background-color: var(--el-color-primary) !important;
}
</style>
