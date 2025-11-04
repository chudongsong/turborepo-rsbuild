<template>
	<div class="list" @contextmenu.prevent ref="treeContainerRef">
		<el-tree
			ref="treeRef"
			class="tree-content"
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
		<EditorRightMenu ref="contextRef" class="w-[15rem]" :row="contextRow" @refreshData="updateData" @handleExpandChange="handleExpandChange"></EditorRightMenu>
	</div>
</template>

<script setup lang="tsx">
import EditorRightMenu from '@files/public/ace/sidebar/editor-right-menu/index.vue'
import { newData, contextRow, expandedKeys, openFile, updateData, treeRef, treeContainerRef, isFirstLoad } from '@files/public/ace/sidebar/useMethods'
import { storeToRefs } from 'pinia'
import FILES_ACE_STORE from '../../store'

const store = FILES_ACE_STORE()
const { contextRef } = storeToRefs(store)
const { treeProps, initSidebarList, loadNode, renderTree, handleExpandChange, handleCollapseChange } = store

onMounted(() => {
	initSidebarList()
})
</script>

<style lang="css" scoped>
.list {
	@apply bg-[#222] p-[.5rem] text-[#ccc] h-full overflow-hidden;
}

.tree-content {
	@apply bg-[#222] w-full h-auto;
}

:deep(.el-tree-node__content) {
	@apply text-[#ccc];
}

.flex.items-center.defaultFiles {
	@apply w-[85%] truncate inline-block;
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
	@apply text-[#ccc] cursor-pointer text-[16px] mr-[8px];
}
</style>
<style scoped>
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
