<template>
	<div class="p-2rem app-import-container">
		<bt-tabs v-model="activeTabs">
			<el-tab-pane label="从GIT导入" name="git">
				<GitImport ref="gitImportRef" />
			</el-tab-pane>
			<el-tab-pane lazy label="从文件导入" name="files">
				<FilesImport ref="filesImportRef" />
			</el-tab-pane>
		</bt-tabs>
	</div>
</template>

<script setup lang="tsx">
import GitImport from './git-import.vue'
import FilesImport from './files-import/index.vue'
import { useDockerAppStoreLocal } from './useStore'
const { activeTabs, isSaveGitConfig } = useDockerAppStoreLocal()
const gitImportRef = ref()
const filesImportRef = ref()

defineExpose({
	onConfirm: () => {
		if (activeTabs.value === 'git') {
			return gitImportRef.value?.onConfirm?.()
		} else if (activeTabs.value === 'files') {
			return filesImportRef.value?.onConfirm?.()
		}
	}
})
onUnmounted(() => {
	isSaveGitConfig.value = false
})
</script>