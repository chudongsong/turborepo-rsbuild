<template>
	<div>
		<div class="btn-group" v-show="type == 'btn'">
			<div class="btn" @click="upperLevel"><span class="mr-[.5rem] !text-small" :class="`svgtofont-el-top`"></span>上一级</div>
			<div class="btn" @click="refresh"><span class="mr-[.5rem] !text-small" :class="`svgtofont-el-refresh-right`"></span>刷新</div>
			<el-dropdown trigger="click" class="flex" :disabled="isNewMenuShow" @command="handleCommand">
				<div class="btn"><span class="mr-[.5rem] !text-small" :class="`svgtofont-el-plus`"></span>新建</div>
				<template #dropdown>
					<el-dropdown-menu>
						<el-dropdown-item command="dir">
							<i class="svgtofont-folder-open text-[#ffca28] !text-medium mr-4px"></i>
							新建文件夹
						</el-dropdown-item>
						<el-dropdown-item command="file">
							<i class="svgtofont-el-document !text-medium mr-4px"></i>
							新建文件
						</el-dropdown-item>
					</el-dropdown-menu>
				</template>
			</el-dropdown>
			<div class="btn" @click="type = 'search'"><span class="mr-[.5rem] !text-small" :class="`svgtofont-el-search`"></span>搜索</div>
		</div>
		<div class="search flex flex-col bg-[#565656] h-[auto] p-[.8rem]" v-show="type == 'search'">
			<div class="flex items-center justify-between mb-[1rem]">
				<span class="text-[#9e9e9e]">搜索目录文件</span>
				<div class="text-danger font-bold cursor-pointer flex items-center" @click="closeSearch"><span class="mr-[.5rem]" :class="`svgtofont-el-close-bold`"></span>关闭</div>
			</div>
			<bt-input-icon v-model="searchValue" class="w-full" placeholder="搜索" icon="el-search" @keyup.enter.native="searchFile" @icon-click="searchFile"> </bt-input-icon>
			<div class="flex items-center justify-between mt-[1rem]">
				<el-checkbox v-model="isCheck" :change="!isCheck" class="file-check !text-white">包含目录文件</el-checkbox>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { upperLevel, refresh, isNewMenuShow } from '@files/public/ace/sidebar/useMethods'
import { storeToRefs } from 'pinia'
import FILES_ACE_STORE from '../../store'

const store = FILES_ACE_STORE()
const { type, isCheck, searchValue } = storeToRefs(store)
const { searchFile, handleCommand, closeSearch, changeValue } = store

const emit = defineEmits(['update:changeType'])
watch(type, newValue => {
	changeValue(newValue)
	emit('update:changeType', newValue)
})
</script>

<style lang="css" scoped>
.btn-group {
	@apply h-[3rem] flex items-center justify-between top-0 left-0 right-0 bg-[#565656] w-full;
	transition: top 100ms;
}

.btn-group .btn {
	@apply h-[3rem] flex items-center justify-center px-[.8rem] text-small text-[#fff] whitespace-nowrap cursor-pointer hover:bg-[#2f2f2f];
}

:deep(.file-check label.el-checkbox) {
	@apply text-[#fff];
}
</style>
