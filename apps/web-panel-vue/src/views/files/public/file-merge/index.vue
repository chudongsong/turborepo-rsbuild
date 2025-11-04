<template>
	<div class="flex flex-col p-2rem lib-box" v-bt-loading="loading" v-bt-loading:title="'正在获取信息，请稍候...'">
		<el-form ref="quickFormRef" size="small" :model="quickForm" :rules="quickRules" :disabled="quickForm.disable" label-width="8rem" class="relative w-full" label-position="right" @submit.native.prevent>
			<el-form-item prop="type" label="文件名称">
				<div class="flex leading-[3.2rem]">{{ quickForm.file.name || '' }}</div>
			</el-form-item>
			<el-form-item prop="size" label="文件大小">
				<div class="flex leading-[3.2rem]">{{ getByteUnit(quickForm.file.size || 0) }}</div>
			</el-form-item>
			<el-form-item prop="path" label="存放目录">
				<bt-input-icon v-model="quickForm.path" width="26rem" icon="el-folder-opened" @icon-click="openFile" :placeholder="`请选择目录`" />
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { getByteUnit } from '@/utils/index'
import { storeToRefs } from 'pinia'
import FILES_MERGE_STORE from './store'

const store = FILES_MERGE_STORE()
const { quickFormRef, quickForm, quickRules, loading } = storeToRefs(store)
const { openFile, getFile } = store

onMounted(() => {
	getFile()
})
</script>

<style lang="css" scoped>
:deep(.el-form-item__label) {
	@apply w-[9rem] text-default;
}

.el-form-item {
	@apply mb-[1.4rem];
}

.check :deep(.el-form-item__content) {
	@apply leading-[1.4];
}

:deep(.el-form .el-form-item--small.el-form-item + .el-form-item) {
	margin-top: 1.5rem !important;
}
</style>
