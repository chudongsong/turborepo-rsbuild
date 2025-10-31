<template>
	<div class="p-20px flex flex-col">
		<div class="flex items-center">
			<i class="svgtofont-el-warning-filled !text-titleLarge text-warningDark mr-8px"></i>
			<div class="text-base leading-10 break-all">{{ isStart }}【{{ compData.data.path }}】{{ isFile }}保护后，该{{ isFile }}将{{ compData.temp_data?.lock ? '恢复' : '禁止' }}所有的操作权限，是否继续操作？</div>
		</div>

		<div class="flex flex-col ml-48px mt-20px tamper-file" v-if="compData.data.type !== 'dir'">
			<div class="flex items-center mb-8px">
				<el-checkbox class="!mr-8px" v-model="checkList.fileName"
					>{{ isStart }}当前文件 【 <span class="tamperFileLength" :title="compData.data.fileName">{{ compData.data.fileName }}</span
					>】的保护</el-checkbox
				>
			</div>
			<div class="flex items-center text-small" v-if="compData.data.fileName.indexOf('.') > -1">
				<el-checkbox class="!mr-8px" v-model="checkList.ext">{{ isStart }}后缀.{{ compData.data.fileName.indexOf('.') > -1 ? compData.data.fileName.split('.').pop() : '' }}的保护</el-checkbox>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import FILES_TAMPER_STORE from './store'

const store = FILES_TAMPER_STORE()
const { isStart, isFile, compData, checkList } = storeToRefs(store)
const { init, $reset } = store

onMounted(() => init())

onUnmounted($reset)
</script>

<style lang="css" scoped>
.tamperFileLength {
	@apply max-w-[14rem] overflow-hidden truncate whitespace-nowrap inline-block align-bottom;
}
:deep(.tamper-file .el-checkbox__label) {
	@apply leading-[18px];
}
</style>
