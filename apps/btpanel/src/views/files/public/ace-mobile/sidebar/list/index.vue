<template>
	<div class="list !h-[70vh]" @contextmenu.prevent ref="treeContainerRef">
		<el-tree
			ref="treeRef"
			class="overflow-x-hidden truncate !w-[100%]"
			node-key="path"
			:props="treeProps"
			:load="loadNode"
			:data="newData"
			lazy
			:render-content="renderTree"
			@node-click="openFile"
			:default-expanded-keys="expandedKeys"
			@node-expand="handleExpandChange"
			@node-collapse="handleCollapseChange"
			:auto-expand-parent="false"
			:empty-text="isFirstLoad ? '' : '暂无数据'"></el-tree>
	</div>
</template>

<script setup lang="ts">
import { newData, expandedKeys, openFile, treeRef, treeContainerRef, isFirstLoad } from '@files/public/ace/sidebar/useMethods'
import FILES_ACE_MOBILE_STORE from '../../store'

const { treeProps, loadNode, renderTree, handleExpandChange, handleCollapseChange, initList } = FILES_ACE_MOBILE_STORE()

interface Props {
	fileItem?: any
}

onMounted(() => {
	initList()
})
</script>

<style lang="css" scoped>
.list {
	@apply bg-[#222] p-[.5rem] h-[90rem] overflow-y-auto text-[#ccc];
}
.el-tree {
	@apply bg-[#222];
}
:deep(.el-tree__empty-text) {
	@apply text-[3rem];
}
:deep(.el-tree-node__label) {
	@apply text-[4rem];
}
:deep(.el-tree-node) {
	@apply py-[1rem];
}
:deep(.el-tree-node__expand-icon) {
	@apply text-[4rem] w-[4rem];
}
:deep(.el-tree-node__loading-icon) {
	@apply text-[4rem];
}
:deep(.el-tree-node__children) {
	@apply pt-[1rem];
}
:deep(.el-tree-node__content) {
	@apply text-[#ccc] h-[5rem];
}
.flex.items-center.defaultFiles {
	@apply w-[85%] truncate inline-block h-[5rem];
}
:deep(.el-tree-node__content:hover) {
	@apply bg-[#272727];
}
:deep(.el-tree-node:focus > .el-tree-node__content) {
	@apply bg-[#2f2f2f] text-[#cca700];
}
:deep(.is-checked > .el-tree-node__content) {
	@apply bg-[#2f2f2f] text-[#cca700];
}
:deep(.icon-editor-left) {
	@apply text-[#ccc] cursor-pointer text-[4rem] mr-[8px];
}
</style>
<style scoped>
:deep [class^='ace-']:before {
	font-size: 4rem;
}
.list::-webkit-scrollbar {
	/*滚动条整体样式*/
	width: 9px;
	/*高宽分别对应横竖滚动条的尺寸*/
	height: 5px;
}

.list::-webkit-scrollbar-thumb {
	/*滚动条里面小方块*/
	box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
	background: rgba(78, 86, 102, 0.6);
	border-radius: 0;
}

.list::-webkit-scrollbar-track {
	/*滚动条里面轨道*/
	box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
	background: #333;
	border-radius: 0;
}
</style>
