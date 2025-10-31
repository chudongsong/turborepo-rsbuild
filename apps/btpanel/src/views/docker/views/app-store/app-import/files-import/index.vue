<template>
	<div class="docker-app-import-files-container">
		<el-tabs v-model="activeTab" class="mb-4">
			<el-tab-pane label="上传文件" name="upload">
				<local-upload ref="localUploadRef" />
			</el-tab-pane>
			<el-tab-pane lazy label="服务器目录" name="server">
				<server-upload ref="serverUploadRef" />
			</el-tab-pane>
		</el-tabs>
		<bt-help :options="helpOptions" class="text-small text-gray-500" />
	</div>
</template>

<script setup lang="tsx">
import LocalUpload from './local-upload.vue'
import ServerUpload from './server-upload.vue'
import { useDockerAppStoreLocal } from '../useStore'

const { usingHelpLink } = useDockerAppStoreLocal()

const activeTab = ref('upload')
const localUploadRef = ref()
const serverUploadRef = ref()

// 帮助提示内容
const helpOptions = [
	{
		content: () => (
			<span>
				使用帮助：如果您在导入应用的过程中遇到问题，请点击{' '}
				<a class="bt-link text-blue-500" href={usingHelpLink.value} target="_blank">
					使用教程
				</a>
			</span>
		),
	},
	{
		content: () => <span class="text-red-500">安全提醒：请甄别导入应用的安全性，否则将存在安全风险！</span>,
	},
]

// 暴露 onConfirm 供父弹窗调用
function onConfirm() {
	if (activeTab.value === 'upload') {
		return localUploadRef.value?.onConfirm?.() ?? Promise.reject(false)
	} else {
		return serverUploadRef.value?.onConfirm?.() ?? Promise.reject(false)
	}
}

defineExpose({ onConfirm })
</script>

<style scoped>
.docker-app-import-files-container {
	min-height: 200px;
}
.docker-app-import-files-container :deep(.el-tabs__item.is-active::after) {
	display: none;
}
.docker-app-import-files-upload {
	width: 100%;
}
</style>
