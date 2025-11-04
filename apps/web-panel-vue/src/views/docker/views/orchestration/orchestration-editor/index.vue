<template>
	<div style="height: calc(100% - 20px)">
		<div ref="editorRef" class="bg-[rgba(var(--el-color-white-rgb),var(--bt-main-content-opacity))] rounded-medium mt-[1.6rem] h-full">
			<div class="card-title">配置文件</div>
			<div class="px-[1.6rem] pb-[1.6rem] h-full">
				<!-- yaml -->
				<div class="text-base mt-[.8rem] mb-[1.2rem] !pt-0 flex items-center truncate">
					docker-compose文件内容
					<span class="ml-[1rem] path" :title="compose.path" @click="openPathEvent({ path: compose.path })">跳转目录</span>
				</div>
				<div style="height: calc(100% - 75px)">
					<bt-editor ref="yamlRef" :style="` height: calc(100% - ${mainHeight > 800 ? 336 : 244}px)`" class="compose-editor" v-model="yamlContent" :autoSave="false" :request="{}" :editorOption="config" @save="saveFile" />
					<!-- .env -->
					<div class="my-[1rem] text-base">.env</div>
					<bt-editor ref="envRef" :style="{ height: mainHeight > 800 ? `200px` : `100px` }" v-model="envContent" :autoSave="false" :request="{}" :editorOption="config" @save="saveFile" />
					<!-- 操作 -->
					<div class="flex items-center justify-end mt-[1.6rem]">
						<el-button type="primary" @click="saveFile">保存</el-button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useGlobalStore } from '@store/global'
import { getDockerStore } from '@docker/useStore'
import { yamlContent, envContent, getFile, saveFile, openPathEvent, config, unmountHandler } from './useController'

const { mainHeight } = useGlobalStore()

const {
	refs: { orchestrationData },
} = getDockerStore()

const yamlRef = ref<any>(null)
const envRef = ref<any>(null)
const editorRef = ref<any>(null)

const compose = computed(() => orchestrationData.value.currentCompose)

// 获取compose信息
watch(
	() => compose.value.path,
	() => {
		getFile(editorRef)
	}
)
// 获取compose信息
watch(
	() => orchestrationData.value.refreshItem,
	(val: boolean) => {
		getFile(editorRef)
	}
)

onUnmounted(() => {
	unmountHandler()
})
</script>

<style scoped>
.card-item {
	@apply rounded-medium border border-solid border-lighter p-[2rem] relative;
}
:deep(.el-dropdown .el-dropdown__caret-button) {
	@apply h-[30px];
	margin-left: -0.1rem !important;
}
.path {
	@apply text-small leading-[1.5] truncate cursor-pointer text-disabled;
}
.path:hover {
	@apply text-primaryDark;
}
.card-title {
	@apply w-full text-medium border-b border-light text-secondary p-[1.6rem] py-[1.2rem];
}
:deep(.compose-editor.ace-editor) {
	height: 100% !important;
}
</style>
