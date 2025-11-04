<template>
	<el-form ref="quickFormRef" :model="quickForm" :rules="quickRules" :disabled="disable" class="p-[2rem]" label-position="right" @submit.native.prevent>
		<el-form-item prop="type" label="压缩类型">
			<bt-select v-model="quickForm.type" :options="compressOptions" class="!w-[26rem]" @change="toggleType"></bt-select>
		</el-form-item>
		<el-form-item prop="path" label="压缩路径">
			<bt-input-icon v-model="quickForm.path" width="26rem" icon="icon-file_mode" @icon-click="openFile" :placeholder="`请选择目录`" />
		</el-form-item>
		<el-form-item label=" ">
			<el-checkbox v-model="quickForm.download">压缩并下载</el-checkbox>
		</el-form-item>
	</el-form>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import FILES_COMPRESS_STORE from './store'

const buttonText = inject<any>('buttonText') //     弹窗切换底部按钮

const store = FILES_COMPRESS_STORE()
const { quickFormRef, quickForm, quickRules, disable } = storeToRefs(store)
const { compressOptions, openFile, toggleType, init } = store

watch(
	() => quickForm.value.download,
	(val: boolean) => {
		// 改变确认按钮文字
		buttonText.value = val ? '压缩并下载' : '压缩'
	}
)

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
