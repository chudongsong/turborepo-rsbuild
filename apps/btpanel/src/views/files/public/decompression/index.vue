<template>
	<div class="flex flex-col p-16px lib-box">
		<el-form ref="quickFormRef" size="small" :model="quickForm" :rules="quickRules" :disabled="disable" class="relative w-full p-[1.5rem]" label-position="right" @submit.native.prevent>
			<el-form-item prop="fileName" label="文件名">
				<bt-input v-model="quickForm.fileName" :disabled="true" width="26rem" />
			</el-form-item>
			<el-form-item prop="path" label="解压到">
				<bt-input-icon v-model="quickForm.path" width="26rem" icon="el-folder-opened" @icon-click="openFile" :placeholder="`请选择目录`" />
			</el-form-item>
			<el-form-item prop="password" label="解压密码">
				<bt-input v-model="quickForm.password" width="26rem" placeholder="无密码则留空" />
			</el-form-item>
			<el-form-item label="编码">
				<bt-select v-model="quickForm.coding" :options="codeOptions" class="w-[26rem]" @change="toggleCode"></bt-select>
			</el-form-item>
			<el-form-item prop="auth" label="解压目录权限">
				<bt-input v-model="quickForm.auth" width="26rem" />
			</el-form-item>
		</el-form>
		<bt-help :options="helpOptions" class="mt-[1.5rem] ml-[4rem]"></bt-help>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import FILES_DECOMPRESSION_STORE from './store'

const store = FILES_DECOMPRESSION_STORE()
const { quickFormRef, quickForm, quickRules, disable } = storeToRefs(store)
const { codeOptions, init, openFile, toggleCode } = store

const helpOptions = [
	{
		content: '若存在同名文件，解压后会覆盖原文件',
	},
]

onMounted(() => {
	init()
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
