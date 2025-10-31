<template>
	<div>
		<div class="btn-group" v-show="type == 'btn'">
			<div class="btn" @click="upperLevel"><span class="mr-[.5rem] !text-[3rem]" :class="`svgtofont-el-top`"></span>上一级</div>
			<div class="btn" @click="refresh"><span class="mr-[.5rem] !text-[3rem]" :class="`svgtofont-el-refresh-right`"></span>刷新</div>
			<!-- <el-dropdown trigger="click" class="flex" :disabled="isNewMenuShow">
				<div class="btn"><span class="mr-[.5rem]" :class="`el-icon-plus`"></span>新建</div>
				<el-dropdown-menu slot="dropdown">
					<el-dropdown-item icon="iconfont icon-file" @click.native="createFileData('dir')"
						>新建文件夹</el-dropdown-item
					>
					<el-dropdown-item icon="el-icon-document" @click.native="createFileData('file')"
						>新建文件</el-dropdown-item
					>
				</el-dropdown-menu>
			</el-dropdown> -->
			<div class="btn" @click="type = 'search'"><span class="mr-[.5rem] !text-[3rem] svgtofont-el-search"></span>搜索</div>
		</div>
		<div class="search flex flex-col bg-[#565656] h-[auto] p-[2rem]" v-show="type == 'search'">
			<div class="flex items-center justify-between mb-[2rem]">
				<span class="text-[#9e9e9e] text-[3rem]">搜索目录文件</span>
				<div class="text-danger font-bold cursor-pointer !text-[3rem] flex items-center" @click="closeSearch"><span class="mr-[.5rem] !text-[3rem]" :class="`svgtofont-el-close-bold`"></span>关闭</div>
			</div>
			<bt-input-icon v-model="searchValue" class="w-full searchInput h-6rem" placeholder="搜索" icon="el-search" @keyup.enter.native="searchFile" @icon-click="searchFile"> </bt-input-icon>

			<!-- <el-input v-model="searchValue" class="w-full searchInput" placeholder="搜索" iconType="search" @keyup.enter.native="searchFile">
				<el-button slot="append" type="primary" icon="el-search" @click="searchFile"></el-button>
			</el-input> -->
			<div class="flex items-center justify-between mt-[2rem]">
				<el-checkbox v-model="isCheck" :change="!isCheck" class="file-check !text-white">包含目录文件</el-checkbox>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { upperLevel, refresh } from '@files/public/ace/sidebar/useMethods'
import { storeToRefs } from 'pinia'
import FILES_ACE_MOBILE_STORE from '../../store'

const store = FILES_ACE_MOBILE_STORE()
const { type, isCheck, searchValue } = storeToRefs(store)
const { changeValue, searchFile, closeSearch } = store
</script>

<style lang="css" scoped>
.btn-group {
	@apply h-[8rem] flex items-center justify-between top-0 left-0 right-0 bg-[#565656];
	transition: top 100ms;
}

.btn-group .btn {
	@apply h-[8rem] flex items-center justify-center px-[4rem] text-[3rem] text-[#fff] whitespace-nowrap cursor-pointer hover:bg-[#2f2f2f];
}

:deep(.file-check label.el-checkbox) {
	@apply text-[#fff];
}

:deep(.file-check .el-checkbox__inner) {
	@apply w-[3rem] h-[3rem] mt-0;
}

:deep(.file-check .el-checkbox__inner):after {
	@apply w-[1rem] h-[2rem] top-0;
}

:deep(.file-check .el-checkbox__label) {
	@apply text-[3rem] ml-[1rem];
}

:deep(.searchInput .el-input__inner) {
	@apply h-[6rem] text-[3rem];
}

:deep(.searchInput .el-input-group__append) {
	@apply h-[6rem] text-[3rem];
}
:deep(.searchInput .el-input-group__append .el-button) {
	@apply h-[6rem] text-[3rem];
}
:deep(.searchInput .svgtofont-el-search) {
	@apply !text-[3rem];
}
</style>
