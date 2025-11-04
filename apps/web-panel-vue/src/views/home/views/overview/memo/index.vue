<template>
	<div class="flex flex-col p-[2rem] h-[100%]">
		<div class="text-secondary h-[2rem] leading-[2rem] mb-[1rem]">提示：Ctrl+S 保存</div>
		<div class="flex-1">
			<bt-editor ref="aceEditorRef" id="memo-file" class="h-48rem" :filePath="path" v-model="content" @save="store.saveFileEvent"></bt-editor>
		</div>
		<!-- 按钮 -->
		<div class="mt-[1rem] flex justify-end">
			<el-button type="primary" @click="store.saveFileEvent" class="h-[3.2rem] px-[12px]">保存</el-button>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { getAceConfig } from '@/public/index'
import HOME_OVERVIEW_STORE from '@home/views/overview/store'
import { storeToRefs } from 'pinia'

const store = HOME_OVERVIEW_STORE()
const { content, path } = storeToRefs(store)

/**
 * @description: 点击取消
 * @returns void
 */
const onCancel = () => {
	store.getOverviewData()
}

onMounted(() => store.getMemoData())

defineExpose({ onCancel })
</script>
