<template>
	<div class="p-20px">
		<div class="flex justify-between">
			<div class="file-selector-head flex items-center">
				<i title="返回上一层" class="bt-open-icon svgtofont-el-back" @click="goBack"></i>
				<div ref="pathInput" class="file-selector-input overflow-hidden">
					<ul ref="pathUl" class="absolute h-[2.8rem] z-1 flex" v-if="isTagMode">
						<li v-for="(item, key) in showPathList" :key="key" @click="filePathJump(item.path)" class="flex h-full items-center px-4px">
							<span class="truncate max-w-[8rem]">{{ item.title }}</span>
							<i class="svgtofont-el-arrow-right ml-4px"></i>
						</li>
					</ul>
					<bt-input width="40rem" readonly @focus="temporaryFocus" @blur="temporaryBlur" @keyup.enter.native="temporaryEnter($event)" v-model="temporaryPath"></bt-input>
				</div>
				<i title="刷新" class="bt-open-icon svgtofont-el-refresh-right" @click="getDirList()"></i>
			</div>
		</div>
		<bt-table-group>
			<template #content>
				<bt-table ref="ossTable" :class="`oss-table oss-${compData.type}`" :column="tableColumns" :data="tableData" v-bt-loading="loading" @selection-change="handleSelectionChange" v-bt-loading:title="'正在加载文件列表，请稍后...'" empty-text="(空)" height="400" max-height="400" />
			</template>
			<template #popup> </template>
		</bt-table-group>
	</div>
</template>

<script lang="tsx" setup>
import { storeToRefs } from 'pinia'
import FILES_CLOUD_STORAGE_STORE from './store'

const store = FILES_CLOUD_STORAGE_STORE()
const { compData, ossTable, isTagMode, temporaryPath, showPathList, tableColumns, tableData, loading } = storeToRefs(store)
const { handleSelectionChange, temporaryBlur, temporaryFocus, temporaryEnter, goBack, filePathJump, watchTableData, getDirList, $reset } = store

onMounted(() => {
	getDirList()
})

onUnmounted(() => {
	$reset()
})
</script>

<style lang="css" scoped>
:deep(.bt-open-dir) {
	@apply flex items-center w-full;
}
:deep(.bt-open-dir > span) {
	@apply max-w-full cursor-pointer;
}
:deep(.bt-open-dir > span:hover) {
	@apply text-primary;
}
:deep(.bt-open-dir i.icon) {
	@apply w-[1.6rem] h-[1.6rem] inline-block mr-[.5rem] align-middle  ml-[2px];
}
:deep(.bt-open-dir.folder-open-icon i.icon) {
	background: url('/static/icons/folder-open.svg') no-repeat;
}
:deep(.bt-open-dir.file-text-icon i.icon) {
	background: url('/static/icons/file-text.svg') no-repeat;
}
.bt-open-icon {
	@apply cursor-pointer rounded-base px-[1.2rem] py-[.3rem] text-medium h-[3rem];
	border: 0.1rem solid var(--el-color-border-dark);
}
.bt-open-icon:hover {
	color: var(--el-color-primary);
	border-color: var(--el-color-success-light-5);
	background-color: var(--el-color-success-light-8);
}
.file-selector-head .bt-open-icon:first-child {
	border-top-right-radius: 0;
	border-bottom-right-radius: 0;
}
.file-selector-head .bt-open-icon:last-child {
	border-top-left-radius: 0;
	border-bottom-left-radius: 0;
}
:deep(.el-input__wrapper) {
	box-shadow: none;
}
:deep(.el-input__inner) {
	border: none;
	height: 2.8rem !important;
}
.file-selector-input {
	@apply h-3rem align-top inline-block border-t border-b border-dark;
}
.file-selector-input li:hover {
	background-color: var(--el-fill-color-light);
	cursor: pointer;
}
:deep(.el-table__header-wrapper .el-checkbox) {
	display: none;
}
</style>
