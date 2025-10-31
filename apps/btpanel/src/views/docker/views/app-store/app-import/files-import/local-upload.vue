<template>
	<div class="docker-app-import-files-local-upload">
		<div class="flex items-center mb-6">
			<el-button type="primary" @click="openFilesUpload">上传文件</el-button>
			<span class="flex items-center text-small text-gray-400 ml-4">
				<i class="svgtofont-el-warning-filled mr-1 mt-[2px]"></i>
				<span>支持 .zip, .tar.gz，.gz 格式</span>
			</span>
		</div>
		<div v-if="appList.length">
			<app-import-check-list :list="appList" />
		</div>
	</div>
</template>

<script setup lang="tsx">
import AppImportCheckList from '../app-import-check-list.vue'
import { useLocalUploadController } from './useController'

const { appList, onConfirm, openFilesUpload, getApphubFiles } = useLocalUploadController()

/**
 * @description: 文件上传
 */

onMounted(getApphubFiles)

defineExpose({ onConfirm })
</script>

<style scoped>
.docker-app-import-files-local-upload {
	width: 100%;
}
</style>
