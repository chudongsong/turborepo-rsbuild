<template>
	<div class="docker-import-server-upload-container">
		<FilesPath :initialPath="currentPath" @pathChange="handlePathChange" @refresh="refresh" class="mb-6" />
		<el-table :data="fileList" :row-key="row => row.name" :show-header="false" height="300" class="server-upload-table" v-bt-loading="loading">
			<el-table-column>
				<template #default="{ row }">
					<div class="flex items-center justify-between px-2 w-full">
						<span @click="row.isDir && enterDir(row)" class="flex items-center gap-2 cursor-pointer file-row files-list">
							<i :class="getIconClass(row)" />
							{{ row.name }}
						</span>
						<el-checkbox v-if="isSelectable(row)" :model-value="isChecked(row)" @change="toggleSelection(row)" />
					</div>
				</template>
			</el-table-column>
		</el-table>
		<div v-if="selectedFiles.length" class="mt-4 mb-4">
			<div class="mb-3">已选择的文件：</div>
			<el-tag v-for="file in selectedFiles" :key="file.name" closable @close="removeFile(file)" class="mr-2 mb-2">{{ file.name }}</el-tag>
		</div>
		<AppImportCheckList v-if="parsedAppList.length" :list="parsedAppList" v-model="selectedApps" />
	</div>
</template>

<script setup lang="tsx">
import '@styles/font/file-icon.css'
import FilesPath from '@/views/node/views/file-transfer/files-path.vue'
import AppImportCheckList from '../app-import-check-list.vue'
import { useServerUploadController } from './useController'

const { currentPath, fileList, selectedFiles, loading, parsedAppList, selectedApps, isSelectable, isChecked, toggleSelection, getIconClass, removeFile, handlePathChange, refresh, enterDir, onConfirm } = useServerUploadController()

defineExpose({ onConfirm })
</script>

<style lang="scss" scoped>
.server-upload-table {
	border-bottom: 1px solid var(--el-color-border-dark-tertiaryer) !important;
}
</style>
