<template>
	<div class="p-[15px]">
		<CompatibleTabs :active="tabActive" />
		<BtCard v-bt-loading="true" v-bt-loading:title="loadingTitle" class="h-[450px]" />
	</div>
</template>

<script lang="tsx" setup>
import { useCompatibleStore } from '@compatible/useStore';
import CompatibleTabs from './compatible-tabs.vue';
const { tabActive, loadingTitle } = useCompatibleStore();
</script>

<style lang="css" scoped>
:deep(.el-dropdown .el-dropdown__caret-button){
	height: 30px
	margin-left: 10px !important
}
:deep(.el-button-group){
	display: inline-flex
	flex-wrap: nowrap
}
</style>
